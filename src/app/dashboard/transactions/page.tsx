"use client";

import { useState, useEffect, useMemo } from "react";
import DashboardHeader from "@/components/client/DashboardHeader";
import ContextualInsight from "@/components/client/ContextualInsight";
import { useUser } from "@/context/UserContext";
import { useFinanceMode } from "@/context/FinanceModeContext";
import { useTransactionsList, useSearchTransactions, useSpendingSummary, useSpendingByCategory } from "@/hooks/useTransactions";
import { useTransactionInsights } from "@/hooks/useAIInsights";
import {
  ShoppingBag,
  Car,
  Coffee,
  Utensils,
  Plane,
  Home,
  Zap,
  Gamepad2,
  Search,
  Filter,
  Download,
  Loader2,
  CreditCard,
  TrendingUp,
  Wallet,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

// Shariah status type
type ShariahStatus = "halal" | "haram" | "doubtful" | "pending_review";

// Enriched transaction type (backend adds these fields)
type EnrichedTransaction = {
  _id: string;
  type: "expense" | "income" | "transfer";
  amount: number;
  merchantName: string;
  date: number;
  markedAsRegret: boolean;
  categoryName?: string;
  categoryColor?: string;
  categoryIcon?: string;
  shariahStatus?: ShariahStatus;
  shariahReason?: string;
};

// Icon mapping for categories
const categoryIcons: Record<string, LucideIcon> = {
  "Food & Dining": Utensils,
  "Transportation": Car,
  "Shopping": ShoppingBag,
  "Entertainment": Gamepad2,
  "Bills & Utilities": Zap,
  "Subscriptions": CreditCard,
  "Health & Fitness": TrendingUp,
  "Travel": Plane,
  "Personal Care": Coffee,
  "Education": Home,
  "Gifts & Donations": Wallet,
  "Income": Wallet,
  "Other": ShoppingBag,
};

// Format currency
const formatCurrency = (amount: number, currency: string = "USD") => {
  const symbol = currency === "MYR" ? "RM " : "$";
  return `${symbol}${Math.abs(amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Format date
const formatDate = (timestamp: number) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// Format time
const formatTime = (timestamp: number) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

// Shariah status badge component
const ShariahBadge = ({ status, reason }: { status?: ShariahStatus; reason?: string }) => {
  if (!status) return null;
  
  const config = {
    halal: { 
      icon: CheckCircle2, 
      label: "Halal", 
      className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
    },
    haram: { 
      icon: XCircle, 
      label: "Haram", 
      className: "bg-red-500/10 text-red-400 border-red-500/20" 
    },
    doubtful: { 
      icon: HelpCircle, 
      label: "Doubtful", 
      className: "bg-amber-500/10 text-amber-400 border-amber-500/20" 
    },
    pending_review: { 
      icon: Clock, 
      label: "Reviewing", 
      className: "bg-blue-500/10 text-blue-400 border-blue-500/20" 
    },
  };
  
  const { icon: Icon, label, className } = config[status];
  
  return (
    <div className="group relative">
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${className}`}>
        <Icon className="w-3 h-3" />
        {label}
      </span>
      {reason && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/90 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
          {reason}
        </div>
      )}
    </div>
  );
};

export default function TransactionsPage() {
  const { user, userId, isLoading: userLoading } = useUser();
  const { mode } = useFinanceMode();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [shariahFilter, setShariahFilter] = useState<ShariahStatus | "all">("all");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch transactions
  const transactionsData = useTransactionsList({ limit: 50 });
  const searchResults = useSearchTransactions(debouncedSearch);
  const spendingSummary = useSpendingSummary(1);
  const spendingByCategory = useSpendingByCategory(1);

  const isIslamic = mounted ? mode === "islamic" : false;
  const currency = user?.currency || "USD";
  const accentColor = isIslamic ? "text-sentience-gold" : "text-violet-400";

  // Get AI-powered transaction insights
  const { insights: aiInsights, isLoading: insightsLoading } = useTransactionInsights(isIslamic);

  // Use search results if searching, otherwise use full list (with Shariah filter)
  const transactions = useMemo((): EnrichedTransaction[] => {
    let txList: EnrichedTransaction[];
    if (debouncedSearch.length > 0 && searchResults) {
      txList = searchResults as EnrichedTransaction[];
    } else {
      txList = (transactionsData?.transactions ?? []) as EnrichedTransaction[];
    }
    
    // Apply Shariah filter in Islamic mode
    if (isIslamic && shariahFilter !== "all") {
      txList = txList.filter(t => t.shariahStatus === shariahFilter);
    }
    
    return txList;
  }, [debouncedSearch, searchResults, transactionsData, isIslamic, shariahFilter]);

  // Calculate stats
  const totalTransactions = transactions.length;
  const totalSpent = spendingSummary?.totalExpenses ?? 0;
  const expenseCount = transactions.filter((t) => t.type === "expense").length;
  const incomeCount = transactions.filter((t) => t.type === "income").length;
  const regretCount = transactions.filter((t) => t.markedAsRegret).length;
  
  // Shariah compliance stats (use unfiltered data)
  const allTx = (transactionsData?.transactions ?? []) as EnrichedTransaction[];
  const halalCount = allTx.filter((t) => t.shariahStatus === "halal").length;
  const haramCount = allTx.filter((t) => t.shariahStatus === "haram").length;
  const doubtfulCount = allTx.filter((t) => t.shariahStatus === "doubtful").length;
  const pendingCount = allTx.filter((t) => t.shariahStatus === "pending_review").length;

  // Generate AI insights for transactions
  const transactionInsights = useMemo(() => {
    const insights: Array<{
      title: string;
      message: string;
      type: "info" | "success" | "warning" | "tip";
      actionLabel?: string;
    }> = [];

    // Spending pattern analysis
    if (spendingByCategory?.categories && spendingByCategory.categories.length > 0) {
      const topCategory = spendingByCategory.categories[0];
      const topPercentage = topCategory.percentage;
      
      if (topPercentage > 40) {
        insights.push({
          title: `${topCategory.categoryName} dominates your spending`,
          message: `${topPercentage}% of your spending goes to ${topCategory.categoryName}. Consider if this aligns with your financial goals.`,
          type: "warning",
          actionLabel: "Review spending",
        });
      } else {
        insights.push({
          title: "Balanced spending pattern",
          message: `Your spending is well-distributed across categories, with ${topCategory.categoryName} being the highest at ${topPercentage}%.`,
          type: "success",
        });
      }
    }

    // Regret analysis
    if (regretCount > 0) {
      const regretTotal = transactions
        .filter((t) => t.markedAsRegret)
        .reduce((sum, t) => sum + t.amount, 0);
      
      insights.push({
        title: `${regretCount} impulse purchase${regretCount > 1 ? "s" : ""} detected`,
        message: `You've marked ${formatCurrency(regretTotal, currency)} worth of purchases as impulse buys. That's money you could redirect to savings.`,
        type: "warning",
        actionLabel: "Set spending limit",
      });
    }

    // Savings rate insight
    if (spendingSummary) {
      const savingsRate = spendingSummary.savingsRate;
      if (savingsRate >= 25) {
        insights.push({
          title: "Excellent savings discipline",
          message: `With a ${savingsRate.toFixed(0)}% savings rate, you're building wealth faster than most. Keep it up!`,
          type: "success",
        });
      } else if (savingsRate < 10 && savingsRate >= 0) {
        insights.push({
          title: "Savings rate needs attention",
          message: `Your ${savingsRate.toFixed(0)}% savings rate is below the recommended 20%. Look for expenses you can reduce.`,
          type: "warning",
          actionLabel: "Find savings",
        });
      }
    }

    // Islamic-specific insights using AI-powered Shariah compliance
    if (isIslamic && allTx.length > 0) {
      if (haramCount > 0) {
        const haramTotal = allTx
          .filter((t) => t.shariahStatus === "haram")
          .reduce((sum, t) => sum + t.amount, 0);
        insights.push({
          title: `${haramCount} non-compliant transaction${haramCount > 1 ? "s" : ""} detected`,
          message: `AI detected ${formatCurrency(haramTotal, currency)} in transactions that may not be Shariah-compliant. Consider reviewing these.`,
          type: "warning",
          actionLabel: "Review haram",
        });
      } else if (doubtfulCount > 0) {
        insights.push({
          title: `${doubtfulCount} doubtful transaction${doubtfulCount > 1 ? "s" : ""}`,
          message: `Some transactions need your review to determine Shariah compliance. Tap to review.`,
          type: "tip",
          actionLabel: "Review doubtful",
        });
      } else if (halalCount > 0 && haramCount === 0) {
        insights.push({
          title: "Alhamdulillah! All spending is halal",
          message: `All ${halalCount} analyzed transactions are Shariah-compliant. May Allah bless your earnings.`,
          type: "success",
        });
      }
      
      if (pendingCount > 0) {
        insights.push({
          title: `Analyzing ${pendingCount} transaction${pendingCount > 1 ? "s" : ""}`,
          message: `AI is checking Shariah compliance for recent transactions. Results will appear shortly.`,
          type: "info",
        });
      }
    }

    // Default insight if no others
    if (insights.length === 0) {
      insights.push({
        title: transactions.length > 0 ? "Tracking your spending" : "Start tracking",
        message: transactions.length > 0 
          ? "I'm analyzing your transactions to provide personalized insights. Keep adding transactions for better recommendations."
          : "Add your first transaction to get AI-powered spending insights and recommendations.",
        type: "info",
      });
    }

    return insights.slice(0, 3);
  }, [transactions, spendingByCategory, spendingSummary, regretCount, currency, isIslamic]);

  // Loading state
  if (!mounted || userLoading || (userId && transactionsData === undefined)) {
    return (
      <div className="text-white min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
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

  return (
    <div className="text-white">
      <DashboardHeader
        title="Transactions"
        subtitle="View and manage your transaction history"
      />

      <div className="p-6 lg:p-8 space-y-6">
        {/* Filters Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 bg-white/2 border border-white/5 text-white placeholder:text-white/30 rounded-lg text-sm focus:outline-none focus:border-white/20 transition-colors"
            />
          </div>
          <div className="flex gap-3">
            <button className="h-10 px-4 bg-white/2 border border-white/5 text-white/50 hover:text-white hover:border-white/10 rounded-lg text-sm transition-colors flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </button>
            <button className="h-10 px-4 bg-white/2 border border-white/5 text-white/50 hover:text-white hover:border-white/10 rounded-lg text-sm transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Shariah Compliance Filter (Islamic Mode Only) */}
        {isIslamic && (
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-4 h-4 text-sentience-gold" />
            <span className="text-sm text-white/50">Shariah Status:</span>
            <div className="flex gap-2 flex-wrap">
              {[
                { value: "all", label: "All", count: allTx.length },
                { value: "halal", label: "Halal", count: halalCount, color: "emerald" },
                { value: "haram", label: "Haram", count: haramCount, color: "red" },
                { value: "doubtful", label: "Doubtful", count: doubtfulCount, color: "amber" },
                { value: "pending_review", label: "Pending", count: pendingCount, color: "blue" },
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setShariahFilter(filter.value as ShariahStatus | "all")}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    shariahFilter === filter.value
                      ? filter.value === "all"
                        ? "bg-sentience-gold/20 text-sentience-gold border border-sentience-gold/30"
                        : filter.color === "emerald"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : filter.color === "red"
                            ? "bg-red-500/20 text-red-400 border border-red-500/30"
                            : filter.color === "amber"
                              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                              : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                      : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10"
                  }`}
                >
                  {filter.label} ({filter.count})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-white/2 border border-white/5 rounded-xl">
            <p className="text-xs text-white/40 mb-1">Total Transactions</p>
            <p className="text-2xl font-light font-mono text-white">
              {totalTransactions}
            </p>
          </div>
          <div className="p-4 bg-white/2 border border-white/5 rounded-xl">
            <p className="text-xs text-white/40 mb-1">Total Spent</p>
            <p className="text-2xl font-light font-mono text-white">
              {formatCurrency(totalSpent, currency)}
            </p>
          </div>
          <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
            <p className="text-xs text-emerald-400/70 mb-1">Expenses</p>
            <p className="text-2xl font-light font-mono text-emerald-400">
              {expenseCount}
            </p>
          </div>
          <div className={`p-4 rounded-xl ${
            isIslamic 
              ? "bg-sentience-gold/5 border border-sentience-gold/10" 
              : "bg-violet-500/5 border border-violet-500/10"
          }`}>
            <p className={`text-xs mb-1 ${isIslamic ? "text-sentience-gold/70" : "text-violet-400/70"}`}>Income</p>
            <p className={`text-2xl font-light font-mono ${accentColor}`}>
              {incomeCount}
            </p>
          </div>
        </div>

        {/* AI Analysis Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className={`w-4 h-4 ${accentColor}`} />
            <h3 className="text-sm font-light text-white/60">
              {isIslamic ? "Barakah Analysis" : "AI Analysis"}
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {transactionInsights.map((insight, i) => (
              <ContextualInsight
                key={i}
                title={insight.title}
                message={insight.message}
                type={insight.type}
                actionLabel={insight.actionLabel}
                isIslamic={isIslamic}
                compact
              />
            ))}
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white/2 border border-white/5 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-xs font-light text-white/40 uppercase tracking-wider px-6 py-4">
                    Merchant
                  </th>
                  <th className="text-left text-xs font-light text-white/40 uppercase tracking-wider px-6 py-4">
                    Category
                  </th>
                  <th className="text-left text-xs font-light text-white/40 uppercase tracking-wider px-6 py-4">
                    Date
                  </th>
                  <th className="text-left text-xs font-light text-white/40 uppercase tracking-wider px-6 py-4">
                    Type
                  </th>
                  {isIslamic && (
                    <th className="text-left text-xs font-light text-white/40 uppercase tracking-wider px-6 py-4">
                      Shariah
                    </th>
                  )}
                  <th className="text-right text-xs font-light text-white/40 uppercase tracking-wider px-6 py-4">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.length > 0 ? (
                  transactions.map((tx) => {
                    const categoryName = tx.categoryName || "Uncategorized";
                    const IconComponent = categoryIcons[categoryName] || ShoppingBag;
                    const isIncome = tx.type === "income";
                    const isRegret = tx.markedAsRegret;

                    return (
                      <tr
                        key={tx._id}
                        className="border-b border-white/5 hover:bg-white/2 last:border-0 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center"
                              style={{
                                backgroundColor: tx.categoryColor
                                  ? `${tx.categoryColor}15`
                                  : "rgba(255,255,255,0.05)",
                              }}
                            >
                              <IconComponent
                                className="w-4 h-4"
                                style={{
                                  color: tx.categoryColor || "rgba(255,255,255,0.5)",
                                }}
                              />
                            </div>
                            <div>
                              <div className="font-light text-white">
                                {tx.merchantName}
                              </div>
                              {isRegret && (
                                <div className="text-xs text-amber-400/70">
                                  Marked as impulse purchase
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-white/50">
                            {categoryName}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-white/50">{formatDate(tx.date)}</div>
                          <div className="text-xs text-white/30">{formatTime(tx.date)}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs ${
                              isIncome
                                ? "bg-emerald-500/10 text-emerald-400"
                                : isRegret
                                  ? "bg-amber-500/10 text-amber-400"
                                  : "bg-violet-500/10 text-violet-400"
                            }`}
                          >
                            {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                          </span>
                        </td>
                        {isIslamic && (
                          <td className="px-6 py-4">
                            <ShariahBadge status={tx.shariahStatus} reason={tx.shariahReason} />
                          </td>
                        )}
                        <td className="px-6 py-4 text-right">
                          <span
                            className={`font-mono ${
                              isIncome ? "text-emerald-400" : "text-white"
                            }`}
                          >
                            {isIncome ? "+" : "-"}{formatCurrency(tx.amount, currency)}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={isIslamic ? 6 : 5} className="px-6 py-12 text-center text-white/40">
                      {debouncedSearch ? (
                        <>No transactions found for &quot;{debouncedSearch}&quot;</>
                      ) : shariahFilter !== "all" ? (
                        <>No transactions with {shariahFilter.replace("_", " ")} status</>
                      ) : (
                        <>No transactions yet. Add some to get started!</>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {transactions.length > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-white/40">
              Showing {transactions.length} transaction{transactions.length !== 1 ? "s" : ""}
            </p>
            <div className="flex gap-2">
              <button
                disabled
                className="px-4 py-2 bg-white/2 border border-white/5 text-white/30 rounded-lg text-sm cursor-not-allowed"
              >
                Previous
              </button>
              <button
                className={`px-4 py-2 border rounded-lg text-sm ${
                  isIslamic
                    ? "bg-sentience-gold/10 border-sentience-gold/20 text-sentience-gold"
                    : "bg-violet-500/10 border-violet-500/20 text-violet-400"
                }`}
              >
                1
              </button>
              <button
                disabled={!transactionsData?.hasMore}
                className="px-4 py-2 bg-white/2 border border-white/5 text-white/50 hover:text-white rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
