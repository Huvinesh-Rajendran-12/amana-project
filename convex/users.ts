import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

/**
 * Users module - User profiles, preferences, and coaching style management.
 */

// Coaching style info for UI
export const COACHING_STYLES_INFO = {
  gentle: {
    name: "Gentle Coach",
    description: "Supportive and encouraging. Celebrates wins and frames challenges positively.",
    icon: "🤗",
    example: "I noticed you spent a bit more on dining out this week. No worries - want to set a small goal for next week?",
  },
  brutal: {
    name: "Brutal Honesty",
    description: "Direct and no-nonsense. Tells it like it is without sugarcoating.",
    icon: "🔥",
    example: "You blew $400 on takeout this month. That's 3x your usual. Get it together or kiss your savings goodbye.",
  },
  nerdy: {
    name: "Data Nerd",
    description: "Statistics-focused. Loves percentages, trends, and benchmarks.",
    icon: "📊",
    example: "Your food spending is at the 78th percentile for your demographic. That's $127.50 above the median, representing a 23% increase MoM.",
  },
  meme: {
    name: "Meme Lord",
    description: "Casual and funny. Uses internet humor and Gen-Z slang.",
    icon: "😂",
    example: "Bro really said 'one more Uber Eats won't hurt' 47 times this month 💀 Your wallet is NOT having a good time rn",
  },
};

// Get user profile
export const getProfile = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;
    
    // Get active mode info
    const activeMode = await ctx.db
      .query("spendingModes")
      .withIndex("by_user_active", (q) => 
        q.eq("userId", args.userId).eq("isActive", true)
      )
      .first();
    
    // Get excluded categories
    const excludedCategories = await Promise.all(
      user.excludedCategoryIds.map(async (catId) => {
        const cat = await ctx.db.get(catId);
        return cat ? { id: cat._id, name: cat.name, icon: cat.icon } : null;
      })
    );
    
    return {
      ...user,
      coachingStyleInfo: COACHING_STYLES_INFO[user.coachingStyle],
      activeModeDetails: activeMode ? {
        mode: activeMode.mode,
        settings: activeMode.settings,
        expiresAt: activeMode.expiresAt,
      } : null,
      excludedCategories: excludedCategories.filter(Boolean),
    };
  },
});

// Get user by email
export const getByEmail = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

// Update user preferences
export const updatePreferences = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    age: v.optional(v.number()),
    city: v.optional(v.string()),
    country: v.optional(v.string()),
    currency: v.optional(v.string()),
    monthlyIncome: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;
    
    // Filter out undefined values
    const validUpdates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        validUpdates[key] = value;
      }
    }
    
    if (Object.keys(validUpdates).length > 0) {
      validUpdates.updatedAt = Date.now();
      await ctx.db.patch(userId, validUpdates);
    }
    
    return { success: true };
  },
});

// Set coaching style
export const setCoachingStyle = mutation({
  args: {
    userId: v.id("users"),
    style: v.union(
      v.literal("gentle"),
      v.literal("brutal"),
      v.literal("nerdy"),
      v.literal("meme")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      coachingStyle: args.style,
      updatedAt: Date.now(),
    });
    
    return { 
      success: true,
      styleInfo: COACHING_STYLES_INFO[args.style],
    };
  },
});

// Add category to excluded list (AI won't comment on these)
export const excludeCategory = mutation({
  args: {
    userId: v.id("users"),
    categoryId: v.id("categories"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");
    
    // Check if already excluded
    if (user.excludedCategoryIds.includes(args.categoryId)) {
      return { success: true, alreadyExcluded: true };
    }
    
    await ctx.db.patch(args.userId, {
      excludedCategoryIds: [...user.excludedCategoryIds, args.categoryId],
      updatedAt: Date.now(),
    });
    
    return { success: true, alreadyExcluded: false };
  },
});

// Remove category from excluded list
export const includeCategory = mutation({
  args: {
    userId: v.id("users"),
    categoryId: v.id("categories"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");
    
    const filtered = user.excludedCategoryIds.filter(id => id !== args.categoryId);
    
    await ctx.db.patch(args.userId, {
      excludedCategoryIds: filtered,
      updatedAt: Date.now(),
    });
    
    return { success: true };
  },
});

// Get all available coaching styles
export const getCoachingStyles = query({
  args: {},
  handler: async () => {
    return Object.entries(COACHING_STYLES_INFO).map(([key, info]) => ({
      id: key,
      ...info,
    }));
  },
});

// Get user stats overview
export const getStats = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;
    
    // Count transactions
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    
    // Count active subscriptions
    const subscriptions = await ctx.db
      .query("subscriptions")
      .withIndex("by_user_status", (q) => 
        q.eq("userId", args.userId).eq("status", "active")
      )
      .collect();
    
    // Count unread insights
    const unreadInsights = await ctx.db
      .query("insights")
      .withIndex("by_user_unread", (q) => 
        q.eq("userId", args.userId).eq("isRead", false)
      )
      .collect();
    
    // Calculate this month's spending
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const thisMonthTxs = transactions.filter(t => t.date >= startOfMonth.getTime());
    const monthlySpending = thisMonthTxs
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    const monthlyIncome = thisMonthTxs
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    // Calculate member since
    const memberSinceDays = Math.floor(
      (Date.now() - user.createdAt) / (24 * 60 * 60 * 1000)
    );
    
    return {
      totalTransactions: transactions.length,
      activeSubscriptions: subscriptions.length,
      unreadInsights: unreadInsights.length,
      thisMonthSpending: Math.round(monthlySpending * 100) / 100,
      thisMonthIncome: Math.round(monthlyIncome * 100) / 100,
      thisMonthSavings: Math.round((monthlyIncome - monthlySpending) * 100) / 100,
      memberSinceDays,
      isOnboarded: user.isOnboarded,
    };
  },
});

// Update notification preferences (for future use)
export const updateNotificationPrefs = mutation({
  args: {
    userId: v.id("users"),
    // Add notification preferences as needed
    enabled: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Placeholder for notification preferences
    // Would extend the schema when implementing notifications
    return { success: true };
  },
});

// Get dashboard summary
export const getDashboardSummary = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;
    
    // Get time ranges
    const now = Date.now();
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    // Get transactions
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user_date", (q) => 
        q.eq("userId", args.userId).gte("date", startOfMonth.getTime())
      )
      .collect();
    
    const expenses = transactions.filter(t => t.type === "expense");
    
    // Calculate spending for different periods
    const todaySpending = expenses
      .filter(t => t.date >= startOfDay.getTime())
      .reduce((sum, t) => sum + t.amount, 0);
    
    const weekSpending = expenses
      .filter(t => t.date >= startOfWeek.getTime())
      .reduce((sum, t) => sum + t.amount, 0);
    
    const monthSpending = expenses.reduce((sum, t) => sum + t.amount, 0);
    
    // Get latest insight
    const latestInsight = await ctx.db
      .query("insights")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .first();
    
    // Get active mode
    const activeMode = await ctx.db
      .query("spendingModes")
      .withIndex("by_user_active", (q) => 
        q.eq("userId", args.userId).eq("isActive", true)
      )
      .first();
    
    // Get top category this month
    const categoryTotals = new Map<string, { id: Id<"categories"> | null; amount: number }>();
    for (const tx of expenses) {
      const key = tx.categoryId?.toString() ?? "uncategorized";
      const existing = categoryTotals.get(key);
      if (existing) {
        existing.amount += tx.amount;
      } else {
        categoryTotals.set(key, { id: tx.categoryId ?? null, amount: tx.amount });
      }
    }
    
    const topCategoryEntry = Array.from(categoryTotals.entries())
      .sort((a, b) => b[1].amount - a[1].amount)[0];
    
    let topCategory = null;
    if (topCategoryEntry && topCategoryEntry[1].id) {
      const cat = await ctx.db.get(topCategoryEntry[1].id);
      if (cat) {
        topCategory = {
          name: cat.name,
          icon: cat.icon,
          amount: Math.round(topCategoryEntry[1].amount * 100) / 100,
        };
      }
    }
    
    return {
      user: {
        name: user.name,
        coachingStyle: user.coachingStyle,
        currency: user.currency,
      },
      spending: {
        today: Math.round(todaySpending * 100) / 100,
        week: Math.round(weekSpending * 100) / 100,
        month: Math.round(monthSpending * 100) / 100,
      },
      activeMode: activeMode ? {
        mode: activeMode.mode,
        expiresAt: activeMode.expiresAt,
      } : {
        mode: user.activeMode,
        expiresAt: user.modeExpiresAt,
      },
      latestInsight: latestInsight ? {
        id: latestInsight._id,
        title: latestInsight.title,
        message: latestInsight.message,
        type: latestInsight.type,
        severity: latestInsight.severity,
        isRead: latestInsight.isRead,
      } : null,
      topCategory,
    };
  },
});

// Search users (admin function - for future multi-user features)
export const search = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    const searchLower = args.query.toLowerCase();
    
    // Simple search - in production would use proper full-text search
    const users = await ctx.db.query("users").take(100);
    
    const matches = users
      .filter(u => 
        u.email.toLowerCase().includes(searchLower) ||
        u.name?.toLowerCase().includes(searchLower)
      )
      .slice(0, limit)
      .map(u => ({
        id: u._id,
        email: u.email,
        name: u.name,
        createdAt: u.createdAt,
      }));
    
    return matches;
  },
});

// Get categories for user (including custom ones)
export const getCategories = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Get system categories
    const systemCategories = await ctx.db
      .query("categories")
      .withIndex("by_type", (q) => q.eq("type", "system"))
      .collect();
    
    // Get user's custom categories
    const customCategories = await ctx.db
      .query("categories")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    
    // Combine and organize
    const allCategories = [...systemCategories, ...customCategories];
    
    // Group parent and child categories
    const parentCategories = allCategories.filter(c => !c.parentId);
    
    return parentCategories.map(parent => ({
      ...parent,
      subcategories: allCategories
        .filter(c => c.parentId === parent._id)
        .map(sub => ({
          id: sub._id,
          name: sub.name,
          icon: sub.icon,
          color: sub.color,
        })),
    }));
  },
});

// Create custom category
export const createCategory = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    icon: v.string(),
    color: v.string(),
    parentId: v.optional(v.id("categories")),
  },
  handler: async (ctx, args) => {
    const categoryId = await ctx.db.insert("categories", {
      name: args.name,
      icon: args.icon,
      color: args.color,
      type: "custom",
      userId: args.userId,
      parentId: args.parentId,
      createdAt: Date.now(),
    });
    
    return categoryId;
  },
});

