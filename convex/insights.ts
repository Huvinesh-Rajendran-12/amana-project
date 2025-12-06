import { v } from "convex/values";
import { query, mutation, action, internalMutation, internalQuery, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { 
  COACHING_STYLES, 
  INSIGHT_PROMPTS, 
  buildInsightPrompt, 
  formatInsightForStorage,
  MESSAGE_TEMPLATES 
} from "./lib/ai";

/**
 * Insights module - AI-powered spending analysis and coaching messages.
 * Uses Anthropic Claude for generating personalized financial insights.
 */

// List insights for a user
export const list = query({
  args: {
    userId: v.id("users"),
    unreadOnly: v.optional(v.boolean()),
    type: v.optional(
      v.union(
        v.literal("spending_spike"),
        v.literal("subscription_waste"),
        v.literal("peer_comparison"),
        v.literal("goal_progress"),
        v.literal("pattern_detected"),
        v.literal("savings_opportunity"),
        v.literal("weekly_summary")
      )
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    
    let insights;
    
    if (args.unreadOnly) {
      insights = await ctx.db
        .query("insights")
        .withIndex("by_user_unread", (q) => 
          q.eq("userId", args.userId).eq("isRead", false)
        )
        .order("desc")
        .take(limit);
    } else if (args.type) {
      insights = await ctx.db
        .query("insights")
        .withIndex("by_user_type", (q) => 
          q.eq("userId", args.userId).eq("type", args.type!)
        )
        .order("desc")
        .take(limit);
    } else {
      insights = await ctx.db
        .query("insights")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .order("desc")
        .take(limit);
    }
    
    // Filter out expired insights
    const now = Date.now();
    const validInsights = insights.filter(
      i => !i.expiresAt || i.expiresAt > now
    );
    
    return validInsights;
  },
});

// Get unread count
export const getUnreadCount = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const unread = await ctx.db
      .query("insights")
      .withIndex("by_user_unread", (q) => 
        q.eq("userId", args.userId).eq("isRead", false)
      )
      .collect();
    
    // Filter out expired
    const now = Date.now();
    const validUnread = unread.filter(i => !i.expiresAt || i.expiresAt > now);
    
    return { count: validUnread.length };
  },
});

// Mark an insight as read
export const markAsRead = mutation({
  args: {
    insightId: v.id("insights"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.insightId, {
      isRead: true,
    });
    
    return { success: true };
  },
});

// Mark all insights as read
export const markAllAsRead = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const unread = await ctx.db
      .query("insights")
      .withIndex("by_user_unread", (q) => 
        q.eq("userId", args.userId).eq("isRead", false)
      )
      .collect();
    
    for (const insight of unread) {
      await ctx.db.patch(insight._id, { isRead: true });
    }
    
    return { markedCount: unread.length };
  },
});

// Dismiss an insight (hide it)
export const dismiss = mutation({
  args: {
    insightId: v.id("insights"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.insightId, {
      isDismissed: true,
      isRead: true,
    });
    
    return { success: true };
  },
});

// Record action taken on an insight
export const recordAction = mutation({
  args: {
    insightId: v.id("insights"),
    action: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.insightId, {
      actionTaken: args.action,
      isRead: true,
    });
    
    return { success: true };
  },
});

// Internal mutation to store a generated insight
export const storeInsight = internalMutation({
  args: {
    userId: v.id("users"),
    type: v.union(
      v.literal("spending_spike"),
      v.literal("subscription_waste"),
      v.literal("peer_comparison"),
      v.literal("goal_progress"),
      v.literal("pattern_detected"),
      v.literal("savings_opportunity"),
      v.literal("weekly_summary")
    ),
    title: v.string(),
    message: v.string(),
    severity: v.union(
      v.literal("info"),
      v.literal("warning"),
      v.literal("alert"),
      v.literal("celebration")
    ),
    metadata: v.object({
      categoryId: v.optional(v.id("categories")),
      merchantId: v.optional(v.id("merchants")),
      transactionIds: v.optional(v.array(v.id("transactions"))),
      subscriptionId: v.optional(v.id("subscriptions")),
      amount: v.optional(v.number()),
      percentageChange: v.optional(v.number()),
      comparisonValue: v.optional(v.number()),
      period: v.optional(v.string()),
    }),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const insightId = await ctx.db.insert("insights", {
      userId: args.userId,
      type: args.type,
      title: args.title,
      message: args.message,
      severity: args.severity,
      metadata: args.metadata,
      isRead: false,
      isDismissed: false,
      expiresAt: args.expiresAt,
      createdAt: Date.now(),
    });
    
    return insightId;
  },
});

// Action to generate insights using Claude API
export const generate = internalAction({
  args: {
    userId: v.id("users"),
    type: v.union(
      v.literal("spending_spike"),
      v.literal("subscription_waste"),
      v.literal("peer_comparison"),
      v.literal("goal_progress"),
      v.literal("pattern_detected"),
      v.literal("savings_opportunity"),
      v.literal("weekly_summary")
    ),
    specificContext: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // Get user data
    const user = await ctx.runQuery(internal.insights.getUserForInsight, {
      userId: args.userId,
    });
    
    if (!user) {
      throw new Error("User not found");
    }
    
    // Get spending data
    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    const sixtyDaysAgo = now - 60 * 24 * 60 * 60 * 1000;
    
    const spendingData = await ctx.runQuery(internal.insights.getSpendingDataForInsight, {
      userId: args.userId,
      currentStart: thirtyDaysAgo,
      currentEnd: now,
      previousStart: sixtyDaysAgo,
      previousEnd: thirtyDaysAgo,
    });
    
    // Build prompt
    const coachingStyle = user.coachingStyle as keyof typeof COACHING_STYLES;
    const { systemPrompt, userPrompt } = buildInsightPrompt(
      coachingStyle,
      args.type,
      {
        userData: {
          name: user.name,
          currency: user.currency,
          monthlyIncome: user.monthlyIncome,
        },
        spendingData: {
          currentPeriodTotal: spendingData.currentTotal,
          previousPeriodTotal: spendingData.previousTotal,
          topCategories: spendingData.topCategories,
          recentTransactions: spendingData.recentTransactions,
        },
        specificContext: args.specificContext as Record<string, unknown> | undefined,
      }
    );
    
    // Call Claude API
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!anthropicApiKey) {
      // Fallback to template-based insights if no API key
      const fallbackInsight = generateFallbackInsight(
        args.type,
        coachingStyle,
        spendingData
      );
      
      await ctx.runMutation(internal.insights.storeInsight, {
        userId: args.userId,
        type: args.type,
        title: fallbackInsight.title,
        message: fallbackInsight.message,
        severity: fallbackInsight.severity,
        metadata: {
          period: "last_30_days",
          amount: spendingData.currentTotal,
          percentageChange: spendingData.previousTotal > 0 
            ? ((spendingData.currentTotal - spendingData.previousTotal) / spendingData.previousTotal) * 100 
            : 0,
        },
      });
      
      return { success: true, method: "fallback" };
    }
    
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": anthropicApiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-3-haiku-20240307", // Fast and cheap for quick insights
          max_tokens: 300,
          system: systemPrompt,
          messages: [
            { role: "user", content: userPrompt },
          ],
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Claude API error: ${response.status}`);
      }
      
      const data = await response.json();
      const rawResponse = data.content[0].text;
      
      // Determine severity based on content
      let severity: "info" | "warning" | "alert" | "celebration" = "info";
      if (args.type === "spending_spike") severity = "warning";
      if (args.type === "subscription_waste") severity = "warning";
      if (spendingData.currentTotal < spendingData.previousTotal * 0.8) {
        severity = "celebration";
      }
      
      const { title, message } = formatInsightForStorage(rawResponse, args.type, severity);
      
      // Store the insight
      await ctx.runMutation(internal.insights.storeInsight, {
        userId: args.userId,
        type: args.type,
        title,
        message,
        severity,
        metadata: {
          period: "last_30_days",
          amount: spendingData.currentTotal,
          percentageChange: spendingData.previousTotal > 0 
            ? ((spendingData.currentTotal - spendingData.previousTotal) / spendingData.previousTotal) * 100 
            : 0,
        },
      });
      
      return { success: true, method: "claude" };
    } catch (error) {
      console.error("Claude API error:", error);
      
      // Fallback to template
      const fallbackInsight = generateFallbackInsight(
        args.type,
        coachingStyle,
        spendingData
      );
      
      await ctx.runMutation(internal.insights.storeInsight, {
        userId: args.userId,
        type: args.type,
        title: fallbackInsight.title,
        message: fallbackInsight.message,
        severity: fallbackInsight.severity,
        metadata: {
          period: "last_30_days",
          amount: spendingData.currentTotal,
        },
      });
      
      return { success: true, method: "fallback", error: String(error) };
    }
  },
});

// Internal query to get user data for insight generation
export const getUserForInsight = internalQuery({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

// Internal query to get spending data for insight generation
export const getSpendingDataForInsight = internalQuery({
  args: {
    userId: v.id("users"),
    currentStart: v.number(),
    currentEnd: v.number(),
    previousStart: v.number(),
    previousEnd: v.number(),
  },
  handler: async (ctx, args) => {
    // Current period transactions
    const currentTxs = await ctx.db
      .query("transactions")
      .withIndex("by_user_date", (q) => 
        q.eq("userId", args.userId)
          .gte("date", args.currentStart)
          .lte("date", args.currentEnd)
      )
      .collect();
    
    // Previous period transactions
    const previousTxs = await ctx.db
      .query("transactions")
      .withIndex("by_user_date", (q) => 
        q.eq("userId", args.userId)
          .gte("date", args.previousStart)
          .lte("date", args.previousEnd)
      )
      .collect();
    
    // Calculate totals (expenses only)
    const currentExpenses = currentTxs.filter(t => t.type === "expense");
    const previousExpenses = previousTxs.filter(t => t.type === "expense");
    
    const currentTotal = currentExpenses.reduce((sum, t) => sum + t.amount, 0);
    const previousTotal = previousExpenses.reduce((sum, t) => sum + t.amount, 0);
    
    // Get top categories
    const categoryTotals = new Map<string, { id: Id<"categories"> | null; name: string; amount: number }>();
    
    for (const tx of currentExpenses) {
      const key = tx.categoryId?.toString() ?? "uncategorized";
      const existing = categoryTotals.get(key);
      
      if (existing) {
        existing.amount += tx.amount;
      } else {
        const category = tx.categoryId ? await ctx.db.get(tx.categoryId) : null;
        categoryTotals.set(key, {
          id: tx.categoryId ?? null,
          name: category?.name ?? "Uncategorized",
          amount: tx.amount,
        });
      }
    }
    
    const topCategories = Array.from(categoryTotals.values())
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)
      .map(c => ({ name: c.name, amount: c.amount }));
    
    // Recent transactions
    const recentTransactions = currentExpenses
      .sort((a, b) => b.date - a.date)
      .slice(0, 10)
      .map(t => ({
        merchantName: t.merchantName,
        amount: t.amount,
        category: "category", // Would need to fetch
      }));
    
    return {
      currentTotal,
      previousTotal,
      topCategories,
      recentTransactions,
    };
  },
});

// Get a quick coaching message based on recent activity
export const getCoachingMessage = query({
  args: {
    userId: v.id("users"),
    context: v.optional(v.string()), // e.g., "post_transaction", "daily_summary"
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;
    
    // Check user's spending mode
    const activeMode = await ctx.db
      .query("spendingModes")
      .withIndex("by_user_active", (q) => 
        q.eq("userId", args.userId).eq("isActive", true)
      )
      .first();
    
    // Get today's spending
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    const todaysTxs = await ctx.db
      .query("transactions")
      .withIndex("by_user_date", (q) => 
        q.eq("userId", args.userId).gte("date", startOfDay.getTime())
      )
      .collect();
    
    const todaysSpending = todaysTxs
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    
    // Generate contextual message based on mode
    const modeName = activeMode?.mode ?? user.activeMode;
    
    if (modeName === "yolo") {
      return {
        message: "YOLO mode active. Enjoy your day, king/queen! 👑",
        tone: "celebration",
      };
    }
    
    if (modeName === "broke") {
      const dailyLimit = activeMode?.settings?.dailyLimit ?? 50;
      const remaining = dailyLimit - todaysSpending;
      
      if (remaining < 0) {
        return {
          message: `⚠️ You've exceeded your daily limit by $${Math.abs(remaining).toFixed(2)}. Tomorrow's a new day!`,
          tone: "warning",
        };
      } else if (remaining < dailyLimit * 0.2) {
        return {
          message: `Only $${remaining.toFixed(2)} left for today. You've got this! 💪`,
          tone: "caution",
        };
      }
      
      return {
        message: `$${remaining.toFixed(2)} remaining in today's budget. Looking good!`,
        tone: "info",
      };
    }
    
    if (modeName === "vacation") {
      const tripBudget = activeMode?.settings?.tripBudget ?? 1000;
      const tripName = activeMode?.settings?.tripName ?? "your trip";
      
      return {
        message: `Vacation mode: Enjoy ${tripName}! Remember your $${tripBudget} budget.`,
        tone: "relaxed",
      };
    }
    
    // Normal mode - provide general insight
    if (todaysSpending === 0) {
      return {
        message: "No spending today yet. Off to a great start! 🌟",
        tone: "celebration",
      };
    }
    
    return {
      message: `You've spent $${todaysSpending.toFixed(2)} today. ${todaysSpending > 100 ? "Quite active!" : "Looking moderate."}`,
      tone: "info",
    };
  },
});

// Fallback insight generator when Claude API is unavailable
function generateFallbackInsight(
  type: string,
  style: keyof typeof COACHING_STYLES,
  data: {
    currentTotal: number;
    previousTotal: number;
    topCategories: { name: string; amount: number }[];
    recentTransactions: { merchantName: string; amount: number; category: string }[];
  }
): { title: string; message: string; severity: "info" | "warning" | "alert" | "celebration" } {
  const change = data.previousTotal > 0 
    ? ((data.currentTotal - data.previousTotal) / data.previousTotal) * 100 
    : 0;
  
  const topCategory = data.topCategories[0];
  
  // Style-specific prefixes
  const prefixes = {
    gentle: ["I noticed", "Great news", "Just a heads up"],
    brutal: ["Let's be real", "Face it", "Here's the truth"],
    nerdy: ["The data shows", "Statistically", "Analysis reveals"],
    meme: ["Bruh", "No cap", "Sheesh"],
  };
  
  const prefix = prefixes[style][Math.floor(Math.random() * 3)];
  
  switch (type) {
    case "weekly_summary":
      if (change < -10) {
        return {
          title: "Great Week!",
          message: `${prefix} - you spent ${Math.abs(change).toFixed(0)}% less than last month! Your top category was ${topCategory?.name ?? "unknown"} at $${topCategory?.amount.toFixed(2) ?? 0}.`,
          severity: "celebration",
        };
      } else if (change > 20) {
        return {
          title: "Spending Alert",
          message: `${prefix} - spending is up ${change.toFixed(0)}% from last month. Most went to ${topCategory?.name ?? "various categories"}. Consider reviewing your expenses.`,
          severity: "warning",
        };
      }
      return {
        title: "Weekly Check-in",
        message: `${prefix} - you spent $${data.currentTotal.toFixed(2)} this month. That's ${change >= 0 ? "up" : "down"} ${Math.abs(change).toFixed(0)}% from before.`,
        severity: "info",
      };
    
    case "spending_spike":
      return {
        title: "Spending Spike Detected",
        message: `${prefix} - ${topCategory?.name ?? "spending"} is higher than usual at $${topCategory?.amount.toFixed(2) ?? data.currentTotal.toFixed(2)}. Worth keeping an eye on.`,
        severity: "warning",
      };
    
    case "subscription_waste":
      return {
        title: "Subscription Review",
        message: `${prefix} - you might have subscriptions you're not fully using. A quick audit could save you money each month.`,
        severity: "info",
      };
    
    case "savings_opportunity":
      return {
        title: "Savings Opportunity",
        message: `${prefix} - based on your spending patterns, you could potentially save by reviewing your ${topCategory?.name ?? "recurring expenses"}.`,
        severity: "info",
      };
    
    default:
      return {
        title: "Financial Insight",
        message: `${prefix} - your total spending is $${data.currentTotal.toFixed(2)}. Keep tracking to stay on top of your finances!`,
        severity: "info",
      };
  }
}

// Generate spending spike insights (called by cron)
export const detectSpendingSpikes = internalMutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    const fourteenDaysAgo = now - 14 * 24 * 60 * 60 * 1000;
    
    // Get transactions for both periods
    const recentTxs = await ctx.db
      .query("transactions")
      .withIndex("by_user_date", (q) => 
        q.eq("userId", args.userId).gte("date", sevenDaysAgo)
      )
      .collect();
    
    const previousTxs = await ctx.db
      .query("transactions")
      .withIndex("by_user_date", (q) => 
        q.eq("userId", args.userId)
          .gte("date", fourteenDaysAgo)
          .lt("date", sevenDaysAgo)
      )
      .collect();
    
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
    
    // Detect spikes (>50% increase)
    const spikes: { categoryId: string; recentAmount: number; previousAmount: number; increase: number }[] = [];
    
    for (const [categoryId, recentAmount] of recentByCategory) {
      const previousAmount = previousByCategory.get(categoryId) ?? 0;
      
      if (previousAmount > 0) {
        const increase = ((recentAmount - previousAmount) / previousAmount) * 100;
        
        if (increase > 50 && recentAmount > 50) { // >50% increase and >$50 total
          spikes.push({ categoryId, recentAmount, previousAmount, increase });
        }
      }
    }
    
    // Create insights for spikes
    for (const spike of spikes) {
      const category = spike.categoryId !== "uncategorized" 
        ? await ctx.db.get(spike.categoryId as Id<"categories">)
        : null;
      
      await ctx.db.insert("insights", {
        userId: args.userId,
        type: "spending_spike",
        title: `${category?.name ?? "Category"} Spending Up`,
        message: `Your ${category?.name ?? "spending"} is up ${spike.increase.toFixed(0)}% this week ($${spike.recentAmount.toFixed(2)} vs $${spike.previousAmount.toFixed(2)} last week).`,
        severity: spike.increase > 100 ? "alert" : "warning",
        metadata: {
          categoryId: spike.categoryId !== "uncategorized" ? spike.categoryId as Id<"categories"> : undefined,
          amount: spike.recentAmount,
          percentageChange: spike.increase,
          comparisonValue: spike.previousAmount,
          period: "last_7_days",
        },
        isRead: false,
        isDismissed: false,
        createdAt: now,
      });
    }
    
    return { spikesDetected: spikes.length };
  },
});

