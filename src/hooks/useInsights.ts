"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useUser } from "@/context/UserContext";

export function useInsightsList(options?: {
  unreadOnly?: boolean;
  type?:
    | "spending_spike"
    | "subscription_waste"
    | "peer_comparison"
    | "goal_progress"
    | "pattern_detected"
    | "savings_opportunity"
    | "weekly_summary";
  limit?: number;
}) {
  const { userId } = useUser();

  return useQuery(
    api.insights.list,
    userId
      ? {
          userId,
          unreadOnly: options?.unreadOnly,
          type: options?.type,
          limit: options?.limit ?? 20,
        }
      : "skip"
  );
}

export function useUnreadInsightsCount() {
  const { userId } = useUser();

  return useQuery(
    api.insights.getUnreadCount,
    userId ? { userId } : "skip"
  );
}

export function useCoachingMessage(context?: string) {
  const { userId } = useUser();

  return useQuery(
    api.insights.getCoachingMessage,
    userId
      ? {
          userId,
          context,
        }
      : "skip"
  );
}

export function useInsightMutations() {
  const markAsRead = useMutation(api.insights.markAsRead);
  const markAllAsRead = useMutation(api.insights.markAllAsRead);
  const dismiss = useMutation(api.insights.dismiss);
  const recordAction = useMutation(api.insights.recordAction);

  return {
    markAsRead,
    markAllAsRead,
    dismiss,
    recordAction,
  };
}

