/**
 * ZAKAT_AGENT - Ultra-Simple Prototype
 * Uses system prompt from agentPrompts.ts
 */

import { v } from "convex/values";
import { internalAction } from "../_generated/server";
import { AGENT_PROMPTS } from "../lib/agentPrompts";
import { Anthropic } from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

const ZAKAT_RATE: number = 0.025;
const NISAB_THRESHOLD: number = 15725; // RM (85g gold)

// Calculate Zakat obligation
export const calculateZakat = internalAction({
  args: {
    cash: v.number(),
    gold: v.number(),
    silver: v.number(),
  },
  handler: async (ctx, args): Promise<{
    totalWealth: number;
    isAboveNisab: boolean;
    zakatDue: number;
    guidance: string;
  }> => {
    const totalWealth: number = args.cash + args.gold + args.silver;
    const isAboveNisab: boolean = totalWealth >= NISAB_THRESHOLD;
    const zakatDue: number = isAboveNisab ? totalWealth * ZAKAT_RATE : 0;

    const response = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 150,
      system: AGENT_PROMPTS.ZAKAT_AGENT.systemPrompt,
      messages: [
        {
          role: "user",
          content: `Total Wealth: RM${totalWealth.toLocaleString()}
Nisab Threshold: RM${NISAB_THRESHOLD.toLocaleString()}
Above Nisab: ${isAboveNisab}
Zakat Due: RM${zakatDue.toFixed(2)}

Provide brief guidance on distributing Zakat to the 8 Asnaf categories.`,
        },
      ],
    });

    const guidance: string =
      response.content[0].type === "text" ? response.content[0].text : "";

    return { totalWealth, isAboveNisab, zakatDue, guidance };
  },
});
