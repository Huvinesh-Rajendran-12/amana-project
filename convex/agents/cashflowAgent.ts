/**
 * CASHFLOW_AGENT - AI-Powered Cashflow Analysis
 * Fetches real transaction data from the database
 * Uses system prompt from agentPrompts.ts
 * Integrated with RAG pipeline for Islamic finance context
 */

import { v } from "convex/values";
import { query, mutation, internalQuery, internalMutation, internalAction, action } from "../_generated/server";
import { internal } from "../_generated/api";
import { AGENT_PROMPTS } from "../lib/agentPrompts";
import { enhanceSystemPromptWithRAGContext } from "../lib/ragPipeline";
import { Anthropic } from "@anthropic-ai/sdk";
import { Id } from "../_generated/dataModel";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ==================== PUBLIC QUERIES ====================

/**
 * Get user's cashflow summary for a period
 */
export const getCashflowSummary = query({
  args: {
    userId: v.id("users"),
    periodDays: v.optional(v.number()), // default 30 days
  },
  handler: async (ctx, args) => {
    const periodDays = args.periodDays ?? 30;
    const now = Date.now();
    const startDate = now - periodDays * 24 * 60 * 60 * 1000;

    // Fetch transactions for the period
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", args.userId).gte("date", startDate)
      )
      .collect();

    // Calculate totals
    let totalIncome = 0;
    let totalExpenses = 0;
    let totalTransfers = 0;

    const expensesByCategory = new Map<string, number>();
    const incomeBySource = new Map<string, number>();

    for (const tx of transactions) {
      if (tx.type === "income") {
        totalIncome += Math.abs(tx.amount);
        const source = tx.merchantName || "Other";
        incomeBySource.set(source, (incomeBySource.get(source) ?? 0) + Math.abs(tx.amount));
      } else if (tx.type === "expense") {
        totalExpenses += tx.amount;
        const categoryId = tx.categoryId?.toString() ?? "uncategorized";
        expensesByCategory.set(categoryId, (expensesByCategory.get(categoryId) ?? 0) + tx.amount);
      } else if (tx.type === "transfer") {
        totalTransfers += Math.abs(tx.amount);
      }
    }

    // Calculate metrics
    const netCashflow = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (netCashflow / totalIncome) * 100 : 0;
    const dailyBurnRate = totalExpenses / periodDays;
    const monthlyBurnRate = dailyBurnRate * 30;

    // Get category names
    const categoryTotals = await Promise.all(
      Array.from(expensesByCategory.entries()).map(async ([catId, amount]) => {
        if (catId === "uncategorized") {
          return { categoryName: "Uncategorized", amount, icon: "❓" };
        }
        const category = await ctx.db.get(catId as Id<"categories">);
        return {
          categoryName: category?.name ?? "Unknown",
          amount,
          icon: category?.icon ?? "📦",
        };
      })
    );

    // Sort by amount
    categoryTotals.sort((a, b) => b.amount - a.amount);

    return {
      periodDays,
      totalIncome: Math.round(totalIncome * 100) / 100,
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      totalTransfers: Math.round(totalTransfers * 100) / 100,
      netCashflow: Math.round(netCashflow * 100) / 100,
      savingsRate: Math.round(savingsRate * 10) / 10,
      dailyBurnRate: Math.round(dailyBurnRate * 100) / 100,
      monthlyBurnRate: Math.round(monthlyBurnRate * 100) / 100,
      transactionCount: transactions.length,
      topCategories: categoryTotals.slice(0, 5),
      incomeBreakdown: Array.from(incomeBySource.entries()).map(([source, amount]) => ({
        source,
        amount: Math.round(amount * 100) / 100,
      })),
    };
  },
});

/**
 * Get the latest cashflow analysis for a user
 */
export const getLatestAnalysis = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const analysis = await ctx.db
      .query("cashflowAnalysis")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .first();

    return analysis;
  },
});

/**
 * Get cashflow analysis history
 */
export const getAnalysisHistory = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;

    const analyses = await ctx.db
      .query("cashflowAnalysis")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit);

    return analyses;
  },
});

// ==================== INTERNAL QUERIES ====================

/**
 * Internal query for getting cashflow summary (used by actions)
 */
export const getCashflowSummaryInternal = internalQuery({
  args: {
    userId: v.id("users"),
    periodDays: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const startDate = now - args.periodDays * 24 * 60 * 60 * 1000;

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", args.userId).gte("date", startDate)
      )
      .collect();

    let totalIncome = 0;
    let totalExpenses = 0;

    const expensesByCategory = new Map<string, number>();

    for (const tx of transactions) {
      if (tx.type === "income") {
        totalIncome += Math.abs(tx.amount);
      } else if (tx.type === "expense") {
        totalExpenses += tx.amount;
        const categoryId = tx.categoryId?.toString() ?? "uncategorized";
        expensesByCategory.set(categoryId, (expensesByCategory.get(categoryId) ?? 0) + tx.amount);
      }
    }

    const netCashflow = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (netCashflow / totalIncome) * 100 : 0;
    const monthlyBurnRate = (totalExpenses / args.periodDays) * 30;

    // Get category names
    const categoryTotals: Array<{ categoryName: string; amount: number; icon: string }> = [];
    
    for (const [catId, amount] of expensesByCategory.entries()) {
      if (catId === "uncategorized") {
        categoryTotals.push({ categoryName: "Uncategorized", amount, icon: "❓" });
      } else {
        const category = await ctx.db.get(catId as Id<"categories">);
        categoryTotals.push({
          categoryName: category?.name ?? "Unknown",
          amount,
          icon: category?.icon ?? "📦",
        });
      }
    }

    categoryTotals.sort((a, b) => b.amount - a.amount);

    return {
      totalIncome: Math.round(totalIncome * 100) / 100,
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      netCashflow: Math.round(netCashflow * 100) / 100,
      savingsRate: Math.round(savingsRate * 10) / 10,
      monthlyBurnRate: Math.round(monthlyBurnRate * 100) / 100,
      transactionCount: transactions.length,
      topCategories: categoryTotals.slice(0, 5),
    };
  },
});

/**
 * Internal query for getting user
 */
export const getUserInternal = internalQuery({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

// ==================== INTERNAL MUTATIONS ====================

/**
 * Store cashflow analysis result
 */
export const storeCashflowAnalysis = internalMutation({
  args: {
    userId: v.id("users"),
    periodDays: v.number(),
    summary: v.object({
      totalIncome: v.number(),
      totalExpenses: v.number(),
      netCashflow: v.number(),
      savingsRate: v.number(),
      monthlyBurnRate: v.number(),
    }),
    riskLevel: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const periodStart = now - args.periodDays * 24 * 60 * 60 * 1000;

    // Calculate period type
    const periodType: "daily" | "weekly" | "monthly" =
      args.periodDays <= 1 ? "daily" : args.periodDays <= 7 ? "weekly" : "monthly";

    await ctx.db.insert("cashflowAnalysis", {
      userId: args.userId,
      periodStart,
      periodEnd: now,
      periodType,
      burnRate: args.summary.monthlyBurnRate,
      burnRateTrend: 0, // TODO: Calculate from previous period
      savingsRate: args.summary.savingsRate,
      debtToIncomeRatio: 0, // TODO: Implement debt tracking
      liquidityRatio: 0, // TODO: Implement asset tracking
      emergencyFundMonths: 0, // TODO: Calculate from savings
      incomeBreakdown: {
        salary: args.summary.totalIncome, // Simplified for now
        business: 0,
        investments: 0,
        rental: 0,
        other: 0,
      },
      expenseBreakdown: {
        essential: args.summary.totalExpenses * 0.6, // Estimate
        discretionary: args.summary.totalExpenses * 0.3,
        debtPayments: 0,
        religiousObligations: 0,
        savings: args.summary.netCashflow > 0 ? args.summary.netCashflow : 0,
      },
      projectedBalance30Days: args.summary.netCashflow,
      projectedBalance90Days: args.summary.netCashflow * 3,
      riskLevel: args.riskLevel,
      createdAt: now,
    });
  },
});

// ==================== PUBLIC ACTIONS ====================

/**
 * Analyze user's cashflow and generate AI insights
 * This is the main function that powers the cashflow agent
 */
export const analyzeUserCashflow = action({
  args: {
    userId: v.id("users"),
    periodDays: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<{
    summary: {
      totalIncome: number;
      totalExpenses: number;
      netCashflow: number;
      savingsRate: number;
      monthlyBurnRate: number;
    };
    insight: string;
    recommendations: string[];
    riskLevel: "low" | "medium" | "high";
  }> => {
    const periodDays = args.periodDays ?? 30;

    // Fetch cashflow summary using internal query
    const summary = await ctx.runQuery(internal.agents.cashflowAgent.getCashflowSummaryInternal, {
      userId: args.userId,
      periodDays,
    });

    // Get user profile for context
    const user = await ctx.runQuery(internal.agents.cashflowAgent.getUserInternal, {
      userId: args.userId,
    });

    // Determine risk level
    let riskLevel: "low" | "medium" | "high" = "low";
    if (summary.savingsRate < 10) riskLevel = "high";
    else if (summary.savingsRate < 20) riskLevel = "medium";

    // Prepare context for AI
    const topCategoriesStr = summary.topCategories
      .map((c: { icon: string; categoryName: string; amount: number }, i: number) => 
        `${i + 1}. ${c.icon} ${c.categoryName}: RM${c.amount.toFixed(2)}`
      )
      .join("\n");

    const financialContext = `
User Profile:
- Monthly Income: RM${user?.monthlyIncome ?? summary.totalIncome}
- Currency: ${user?.currency ?? "MYR"}
- Location: ${user?.city ?? "Malaysia"}

${periodDays}-Day Financial Summary:
- Total Income: RM${summary.totalIncome.toFixed(2)}
- Total Expenses: RM${summary.totalExpenses.toFixed(2)}
- Net Cashflow: RM${summary.netCashflow.toFixed(2)}
- Savings Rate: ${summary.savingsRate.toFixed(1)}%
- Monthly Burn Rate: RM${summary.monthlyBurnRate.toFixed(2)}

Top Spending Categories:
${topCategoriesStr}

Transactions: ${summary.transactionCount} in the last ${periodDays} days
`;

    // Enhance system prompt with Islamic finance context
    const enhancedSystemPrompt = enhanceSystemPromptWithRAGContext(
      AGENT_PROMPTS.CASHFLOW_AGENT.systemPrompt,
      "general"
    );

    // Generate AI insight
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      system: enhancedSystemPrompt,
      messages: [
        {
          role: "user",
          content: `${financialContext}

Based on this financial data, provide:
1. A brief personalized insight about their cashflow health (2-3 sentences)
2. Connect to Islamic financial goals when relevant (Zakat eligibility at RM2,082.50 nisab, Hajj savings, avoiding riba)
3. List 2-3 specific actionable recommendations

Format your response as:
INSIGHT: [Your insight here]

RECOMMENDATIONS:
- [Recommendation 1]
- [Recommendation 2]
- [Recommendation 3]`,
        },
      ],
    });

    const aiResponse = response.content[0].type === "text" ? response.content[0].text : "";

    // Parse AI response
    const insightMatch = aiResponse.match(/INSIGHT:\s*(.+?)(?=RECOMMENDATIONS:|$)/s);
    const recommendationsMatch = aiResponse.match(/RECOMMENDATIONS:\s*([\s\S]+)/);

    const insight = insightMatch?.[1]?.trim() ?? aiResponse;
    const recommendations = recommendationsMatch?.[1]
      ?.split("\n")
      .filter((line: string) => line.trim().startsWith("-"))
      .map((line: string) => line.replace(/^-\s*/, "").trim())
      .filter((r: string) => r.length > 0) ?? [];

    // Store analysis in database
    await ctx.runMutation(internal.agents.cashflowAgent.storeCashflowAnalysis, {
      userId: args.userId,
      periodDays,
      summary: {
        totalIncome: summary.totalIncome,
        totalExpenses: summary.totalExpenses,
        netCashflow: summary.netCashflow,
        savingsRate: summary.savingsRate,
        monthlyBurnRate: summary.monthlyBurnRate,
      },
      riskLevel,
    });

    return {
      summary: {
        totalIncome: summary.totalIncome,
        totalExpenses: summary.totalExpenses,
        netCashflow: summary.netCashflow,
        savingsRate: summary.savingsRate,
        monthlyBurnRate: summary.monthlyBurnRate,
      },
      insight,
      recommendations,
      riskLevel,
    };
  },
});

/**
 * Chat with the cashflow agent about your finances
 */
export const chat = action({
  args: {
    userId: v.id("users"),
    message: v.string(),
  },
  handler: async (ctx, args): Promise<{
    response: string;
    relatedInsights?: string[];
  }> => {
    // Get user's financial context
    const summary = await ctx.runQuery(internal.agents.cashflowAgent.getCashflowSummaryInternal, {
      userId: args.userId,
      periodDays: 30,
    });

    const user = await ctx.runQuery(internal.agents.cashflowAgent.getUserInternal, {
      userId: args.userId,
    });

    // Build category string
    const topCategoriesStr = summary.topCategories
      .map((c: { icon: string; categoryName: string; amount: number }) => 
        `- ${c.icon} ${c.categoryName}: RM${c.amount.toFixed(2)}`
      )
      .join("\n");

    // Build context
    const financialContext = `
User's Current Financial Status (Last 30 Days):
- Total Income: RM${summary.totalIncome.toFixed(2)}
- Total Expenses: RM${summary.totalExpenses.toFixed(2)}
- Net Cashflow: RM${summary.netCashflow.toFixed(2)}
- Savings Rate: ${summary.savingsRate.toFixed(1)}%
- Monthly Burn Rate: RM${summary.monthlyBurnRate.toFixed(2)}
- User's Monthly Income: RM${user?.monthlyIncome ?? "Unknown"}

Top Spending Categories:
${topCategoriesStr}
`;

    // Enhance with RAG context based on message content
    const messageLower = args.message.toLowerCase();
    let ragContext: "shariah" | "zakat" | "hajj" | "transaction" | "loan" | "general" = "general";
    
    if (messageLower.includes("zakat")) {
      ragContext = "zakat";
    } else if (messageLower.includes("hajj")) {
      ragContext = "hajj";
    } else if (messageLower.includes("riba") || messageLower.includes("interest") || messageLower.includes("loan")) {
      ragContext = "loan";
    } else if (messageLower.includes("halal") || messageLower.includes("haram") || messageLower.includes("shariah")) {
      ragContext = "shariah";
    }

    const enhancedSystemPrompt = enhanceSystemPromptWithRAGContext(
      AGENT_PROMPTS.CASHFLOW_AGENT.systemPrompt,
      ragContext
    );

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 400,
      system: `${enhancedSystemPrompt}

You are chatting with a user about their personal finances. Be helpful, specific, and reference their actual financial data when relevant. Keep responses concise but actionable.

${financialContext}`,
      messages: [
        {
          role: "user",
          content: args.message,
        },
      ],
    });

    const aiResponse = response.content[0].type === "text" ? response.content[0].text : "";

    return {
      response: aiResponse,
    };
  },
});

// ==================== LEGACY SUPPORT ====================

/**
 * Original analyzeTransactions function (kept for backward compatibility)
 * @deprecated Use analyzeUserCashflow instead
 */
export const analyzeTransactions = internalAction({
  args: {
    transactions: v.array(
      v.object({
        amount: v.number(),
        type: v.string(),
        description: v.string(),
      })
    ),
  },
  handler: async (ctx, args): Promise<{
    totalIncome: number;
    totalExpenses: number;
    monthlyBurn: number;
    insight: string;
  }> => {
    const totalIncome: number = args.transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses: number = args.transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyBurn: number = (totalExpenses / 90) * 30;
    const monthlySavings: number = (totalIncome / 90) * 30;
    const savingsRate: number =
      monthlySavings > 0 ? ((monthlySavings - monthlyBurn) / monthlySavings) * 100 : 0;

    // Enhance system prompt with Islamic finance context
    const enhancedSystemPrompt = enhanceSystemPromptWithRAGContext(
      AGENT_PROMPTS.CASHFLOW_AGENT.systemPrompt,
      "general"
    );

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 200,
      system: enhancedSystemPrompt,
      messages: [
        {
          role: "user",
          content: `Monthly Income: RM${monthlySavings.toFixed(0)}
Monthly Expenses: RM${monthlyBurn.toFixed(0)}
Savings Rate: ${savingsRate.toFixed(1)}%

Provide one actionable insight. Connect to Islamic financial goals when relevant (Zakat eligibility, Hajj savings potential).`,
        },
      ],
    });

    const insight: string =
      response.content[0].type === "text" ? response.content[0].text : "";

    return { totalIncome, totalExpenses, monthlyBurn, insight };
  },
});
