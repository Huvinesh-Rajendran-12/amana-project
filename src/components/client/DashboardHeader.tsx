"use client";

import { Bell, Menu } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useFinanceMode } from "@/context/FinanceModeContext";
import { useUser } from "@/context/UserContext";
import { useUnreadInsightsCount } from "@/hooks/useInsights";
import SpendingModeSelector from "./SpendingModeSelector";
import {
  Moon,
  Percent,
  Home,
  CreditCard,
  PieChart,
  Target,
  Wallet,
  X,
} from "lucide-react";

interface DashboardHeaderProps {
  title?: string;
  subtitle?: string;
}

const navItems = [
  { icon: Home, label: "Overview", href: "/dashboard" },
  { icon: CreditCard, label: "Transactions", href: "/dashboard/transactions" },
  { icon: Wallet, label: "Wealth", href: "/dashboard/wealth" },
  { icon: PieChart, label: "Analytics", href: "/dashboard/analytics" },
  { icon: Target, label: "Goals", href: "/dashboard/goals" },
];

export default function DashboardHeader({
  title = "Dashboard",
  subtitle,
}: DashboardHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { mode } = useFinanceMode();
  const { user, userId } = useUser();
  const unreadCount = useUnreadInsightsCount();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isIslamic = mounted && mode === "islamic";
  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "LU";

  return (
    <>
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between px-6 lg:px-8 h-16">
          {/* Mobile Menu Button & Logo */}
          <div className="flex items-center gap-4 lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 text-white/60 hover:text-white transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link href="/" className="flex items-center gap-2">
              {isIslamic ? (
                <Moon className="w-5 h-5 text-sentience-gold" />
              ) : (
                <Percent className="w-5 h-5 text-violet-400" />
              )}
              <span className="text-lg font-light tracking-widest text-white">
                LUMINA
              </span>
            </Link>
          </div>

          {/* Title (Desktop) */}
          <div className="hidden lg:block">
            <h1 className="text-lg font-light text-white">{title}</h1>
            {subtitle && <p className="text-xs text-white/50">{subtitle}</p>}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* Spending Mode Selector */}
            {userId && (
              <div className="hidden sm:block">
                <SpendingModeSelector />
              </div>
            )}

            {/* Notifications */}
            <button className="relative p-2 text-white/60 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              {unreadCount && unreadCount.count > 0 && (
                <span
                  className={`absolute top-1 right-1 min-w-[8px] h-2 rounded-full ${
                    isIslamic ? "bg-sentience-gold/60" : "bg-violet-500/60"
                  }`}
                />
              )}
            </button>

            {/* User Avatar */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white ${
                isIslamic
                  ? "bg-linear-to-br from-sentience-gold to-amber-600"
                  : "bg-linear-to-br from-violet-500 to-cyan-500"
              }`}
            >
              {userInitials}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-72 bg-black border-r border-white/5 p-6">
            <div className="flex items-center justify-between mb-8">
              <Link href="/" className="flex items-center gap-2">
                {isIslamic ? (
                  <Moon className="w-5 h-5 text-sentience-gold" />
                ) : (
                  <Percent className="w-5 h-5 text-violet-400" />
                )}
                <span className="text-lg font-light tracking-widest text-white">
                  LUMINA
                </span>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-white/60 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-light text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
