"use client";

import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useUser } from "@/context/UserContext";
import { useCallback, useState, useEffect } from "react";

interface Insight {
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "tip";
  actionLabel?: string;
}

export function useTransactionInsights(isIslamic: boolean) {
  const { userId } = useUser();
  const generateInsights = useAction(api.chat.generateTransactionInsights);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await generateInsights({
        userId,
        isIslamic,
      });
      setInsights(result.insights);
    } catch (err) {
      console.error("Failed to fetch insights:", err);
      setError("Failed to load insights");
      // Set fallback insights
      setInsights([
        {
          title: "Analyzing your data",
          message: "We're working on generating personalized insights for you.",
          type: "info",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [userId, isIslamic, generateInsights]);

  // Fetch on mount and when dependencies change
  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  return {
    insights,
    isLoading,
    error,
    refetch: fetchInsights,
  };
}

