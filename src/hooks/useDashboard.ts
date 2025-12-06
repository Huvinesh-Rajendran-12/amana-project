"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useUser } from "@/context/UserContext";

export function useDashboardSummary() {
  const { userId } = useUser();

  return useQuery(api.users.getDashboardSummary, userId ? { userId } : "skip");
}

export function useUserStats() {
  const { userId } = useUser();

  return useQuery(api.users.getStats, userId ? { userId } : "skip");
}

export function useUserProfile() {
  const { userId } = useUser();

  return useQuery(api.users.getProfile, userId ? { userId } : "skip");
}

export function useUserCategories() {
  const { userId } = useUser();

  return useQuery(api.users.getCategories, userId ? { userId } : "skip");
}

