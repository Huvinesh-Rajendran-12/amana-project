import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

/**
 * Subscriptions module - Detect and manage recurring payments.
 * Helps users identify wasteful subscriptions and optimize spending.
 */

// List all subscriptions for a user
export const list = query({
  args: {
    userId: v.id("users"),
    status: v.optional(
      v.union(
        v.literal("active"),
        v.literal("cancelled"),
        v.literal("ignored"),
        v.literal("pending")
      )
    ),
  },
  handler: async (ctx, args) => {
    let subscriptions;
    
    if (args.status) {
      subscriptions = await ctx.db
        .query("subscriptions")
        .withIndex("by_user_status", (q) => 
          q.eq("userId", args.userId).eq("status", args.status!)
        )
        .collect();
    } else {
      subscriptions = await ctx.db
        .query("subscriptions")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .collect();
    }
    
    // Enrich with category and merchant info
    const enriched = await Promise.all(
      subscriptions.map(async (sub) => {
        const category = sub.categoryId ? await ctx.db.get(sub.categoryId) : null;
        const merchant = sub.merchantId ? await ctx.db.get(sub.merchantId) : null;
        
        // Calculate monthly cost
        let monthlyCost = sub.amount;
        if (sub.frequency === "weekly") monthlyCost = sub.amount * 4.33;
        else if (sub.frequency === "quarterly") monthlyCost = sub.amount / 3;
        else if (sub.frequency === "yearly") monthlyCost = sub.amount / 12;
        
        return {
          ...sub,
          categoryName: category?.name,
          categoryIcon: category?.icon,
          merchantLogo: merchant?.logo,
          monthlyCost: Math.round(monthlyCost * 100) / 100,
        };
      })
    );
    
    // Sort by monthly cost descending
    enriched.sort((a, b) => b.monthlyCost - a.monthlyCost);
    
    return enriched;
  },
});

// Get subscription totals
export const getSummary = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const subscriptions = await ctx.db
      .query("subscriptions")
      .withIndex("by_user_status", (q) => 
        q.eq("userId", args.userId).eq("status", "active")
      )
      .collect();
    
    let monthlyTotal = 0;
    let yearlyTotal = 0;
    
    for (const sub of subscriptions) {
      let monthly = sub.amount;
      if (sub.frequency === "weekly") monthly = sub.amount * 4.33;
      else if (sub.frequency === "quarterly") monthly = sub.amount / 3;
      else if (sub.frequency === "yearly") monthly = sub.amount / 12;
      
      monthlyTotal += monthly;
      yearlyTotal += monthly * 12;
    }
    
    return {
      activeCount: subscriptions.length,
      monthlyTotal: Math.round(monthlyTotal * 100) / 100,
      yearlyTotal: Math.round(yearlyTotal * 100) / 100,
    };
  },
});

// Detect subscriptions from transaction history
export const detect = internalMutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const threeMonthsAgo = now - 90 * 24 * 60 * 60 * 1000;
    
    // Get recent transactions
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user_date", (q) => 
        q.eq("userId", args.userId).gte("date", threeMonthsAgo)
      )
      .collect();
    
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
    const detected: {
      merchantName: string;
      merchantId?: Id<"merchants">;
      categoryId?: Id<"categories">;
      amount: number;
      frequency: "weekly" | "monthly" | "quarterly" | "yearly";
      transactions: typeof transactions;
    }[] = [];
    
    for (const [merchantKey, txs] of merchantGroups) {
      if (txs.length < 2) continue;
      
      // Sort by date
      txs.sort((a, b) => a.date - b.date);
      
      // Check for consistent amounts (within 10% variance)
      const amounts = txs.map(t => t.amount);
      const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      // Skip zero-amount transactions (e.g., free trials) to avoid division by zero
      if (avgAmount === 0) continue;
      const isConsistentAmount = amounts.every(
        a => Math.abs(a - avgAmount) / avgAmount < 0.1
      );
      
      if (!isConsistentAmount) continue;
      
      // Calculate average days between transactions
      const intervals: number[] = [];
      for (let i = 1; i < txs.length; i++) {
        const daysBetween = (txs[i].date - txs[i - 1].date) / (24 * 60 * 60 * 1000);
        intervals.push(daysBetween);
      }
      
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      
      // Determine frequency
      let frequency: "weekly" | "monthly" | "quarterly" | "yearly" | null = null;
      
      if (avgInterval >= 5 && avgInterval <= 10) frequency = "weekly";
      else if (avgInterval >= 25 && avgInterval <= 35) frequency = "monthly";
      else if (avgInterval >= 80 && avgInterval <= 100) frequency = "quarterly";
      else if (avgInterval >= 350 && avgInterval <= 380) frequency = "yearly";
      
      if (!frequency) continue;
      
      // Check if variance in intervals is reasonable
      const intervalVariance = intervals.reduce(
        (sum, i) => sum + Math.abs(i - avgInterval),
        0
      ) / intervals.length;
      
      if (intervalVariance > avgInterval * 0.3) continue; // Too inconsistent
      
      detected.push({
        merchantName: txs[0].merchantName,
        merchantId: txs[0].merchantId,
        categoryId: txs[0].categoryId,
        amount: Math.round(avgAmount * 100) / 100,
        frequency,
        transactions: txs,
      });
    }
    
    // Get existing subscriptions to avoid duplicates
    const existingSubs = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    
    const existingMerchants = new Set(
      existingSubs.map(s => s.merchantName.toLowerCase())
    );
    
    // Create new subscription records
    let created = 0;
    for (const sub of detected) {
      if (existingMerchants.has(sub.merchantName.toLowerCase())) continue;
      
      const lastTx = sub.transactions[sub.transactions.length - 1];
      
      // Calculate next expected date
      const msPerFrequency = {
        weekly: 7 * 24 * 60 * 60 * 1000,
        monthly: 30 * 24 * 60 * 60 * 1000,
        quarterly: 90 * 24 * 60 * 60 * 1000,
        yearly: 365 * 24 * 60 * 60 * 1000,
      };
      
      const nextExpected = lastTx.date + msPerFrequency[sub.frequency];
      
      await ctx.db.insert("subscriptions", {
        userId: args.userId,
        merchantId: sub.merchantId,
        merchantName: sub.merchantName,
        categoryId: sub.categoryId,
        amount: sub.amount,
        frequency: sub.frequency,
        status: "pending", // Needs user confirmation
        lastChargeDate: lastTx.date,
        nextExpectedDate: nextExpected,
        transactionIds: sub.transactions.map(t => t._id),
        createdAt: now,
        updatedAt: now,
      });
      
      created++;
    }
    
    return { detected: detected.length, created };
  },
});

// Manually trigger subscription detection for a user
export const runDetection = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Call the internal detection function
    const now = Date.now();
    const threeMonthsAgo = now - 90 * 24 * 60 * 60 * 1000;
    
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user_date", (q) => 
        q.eq("userId", args.userId).gte("date", threeMonthsAgo)
      )
      .collect();
    
    // Group by merchant name
    const merchantGroups = new Map<string, typeof transactions>();
    
    for (const tx of transactions) {
      if (tx.type !== "expense") continue;
      
      const key = tx.merchantName.toLowerCase();
      const group = merchantGroups.get(key) ?? [];
      group.push(tx);
      merchantGroups.set(key, group);
    }
    
    // Detect recurring patterns (same logic as internal mutation)
    const detected: {
      merchantName: string;
      merchantId?: Id<"merchants">;
      categoryId?: Id<"categories">;
      amount: number;
      frequency: "weekly" | "monthly" | "quarterly" | "yearly";
      transactions: typeof transactions;
    }[] = [];
    
    for (const [, txs] of merchantGroups) {
      if (txs.length < 2) continue;
      
      txs.sort((a, b) => a.date - b.date);
      
      const amounts = txs.map(t => t.amount);
      const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
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
      
      detected.push({
        merchantName: txs[0].merchantName,
        merchantId: txs[0].merchantId,
        categoryId: txs[0].categoryId,
        amount: Math.round(avgAmount * 100) / 100,
        frequency,
        transactions: txs,
      });
    }
    
    const existingSubs = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    
    const existingMerchants = new Set(
      existingSubs.map(s => s.merchantName.toLowerCase())
    );
    
    let created = 0;
    for (const sub of detected) {
      if (existingMerchants.has(sub.merchantName.toLowerCase())) continue;
      
      const lastTx = sub.transactions[sub.transactions.length - 1];
      
      const msPerFrequency = {
        weekly: 7 * 24 * 60 * 60 * 1000,
        monthly: 30 * 24 * 60 * 60 * 1000,
        quarterly: 90 * 24 * 60 * 60 * 1000,
        yearly: 365 * 24 * 60 * 60 * 1000,
      };
      
      const nextExpected = lastTx.date + msPerFrequency[sub.frequency];
      
      await ctx.db.insert("subscriptions", {
        userId: args.userId,
        merchantId: sub.merchantId,
        merchantName: sub.merchantName,
        categoryId: sub.categoryId,
        amount: sub.amount,
        frequency: sub.frequency,
        status: "pending",
        lastChargeDate: lastTx.date,
        nextExpectedDate: nextExpected,
        transactionIds: sub.transactions.map(t => t._id),
        createdAt: now,
        updatedAt: now,
      });
      
      created++;
    }
    
    return { detected: detected.length, created };
  },
});

// Update subscription status
export const updateStatus = mutation({
  args: {
    subscriptionId: v.id("subscriptions"),
    status: v.union(
      v.literal("active"),
      v.literal("cancelled"),
      v.literal("ignored")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.subscriptionId, {
      status: args.status,
      updatedAt: Date.now(),
    });
    
    return { success: true };
  },
});

// Update subscription usage score (for optimization suggestions)
export const updateUsageScore = mutation({
  args: {
    subscriptionId: v.id("subscriptions"),
    usageScore: v.number(), // 0-100
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.subscriptionId, {
      usageScore: Math.max(0, Math.min(100, args.usageScore)),
      lastUsageCheck: Date.now(),
      updatedAt: Date.now(),
    });
    
    return { success: true };
  },
});

// Get optimization opportunities (low-usage subscriptions)
export const getOptimizationOpportunities = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const subscriptions = await ctx.db
      .query("subscriptions")
      .withIndex("by_user_status", (q) => 
        q.eq("userId", args.userId).eq("status", "active")
      )
      .collect();
    
    // Filter to low usage (score < 30) or no recent usage check
    const opportunities = subscriptions.filter(sub => {
      if (sub.usageScore !== undefined && sub.usageScore < 30) return true;
      
      // If no usage check in 30 days, flag for review
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      if (!sub.lastUsageCheck || sub.lastUsageCheck < thirtyDaysAgo) return true;
      
      return false;
    });
    
    // Enrich with savings info
    const enriched = await Promise.all(
      opportunities.map(async (sub) => {
        const merchant = sub.merchantId ? await ctx.db.get(sub.merchantId) : null;
        
        let monthlyCost = sub.amount;
        if (sub.frequency === "weekly") monthlyCost = sub.amount * 4.33;
        else if (sub.frequency === "quarterly") monthlyCost = sub.amount / 3;
        else if (sub.frequency === "yearly") monthlyCost = sub.amount / 12;
        
        const yearlySavings = monthlyCost * 12;
        
        return {
          ...sub,
          merchantLogo: merchant?.logo,
          monthlyCost: Math.round(monthlyCost * 100) / 100,
          yearlySavings: Math.round(yearlySavings * 100) / 100,
          reason: sub.usageScore !== undefined && sub.usageScore < 30
            ? `Low usage (${sub.usageScore}% utilized)`
            : "Usage not tracked - review recommended",
        };
      })
    );
    
    // Sort by yearly savings descending
    enriched.sort((a, b) => b.yearlySavings - a.yearlySavings);
    
    // Calculate total potential savings
    const totalMonthlySavings = enriched.reduce((sum, s) => sum + s.monthlyCost, 0);
    const totalYearlySavings = enriched.reduce((sum, s) => sum + s.yearlySavings, 0);
    
    return {
      opportunities: enriched,
      totalMonthlySavings: Math.round(totalMonthlySavings * 100) / 100,
      totalYearlySavings: Math.round(totalYearlySavings * 100) / 100,
    };
  },
});

// Get upcoming subscription charges
export const getUpcoming = query({
  args: {
    userId: v.id("users"),
    days: v.optional(v.number()), // Default 30 days
  },
  handler: async (ctx, args) => {
    const days = args.days ?? 30;
    const now = Date.now();
    const future = now + days * 24 * 60 * 60 * 1000;
    
    const subscriptions = await ctx.db
      .query("subscriptions")
      .withIndex("by_user_status", (q) => 
        q.eq("userId", args.userId).eq("status", "active")
      )
      .collect();
    
    // Filter to upcoming charges
    const upcoming = subscriptions
      .filter(sub => sub.nextExpectedDate >= now && sub.nextExpectedDate <= future)
      .map(sub => ({
        ...sub,
        daysUntilCharge: Math.ceil((sub.nextExpectedDate - now) / (24 * 60 * 60 * 1000)),
      }));
    
    // Sort by next charge date
    upcoming.sort((a, b) => a.nextExpectedDate - b.nextExpectedDate);
    
    // Calculate total upcoming charges
    const totalUpcoming = upcoming.reduce((sum, s) => sum + s.amount, 0);
    
    return {
      subscriptions: upcoming,
      totalUpcoming: Math.round(totalUpcoming * 100) / 100,
      count: upcoming.length,
    };
  },
});

// Delete a subscription
export const remove = mutation({
  args: {
    subscriptionId: v.id("subscriptions"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.subscriptionId);
    return { success: true };
  },
});

// Manually add a subscription
export const create = mutation({
  args: {
    userId: v.id("users"),
    merchantName: v.string(),
    amount: v.number(),
    frequency: v.union(
      v.literal("weekly"),
      v.literal("monthly"),
      v.literal("quarterly"),
      v.literal("yearly")
    ),
    categoryId: v.optional(v.id("categories")),
    nextExpectedDate: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Try to find merchant
    const normalizedName = args.merchantName.toLowerCase().replace(/[^a-z0-9]/g, "");
    const merchant = await ctx.db
      .query("merchants")
      .withIndex("by_normalized_name", (q) => q.eq("normalizedName", normalizedName))
      .first();
    
    const subscriptionId = await ctx.db.insert("subscriptions", {
      userId: args.userId,
      merchantId: merchant?._id,
      merchantName: args.merchantName,
      categoryId: args.categoryId ?? merchant?.defaultCategoryId,
      amount: args.amount,
      frequency: args.frequency,
      status: "active",
      lastChargeDate: now,
      nextExpectedDate: args.nextExpectedDate,
      transactionIds: [],
      createdAt: now,
      updatedAt: now,
    });
    
    return subscriptionId;
  },
});

