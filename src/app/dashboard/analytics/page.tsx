"use client";

import { useState, useEffect, useMemo } from "react";
import DashboardHeader from "@/components/client/DashboardHeader";
import { useFinanceMode } from "@/context/FinanceModeContext";
import { useUser } from "@/context/UserContext";
import {
  useSpendingByCategory,
  useSpendingSummary,
  useSpendingTrend,
  useDailySpending,
} from "@/hooks/useTransactions";
import { useInsightsList } from "@/hooks/useInsights";
import {
  TrendingUp,
  Calendar,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Sparkles,
  Loader2,
  AlertCircle,
} from "lucide-react";

// Format currency
const formatCurrency = (amount: number, currency: string = "USD") => {
  const symbol = currency === "MYR" ? "RM " : "$";
  return `${symbol}${Math.abs(amount).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

export default function AnalyticsPage() {
  const { mode } = useFinanceMode();
  const { user, userId, isLoading: userLoading } = useUser();
  const [mounted, setMounted] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<1 | 3 | 12>(1);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch data
  const spendingByCategory = useSpendingByCategory(selectedPeriod);
  const spendingSummary = useSpendingSummary(selectedPeriod);
  const spendingTrend = useSpendingTrend();
  const dailySpending = useDailySpending(30);
  const insights = useInsightsList({ limit: 3 });

  const isIslamic = mounted ? mode === "islamic" : false;
  const currency = user?.currency || "USD";
  const accentColor = isIslamic ? "text-sentience-gold" : "text-violet-400";
  const accentBg = isIslamic ? "bg-sentience-gold" : "bg-violet-500";

  // Process spending data
  const spending = useMemo(() => {
    if (!spendingByCategory?.categories) return [];
    return spendingByCategory.categories.slice(0, 8).map((cat) => ({
      name: cat.categoryName,
      amount: cat.total,
      percentage: cat.percentage,
      color: cat.categoryColor,
    }));
  }, [spendingByCategory]);

  // Process daily spending for trend chart
  const trends = useMemo(() => {
    if (!dailySpending) return [];

    // Group by week for last 6 weeks
    const weeks: { label: string; spending: number; savings: number }[] = [];
    const grouped = new Map<string, number>();

    dailySpending.forEach((day) => {
      const date = new Date(day.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().slice(0, 10);
      grouped.set(weekKey, (grouped.get(weekKey) || 0) + day.amount);
    });

    // Convert to array and take last 6
    const sortedWeeks = Array.from(grouped.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-6);

    sortedWeeks.forEach(([weekKey, spending]) => {
      // Parse date parts directly from "YYYY-MM-DD" string to avoid UTC timezone issues
      const [year, month, day] = weekKey.split("-").map(Number);
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const monthName = monthNames[month - 1];
      weeks.push({
        label: `${monthName} ${day}`,
        spending,
        savings: Math.max(0, (user?.monthlyIncome || 7000) / 4 - spending),
      });
    });

    return weeks;
  }, [dailySpending, user?.monthlyIncome]);

  // Process insights
  const displayInsights = useMemo(() => {
    if (!insights || insights.length === 0) {
      return [
        {
          title: "Spending Analysis",
          description: "Add more transactions to get personalized insights.",
          trend: "info",
        },
      ];
    }

    return insights.map((insight) => ({
      title: insight.title,
      description: insight.message,
      trend:
        insight.severity === "celebration"
          ? "positive"
          : insight.severity === "warning" || insight.severity === "alert"
            ? "warning"
            : "info",
    }));
  }, [insights]);

  // Loading state
  if (!mounted || userLoading || (userId && spendingByCategory === undefined)) {
    return (
      <div className="text-white min-h-[60vh] flex items-center justify-center">
        <Loader2 className={`w-8 h-8 animate-spin ${accentColor}`} />
      </div>
    );
  }

  // No user state
  if (!userId) {
    return (
      <div className="text-white min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 mx-auto text-white/40" />
          <p className="text-white/60">Please set up your account first</p>
        </div>
      </div>
    );
  }

  const totalSpending = spendingSummary?.totalExpenses || 0;
  const totalSavings = spendingSummary?.savings || 0;
  const savingsRate = spendingSummary?.savingsRate || 0;
  const trendChange = spendingTrend?.change || 0;
  const trendDirection = spendingTrend?.direction || "same";
  const maxSpending = Math.max(...trends.map((t) => t.spending), 1);

  return (
    <div className="text-white">
      <DashboardHeader
        title="Analytics"
        subtitle="Track your spending patterns and insights"
      />

      <div className="p-6 lg:p-8 space-y-6">
        {/* Time Period */}
        <div className="flex items-center justify-end gap-4">
          <div className="flex bg-white/2 rounded-lg p-1">
            <button
              onClick={() => setSelectedPeriod(1)}
              className={`px-4 py-2 text-sm rounded-md transition-colors ${
                selectedPeriod === 1
                  ? isIslamic
                    ? "bg-sentience-gold/10 text-sentience-gold"
                    : "bg-violet-500/10 text-violet-400"
                  : "text-white/50 hover:text-white"
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setSelectedPeriod(3)}
              className={`px-4 py-2 text-sm rounded-md transition-colors ${
                selectedPeriod === 3
                  ? isIslamic
                    ? "bg-sentience-gold/10 text-sentience-gold"
                    : "bg-violet-500/10 text-violet-400"
                  : "text-white/50 hover:text-white"
              }`}
            >
              3 Months
            </button>
            <button
              onClick={() => setSelectedPeriod(12)}
              className={`px-4 py-2 text-sm rounded-md transition-colors ${
                selectedPeriod === 12
                  ? isIslamic
                    ? "bg-sentience-gold/10 text-sentience-gold"
                    : "bg-violet-500/10 text-violet-400"
                  : "text-white/50 hover:text-white"
              }`}
            >
              Year
            </button>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white/2 text-white/50 hover:text-white rounded-lg text-sm transition-colors">
            <Calendar className="w-4 h-4" />
            Custom
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 bg-white/2 border border-white/5 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/50 text-xs">Total Spending</span>
              <div
                className={`flex items-center gap-1 text-xs ${
                  trendDirection === "down"
                    ? "text-emerald-400"
                    : trendDirection === "up"
                      ? "text-red-400"
                      : "text-white/50"
                }`}
              >
                {trendDirection === "down" ? (
                  <ArrowDownRight className="w-3 h-3" />
                ) : trendDirection === "up" ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <Minus className="w-3 h-3" />
                )}
                {Math.abs(trendChange).toFixed(0)}%
              </div>
            </div>
            <p className="text-2xl font-light font-mono text-white">
              {formatCurrency(totalSpending, currency)}
            </p>
            <p className="text-xs text-white/30 mt-1">
              vs {formatCurrency(spendingTrend?.previousPeriod || 0, currency)} last period
            </p>
          </div>
          <div className="p-5 bg-white/2 border border-white/5 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/50 text-xs">Total Saved</span>
              <div
                className={`flex items-center gap-1 text-xs ${
                  totalSavings > 0 ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {totalSavings > 0 ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                {savingsRate.toFixed(0)}%
              </div>
            </div>
            <p className="text-2xl font-light font-mono text-white">
              {formatCurrency(Math.max(0, totalSavings), currency)}
            </p>
            <p className="text-xs text-white/30 mt-1">
              {savingsRate > 0 ? "Great progress!" : "Increase savings"}
            </p>
          </div>
          <div
            className={`p-5 border rounded-xl ${
              isIslamic
                ? "bg-sentience-gold/5 border-sentience-gold/10"
                : "bg-violet-500/5 border-violet-500/10"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span
                className={`text-xs ${
                  isIslamic ? "text-sentience-gold/70" : "text-violet-400/70"
                }`}
              >
                Budget Health
              </span>
              <TrendingUp className={`w-4 h-4 ${accentColor}`} />
            </div>
            <p className={`text-2xl font-light font-mono ${accentColor}`}>
              {totalSavings > 0 ? "Good" : totalSavings === 0 ? "Fair" : "Alert"}
            </p>
            <p
              className={`text-xs mt-1 ${
                isIslamic ? "text-sentience-gold/50" : "text-violet-400/50"
              }`}
            >
              {totalSavings > 0 ? "Within targets" : "Review spending"}
            </p>
          </div>
          <div className="p-5 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-emerald-400/70 text-xs">Savings Rate</span>
              <ArrowUpRight className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-light font-mono text-emerald-400">
              {savingsRate.toFixed(0)}%
            </p>
            <p className="text-xs text-emerald-400/50 mt-1">Target: 25%</p>
          </div>
        </div>

        {/* AI Insights */}
        <div
          className={`border rounded-xl p-6 ${
            isIslamic
              ? "bg-sentience-gold/5 border-sentience-gold/10"
              : "bg-violet-500/5 border-violet-500/10"
          }`}
        >
          <h3 className="text-sm font-light text-white/40 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Sparkles className={`w-4 h-4 ${accentColor}`} />
            {isIslamic ? "Barakah Insights" : "AI Insights"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {displayInsights.map((insight, i) => (
              <div
                key={i}
                className={`p-4 rounded-lg border ${
                  insight.trend === "positive"
                    ? "bg-emerald-500/5 border-emerald-500/10"
                    : insight.trend === "warning"
                      ? "bg-amber-500/5 border-amber-500/10"
                      : "bg-white/2 border-white/5"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-2 h-2 rounded-full mt-1.5 ${
                      insight.trend === "positive"
                        ? "bg-emerald-400"
                        : insight.trend === "warning"
                          ? "bg-amber-400"
                          : "bg-white/40"
                    }`}
                  />
                  <div>
                    <h4
                      className={`text-sm font-medium mb-1 ${
                        insight.trend === "positive"
                          ? "text-emerald-400"
                          : insight.trend === "warning"
                            ? "text-amber-400"
                            : "text-white"
                      }`}
                    >
                      {insight.title}
                    </h4>
                    <p className="text-xs text-white/50">{insight.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Spending Breakdown */}
          <div className="bg-white/2 border border-white/5 rounded-xl p-6">
            <h3 className="text-sm font-light text-white/40 uppercase tracking-wider mb-6 flex items-center gap-2">
              <PieChart className={`w-4 h-4 ${accentColor}`} />
              Spending Breakdown
            </h3>

            <div className="space-y-4">
              {spending.length > 0 ? (
                spending.map((category, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-24 truncate">
                      <span className="text-sm text-white/70">{category.name}</span>
                    </div>
                    <div className="flex-1">
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${category.percentage}%`,
                            backgroundColor: category.color,
                          }}
                        />
                      </div>
                    </div>
                    <div className="w-20 text-right">
                      <span className="text-sm font-mono text-white/50">
                        {formatCurrency(category.amount, currency)}
                      </span>
                    </div>
                    <div className="w-10 text-right">
                      <span className="text-xs text-white/30">
                        {category.percentage}%
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-white/40">
                  <p>No spending data yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Weekly Trends */}
          <div className="bg-white/2 border border-white/5 rounded-xl p-6">
            <h3 className="text-sm font-light text-white/40 uppercase tracking-wider mb-6 flex items-center gap-2">
              <TrendingUp className={`w-4 h-4 ${accentColor}`} />
              Weekly Trends
            </h3>

            {trends.length > 0 ? (
              <>
                <div className="flex items-end justify-between h-48 gap-2">
                  {trends.map((week, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full flex flex-col gap-1 h-40 justify-end">
                        <div
                          className={`w-full rounded-t ${
                            isIslamic ? "bg-sentience-gold/30" : "bg-violet-500/30"
                          }`}
                          style={{
                            height: `${(week.spending / maxSpending) * 100}%`,
                          }}
                        />
                        <div
                          className="w-full bg-emerald-500/30 rounded"
                          style={{
                            height: `${(week.savings / maxSpending) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-white/40">{week.label}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded ${
                        isIslamic ? "bg-sentience-gold/30" : "bg-violet-500/30"
                      }`}
                    />
                    <span className="text-xs text-white/40">Spending</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-emerald-500/30" />
                    <span className="text-xs text-white/40">Savings</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-48 flex items-center justify-center text-white/40">
                <p>Add transactions to see trends</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
