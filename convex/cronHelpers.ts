import { internalMutation, internalAction, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id, Doc } from "./_generated/dataModel";

/**
 * Internal helper functions for cron jobs.
 * These are called by the scheduled crons to process all users.
 */

// Detect subscriptions for all users
export const detectSubscriptionsForAllUsers = internalMutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    
    let processed = 0;
    let detected = 0;
    
    for (const user of users) {
      // Run subscription detection for each user
      const now = Date.now();
      const threeMonthsAgo = now - 90 * 24 * 60 * 60 * 1000;
      
      const allTxs = await ctx.db
        .query("transactions")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .collect();
      
      const transactions = allTxs.filter(t => t.date >= threeMonthsAgo);
      
      // Group by merchant name
      const merchantGroups = new Map<string, typeof transactions>();
      
      for (const tx of transactions) {
        if (tx.type !== "expense") continue;
        
        const key = tx.merchantName.toLowerCase();
        const group = merchantGroups.get(key) ?? [];
        group.push(tx);
        merchantGroups.set(key, group);
      }
      
      // Detect recurring patterns
      for (const [, txs] of merchantGroups) {
        if (txs.length < 2) continue;
        
        txs.sort((a, b) => a.date - b.date);
        
        const amounts = txs.map(t => t.amount);
        const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
        // Skip zero-amount transactions (e.g., free trials) to avoid division by zero
        if (avgAmount === 0) continue;
        const isConsistentAmount = amounts.every(
          a => Math.abs(a - avgAmount) / avgAmount < 0.1
        );
        
        if (!isConsistentAmount) continue;
        
        const intervals: number[] = [];
        for (let i = 1; i < txs.length; i++) {
          const daysBetween = (txs[i].date - txs[i - 1].date) / (24 * 60 * 60 * 1000);
          intervals.push(daysBetween);
        }
        
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        
        let frequency: "weekly" | "monthly" | "quarterly" | "yearly" | null = null;
        
        if (avgInterval >= 5 && avgInterval <= 10) frequency = "weekly";
        else if (avgInterval >= 25 && avgInterval <= 35) frequency = "monthly";
        else if (avgInterval >= 80 && avgInterval <= 100) frequency = "quarterly";
        else if (avgInterval >= 350 && avgInterval <= 380) frequency = "yearly";
        
        if (!frequency) continue;
        
        const intervalVariance = intervals.reduce(
          (sum, i) => sum + Math.abs(i - avgInterval),
          0
        ) / intervals.length;
        
        if (intervalVariance > avgInterval * 0.3) continue;
        
        // Check if subscription already exists
        const existing = await ctx.db
          .query("subscriptions")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .collect();
        
        const exists = existing.some(
          s => s.merchantName.toLowerCase() === txs[0].merchantName.toLowerCase()
        );
        
        if (exists) continue;
        
        // Create new subscription
        const lastTx = txs[txs.length - 1];
        const msPerFrequency = {
          weekly: 7 * 24 * 60 * 60 * 1000,
          monthly: 30 * 24 * 60 * 60 * 1000,
          quarterly: 90 * 24 * 60 * 60 * 1000,
          yearly: 365 * 24 * 60 * 60 * 1000,
        };
        
        await ctx.db.insert("subscriptions", {
          userId: user._id,
          merchantId: txs[0].merchantId,
          merchantName: txs[0].merchantName,
          categoryId: txs[0].categoryId,
          amount: Math.round(avgAmount * 100) / 100,
          frequency,
          status: "pending",
          lastChargeDate: lastTx.date,
          nextExpectedDate: lastTx.date + msPerFrequency[frequency],
          transactionIds: txs.map(t => t._id),
          createdAt: now,
          updatedAt: now,
        });
        
        detected++;
      }
      
      processed++;
    }
    
    return { usersProcessed: processed, subscriptionsDetected: detected };
  },
});

// Detect spending spikes for all users
export const detectSpikesForAllUsers = internalMutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    
    let processed = 0;
    let insightsCreated = 0;
    
    for (const user of users) {
      const now = Date.now();
      const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
      const fourteenDaysAgo = now - 14 * 24 * 60 * 60 * 1000;
      
      const allTxs = await ctx.db
        .query("transactions")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .collect();
      
      const recentTxs = allTxs.filter(t => t.date >= sevenDaysAgo);
      const previousTxs = allTxs.filter(t => t.date >= fourteenDaysAgo && t.date < sevenDaysAgo);
      
      // Group by category
      const recentByCategory = new Map<string, number>();
      const previousByCategory = new Map<string, number>();
      
      for (const tx of recentTxs.filter(t => t.type === "expense")) {
        const key = tx.categoryId?.toString() ?? "uncategorized";
        recentByCategory.set(key, (recentByCategory.get(key) ?? 0) + tx.amount);
      }
      
      for (const tx of previousTxs.filter(t => t.type === "expense")) {
        const key = tx.categoryId?.toString() ?? "uncategorized";
        previousByCategory.set(key, (previousByCategory.get(key) ?? 0) + tx.amount);
      }
      
      // Detect spikes (>50% increase and >$50)
      for (const [categoryId, recentAmount] of recentByCategory) {
        const previousAmount = previousByCategory.get(categoryId) ?? 0;
        
        if (previousAmount > 0) {
          const increase = ((recentAmount - previousAmount) / previousAmount) * 100;
          
          if (increase > 50 && recentAmount > 50) {
            // Check if we already have a recent spike insight for THIS SPECIFIC category
            const recentSpikeInsights = await ctx.db
              .query("insights")
              .withIndex("by_user_type", (q) => 
                q.eq("userId", user._id).eq("type", "spending_spike")
              )
              .collect();
            
            // Filter to find insights for this specific category from the last 7 days
            const existingInsightForCategory = recentSpikeInsights.find(
              insight => 
                insight.createdAt > sevenDaysAgo &&
                insight.metadata.categoryId === (categoryId !== "uncategorized" ? categoryId : undefined)
            );
            
            // Don't create if we already have one for THIS category from the last 7 days
            if (existingInsightForCategory) {
              continue;
            }
            
            let categoryName = "Category";
            if (categoryId !== "uncategorized") {
              const cat = await ctx.db.get(categoryId as Id<"categories">);
              if (cat) categoryName = cat.name;
            }
            
            await ctx.db.insert("insights", {
              userId: user._id,
              type: "spending_spike",
              title: `${categoryName} Spending Up`,
              message: `Your ${categoryName.toLowerCase()} spending is up ${increase.toFixed(0)}% this week ($${recentAmount.toFixed(2)} vs $${previousAmount.toFixed(2)} last week).`,
              severity: increase > 100 ? "alert" : "warning",
              metadata: {
                categoryId: categoryId !== "uncategorized" ? categoryId as any : undefined,
                amount: recentAmount,
                percentageChange: increase,
                comparisonValue: previousAmount,
                period: "last_7_days",
              },
              isRead: false,
              isDismissed: false,
              createdAt: now,
            });
            
            insightsCreated++;
          }
        }
      }
      
      processed++;
    }
    
    return { usersProcessed: processed, insightsCreated };
  },
});

// Generate weekly insights for all users
export const generateWeeklyInsightsForAllUsers = internalAction({
  args: {},
  handler: async (ctx) => {
    // Get all users
    const users = await ctx.runQuery(internal.cronHelpers.getAllUsers, {});
    
    let processed = 0;
    let insightsCreated = 0;
    
    for (const user of users) {
      try {
        // Generate weekly summary insight
        await ctx.runAction(internal.insights.generate, {
          userId: user._id,
          type: "weekly_summary",
        });
        
        insightsCreated++;
      } catch (error) {
        console.error(`Failed to generate insight for user ${user._id}:`, error);
      }
      
      processed++;
    }
    
    return { usersProcessed: processed, insightsCreated };
  },
});

// Helper query to get all users
export const getAllUsers = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

// Detect behavioral triggers for all users
export const detectBehavioralTriggersForAllUsers = internalMutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    
    let processed = 0;
    let totalDetected = 0;
    
    for (const user of users) {
      const now = Date.now();
      const ninetyDaysAgo = now - 90 * 24 * 60 * 60 * 1000;
      
      const transactions = await ctx.db
        .query("transactions")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .collect();
      
      const recentTxs = transactions
        .filter(t => t.date >= ninetyDaysAgo && t.type === "expense");
      
      if (recentTxs.length < 20) continue;
      
      // Import and run detection functions inline
      // Late-night detection
      const lateNightHours = [22, 23, 0, 1, 2];
      const lateNightTxs = recentTxs.filter(tx => {
        const hour = new Date(tx.date).getHours();
        return lateNightHours.includes(hour);
      });
      
      if (lateNightTxs.length >= 10) {
        const lateNightPercentage = (lateNightTxs.length / recentTxs.length) * 100;
        if (lateNightPercentage >= 15) {
          const totalLateNight = lateNightTxs.reduce((sum, t) => sum + t.amount, 0);
          
          const existing = await ctx.db
            .query("behavioralTriggers")
            .withIndex("by_user_type", (q) => 
              q.eq("userId", user._id).eq("triggerType", "time_of_day")
            )
            .first();
          
          if (!existing) {
            await ctx.db.insert("behavioralTriggers", {
              userId: user._id,
              triggerType: "time_of_day",
              pattern: { hourStart: 22, hourEnd: 2 },
              occurrences: lateNightTxs.length,
              totalAmount: totalLateNight,
              avgPerOccurrence: totalLateNight / lateNightTxs.length,
              lastOccurrence: lateNightTxs[lateNightTxs.length - 1]?.date ?? now,
              severity: lateNightPercentage > 30 ? "high" : lateNightPercentage > 20 ? "medium" : "low",
              isActive: true,
              isAcknowledged: false,
              nudgeEnabled: false,
              createdAt: now,
              updatedAt: now,
            });
            totalDetected++;
          }
        }
      }
      
      processed++;
    }
    
    return { usersProcessed: processed, triggersDetected: totalDetected };
  },
});

// Clean up old dismissed insights
export const cleanupOldInsights = internalMutation({
  args: {},
  handler: async (ctx) => {
    const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;
    
    // Get old dismissed insights
    const oldInsights = await ctx.db
      .query("insights")
      .withIndex("by_created", (q) => q.lt("createdAt", ninetyDaysAgo))
      .collect();
    
    const toDelete = oldInsights.filter(i => i.isDismissed);
    
    for (const insight of toDelete) {
      await ctx.db.delete(insight._id);
    }
    
    return { deleted: toDelete.length };
  },
});

