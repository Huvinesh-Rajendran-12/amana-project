import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

/**
 * Benchmarks module - Anonymized peer spending comparisons.
 * Lets users see how their spending compares to similar people.
 */

// Get benchmark for a specific category
export const getForCategory = query({
  args: {
    userId: v.id("users"),
    categoryId: v.id("categories"),
  },
  handler: async (ctx, args) => {
    // Get user profile for demographic matching
    const user = await ctx.db.get(args.userId);
    if (!user) return null;
    
    // Determine user's demographic segment
    const ageGroup = getAgeGroup(user.age);
    const incomeRange = getIncomeRange(user.monthlyIncome);
    const country = user.country ?? "US";
    
    // Get benchmark for this segment
    const benchmark = await ctx.db
      .query("benchmarks")
      .withIndex("by_segment", (q) => 
        q.eq("categoryId", args.categoryId)
          .eq("ageGroup", ageGroup)
          .eq("incomeRange", incomeRange)
          .eq("country", country)
      )
      .first();
    
    if (!benchmark) {
      // Try to get country-level benchmark without demographic filter
      const countryBenchmark = await ctx.db
        .query("benchmarks")
        .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
        .first();
      
      return countryBenchmark;
    }
    
    // Get user's spending in this category for comparison
    const now = Date.now();
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user_category", (q) => 
        q.eq("userId", args.userId).eq("categoryId", args.categoryId)
      )
      .collect();
    
    const thisMonthTxs = transactions.filter(t => t.date >= startOfMonth.getTime());
    const userSpending = thisMonthTxs
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    
    // Calculate percentile
    const percentile = calculatePercentile(
      userSpending,
      benchmark.percentile25,
      benchmark.medianMonthlySpend,
      benchmark.percentile75,
      benchmark.avgMonthlySpend
    );
    
    // Get category info
    const category = await ctx.db.get(args.categoryId);
    
    return {
      categoryId: args.categoryId,
      categoryName: category?.name ?? "Unknown",
      categoryIcon: category?.icon,
      
      userSpending: Math.round(userSpending * 100) / 100,
      
      benchmark: {
        average: benchmark.avgMonthlySpend,
        median: benchmark.medianMonthlySpend,
        percentile25: benchmark.percentile25,
        percentile75: benchmark.percentile75,
        sampleSize: benchmark.sampleSize,
      },
      
      comparison: {
        percentile,
        vsAverage: Math.round(((userSpending - benchmark.avgMonthlySpend) / benchmark.avgMonthlySpend) * 100),
        vsMedian: Math.round(((userSpending - benchmark.medianMonthlySpend) / benchmark.medianMonthlySpend) * 100),
        status: getComparisonStatus(userSpending, benchmark.avgMonthlySpend, benchmark.percentile75),
      },
      
      segment: {
        ageGroup,
        incomeRange,
        country,
      },
    };
  },
});

// Get all category benchmarks for a user
export const getAllCategories = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return [];
    
    const ageGroup = getAgeGroup(user.age);
    const incomeRange = getIncomeRange(user.monthlyIncome);
    const country = user.country ?? "US";
    
    // Get user's spending by category this month
    const now = Date.now();
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user_date", (q) => 
        q.eq("userId", args.userId).gte("date", startOfMonth.getTime())
      )
      .collect();
    
    const expenses = transactions.filter(t => t.type === "expense");
    
    // Group by category
    const spendingByCategory = new Map<string, number>();
    for (const tx of expenses) {
      if (tx.categoryId) {
        const key = tx.categoryId.toString();
        spendingByCategory.set(key, (spendingByCategory.get(key) ?? 0) + tx.amount);
      }
    }
    
    // Get all categories with spending
    const categoryIds = Array.from(spendingByCategory.keys());
    const results = [];
    
    for (const categoryIdStr of categoryIds) {
      const categoryId = categoryIdStr as Id<"categories">;
      const userSpending = spendingByCategory.get(categoryIdStr) ?? 0;
      
      // Get benchmark
      const benchmark = await ctx.db
        .query("benchmarks")
        .withIndex("by_segment", (q) => 
          q.eq("categoryId", categoryId)
            .eq("ageGroup", ageGroup)
            .eq("incomeRange", incomeRange)
            .eq("country", country)
        )
        .first();
      
      if (!benchmark) continue;
      
      const category = await ctx.db.get(categoryId);
      if (!category) continue;
      
      const percentile = calculatePercentile(
        userSpending,
        benchmark.percentile25,
        benchmark.medianMonthlySpend,
        benchmark.percentile75,
        benchmark.avgMonthlySpend
      );
      
      results.push({
        categoryId,
        categoryName: category.name,
        categoryIcon: category.icon,
        categoryColor: category.color,
        userSpending: Math.round(userSpending * 100) / 100,
        avgSpending: benchmark.avgMonthlySpend,
        percentile,
        vsAverage: Math.round(((userSpending - benchmark.avgMonthlySpend) / benchmark.avgMonthlySpend) * 100),
        status: getComparisonStatus(userSpending, benchmark.avgMonthlySpend, benchmark.percentile75),
      });
    }
    
    // Sort by deviation from average (most over-spending first)
    results.sort((a, b) => b.vsAverage - a.vsAverage);
    
    return results;
  },
});

// Get user's overall ranking
export const getUserRanking = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;
    
    // Get user's monthly spending and income
    const now = Date.now();
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user_date", (q) => 
        q.eq("userId", args.userId).gte("date", startOfMonth.getTime())
      )
      .collect();
    
    const income = transactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const expenses = transactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    
    const savings = income - expenses;
    const savingsRate = income > 0 ? (savings / income) * 100 : 0;
    
    // Compare to benchmarks
    // Average savings rate is around 15-20% for financially healthy individuals
    const avgSavingsRate = 15;
    
    let savingsRanking: string;
    let savingsPercentile: number;
    
    if (savingsRate >= 30) {
      savingsRanking = "Excellent";
      savingsPercentile = 90;
    } else if (savingsRate >= 20) {
      savingsRanking = "Great";
      savingsPercentile = 75;
    } else if (savingsRate >= 10) {
      savingsRanking = "Good";
      savingsPercentile = 50;
    } else if (savingsRate >= 0) {
      savingsRanking = "Needs Work";
      savingsPercentile = 30;
    } else {
      savingsRanking = "Overspending";
      savingsPercentile = 10;
    }
    
    // Get category with highest over-spending
    const categoryComparisons = await getAllCategoryComparisons(ctx, args.userId, user);
    const mostOverspent = categoryComparisons
      .filter(c => c.vsAverage > 0)
      .sort((a, b) => b.vsAverage - a.vsAverage)[0];
    
    const mostUnderSpent = categoryComparisons
      .filter(c => c.vsAverage < 0)
      .sort((a, b) => a.vsAverage - b.vsAverage)[0];
    
    return {
      savingsRate: Math.round(savingsRate * 10) / 10,
      savingsRanking,
      savingsPercentile,
      
      vsAvgSavingsRate: Math.round((savingsRate - avgSavingsRate) * 10) / 10,
      
      totalIncome: Math.round(income * 100) / 100,
      totalExpenses: Math.round(expenses * 100) / 100,
      totalSavings: Math.round(savings * 100) / 100,
      
      insights: {
        biggestOverspend: mostOverspent ? {
          category: mostOverspent.categoryName,
          vsAverage: mostOverspent.vsAverage,
          amount: mostOverspent.userSpending,
        } : null,
        biggestUnderSpend: mostUnderSpent ? {
          category: mostUnderSpent.categoryName,
          vsAverage: mostUnderSpent.vsAverage,
          amount: mostUnderSpent.userSpending,
        } : null,
      },
      
      segment: {
        ageGroup: getAgeGroup(user.age),
        incomeRange: getIncomeRange(user.monthlyIncome),
        country: user.country ?? "US",
      },
    };
  },
});

// Internal mutation to update benchmark aggregates (called by cron)
export const updateAggregates = internalMutation({
  args: {},
  handler: async (ctx) => {
    // This would normally aggregate data from all users
    // For now, we'll just update timestamps on existing benchmarks
    
    const benchmarks = await ctx.db.query("benchmarks").collect();
    const now = Date.now();
    
    for (const benchmark of benchmarks) {
      await ctx.db.patch(benchmark._id, {
        updatedAt: now,
      });
    }
    
    return { updated: benchmarks.length };
  },
});

// Helper: Get age group from age
function getAgeGroup(age?: number): string {
  if (!age) return "25-34"; // Default
  if (age < 18) return "18-24";
  if (age < 25) return "18-24";
  if (age < 35) return "25-34";
  if (age < 45) return "35-44";
  if (age < 55) return "45-54";
  if (age < 65) return "55-64";
  return "65+";
}

// Helper: Get income range from monthly income
function getIncomeRange(monthlyIncome?: number): string {
  if (!monthlyIncome) return "50k-75k"; // Default
  const yearly = monthlyIncome * 12;
  
  if (yearly < 30000) return "0-30k";
  if (yearly < 50000) return "30k-50k";
  if (yearly < 75000) return "50k-75k";
  if (yearly < 100000) return "75k-100k";
  if (yearly < 150000) return "100k-150k";
  return "150k+";
}

// Helper: Calculate percentile based on quartiles
function calculatePercentile(
  value: number,
  p25: number,
  median: number,
  p75: number,
  avg: number
): number {
  if (value <= p25) {
    return Math.round((value / p25) * 25);
  } else if (value <= median) {
    return 25 + Math.round(((value - p25) / (median - p25)) * 25);
  } else if (value <= p75) {
    return 50 + Math.round(((value - median) / (p75 - median)) * 25);
  } else {
    // Above 75th percentile - estimate based on distance from p75
    const excess = (value - p75) / p75;
    return Math.min(99, 75 + Math.round(excess * 25));
  }
}

// Helper: Get comparison status
function getComparisonStatus(
  userSpending: number,
  average: number,
  p75: number
): "below" | "average" | "above" | "high" {
  if (userSpending <= average * 0.8) return "below";
  if (userSpending <= average * 1.2) return "average";
  if (userSpending <= p75) return "above";
  return "high";
}

// Helper function for getting all category comparisons
async function getAllCategoryComparisons(
  ctx: any,
  userId: Id<"users">,
  user: any
) {
  const ageGroup = getAgeGroup(user.age);
  const incomeRange = getIncomeRange(user.monthlyIncome);
  const country = user.country ?? "US";
  
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  
  const transactions = await ctx.db
    .query("transactions")
    .withIndex("by_user_date", (q: any) => 
      q.eq("userId", userId).gte("date", startOfMonth.getTime())
    )
    .collect();
  
  const expenses = transactions.filter((t: any) => t.type === "expense");
  
  const spendingByCategory = new Map<string, number>();
  for (const tx of expenses) {
    if (tx.categoryId) {
      const key = tx.categoryId.toString();
      spendingByCategory.set(key, (spendingByCategory.get(key) ?? 0) + tx.amount);
    }
  }
  
  const results = [];
  
  for (const [categoryIdStr, userSpending] of spendingByCategory) {
    const categoryId = categoryIdStr as Id<"categories">;
    
    const benchmark = await ctx.db
      .query("benchmarks")
      .withIndex("by_segment", (q: any) => 
        q.eq("categoryId", categoryId)
          .eq("ageGroup", ageGroup)
          .eq("incomeRange", incomeRange)
          .eq("country", country)
      )
      .first();
    
    if (!benchmark) continue;
    
    const category = await ctx.db.get(categoryId);
    if (!category) continue;
    
    results.push({
      categoryId,
      categoryName: category.name,
      userSpending: Math.round(userSpending * 100) / 100,
      avgSpending: benchmark.avgMonthlySpend,
      vsAverage: Math.round(((userSpending - benchmark.avgMonthlySpend) / benchmark.avgMonthlySpend) * 100),
    });
  }
  
  return results;
}

// Get peer comparison message for insights
export const getPeerComparisonMessage = query({
  args: {
    userId: v.id("users"),
    categoryId: v.id("categories"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;
    
    const ageGroup = getAgeGroup(user.age);
    const incomeRange = getIncomeRange(user.monthlyIncome);
    const country = user.country ?? "US";
    const city = user.city ?? "your city";
    
    // Get benchmark
    const benchmark = await ctx.db
      .query("benchmarks")
      .withIndex("by_segment", (q) => 
        q.eq("categoryId", args.categoryId)
          .eq("ageGroup", ageGroup)
          .eq("incomeRange", incomeRange)
          .eq("country", country)
      )
      .first();
    
    if (!benchmark) return null;
    
    // Get user's spending
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user_category", (q) => 
        q.eq("userId", args.userId).eq("categoryId", args.categoryId)
      )
      .collect();
    
    const thisMonthTxs = transactions.filter(t => t.date >= startOfMonth.getTime());
    const userSpending = thisMonthTxs
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    
    const category = await ctx.db.get(args.categoryId);
    const categoryName = category?.name ?? "this category";
    
    const vsAvg = ((userSpending - benchmark.avgMonthlySpend) / benchmark.avgMonthlySpend) * 100;
    
    let message: string;
    
    if (vsAvg > 50) {
      message = `People like you in ${city} (${ageGroup}, ${incomeRange}) spend ~$${benchmark.avgMonthlySpend}/mo on ${categoryName}. You're at $${userSpending.toFixed(0)} this month — that's ${Math.abs(vsAvg).toFixed(0)}% above average.`;
    } else if (vsAvg > 20) {
      message = `Your ${categoryName} spending ($${userSpending.toFixed(0)}) is ${Math.abs(vsAvg).toFixed(0)}% above the average of $${benchmark.avgMonthlySpend} for similar folks in ${city}.`;
    } else if (vsAvg < -20) {
      message = `Nice! You spend ${Math.abs(vsAvg).toFixed(0)}% less on ${categoryName} than similar people ($${userSpending.toFixed(0)} vs avg $${benchmark.avgMonthlySpend}).`;
    } else {
      message = `Your ${categoryName} spending ($${userSpending.toFixed(0)}) is right around average ($${benchmark.avgMonthlySpend}) for people like you.`;
    }
    
    return {
      message,
      userSpending,
      avgSpending: benchmark.avgMonthlySpend,
      vsAverage: Math.round(vsAvg),
      segment: `${ageGroup}, ${incomeRange}, ${city}`,
    };
  },
});

