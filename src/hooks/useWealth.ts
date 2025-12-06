"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useUser } from "@/context/UserContext";
import { useMemo } from "react";

// Get the start of current month
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

// Hook for wealth overview data
export function useWealthOverview() {
  const { userId, user } = useUser();
  const startDate = getStartOfMonth();
  const endDate = getEndOfToday();

  // Get spending summary to calculate savings
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

  // Calculate wealth metrics
  const monthlyIncome = user?.monthlyIncome ?? 7000;
  const monthlySavings = spendingSummary?.savings ?? 0;
  const savingsRate = spendingSummary?.savingsRate ?? 0;

  // Estimate total wealth based on savings patterns (in real app, this would come from linked accounts)
  const estimatedWealth = useMemo(() => {
    // Assume 6 months of similar savings + existing balance
    const baseWealth = monthlyIncome * 2; // Assume 2 months balance
    const accumulatedSavings = Math.max(0, monthlySavings) * 6;
    return baseWealth + accumulatedSavings;
  }, [monthlyIncome, monthlySavings]);

  return {
    totalWealth: estimatedWealth,
    monthlyGrowth: savingsRate > 0 ? savingsRate / 10 : 0, // Approximate monthly growth
    monthlySavings,
    savingsRate,
    monthlyIncome,
  };
}

// Hook for Zakat calculations
export function useZakatCalculation() {
  const { user } = useUser();
  const wealthData = useWealthOverview();

  // Nisab values (approximate - in real app these come from database)
  const goldNisab = 27200; // 85g gold in MYR
  const silverNisab = 2082.5; // 595g silver in MYR

  // Use lower nisab (silver)
  const applicableNisab = silverNisab;

  // Calculate zakatable wealth
  const zakatableWealth = useMemo(() => {
    // In real app, this would be more comprehensive
    // Including cash, gold, silver, investments, etc.
    return wealthData.totalWealth;
  }, [wealthData.totalWealth]);

  // Check if above nisab
  const isAboveNisab = zakatableWealth >= applicableNisab;

  // Calculate zakat (2.5%)
  const zakatAmount = isAboveNisab ? zakatableWealth * 0.025 : 0;

  // Islamic calendar info (approximation)
  const getIslamicMonth = () => {
    // This is a simplified approximation
    // In production, use a proper Islamic calendar library
    const gregorianDate = new Date();
    const islamicYear = Math.floor((gregorianDate.getFullYear() - 622) * (33 / 32));
    return {
      year: islamicYear,
      ramadanApprox: "March-April 2025",
    };
  };

  const islamicCalendar = getIslamicMonth();

  return {
    zakatableWealth,
    nisab: applicableNisab,
    goldNisab,
    silverNisab,
    isAboveNisab,
    zakatAmount,
    zakatRate: 0.025,
    lastPaid: `Ramadan ${islamicCalendar.year - 1}`,
    dueDate: `Ramadan ${islamicCalendar.year}`,
  };
}

// Hook for Hajj savings (simplified - in real app this would query the hajjSavingsGoals table)
export function useHajjSavings() {
  const wealthData = useWealthOverview();

  // Simulate Hajj savings as portion of wealth
  const hajjSavings = useMemo(() => {
    const saved = Math.round(wealthData.totalWealth * 0.2); // Assume 20% is Hajj savings
    const target = 45000; // Typical Hajj cost in MYR
    const progress = Math.min(100, Math.round((saved / target) * 100));

    return {
      saved,
      target,
      progress,
      waitingList: progress >= 100 ? "Ready" : "2027",
    };
  }, [wealthData.totalWealth]);

  return hajjSavings;
}

