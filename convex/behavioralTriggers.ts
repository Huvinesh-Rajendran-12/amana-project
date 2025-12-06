import { v } from "convex/values";
import { query, mutation, internalMutation, MutationCtx, QueryCtx } from "./_generated/server";
import { Id, Doc } from "./_generated/dataModel";

/**
 * Behavioral Triggers Module
 * 
 * Detects spending patterns like:
 * - Late-night spending (10pm-2am purchases)
 * - Weekend splurges (Fri-Sun spending spikes)
 * - Payday effect (spending spike after income)
 * - Stress spending (multiple purchases in short time)
 * - Category binges (repeated spending in same category)
 * - Merchant habits (too frequent visits)
 */

// Trigger type definitions for analysis
const TRIGGER_CONFIGS = {
  time_of_day: {
    name: "Late Night Spending",
    description: "You tend to spend more between {hourStart}:00 and {hourEnd}:00",
    icon: "🌙",
  },
  day_of_week: {
    name: "Weekend Splurge",
    description: "Your spending spikes on {days}",
    icon: "📅",
  },
  payday_effect: {
    name: "Payday Splurge",
    description: "You spend {percentage}% of monthly budget in first {days} days after payday",
    icon: "💸",
  },
  stress_spending: {
    name: "Stress Spending",
    description: "Multiple purchases in short bursts detected",
    icon: "😰",
  },
  category_binge: {
    name: "Category Binge",
    description: "Repeated {category} spending detected",
    icon: "🔄",
  },
  merchant_habit: {
    name: "Merchant Habit",
    description: "You visit {merchant} {frequency}x per week",
    icon: "🏪",
  },
  end_of_month: {
    name: "End of Month Pattern",
    description: "Your spending changes significantly at month end",
    icon: "📊",
  },
  emotional_pattern: {
    name: "Emotional Spending",
    description: "Spending pattern suggests emotional triggers",
    icon: "💭",
  },
};

// Get all triggers for a user
export const list = query({
  args: {
    userId: v.id("users"),
    activeOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let triggers;
    
    if (args.activeOnly) {
      triggers = await ctx.db
        .query("behavioralTriggers")
        .withIndex("by_user_active", (q) => 
          q.eq("userId", args.userId).eq("isActive", true)
        )
        .collect();
    } else {
      triggers = await ctx.db
        .query("behavioralTriggers")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .collect();
    }
    
    // Enrich with config info
    return triggers.map(t => ({
      ...t,
      config: TRIGGER_CONFIGS[t.triggerType],
    }));
  },
});

// Get a specific trigger
export const get = query({
  args: {
    triggerId: v.id("behavioralTriggers"),
  },
  handler: async (ctx, args) => {
    const trigger = await ctx.db.get(args.triggerId);
    if (!trigger) return null;
    
    // Get related transactions if category or merchant based
    let relatedTransactions: any[] = [];
    
    if (trigger.pattern.categoryId || trigger.pattern.merchantName) {
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      
      const txs = await ctx.db
        .query("transactions")
        .withIndex("by_user", (q) => q.eq("userId", trigger.userId))
        .collect();
      
      relatedTransactions = txs
        .filter(t => t.date >= thirtyDaysAgo)
        .filter(t => {
          if (trigger.pattern.categoryId && t.categoryId === trigger.pattern.categoryId) return true;
          if (trigger.pattern.merchantName && t.merchantName.toLowerCase().includes(trigger.pattern.merchantName.toLowerCase())) return true;
          return false;
        })
        .slice(0, 20);
    }
    
    return {
      ...trigger,
      config: TRIGGER_CONFIGS[trigger.triggerType],
      relatedTransactions,
    };
  },
});

// Acknowledge a trigger (user has seen it)
export const acknowledge = mutation({
  args: {
    triggerId: v.id("behavioralTriggers"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.triggerId, {
      isAcknowledged: true,
      updatedAt: Date.now(),
    });
    return { success: true };
  },
});

// Configure nudge for a trigger
export const configureNudge = mutation({
  args: {
    triggerId: v.id("behavioralTriggers"),
    enabled: v.boolean(),
    message: v.optional(v.string()),
    nudgeTime: v.optional(v.number()), // Hour to send nudge (0-23)
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.triggerId, {
      nudgeEnabled: args.enabled,
      nudgeMessage: args.message,
      nudgeTime: args.nudgeTime,
      updatedAt: Date.now(),
    });
    return { success: true };
  },
});

// Dismiss/deactivate a trigger
export const dismiss = mutation({
  args: {
    triggerId: v.id("behavioralTriggers"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.triggerId, {
      isActive: false,
      updatedAt: Date.now(),
    });
    return { success: true };
  },
});

// ============================================
// DETECTION ALGORITHMS
// ============================================

// Main detection function - analyzes all patterns
export const detectPatterns = internalMutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const ninetyDaysAgo = now - 90 * 24 * 60 * 60 * 1000;
    
    // Get transaction history
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    
    const recentTxs = transactions
      .filter(t => t.date >= ninetyDaysAgo && t.type === "expense");
    
    if (recentTxs.length < 20) {
      return { detected: 0, message: "Not enough transaction history" };
    }
    
    const detected: string[] = [];
    
    // 1. Detect late-night spending
    const lateNightResult = await detectLateNightSpending(ctx, args.userId, recentTxs);
    if (lateNightResult) detected.push("time_of_day");
    
    // 2. Detect weekend splurges
    const weekendResult = await detectWeekendSplurge(ctx, args.userId, recentTxs);
    if (weekendResult) detected.push("day_of_week");
    
    // 3. Detect payday effect
    const paydayResult = await detectPaydayEffect(ctx, args.userId, transactions);
    if (paydayResult) detected.push("payday_effect");
    
    // 4. Detect stress spending
    const stressResult = await detectStressSpending(ctx, args.userId, recentTxs);
    if (stressResult) detected.push("stress_spending");
    
    // 5. Detect category binges
    const bingeResult = await detectCategoryBinges(ctx, args.userId, recentTxs);
    if (bingeResult) detected.push("category_binge");
    
    // 6. Detect merchant habits
    const merchantResult = await detectMerchantHabits(ctx, args.userId, recentTxs);
    if (merchantResult) detected.push("merchant_habit");
    
    return { detected: detected.length, patterns: detected };
  },
});

// Detect late-night spending (10pm - 2am)
async function detectLateNightSpending(
  ctx: MutationCtx,
  userId: Id<"users">,
  transactions: Doc<"transactions">[]
) {
  const lateNightHours = [22, 23, 0, 1, 2]; // 10pm - 2am
  
  const lateNightTxs = transactions.filter(tx => {
    const hour = new Date(tx.date).getHours();
    return lateNightHours.includes(hour);
  });
  
  // Need at least 10 late-night transactions to detect pattern
  if (lateNightTxs.length < 10) return null;
  
  const lateNightPercentage = (lateNightTxs.length / transactions.length) * 100;
  
  // If more than 15% of spending is late-night, it's a pattern
  if (lateNightPercentage < 15) return null;
  
  const totalLateNight = lateNightTxs.reduce((sum, t) => sum + t.amount, 0);
  const avgPerOccurrence = totalLateNight / lateNightTxs.length;
  
  // Check if trigger already exists
  const existing = await ctx.db
    .query("behavioralTriggers")
    .withIndex("by_user_type", (q) => 
      q.eq("userId", userId).eq("triggerType", "time_of_day")
    )
    .first();
  
  const now = Date.now();
  
  if (existing) {
    // Update existing trigger
    await ctx.db.patch(existing._id, {
      occurrences: lateNightTxs.length,
      totalAmount: totalLateNight,
      avgPerOccurrence,
      lastOccurrence: lateNightTxs[lateNightTxs.length - 1]?.date ?? now,
      isActive: true,
      updatedAt: now,
    });
  } else {
    // Create new trigger
    await ctx.db.insert("behavioralTriggers", {
      userId,
      triggerType: "time_of_day",
      pattern: {
        hourStart: 22,
        hourEnd: 2,
      },
      occurrences: lateNightTxs.length,
      totalAmount: totalLateNight,
      avgPerOccurrence,
      lastOccurrence: lateNightTxs[lateNightTxs.length - 1]?.date ?? now,
      severity: lateNightPercentage > 30 ? "high" : lateNightPercentage > 20 ? "medium" : "low",
      isActive: true,
      isAcknowledged: false,
      nudgeEnabled: false,
      createdAt: now,
      updatedAt: now,
    });
  }
  
  return { percentage: lateNightPercentage, count: lateNightTxs.length };
}

// Detect weekend splurges (Fri-Sun)
async function detectWeekendSplurge(
  ctx: MutationCtx,
  userId: Id<"users">,
  transactions: Doc<"transactions">[]
) {
  const weekendDays = [0, 5, 6]; // Sun, Fri, Sat
  
  const weekendTxs = transactions.filter(tx => {
    const day = new Date(tx.date).getDay();
    return weekendDays.includes(day);
  });
  
  const weekdayTxs = transactions.filter(tx => {
    const day = new Date(tx.date).getDay();
    return !weekendDays.includes(day);
  });
  
  if (weekendTxs.length < 10 || weekdayTxs.length < 10) return null;
  
  // Calculate average daily spending by counting actual unique days in dataset
  const weekendTotal = weekendTxs.reduce((sum, t) => sum + t.amount, 0);
  const weekdayTotal = weekdayTxs.reduce((sum, t) => sum + t.amount, 0);
  
  // Count unique days for accurate normalization
  const getUniqueDays = (txs: Doc<"transactions">[]) => {
    const days = new Set(txs.map(t => new Date(t.date).toISOString().split("T")[0]));
    return days.size;
  };
  
  const uniqueWeekendDays = getUniqueDays(weekendTxs);
  const uniqueWeekdayDays = getUniqueDays(weekdayTxs);
  
  // Guard against division by zero
  if (uniqueWeekendDays === 0 || uniqueWeekdayDays === 0) return null;
  
  const avgWeekendDaily = weekendTotal / uniqueWeekendDays;
  const avgWeekdayDaily = weekdayTotal / uniqueWeekdayDays;
  
  // Guard against division by zero if weekday average is 0
  if (avgWeekdayDaily === 0) return null;
  
  const spendingIncrease = ((avgWeekendDaily - avgWeekdayDaily) / avgWeekdayDaily) * 100;
  
  // Weekend spending should be at least 40% higher to be significant
  if (spendingIncrease < 40) return null;
  
  const now = Date.now();
  
  const existing = await ctx.db
    .query("behavioralTriggers")
    .withIndex("by_user_type", (q) => 
      q.eq("userId", userId).eq("triggerType", "day_of_week")
    )
    .first();
  
  if (existing) {
    await ctx.db.patch(existing._id, {
      pattern: {
        daysOfWeek: weekendDays,
        avgAmount: spendingIncrease, // Store weekend vs weekday spending increase %
      },
      occurrences: weekendTxs.length,
      totalAmount: weekendTotal,
      avgPerOccurrence: weekendTotal / weekendTxs.length,
      lastOccurrence: weekendTxs[weekendTxs.length - 1]?.date ?? now,
      severity: spendingIncrease > 100 ? "high" : spendingIncrease > 60 ? "medium" : "low",
      isActive: true,
      updatedAt: now,
    });
  } else {
    await ctx.db.insert("behavioralTriggers", {
      userId,
      triggerType: "day_of_week",
      pattern: {
        daysOfWeek: weekendDays,
        avgAmount: spendingIncrease, // Store weekend vs weekday spending increase %
      },
      occurrences: weekendTxs.length,
      totalAmount: weekendTotal,
      avgPerOccurrence: weekendTotal / weekendTxs.length,
      lastOccurrence: weekendTxs[weekendTxs.length - 1]?.date ?? now,
      severity: spendingIncrease > 100 ? "high" : spendingIncrease > 60 ? "medium" : "low",
      isActive: true,
      isAcknowledged: false,
      nudgeEnabled: false,
      createdAt: now,
      updatedAt: now,
    });
  }
  
  return { increase: spendingIncrease };
}

// Detect payday spending effect
async function detectPaydayEffect(
  ctx: MutationCtx,
  userId: Id<"users">,
  transactions: Doc<"transactions">[]
) {
  // Find income transactions to determine payday
  const incomeTxs = transactions
    .filter(t => t.type === "income")
    .sort((a, b) => b.date - a.date);
  
  if (incomeTxs.length < 2) return null;
  
  // Determine typical payday (most common day of month for income)
  const payDays = incomeTxs.map(t => new Date(t.date).getDate());
  const payDayFrequency = new Map<number, number>();
  
  for (const day of payDays) {
    payDayFrequency.set(day, (payDayFrequency.get(day) ?? 0) + 1);
  }
  
  const mostCommonPayDay = [...payDayFrequency.entries()]
    .sort((a, b) => b[1] - a[1])[0]?.[0] ?? 1;
  
  // Analyze spending in first 5 days after payday vs rest of month
  const expenseTxs = transactions.filter(t => t.type === "expense");
  
  const postPaydayTxs = expenseTxs.filter(tx => {
    const dayOfMonth = new Date(tx.date).getDate();
    const daysAfterPayday = (dayOfMonth - mostCommonPayDay + 31) % 31;
    return daysAfterPayday <= 5;
  });
  
  const otherTxs = expenseTxs.filter(tx => {
    const dayOfMonth = new Date(tx.date).getDate();
    const daysAfterPayday = (dayOfMonth - mostCommonPayDay + 31) % 31;
    return daysAfterPayday > 5;
  });
  
  if (postPaydayTxs.length < 5 || otherTxs.length < 10) return null;
  
  const postPaydayTotal = postPaydayTxs.reduce((sum, t) => sum + t.amount, 0);
  const otherTotal = otherTxs.reduce((sum, t) => sum + t.amount, 0);
  const totalSpending = postPaydayTotal + otherTotal;
  
  // Calculate what percentage of monthly spending happens in first 5 days
  const postPaydayPercentage = (postPaydayTotal / totalSpending) * 100;
  
  // If more than 30% of spending is in first 5 days (expected ~16%), it's a pattern
  if (postPaydayPercentage < 30) return null;
  
  const now = Date.now();
  
  const existing = await ctx.db
    .query("behavioralTriggers")
    .withIndex("by_user_type", (q) => 
      q.eq("userId", userId).eq("triggerType", "payday_effect")
    )
    .first();
  
  if (existing) {
    await ctx.db.patch(existing._id, {
      pattern: { dayOfMonth: mostCommonPayDay },
      occurrences: postPaydayTxs.length,
      totalAmount: postPaydayTotal,
      avgPerOccurrence: postPaydayTotal / postPaydayTxs.length,
      lastOccurrence: now,
      isActive: true,
      updatedAt: now,
    });
  } else {
    await ctx.db.insert("behavioralTriggers", {
      userId,
      triggerType: "payday_effect",
      pattern: {
        dayOfMonth: mostCommonPayDay,
      },
      occurrences: postPaydayTxs.length,
      totalAmount: postPaydayTotal,
      avgPerOccurrence: postPaydayTotal / postPaydayTxs.length,
      lastOccurrence: now,
      severity: postPaydayPercentage > 50 ? "high" : postPaydayPercentage > 40 ? "medium" : "low",
      isActive: true,
      isAcknowledged: false,
      nudgeEnabled: false,
      createdAt: now,
      updatedAt: now,
    });
  }
  
  return { payDay: mostCommonPayDay, percentage: postPaydayPercentage };
}

// Detect stress spending (multiple purchases in short time)
async function detectStressSpending(
  ctx: MutationCtx,
  userId: Id<"users">,
  transactions: Doc<"transactions">[]
) {
  // Sort by date
  const sorted = [...transactions].sort((a, b) => a.date - b.date);
  
  // Find clusters of transactions (3+ within 2 hours)
  const clusters: { transactions: any[]; totalAmount: number }[] = [];
  
  let currentCluster: any[] = [];
  
  for (let i = 0; i < sorted.length; i++) {
    const tx = sorted[i];
    
    if (currentCluster.length === 0) {
      currentCluster.push(tx);
      continue;
    }
    
    const timeSinceFirst = tx.date - currentCluster[0].date;
    const twoHoursMs = 2 * 60 * 60 * 1000;
    
    if (timeSinceFirst <= twoHoursMs) {
      currentCluster.push(tx);
    } else {
      // Check if current cluster qualifies (3+ transactions)
      if (currentCluster.length >= 3) {
        clusters.push({
          transactions: currentCluster,
          totalAmount: currentCluster.reduce((sum, t) => sum + t.amount, 0),
        });
      }
      currentCluster = [tx];
    }
  }
  
  // Check last cluster
  if (currentCluster.length >= 3) {
    clusters.push({
      transactions: currentCluster,
      totalAmount: currentCluster.reduce((sum, t) => sum + t.amount, 0),
    });
  }
  
  // Need at least 3 stress spending episodes
  if (clusters.length < 3) return null;
  
  const totalStressAmount = clusters.reduce((sum, c) => sum + c.totalAmount, 0);
  const totalTxsInClusters = clusters.reduce((sum, c) => sum + c.transactions.length, 0);
  
  const now = Date.now();
  
  const existing = await ctx.db
    .query("behavioralTriggers")
    .withIndex("by_user_type", (q) => 
      q.eq("userId", userId).eq("triggerType", "stress_spending")
    )
    .first();
  
  if (existing) {
    await ctx.db.patch(existing._id, {
      occurrences: clusters.length,
      totalAmount: totalStressAmount,
      avgPerOccurrence: totalStressAmount / clusters.length,
      lastOccurrence: clusters[clusters.length - 1]?.transactions[0]?.date ?? now,
      isActive: true,
      updatedAt: now,
    });
  } else {
    await ctx.db.insert("behavioralTriggers", {
      userId,
      triggerType: "stress_spending",
      pattern: {
        frequency: clusters.length,
        periodDays: 90,
      },
      occurrences: clusters.length,
      totalAmount: totalStressAmount,
      avgPerOccurrence: totalStressAmount / clusters.length,
      lastOccurrence: clusters[clusters.length - 1]?.transactions[0]?.date ?? now,
      severity: clusters.length > 10 ? "high" : clusters.length > 5 ? "medium" : "low",
      isActive: true,
      isAcknowledged: false,
      nudgeEnabled: false,
      createdAt: now,
      updatedAt: now,
    });
  }
  
  return { episodes: clusters.length, totalAmount: totalStressAmount };
}

// Detect category binges (excessive spending in one category)
async function detectCategoryBinges(
  ctx: MutationCtx,
  userId: Id<"users">,
  transactions: Doc<"transactions">[]
) {
  // Group by category
  const byCategory = new Map<string, any[]>();
  
  for (const tx of transactions) {
    const key = tx.categoryId?.toString() ?? "uncategorized";
    const list = byCategory.get(key) ?? [];
    list.push(tx);
    byCategory.set(key, list);
  }
  
  const now = Date.now();
  let detected = false;
  
  for (const [categoryId, txs] of byCategory) {
    if (categoryId === "uncategorized") continue;
    if (txs.length < 10) continue;
    
    // Check for days with 3+ purchases in same category
    const byDay = new Map<string, any[]>();
    
    for (const tx of txs) {
      const day = new Date(tx.date).toISOString().split("T")[0];
      const list = byDay.get(day) ?? [];
      list.push(tx);
      byDay.set(day, list);
    }
    
    const bingeDays = [...byDay.entries()].filter(([, dayTxs]) => dayTxs.length >= 3);
    
    if (bingeDays.length < 3) continue; // Need at least 3 binge days
    
    const totalBingeAmount = bingeDays.reduce(
      (sum, [, dayTxs]) => sum + dayTxs.reduce((s, t) => s + t.amount, 0),
      0
    );
    
    // Get category info
    const category = await ctx.db.get(categoryId as Id<"categories">);
    
    const existing = await ctx.db
      .query("behavioralTriggers")
      .withIndex("by_user_type", (q) => 
        q.eq("userId", userId).eq("triggerType", "category_binge")
      )
      .collect();
    
    const existingForCategory = existing.find(
      (e: Doc<"behavioralTriggers">) => e.pattern.categoryId === categoryId
    );
    
    if (existingForCategory) {
      await ctx.db.patch(existingForCategory._id, {
        occurrences: bingeDays.length,
        totalAmount: totalBingeAmount,
        avgPerOccurrence: totalBingeAmount / bingeDays.length,
        lastOccurrence: now,
        isActive: true,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("behavioralTriggers", {
        userId,
        triggerType: "category_binge",
        pattern: {
          categoryId: categoryId as Id<"categories">,
        },
        occurrences: bingeDays.length,
        totalAmount: totalBingeAmount,
        avgPerOccurrence: totalBingeAmount / bingeDays.length,
        lastOccurrence: now,
        severity: bingeDays.length > 10 ? "high" : bingeDays.length > 5 ? "medium" : "low",
        isActive: true,
        isAcknowledged: false,
        nudgeEnabled: false,
        createdAt: now,
        updatedAt: now,
      });
    }
    
    detected = true;
  }
  
  return detected ? { found: true } : null;
}

// Detect merchant habits (frequent visits)
async function detectMerchantHabits(
  ctx: MutationCtx,
  userId: Id<"users">,
  transactions: Doc<"transactions">[]
) {
  // Group by merchant
  const byMerchant = new Map<string, any[]>();
  
  for (const tx of transactions) {
    const key = tx.merchantName.toLowerCase();
    const list = byMerchant.get(key) ?? [];
    list.push(tx);
    byMerchant.set(key, list);
  }
  
  const now = Date.now();
  const ninetyDays = 90;
  let detected = false;
  
  for (const [merchantName, txs] of byMerchant) {
    // Calculate visits per week
    const visitsPerWeek = (txs.length / ninetyDays) * 7;
    
    // Flag if more than 3 visits per week to same merchant
    if (visitsPerWeek < 3) continue;
    
    const totalAmount = txs.reduce((sum, t) => sum + t.amount, 0);
    
    const existing = await ctx.db
      .query("behavioralTriggers")
      .withIndex("by_user_type", (q) => 
        q.eq("userId", userId).eq("triggerType", "merchant_habit")
      )
      .collect();
    
    const existingForMerchant = existing.find(
      (e: Doc<"behavioralTriggers">) => e.pattern.merchantName?.toLowerCase() === merchantName
    );
    
    if (existingForMerchant) {
      await ctx.db.patch(existingForMerchant._id, {
        occurrences: txs.length,
        totalAmount,
        avgPerOccurrence: totalAmount / txs.length,
        lastOccurrence: txs[txs.length - 1]?.date ?? now,
        pattern: {
          merchantName: txs[0].merchantName,
          frequency: Math.round(visitsPerWeek * 10) / 10,
          periodDays: 7,
        },
        isActive: true,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("behavioralTriggers", {
        userId,
        triggerType: "merchant_habit",
        pattern: {
          merchantName: txs[0].merchantName,
          frequency: Math.round(visitsPerWeek * 10) / 10,
          periodDays: 7,
        },
        occurrences: txs.length,
        totalAmount,
        avgPerOccurrence: totalAmount / txs.length,
        lastOccurrence: txs[txs.length - 1]?.date ?? now,
        severity: visitsPerWeek > 7 ? "high" : visitsPerWeek > 5 ? "medium" : "low",
        isActive: true,
        isAcknowledged: false,
        nudgeEnabled: false,
        createdAt: now,
        updatedAt: now,
      });
    }
    
    detected = true;
  }
  
  return detected ? { found: true } : null;
}

// Run detection for a user (called manually or by cron)
export const runDetection = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const ninetyDaysAgo = now - 90 * 24 * 60 * 60 * 1000;
    
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    
    const recentTxs = transactions
      .filter(t => t.date >= ninetyDaysAgo && t.type === "expense");
    
    if (recentTxs.length < 20) {
      return { detected: 0, message: "Not enough transaction history (need 20+ transactions)" };
    }
    
    const detected: string[] = [];
    
    // Run all detections
    const lateNight = await detectLateNightSpending(ctx, args.userId, recentTxs);
    if (lateNight) detected.push("time_of_day");
    
    const weekend = await detectWeekendSplurge(ctx, args.userId, recentTxs);
    if (weekend) detected.push("day_of_week");
    
    const payday = await detectPaydayEffect(ctx, args.userId, transactions);
    if (payday) detected.push("payday_effect");
    
    const stress = await detectStressSpending(ctx, args.userId, recentTxs);
    if (stress) detected.push("stress_spending");
    
    const binge = await detectCategoryBinges(ctx, args.userId, recentTxs);
    if (binge) detected.push("category_binge");
    
    const merchant = await detectMerchantHabits(ctx, args.userId, recentTxs);
    if (merchant) detected.push("merchant_habit");
    
    return { 
      detected: detected.length, 
      patterns: detected,
      message: detected.length > 0 
        ? `Found ${detected.length} behavioral patterns`
        : "No significant patterns detected yet"
    };
  },
});

// Get trigger summary for dashboard
export const getSummary = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const triggers = await ctx.db
      .query("behavioralTriggers")
      .withIndex("by_user_active", (q) => 
        q.eq("userId", args.userId).eq("isActive", true)
      )
      .collect();
    
    const unacknowledged = triggers.filter(t => !t.isAcknowledged);
    const highSeverity = triggers.filter(t => t.severity === "high");
    const withNudges = triggers.filter(t => t.nudgeEnabled);
    
    const totalImpact = triggers.reduce((sum, t) => sum + t.totalAmount, 0);
    
    return {
      totalTriggers: triggers.length,
      unacknowledged: unacknowledged.length,
      highSeverity: highSeverity.length,
      nudgesEnabled: withNudges.length,
      totalImpact: Math.round(totalImpact * 100) / 100,
      topTrigger: triggers.sort((a, b) => b.totalAmount - a.totalAmount)[0] ?? null,
    };
  },
});

// Generate insight message for a trigger
export const generateInsightMessage = query({
  args: {
    triggerId: v.id("behavioralTriggers"),
  },
  handler: async (ctx, args) => {
    const trigger = await ctx.db.get(args.triggerId);
    if (!trigger) return null;
    
    const user = await ctx.db.get(trigger.userId);
    const style = user?.coachingStyle ?? "gentle";
    
    // Get category name if applicable
    let categoryName = "";
    if (trigger.pattern.categoryId) {
      const cat = await ctx.db.get(trigger.pattern.categoryId);
      categoryName = cat?.name ?? "";
    }
    
    // Generate message based on trigger type and coaching style
    const messages: Record<string, Record<string, string>> = {
      time_of_day: {
        gentle: `I noticed you tend to shop late at night (${trigger.pattern.hourStart}pm-${trigger.pattern.hourEnd}am). That's when we sometimes make impulse purchases. Would a gentle reminder help?`,
        brutal: `You've blown $${trigger.totalAmount.toFixed(0)} on late-night purchases. Nothing good happens after 10pm, including your spending decisions.`,
        nerdy: `Data shows ${trigger.occurrences} transactions between ${trigger.pattern.hourStart}:00-${trigger.pattern.hourEnd}:00, totaling $${trigger.totalAmount.toFixed(2)}. This represents a ${((trigger.totalAmount / trigger.occurrences) * 100).toFixed(0)}% higher avg transaction than daytime.`,
        meme: `Bestie... you've spent $${trigger.totalAmount.toFixed(0)} after 10pm 💀 The 3am Amazon cart hits different (and by different I mean worse)`,
      },
      day_of_week: {
        gentle: `Weekends seem to be when you treat yourself! Your spending goes up quite a bit on Fri-Sun. Just something to be aware of.`,
        brutal: `Weekend warrior? More like weekend spender. You're hemorrhaging cash every Fri-Sun.`,
        nerdy: `Weekend spending is ${(trigger.pattern.avgAmount ?? 0).toFixed(0)}% above weekday average. ${trigger.occurrences} weekend transactions totaling $${trigger.totalAmount.toFixed(2)}. Statistical significance: high.`,
        meme: `POV: It's Friday and your wallet is already crying 😭 Weekend you is a menace to savings`,
      },
      payday_effect: {
        gentle: `I noticed you spend quite a bit right after payday. Totally normal! Maybe we could spread it out a little?`,
        brutal: `You burn through your paycheck like it's on fire. First 5 days = gone.`,
        nerdy: `Post-payday spending analysis: ${trigger.occurrences} pay cycles tracked, averaging $${trigger.avgPerOccurrence.toFixed(0)} spent within 5 days of payday (day ${trigger.pattern.dayOfMonth}). Total: $${trigger.totalAmount.toFixed(0)}. Optimal distribution: 16% of monthly spend in first 5 days.`,
        meme: `Paycheck hits: 💰 // 5 days later: 🪹 Every. Single. Time. 😩`,
      },
      stress_spending: {
        gentle: `Sometimes when we're stressed, we shop. I've noticed ${trigger.occurrences} times when you made several purchases quickly. Here if you want to talk about it!`,
        brutal: `${trigger.occurrences} stress shopping episodes. That's $${trigger.totalAmount.toFixed(0)} spent on retail therapy. Might be cheaper to actually go to therapy.`,
        nerdy: `Detected ${trigger.occurrences} purchase clusters (3+ transactions within 2 hours). Average cluster spend: $${trigger.avgPerOccurrence.toFixed(2)}. Correlation with stress indicators: likely.`,
        meme: `Bestie dropped $${trigger.avgPerOccurrence.toFixed(0)} in a 2-hour shopping spree... ${trigger.occurrences} times 💀 The "add to cart" button fears you`,
      },
      category_binge: {
        gentle: `You really love ${categoryName || "this category"}! Nothing wrong with that, but ${trigger.occurrences} splurge days might add up.`,
        brutal: `${categoryName || "Category"} addiction much? ${trigger.occurrences} binge days. Get help.`,
        nerdy: `${categoryName || "Category"} spending shows binge pattern: ${trigger.occurrences} days with 3+ purchases. Total impact: $${trigger.totalAmount.toFixed(2)}.`,
        meme: `Not you buying ${categoryName || "stuff"} like it's going out of style... ${trigger.occurrences} times 🙈`,
      },
      merchant_habit: {
        gentle: `You visit ${trigger.pattern.merchantName} about ${trigger.pattern.frequency}x per week! They must love you there.`,
        brutal: `${trigger.pattern.merchantName} ${trigger.pattern.frequency}x a week? At this point just apply for a job there.`,
        nerdy: `${trigger.pattern.merchantName} frequency: ${trigger.pattern.frequency}x/week. Annual projection: $${(trigger.totalAmount * (365 / 90)).toFixed(0)}. Consider bulk purchasing or alternatives.`,
        meme: `${trigger.pattern.merchantName} employees when they see you walk in for the ${trigger.occurrences}th time: 😏📸 "The usual?"`,
      },
    };
    
    return {
      message: messages[trigger.triggerType]?.[style] ?? "Spending pattern detected.",
      trigger,
      config: TRIGGER_CONFIGS[trigger.triggerType],
    };
  },
});

