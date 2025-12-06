"use client";

import DashboardHeader from "@/components/client/DashboardHeader";
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
} from "lucide-react";

// Mock transaction data
const transactions = [
  {
    id: 1,
    merchant: "Whole Foods Market",
    category: "Groceries",
    amount: -127.43,
    status: "approved",
    date: "Dec 6, 2025",
    time: "2:34 PM",
    icon: ShoppingBag,
  },
  {
    id: 2,
    merchant: "Tesla Supercharger",
    category: "Auto",
    amount: -34.2,
    status: "approved",
    date: "Dec 6, 2025",
    time: "11:20 AM",
    icon: Car,
  },
  {
    id: 3,
    merchant: "Louis Vuitton",
    category: "Luxury",
    amount: -2400.0,
    status: "blocked",
    date: "Dec 6, 2025",
    time: "10:15 AM",
    icon: ShoppingBag,
    blockReason: "Exceeds discretionary budget",
  },
  {
    id: 4,
    merchant: "Starbucks",
    category: "Dining",
    amount: -8.75,
    status: "approved",
    date: "Dec 6, 2025",
    time: "8:45 AM",
    icon: Coffee,
  },
  {
    id: 5,
    merchant: "Delta Airlines",
    category: "Travel",
    amount: -589.0,
    status: "pending",
    date: "Dec 5, 2025",
    time: "6:30 PM",
    icon: Plane,
  },
  {
    id: 6,
    merchant: "Chipotle",
    category: "Dining",
    amount: -15.4,
    status: "approved",
    date: "Dec 5, 2025",
    time: "1:20 PM",
    icon: Utensils,
  },
  {
    id: 7,
    merchant: "Netflix",
    category: "Entertainment",
    amount: -15.99,
    status: "approved",
    date: "Dec 5, 2025",
    time: "12:00 AM",
    icon: Gamepad2,
  },
  {
    id: 8,
    merchant: "Rent Payment",
    category: "Housing",
    amount: -2400.0,
    status: "approved",
    date: "Dec 1, 2025",
    time: "12:00 AM",
    icon: Home,
  },
  {
    id: 9,
    merchant: "Electric Company",
    category: "Utilities",
    amount: -145.32,
    status: "approved",
    date: "Dec 1, 2025",
    time: "12:00 AM",
    icon: Zap,
  },
  {
    id: 10,
    merchant: "Trader Joe's",
    category: "Groceries",
    amount: -89.5,
    status: "approved",
    date: "Nov 30, 2025",
    time: "5:45 PM",
    icon: ShoppingBag,
  },
];

export default function TransactionsPage() {
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
              {transactions.length}
            </p>
          </div>
          <div className="p-4 bg-white/2 border border-white/5 rounded-xl">
            <p className="text-xs text-white/40 mb-1">Total Spent</p>
            <p className="text-2xl font-light font-mono text-white">
              $
              {Math.abs(
                transactions.reduce((acc, tx) => acc + tx.amount, 0)
              ).toFixed(2)}
            </p>
          </div>
          <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
            <p className="text-xs text-emerald-400/70 mb-1">Approved</p>
            <p className="text-2xl font-light font-mono text-emerald-400">
              {transactions.filter((t) => t.status === "approved").length}
            </p>
          </div>
          <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-xl">
            <p className="text-xs text-red-400/70 mb-1">Blocked</p>
            <p className="text-2xl font-light font-mono text-red-400">
              {transactions.filter((t) => t.status === "blocked").length}
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
                    Status
                  </th>
                  <th className="text-right text-xs font-light text-white/40 uppercase tracking-wider px-6 py-4">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="border-b border-white/5 hover:bg-white/2 last:border-0 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                          <tx.icon className="w-4 h-4 text-white/50" />
                        </div>
                        <div>
                          <div className="font-light text-white">
                            {tx.merchant}
                          </div>
                          {tx.blockReason && (
                            <div className="text-xs text-red-400/70">
                              {tx.blockReason}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-white/50">
                        {tx.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-white/50">{tx.date}</div>
                      <div className="text-xs text-white/30">{tx.time}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs ${
                          tx.status === "approved"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : tx.status === "blocked"
                              ? "bg-red-500/10 text-red-400"
                              : "bg-amber-500/10 text-amber-400"
                        }`}
                      >
                        {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span
                        className={`font-mono ${tx.status === "blocked" ? "text-white/30 line-through" : "text-white"}`}
                      >
                        ${Math.abs(tx.amount).toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-white/40">
            Showing {transactions.length} of {transactions.length} transactions
          </p>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white/2 border border-white/5 text-white/50 hover:text-white rounded-lg text-sm transition-colors">
              Previous
            </button>
            <button className="px-4 py-2 bg-violet-500/10 border border-violet-500/20 rounded-lg text-sm text-violet-400">
              1
            </button>
            <button className="px-4 py-2 bg-white/2 border border-white/5 text-white/50 hover:text-white rounded-lg text-sm transition-colors">
              2
            </button>
            <button className="px-4 py-2 bg-white/2 border border-white/5 text-white/50 hover:text-white rounded-lg text-sm transition-colors">
              3
            </button>
            <button className="px-4 py-2 bg-white/2 border border-white/5 text-white/50 hover:text-white rounded-lg text-sm transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
