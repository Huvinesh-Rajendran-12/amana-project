/**
 * SHARIAH_COMPLIANCE_AGENT - Ultra-Simple Prototype
 * Uses system prompt from agentPrompts.ts
 * Integrated with RAG pipeline for Islamic rulings context
 */

import { v } from "convex/values";
import { internalAction } from "../_generated/server";
import { AGENT_PROMPTS } from "../lib/agentPrompts";
import {
  buildShariahComplianceRAGContext,
  enhanceSystemPromptWithRAGContext,
} from "../lib/ragPipeline";
import { Anthropic } from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const HARAM_KEYWORDS: Record<string, string[]> = {
  gambling: ["casino", "betting", "lottery"],
  alcohol: ["bar", "pub", "liquor", "beer"],
  pork: ["bak kut teh", "pork", "bacon"],
};

// Check transaction for haram status
export const checkTransaction = internalAction({
  args: {
    merchant: v.string(),
    amount: v.number(),
    description: v.string(),
  },
  handler: async (ctx, args): Promise<{
    status: "halal" | "haram" | "doubtful";
    reason: string;
  }> => {
    const text: string = `${args.merchant} ${args.description}`.toLowerCase();

    let status: "halal" | "haram" | "doubtful" = "halal";
    let reason: string = "No haram indicators";

    for (const [category, keywords] of Object.entries(HARAM_KEYWORDS)) {
      if (keywords.some((k) => text.includes(k))) {
        status = "haram";
        reason = category;
        break;
      }
    }

    // Claude review for uncertain cases with RAG context
    if (status === "halal" && args.amount > 500) {
      // Build RAG context with relevant Islamic rulings
      const ragContext = buildShariahComplianceRAGContext(
        args.merchant,
        args.amount,
        args.description
      );

      // Enhance system prompt with RAG knowledge
      const enhancedSystemPrompt = enhanceSystemPromptWithRAGContext(
        AGENT_PROMPTS.SHARIAH_COMPLIANCE_AGENT.systemPrompt,
        "shariah",
        ragContext
      );

      const response = await client.messages.create({
        model: "claude-haiku-4-5",
        max_tokens: 150,
        system: enhancedSystemPrompt,
        messages: [
          {
            role: "user",
            content: `Merchant: ${args.merchant}
Amount: RM${args.amount}
Description: ${args.description}

Analyze for Shariah compliance. Reply: HALAL / HARAM / DOUBTFUL and reason.`,
          },
        ],
      });

      const verdict: string =
        response.content[0].type === "text" ? response.content[0].text : "";
      if (verdict.includes("HARAM")) status = "haram";
      else if (verdict.includes("DOUBTFUL")) status = "doubtful";
      else status = "halal";
    }

    return { status, reason };
  },
});
