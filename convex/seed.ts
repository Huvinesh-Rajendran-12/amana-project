import { v } from "convex/values";
import { mutation, internalMutation } from "./_generated/server";
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

