"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useUser } from "@/context/UserContext";
import { Id } from "../../convex/_generated/dataModel";

// Get the start of the current month
function getStartOfMonth(): number {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).getTime();
}

// Get the end of today
function getEndOfToday(): number {
  const now = new Date();
  now.setHours(23, 59, 59, 999);
  return now.getTime();
}

// Get start of N months ago
function getStartOfMonthsAgo(months: number): number {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() - months, 1).getTime();
}

export function useTransactionsList(options?: {
  startDate?: number;
  endDate?: number;
  categoryId?: Id<"categories">;
  type?: "expense" | "income" | "transfer";
  limit?: number;
}) {
  const { userId } = useUser();

  return useQuery(
    api.transactions.list,
    userId
      ? {
          userId,
          startDate: options?.startDate,
          endDate: options?.endDate,
          categoryId: options?.categoryId,
          type: options?.type,
          limit: options?.limit ?? 50,
        }
      : "skip"
  );
}

export function useSpendingByCategory(months: number = 1) {
  const { userId } = useUser();
  const startDate = getStartOfMonthsAgo(months - 1);
  const endDate = getEndOfToday();

  return useQuery(
    api.transactions.getSpendingByCategory,
    userId
      ? {
          userId,
          startDate,
          endDate,
        }
      : "skip"
  );
}

export function useSpendingSummary(months: number = 1) {
  const { userId } = useUser();
  const startDate = getStartOfMonthsAgo(months - 1);
  const endDate = getEndOfToday();

  return useQuery(
    api.transactions.getSpendingSummary,
    userId
      ? {
          userId,
          startDate,
          endDate,
        }
      : "skip"
  );
}

export function useSpendingTrend() {
  const { userId } = useUser();
  const startDate = getStartOfMonth();
  const endDate = getEndOfToday();

  return useQuery(
    api.transactions.getSpendingTrend,
    userId
      ? {
          userId,
          startDate,
          endDate,
        }
      : "skip"
  );
}

export function useTopMerchants(limit: number = 10) {
  const { userId } = useUser();
  const startDate = getStartOfMonth();
  const endDate = getEndOfToday();

  return useQuery(
    api.transactions.getTopMerchants,
    userId
      ? {
          userId,
          startDate,
          endDate,
          limit,
        }
      : "skip"
  );
}

export function useDailySpending(days: number = 30) {
  const { userId } = useUser();
  const endDate = getEndOfToday();
  const startDate = endDate - days * 24 * 60 * 60 * 1000;

  return useQuery(
    api.transactions.getDailySpending,
    userId
      ? {
          userId,
          startDate,
          endDate,
        }
      : "skip"
  );
}

export function useSearchTransactions(query: string) {
  const { userId } = useUser();

  return useQuery(
    api.transactions.search,
    userId && query.length > 0
      ? {
          userId,
          query,
          limit: 20,
        }
      : "skip"
  );
}

export function useTransactionMutations() {
  const createTransaction = useMutation(api.transactions.create);
  const updateCategory = useMutation(api.transactions.updateCategory);
  const markAsRegret = useMutation(api.transactions.markAsRegret);
  const removeTransaction = useMutation(api.transactions.remove);

  return {
    createTransaction,
    updateCategory,
    markAsRegret,
    removeTransaction,
  };
}

