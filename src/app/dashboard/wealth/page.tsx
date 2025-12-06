"use client";

import { useState, useEffect } from "react";
import { useFinanceMode } from "@/context/FinanceModeContext";
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
} from "lucide-react";

// Malaysian Ringgit formatter
const formatRM = (amount: number) =>
  `RM ${amount.toLocaleString("en-MY", { minimumFractionDigits: 2 })}`;

// Conventional wealth data
const conventionalData = {
  totalWealth: 156420.0,
  monthlyGrowth: 3.2,
  portfolios: [
    {
      name: "Fixed Deposits",
      value: 50000,
      return: 4.2,
      icon: PiggyBank,
    },
    {
      name: "Unit Trusts",
      value: 45000,
      return: 8.5,
      icon: TrendingUp,
    },
    {
      name: "Stocks",
      value: 38420,
      return: 12.3,
      icon: Building,
    },
    {
      name: "Bonds",
      value: 23000,
      return: 3.8,
      icon: FileText,
    },
  ],
  insurance: {
    coverage: 500000,
    premium: 350,
    nextPayment: "Jan 15, 2025",
  },
};

// Islamic wealth data
const islamicData = {
  totalWealth: 142850.0,
  monthlyGrowth: 2.8,
  zakat: {
    estimated: 3571.25,
    nisab: 25578,
    lastPaid: "Ramadan 1445",
    dueDate: "Ramadan 1446",
  },
  hajj: {
    saved: 28500,
    target: 45000,
    progress: 63,
    waitingList: "2027",
  },
  portfolios: [
    {
      name: "Tabung Haji",
      value: 28500,
      return: 4.1,
      icon: Landmark,
    },
    {
      name: "Sukuk",
      value: 35000,
      return: 5.2,
      icon: FileText,
    },
    {
      name: "Shariah ETFs",
      value: 42350,
      return: 9.8,
      icon: TrendingUp,
    },
    {
      name: "ASNB Islamic",
      value: 37000,
      return: 4.5,
      icon: PiggyBank,
    },
  ],
  takaful: {
    coverage: 400000,
    contribution: 285,
    nextPayment: "Jan 20, 2025",
  },
};

export default function WealthPage() {
  const { mode } = useFinanceMode();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Default to conventional during SSR to prevent hydration mismatch
  const isIslamic = mounted ? mode === "islamic" : false;
  const data = isIslamic ? islamicData : conventionalData;
  const accentColor = isIslamic ? "text-sentience-gold" : "text-violet-400";

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
              {formatRM(data.totalWealth)}
            </h2>
            <div
              className={`flex items-center gap-1 text-sm ${
                data.monthlyGrowth >= 0 ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {data.monthlyGrowth >= 0 ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownRight className="w-4 h-4" />
              )}
              {Math.abs(data.monthlyGrowth)}% this month
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
                    {formatRM(islamicData.zakat.estimated)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50 text-sm">Nisab Threshold</span>
                  <span className="text-white/70 text-sm">
                    {formatRM(islamicData.zakat.nisab)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50 text-sm">Last Paid</span>
                  <span className="text-emerald-400 text-sm">
                    {islamicData.zakat.lastPaid}
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
                    <span className="text-white text-sm">
                      {islamicData.hajj.progress}%
                    </span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sentience-gold rounded-full transition-all duration-500"
                      style={{ width: `${islamicData.hajj.progress}%` }}
                    />
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50 text-sm">Saved</span>
                  <span className="text-white font-medium">
                    {formatRM(islamicData.hajj.saved)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50 text-sm">Est. Departure</span>
                  <span className="text-sentience-gold text-sm">
                    {islamicData.hajj.waitingList}
                  </span>
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
            {data.portfolios.map((item) => (
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
                  {formatRM(item.value)}
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
                    {formatRM(
                      isIslamic
                        ? islamicData.takaful.coverage
                        : conventionalData.insurance.coverage
                    )}{" "}
                    Coverage
                  </p>
                  <p className="text-white/40 text-sm">
                    {formatRM(
                      isIslamic
                        ? islamicData.takaful.contribution
                        : conventionalData.insurance.premium
                    )}
                    /month
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white/40 text-xs">Next payment</p>
                <p className="text-white/70 text-sm">
                  {isIslamic
                    ? islamicData.takaful.nextPayment
                    : conventionalData.insurance.nextPayment}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
