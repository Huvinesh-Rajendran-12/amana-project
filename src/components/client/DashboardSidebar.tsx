"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useFinanceMode } from "@/context/FinanceModeContext";
import {
  Moon,
  Home,
  CreditCard,
  PieChart,
  Target,
  Settings,
  LogOut,
  Percent,
  Wallet,
} from "lucide-react";

// Simplified navigation - same for both modes
const navItems = [
  { icon: Home, label: "Overview", href: "/dashboard" },
  { icon: CreditCard, label: "Transactions", href: "/dashboard/transactions" },
  { icon: Wallet, label: "Wealth", href: "/dashboard/wealth" },
  { icon: PieChart, label: "Analytics", href: "/dashboard/analytics" },
  { icon: Target, label: "Goals", href: "/dashboard/goals" },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { mode, toggleMode } = useFinanceMode();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Default to conventional during SSR to prevent hydration mismatch
  const isIslamic = mounted ? mode === "islamic" : false;

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-black border-r border-white/5 z-50 hidden lg:flex flex-col">
      <div className="p-6 flex-1">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 mb-12">
          <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center">
            {isIslamic ? (
              <Moon className="w-4 h-4 text-sentience-gold" />
            ) : (
              <Percent className="w-4 h-4 text-violet-400" />
            )}
          </div>
          <span className="text-lg font-light tracking-[0.2em] text-white">
            LUMINA
          </span>
        </Link>

        {/* Navigation */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-light transition-all duration-300 ${
                  isActive
                    ? isIslamic
                      ? "bg-sentience-gold/10 text-sentience-gold"
                      : "bg-violet-500/10 text-violet-400"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom section */}
      <div className="p-6 border-t border-white/5 space-y-4">
        {/* Mode Toggle */}
        <div className="px-2">
          <p className="text-[10px] text-white/30 uppercase tracking-wider mb-3">
            Banking Mode
          </p>
          <button
            onClick={toggleMode}
            className="flex items-center justify-between p-1 rounded-full bg-white/5 border border-white/10"
          >
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-300 ${
                !isIslamic ? "bg-violet-500 text-white" : "text-white/40"
              }`}
            >
              <Percent className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">Core</span>
            </div>
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-300 ${
                isIslamic ? "bg-sentience-gold text-black" : "text-white/40"
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">Nur</span>
            </div>
          </button>
        </div>

        <Link
          href="/dashboard/settings"
          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-light text-white/50 hover:text-white transition-colors rounded-lg hover:bg-white/5"
        >
          <Settings className="w-4 h-4" />
          Settings
        </Link>
        <Link
          href="/"
          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-light text-white/50 hover:text-white transition-colors rounded-lg hover:bg-white/5"
        >
          <LogOut className="w-4 h-4" />
          Exit
        </Link>
      </div>
    </aside>
  );
}
