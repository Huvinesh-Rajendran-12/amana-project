import { v } from "convex/values";
import { mutation, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

/**
 * Seed data module for generating realistic mock financial data.
 * This creates categories, merchants, and transaction history for testing.
 */

// Default spending categories
const DEFAULT_CATEGORIES = [
  { name: "Food & Dining", icon: "🍔", color: "#FF6B6B", subcategories: ["Restaurants", "Fast Food", "Groceries", "Coffee Shops", "Bars"] },
  { name: "Transportation", icon: "🚗", color: "#4ECDC4", subcategories: ["Gas", "Uber/Lyft", "Public Transit", "Parking", "Car Maintenance"] },
  { name: "Shopping", icon: "🛍️", color: "#45B7D1", subcategories: ["Clothing", "Electronics", "Home & Garden", "Online Shopping"] },
  { name: "Entertainment", icon: "🎬", color: "#96CEB4", subcategories: ["Movies", "Games", "Concerts", "Sports", "Hobbies"] },
  { name: "Bills & Utilities", icon: "📄", color: "#FFEAA7", subcategories: ["Electricity", "Internet", "Phone", "Water", "Insurance"] },
  { name: "Subscriptions", icon: "📱", color: "#DDA0DD", subcategories: ["Streaming", "Software", "Gym", "News", "Music"] },
  { name: "Health & Fitness", icon: "💪", color: "#98D8C8", subcategories: ["Gym", "Pharmacy", "Doctor", "Supplements"] },
  { name: "Travel", icon: "✈️", color: "#F7DC6F", subcategories: ["Flights", "Hotels", "Vacation Activities"] },
  { name: "Personal Care", icon: "💅", color: "#BB8FCE", subcategories: ["Haircuts", "Skincare", "Spa"] },
  { name: "Education", icon: "📚", color: "#85C1E9", subcategories: ["Courses", "Books", "Supplies"] },
  { name: "Gifts & Donations", icon: "🎁", color: "#F1948A", subcategories: ["Gifts", "Charity"] },
  { name: "Income", icon: "💰", color: "#58D68D", subcategories: ["Salary", "Freelance", "Investments", "Refunds"] },
  { name: "Transfers", icon: "↔️", color: "#AEB6BF", subcategories: [] },
  { name: "Other", icon: "📦", color: "#BDC3C7", subcategories: [] },
];

// Common merchants with their typical categories
const MERCHANTS = [
  // Food & Dining
  { name: "Shake Shack", category: "Food & Dining", isSubscription: false },
  { name: "Chipotle", category: "Food & Dining", isSubscription: false },
  { name: "Starbucks", category: "Food & Dining", isSubscription: false },
  { name: "McDonald's", category: "Food & Dining", isSubscription: false },
  { name: "Whole Foods", category: "Food & Dining", isSubscription: false },
  { name: "Trader Joe's", category: "Food & Dining", isSubscription: false },
  { name: "Domino's Pizza", category: "Food & Dining", isSubscription: false },
  { name: "Uber Eats", category: "Food & Dining", isSubscription: false },
  { name: "DoorDash", category: "Food & Dining", isSubscription: false },
  
  // Transportation
  { name: "Uber", category: "Transportation", isSubscription: false },
  { name: "Lyft", category: "Transportation", isSubscription: false },
  { name: "Shell Gas", category: "Transportation", isSubscription: false },
  { name: "Chevron", category: "Transportation", isSubscription: false },
  { name: "City Parking", category: "Transportation", isSubscription: false },
  
  // Shopping
  { name: "Amazon", category: "Shopping", isSubscription: false },
  { name: "Target", category: "Shopping", isSubscription: false },
  { name: "Walmart", category: "Shopping", isSubscription: false },
  { name: "Apple Store", category: "Shopping", isSubscription: false },
  { name: "Best Buy", category: "Shopping", isSubscription: false },
  { name: "IKEA", category: "Shopping", isSubscription: false },
  { name: "Nike", category: "Shopping", isSubscription: false },
  { name: "Zara", category: "Shopping", isSubscription: false },
  
  // Entertainment
  { name: "AMC Theaters", category: "Entertainment", isSubscription: false },
  { name: "Steam", category: "Entertainment", isSubscription: false },
  { name: "Ticketmaster", category: "Entertainment", isSubscription: false },
  
  // Subscriptions
  { name: "Netflix", category: "Subscriptions", isSubscription: true },
  { name: "Spotify", category: "Subscriptions", isSubscription: true },
  { name: "Disney+", category: "Subscriptions", isSubscription: true },
  { name: "HBO Max", category: "Subscriptions", isSubscription: true },
  { name: "YouTube Premium", category: "Subscriptions", isSubscription: true },
  { name: "Apple Music", category: "Subscriptions", isSubscription: true },
  { name: "Amazon Prime", category: "Subscriptions", isSubscription: true },
  { name: "Hulu", category: "Subscriptions", isSubscription: true },
  { name: "Adobe Creative Cloud", category: "Subscriptions", isSubscription: true },
  { name: "Microsoft 365", category: "Subscriptions", isSubscription: true },
  { name: "iCloud Storage", category: "Subscriptions", isSubscription: true },
  { name: "Dropbox", category: "Subscriptions", isSubscription: true },
  { name: "ChatGPT Plus", category: "Subscriptions", isSubscription: true },
  { name: "Notion", category: "Subscriptions", isSubscription: true },
  { name: "Gym Membership", category: "Subscriptions", isSubscription: true },
  
  // Bills & Utilities
  { name: "Verizon", category: "Bills & Utilities", isSubscription: true },
  { name: "AT&T", category: "Bills & Utilities", isSubscription: true },
  { name: "Comcast", category: "Bills & Utilities", isSubscription: true },
  { name: "Electric Company", category: "Bills & Utilities", isSubscription: true },
  { name: "Water Utility", category: "Bills & Utilities", isSubscription: true },
  
  // Health
  { name: "CVS Pharmacy", category: "Health & Fitness", isSubscription: false },
  { name: "Walgreens", category: "Health & Fitness", isSubscription: false },
  { name: "GNC", category: "Health & Fitness", isSubscription: false },
  
  // Personal Care
  { name: "Great Clips", category: "Personal Care", isSubscription: false },
  { name: "Sephora", category: "Personal Care", isSubscription: false },
];

// Subscription pricing (monthly)
const SUBSCRIPTION_PRICES: Record<string, number> = {
  "Netflix": 15.99,
  "Spotify": 10.99,
  "Disney+": 13.99,
  "HBO Max": 15.99,
  "YouTube Premium": 13.99,
  "Apple Music": 10.99,
  "Amazon Prime": 14.99,
  "Hulu": 17.99,
  "Adobe Creative Cloud": 54.99,
  "Microsoft 365": 9.99,
  "iCloud Storage": 2.99,
  "Dropbox": 11.99,
  "ChatGPT Plus": 20.00,
  "Notion": 10.00,
  "Gym Membership": 49.99,
  "Verizon": 85.00,
  "AT&T": 75.00,
  "Comcast": 89.99,
  "Electric Company": 120.00,
  "Water Utility": 45.00,
};

// Random amount ranges by category
const AMOUNT_RANGES: Record<string, [number, number]> = {
  "Food & Dining": [8, 80],
  "Transportation": [5, 60],
  "Shopping": [15, 200],
  "Entertainment": [10, 100],
  "Bills & Utilities": [30, 150],
  "Subscriptions": [5, 60],
  "Health & Fitness": [10, 100],
  "Travel": [50, 500],
  "Personal Care": [15, 80],
  "Education": [20, 200],
  "Gifts & Donations": [20, 150],
  "Other": [10, 50],
};

// Helper to generate random number in range
function randomInRange(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

// Helper to get random item from array
function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Helper to generate a date in the past N months
function randomDateInPastMonths(months: number): number {
  const now = Date.now();
  const msInMonth = 30 * 24 * 60 * 60 * 1000;
  const pastDate = now - Math.random() * months * msInMonth;
  return pastDate;
}

// Seed categories
export const seedCategories = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const categoryMap: Record<string, Id<"categories">> = {};
    
    // Check if categories already exist
    const existing = await ctx.db.query("categories").first();
    if (existing) {
      console.log("Categories already seeded");
      return { message: "Categories already exist" };
    }
    
    // Create main categories
    for (const cat of DEFAULT_CATEGORIES) {
      const categoryId = await ctx.db.insert("categories", {
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        type: "system",
        createdAt: now,
      });
      categoryMap[cat.name] = categoryId;
      
      // Create subcategories
      for (const subName of cat.subcategories) {
        await ctx.db.insert("categories", {
          name: subName,
          icon: cat.icon,
          color: cat.color,
          type: "system",
          parentId: categoryId,
          createdAt: now,
        });
      }
    }
    
    console.log(`Seeded ${DEFAULT_CATEGORIES.length} categories with subcategories`);
    return { message: "Categories seeded successfully", count: DEFAULT_CATEGORIES.length };
  },
});

// Seed merchants
export const seedMerchants = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    
    // Check if merchants already exist
    const existing = await ctx.db.query("merchants").first();
    if (existing) {
      console.log("Merchants already seeded");
      return { message: "Merchants already exist" };
    }
    
    // Get category map
    const categories = await ctx.db.query("categories").collect();
    const categoryMap: Record<string, Id<"categories">> = {};
    for (const cat of categories) {
      categoryMap[cat.name] = cat._id;
    }
    
    // Create merchants
    for (const merchant of MERCHANTS) {
      await ctx.db.insert("merchants", {
        name: merchant.name,
        normalizedName: merchant.name.toLowerCase().replace(/[^a-z0-9]/g, ""),
        defaultCategoryId: categoryMap[merchant.category],
        isSubscription: merchant.isSubscription,
        createdAt: now,
      });
    }
    
    console.log(`Seeded ${MERCHANTS.length} merchants`);
    return { message: "Merchants seeded successfully", count: MERCHANTS.length };
  },
});

// Seed transactions for a user
export const seedTransactions = mutation({
  args: {
    userId: v.id("users"),
    months: v.optional(v.number()), // How many months of history (default 6)
    transactionsPerMonth: v.optional(v.number()), // Avg transactions per month (default 60)
  },
  handler: async (ctx, args) => {
    const months = args.months ?? 6;
    const txPerMonth = args.transactionsPerMonth ?? 60;
    const now = Date.now();
    
    // Get categories and merchants
    const categories = await ctx.db.query("categories").collect();
    const merchants = await ctx.db.query("merchants").collect();
    
    const categoryMap: Record<string, Id<"categories">> = {};
    const categoryByName: Record<string, typeof categories[0]> = {};
    for (const cat of categories) {
      if (!cat.parentId) {
        categoryMap[cat.name] = cat._id;
        categoryByName[cat.name] = cat;
      }
    }
    
    const merchantMap: Record<string, typeof merchants[0]> = {};
    for (const m of merchants) {
      merchantMap[m.name] = m;
    }
    
    // Non-subscription merchants for random transactions
    const nonSubMerchants = merchants.filter(m => !m.isSubscription);
    const subscriptionMerchants = merchants.filter(m => m.isSubscription);
    
    const transactionsToCreate = [];
    
    // Generate monthly income (salary on 1st and 15th)
    for (let m = 0; m < months; m++) {
      const monthDate = new Date();
      monthDate.setMonth(monthDate.getMonth() - m);
      
      // Salary payment (1st of month)
      const salaryDate1 = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1).getTime();
      transactionsToCreate.push({
        userId: args.userId,
        amount: -3500, // negative = income
        type: "income" as const,
        description: "Salary Deposit",
        categoryId: categoryMap["Income"],
        merchantName: "Employer Direct Deposit",
        date: salaryDate1,
        isRecurring: true,
        isExcludedFromInsights: false,
        userCategorized: false,
        markedAsRegret: false,
        createdAt: now,
        updatedAt: now,
      });
      
      // Salary payment (15th of month)
      const salaryDate2 = new Date(monthDate.getFullYear(), monthDate.getMonth(), 15).getTime();
      transactionsToCreate.push({
        userId: args.userId,
        amount: -3500,
        type: "income" as const,
        description: "Salary Deposit",
        categoryId: categoryMap["Income"],
        merchantName: "Employer Direct Deposit",
        date: salaryDate2,
        isRecurring: true,
        isExcludedFromInsights: false,
        userCategorized: false,
        markedAsRegret: false,
        createdAt: now,
        updatedAt: now,
      });
      
      // Generate subscription payments (recurring)
      const activeSubscriptions = subscriptionMerchants.slice(0, 8); // User has 8 subscriptions
      for (const sub of activeSubscriptions) {
        const subDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), Math.floor(Math.random() * 28) + 1).getTime();
        const price = SUBSCRIPTION_PRICES[sub.name] ?? 14.99;
        
        transactionsToCreate.push({
          userId: args.userId,
          amount: price,
          type: "expense" as const,
          description: `${sub.name} Monthly`,
          categoryId: sub.defaultCategoryId ?? categoryMap["Subscriptions"],
          merchantId: sub._id,
          merchantName: sub.name,
          date: subDate,
          isRecurring: true,
          isExcludedFromInsights: false,
          userCategorized: false,
          markedAsRegret: false,
          createdAt: now,
          updatedAt: now,
        });
      }
      
      // Generate random transactions
      const randomTxCount = txPerMonth + Math.floor(Math.random() * 20) - 10;
      for (let i = 0; i < randomTxCount; i++) {
        const merchant = randomItem(nonSubMerchants);
        const category = categoryByName[
          MERCHANTS.find(m => m.name === merchant.name)?.category ?? "Other"
        ];
        
        const amountRange = AMOUNT_RANGES[category?.name ?? "Other"] ?? [10, 50];
        const amount = randomInRange(amountRange[0], amountRange[1]);
        
        const txDate = new Date(
          monthDate.getFullYear(),
          monthDate.getMonth(),
          Math.floor(Math.random() * 28) + 1,
          Math.floor(Math.random() * 14) + 8, // 8am - 10pm
          Math.floor(Math.random() * 60)
        ).getTime();
        
        // Randomly mark some as regretted (impulse purchases)
        const isRegret = Math.random() < 0.05; // 5% regret rate
        
        transactionsToCreate.push({
          userId: args.userId,
          amount,
          type: "expense" as const,
          description: merchant.name,
          categoryId: category?._id ?? categoryMap["Other"],
          merchantId: merchant._id,
          merchantName: merchant.name,
          date: txDate,
          isRecurring: false,
          isExcludedFromInsights: false,
          userCategorized: false,
          markedAsRegret: isRegret,
          createdAt: now,
          updatedAt: now,
        });
      }
    }
    
    // Insert all transactions
    for (const tx of transactionsToCreate) {
      await ctx.db.insert("transactions", tx);
    }
    
    console.log(`Seeded ${transactionsToCreate.length} transactions for user`);
    return { 
      message: "Transactions seeded successfully", 
      count: transactionsToCreate.length,
      months,
    };
  },
});

// Seed benchmark data
export const seedBenchmarks = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    
    // Check if benchmarks exist
    const existing = await ctx.db.query("benchmarks").first();
    if (existing) {
      return { message: "Benchmarks already exist" };
    }
    
    // Get categories
    const categories = await ctx.db
      .query("categories")
      .withIndex("by_type", q => q.eq("type", "system"))
      .collect();
    
    const expenseCategories = categories.filter(c => 
      !c.parentId && c.name !== "Income" && c.name !== "Transfers"
    );
    
    const ageGroups = ["18-24", "25-34", "35-44", "45-54", "55-64", "65+"];
    const incomeRanges = ["0-30k", "30k-50k", "50k-75k", "75k-100k", "100k-150k", "150k+"];
    const countries = ["US", "UK", "DE", "CA", "AU"];
    
    // Average monthly spending by category (baseline)
    const categoryAvgSpend: Record<string, number> = {
      "Food & Dining": 550,
      "Transportation": 250,
      "Shopping": 300,
      "Entertainment": 150,
      "Bills & Utilities": 200,
      "Subscriptions": 80,
      "Health & Fitness": 100,
      "Travel": 200,
      "Personal Care": 75,
      "Education": 50,
      "Gifts & Donations": 60,
      "Other": 100,
    };
    
    const currentMonth = parseInt(
      new Date().toISOString().slice(0, 7).replace("-", "")
    );
    
    let count = 0;
    
    // Create benchmark entries for each segment
    for (const category of expenseCategories) {
      const baseSpend = categoryAvgSpend[category.name] ?? 100;
      
      for (const ageGroup of ageGroups) {
        for (const incomeRange of incomeRanges) {
          for (const country of countries) {
            // Adjust spend based on demographics
            let adjustedSpend = baseSpend;
            
            // Income adjustment
            if (incomeRange === "150k+") adjustedSpend *= 1.5;
            else if (incomeRange === "100k-150k") adjustedSpend *= 1.3;
            else if (incomeRange === "75k-100k") adjustedSpend *= 1.1;
            else if (incomeRange === "0-30k") adjustedSpend *= 0.6;
            
            // Age adjustment
            if (ageGroup === "18-24") adjustedSpend *= 0.8;
            else if (ageGroup === "65+") adjustedSpend *= 0.7;
            
            // Country cost of living adjustment
            if (country === "UK" || country === "AU") adjustedSpend *= 1.1;
            else if (country === "DE") adjustedSpend *= 0.95;
            
            const variance = 0.2;
            const median = adjustedSpend * (1 - Math.random() * 0.1);
            
            await ctx.db.insert("benchmarks", {
              categoryId: category._id,
              ageGroup,
              incomeRange,
              country,
              avgMonthlySpend: Math.round(adjustedSpend),
              medianMonthlySpend: Math.round(median),
              percentile25: Math.round(adjustedSpend * (1 - variance)),
              percentile75: Math.round(adjustedSpend * (1 + variance)),
              sampleSize: Math.floor(Math.random() * 5000) + 1000,
              month: currentMonth,
              updatedAt: now,
            });
            count++;
          }
        }
      }
    }
    
    return { message: "Benchmarks seeded", count };
  },
});

// Master seed function - seeds everything for a new user
export const seedAll = mutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // 1. Create user if doesn't exist
    let user = await ctx.db
      .query("users")
      .withIndex("by_email", q => q.eq("email", args.email))
      .first();
    
    if (!user) {
      const userId = await ctx.db.insert("users", {
        email: args.email,
        name: args.name ?? "Demo User",
        age: 28,
        city: "New York",
        country: "US",
        currency: "USD",
        monthlyIncome: 7000,
        coachingStyle: "gentle",
        activeMode: "normal",
        excludedCategoryIds: [],
        isOnboarded: true,
        createdAt: now,
        updatedAt: now,
      });
      user = await ctx.db.get(userId);
    }
    
    if (!user) {
      throw new Error("Failed to create user");
    }
    
    return {
      message: "User created. Run seedCategories, seedMerchants, seedBenchmarks, and seedTransactions separately.",
      userId: user._id,
    };
  },
});

// ==================== ISLAMIC FINANCE SEED DATA ====================

/**
 * Seed Malaysian Zakat authorities (14 states + 3 federal territories)
 */
export const seedMalaysianZakatAuthorities = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("zakatAuthorities").first();
    if (existing) {
      return { message: "Zakat authorities already seeded" };
    }

    const authorities = [
      // States
      { state: "Johor", name: "Majlis Agama Islam Negeri Johor", shortName: "MAINJ", website: "http://www.zakatjohor.com" },
      { state: "Kedah", name: "Lembaga Zakat Negeri Kedah", shortName: "LZNK", website: "http://www.zakatkedah.com.my" },
      { state: "Kelantan", name: "Majlis Agama Islam dan Adat Melayu Kelantan", shortName: "MAIK", website: "http://www.e-zakat.com.my" },
      { state: "Melaka", name: "Majlis Agama Islam Melaka", shortName: "MAIM", website: "http://www.zakatmelaka.com.my" },
      { state: "Negeri Sembilan", name: "Majlis Agama Islam Negeri Sembilan", shortName: "MAINS", website: "http://www.mainsns.gov.my" },
      { state: "Pahang", name: "Majlis Agama Islam dan Adat Melayu Pahang", shortName: "MUIP", website: "http://www.muippahang.gov.my" },
      { state: "Penang", name: "Majlis Agama Islam Negeri Pulau Pinang", shortName: "MAINPP", website: "http://www.zakatpenang.com" },
      { state: "Perak", name: "Majlis Agama Islam dan Adat Melayu Perak", shortName: "MAIPk", website: "http://www.zakatperak.com.my" },
      { state: "Perlis", name: "Majlis Agama Islam dan Adat Istiadat Melayu Perlis", shortName: "MAIPs", website: "http://www.maips.gov.my" },
      { state: "Sabah", name: "Majlis Ugama Islam Sabah", shortName: "MUIS", website: "http://www.muis.gov.my" },
      { state: "Sarawak", name: "Majlis Islam Sarawak", shortName: "MIS", website: "http://www.mainsarawak.com" },
      { state: "Selangor", name: "Lembaga Zakat Selangor", shortName: "LZS", website: "http://www.zakatselangor.com.my" },
      { state: "Terengganu", name: "Majlis Agama Islam dan Adat Melayu Terengganu", shortName: "MAIDAM", website: "http://www.maidam.gov.my" },

      // Federal Territories
      { state: "Kuala Lumpur", name: "Pusat Pungutan Zakat", shortName: "PPZ-MAIWP", website: "http://www.zakat.com.my" },
      { state: "Putrajaya", name: "Pusat Pungutan Zakat", shortName: "PPZ-MAIWP", website: "http://www.zakat.com.my" },
      { state: "Labuan", name: "Pusat Pungutan Zakat", shortName: "PPZ-MAIWP", website: "http://www.zakat.com.my" },

      // Additional state (Melaka variant)
      { state: "Malacca", name: "Pusat Zakat Negeri Melaka", shortName: "PZM", website: "http://www.zakatmelaka.com.my" },
    ];

    for (const auth of authorities) {
      await ctx.db.insert("zakatAuthorities", {
        state: auth.state,
        name: auth.name,
        shortName: auth.shortName,
        website: auth.website,
        acceptsOnlinePayment: true,
        createdAt: Date.now(),
      });
    }

    return { message: "Malaysian Zakat authorities seeded", count: authorities.length };
  },
});

/**
 * Seed sample Islamic rulings for RAG knowledge base
 */
export const seedIslamicRulings = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("islamicRulings").first();
    if (existing) {
      return { message: "Islamic rulings already seeded" };
    }

    const rulings = [
      // Zakat rulings
      {
        topic: "zakat",
        subtopic: "nisab",
        question: "What is the nisab threshold for Zakat?",
        ruling: "The nisab for gold is 20 mithqals (approximately 85 grams of pure gold). For silver, it is 200 dirhams (approximately 595 grams of pure silver). When calculating Zakat on cash and wealth, one should use the LOWER value between gold and silver nisab.",
        evidence: "Hadith: The Prophet (ﷺ) said: 'There is no Sadaqah (Zakat) on less than five awsuq of dates, on less than five camel-heads and on less than five uqiyyah of silver.' (Bukhari 1405)",
        chapter: 168,
        tags: ["zakat", "nisab", "gold", "silver", "threshold"],
      },
      {
        topic: "zakat",
        subtopic: "rate",
        question: "What is the Zakat rate?",
        ruling: "The Zakat rate on cash, gold, silver, and trade goods is 2.5% (1/40th) of the total zakatable wealth that has been in one's possession for a full Islamic lunar year (haul).",
        evidence: "Hadith: 'On silver which reaches the amount of five Uqiyah, one-fortieth is payable.' (Bukhari 1454)",
        chapter: 169,
        tags: ["zakat", "rate", "2.5%", "percentage"],
      },
      {
        topic: "zakat",
        subtopic: "haul",
        question: "What is the haul requirement for Zakat?",
        ruling: "Haul refers to the completion of one Islamic lunar year (354 days) during which wealth remains above the nisab threshold. Zakat is only obligatory when wealth has been in one's possession for a full haul.",
        evidence: "Hadith: 'No Zakat is due on property until a year passes on it.' (Ibn Majah 1792)",
        chapter: 171,
        tags: ["zakat", "haul", "lunar year", "354 days"],
      },
      {
        topic: "zakat",
        subtopic: "recipients",
        question: "Who are the recipients of Zakat?",
        ruling: "Allah has specified eight categories of Zakat recipients (Asnaf): 1) The poor (Fuqara), 2) The needy (Masakin), 3) Zakat administrators, 4) Those whose hearts are to be reconciled, 5) Freeing slaves, 6) Those in debt (Gharimin), 7) In the cause of Allah (Fi Sabilillah), 8) The wayfarer (Ibn Sabil).",
        evidence: "Quran: 'The alms are only for the poor and the needy, and those who collect them, and those whose hearts are to be reconciled...' (At-Tawbah 9:60)",
        chapter: 173,
        tags: ["zakat", "recipients", "asnaf", "8 categories"],
      },

      // Riba rulings
      {
        topic: "riba",
        subtopic: "prohibition",
        question: "Is interest (riba) prohibited in Islam?",
        ruling: "Riba (interest/usury) is categorically and absolutely prohibited in Islam. This includes both giving and receiving interest. It is one of the major sins in Islam, and engaging in it is considered waging war against Allah and His Messenger.",
        evidence: "Quran: 'Those who consume riba cannot stand except as one stands who is being beaten by Satan... Allah has permitted trade and has forbidden riba.' (Al-Baqarah 2:275)",
        chapter: 183,
        tags: ["riba", "interest", "usury", "haram", "prohibition"],
      },
      {
        topic: "riba",
        subtopic: "bank_interest",
        question: "What should I do with bank interest I receive?",
        ruling: "If you receive bank interest unintentionally (e.g., from a conventional savings account), you must not use it for personal benefit. Instead, you should purify your wealth by donating that interest money to charity without seeking reward, as it is impermissible wealth.",
        evidence: "Scholarly consensus: Interest earned must be disposed of through charity without the intention of reward, as it is impure wealth.",
        chapter: 184,
        tags: ["riba", "bank interest", "purification", "charity"],
      },

      // Hajj rulings
      {
        topic: "hajj",
        subtopic: "obligation",
        question: "Is Hajj obligatory?",
        ruling: "Hajj is one of the five pillars of Islam and is obligatory once in a lifetime for every adult Muslim who is financially and physically able to undertake the journey. Financial ability means having sufficient funds for the journey, Hajj expenses, and support for dependents during absence.",
        evidence: "Quran: 'And Hajj to the House is a duty that mankind owes to Allah, for those who can afford the journey.' (Aal-Imran 3:97)",
        chapter: 179,
        tags: ["hajj", "pilgrimage", "obligation", "fard"],
      },
      {
        topic: "hajj",
        subtopic: "savings",
        question: "Is Zakat due on Hajj savings?",
        ruling: "If your Hajj savings reach the nisab threshold and remain above it for a full Islamic year (haul), then Zakat is due on that amount at 2.5%. Saving for Hajj does not exempt wealth from Zakat if it meets the nisab criteria.",
        evidence: "Scholarly consensus: Intention to use wealth for Hajj does not exempt it from Zakat if it meets nisab and haul requirements.",
        chapter: 180,
        tags: ["hajj", "zakat", "savings", "nisab"],
      },

      // Halal/Haram transactions
      {
        topic: "transactions",
        subtopic: "gambling",
        question: "Is gambling prohibited in Islam?",
        ruling: "Gambling (maysir) is categorically prohibited in Islam. This includes lotteries, betting, casinos, and any game of chance where money is wagered. It is considered a major sin and from the works of Satan.",
        evidence: "Quran: 'O you who believe! Intoxicants, gambling, idolatry and divination by arrows are an abomination of Satan's handiwork. So avoid them in order that you may be successful.' (Al-Ma'idah 5:90)",
        chapter: 182,
        tags: ["haram", "gambling", "maysir", "lottery", "betting"],
      },
      {
        topic: "transactions",
        subtopic: "alcohol",
        question: "Are transactions involving alcohol prohibited?",
        ruling: "All transactions involving alcohol (khamr) are prohibited, including buying, selling, serving, or transporting it. This prohibition extends to working in establishments that primarily serve alcohol.",
        evidence: "Hadith: 'Allah has cursed alcohol, the one who drinks it, the one who pours it, the one who sells it, the one who buys it...' (Abu Dawood 3674)",
        chapter: 183,
        tags: ["haram", "alcohol", "khamr", "transactions"],
      },
    ];

    for (const ruling of rulings) {
      await ctx.db.insert("islamicRulings", {
        chapter: ruling.chapter,
        chapterTitle: ruling.topic,
        content: ruling.ruling,
        topics: ruling.tags || [ruling.topic],
        language: "en",
        createdAt: Date.now(),
      });
    }

    return { message: "Islamic rulings seeded", count: rulings.length };
  },
});

/**
 * Seed Malaysian merchant Shariah status database
 */
export const seedMalaysianMerchants = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("merchantShariahStatus").first();
    if (existing) {
      return { message: "Malaysian merchants already seeded" };
    }

    const merchants = [
      // Halal certified Malaysian merchants
      { name: "McDonald's Malaysia", status: "halal" as const, certifiedBy: "JAKIM", certificationNumber: "JAKIM-12345" },
      { name: "KFC Malaysia", status: "halal" as const, certifiedBy: "JAKIM", certificationNumber: "JAKIM-12346" },
      { name: "Pizza Hut Malaysia", status: "halal" as const, certifiedBy: "JAKIM", certificationNumber: "JAKIM-12347" },
      { name: "Nando's Malaysia", status: "halal" as const, certifiedBy: "JAKIM", certificationNumber: "JAKIM-12348" },
      { name: "The Chicken Rice Shop", status: "halal" as const, certifiedBy: "JAKIM", certificationNumber: "JAKIM-12349" },
      { name: "Secret Recipe", status: "halal" as const, certifiedBy: "JAKIM", certificationNumber: "JAKIM-12350" },
      { name: "Old Town White Coffee", status: "halal" as const, certifiedBy: "JAKIM", certificationNumber: "JAKIM-12351" },

      // Malaysian banks (halal unless interest detected)
      { name: "Maybank", status: "doubtful" as const, certifiedBy: null, certificationNumber: null },
      { name: "CIMB Bank", status: "doubtful" as const, certifiedBy: null, certificationNumber: null },
      { name: "Bank Islam Malaysia", status: "halal" as const, certifiedBy: "Shariah Board", certificationNumber: "SC-001" },
      { name: "Bank Muamalat", status: "halal" as const, certifiedBy: "Shariah Board", certificationNumber: "SC-002" },
      { name: "RHB Bank", status: "doubtful" as const, certifiedBy: null, certificationNumber: null },

      // Known haram establishments
      { name: "Genting Casino", status: "haram" as const, certifiedBy: null, certificationNumber: null },
      { name: "Carlsberg", status: "haram" as const, certifiedBy: null, certificationNumber: null },
      { name: "Heineken", status: "haram" as const, certifiedBy: null, certificationNumber: null },
      { name: "Sports Toto", status: "haram" as const, certifiedBy: null, certificationNumber: null },
      { name: "Magnum 4D", status: "haram" as const, certifiedBy: null, certificationNumber: null },
    ];

    for (const merchant of merchants) {
      await ctx.db.insert("merchantShariahStatus", {
        merchantName: merchant.name,
        normalizedName: merchant.name.toLowerCase().replace(/[^a-z0-9]/g, ""),
        complianceStatus: merchant.status as "halal" | "haram" | "doubtful" | "pending_review",
        jakimCertified: merchant.status === "halal",
        jakimCertNumber: merchant.certificationNumber || undefined,
        lastReviewedAt: Date.now(),
        reviewedBy: "system" as const,
        reviewNotes: merchant.status === "halal" ? "JAKIM certified halal" : merchant.status === "haram" ? "Known non-halal establishment" : "Conventional bank - check for riba",
        userReportsHalal: 0,
        userReportsHaram: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    return { message: "Malaysian merchants seeded", count: merchants.length };
  },
});

/**
 * Seed Tabung Haji packages
 */
export const seedTabungHajiPackages = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("tabungHajiPackages").first();
    if (existing) {
      return { message: "Tabung Haji packages already seeded" };
    }

    const currentYear = new Date().getFullYear();
    const packages = [
      {
        year: currentYear,
        packageName: "Muassasah (Budget)",
        packageType: "muassasah" as const,
        cost: 28000, // RM 28,000
        deposit: 1300,
        inclusions: ["Flight", "Basic Accommodation", "Meals", "Transportation", "Umrah"],
        hibahRate: 0.045, // 4.5% average
        estimatedWaitYears: 5,
        updatedAt: Date.now(),
      },
      {
        year: currentYear,
        packageName: "Muassasah Plus (Standard)",
        packageType: "muassasah" as const,
        cost: 35000, // RM 35,000
        deposit: 1300,
        inclusions: ["Flight", "Standard Accommodation", "Good Meals", "VIP Transportation", "Umrah", "Visa assistance"],
        hibahRate: 0.045,
        estimatedWaitYears: 6,
        updatedAt: Date.now(),
      },
      {
        year: currentYear,
        packageName: "Qusyaisyiyah (Premium)",
        packageType: "swasta" as const,
        cost: 45000, // RM 45,000
        deposit: 3000,
        inclusions: ["Flight", "5-star Accommodation", "Premium Meals", "VIP Transportation", "Umrah", "Visa assistance", "Travel insurance"],
        hibahRate: 0.045,
        estimatedWaitYears: 2,
        updatedAt: Date.now(),
      },
    ];

    for (const pkg of packages) {
      await ctx.db.insert("tabungHajiPackages", pkg);
    }

    return { message: "Tabung Haji packages seeded", count: packages.length };
  },
});

/**
 * Seed current Nisab prices (Malaysian market)
 */
export const seedNisabPrices = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("nisabPrices").first();
    if (existing) {
      return { message: "Nisab prices already seeded" };
    }

    // Current approximate Malaysian gold/silver prices
    // In production, these would be fetched from BNM API
    const goldPricePerGram = 320; // RM 320 per gram (approximate)
    const silverPricePerGram = 3.5; // RM 3.50 per gram (approximate)

    const goldNisab = 85; // 85 grams
    const silverNisab = 595; // 595 grams

    await ctx.db.insert("nisabPrices", {
      goldPricePerGram,
      silverPricePerGram,
      goldNisabValue: goldPricePerGram * goldNisab, // RM 27,200
      silverNisabValue: silverPricePerGram * silverNisab, // RM 2,082.50
      source: "BNM_Manual_Seed",
      date: Date.now(),
      createdAt: Date.now(),
    });

    return {
      message: "Nisab prices seeded",
      goldNisab: goldPricePerGram * goldNisab,
      silverNisab: silverPricePerGram * silverNisab,
    };
  },
});

/**
 * Master seed for Islamic Finance features
 */
export const seedIslamicFinance = mutation({
  args: {},
  handler: async (ctx): Promise<{
    message: string;
  }> => {
    // Note: Individual seed functions are exposed separately as mutations
    // Call them individually to seed Islamic finance data

    return {
      message: "Use seedMalaysianZakatAuthorities, seedIslamicRulings, seedMalaysianMerchants, seedTabungHajiPackages, and seedNisabPrices mutations to seed Islamic finance data",
    };
  },
});

