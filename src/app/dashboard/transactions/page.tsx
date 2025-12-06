"use client";

import { useState, useEffect, useMemo } from "react";
import DashboardHeader from "@/components/client/DashboardHeader";
import { useUser } from "@/context/UserContext";
import { useFinanceMode } from "@/context/FinanceModeContext";
import { useTransactionsList, useSearchTransactions, useSpendingSummary } from "@/hooks/useTransactions";
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
} from "lucide-react";

// Icon mapping for categories
const categoryIcons: Record<string, React.ElementType> = {
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

export default function TransactionsPage() {
  const { user, userId, isLoading: userLoading } = useUser();
  const { mode } = useFinanceMode();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

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

  const isIslamic = mounted ? mode === "islamic" : false;
  const currency = user?.currency || "USD";

  // Use search results if searching, otherwise use full list
  const transactions = useMemo(() => {
    if (debouncedSearch.length > 0 && searchResults) {
      return searchResults;
    }
    return transactionsData?.transactions ?? [];
  }, [debouncedSearch, searchResults, transactionsData]);

  // Calculate stats
  const totalTransactions = transactions.length;
  const totalSpent = spendingSummary?.totalExpenses ?? 0;
  const expenseCount = transactions.filter((t) => t.type === "expense").length;
  const incomeCount = transactions.filter((t) => t.type === "income").length;

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
          <div className="p-4 bg-violet-500/5 border border-violet-500/10 rounded-xl">
            <p className="text-xs text-violet-400/70 mb-1">Income</p>
            <p className="text-2xl font-light font-mono text-violet-400">
              {incomeCount}
            </p>
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
                    <td colSpan={5} className="px-6 py-12 text-center text-white/40">
                      {debouncedSearch ? (
                        <>No transactions found for &quot;{debouncedSearch}&quot;</>
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
