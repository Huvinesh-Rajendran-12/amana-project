/**
 * CASHFLOW_AGENT - Ultra-Simple Prototype
 * Uses system prompt from agentPrompts.ts
 * Integrated with RAG pipeline for Islamic finance context
 */

import { v } from "convex/values";
import { internalAction } from "../_generated/server";
import { AGENT_PROMPTS } from "../lib/agentPrompts";
import { enhanceSystemPromptWithRAGContext } from "../lib/ragPipeline";
import { Anthropic } from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

// Analyze sample transaction data
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
      model: "claude-3-5-sonnet-20241022",
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
