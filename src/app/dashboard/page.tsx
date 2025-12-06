"use client";

import { useState, useEffect } from "react";
import DashboardHeader from "@/components/client/DashboardHeader";
import { useFinanceMode } from "@/context/FinanceModeContext";
import { useUser } from "@/context/UserContext";
import { useDashboardSummary } from "@/hooks/useDashboard";
import { useSpendingByCategory } from "@/hooks/useTransactions";
import { useInsightsList } from "@/hooks/useInsights";
import {
  Wallet,
  CreditCard,
  Shield,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Brain,
  Sparkles,
  Loader2,
} from "lucide-react";

// Format currency
const formatCurrency = (amount: number, currency: string = "USD") => {
  const symbol = currency === "MYR" ? "RM " : "$";
  return `${symbol}${Math.abs(amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Fallback suggestions when no insights
const fallbackSuggestions = [
  {
    title: "Welcome to Lumina!",
    description: "Start tracking your spending to get personalized insights.",
  },
  {
    title: "Set Up Your Goals",
    description: "Create savings goals to help you stay on track financially.",
  },
  {
    title: "Connect Your Accounts",
    description: "Import transactions to get a complete picture of your finances.",
  },
];

const islamicFallbackSuggestions = [
  {
    title: "Bismillah!",
    description: "Welcome to your Shariah-compliant financial dashboard.",
  },
  {
    title: "Zakat Tracker",
    description: "We'll help you calculate and track your Zakat obligations.",
  },
  {
    title: "Hajj Savings",
    description: "Start saving for your pilgrimage with our guided savings plan.",
  },
];

export default function DashboardPage() {
  const { mode } = useFinanceMode();
  const { user, userId, isLoading: userLoading, isSeeding, seedDemoData } = useUser();
  const [mounted, setMounted] = useState(false);

  // Fetch data from Convex
  const dashboardSummary = useDashboardSummary();
  const spendingByCategory = useSpendingByCategory(1);
  const insights = useInsightsList({ limit: 3 });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Default to conventional during SSR to prevent hydration mismatch
  const isIslamic = mounted ? mode === "islamic" : false;
  const accentColor = isIslamic ? "text-sentience-gold" : "text-violet-400";

  // Show seeding prompt if no user
  if (mounted && !userLoading && !userId) {
    return (
      <div className="text-cream min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md mx-auto p-8">
          <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${isIslamic ? "bg-sentience-gold/10" : "bg-violet-500/10"}`}>
            <Brain className={`w-8 h-8 ${accentColor}`} />
          </div>
          <h2 className="text-2xl font-light">Welcome to Lumina</h2>
          <p className="text-cream/50">
            Let&apos;s set up your demo account with sample financial data to explore all features.
          </p>
          <button
            onClick={seedDemoData}
            disabled={isSeeding}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 mx-auto ${
              isIslamic
                ? "bg-sentience-gold/10 border border-sentience-gold/20 text-sentience-gold hover:bg-sentience-gold/15"
                : "bg-violet-500/10 border border-violet-500/20 text-violet-400 hover:bg-violet-500/15"
            } disabled:opacity-50`}
          >
            {isSeeding ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Setting up...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Create Demo Account
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (!mounted || userLoading || (userId && dashboardSummary === undefined)) {
    return (
      <div className="text-cream min-h-[60vh] flex items-center justify-center">
        <Loader2 className={`w-8 h-8 animate-spin ${accentColor}`} />
      </div>
    );
  }

  // Prepare display data
  const userName = user?.name || dashboardSummary?.user?.name || "Guest";
  const currency = user?.currency || dashboardSummary?.user?.currency || "USD";

  // Stats from real data
  const monthSpending = dashboardSummary?.spending?.month ?? 0;
  const todaySpending = dashboardSummary?.spending?.today ?? 0;
  const weekSpending = dashboardSummary?.spending?.week ?? 0;

  // Calculate savings (mock for now - would need income data)
  const estimatedIncome = user?.monthlyIncome ?? 7000;
  const savings = estimatedIncome - monthSpending;
  const savingsRate = estimatedIncome > 0 ? ((savings / estimatedIncome) * 100).toFixed(1) : "0";

  // Spending categories from real data
  const categories = spendingByCategory?.categories ?? [];
  const topCategories = categories.slice(0, 4).map((cat) => ({
    name: cat.categoryName,
    amount: cat.total,
    budget: cat.total * 1.2, // Estimate budget as 120% of current spending
    color: cat.categoryColor,
  }));

  // Use real insights or fallbacks
  const displayInsights = insights && insights.length > 0
    ? insights.map((insight) => ({
        title: insight.title,
        description: insight.message,
      }))
    : isIslamic
      ? islamicFallbackSuggestions
      : fallbackSuggestions;

  return (
    <div className="text-cream">
      <DashboardHeader
        title={`Welcome back, ${userName}`}
        subtitle="Here's your financial overview"
      />

      <div className="p-6 lg:p-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Available Balance"
            value={formatCurrency(savings, currency)}
            change={`${Number(savingsRate) > 0 ? "+" : ""}${savingsRate}%`}
            trend={Number(savingsRate) > 0 ? "up" : Number(savingsRate) < 0 ? "down" : undefined}
            icon={<Wallet className="w-5 h-5" />}
            isIslamic={isIslamic}
          />
          <StatCard
            title="Monthly Spending"
            value={formatCurrency(monthSpending, currency)}
            change={weekSpending > 0 ? `${formatCurrency(weekSpending, currency)} this week` : undefined}
            subtitle={weekSpending > 0 ? undefined : "This month"}
            icon={<CreditCard className="w-5 h-5" />}
            isIslamic={isIslamic}
          />
          <StatCard
            title="Today's Spending"
            value={formatCurrency(todaySpending, currency)}
            subtitle={todaySpending === 0 ? "No spending yet" : "Spent today"}
            icon={<Shield className="w-5 h-5" />}
            highlight
            isIslamic={isIslamic}
          />
          <StatCard
            title={isIslamic ? "Tabung Haji" : "Savings Rate"}
            value={isIslamic ? formatCurrency(savings * 0.3, currency) : `${savingsRate}%`}
            change={isIslamic ? "+4.1% Hibah" : savings > 0 ? "On track" : "Needs attention"}
            trend={savings > 0 ? "up" : "down"}
            icon={<TrendingUp className="w-5 h-5" />}
            isIslamic={isIslamic}
          />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AI Suggestions */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-light flex items-center gap-2">
                <Sparkles className={`w-5 h-5 ${accentColor}`} />
                {isIslamic ? "Barakah Insights" : "AI Suggestions"}
              </h2>
            </div>

            <div
              className={`border rounded-xl p-6 space-y-4 ${isIslamic ? "bg-sentience-gold/5 border-sentience-gold/10" : "bg-violet-500/5 border-violet-500/10"}`}
            >
              {displayInsights.map((suggestion, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 p-4 bg-black/20 rounded-lg"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isIslamic ? "bg-sentience-gold/10" : "bg-violet-500/10"}`}
                  >
                    <span className={`text-sm font-medium ${accentColor}`}>
                      {i + 1}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-cream font-light mb-1">
                      {suggestion.title}
                    </h4>
                    <p className="text-sm text-cream/50">
                      {suggestion.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Spending Breakdown */}
          <div className="space-y-4">
            <h2 className="text-lg font-light flex items-center gap-2">
              <Sparkles className={`w-5 h-5 ${accentColor}`} />
              Spending Breakdown
            </h2>

            <div className="bg-cream/2 border border-cream/5 rounded-xl p-6 space-y-6">
              {topCategories.length > 0 ? (
                topCategories.map((category) => (
                  <div key={category.name} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-cream/60">{category.name}</span>
                      <span className="font-mono text-cream">
                        {formatCurrency(category.amount, currency)}
                        <span className="text-cream/30">
                          {" "}
                          / {formatCurrency(category.budget, currency)}
                        </span>
                      </span>
                    </div>
                    <div className="h-1.5 bg-cream/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min((category.amount / category.budget) * 100, 100)}%`,
                          backgroundColor: category.color,
                          opacity: category.amount > category.budget ? 1 : 0.7,
                        }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-cream/40">
                  <p>No spending data yet</p>
                  <p className="text-sm mt-1">Add transactions to see breakdown</p>
                </div>
              )}

              {topCategories.length > 0 && (
                <div className="pt-4 border-t border-cream/5">
                  <div className="flex items-center justify-between">
                    <span className="text-cream/60 text-sm">Total Spent</span>
                    <span className="text-lg font-light font-mono text-cream">
                      {formatCurrency(spendingByCategory?.totalSpent ?? 0, currency)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({
  title,
  value,
  change,
  subtitle,
  trend,
  icon,
  highlight,
  isIslamic,
}: {
  title: string;
  value: string;
  change?: string;
  subtitle?: string;
  trend?: "up" | "down";
  icon: React.ReactNode;
  highlight?: boolean;
  isIslamic?: boolean;
}) {
  const highlightBg = isIslamic
    ? "bg-gradient-to-br from-sentience-gold/10 to-transparent border-sentience-gold/20"
    : "bg-gradient-to-br from-violet-900/20 to-transparent border-violet-500/20";

  const highlightIcon = isIslamic
    ? "bg-sentience-gold/10 text-sentience-gold"
    : "bg-violet-500/10 text-violet-400";

  return (
    <div
      className={`p-6 rounded-xl border transition-all duration-300 hover:border-cream/10 ${
        highlight ? highlightBg : "bg-cream/2 border-cream/5"
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={`p-2 rounded-lg ${highlight ? highlightIcon : "bg-cream/5 text-cream/60"}`}
        >
          {icon}
        </div>
        {change && trend && (
          <div
            className={`flex items-center gap-1 text-xs ${
              trend === "up" ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {trend === "up" ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : (
              <ArrowDownRight className="w-3 h-3" />
            )}
            {change}
          </div>
        )}
        {change && !trend && (
          <div className="text-xs text-cream/40">{change}</div>
        )}
      </div>
      <div className="text-2xl font-light mb-1 font-mono text-cream">
        {value}
      </div>
      <div className="text-xs text-cream/40">{subtitle || title}</div>
    </div>
  );
}
