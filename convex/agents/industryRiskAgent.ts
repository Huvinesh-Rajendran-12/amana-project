/**
 * INDUSTRY_RISK_AGENT - Ultra-Simple Prototype
 * Uses system prompt from agentPrompts.ts
 * Integrated with RAG pipeline for Islamic finance context
 */

import { v } from "convex/values";
import { internalAction } from "../_generated/server";
import { AGENT_PROMPTS } from "../lib/agentPrompts";
import { enhanceSystemPromptWithRAGContext } from "../lib/ragPipeline";
import { Anthropic } from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Assess industry risks
export const assessRisks = internalAction({
  args: {
    businessType: v.string(),
    state: v.string(),
  },
  handler: async (ctx, args): Promise<{
    riskLevel: "low" | "medium" | "high";
    assessment: string;
  }> => {
    // Enhance system prompt with Shariah context for risk assessment
    const enhancedSystemPrompt = enhanceSystemPromptWithRAGContext(
      AGENT_PROMPTS.INDUSTRY_RISK_AGENT.systemPrompt,
      "transaction",
      "When assessing risks, also consider Shariah compliance. Flag if business involves riba, gharar, maysir, or haram goods."
    );

    const response = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 200,
      system: enhancedSystemPrompt,
      messages: [
        {
          role: "user",
          content: `Business Type: ${args.businessType}
Location: ${args.state}, Malaysia

Analyze key risks (including Shariah compliance) and provide mitigation strategies.`,
        },
      ],
    });

    const assessment: string =
      response.content[0].type === "text" ? response.content[0].text : "";

    const riskLevel: "low" | "medium" | "high" = assessment.includes("high")
      ? "high"
      : assessment.includes("medium")
        ? "medium"
        : "low";

    return { riskLevel, assessment };
  },
});

// Monitor commodity prices
export const monitorPrices = internalAction({
  args: {
    businessType: v.string(),
  },
  handler: async (ctx, args): Promise<{
    prices: Record<string, number>;
    advice: string;
  }> => {
    const prices: Record<string, number> = {
      crude_oil: 95,
      palm_oil: 3500,
      rubber: 1.85,
      cocoa: 4200,
    };

    // Enhance system prompt with transaction context
    const enhancedSystemPrompt = enhanceSystemPromptWithRAGContext(
      AGENT_PROMPTS.INDUSTRY_RISK_AGENT.systemPrompt,
      "transaction"
    );

    const response = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 150,
      system: enhancedSystemPrompt,
      messages: [
        {
          role: "user",
          content: `Business: ${args.businessType}
Current Commodity Prices:
- Crude Oil: USD $95/barrel
- Palm Oil: RM 3,500/tonne
- Rubber: RM 1.85/kg
- Cocoa: USD $4,200/tonne

How might these prices impact the business? What hedging strategies? Ensure any strategies are Shariah-compliant.`,
        },
      ],
    });

    const advice: string =
      response.content[0].type === "text" ? response.content[0].text : "";

    return { prices, advice };
  },
});
