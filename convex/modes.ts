import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

/**
 * Spending Modes module - Toggle different spending personalities.
 * 
 * YOLO Mode: AI celebrates purchases, no judgment
 * Broke Mode: Aggressive alerts, daily limits, blocked categories  
 * Vacation Mode: Relaxed tracking with trip-specific budgets
 * Normal Mode: Standard balanced coaching
 */

// Mode descriptions for UI
export const MODE_INFO = {
  normal: {
    name: "Normal",
    description: "Balanced coaching with helpful insights",
    icon: "⚖️",
    color: "#4ECDC4",
  },
  yolo: {
    name: "YOLO Mode",
    description: "No judgment, just vibes. AI celebrates your purchases.",
    icon: "👑",
    color: "#FFD700",
  },
  broke: {
    name: "Broke Mode", 
    description: "Aggressive spending limits and alerts. Serious savings.",
    icon: "🔒",
    color: "#FF6B6B",
  },
  vacation: {
    name: "Vacation Mode",
    description: "Relaxed tracking with a dedicated trip budget.",
    icon: "🏖️",
    color: "#45B7D1",
  },
};

// Get current active mode
export const getCurrentMode = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;
    
    // Check for active spending mode override
    const activeMode = await ctx.db
      .query("spendingModes")
      .withIndex("by_user_active", (q) => 
        q.eq("userId", args.userId).eq("isActive", true)
      )
      .first();
    
    // Check if mode has expired
    if (activeMode && activeMode.expiresAt && activeMode.expiresAt < Date.now()) {
      // Mode expired - will be deactivated by cron, but return normal for now
      return {
        mode: "normal" as const,
        modeInfo: MODE_INFO.normal,
        settings: {},
        expiresAt: null,
        activatedAt: null,
      };
    }
    
    if (activeMode) {
      return {
        mode: activeMode.mode,
        modeInfo: MODE_INFO[activeMode.mode],
        settings: activeMode.settings,
        expiresAt: activeMode.expiresAt,
        activatedAt: activeMode.activatedAt,
      };
    }
    
    // Default to user's base mode
    return {
      mode: user.activeMode,
      modeInfo: MODE_INFO[user.activeMode],
      settings: {},
      expiresAt: user.modeExpiresAt,
      activatedAt: null,
    };
  },
});

// Set spending mode
export const setMode = mutation({
  args: {
    userId: v.id("users"),
    mode: v.union(
      v.literal("normal"),
      v.literal("yolo"),
      v.literal("broke"),
      v.literal("vacation")
    ),
    settings: v.optional(
      v.object({
        // Broke mode settings
        dailyLimit: v.optional(v.number()),
        blockedCategories: v.optional(v.array(v.id("categories"))),
        
        // Vacation mode settings
        tripBudget: v.optional(v.number()),
        tripName: v.optional(v.string()),
        
        // YOLO mode settings
        celebrationMessages: v.optional(v.boolean()),
      })
    ),
    expiresAt: v.optional(v.number()), // When mode should auto-revert
    duration: v.optional(v.number()), // Alternative: duration in days
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Calculate expiry
    let expiresAt = args.expiresAt;
    if (!expiresAt && args.duration) {
      expiresAt = now + args.duration * 24 * 60 * 60 * 1000;
    }
    
    // Deactivate any current active mode
    const currentModes = await ctx.db
      .query("spendingModes")
      .withIndex("by_user_active", (q) => 
        q.eq("userId", args.userId).eq("isActive", true)
      )
      .collect();
    
    for (const mode of currentModes) {
      await ctx.db.patch(mode._id, {
        isActive: false,
        deactivatedAt: now,
      });
    }
    
    // If setting to normal, just update user and return
    if (args.mode === "normal") {
      await ctx.db.patch(args.userId, {
        activeMode: "normal",
        modeExpiresAt: undefined,
        updatedAt: now,
      });
      
      return { success: true, mode: "normal" };
    }
    
    // Create new spending mode record
    const modeId = await ctx.db.insert("spendingModes", {
      userId: args.userId,
      mode: args.mode,
      settings: args.settings ?? {},
      activatedAt: now,
      expiresAt,
      isActive: true,
    });
    
    // Update user's active mode
    await ctx.db.patch(args.userId, {
      activeMode: args.mode,
      modeExpiresAt: expiresAt,
      updatedAt: now,
    });
    
    return { success: true, mode: args.mode, modeId };
  },
});

// Quick toggle YOLO mode
export const toggleYoloMode = mutation({
  args: {
    userId: v.id("users"),
    enable: v.boolean(),
    duration: v.optional(v.number()), // Days (default: 1)
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    if (!args.enable) {
      // Disable - revert to normal
      const currentModes = await ctx.db
        .query("spendingModes")
        .withIndex("by_user_active", (q) => 
          q.eq("userId", args.userId).eq("isActive", true)
        )
        .collect();
      
      for (const mode of currentModes) {
        await ctx.db.patch(mode._id, {
          isActive: false,
          deactivatedAt: now,
        });
      }
      
      await ctx.db.patch(args.userId, {
        activeMode: "normal",
        modeExpiresAt: undefined,
        updatedAt: now,
      });
      
      return { success: true, mode: "normal" };
    }
    
    // Enable YOLO mode
    const duration = args.duration ?? 1; // Default 1 day
    const expiresAt = now + duration * 24 * 60 * 60 * 1000;
    
    // Deactivate current modes
    const currentModes = await ctx.db
      .query("spendingModes")
      .withIndex("by_user_active", (q) => 
        q.eq("userId", args.userId).eq("isActive", true)
      )
      .collect();
    
    for (const mode of currentModes) {
      await ctx.db.patch(mode._id, {
        isActive: false,
        deactivatedAt: now,
      });
    }
    
    await ctx.db.insert("spendingModes", {
      userId: args.userId,
      mode: "yolo",
      settings: { celebrationMessages: true },
      activatedAt: now,
      expiresAt,
      isActive: true,
    });
    
    await ctx.db.patch(args.userId, {
      activeMode: "yolo",
      modeExpiresAt: expiresAt,
      updatedAt: now,
    });
    
    return { success: true, mode: "yolo", expiresAt };
  },
});

// Activate broke mode with settings
export const activateBrokeMode = mutation({
  args: {
    userId: v.id("users"),
    dailyLimit: v.number(),
    blockedCategories: v.optional(v.array(v.id("categories"))),
    duration: v.optional(v.number()), // Days (default: 30)
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const duration = args.duration ?? 30;
    const expiresAt = now + duration * 24 * 60 * 60 * 1000;
    
    // Deactivate current modes
    const currentModes = await ctx.db
      .query("spendingModes")
      .withIndex("by_user_active", (q) => 
        q.eq("userId", args.userId).eq("isActive", true)
      )
      .collect();
    
    for (const mode of currentModes) {
      await ctx.db.patch(mode._id, {
        isActive: false,
        deactivatedAt: now,
      });
    }
    
    await ctx.db.insert("spendingModes", {
      userId: args.userId,
      mode: "broke",
      settings: {
        dailyLimit: args.dailyLimit,
        blockedCategories: args.blockedCategories,
      },
      activatedAt: now,
      expiresAt,
      isActive: true,
    });
    
    await ctx.db.patch(args.userId, {
      activeMode: "broke",
      modeExpiresAt: expiresAt,
      updatedAt: now,
    });
    
    return { 
      success: true, 
      mode: "broke",
      dailyLimit: args.dailyLimit,
      expiresAt,
    };
  },
});

// Start vacation mode with trip budget
export const startVacationMode = mutation({
  args: {
    userId: v.id("users"),
    tripName: v.string(),
    tripBudget: v.number(),
    endDate: v.number(), // When vacation ends
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Deactivate current modes
    const currentModes = await ctx.db
      .query("spendingModes")
      .withIndex("by_user_active", (q) => 
        q.eq("userId", args.userId).eq("isActive", true)
      )
      .collect();
    
    for (const mode of currentModes) {
      await ctx.db.patch(mode._id, {
        isActive: false,
        deactivatedAt: now,
      });
    }
    
    await ctx.db.insert("spendingModes", {
      userId: args.userId,
      mode: "vacation",
      settings: {
        tripName: args.tripName,
        tripBudget: args.tripBudget,
      },
      activatedAt: now,
      expiresAt: args.endDate,
      isActive: true,
    });
    
    await ctx.db.patch(args.userId, {
      activeMode: "vacation",
      modeExpiresAt: args.endDate,
      updatedAt: now,
    });
    
    return { 
      success: true, 
      mode: "vacation",
      tripName: args.tripName,
      tripBudget: args.tripBudget,
      endsAt: args.endDate,
    };
  },
});

// Get vacation mode spending progress
export const getVacationProgress = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const activeMode = await ctx.db
      .query("spendingModes")
      .withIndex("by_user_active", (q) => 
        q.eq("userId", args.userId).eq("isActive", true)
      )
      .first();
    
    if (!activeMode || activeMode.mode !== "vacation") {
      return null;
    }
    
    const tripBudget = activeMode.settings.tripBudget ?? 0;
    const tripName = activeMode.settings.tripName ?? "Trip";
    
    // Get spending since vacation started
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user_date", (q) => 
        q.eq("userId", args.userId).gte("date", activeMode.activatedAt)
      )
      .collect();
    
    const spent = transactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    
    const remaining = tripBudget - spent;
    const percentUsed = tripBudget > 0 ? (spent / tripBudget) * 100 : 0;
    
    // Calculate daily budget remaining
    const daysRemaining = activeMode.expiresAt 
      ? Math.max(1, Math.ceil((activeMode.expiresAt - Date.now()) / (24 * 60 * 60 * 1000)))
      : 1;
    const dailyBudget = remaining > 0 ? remaining / daysRemaining : 0;
    
    return {
      tripName,
      tripBudget,
      spent: Math.round(spent * 100) / 100,
      remaining: Math.round(remaining * 100) / 100,
      percentUsed: Math.round(percentUsed),
      daysRemaining,
      dailyBudget: Math.round(dailyBudget * 100) / 100,
      isOverBudget: remaining < 0,
      activatedAt: activeMode.activatedAt,
      endsAt: activeMode.expiresAt,
    };
  },
});

// Get broke mode status
export const getBrokeModeStatus = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const activeMode = await ctx.db
      .query("spendingModes")
      .withIndex("by_user_active", (q) => 
        q.eq("userId", args.userId).eq("isActive", true)
      )
      .first();
    
    if (!activeMode || activeMode.mode !== "broke") {
      return null;
    }
    
    const dailyLimit = activeMode.settings.dailyLimit ?? 50;
    const blockedCategories = activeMode.settings.blockedCategories ?? [];
    
    // Get today's spending
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    const todaysTxs = await ctx.db
      .query("transactions")
      .withIndex("by_user_date", (q) => 
        q.eq("userId", args.userId).gte("date", startOfDay.getTime())
      )
      .collect();
    
    const todaySpent = todaysTxs
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    
    const remaining = dailyLimit - todaySpent;
    const percentUsed = (todaySpent / dailyLimit) * 100;
    
    // Get blocked category details
    const blockedCategoryDetails = await Promise.all(
      blockedCategories.map(async (catId) => {
        const cat = await ctx.db.get(catId);
        return cat ? { id: cat._id, name: cat.name, icon: cat.icon } : null;
      })
    );
    
    // Calculate streak (days under limit)
    let streak = 0;
    const msPerDay = 24 * 60 * 60 * 1000;
    
    for (let i = 1; i <= 30; i++) {
      const dayStart = startOfDay.getTime() - i * msPerDay;
      const dayEnd = dayStart + msPerDay;
      
      const dayTxs = await ctx.db
        .query("transactions")
        .withIndex("by_user_date", (q) => 
          q.eq("userId", args.userId)
            .gte("date", dayStart)
            .lt("date", dayEnd)
        )
        .collect();
      
      const daySpent = dayTxs
        .filter(t => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);
      
      if (daySpent <= dailyLimit) {
        streak++;
      } else {
        break;
      }
    }
    
    return {
      dailyLimit,
      todaySpent: Math.round(todaySpent * 100) / 100,
      remaining: Math.round(remaining * 100) / 100,
      percentUsed: Math.round(percentUsed),
      isOverLimit: remaining < 0,
      blockedCategories: blockedCategoryDetails.filter(Boolean),
      streak,
      activatedAt: activeMode.activatedAt,
      expiresAt: activeMode.expiresAt,
    };
  },
});

// Check if a purchase is allowed (for broke mode)
export const checkPurchaseAllowed = query({
  args: {
    userId: v.id("users"),
    amount: v.number(),
    categoryId: v.optional(v.id("categories")),
  },
  handler: async (ctx, args) => {
    const activeMode = await ctx.db
      .query("spendingModes")
      .withIndex("by_user_active", (q) => 
        q.eq("userId", args.userId).eq("isActive", true)
      )
      .first();
    
    // Not in broke mode - allow everything
    if (!activeMode || activeMode.mode !== "broke") {
      return { allowed: true, reason: null };
    }
    
    const dailyLimit = activeMode.settings.dailyLimit ?? 50;
    const blockedCategories = activeMode.settings.blockedCategories ?? [];
    
    // Check if category is blocked
    if (args.categoryId && blockedCategories.includes(args.categoryId)) {
      const category = await ctx.db.get(args.categoryId);
      return {
        allowed: false,
        reason: `${category?.name ?? "This category"} is blocked in Broke Mode`,
        suggestion: "Switch to Normal mode or wait until Broke Mode expires",
      };
    }
    
    // Check daily limit
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    const todaysTxs = await ctx.db
      .query("transactions")
      .withIndex("by_user_date", (q) => 
        q.eq("userId", args.userId).gte("date", startOfDay.getTime())
      )
      .collect();
    
    const todaySpent = todaysTxs
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    
    const remaining = dailyLimit - todaySpent;
    
    if (args.amount > remaining) {
      return {
        allowed: false,
        reason: `This would exceed your daily limit. You have $${remaining.toFixed(2)} remaining.`,
        suggestion: remaining > 0 
          ? `Consider a purchase under $${remaining.toFixed(2)}`
          : "Wait until tomorrow for more budget",
      };
    }
    
    return { 
      allowed: true, 
      reason: null,
      remainingAfter: Math.round((remaining - args.amount) * 100) / 100,
    };
  },
});

// Get mode history
export const getModeHistory = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    
    const modes = await ctx.db
      .query("spendingModes")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit);
    
    return modes.map(m => ({
      mode: m.mode,
      modeInfo: MODE_INFO[m.mode],
      settings: m.settings,
      activatedAt: m.activatedAt,
      deactivatedAt: m.deactivatedAt,
      expiresAt: m.expiresAt,
      wasActive: m.isActive,
      duration: m.deactivatedAt 
        ? m.deactivatedAt - m.activatedAt
        : m.expiresAt 
          ? m.expiresAt - m.activatedAt
          : null,
    }));
  },
});

// Internal mutation to expire modes (called by cron)
export const expireModes = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    
    // Find all active modes that have expired
    const activeModes = await ctx.db
      .query("spendingModes")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
    
    let expired = 0;
    
    for (const mode of activeModes) {
      if (mode.expiresAt && mode.expiresAt < now) {
        // Deactivate the mode
        await ctx.db.patch(mode._id, {
          isActive: false,
          deactivatedAt: now,
        });
        
        // Reset user to normal mode
        await ctx.db.patch(mode.userId, {
          activeMode: "normal",
          modeExpiresAt: undefined,
          updatedAt: now,
        });
        
        expired++;
      }
    }
    
    return { expired };
  },
});

// Get AI personality based on current mode
export const getAIPersonality = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;
    
    const activeMode = await ctx.db
      .query("spendingModes")
      .withIndex("by_user_active", (q) => 
        q.eq("userId", args.userId).eq("isActive", true)
      )
      .first();
    
    const mode = activeMode?.mode ?? user.activeMode;
    const coachingStyle = user.coachingStyle;
    
    // Mode overrides affect AI personality
    const personalities = {
      normal: {
        tone: "balanced",
        judgmentLevel: "moderate",
        celebrateWins: true,
        callOutOverspending: true,
        messageFrequency: "normal",
      },
      yolo: {
        tone: "celebratory",
        judgmentLevel: "none",
        celebrateWins: true,
        callOutOverspending: false,
        messageFrequency: "low",
        specialMessages: [
          "Treat yourself! 👑",
          "Living your best life!",
          "Money is meant to be enjoyed!",
        ],
      },
      broke: {
        tone: "strict",
        judgmentLevel: "high",
        celebrateWins: true,
        callOutOverspending: true,
        messageFrequency: "high",
        specialMessages: [
          "Every dollar counts!",
          "Stay strong!",
          "Future you will thank you!",
        ],
      },
      vacation: {
        tone: "relaxed",
        judgmentLevel: "low",
        celebrateWins: true,
        callOutOverspending: false,
        messageFrequency: "low",
        specialMessages: [
          "Enjoy your trip!",
          "Making memories!",
          "You deserve this!",
        ],
      },
    };
    
    return {
      mode,
      coachingStyle,
      personality: personalities[mode],
      modeInfo: MODE_INFO[mode],
    };
  },
});

