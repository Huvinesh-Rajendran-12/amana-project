"use client";

import { useState, useEffect } from "react";
import DashboardHeader from "@/components/client/DashboardHeader";
import { useFinanceMode } from "@/context/FinanceModeContext";
import {
  Wallet,
  CreditCard,
  Shield,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Brain,
  Sparkles,
} from "lucide-react";

// AI Suggestions
const suggestions = [
  {
    title: "Reduce Dining Expenses",
    description:
      "You've spent 78% of your dining budget. Consider cooking at home more to stay within limits.",
  },
  {
    title: "Emergency Fund Progress",
    description:
      "Great job! You're on track to complete your emergency fund by December. Keep it up!",
  },
  {
    title: "Investment Opportunity",
    description:
      "Based on your savings rate, you could increase your monthly investment by $200.",
  },
];

const islamicSuggestions = [
  {
    title: "Zakat Reminder",
    description:
      "Based on your savings, your estimated Zakat this year is RM3,571. Consider setting aside monthly.",
  },
  {
    title: "Tabung Haji Progress",
    description:
      "MasyaAllah! You're 63% towards your Hajj savings goal. Maintain RM1,000/month to reach target.",
  },
  {
    title: "Halal Investment",
    description:
      "Your portfolio is 100% Shariah-compliant. Consider diversifying into Sukuk for stable returns.",
  },
];

const spendingCategories = [
  { name: "Housing", amount: 2400, budget: 2400, color: "#8b5cf6" },
  { name: "Groceries", amount: 680, budget: 800, color: "#06b6d4" },
  { name: "Dining", amount: 390, budget: 500, color: "#f59e0b" },
  { name: "Transport", amount: 245, budget: 400, color: "#10b981" },
];

const islamicSpendingCategories = [
  { name: "Housing (BBA)", amount: 2400, budget: 2400, color: "#d4a853" },
  { name: "Halal Groceries", amount: 680, budget: 800, color: "#10b981" },
  { name: "Zakat & Sadaqah", amount: 390, budget: 500, color: "#d4a853" },
  { name: "Tabung Haji", amount: 500, budget: 1000, color: "#d4a853" },
];

export default function DashboardPage() {
  const { mode } = useFinanceMode();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Default to conventional during SSR to prevent hydration mismatch
  const isIslamic = mounted ? mode === "islamic" : false;

  const categories = isIslamic ? islamicSpendingCategories : spendingCategories;
  const accentColor = isIslamic ? "text-sentience-gold" : "text-violet-400";

  return (
    <div className="text-cream">
      <DashboardHeader
        title="Welcome back, Firdaus"
        subtitle="Here's your financial overview"
      />

      <div className="p-6 lg:p-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Available Balance"
            value="$12,847.32"
            change="+2.4%"
            trend="up"
            icon={<Wallet className="w-5 h-5" />}
            isIslamic={isIslamic}
          />
          <StatCard
            title="Monthly Spending"
            value="$3,895.43"
            change="-12.3%"
            trend="down"
            icon={<CreditCard className="w-5 h-5" />}
            isIslamic={isIslamic}
          />
          <StatCard
            title="Blocked This Month"
            value="$4,240.00"
            subtitle="3 transactions"
            icon={<Shield className="w-5 h-5" />}
            highlight
            isIslamic={isIslamic}
          />
          <StatCard
            title={isIslamic ? "Tabung Haji" : "Vault Balance"}
            value="$8,432.00"
            change={isIslamic ? "+4.1% Hibah" : "+5.2% APY"}
            trend="up"
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
              {(isIslamic ? islamicSuggestions : suggestions).map(
                (suggestion, i) => (
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
                )
              )}
            </div>
          </div>

          {/* Spending Breakdown */}
          <div className="space-y-4">
            <h2 className="text-lg font-light flex items-center gap-2">
              <Sparkles className={`w-5 h-5 ${accentColor}`} />
              Spending Breakdown
            </h2>

            <div className="bg-cream/2 border border-cream/5 rounded-xl p-6 space-y-6">
              {categories.map((category) => (
                <div key={category.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-cream/60">{category.name}</span>
                    <span className="font-mono text-cream">
                      ${category.amount.toLocaleString()}
                      <span className="text-cream/30">
                        {" "}
                        / ${category.budget.toLocaleString()}
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
              ))}

              <div className="pt-4 border-t border-cream/5">
                <div className="flex items-center justify-between">
                  <span className="text-cream/60 text-sm">Total Spent</span>
                  <span className="text-lg font-light font-mono text-cream">
                    $3,715{" "}
                    <span className="text-cream/30 text-sm">/ $4,100</span>
                  </span>
                </div>
              </div>
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
        {change && (
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
      </div>
      <div className="text-2xl font-light mb-1 font-mono text-cream">
        {value}
      </div>
      <div className="text-xs text-cream/40">{subtitle || title}</div>
    </div>
  );
}
