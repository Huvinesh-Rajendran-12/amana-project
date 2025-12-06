/**
 * HAJJ_SAVINGS_AGENT - Ultra-Simple Prototype
 * Uses system prompt from agentPrompts.ts
 * Integrated with RAG pipeline for Islamic finance context
 */

import { v } from "convex/values";
import { internalAction } from "../_generated/server";
import { AGENT_PROMPTS } from "../lib/agentPrompts";
import {
  buildHajjRAGContext,
  enhanceSystemPromptWithRAGContext,
} from "../lib/ragPipeline";
import { Anthropic } from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Analyze Hajj savings progress
export const analyzeHajjProgress = internalAction({
  args: {
    goal: v.number(),
    saved: v.number(),
    monthlyContribution: v.number(),
    monthsRemaining: v.number(),
  },
  handler: async (ctx, args): Promise<{
    progressPercent: number;
    onTrack: boolean;
    coaching: string;
  }> => {
    const progressPercent: number = (args.saved / args.goal) * 100;
    const remaining: number = args.goal - args.saved;
    const monthlyNeeded: number =
      args.monthsRemaining > 0 ? remaining / args.monthsRemaining : 0;
    const onTrack: boolean = args.monthlyContribution >= monthlyNeeded * 0.9;

    // Build RAG context with Hajj guidance
    const ragContext = buildHajjRAGContext(args.saved, args.goal);

    // Enhance system prompt with RAG knowledge
    const enhancedSystemPrompt = enhanceSystemPromptWithRAGContext(
      AGENT_PROMPTS.HAJJ_SAVINGS_AGENT.systemPrompt,
      "hajj",
      ragContext
    );

    const response = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 150,
      system: enhancedSystemPrompt,
      messages: [
        {
          role: "user",
          content: `Hajj Goal: RM${args.goal.toLocaleString()}
Saved: RM${args.saved.toLocaleString()} (${progressPercent.toFixed(1)}%)
Monthly Contribution: RM${args.monthlyContribution}
Months Remaining: ${args.monthsRemaining}
Monthly Needed: RM${monthlyNeeded.toFixed(2)}

Provide one motivating coaching message.`,
        },
      ],
    });

    const coaching: string =
      response.content[0].type === "text" ? response.content[0].text : "";

    return { progressPercent, onTrack, coaching };
  },
});

// Handle income and suggest contribution
export const suggestContribution = internalAction({
  args: {
    income: v.number(),
    incomeType: v.string(),
  },
  handler: async (ctx, args): Promise<{
    suggested: number;
    message: string;
  }> => {
    const percent: number = args.incomeType === "bonus" ? 0.15 : 0.1;
    const suggested: number = Math.round((args.income * percent) / 10) * 10;

    // Enhance system prompt with Hajj context
    const enhancedSystemPrompt = enhanceSystemPromptWithRAGContext(
      AGENT_PROMPTS.HAJJ_SAVINGS_AGENT.systemPrompt,
      "hajj"
    );

    const response = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 100,
      system: enhancedSystemPrompt,
      messages: [
        {
          role: "user",
          content: `${args.incomeType} received: RM${args.income.toLocaleString()}
Suggest RM${suggested} contribution to Hajj fund (${percent * 100}% of income).

Give one motivating sentence.`,
        },
      ],
    });

    const message: string =
      response.content[0].type === "text" ? response.content[0].text : "";

    return { suggested, message };
  },
});
