/**
 * INDUSTRY_RISK_AGENT - Ultra-Simple Prototype
 * Uses system prompt from agentPrompts.ts
 */

import { v } from "convex/values";
import { internalAction } from "../_generated/server";
import { AGENT_PROMPTS } from "../lib/agentPrompts";
import { Anthropic } from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
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
    const response = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 200,
      system: AGENT_PROMPTS.INDUSTRY_RISK_AGENT.systemPrompt,
      messages: [
        {
          role: "user",
          content: `Business Type: ${args.businessType}
Location: ${args.state}, Malaysia

Analyze key risks and provide mitigation strategies.`,
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

    const response = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 150,
      system: AGENT_PROMPTS.INDUSTRY_RISK_AGENT.systemPrompt,
      messages: [
        {
          role: "user",
          content: `Business: ${args.businessType}
Current Commodity Prices:
- Crude Oil: USD $95/barrel
- Palm Oil: RM 3,500/tonne
- Rubber: RM 1.85/kg
- Cocoa: USD $4,200/tonne

How might these prices impact the business? What hedging strategies?`,
        },
      ],
    });

    const advice: string =
      response.content[0].type === "text" ? response.content[0].text : "";

    return { prices, advice };
  },
});
