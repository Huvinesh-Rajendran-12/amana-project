"use client";

import { useState, useEffect, useMemo } from "react";
import { useFinanceMode } from "@/context/FinanceModeContext";
import { useUser } from "@/context/UserContext";
import { useWealthOverview, useZakatCalculation, useHajjSavings } from "@/hooks/useWealth";
import DashboardHeader from "@/components/client/DashboardHeader";
import {
  TrendingUp,
  Calculator,
  Landmark,
  Shield,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  PiggyBank,
  Building,
  FileText,
  Loader2,
  AlertCircle,
} from "lucide-react";

// Malaysian Ringgit formatter
const formatRM = (amount: number) =>
  `RM ${amount.toLocaleString("en-MY", { minimumFractionDigits: 2 })}`;

// USD formatter
const formatUSD = (amount: number) =>
  `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

// Portfolio item type
interface PortfolioItem {
  name: string;
  value: number;
  return: number;
  icon: React.ElementType;
}

export default function WealthPage() {
  const { mode } = useFinanceMode();
  const { user, userId, isLoading: userLoading } = useUser();
  const [mounted, setMounted] = useState(false);

  // Fetch wealth data
  const wealthOverview = useWealthOverview();
  const zakatData = useZakatCalculation();
  const hajjData = useHajjSavings();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Default to conventional during SSR to prevent hydration mismatch
  const isIslamic = mounted ? mode === "islamic" : false;
  const formatCurrency = isIslamic || user?.currency === "MYR" ? formatRM : formatUSD;
  const accentColor = isIslamic ? "text-sentience-gold" : "text-violet-400";

  // Generate portfolio data based on wealth
  const portfolios: PortfolioItem[] = useMemo(() => {
    const totalWealth = wealthOverview.totalWealth;

    if (isIslamic) {
      // Allocate remaining wealth after Hajj savings to other portfolios
      const hajjSavings = Math.min(hajjData.saved, totalWealth * 0.25); // Cap at 25%
      const remainingWealth = Math.max(0, totalWealth - hajjSavings);

      return [
        {
          name: "Tabung Haji",
          value: hajjSavings,
          return: 4.1,
          icon: Landmark,
        },
        {
          name: "Sukuk",
          value: Math.round(remainingWealth * 0.33), // ~33% of remaining
          return: 5.2,
          icon: FileText,
        },
        {
          name: "Shariah ETFs",
          value: Math.round(remainingWealth * 0.40), // ~40% of remaining
          return: 9.8,
          icon: TrendingUp,
        },
        {
          name: "ASNB Islamic",
          value: Math.round(remainingWealth * 0.27), // ~27% of remaining
          return: 4.5,
          icon: PiggyBank,
        },
      ];
    }

    return [
      {
        name: "Fixed Deposits",
        value: Math.round(totalWealth * 0.35),
        return: 4.2,
        icon: PiggyBank,
      },
      {
        name: "Unit Trusts",
        value: Math.round(totalWealth * 0.3),
        return: 8.5,
        icon: TrendingUp,
      },
      {
        name: "Stocks",
        value: Math.round(totalWealth * 0.25),
        return: 12.3,
        icon: Building,
      },
      {
        name: "Bonds",
        value: Math.round(totalWealth * 0.1),
        return: 3.8,
        icon: FileText,
      },
    ];
  }, [wealthOverview.totalWealth, hajjData.saved, isIslamic]);

  // Insurance/Takaful data
  const protection = useMemo(() => {
    if (isIslamic) {
      return {
        coverage: 400000,
        premium: 285,
        nextPayment: "Jan 20, 2025",
        label: "Takaful",
      };
    }
    return {
      coverage: 500000,
      premium: 350,
      nextPayment: "Jan 15, 2025",
      label: "Insurance",
    };
  }, [isIslamic]);

  // Loading state
  if (!mounted || userLoading) {
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

  return (
    <div className="text-white">
      <DashboardHeader
        title="Wealth"
        subtitle={
          isIslamic
            ? "Shariah-compliant wealth management"
            : "Your portfolio overview"
        }
      />

      <div className="p-6 lg:p-8 space-y-8">
        {/* Total Wealth Card */}
        <div className="p-8 bg-white/2 border border-white/5 rounded-2xl">
          <p className="text-white/40 text-sm mb-2">Total Wealth</p>
          <div className="flex items-end gap-4">
            <h2 className="text-4xl font-light text-white">
              {formatCurrency(wealthOverview.totalWealth)}
            </h2>
            <div
              className={`flex items-center gap-1 text-sm ${
                wealthOverview.monthlyGrowth >= 0 ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {wealthOverview.monthlyGrowth >= 0 ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownRight className="w-4 h-4" />
              )}
              {Math.abs(wealthOverview.monthlyGrowth).toFixed(1)}% this month
            </div>
          </div>
        </div>

        {/* Islamic-specific: Zakat & Hajj Cards */}
        {isIslamic && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Zakat Card */}
            <div className="p-6 bg-white/2 border border-white/5 rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sentience-gold/10 flex items-center justify-center">
                    <Calculator className="w-5 h-5 text-sentience-gold" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">Zakat</h3>
                    <p className="text-xs text-white/40">Annual obligation</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-white/20" />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-white/50 text-sm">Estimated Zakat</span>
                  <span className="text-white font-medium">
                    {formatRM(zakatData.zakatAmount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50 text-sm">Nisab Threshold</span>
                  <span className="text-white/70 text-sm">{formatRM(zakatData.nisab)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50 text-sm">Last Paid</span>
                  <span className="text-emerald-400 text-sm">{zakatData.lastPaid}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50 text-sm">Status</span>
                  <span
                    className={`text-sm ${
                      zakatData.isAboveNisab ? "text-amber-400" : "text-emerald-400"
                    }`}
                  >
                    {zakatData.isAboveNisab ? "Due" : "Below Nisab"}
                  </span>
                </div>
              </div>
            </div>

            {/* Hajj Card */}
            <div className="p-6 bg-white/2 border border-white/5 rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sentience-gold/10 flex items-center justify-center">
                    <Landmark className="w-5 h-5 text-sentience-gold" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">Hajj Savings</h3>
                    <p className="text-xs text-white/40">Tabung Haji</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-white/20" />
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-white/50 text-sm">Progress</span>
                    <span className="text-white text-sm">{hajjData.progress}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sentience-gold rounded-full transition-all duration-500"
                      style={{ width: `${hajjData.progress}%` }}
                    />
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50 text-sm">Saved</span>
                  <span className="text-white font-medium">{formatRM(hajjData.saved)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50 text-sm">Target</span>
                  <span className="text-white/70 text-sm">{formatRM(hajjData.target)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50 text-sm">Est. Departure</span>
                  <span className="text-sentience-gold text-sm">{hajjData.waitingList}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Investments Portfolio */}
        <div>
          <h3 className="text-lg font-light text-white mb-4">
            {isIslamic ? "Halal Investments" : "Investments"}
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {portfolios.map((item) => (
              <div
                key={item.name}
                className="p-5 bg-white/2 border border-white/5 rounded-xl hover:border-white/10 transition-colors"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-9 h-9 rounded-lg ${
                      isIslamic ? "bg-sentience-gold/10" : "bg-violet-500/10"
                    } flex items-center justify-center`}
                  >
                    <item.icon className={`w-4 h-4 ${accentColor}`} />
                  </div>
                  <span className="text-white/70 text-sm">{item.name}</span>
                </div>
                <p className="text-xl font-light text-white mb-1">
                  {formatCurrency(item.value)}
                </p>
                <p className="text-emerald-400 text-xs flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" />
                  {item.return}% p.a.
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Protection */}
        <div>
          <h3 className="text-lg font-light text-white mb-4">
            {isIslamic ? "Takaful Protection" : "Insurance"}
          </h3>
          <div className="p-6 bg-white/2 border border-white/5 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-xl ${
                    isIslamic ? "bg-sentience-gold/10" : "bg-violet-500/10"
                  } flex items-center justify-center`}
                >
                  <Shield className={`w-5 h-5 ${accentColor}`} />
                </div>
                <div>
                  <p className="text-white font-medium">
                    {formatCurrency(protection.coverage)} Coverage
                  </p>
                  <p className="text-white/40 text-sm">
                    {formatCurrency(protection.premium)}/month
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white/40 text-xs">Next payment</p>
                <p className="text-white/70 text-sm">{protection.nextPayment}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Summary */}
        <div className="p-6 bg-white/2 border border-white/5 rounded-xl">
          <h3 className="text-lg font-light text-white mb-4">Monthly Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-white/40 text-xs mb-1">Income</p>
              <p className="text-white font-mono">
                {formatCurrency(wealthOverview.monthlyIncome)}
              </p>
            </div>
            <div>
              <p className="text-white/40 text-xs mb-1">Savings</p>
              <p
                className={`font-mono ${
                  wealthOverview.monthlySavings >= 0 ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {formatCurrency(wealthOverview.monthlySavings)}
              </p>
            </div>
            <div>
              <p className="text-white/40 text-xs mb-1">Savings Rate</p>
              <p className="text-white font-mono">
                {wealthOverview.savingsRate.toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-white/40 text-xs mb-1">Growth</p>
              <p
                className={`font-mono ${
                  wealthOverview.monthlyGrowth >= 0 ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {wealthOverview.monthlyGrowth >= 0 ? "+" : ""}
                {wealthOverview.monthlyGrowth.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
