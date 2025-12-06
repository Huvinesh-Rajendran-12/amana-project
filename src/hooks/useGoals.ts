"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useUser } from "@/context/UserContext";

// Get start of month
function getStartOfMonth(): number {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).getTime();
}

// Get end of today
function getEndOfToday(): number {
  const now = new Date();
  now.setHours(23, 59, 59, 999);
  return now.getTime();
}

// Hook for subscription summary (used for tracking recurring savings)
export function useSubscriptionSummary() {
  const { userId } = useUser();

  return useQuery(
    api.subscriptions.getSummary,
    userId ? { userId } : "skip"
  );
}

// Hook for spending summary (to calculate savings)
export function useGoalsSummary() {
  const { userId, user } = useUser();
  const startDate = getStartOfMonth();
  const endDate = getEndOfToday();

  const spendingSummary = useQuery(
    api.transactions.getSpendingSummary,
    userId
      ? {
          userId,
          startDate,
          endDate,
        }
      : "skip"
  );

  // Calculate savings metrics
  const monthlyIncome = user?.monthlyIncome ?? 7000;
  const totalExpenses = spendingSummary?.totalExpenses ?? 0;
  const savings = spendingSummary?.savings ?? (monthlyIncome - totalExpenses);
  const savingsRate = spendingSummary?.savingsRate ?? ((savings / monthlyIncome) * 100);

  return {
    monthlyIncome,
    totalExpenses,
    savings,
    savingsRate,
    transactionCount: spendingSummary?.transactionCount ?? 0,
  };
}

// Subscriptions for tracking recurring expenses
export function useActiveSubscriptions() {
  const { userId } = useUser();

  return useQuery(
    api.subscriptions.list,
    userId ? { userId, status: "active" } : "skip"
  );
}

// Upcoming subscription charges
export function useUpcomingCharges(days: number = 30) {
  const { userId } = useUser();

  return useQuery(
    api.subscriptions.getUpcoming,
    userId ? { userId, days } : "skip"
  );
}

// Subscription mutations
export function useSubscriptionMutations() {
  const updateStatus = useMutation(api.subscriptions.updateStatus);
  const createSubscription = useMutation(api.subscriptions.create);
  const removeSubscription = useMutation(api.subscriptions.remove);
  const runDetection = useMutation(api.subscriptions.runDetection);

  return {
    updateStatus,
    createSubscription,
    removeSubscription,
    runDetection,
  };
}

