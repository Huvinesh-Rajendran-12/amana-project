/**
 * Chat module - Real-time AI chat using Anthropic Claude.
 * Routes messages to appropriate agents based on content.
 * Also provides AI-powered insights for transactions and analytics.
 */

import { v } from "convex/values";
import { action, query, mutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { AGENT_PROMPTS, ISLAMIC_FINANCE_MESSAGES } from "./lib/agentPrompts";
import { COACHING_STYLES } from "./lib/ai";

// ============== AI INSIGHTS FOR TRANSACTIONS ==============

// Get transaction analysis data
export const getTransactionAnalysisData = internalQuery({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;

    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

    // Get recent transactions
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", args.userId).gte("date", thirtyDaysAgo)
      )
      .order("desc")
      .take(100);

    // Calculate totals
    const expenses = transactions.filter((t) => t.type === "expense");
    const income = transactions.filter((t) => t.type === "income");
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    const regretTransactions = transactions.filter((t) => t.markedAsRegret);
    const regretTotal = regretTransactions.reduce((sum, t) => sum + t.amount, 0);

    // Get spending by category
    const categorySpending = new Map<string, { amount: number; count: number }>();
    for (const tx of expenses) {
      if (tx.categoryId) {
        const category = await ctx.db.get(tx.categoryId);
        const categoryName = category?.name ?? "Other";
        const current = categorySpending.get(categoryName) ?? { amount: 0, count: 0 };
        categorySpending.set(categoryName, {
          amount: current.amount + tx.amount,
          count: current.count + 1,
        });
      }
    }

    const categories = Array.from(categorySpending.entries())
      .map(([name, data]) => ({
        name,
        amount: data.amount,
        count: data.count,
        percentage: totalExpenses > 0 ? (data.amount / totalExpenses) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    // Calculate savings rate
    const monthlyIncome = user.monthlyIncome ?? totalIncome;
    const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - totalExpenses) / monthlyIncome) * 100 : 0;

    return {
      user: {
        name: user.name,
        currency: user.currency ?? "MYR",
        monthlyIncome,
        activeMode: user.activeMode,
      },
      summary: {
        totalExpenses,
        totalIncome,
        transactionCount: transactions.length,
        expenseCount: expenses.length,
        incomeCount: income.length,
        savingsRate,
        regretCount: regretTransactions.length,
        regretTotal,
      },
      categories,
      recentTransactions: transactions.slice(0, 10).map((t) => ({
        merchantName: t.merchantName,
        amount: t.amount,
        type: t.type,
        isRegret: t.markedAsRegret,
      })),
    };
  },
});

// Generate AI-powered transaction insights
export const generateTransactionInsights = action({
  args: {
    userId: v.id("users"),
    isIslamic: v.boolean(),
  },
  handler: async (ctx, args): Promise<{
    insights: Array<{
      title: string;
      message: string;
      type: "info" | "success" | "warning" | "tip";
      actionLabel?: string;
    }>;
  }> => {
    // Get transaction data
    const data = await ctx.runQuery(internal.chat.getTransactionAnalysisData, {
      userId: args.userId,
    });

    if (!data) {
      return {
        insights: [{
          title: "No data available",
          message: "Add some transactions to get AI-powered insights.",
          type: "info",
        }],
      };
    }

    const anthropicApiKey = process.env.ANTHROPIC_API_KEY;

    if (!anthropicApiKey) {
      // Fallback to rule-based insights
      return { insights: generateFallbackTransactionInsights(data, args.isIslamic) };
    }

    const systemPrompt = `You are a financial analyst AI for a ${args.isIslamic ? "Shariah-compliant " : ""}personal finance app in Malaysia.

Analyze the user's transaction data and provide exactly 3 short, actionable insights.

Guidelines:
- Each insight must be 1-2 sentences max
- Be specific with numbers from the data
- Use ${data.user.currency} currency (format: RM X,XXX.XX)
- Focus on actionable advice
- Vary the insight types (mix of warnings, tips, and celebrations)
${args.isIslamic ? "- Consider Islamic finance principles (halal spending, Zakat implications, avoiding riba)" : ""}

Return JSON array with exactly 3 objects, each with:
- title: string (5-8 words max)
- message: string (1-2 sentences)
- type: "info" | "success" | "warning" | "tip"
- actionLabel: string (optional, 2-3 words for a call-to-action button)

Only return valid JSON, no other text.`;

    const userPrompt = `User: ${data.user.name}
Monthly Income: RM ${data.user.monthlyIncome?.toLocaleString() ?? "Unknown"}

Last 30 Days Summary:
- Total Expenses: RM ${data.summary.totalExpenses.toFixed(2)}
- Total Income: RM ${data.summary.totalIncome.toFixed(2)}
- Transactions: ${data.summary.transactionCount}
- Savings Rate: ${data.summary.savingsRate.toFixed(1)}%
- Impulse Purchases: ${data.summary.regretCount} (RM ${data.summary.regretTotal.toFixed(2)})

Top Spending Categories:
${data.categories.slice(0, 5).map((c: { name: string; amount: number; percentage: number }) => `- ${c.name}: RM ${c.amount.toFixed(2)} (${c.percentage.toFixed(0)}%)`).join("\n")}

Recent Merchants: ${data.recentTransactions.map((t: { merchantName: string }) => t.merchantName).slice(0, 5).join(", ")}

Generate 3 personalized insights.`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": anthropicApiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-3-haiku-20240307",
          max_tokens: 500,
          system: systemPrompt,
          messages: [{ role: "user", content: userPrompt }],
        }),
      });

      if (!response.ok) {
        console.error("Claude API error:", response.status);
        return { insights: generateFallbackTransactionInsights(data, args.isIslamic) };
      }

      const result = await response.json();
      const text = result.content[0].text;

      // Parse JSON from response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const insights = JSON.parse(jsonMatch[0]);
        return { insights };
      }

      return { insights: generateFallbackTransactionInsights(data, args.isIslamic) };
    } catch (error) {
      console.error("Transaction insights error:", error);
      return { insights: generateFallbackTransactionInsights(data, args.isIslamic) };
    }
  },
});

// Fallback insights when API unavailable
function generateFallbackTransactionInsights(
  data: any,
  isIslamic: boolean
): Array<{ title: string; message: string; type: "info" | "success" | "warning" | "tip"; actionLabel?: string }> {
  const insights: Array<{ title: string; message: string; type: "info" | "success" | "warning" | "tip"; actionLabel?: string }> = [];
  const currency = data.user.currency ?? "MYR";
  const formatAmount = (n: number) => `RM ${n.toFixed(2)}`;

  // Top category insight
  if (data.categories.length > 0) {
    const top = data.categories[0];
    if (top.percentage > 40) {
      insights.push({
        title: `${top.name} dominates spending`,
        message: `${top.percentage.toFixed(0)}% of your spending (${formatAmount(top.amount)}) goes to ${top.name}. Consider setting a budget limit.`,
        type: "warning",
        actionLabel: "Set budget",
      });
    } else {
      insights.push({
        title: "Balanced spending pattern",
        message: `Your top category is ${top.name} at ${top.percentage.toFixed(0)}%. Well-diversified spending!`,
        type: "success",
      });
    }
  }

  // Impulse purchases
  if (data.summary.regretCount > 0) {
    insights.push({
      title: `${data.summary.regretCount} impulse buy${data.summary.regretCount > 1 ? "s" : ""} flagged`,
      message: `You've marked ${formatAmount(data.summary.regretTotal)} as impulse purchases. That's potential savings!`,
      type: "warning",
      actionLabel: "Review",
    });
  }

  // Savings rate
  if (data.summary.savingsRate >= 20) {
    insights.push({
      title: "Strong savings discipline",
      message: `${data.summary.savingsRate.toFixed(0)}% savings rate is excellent! You're building wealth effectively.`,
      type: "success",
    });
  } else if (data.summary.savingsRate >= 0) {
    insights.push({
      title: "Savings rate needs work",
      message: `At ${data.summary.savingsRate.toFixed(0)}%, aim for 20%+ to build a solid financial cushion.`,
      type: "tip",
      actionLabel: "Find savings",
    });
  }

  // Islamic-specific
  if (isIslamic && insights.length < 3) {
    insights.push({
      title: "Track Shariah compliance",
      message: "Review your transactions regularly to ensure they align with Islamic finance principles.",
      type: "tip",
      actionLabel: "Review",
    });
  }

  // Fill remaining slots
  while (insights.length < 3) {
    insights.push({
      title: "Keep tracking",
      message: "Continue logging transactions for more personalized AI insights over time.",
      type: "info",
    });
  }

  return insights.slice(0, 3);
}

// Store chat messages
export const storeMessage = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // For now, we don't persist chat messages to keep it simple
    // In a full implementation, you'd store these in a chatMessages table
    return { success: true };
  },
});

// Get user context for chat
export const getUserContext = internalQuery({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;

    // Get recent transactions
    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user_date", (q) => 
        q.eq("userId", args.userId).gte("date", thirtyDaysAgo)
      )
      .order("desc")
      .take(20);

    // Calculate spending summary
    const expenses = transactions.filter(t => t.type === "expense");
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
    const income = transactions.filter(t => t.type === "income");
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    
    const monthlyIncome = user.monthlyIncome ?? 7000;
    const savings = monthlyIncome - totalExpenses;
    const savingsRate = monthlyIncome > 0 ? (savings / monthlyIncome) * 100 : 0;

    // Get spending by category
    const categorySpending = new Map<string, number>();
    for (const tx of expenses) {
      if (tx.categoryId) {
        const category = await ctx.db.get(tx.categoryId);
        const categoryName = category?.name ?? "Other";
        categorySpending.set(categoryName, (categorySpending.get(categoryName) ?? 0) + tx.amount);
      }
    }
    
    const topCategories = Array.from(categorySpending.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, amount]) => ({ name, amount }));

    return {
      user: {
        name: user.name,
        currency: user.currency,
        monthlyIncome: user.monthlyIncome,
        coachingStyle: user.coachingStyle,
        activeMode: user.activeMode,
      },
      spending: {
        totalExpenses,
        totalIncome,
        savings,
        savingsRate,
        transactionCount: transactions.length,
        topCategories,
      },
      recentTransactions: transactions.slice(0, 5).map(t => ({
        merchantName: t.merchantName,
        amount: t.amount,
        type: t.type,
        date: t.date,
      })),
    };
  },
});

// Get Zakat-relevant financial data for user
export const getZakatContext = internalQuery({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;

    const now = Date.now();
    const oneYearAgo = now - 365 * 24 * 60 * 60 * 1000;

    // Get bank connections and balances
    const bankConnections = await ctx.db
      .query("bankConnections")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Get latest Zakat calculation if exists
    const latestZakatCalc = await ctx.db
      .query("zakatCalculations")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .first();

    // Get Hajj savings if any
    const hajjGoal = await ctx.db
      .query("hajjSavingsGoals")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    // Calculate cash from income transactions over the year
    const yearTransactions = await ctx.db
      .query("transactions")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", args.userId).gte("date", oneYearAgo)
      )
      .collect();

    const totalIncome = yearTransactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = yearTransactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    // Estimate cash balance from transaction flow
    const estimatedCashBalance = totalIncome - totalExpenses;

    // Get latest nisab price
    const latestNisab = await ctx.db
      .query("nisabPrices")
      .withIndex("by_date")
      .order("desc")
      .first();

    // Current nisab threshold (default to ~27,200 MYR for 85g gold)
    const nisabThreshold = latestNisab?.goldNisabValue ?? 27200;

    // Build comprehensive Zakat context
    return {
      hasExistingCalculation: !!latestZakatCalc,
      lastCalculation: latestZakatCalc ? {
        date: latestZakatCalc.calculationDate,
        totalAssets: latestZakatCalc.totalZakatableAssets,
        zakatAmount: latestZakatCalc.zakatAmount,
        paymentStatus: latestZakatCalc.paymentStatus,
        amountPaid: latestZakatCalc.amountPaid,
        assets: latestZakatCalc.assets,
      } : null,
      estimatedAssets: {
        cashBalance: Math.max(0, estimatedCashBalance),
        bankAccounts: bankConnections.map(b => ({
          bank: b.bankName,
          isIslamic: b.isIslamicAccount,
          lastSync: b.lastSyncAt,
        })),
        tabungHaji: hajjGoal?.tabungHajiBalance ?? 0,
        monthlyIncome: user.monthlyIncome ?? 0,
      },
      nisab: {
        threshold: nisabThreshold,
        priceDate: latestNisab?.date ?? now,
      },
      transactionSummary: {
        yearlyIncome: totalIncome,
        yearlyExpenses: totalExpenses,
        transactionCount: yearTransactions.length,
      },
    };
  },
});

// Determine which agent to route to based on message content
function routeToAgent(message: string, isIslamic: boolean): string {
  const lowerMessage = message.toLowerCase();
  
  // Islamic finance keywords
  if (lowerMessage.includes("zakat") || lowerMessage.includes("zakah")) {
    return "ZAKAT_AGENT";
  }
  if (lowerMessage.includes("hajj") || lowerMessage.includes("haji") || lowerMessage.includes("pilgrimage") || lowerMessage.includes("tabung haji")) {
    return "HAJJ_SAVINGS_AGENT";
  }
  if (lowerMessage.includes("halal") || lowerMessage.includes("haram") || lowerMessage.includes("shariah") || lowerMessage.includes("syariah") || lowerMessage.includes("riba") || lowerMessage.includes("islamic")) {
    return "SHARIAH_COMPLIANCE_AGENT";
  }
  
  // Financial keywords
  if (lowerMessage.includes("spending") || lowerMessage.includes("spent") || lowerMessage.includes("expense") || lowerMessage.includes("budget") || lowerMessage.includes("cashflow") || lowerMessage.includes("saving")) {
    return "CASHFLOW_AGENT";
  }
  if (lowerMessage.includes("risk") || lowerMessage.includes("market") || lowerMessage.includes("invest") || lowerMessage.includes("stock") || lowerMessage.includes("portfolio")) {
    return "INDUSTRY_RISK_AGENT";
  }
  
  // Default based on mode
  return isIslamic ? "SHARIAH_COMPLIANCE_AGENT" : "CASHFLOW_AGENT";
}

// Build system prompt based on agent and user context
function buildSystemPrompt(
  agentName: string, 
  userContext: any, 
  isIslamic: boolean,
  zakatContext?: any
): string {
  const agent = AGENT_PROMPTS[agentName as keyof typeof AGENT_PROMPTS];
  const coachingStyle = COACHING_STYLES[userContext?.user?.coachingStyle as keyof typeof COACHING_STYLES] ?? COACHING_STYLES.gentle;
  
  let systemPrompt = agent?.systemPrompt ?? AGENT_PROMPTS.CASHFLOW_AGENT.systemPrompt;
  
  // Add coaching style
  systemPrompt += `\n\n--- COACHING STYLE ---\n${coachingStyle.systemPrompt}`;
  
  // Add user context
  if (userContext) {
    systemPrompt += `\n\n--- USER CONTEXT ---
User Name: ${userContext.user?.name ?? "User"}
Currency: ${userContext.user?.currency ?? "MYR"}
Monthly Income: RM ${userContext.user?.monthlyIncome ?? "Not specified"}
Active Mode: ${userContext.user?.activeMode ?? "normal"}

Current Month Spending: RM ${userContext.spending?.totalExpenses?.toFixed(2) ?? 0}
Savings Rate: ${userContext.spending?.savingsRate?.toFixed(1) ?? 0}%
Top Spending Categories: ${userContext.spending?.topCategories?.map((c: any) => `${c.name}: RM${c.amount.toFixed(2)}`).join(", ") ?? "None yet"}`;
  }

  // Add Zakat-specific context when relevant
  if (agentName === "ZAKAT_AGENT" && zakatContext) {
    systemPrompt += `\n\n--- ZAKAT FINANCIAL DATA (USE THIS TO CALCULATE ZAKAT) ---
You have access to the user's financial data. USE THIS DATA to calculate Zakat - don't ask for information you already have.

CURRENT NISAB THRESHOLD: RM ${zakatContext.nisab?.threshold?.toLocaleString() ?? "27,200"} (based on 85g gold)

ESTIMATED ASSETS FROM TRANSACTION DATA:
- Estimated Cash/Bank Balance: RM ${zakatContext.estimatedAssets?.cashBalance?.toLocaleString() ?? 0}
- Monthly Income: RM ${zakatContext.estimatedAssets?.monthlyIncome?.toLocaleString() ?? 0}
- Tabung Haji Balance: RM ${zakatContext.estimatedAssets?.tabungHaji?.toLocaleString() ?? 0}
- Connected Bank Accounts: ${zakatContext.estimatedAssets?.bankAccounts?.length ?? 0} accounts

YEARLY TRANSACTION SUMMARY:
- Total Income (12 months): RM ${zakatContext.transactionSummary?.yearlyIncome?.toLocaleString() ?? 0}
- Total Expenses (12 months): RM ${zakatContext.transactionSummary?.yearlyExpenses?.toLocaleString() ?? 0}
- Net Savings (estimated zakatable cash): RM ${(zakatContext.transactionSummary?.yearlyIncome - zakatContext.transactionSummary?.yearlyExpenses)?.toLocaleString() ?? 0}

${zakatContext.hasExistingCalculation ? `PREVIOUS ZAKAT CALCULATION:
- Last Calculated: ${new Date(zakatContext.lastCalculation.date).toLocaleDateString()}
- Total Assets: RM ${zakatContext.lastCalculation.totalAssets?.toLocaleString()}
- Zakat Due: RM ${zakatContext.lastCalculation.zakatAmount?.toLocaleString()}
- Payment Status: ${zakatContext.lastCalculation.paymentStatus}
- Amount Paid: RM ${zakatContext.lastCalculation.amountPaid?.toLocaleString()}` : "No previous Zakat calculation on record."}

IMPORTANT: Calculate Zakat using the available data. Only ask for information you DON'T have (like gold/silver holdings, investments, business inventory). Provide a preliminary estimate based on cash/savings data.`;
  }

  // Add Islamic context if needed
  if (isIslamic) {
    systemPrompt += `\n\n--- ISLAMIC FINANCE MODE ---
The user prefers Shariah-compliant financial guidance. Always consider:
- Avoiding riba (interest)
- Halal investment options
- Zakat obligations
- Islamic financial products (Takaful, Sukuk, Islamic banking)
Use appropriate Islamic greetings and references.`;
  }

  systemPrompt += `\n\n--- RESPONSE GUIDELINES ---
- Keep responses concise (2-4 sentences)
- Be actionable and specific
- Use the user's currency (RM/MYR)
- Reference their actual data when relevant
- Be encouraging but honest`;

  return systemPrompt;
}

// Main chat action - calls Claude API
export const sendMessage = action({
  args: {
    userId: v.id("users"),
    message: v.string(),
    isIslamic: v.boolean(),
  },
  handler: async (ctx, args): Promise<{ response: string; agent: string }> => {
    // Get user context
    const userContext = await ctx.runQuery(internal.chat.getUserContext, {
      userId: args.userId,
    });

    // Route to appropriate agent
    const agentName = routeToAgent(args.message, args.isIslamic);
    
    // Get Zakat context if routing to Zakat agent
    let zakatContext = null;
    if (agentName === "ZAKAT_AGENT") {
      zakatContext = await ctx.runQuery(internal.chat.getZakatContext, {
        userId: args.userId,
      });
    }
    
    // Build system prompt
    const systemPrompt = buildSystemPrompt(agentName, userContext, args.isIslamic, zakatContext);

    // Check for API key
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!anthropicApiKey) {
      // Return smart fallback response based on context
      return {
        response: generateFallbackResponse(args.message, agentName, userContext, args.isIslamic),
        agent: agentName,
      };
    }

    // Use claude-haiku-4-5 for Zakat agent, otherwise use default
    const model = agentName === "ZAKAT_AGENT" ? "claude-haiku-4-5" : "claude-3-haiku-20240307";
    
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": anthropicApiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: model,
          max_tokens: 500,
          system: systemPrompt,
          messages: [
            { role: "user", content: args.message },
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Claude API error:", response.status, errorText);
        // Fall back to smart response
        return {
          response: generateFallbackResponse(
            args.message,
            agentName,
            userContext,
            args.isIslamic,
            zakatContext ?? undefined
          ),
          agent: agentName,
        };
      }

      const data = await response.json();
      const aiResponse = data.content[0].text;

      return {
        response: aiResponse,
        agent: agentName,
      };
    } catch (error) {
      console.error("Chat error:", error);
      return {
        response: generateFallbackResponse(
          args.message,
          agentName,
          userContext,
          args.isIslamic,
          zakatContext ?? undefined
        ),
        agent: agentName,
      };
    }
  },
});

// Generate contextual fallback responses when API is unavailable
function generateFallbackResponse(
  message: string,
  agentName: string,
  userContext: any,
  isIslamic: boolean,
  zakatContext?: any
): string {
  const lowerMessage = message.toLowerCase();
  const currency = userContext?.user?.currency ?? "MYR";
  const spending = userContext?.spending;
  
  // Zakat-related - use comprehensive Zakat context when available
  if (agentName === "ZAKAT_AGENT" || lowerMessage.includes("zakat")) {
    const nisab = zakatContext?.nisab?.threshold ?? 27200;
    
    // Use Zakat context if available
    if (zakatContext) {
      const estimatedCash = zakatContext.estimatedAssets?.cashBalance ?? 0;
      const tabungHaji = zakatContext.estimatedAssets?.tabungHaji ?? 0;
      const netSavings = (zakatContext.transactionSummary?.yearlyIncome ?? 0) - (zakatContext.transactionSummary?.yearlyExpenses ?? 0);
      const totalEstimatedWealth = Math.max(estimatedCash, netSavings) + tabungHaji;
      
      // Check if they have a previous calculation
      if (zakatContext.hasExistingCalculation && zakatContext.lastCalculation) {
        const lastCalc = zakatContext.lastCalculation;
        const remainingZakat = lastCalc.zakatAmount - lastCalc.amountPaid;
        
        if (remainingZakat > 0) {
          return `Assalamu'alaikum! Based on your last Zakat calculation on ${new Date(lastCalc.date).toLocaleDateString()}, you have RM ${remainingZakat.toLocaleString()} remaining Zakat to pay (total due: RM ${lastCalc.zakatAmount.toLocaleString()}). Your total zakatable assets were RM ${lastCalc.totalAssets.toLocaleString()}. Would you like me to recalculate based on your current assets, or help you arrange payment to your state Zakat authority?`;
        }
        return `Assalamu'alaikum! Your last Zakat calculation shows you've fulfilled your obligation of RM ${lastCalc.zakatAmount.toLocaleString()}. Based on your current transaction data, your estimated wealth is now RM ${totalEstimatedWealth.toLocaleString()}. ${totalEstimatedWealth >= nisab ? `This exceeds the nisab threshold of RM ${nisab.toLocaleString()}, so you may have new Zakat obligations.` : `This is below the nisab threshold of RM ${nisab.toLocaleString()}.`} Would you like me to do a fresh calculation?`;
      }
      
      // No previous calculation - provide estimate based on available data
      if (totalEstimatedWealth >= nisab) {
        const estimatedZakat = totalEstimatedWealth * 0.025;
        return `Assalamu'alaikum! Based on your financial data:\n\n• Estimated Cash/Savings: RM ${Math.max(estimatedCash, netSavings).toLocaleString()}\n• Tabung Haji: RM ${tabungHaji.toLocaleString()}\n• Total: RM ${totalEstimatedWealth.toLocaleString()}\n\nThis exceeds the nisab threshold of RM ${nisab.toLocaleString()}. Your preliminary Zakat estimate is **RM ${estimatedZakat.toFixed(2)}** (2.5%).\n\nTo complete the calculation, do you have any gold, silver, or other investments to include?`;
      } else {
        return `Assalamu'alaikum! Based on your transaction history, your estimated wealth is RM ${totalEstimatedWealth.toLocaleString()}, which is below the current nisab threshold of RM ${nisab.toLocaleString()} (85g gold value). Zakat becomes obligatory when your wealth exceeds nisab for one lunar year. Keep building your savings - you're making good progress! Do you have any gold, silver, or investments not reflected in your transactions?`;
      }
    }
    
    // Fallback if no Zakat context
    if (spending?.savings > 0) {
      const estimatedAnnualSavings = spending.savings * 12;
      const zakatDue = estimatedAnnualSavings >= nisab ? estimatedAnnualSavings * 0.025 : 0;
      
      if (zakatDue > 0) {
        return `Assalamu'alaikum! Based on your estimated annual savings of RM ${estimatedAnnualSavings.toFixed(2)}, your Zakat obligation would be approximately RM ${zakatDue.toFixed(2)} (2.5% of wealth above nisab). The nisab threshold is currently around RM ${nisab.toLocaleString()}. Would you like me to help you set up a Zakat payment plan?`;
      } else {
        return `Assalamu'alaikum! Your current savings are below the nisab threshold (RM ${nisab.toLocaleString()}). Zakat becomes obligatory when your wealth exceeds this amount for one lunar year. Keep building your savings, and I'll notify you when you approach the threshold.`;
      }
    }
    return "Assalamu'alaikum! To calculate your Zakat accurately, I'll need to know your total zakatable assets including cash, gold, silver, and investments held for one lunar year above the nisab threshold. Would you like me to guide you through the calculation?";
  }

  // Hajj-related
  if (agentName === "HAJJ_SAVINGS_AGENT" || lowerMessage.includes("hajj")) {
    const monthlySavings = spending?.savings ?? 0;
    const hajjCost = 45000;
    if (monthlySavings > 0) {
      const monthsToGoal = Math.ceil(hajjCost / monthlySavings);
      const years = Math.floor(monthsToGoal / 12);
      const months = monthsToGoal % 12;
      return `MasyaAllah! At your current savings rate of RM ${monthlySavings.toFixed(2)}/month, you could reach the Hajj goal of RM ${hajjCost.toLocaleString()} in approximately ${years > 0 ? `${years} years and ` : ""}${months} months. Would you like me to help you set up a dedicated Hajj savings plan with Tabung Haji?`;
    }
    return "The estimated cost for Hajj is around RM 45,000. I can help you create a savings plan based on your income. How many years would you like to save over?";
  }

  // Shariah compliance
  if (agentName === "SHARIAH_COMPLIANCE_AGENT" || lowerMessage.includes("halal") || lowerMessage.includes("shariah") || lowerMessage.includes("islamic")) {
    return "I can help ensure your finances align with Islamic principles. This includes checking transactions for Shariah compliance, tracking riba (interest) for purification, and guiding you on halal investments like Sukuk, ASNB Islamic funds, and Shariah-compliant ETFs. What specific aspect would you like to explore?";
  }

  // Spending analysis
  if (lowerMessage.includes("spending") || lowerMessage.includes("spent") || lowerMessage.includes("expense")) {
    if (spending) {
      const topCategory = spending.topCategories?.[0];
      return `This month, you've spent RM ${spending.totalExpenses.toFixed(2)} across ${spending.transactionCount} transactions. ${topCategory ? `Your highest spending category is ${topCategory.name} at RM ${topCategory.amount.toFixed(2)}. ` : ""}Your current savings rate is ${spending.savingsRate.toFixed(1)}%. ${spending.savingsRate >= 20 ? "Great job maintaining a healthy savings rate!" : "Consider reviewing discretionary spending to boost your savings rate toward the recommended 20%."}`;
    }
    return "I can help you analyze your spending patterns. Add some transactions and I'll provide personalized insights on where your money is going.";
  }

  // Savings
  if (lowerMessage.includes("save") || lowerMessage.includes("saving")) {
    if (spending) {
      return `Your current savings rate is ${spending.savingsRate.toFixed(1)}%, which means you're saving approximately RM ${spending.savings.toFixed(2)} per month. ${spending.savingsRate >= 20 ? "Excellent! You're above the recommended 20% savings rate." : `To reach the recommended 20% savings rate, you'd need to save an additional RM ${((userContext.user?.monthlyIncome ?? 7000) * 0.2 - spending.savings).toFixed(2)} per month.`}`;
    }
    return "Building savings is crucial for financial security. I recommend starting with an emergency fund covering 3-6 months of expenses. Would you like me to help create a personalized savings plan?";
  }

  // Investment
  if (lowerMessage.includes("invest") || lowerMessage.includes("portfolio")) {
    if (isIslamic) {
      return "For Shariah-compliant investing, consider: Sukuk (Islamic bonds) for stable returns, ASNB Islamic funds like ASN Equity 3 or ASM, Shariah-compliant ETFs on Bursa Malaysia, or direct investment in halal stocks from the SC's Shariah-compliant list. What's your investment timeline and risk tolerance?";
    }
    return "Based on your savings pattern, you could consider diversifying into fixed deposits for safety, unit trusts for managed growth, or direct stock investments for higher potential returns. What's your risk tolerance and investment timeline?";
  }

  // Mode questions
  if (lowerMessage.includes("mode") || lowerMessage.includes("yolo") || lowerMessage.includes("broke") || lowerMessage.includes("vacation")) {
    const currentMode = userContext?.user?.activeMode ?? "normal";
    return `You're currently in ${currentMode.toUpperCase()} mode. Available modes: NORMAL (balanced coaching), YOLO (celebration mode for treats), BROKE (strict budget mode), and VACATION (trip budget tracking). Would you like to switch modes?`;
  }

  // Default greeting/general
  if (isIslamic) {
    return `Assalamualaikum! I'm here to help with your Shariah-compliant financial journey. I can assist with Zakat calculations, Hajj savings planning, halal investment options, or general budgeting advice. What would you like to explore?`;
  }
  
  return `I'm here to help with your financial goals! I can analyze your spending patterns, help with savings strategies, provide investment ideas, or answer questions about managing your money better. What would you like to know?`;
}

