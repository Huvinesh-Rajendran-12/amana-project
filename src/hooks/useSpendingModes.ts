"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useUser } from "@/context/UserContext";

export function useCurrentMode() {
  const { userId } = useUser();

  return useQuery(api.modes.getCurrentMode, userId ? { userId } : "skip");
}

export function useBrokeModeStatus() {
  const { userId } = useUser();

  return useQuery(api.modes.getBrokeModeStatus, userId ? { userId } : "skip");
}

export function useVacationProgress() {
  const { userId } = useUser();

  return useQuery(api.modes.getVacationProgress, userId ? { userId } : "skip");
}

export function useAIPersonality() {
  const { userId } = useUser();

  return useQuery(api.modes.getAIPersonality, userId ? { userId } : "skip");
}

export function useModeHistory(limit: number = 10) {
  const { userId } = useUser();

  return useQuery(
    api.modes.getModeHistory,
    userId ? { userId, limit } : "skip"
  );
}

export function useModeMutations() {
  const { userId } = useUser();
  const setMode = useMutation(api.modes.setMode);
  const toggleYoloMode = useMutation(api.modes.toggleYoloMode);
  const activateBrokeMode = useMutation(api.modes.activateBrokeMode);
  const startVacationMode = useMutation(api.modes.startVacationMode);

  return {
    setMode: async (
      mode: "normal" | "yolo" | "broke" | "vacation",
      settings?: {
        dailyLimit?: number;
        tripBudget?: number;
        tripName?: string;
        celebrationMessages?: boolean;
      },
      duration?: number
    ) => {
      if (!userId) throw new Error("No user logged in");
      return setMode({ userId, mode, settings, duration });
    },

    toggleYoloMode: async (enable: boolean, duration?: number) => {
      if (!userId) throw new Error("No user logged in");
      return toggleYoloMode({ userId, enable, duration });
    },

    activateBrokeMode: async (
      dailyLimit: number,
      blockedCategories?: string[],
      duration?: number
    ) => {
      if (!userId) throw new Error("No user logged in");
      return activateBrokeMode({
        userId,
        dailyLimit,
        blockedCategories: blockedCategories as any,
        duration,
      });
    },

    startVacationMode: async (
      tripName: string,
      tripBudget: number,
      endDate: number
    ) => {
      if (!userId) throw new Error("No user logged in");
      return startVacationMode({ userId, tripName, tripBudget, endDate });
    },
  };
}

export function useCheckPurchaseAllowed(amount: number, categoryId?: string) {
  const { userId } = useUser();

  return useQuery(
    api.modes.checkPurchaseAllowed,
    userId
      ? {
          userId,
          amount,
          categoryId: categoryId as any,
        }
      : "skip"
  );
}

