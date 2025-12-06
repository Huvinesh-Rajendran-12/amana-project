import { v } from "convex/values";
import { query, mutation, internalMutation, internalAction, internalQuery, action } from "./_generated/server";
import { internal, api } from "./_generated/api";
import { Id } from "./_generated/dataModel";

/**
 * Transactions module - Core CRUD operations and aggregations for financial transactions.
 */

// List transactions with filters
export const list = query({
  args: {
    userId: v.id("users"),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    categoryId: v.optional(v.id("categories")),
    merchantId: v.optional(v.id("merchants")),
    type: v.optional(v.union(v.literal("expense"), v.literal("income"), v.literal("transfer"))),
    shariahStatus: v.optional(v.union(v.literal("halal"), v.literal("haram"), v.literal("doubtful"), v.literal("pending_review"))),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    
    // Use simple index query, then filter in memory for date range
    const allTransactions = await ctx.db
      .query("transactions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
    
    // Apply date filters
    let transactions = allTransactions;
    if (args.startDate) {
      transactions = transactions.filter(t => t.date >= args.startDate!);
    }
    if (args.endDate) {
      transactions = transactions.filter(t => t.date <= args.endDate!);
    }
    
    // Apply additional filters
    let filtered = transactions;
    
    if (args.categoryId) {
      filtered = filtered.filter(t => t.categoryId === args.categoryId);
    }
    if (args.merchantId) {
      filtered = filtered.filter(t => t.merchantId === args.merchantId);
    }
    if (args.type) {
      filtered = filtered.filter(t => t.type === args.type);
    }
    if (args.shariahStatus) {
      filtered = filtered.filter(t => t.shariahStatus === args.shariahStatus);
    }
    
    const hasMore = filtered.length > limit;
    const results = filtered.slice(0, limit);
    
    // Enrich with category and merchant names
    const enrichedTransactions = await Promise.all(
      results.map(async (tx) => {
        const category = tx.categoryId ? await ctx.db.get(tx.categoryId) : null;
        const merchant = tx.merchantId ? await ctx.db.get(tx.merchantId) : null;
        
        return {
          ...tx,
          categoryName: category?.name,
          categoryIcon: category?.icon,
          categoryColor: category?.color,
          merchantLogo: merchant?.logo,
        };
      })
    );
    
    return {
      transactions: enrichedTransactions,
      hasMore,
      nextCursor: hasMore ? results[results.length - 1]._id : null,
    };
  },
});

// Get a single transaction by ID
export const get = query({
  args: {
    transactionId: v.id("transactions"),
  },
  handler: async (ctx, args) => {
    const tx = await ctx.db.get(args.transactionId);
    if (!tx) return null;
    
    const category = tx.categoryId ? await ctx.db.get(tx.categoryId) : null;
    const merchant = tx.merchantId ? await ctx.db.get(tx.merchantId) : null;
    
    return {
      ...tx,
      categoryName: category?.name,
      categoryIcon: category?.icon,
      merchantLogo: merchant?.logo,
    };
  },
});

// Create a new transaction with auto-categorization
export const create = mutation({
  args: {
    userId: v.id("users"),
    amount: v.number(),
    type: v.union(v.literal("expense"), v.literal("income"), v.literal("transfer")),
    description: v.string(),
    merchantName: v.string(),
    date: v.number(),
    categoryId: v.optional(v.id("categories")),
    notes: v.optional(v.string()),
    skipShariahCheck: v.optional(v.boolean()), // For non-Islamic mode users
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Try to find merchant by name for auto-categorization
    const normalizedName = args.merchantName.toLowerCase().replace(/[^a-z0-9]/g, "");
    const merchant = await ctx.db
      .query("merchants")
      .withIndex("by_normalized_name", (q) => q.eq("normalizedName", normalizedName))
      .first();
    
    // Auto-categorize based on merchant if no category provided
    let categoryId = args.categoryId;
    if (!categoryId && merchant?.defaultCategoryId) {
      categoryId = merchant.defaultCategoryId;
    }
    
    // Check if this looks like a recurring transaction
    const similarTransactions = await ctx.db
      .query("transactions")
      .withIndex("by_merchant_name", (q) => 
        q.eq("userId", args.userId).eq("merchantName", args.merchantName)
      )
      .collect();
    
    const isRecurring = similarTransactions.length >= 2;
    
    const transactionId = await ctx.db.insert("transactions", {
      userId: args.userId,
      amount: args.amount,
      type: args.type,
      description: args.description,
      categoryId,
      merchantId: merchant?._id,
      merchantName: args.merchantName,
      date: args.date,
      isRecurring,
      isExcludedFromInsights: false,
      userCategorized: !!args.categoryId,
      markedAsRegret: false,
      shariahStatus: args.skipShariahCheck ? undefined : "pending_review",
      notes: args.notes,
      createdAt: now,
      updatedAt: now,
    });
    
    // Schedule Shariah compliance check if not skipped
    if (!args.skipShariahCheck && args.type === "expense") {
      await ctx.scheduler.runAfter(0, internal.transactions.checkShariahCompliance, {
        transactionId,
        merchant: args.merchantName,
        amount: args.amount,
        description: args.description,
      });
    }
    
    return transactionId;
  },
});

// Internal mutation to update Shariah status
export const updateShariahStatus = internalMutation({
  args: {
    transactionId: v.id("transactions"),
    status: v.union(v.literal("halal"), v.literal("haram"), v.literal("doubtful"), v.literal("pending_review")),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.transactionId, {
      shariahStatus: args.status,
      shariahReason: args.reason,
      updatedAt: Date.now(),
    });
  },
});

// Internal action to check Shariah compliance using the AI agent
export const checkShariahCompliance = internalAction({
  args: {
    transactionId: v.id("transactions"),
    merchant: v.string(),
    amount: v.number(),
    description: v.string(),
  },
  handler: async (ctx, args): Promise<{ status: "halal" | "haram" | "doubtful"; reason: string }> => {
    // Call the Shariah compliance agent
    const result: { status: "halal" | "haram" | "doubtful"; reason: string } = await ctx.runAction(
      internal.agents.shariahComplianceAgent.checkTransaction, 
      {
        merchant: args.merchant,
        amount: args.amount,
        description: args.description,
      }
    );
    
    // Update the transaction with the result
    await ctx.runMutation(internal.transactions.updateShariahStatus, {
      transactionId: args.transactionId,
      status: result.status,
      reason: result.reason,
    });
    
    return result;
  },
});

// Public action to batch run Shariah checks on transactions (for backfilling)
export const batchRunShariahChecks = action({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<{ checked: number; results: Array<{ merchant: string; status: string }> }> => {
    const limit = args.limit ?? 10;
    
    // Get transactions without Shariah status
    const transactions = await ctx.runQuery(internal.transactions.getTransactionsNeedingShariahCheck, {
      userId: args.userId,
      limit,
    });
    
    const results: Array<{ merchant: string; status: string }> = [];
    
    for (const tx of transactions) {
      // Run the Shariah compliance agent
      const result: { status: "halal" | "haram" | "doubtful"; reason: string } = await ctx.runAction(
        internal.agents.shariahComplianceAgent.checkTransaction,
        {
          merchant: tx.merchantName,
          amount: tx.amount,
          description: tx.description,
        }
      );
      
      // Update the transaction
      await ctx.runMutation(internal.transactions.updateShariahStatus, {
        transactionId: tx._id as Id<"transactions">,
        status: result.status,
        reason: result.reason,
      });
      
      results.push({ merchant: tx.merchantName, status: result.status });
    }
    
    return { checked: results.length, results };
  },
});

// Internal query to get transactions needing Shariah check
export const getTransactionsNeedingShariahCheck = internalQuery({
  args: {
    userId: v.id("users"),
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    
    return transactions
      .filter(t => t.type === "expense" && !t.shariahStatus)
      .slice(0, args.limit)
      .map(t => ({
        _id: t._id,
        merchantName: t.merchantName,
        amount: t.amount,
        description: t.description,
      }));
  },
});

// Run Shariah compliance check on existing transactions that don't have a status
export const runShariahCheckForUser = mutation({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()), // Limit to avoid timeout
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    
    // Get transactions without Shariah status
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    
    // Filter to expenses without Shariah status
    const needsCheck = transactions
      .filter(t => t.type === "expense" && !t.shariahStatus)
      .slice(0, limit);
    
    // Schedule Shariah checks for each
    for (const tx of needsCheck) {
      await ctx.scheduler.runAfter(0, internal.transactions.checkShariahCompliance, {
        transactionId: tx._id,
        merchant: tx.merchantName,
        amount: tx.amount,
        description: tx.description,
      });
    }
    
    return {
      scheduled: needsCheck.length,
      remaining: transactions.filter(t => t.type === "expense" && !t.shariahStatus).length - needsCheck.length,
    };
  },
});

// Bulk import transactions (for seed data or bank imports)
export const bulkImport = mutation({
  args: {
    userId: v.id("users"),
    transactions: v.array(
      v.object({
        amount: v.number(),
        type: v.union(v.literal("expense"), v.literal("income"), v.literal("transfer")),
        description: v.string(),
        merchantName: v.string(),
        date: v.number(),
        sourceId: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const imported: Id<"transactions">[] = [];
    
    // Get all merchants for categorization
    const merchants = await ctx.db.query("merchants").collect();
    const merchantMap = new Map(
      merchants.map(m => [m.normalizedName, m])
    );
    
    for (const tx of args.transactions) {
      // Check for duplicate by sourceId
      if (tx.sourceId) {
        const existing = await ctx.db
          .query("transactions")
          .withIndex("by_source", (q) => 
            q.eq("userId", args.userId).eq("sourceId", tx.sourceId)
          )
          .first();
        
        if (existing) continue; // Skip duplicate
      }
      
      // Find merchant
      const normalizedName = tx.merchantName.toLowerCase().replace(/[^a-z0-9]/g, "");
      const merchant = merchantMap.get(normalizedName);
      
      const transactionId = await ctx.db.insert("transactions", {
        userId: args.userId,
        amount: tx.amount,
        type: tx.type,
        description: tx.description,
        categoryId: merchant?.defaultCategoryId,
        merchantId: merchant?._id,
        merchantName: tx.merchantName,
        date: tx.date,
        sourceId: tx.sourceId,
        isRecurring: false,
        isExcludedFromInsights: false,
        userCategorized: false,
        markedAsRegret: false,
        createdAt: now,
        updatedAt: now,
      });
      
      imported.push(transactionId);
    }
    
    return { imported: imported.length, skipped: args.transactions.length - imported.length };
  },
});

// Update a transaction's category
export const updateCategory = mutation({
  args: {
    transactionId: v.id("transactions"),
    categoryId: v.id("categories"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.transactionId, {
      categoryId: args.categoryId,
      userCategorized: true,
      updatedAt: Date.now(),
    });
    
    return { success: true };
  },
});

// Mark transaction as regret (impulse purchase)
export const markAsRegret = mutation({
  args: {
    transactionId: v.id("transactions"),
    regret: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.transactionId, {
      markedAsRegret: args.regret,
      updatedAt: Date.now(),
    });
    
    return { success: true };
  },
});

// Delete a transaction
export const remove = mutation({
  args: {
    transactionId: v.id("transactions"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.transactionId);
    return { success: true };
  },
});

// Get spending aggregated by category for a time period
export const getSpendingByCategory = query({
  args: {
    userId: v.id("users"),
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user_date", (q) => 
        q.eq("userId", args.userId)
          .gte("date", args.startDate)
          .lte("date", args.endDate)
      )
      .collect();
    
    // Only include expenses
    const expenses = transactions.filter(t => t.type === "expense");
    
    // Group by category
    const categoryTotals = new Map<string, {
      categoryId: Id<"categories"> | null;
      total: number;
      count: number;
      transactions: typeof expenses;
    }>();
    
    for (const tx of expenses) {
      const key = tx.categoryId ?? "uncategorized";
      const existing = categoryTotals.get(key.toString());
      
      if (existing) {
        existing.total += tx.amount;
        existing.count += 1;
        existing.transactions.push(tx);
      } else {
        categoryTotals.set(key.toString(), {
          categoryId: tx.categoryId ?? null,
          total: tx.amount,
          count: 1,
          transactions: [tx],
        });
      }
    }
    
    // Enrich with category details
    const results = await Promise.all(
      Array.from(categoryTotals.values()).map(async (cat) => {
        const category = cat.categoryId ? await ctx.db.get(cat.categoryId) : null;
        
        return {
          categoryId: cat.categoryId,
          categoryName: category?.name ?? "Uncategorized",
          categoryIcon: category?.icon ?? "❓",
          categoryColor: category?.color ?? "#999",
          total: Math.round(cat.total * 100) / 100,
          count: cat.count,
          percentage: 0, // Will calculate below
        };
      })
    );
    
    // Calculate percentages
    const totalSpent = results.reduce((sum, r) => sum + r.total, 0);
    for (const r of results) {
      r.percentage = totalSpent > 0 ? Math.round((r.total / totalSpent) * 100) : 0;
    }
    
    // Sort by total descending
    results.sort((a, b) => b.total - a.total);
    
    return {
      categories: results,
      totalSpent: Math.round(totalSpent * 100) / 100,
      transactionCount: expenses.length,
    };
  },
});

// Get spending summary (income, expenses, savings)
export const getSpendingSummary = query({
  args: {
    userId: v.id("users"),
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user_date", (q) => 
        q.eq("userId", args.userId)
          .gte("date", args.startDate)
          .lte("date", args.endDate)
      )
      .collect();
    
    let totalIncome = 0;
    let totalExpenses = 0;
    let totalTransfers = 0;
    let regretTotal = 0;
    let regretCount = 0;
    
    for (const tx of transactions) {
      if (tx.type === "income") {
        totalIncome += Math.abs(tx.amount);
      } else if (tx.type === "expense") {
        totalExpenses += tx.amount;
        if (tx.markedAsRegret) {
          regretTotal += tx.amount;
          regretCount++;
        }
      } else if (tx.type === "transfer") {
        totalTransfers += Math.abs(tx.amount);
      }
    }
    
    const savings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;
    
    return {
      totalIncome: Math.round(totalIncome * 100) / 100,
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      totalTransfers: Math.round(totalTransfers * 100) / 100,
      savings: Math.round(savings * 100) / 100,
      savingsRate: Math.round(savingsRate * 10) / 10,
      regretTotal: Math.round(regretTotal * 100) / 100,
      regretCount,
      transactionCount: transactions.length,
    };
  },
});

// Get spending trend (compare to previous period)
export const getSpendingTrend = query({
  args: {
    userId: v.id("users"),
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const periodLength = args.endDate - args.startDate;
    const previousStart = args.startDate - periodLength;
    const previousEnd = args.startDate;
    
    // Current period
    const currentTransactions = await ctx.db
      .query("transactions")
      .withIndex("by_user_date", (q) => 
        q.eq("userId", args.userId)
          .gte("date", args.startDate)
          .lte("date", args.endDate)
      )
      .collect();
    
    // Previous period
    const previousTransactions = await ctx.db
      .query("transactions")
      .withIndex("by_user_date", (q) => 
        q.eq("userId", args.userId)
          .gte("date", previousStart)
          .lte("date", previousEnd)
      )
      .collect();
    
    const currentExpenses = currentTransactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    
    const previousExpenses = previousTransactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    
    const change = previousExpenses > 0 
      ? ((currentExpenses - previousExpenses) / previousExpenses) * 100 
      : 0;
    
    return {
      currentPeriod: Math.round(currentExpenses * 100) / 100,
      previousPeriod: Math.round(previousExpenses * 100) / 100,
      change: Math.round(change * 10) / 10,
      direction: change > 0 ? "up" : change < 0 ? "down" : "same",
    };
  },
});

// Get top merchants by spending
export const getTopMerchants = query({
  args: {
    userId: v.id("users"),
    startDate: v.number(),
    endDate: v.number(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user_date", (q) => 
        q.eq("userId", args.userId)
          .gte("date", args.startDate)
          .lte("date", args.endDate)
      )
      .collect();
    
    const expenses = transactions.filter(t => t.type === "expense");
    
    // Group by merchant
    const merchantTotals = new Map<string, {
      merchantName: string;
      merchantId: Id<"merchants"> | undefined;
      total: number;
      count: number;
    }>();
    
    for (const tx of expenses) {
      const key = tx.merchantName;
      const existing = merchantTotals.get(key);
      
      if (existing) {
        existing.total += tx.amount;
        existing.count += 1;
      } else {
        merchantTotals.set(key, {
          merchantName: tx.merchantName,
          merchantId: tx.merchantId,
          total: tx.amount,
          count: 1,
        });
      }
    }
    
    // Sort and limit
    const sorted = Array.from(merchantTotals.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, limit);
    
    // Enrich with merchant details
    const results = await Promise.all(
      sorted.map(async (m) => {
        const merchant = m.merchantId ? await ctx.db.get(m.merchantId) : null;
        
        return {
          merchantName: m.merchantName,
          merchantId: m.merchantId,
          merchantLogo: merchant?.logo,
          total: Math.round(m.total * 100) / 100,
          count: m.count,
          avgTransaction: Math.round((m.total / m.count) * 100) / 100,
        };
      })
    );
    
    return results;
  },
});

// Get daily spending for a date range (for charts)
export const getDailySpending = query({
  args: {
    userId: v.id("users"),
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user_date", (q) => 
        q.eq("userId", args.userId)
          .gte("date", args.startDate)
          .lte("date", args.endDate)
      )
      .collect();
    
    const expenses = transactions.filter(t => t.type === "expense");
    
    // Group by day
    const dailyTotals = new Map<string, number>();
    
    for (const tx of expenses) {
      const day = new Date(tx.date).toISOString().split("T")[0];
      dailyTotals.set(day, (dailyTotals.get(day) ?? 0) + tx.amount);
    }
    
    // Fill in missing days with 0
    const result: { date: string; amount: number }[] = [];
    const current = new Date(args.startDate);
    const end = new Date(args.endDate);
    
    while (current <= end) {
      const day = current.toISOString().split("T")[0];
      result.push({
        date: day,
        amount: Math.round((dailyTotals.get(day) ?? 0) * 100) / 100,
      });
      current.setDate(current.getDate() + 1);
    }
    
    return result;
  },
});

// Search transactions
export const search = query({
  args: {
    userId: v.id("users"),
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    const searchLower = args.query.toLowerCase();
    
    // Get recent transactions and filter
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(500); // Search within last 500 transactions
    
    const matches = transactions.filter(tx => 
      tx.merchantName.toLowerCase().includes(searchLower) ||
      tx.description.toLowerCase().includes(searchLower) ||
      tx.notes?.toLowerCase().includes(searchLower)
    ).slice(0, limit);
    
    return matches;
  },
});

