import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Coaching style options
export const coachingStyles = v.union(
  v.literal("gentle"),
  v.literal("brutal"),
  v.literal("nerdy"),
  v.literal("meme")
);

// Spending mode options
export const spendingModes = v.union(
  v.literal("normal"),
  v.literal("yolo"),
  v.literal("broke"),
  v.literal("vacation")
);

// Transaction type
export const transactionType = v.union(
  v.literal("expense"),
  v.literal("income"),
  v.literal("transfer")
);

// Subscription frequency
export const subscriptionFrequency = v.union(
  v.literal("weekly"),
  v.literal("monthly"),
  v.literal("quarterly"),
  v.literal("yearly")
);

// Subscription status
export const subscriptionStatus = v.union(
  v.literal("active"),
  v.literal("cancelled"),
  v.literal("ignored"),
  v.literal("pending")
);

// Insight types
export const insightType = v.union(
  v.literal("spending_spike"),
  v.literal("subscription_waste"),
  v.literal("peer_comparison"),
  v.literal("goal_progress"),
  v.literal("pattern_detected"),
  v.literal("savings_opportunity"),
  v.literal("weekly_summary")
);

// Insight severity
export const insightSeverity = v.union(
  v.literal("info"),
  v.literal("warning"),
  v.literal("alert"),
  v.literal("celebration")
);

// Category type
export const categoryType = v.union(
  v.literal("system"),
  v.literal("custom")
);

export default defineSchema({
  // Users table - profiles and preferences
  users: defineTable({
    // Auth identity (from Convex Auth)
    tokenIdentifier: v.optional(v.string()),
    email: v.string(),
    name: v.optional(v.string()),
    
    // Profile info for benchmarks
    age: v.optional(v.number()),
    city: v.optional(v.string()),
    country: v.optional(v.string()),
    
    // Financial info
    currency: v.string(),
    monthlyIncome: v.optional(v.number()),
    
    // Preferences
    coachingStyle: coachingStyles,
    activeMode: spendingModes,
    modeExpiresAt: v.optional(v.number()), // timestamp when mode reverts to normal
    
    // Categories excluded from AI judgment
    excludedCategoryIds: v.array(v.id("categories")),
    
    // Onboarding
    isOnboarded: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_token", ["tokenIdentifier"]),

  // Categories table - spending categories
  categories: defineTable({
    name: v.string(),
    icon: v.string(), // emoji or icon name
    color: v.string(), // hex color
    type: categoryType,
    parentId: v.optional(v.id("categories")), // for sub-categories
    userId: v.optional(v.id("users")), // null for system categories
    createdAt: v.number(),
  })
    .index("by_type", ["type"])
    .index("by_user", ["userId"])
    .index("by_parent", ["parentId"]),

  // Merchants table - known merchants
  merchants: defineTable({
    name: v.string(),
    normalizedName: v.string(), // lowercase, trimmed for matching
    defaultCategoryId: v.optional(v.id("categories")),
    logo: v.optional(v.string()), // URL or storage ID
    isSubscription: v.boolean(), // likely a subscription service
    createdAt: v.number(),
  })
    .index("by_normalized_name", ["normalizedName"])
    .index("by_category", ["defaultCategoryId"]),

  // Transactions table - all financial transactions
  transactions: defineTable({
    userId: v.id("users"),
    
    // Core transaction data
    amount: v.number(), // positive = expense, negative = income (or use type)
    type: transactionType,
    description: v.string(),
    
    // Categorization
    categoryId: v.optional(v.id("categories")),
    merchantId: v.optional(v.id("merchants")),
    merchantName: v.string(), // raw merchant name from transaction
    
    // Metadata
    date: v.number(), // timestamp of transaction
    isRecurring: v.boolean(),
    isExcludedFromInsights: v.boolean(),
    
    // User feedback
    userCategorized: v.boolean(), // did user manually set category?
    markedAsRegret: v.boolean(), // user regretted this purchase
    
    // Source info
    sourceId: v.optional(v.string()), // external ID if from bank import
    notes: v.optional(v.string()),
    
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_date", ["userId", "date"])
    .index("by_user_category", ["userId", "categoryId"])
    .index("by_user_merchant", ["userId", "merchantId"])
    .index("by_merchant_name", ["userId", "merchantName"])
    .index("by_source", ["userId", "sourceId"]),

  // Subscriptions table - detected recurring payments
  subscriptions: defineTable({
    userId: v.id("users"),
    merchantId: v.optional(v.id("merchants")),
    merchantName: v.string(),
    categoryId: v.optional(v.id("categories")),
    
    // Subscription details
    amount: v.number(),
    frequency: subscriptionFrequency,
    status: subscriptionStatus,
    
    // Tracking
    lastChargeDate: v.number(),
    nextExpectedDate: v.number(),
    
    // Usage tracking (for optimization suggestions)
    usageScore: v.optional(v.number()), // 0-100, how much they use it
    lastUsageCheck: v.optional(v.number()),
    
    // Linked transactions
    transactionIds: v.array(v.id("transactions")),
    
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_status", ["userId", "status"])
    .index("by_merchant", ["merchantId"]),

  // Insights table - AI-generated coaching messages
  insights: defineTable({
    userId: v.id("users"),
    
    // Insight content
    type: insightType,
    title: v.string(),
    message: v.string(),
    severity: insightSeverity,
    
    // Related data
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
    
    // User interaction
    isRead: v.boolean(),
    isDismissed: v.boolean(),
    actionTaken: v.optional(v.string()), // what action user took if any
    
    // Timing
    expiresAt: v.optional(v.number()), // some insights are time-sensitive
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_unread", ["userId", "isRead"])
    .index("by_user_type", ["userId", "type"])
    .index("by_created", ["createdAt"]),

  // Benchmarks table - anonymized peer spending data
  benchmarks: defineTable({
    categoryId: v.id("categories"),
    
    // Demographic segments
    ageGroup: v.string(), // "18-24", "25-34", etc.
    incomeRange: v.string(), // "0-30k", "30k-50k", etc.
    city: v.optional(v.string()),
    country: v.string(),
    
    // Aggregated data
    avgMonthlySpend: v.number(),
    medianMonthlySpend: v.number(),
    percentile25: v.number(),
    percentile75: v.number(),
    sampleSize: v.number(),
    
    // Time period
    month: v.number(), // YYYYMM format
    updatedAt: v.number(),
  })
    .index("by_category", ["categoryId"])
    .index("by_segment", ["categoryId", "ageGroup", "incomeRange", "country"])
    .index("by_month", ["month"]),

  // Behavioral triggers - detected spending patterns
  behavioralTriggers: defineTable({
    userId: v.id("users"),
    
    // Trigger type
    triggerType: v.union(
      v.literal("time_of_day"),      // Late-night spending
      v.literal("day_of_week"),      // Weekend splurges
      v.literal("payday_effect"),    // Post-paycheck spending spree
      v.literal("stress_spending"),  // Multiple purchases in short time
      v.literal("category_binge"),   // Repeated spending in same category
      v.literal("merchant_habit"),   // Frequent visits to same merchant
      v.literal("end_of_month"),     // Frugal or splurge at month end
      v.literal("emotional_pattern") // Detected emotional spending
    ),
    
    // Pattern details
    pattern: v.object({
      // Time patterns
      hourStart: v.optional(v.number()),    // 0-23
      hourEnd: v.optional(v.number()),
      daysOfWeek: v.optional(v.array(v.number())), // 0=Sun, 6=Sat
      dayOfMonth: v.optional(v.number()),   // 1-31 (for payday)
      
      // Spending patterns
      categoryId: v.optional(v.id("categories")),
      merchantName: v.optional(v.string()),
      
      // Thresholds
      avgAmount: v.optional(v.number()),
      frequency: v.optional(v.number()),    // times per period
      periodDays: v.optional(v.number()),   // period length
    }),
    
    // Statistics
    occurrences: v.number(),           // How many times detected
    totalAmount: v.number(),           // Total spent during trigger
    avgPerOccurrence: v.number(),
    lastOccurrence: v.number(),
    
    // Severity and status
    severity: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    isActive: v.boolean(),             // Still occurring?
    isAcknowledged: v.boolean(),       // User has seen this
    
    // User preferences for this trigger
    nudgeEnabled: v.boolean(),
    nudgeMessage: v.optional(v.string()),
    nudgeTime: v.optional(v.number()), // When to send nudge (hour)
    
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_type", ["userId", "triggerType"])
    .index("by_user_active", ["userId", "isActive"]),

  // Nudge history - when we sent nudges and if they helped
  nudgeHistory: defineTable({
    userId: v.id("users"),
    triggerId: v.id("behavioralTriggers"),
    
    // Nudge details
    message: v.string(),
    sentAt: v.number(),
    
    // Outcome tracking
    wasOpened: v.boolean(),
    spendingAfter: v.optional(v.number()),  // Did they still spend?
    wasEffective: v.optional(v.boolean()),  // Did it prevent spending?
    
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_trigger", ["triggerId"]),

  // SpendingModes table - mode configurations and history
  spendingModes: defineTable({
    userId: v.id("users"),
    mode: spendingModes,
    
    // Mode settings
    settings: v.object({
      // Broke mode settings
      dailyLimit: v.optional(v.number()),
      blockedCategories: v.optional(v.array(v.id("categories"))),
      
      // Vacation mode settings
      tripBudget: v.optional(v.number()),
      tripName: v.optional(v.string()),
      
      // YOLO mode settings
      celebrationMessages: v.optional(v.boolean()),
    }),
    
    // Activation period
    activatedAt: v.number(),
    expiresAt: v.optional(v.number()),
    deactivatedAt: v.optional(v.number()),
    
    // Status
    isActive: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_user_active", ["userId", "isActive"]),
});

