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

// ==================== MALAYSIAN SHARIAH COMPLIANCE TYPES ====================

// Shariah compliance status
export const shariahComplianceStatus = v.union(
  v.literal("halal"),
  v.literal("haram"),
  v.literal("doubtful"),
  v.literal("pending_review")
);

// Haram categories based on Islamic fiqh
export const haramCategory = v.union(
  v.literal("riba"),              // Interest/usury
  v.literal("gharar"),            // Excessive uncertainty
  v.literal("maysir"),            // Gambling
  v.literal("haram_goods"),       // Alcohol, pork, etc.
  v.literal("unethical_business") // Weapons, tobacco, etc.
);

// Zakat asset categories
export const zakatAssetType = v.union(
  v.literal("cash"),
  v.literal("gold"),
  v.literal("silver"),
  v.literal("business"),
  v.literal("investments"),
  v.literal("rental"),
  v.literal("epf")
);

// Asnaf categories (8 recipients of Zakat)
export const asnafCategory = v.union(
  v.literal("fakir"),         // The poor
  v.literal("miskin"),        // The needy
  v.literal("amil"),          // Zakat administrators
  v.literal("muallaf"),       // New Muslims
  v.literal("riqab"),         // Freeing captives
  v.literal("gharimin"),      // Those in debt
  v.literal("fisabilillah"),  // In the cause of Allah
  v.literal("ibnu_sabil")     // Stranded travellers
);

// Agent types for message bus
export const agentType = v.union(
  v.literal("CASHFLOW_AGENT"),
  v.literal("INDUSTRY_RISK_AGENT"),
  v.literal("SHARIAH_COMPLIANCE_AGENT"),
  v.literal("ZAKAT_AGENT"),
  v.literal("HAJJ_SAVINGS_AGENT"),
  v.literal("ORCHESTRATOR")
);

// Industry alert types
export const industryAlertType = v.union(
  v.literal("commodity_price"),
  v.literal("market_trend"),
  v.literal("foot_traffic"),
  v.literal("regulatory"),
  v.literal("competition"),
  v.literal("supply_chain"),
  v.literal("economic_indicator")
);

// Riba source types
export const ribaSourceType = v.union(
  v.literal("bank_interest"),
  v.literal("credit_card_interest"),
  v.literal("loan_interest"),
  v.literal("investment_dividend"),
  v.literal("late_payment_fee")
);

// Hajj contribution source
export const hajjContributionSource = v.union(
  v.literal("manual"),
  v.literal("auto_transfer"),
  v.literal("bonus"),
  v.literal("salary_deduction"),
  v.literal("tabung_haji_hibah")
);

// Hajj registration status
export const hajjRegistrationStatus = v.union(
  v.literal("not_registered"),
  v.literal("registered"),
  v.literal("in_queue"),
  v.literal("confirmed"),
  v.literal("completed")
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
    
    // Shariah compliance (AI-powered)
    shariahStatus: v.optional(shariahComplianceStatus), // halal, haram, doubtful, pending_review
    shariahReason: v.optional(v.string()), // reason for the status
    
    // Source info
    sourceId: v.optional(v.string()), // external ID if from bank import
    notes: v.optional(v.string()),
    
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_date", ["userId", "date"])
    .index("by_shariah_status", ["userId", "shariahStatus"])
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

  // ==================== MALAYSIAN SHARIAH COMPLIANCE TABLES ====================

  // Cashflow analysis - periodic financial health metrics
  cashflowAnalysis: defineTable({
    userId: v.id("users"),

    // Time period
    periodStart: v.number(),
    periodEnd: v.number(),
    periodType: v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly")),

    // Core metrics
    burnRate: v.number(),                    // Monthly burn rate in MYR
    burnRateTrend: v.number(),               // % change from previous period
    savingsRate: v.number(),                 // Savings as % of income
    debtToIncomeRatio: v.number(),           // DTI ratio (0-1)
    liquidityRatio: v.number(),              // Liquid assets / monthly expenses
    emergencyFundMonths: v.number(),         // Months of expenses covered

    // Income breakdown
    incomeBreakdown: v.object({
      salary: v.number(),
      business: v.number(),
      investments: v.number(),
      rental: v.number(),
      other: v.number(),
    }),

    // Expense breakdown
    expenseBreakdown: v.object({
      essential: v.number(),
      discretionary: v.number(),
      debtPayments: v.number(),
      religiousObligations: v.number(),      // Zakat, sadaqah
      savings: v.number(),
    }),

    // Predictions
    projectedBalance30Days: v.number(),
    projectedBalance90Days: v.number(),
    runwayDays: v.optional(v.number()),      // Days until funds depleted
    riskLevel: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),

    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_period", ["userId", "periodType"]),

  // Malaysian bank connections
  bankConnections: defineTable({
    userId: v.id("users"),

    // Malaysian bank specifics
    bankCode: v.string(),                    // e.g., "MBB", "CIMB", "BIMB"
    bankName: v.string(),
    accountNumberMasked: v.string(),         // Last 4 digits only
    accountType: v.union(
      v.literal("savings"),
      v.literal("current"),
      v.literal("fixed_deposit"),
      v.literal("investment")
    ),
    isIslamicAccount: v.boolean(),           // Bank Islam, MBSB, etc.

    // Connection status
    connectionStatus: v.union(
      v.literal("active"),
      v.literal("expired"),
      v.literal("error"),
      v.literal("pending")
    ),
    lastSyncAt: v.optional(v.number()),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_bank", ["bankCode"]),

  // Industry risk profiles for business owners
  industryRiskProfiles: defineTable({
    userId: v.id("users"),

    // Business profile
    businessType: v.string(),                // e.g., "coffee_shop", "retail"
    industry: v.string(),                    // MSIC code or category
    state: v.string(),                       // Malaysian state
    city: v.string(),
    postcode: v.optional(v.string()),
    monthlyRevenue: v.optional(v.number()),
    employeeCount: v.optional(v.number()),

    // Investment profile
    investmentSectors: v.array(v.string()),
    riskTolerance: v.union(v.literal("conservative"), v.literal("moderate"), v.literal("aggressive")),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"]),

  // Industry alerts from external data
  industryAlerts: defineTable({
    userId: v.id("users"),

    // Alert details
    alertType: industryAlertType,
    title: v.string(),
    description: v.string(),
    severity: v.union(v.literal("info"), v.literal("warning"), v.literal("critical")),

    // Data source
    sourceName: v.string(),                  // e.g., "Bing Search", "BNM"
    sourceUrl: v.optional(v.string()),
    fetchedAt: v.number(),

    // Actionable insights
    recommendation: v.optional(v.string()),
    revenueImpactPercent: v.optional(v.number()),
    costImpactPercent: v.optional(v.number()),

    // Status
    isRead: v.boolean(),
    isDismissed: v.boolean(),

    createdAt: v.number(),
    expiresAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_user_unread", ["userId", "isRead"]),

  // Merchant Shariah status database
  merchantShariahStatus: defineTable({
    merchantName: v.string(),
    normalizedName: v.string(),

    // Compliance status
    complianceStatus: shariahComplianceStatus,
    haramCategories: v.optional(v.array(haramCategory)),

    // JAKIM Halal certification
    jakimCertified: v.boolean(),
    jakimCertNumber: v.optional(v.string()),
    jakimValidUntil: v.optional(v.number()),

    // Review details
    lastReviewedAt: v.number(),
    reviewedBy: v.union(v.literal("system"), v.literal("manual"), v.literal("ai")),
    reviewNotes: v.optional(v.string()),

    // Community feedback
    userReportsHalal: v.number(),
    userReportsHaram: v.number(),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_normalized_name", ["normalizedName"])
    .index("by_compliance_status", ["complianceStatus"]),

  // Per-transaction compliance checks
  transactionComplianceChecks: defineTable({
    transactionId: v.id("transactions"),
    userId: v.id("users"),

    // Overall status
    overallStatus: shariahComplianceStatus,

    // Individual checks
    merchantHalalCheck: v.optional(v.object({
      passed: v.boolean(),
      confidence: v.number(),
      details: v.optional(v.string()),
    })),
    ribaCheck: v.optional(v.object({
      passed: v.boolean(),
      ribaAmount: v.optional(v.number()),
      details: v.optional(v.string()),
    })),
    haramGoodsCheck: v.optional(v.object({
      passed: v.boolean(),
      detectedKeywords: v.optional(v.array(v.string())),
      details: v.optional(v.string()),
    })),

    // AI analysis
    aiReasoning: v.optional(v.string()),
    islamicRulingRef: v.optional(v.string()),  // Reference to fiqh chapter

    // User action
    userAcknowledged: v.boolean(),
    userOverride: v.optional(v.string()),

    createdAt: v.number(),
  })
    .index("by_transaction", ["transactionId"])
    .index("by_user", ["userId"])
    .index("by_user_status", ["userId", "overallStatus"]),

  // Riba (interest) tracking for purification
  ribaTracking: defineTable({
    userId: v.id("users"),

    // Source of riba
    sourceType: ribaSourceType,
    sourceName: v.string(),                  // Bank name, card name, etc.

    // Amount details
    amount: v.number(),
    transactionId: v.optional(v.id("transactions")),

    // Period
    periodStart: v.number(),
    periodEnd: v.number(),

    // Purification status
    purificationStatus: v.union(
      v.literal("pending"),
      v.literal("purified"),
      v.literal("excluded")
    ),
    purifiedAt: v.optional(v.number()),
    donationRecipient: v.optional(v.string()),

    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_status", ["userId", "purificationStatus"]),

  // Zakat calculations - annual/periodic
  zakatCalculations: defineTable({
    userId: v.id("users"),

    // Calculation period (Haul - Islamic year)
    haulStartDate: v.number(),
    haulEndDate: v.number(),
    calculationDate: v.number(),

    // Assets
    assets: v.object({
      cash: v.number(),
      gold: v.object({
        weightGrams: v.number(),
        valuePerGram: v.number(),
        totalValue: v.number(),
      }),
      silver: v.object({
        weightGrams: v.number(),
        valuePerGram: v.number(),
        totalValue: v.number(),
      }),
      businessAssets: v.number(),
      investments: v.number(),              // Shariah-compliant only
      epf: v.optional(v.number()),
      tabungHaji: v.optional(v.number()),
      otherAssets: v.number(),
    }),

    // Liabilities (deductions)
    immediateDebts: v.number(),
    basicLivingNeeds: v.number(),

    // Nisab thresholds (from BNM gold prices)
    nisab: v.object({
      goldNisab: v.number(),                // 85g gold value in MYR
      silverNisab: v.number(),              // 595g silver value in MYR
      appliedNisab: v.number(),             // Which one used (lower)
      priceDate: v.number(),
    }),

    // Calculation results
    totalZakatableAssets: v.number(),
    totalDeductions: v.number(),
    netZakatableWealth: v.number(),
    isAboveNisab: v.boolean(),
    zakatRate: v.number(),                  // 2.5% = 0.025
    zakatAmount: v.number(),                // Final zakat due

    // Payment tracking
    paymentStatus: v.union(
      v.literal("not_due"),
      v.literal("pending"),
      v.literal("partial"),
      v.literal("paid"),
      v.literal("overpaid")
    ),
    amountPaid: v.number(),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_year", ["userId", "haulStartDate"]),

  // Zakat distribution records
  zakatDistributions: defineTable({
    userId: v.id("users"),
    zakatCalculationId: v.id("zakatCalculations"),

    // Distribution details
    amount: v.number(),
    asnafCategory: asnafCategory,

    // Recipient details
    recipientType: v.union(v.literal("institution"), v.literal("individual")),
    recipientName: v.string(),
    organization: v.optional(v.string()),   // e.g., "Lembaga Zakat Selangor"

    // Payment method
    paymentMethod: v.union(
      v.literal("fpx"),
      v.literal("cash"),
      v.literal("debit_card"),
      v.literal("standing_instruction")
    ),
    transactionReference: v.optional(v.string()),

    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_calculation", ["zakatCalculationId"]),

  // Malaysian state Zakat authorities
  zakatAuthorities: defineTable({
    state: v.string(),                      // Malaysian state
    name: v.string(),                       // e.g., "Lembaga Zakat Selangor"
    shortName: v.string(),                  // e.g., "LZS"
    website: v.string(),
    paymentUrl: v.optional(v.string()),
    acceptsOnlinePayment: v.boolean(),

    createdAt: v.number(),
  })
    .index("by_state", ["state"]),

  // Hajj savings goals
  hajjSavingsGoals: defineTable({
    userId: v.id("users"),

    // Goal details
    targetYear: v.number(),
    estimatedCost: v.number(),              // Based on Tabung Haji rates
    currentSavings: v.number(),

    // Tabung Haji info (manual entry)
    tabungHajiBalance: v.optional(v.number()),
    tabungHajiLastUpdated: v.optional(v.number()),
    registrationStatus: hajjRegistrationStatus,
    estimatedHajjYear: v.optional(v.number()),

    // Savings plan
    monthlyContribution: v.number(),
    contributionDay: v.number(),            // Day of month (1-28)
    isAutomated: v.boolean(),

    // Progress tracking
    onTrack: v.boolean(),
    shortfall: v.number(),                  // Amount behind schedule
    predictedCompletionDate: v.number(),    // Predicted date to reach goal

    // Milestones
    milestones: v.array(v.object({
      name: v.string(),
      targetAmount: v.number(),
      achievedAt: v.optional(v.number()),
      isAchieved: v.boolean(),
    })),

    // Notifications
    monthlyReminder: v.boolean(),
    milestoneAlerts: v.boolean(),
    incomeDetectionEnabled: v.boolean(),    // Prompt on salary deposit

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"]),

  // Hajj contribution history
  hajjContributions: defineTable({
    userId: v.id("users"),
    goalId: v.id("hajjSavingsGoals"),

    // Contribution details
    amount: v.number(),
    source: hajjContributionSource,

    // Reference
    transactionId: v.optional(v.id("transactions")),
    notes: v.optional(v.string()),

    // Balance after contribution
    runningBalance: v.number(),

    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_goal", ["goalId"]),

  // Tabung Haji packages and rates
  tabungHajiPackages: defineTable({
    year: v.number(),

    // Package types
    packageName: v.string(),
    packageType: v.union(v.literal("muassasah"), v.literal("swasta")),
    cost: v.number(),
    deposit: v.number(),
    inclusions: v.array(v.string()),

    // Hibah (profit sharing) rate
    hibahRate: v.number(),

    // Queue info
    estimatedWaitYears: v.number(),

    updatedAt: v.number(),
  })
    .index("by_year", ["year"]),

  // Inter-agent message bus
  agentMessages: defineTable({
    sourceAgent: agentType,
    targetAgent: v.union(agentType, v.literal("broadcast")),

    // Message details
    messageType: v.string(),
    payload: v.any(),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("critical")),

    // Correlation for request-response
    correlationId: v.optional(v.string()),

    // Status
    isProcessed: v.boolean(),
    processedAt: v.optional(v.number()),

    createdAt: v.number(),
    expiresAt: v.optional(v.number()),
  })
    .index("by_target", ["targetAgent", "isProcessed"])
    .index("by_correlation", ["correlationId"]),

  // Islamic rulings knowledge base (for RAG)
  islamicRulings: defineTable({
    // Source reference
    chapter: v.number(),
    chapterTitle: v.string(),
    section: v.optional(v.string()),

    // Content
    content: v.string(),
    contentEmbedding: v.optional(v.array(v.float64())),  // Vector embedding

    // Categorization
    topics: v.array(v.string()),            // e.g., ["zakat", "nisab", "gold"]

    // Metadata
    language: v.string(),                   // "en" or "ms"

    createdAt: v.number(),
  })
    .index("by_chapter", ["chapter"])
    .index("by_topics", ["topics"]),

  // Nisab price history (from BNM)
  nisabPrices: defineTable({
    date: v.number(),

    // Gold prices
    goldPricePerGram: v.number(),           // MYR
    goldNisabValue: v.number(),             // 85g in MYR

    // Silver prices
    silverPricePerGram: v.number(),         // MYR
    silverNisabValue: v.number(),           // 595g in MYR

    // Source
    source: v.string(),                     // "BNM" or "Federation of Goldsmiths"

    createdAt: v.number(),
  })
    .index("by_date", ["date"]),
});

