"use client";

import { useState, useEffect } from "react";
import DashboardHeader from "@/components/client/DashboardHeader";
import { useFinanceMode } from "@/context/FinanceModeContext";
import {
  TrendingUp,
  Calendar,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
} from "lucide-react";

// Malaysian Ringgit formatter
const formatRM = (amount: number) =>
  `RM ${amount.toLocaleString("en-MY", { minimumFractionDigits: 0 })}`;

// Spending categories
const spending = [
  { name: "Housing", amount: 2400, percentage: 38, color: "#8b5cf6" },
  { name: "Groceries", amount: 980, percentage: 16, color: "#06b6d4" },
  { name: "Dining", amount: 720, percentage: 11, color: "#f59e0b" },
  { name: "Transport", amount: 580, percentage: 9, color: "#10b981" },
  { name: "Entertainment", amount: 490, percentage: 8, color: "#ec4899" },
  { name: "Shopping", amount: 650, percentage: 10, color: "#f43f5e" },
  { name: "Utilities", amount: 320, percentage: 5, color: "#6366f1" },
  { name: "Others", amount: 210, percentage: 3, color: "#64748b" },
];

// Monthly trends data
const trends = [
  { month: "Jul", spending: 5200, savings: 1200 },
  { month: "Aug", spending: 5800, savings: 800 },
  { month: "Sep", spending: 4900, savings: 1500 },
  { month: "Oct", spending: 5100, savings: 1300 },
  { month: "Nov", spending: 6200, savings: 600 },
  { month: "Dec", spending: 4500, savings: 1800 },
];

const insights = [
  {
    title: "Spending Down 15%",
    description:
      "Your spending this month is 15% lower than last month. Great progress!",
    trend: "positive",
  },
  {
    title: "Dining Budget Alert",
    description:
      "You've used 78% of your dining budget with 12 days remaining.",
    trend: "warning",
  },
  {
    title: "Savings Goal On Track",
    description:
      "You're on track to save RM2,400 this month, exceeding your goal by 20%.",
    trend: "positive",
  },
];

export default function AnalyticsPage() {
  const { mode } = useFinanceMode();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isIslamic = mounted ? mode === "islamic" : false;
  const maxSpending = Math.max(...trends.map((m) => m.spending));
  const totalSpending = spending.reduce((acc, s) => acc + s.amount, 0);

  const accentColor = isIslamic ? "text-sentience-gold" : "text-violet-400";
  const accentBg = isIslamic ? "bg-sentience-gold" : "bg-violet-500";

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
              className={`px-4 py-2 text-sm rounded-md ${isIslamic ? "bg-sentience-gold/10 text-sentience-gold" : "bg-violet-500/10 text-violet-400"}`}
            >
              This Month
            </button>
            <button className="px-4 py-2 text-sm text-white/50 hover:text-white transition-colors">
              3 Months
            </button>
            <button className="px-4 py-2 text-sm text-white/50 hover:text-white transition-colors">
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
              <div className="flex items-center gap-1 text-emerald-400 text-xs">
                <ArrowDownRight className="w-3 h-3" />
                -15%
              </div>
            </div>
            <p className="text-2xl font-light font-mono text-white">
              {formatRM(totalSpending)}
            </p>
            <p className="text-xs text-white/30 mt-1">vs RM7,294 last month</p>
          </div>
          <div className="p-5 bg-white/2 border border-white/5 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/50 text-xs">Total Saved</span>
              <div className="flex items-center gap-1 text-emerald-400 text-xs">
                <ArrowUpRight className="w-3 h-3" />
                +32%
              </div>
            </div>
            <p className="text-2xl font-light font-mono text-white">
              {formatRM(1800)}
            </p>
            <p className="text-xs text-white/30 mt-1">vs RM1,360 last month</p>
          </div>
          <div
            className={`p-5 border rounded-xl ${isIslamic ? "bg-sentience-gold/5 border-sentience-gold/10" : "bg-violet-500/5 border-violet-500/10"}`}
          >
            <div className="flex items-center justify-between mb-3">
              <span
                className={`text-xs ${isIslamic ? "text-sentience-gold/70" : "text-violet-400/70"}`}
              >
                Budget Health
              </span>
              <TrendingUp className={`w-4 h-4 ${accentColor}`} />
            </div>
            <p className={`text-2xl font-light font-mono ${accentColor}`}>
              Good
            </p>
            <p
              className={`text-xs mt-1 ${isIslamic ? "text-sentience-gold/50" : "text-violet-400/50"}`}
            >
              Within targets
            </p>
          </div>
          <div className="p-5 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-emerald-400/70 text-xs">Savings Rate</span>
              <ArrowUpRight className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-light font-mono text-emerald-400">
              28%
            </p>
            <p className="text-xs text-emerald-400/50 mt-1">Target: 25%</p>
          </div>
        </div>

                {/* AI Insights */}
        <div
          className={`border rounded-xl p-6 ${isIslamic ? "bg-sentience-gold/5 border-sentience-gold/10" : "bg-violet-500/5 border-violet-500/10"}`}
        >
          <h3 className="text-sm font-light text-white/40 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Sparkles className={`w-4 h-4 ${accentColor}`} />
            {isIslamic ? "Barakah Insights" : "AI Insights"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {insights.map((insight, i) => (
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
                    <p className="text-xs text-white/50">
                      {insight.description}
                    </p>
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
              {spending.map((category, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-24 truncate">
                    <span className="text-sm text-white/70">
                      {category.name}
                    </span>
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
                      {formatRM(category.amount)}
                    </span>
                  </div>
                  <div className="w-10 text-right">
                    <span className="text-xs text-white/30">
                      {category.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Trends */}
          <div className="bg-white/2 border border-white/5 rounded-xl p-6">
            <h3 className="text-sm font-light text-white/40 uppercase tracking-wider mb-6 flex items-center gap-2">
              <TrendingUp className={`w-4 h-4 ${accentColor}`} />
              Monthly Trends
            </h3>

            <div className="flex items-end justify-between h-48 gap-2">
              {trends.map((month, i) => (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center gap-2"
                >
                  <div className="w-full flex flex-col gap-1 h-40 justify-end">
                    <div
                      className={`w-full rounded-t ${isIslamic ? "bg-sentience-gold/30" : "bg-violet-500/30"}`}
                      style={{
                        height: `${(month.spending / maxSpending) * 100}%`,
                      }}
                    />
                    <div
                      className="w-full bg-emerald-500/30 rounded"
                      style={{
                        height: `${(month.savings / maxSpending) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-white/40">{month.month}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-white/5">
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded ${isIslamic ? "bg-sentience-gold/30" : "bg-violet-500/30"}`}
                />
                <span className="text-xs text-white/40">Spending</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-emerald-500/30" />
                <span className="text-xs text-white/40">Savings</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
