/**
 * Message Bus for inter-agent communication.
 * Enables event-driven architecture between the 5 specialized agents.
 */

import { v } from "convex/values";
import { mutation, query, internalMutation, internalQuery } from "../_generated/server";
import { Id } from "../_generated/dataModel";

// ==================== TYPE DEFINITIONS ====================

export type AgentType =
  | "CASHFLOW_AGENT"
  | "INDUSTRY_RISK_AGENT"
  | "SHARIAH_COMPLIANCE_AGENT"
  | "ZAKAT_AGENT"
  | "HAJJ_SAVINGS_AGENT"
  | "ORCHESTRATOR";

export type MessagePriority = "low" | "medium" | "high" | "critical";

export type MessageType =
  // Cashflow Agent messages
  | "INCOME_DETECTED"
  | "EXPENSE_ANALYZED"
  | "CASHFLOW_UPDATED"
  | "BURN_RATE_ALERT"
  | "LOW_BALANCE_WARNING"
  // Shariah Compliance messages
  | "TRANSACTION_COMPLIANCE_CHECK"
  | "COMPLIANCE_RESULT"
  | "HARAM_DETECTED"
  | "RIBA_DETECTED"
  | "MERCHANT_STATUS_UPDATED"
  // Zakat Agent messages
  | "NISAB_CROSSED"
  | "ZAKAT_CALCULATION_UPDATED"
  | "ZAKAT_DUE_REMINDER"
  | "ZAKAT_PAID"
  | "ASSET_VALUE_CHANGED"
  // Hajj Agent messages
  | "HAJJ_CONTRIBUTION_SUGGESTED"
  | "HAJJ_PROGRESS_UPDATE"
  | "HAJJ_MILESTONE_REACHED"
  | "HAJJ_BEHIND_SCHEDULE"
  | "HAJJ_GOAL_COMPLETED"
  // Industry Risk messages
  | "RISK_ALERT_GENERATED"
  | "COMMODITY_PRICE_CHANGED"
  | "MARKET_NEWS_DETECTED"
  // Cross-agent messages
  | "USER_ACTION_REQUIRED"
  | "INSIGHT_GENERATED"
  | "AGENT_REQUEST"
  | "AGENT_RESPONSE";

export interface AgentMessage {
  sourceAgent: AgentType;
  targetAgent: AgentType | "broadcast";
  messageType: MessageType;
  payload: Record<string, unknown>;
  priority: MessagePriority;
  correlationId?: string;
  userId?: Id<"users">;
}

// ==================== MESSAGE BUS FUNCTIONS ====================

/**
 * Send a message to another agent or broadcast to all
 */
export const sendMessage = internalMutation({
  args: {
    sourceAgent: v.string(),
    targetAgent: v.string(),
    messageType: v.string(),
    payload: v.any(),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("critical")),
    correlationId: v.optional(v.string()),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("agentMessages", {
      sourceAgent: args.sourceAgent as AgentType,
      targetAgent: args.targetAgent as AgentType | "broadcast",
      messageType: args.messageType,
      payload: args.payload,
      priority: args.priority,
      correlationId: args.correlationId,
      isProcessed: false,
      createdAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });

    return messageId;
  },
});

/**
 * Get pending messages for an agent
 */
export const getMessages = internalQuery({
  args: {
    targetAgent: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;

    const messages = await ctx.db
      .query("agentMessages")
      .withIndex("by_target", (q) =>
        q.eq("targetAgent", args.targetAgent as AgentType).eq("isProcessed", false)
      )
      .take(limit);

    // Also get broadcast messages
    const broadcastMessages = await ctx.db
      .query("agentMessages")
      .withIndex("by_target", (q) =>
        q.eq("targetAgent", "broadcast").eq("isProcessed", false)
      )
      .take(limit);

    // Combine and sort by priority and creation time
    const allMessages = [...messages, ...broadcastMessages];

    // Priority order: critical > high > medium > low
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };

    return allMessages.sort((a, b) => {
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return a.createdAt - b.createdAt;
    });
  },
});

/**
 * Mark a message as processed
 */
export const markProcessed = internalMutation({
  args: {
    messageId: v.id("agentMessages"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.messageId, {
      isProcessed: true,
      processedAt: Date.now(),
    });
  },
});

/**
 * Get a message by correlation ID (for request-response pattern)
 */
export const getByCorrelationId = internalQuery({
  args: {
    correlationId: v.string(),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db
      .query("agentMessages")
      .withIndex("by_correlation", (q) => q.eq("correlationId", args.correlationId))
      .first();

    return message;
  },
});

/**
 * Clean up expired messages
 */
export const cleanupExpiredMessages = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // Get all messages (we'll filter in memory)
    const allMessages = await ctx.db
      .query("agentMessages")
      .collect();

    const expiredMessages = allMessages.filter(
      (m) => m.expiresAt && m.expiresAt < now
    );

    for (const message of expiredMessages) {
      await ctx.db.delete(message._id);
    }

    return { deleted: expiredMessages.length };
  },
});

// ==================== HELPER FUNCTIONS ====================

/**
 * Create a correlation ID for request-response patterns
 */
export function generateCorrelationId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Message builder for common agent communications
 */
export const MessageBuilders = {
  // Cashflow -> Hajj: Income detected, suggest contribution
  incomeDetected: (
    userId: Id<"users">,
    incomeType: string,
    amount: number
  ): Omit<AgentMessage, "sourceAgent"> => ({
    targetAgent: "HAJJ_SAVINGS_AGENT",
    messageType: "INCOME_DETECTED",
    payload: { userId, incomeType, amount },
    priority: "medium",
  }),

  // Shariah -> All: Haram transaction detected
  haramDetected: (
    userId: Id<"users">,
    transactionId: Id<"transactions">,
    reason: string
  ): Omit<AgentMessage, "sourceAgent"> => ({
    targetAgent: "broadcast",
    messageType: "HARAM_DETECTED",
    payload: { userId, transactionId, reason },
    priority: "critical",
  }),

  // Shariah -> Zakat: Riba detected for tracking
  ribaDetected: (
    userId: Id<"users">,
    amount: number,
    source: string
  ): Omit<AgentMessage, "sourceAgent"> => ({
    targetAgent: "ZAKAT_AGENT",
    messageType: "RIBA_DETECTED",
    payload: { userId, amount, source },
    priority: "high",
  }),

  // Zakat -> User: Nisab crossed
  nisabCrossed: (
    userId: Id<"users">,
    currentWealth: number,
    nisabValue: number
  ): Omit<AgentMessage, "sourceAgent"> => ({
    targetAgent: "ORCHESTRATOR",
    messageType: "NISAB_CROSSED",
    payload: { userId, currentWealth, nisabValue },
    priority: "high",
  }),

  // Hajj -> User: Contribution suggestion
  contributionSuggested: (
    userId: Id<"users">,
    suggestedAmount: number,
    reason: string
  ): Omit<AgentMessage, "sourceAgent"> => ({
    targetAgent: "ORCHESTRATOR",
    messageType: "HAJJ_CONTRIBUTION_SUGGESTED",
    payload: { userId, suggestedAmount, reason },
    priority: "medium",
  }),

  // Hajj -> User: Behind schedule nudge
  behindSchedule: (
    userId: Id<"users">,
    shortfall: number,
    daysRemaining: number
  ): Omit<AgentMessage, "sourceAgent"> => ({
    targetAgent: "ORCHESTRATOR",
    messageType: "HAJJ_BEHIND_SCHEDULE",
    payload: { userId, shortfall, daysRemaining },
    priority: "medium",
  }),

  // Industry Risk -> User: Risk alert
  riskAlert: (
    userId: Id<"users">,
    alertType: string,
    severity: string,
    description: string
  ): Omit<AgentMessage, "sourceAgent"> => ({
    targetAgent: "ORCHESTRATOR",
    messageType: "RISK_ALERT_GENERATED",
    payload: { userId, alertType, severity, description },
    priority: severity === "critical" ? "high" : "medium",
  }),

  // Generic insight generated
  insightGenerated: (
    userId: Id<"users">,
    insightType: string,
    title: string,
    message: string
  ): Omit<AgentMessage, "sourceAgent"> => ({
    targetAgent: "ORCHESTRATOR",
    messageType: "INSIGHT_GENERATED",
    payload: { userId, insightType, title, message },
    priority: "low",
  }),
};

// ==================== EVENT HANDLERS ====================

/**
 * Process incoming messages for each agent type
 * This would be called by the respective agent's internal functions
 */
export const processAgentMessages = async (
  ctx: { db: any; scheduler: any },
  agentType: AgentType,
  handlers: Record<string, (payload: any) => Promise<void>>
) => {
  // Get pending messages for this agent
  const messages = await ctx.db
    .query("agentMessages")
    .withIndex("by_target", (q: any) =>
      q.eq("targetAgent", agentType).eq("isProcessed", false)
    )
    .take(20);

  for (const message of messages) {
    const handler = handlers[message.messageType];
    if (handler) {
      try {
        await handler(message.payload);
        await ctx.db.patch(message._id, {
          isProcessed: true,
          processedAt: Date.now(),
        });
      } catch (error) {
        console.error(`Error processing message ${message._id}:`, error);
      }
    }
  }
};
