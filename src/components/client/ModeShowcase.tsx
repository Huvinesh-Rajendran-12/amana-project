"use client";

import { useState } from "react";
import {
  Check,
  Moon,
  Percent,
  TrendingUp,
  Shield,
  Calculator,
  Building2,
  Heart,
  BarChart3,
  Wallet,
} from "lucide-react";

const conventionalFeatures = [
  {
    icon: TrendingUp,
    title: "Competitive Interest Rates",
    description:
      "Earn up to 5.2% p.a. on fixed deposits with flexible tenure options.",
  },
  {
    icon: BarChart3,
    title: "Unit Trusts & Mutual Funds",
    description:
      "Access to ASB, ASNB, and a wide range of professionally managed funds.",
  },
  {
    icon: Shield,
    title: "Comprehensive Insurance",
    description:
      "Life, medical, and motor insurance from top Malaysian providers.",
  },
  {
    icon: Wallet,
    title: "Credit & Personal Loans",
    description:
      "Competitive loan rates with quick approval and minimal documentation.",
  },
];

const islamicFeatures = [
  {
    icon: Building2,
    title: "Tabung Haji Integration",
    description:
      "Direct savings for Hajj with hibah returns up to 4.1%. Track your waiting list.",
  },
  {
    icon: Calculator,
    title: "Automated Zakat",
    description:
      "AI calculates your Zakat obligation. Pay directly to PPZ, MAIWP, or state centers.",
  },
  {
    icon: Shield,
    title: "Takaful Protection",
    description:
      "Family and health Takaful plans that are 100% Shariah-compliant.",
  },
  {
    icon: Heart,
    title: "Sadaqah & Waqf",
    description:
      "Easy contributions to verified Islamic charities and waqf institutions.",
  },
];

export default function ModeShowcase() {
  const [activeTab, setActiveTab] = useState<"conventional" | "islamic">(
    "conventional"
  );

  const features =
    activeTab === "conventional" ? conventionalFeatures : islamicFeatures;

  return (
    <div>
      {/* Tab Buttons */}
      <div className="flex justify-center mb-12">
        <div className="inline-flex bg-cream/5 rounded-full p-1 border border-cream/10">
          <button
            onClick={() => setActiveTab("conventional")}
            className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
              activeTab === "conventional"
                ? "bg-violet-500 text-white shadow-lg shadow-violet-500/25"
                : "text-cream/60 hover:text-cream"
            }`}
          >
            <Percent className="w-4 h-4" />
            Conventional Banking
          </button>
          <button
            onClick={() => setActiveTab("islamic")}
            className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
              activeTab === "islamic"
                ? "bg-sentience-gold text-black shadow-lg shadow-sentience-gold/25"
                : "text-cream/60 hover:text-cream"
            }`}
          >
            <Moon className="w-4 h-4" />
            Islamic Finance
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Left - Features */}
        <div className="space-y-4">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={`p-6 rounded-2xl border transition-all duration-500 ${
                activeTab === "conventional"
                  ? "bg-violet-500/5 border-violet-500/20 hover:border-violet-500/40"
                  : "bg-sentience-gold/5 border-sentience-gold/20 hover:border-sentience-gold/40"
              }`}
              style={{
                animationDelay: `${index * 100}ms`,
                opacity: 1,
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                    activeTab === "conventional"
                      ? "bg-violet-500/10"
                      : "bg-sentience-gold/10"
                  }`}
                >
                  <feature.icon
                    className={`w-5 h-5 ${
                      activeTab === "conventional"
                        ? "text-violet-400"
                        : "text-sentience-gold"
                    }`}
                  />
                </div>
                <div>
                  <h4 className="font-medium text-cream mb-1">
                    {feature.title}
                  </h4>
                  <p className="text-sm text-cream/50">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right - Visual Card */}
        <div className="relative">
          <div
            className={`absolute inset-0 blur-3xl rounded-full transition-colors duration-500 ${
              activeTab === "conventional"
                ? "bg-violet-500/20"
                : "bg-sentience-gold/20"
            }`}
          />
          <div
            className={`relative p-8 rounded-2xl border transition-all duration-500 ${
              activeTab === "conventional"
                ? "bg-linear-to-br from-violet-950/50 to-black border-violet-500/20"
                : "bg-linear-to-br from-sentience-gold/10 to-black border-sentience-gold/20"
            }`}
          >
            {/* Card Header */}
            <div className="flex items-center gap-3 mb-8">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-500 ${
                  activeTab === "conventional"
                    ? "bg-violet-500/10"
                    : "bg-sentience-gold/10"
                }`}
              >
                {activeTab === "conventional" ? (
                  <Percent className="w-6 h-6 text-violet-400" />
                ) : (
                  <Moon className="w-6 h-6 text-sentience-gold" />
                )}
              </div>
              <div>
                <h3
                  className={`text-xl font-medium transition-colors duration-500 ${
                    activeTab === "conventional"
                      ? "text-violet-400"
                      : "text-sentience-gold"
                  }`}
                >
                  {activeTab === "conventional" ? "LUMINA CORE" : "LUMINA NUR"}
                </h3>
                <p className="text-xs text-cream/40">
                  {activeTab === "conventional"
                    ? "Conventional Banking Experience"
                    : "Shariah-Compliant Experience"}
                </p>
              </div>
            </div>

            {/* Mock Stats */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-cream/50">
                    {activeTab === "conventional"
                      ? "Savings Account"
                      : "Wadiah Savings"}
                  </span>
                  <span className="text-xs text-cream/30">
                    {activeTab === "conventional"
                      ? "Interest Rate"
                      : "Hibah Rate"}
                  </span>
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-light text-cream font-mono">
                    RM 45,847.32
                  </span>
                  <span
                    className={`text-lg font-mono ${
                      activeTab === "conventional"
                        ? "text-violet-400"
                        : "text-sentience-gold"
                    }`}
                  >
                    {activeTab === "conventional" ? "3.85% p.a." : "3.2% hibah"}
                  </span>
                </div>
              </div>

              <div className="h-px bg-cream/10" />

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-cream/5">
                  <p className="text-xs text-cream/40 mb-1">
                    {activeTab === "conventional"
                      ? "Fixed Deposit"
                      : "Investment Account-i"}
                  </p>
                  <p className="text-lg font-mono text-cream">RM 50,000</p>
                  <p
                    className={`text-xs mt-1 ${
                      activeTab === "conventional"
                        ? "text-violet-400"
                        : "text-sentience-gold"
                    }`}
                  >
                    {activeTab === "conventional"
                      ? "+RM 1,750 interest"
                      : "+RM 2,100 profit"}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-cream/5">
                  <p className="text-xs text-cream/40 mb-1">
                    {activeTab === "conventional" ? "Insurance" : "Takaful"}
                  </p>
                  <p className="text-lg font-mono text-cream">RM 500K</p>
                  <p
                    className={`text-xs mt-1 ${
                      activeTab === "conventional"
                        ? "text-violet-400"
                        : "text-sentience-gold"
                    }`}
                  >
                    Coverage Active ✓
                  </p>
                </div>
              </div>

              {activeTab === "islamic" && (
                <div className="p-4 rounded-xl bg-sentience-gold/5 border border-sentience-gold/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Check className="w-4 h-4 text-sentience-gold" />
                    <span className="text-sm text-sentience-gold">
                      100% Shariah Compliant
                    </span>
                  </div>
                  <p className="text-xs text-cream/40">
                    All products verified by JAKIM & Securities Commission
                    Shariah Advisory
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Message */}
      <div className="text-center mt-12">
        <p className="text-cream/40 text-sm">
          {activeTab === "conventional"
            ? "Perfect for those who prefer traditional banking with competitive returns."
            : "Designed for Muslims who want their finances aligned with Islamic principles."}
        </p>
        <p className="text-cream/60 text-sm mt-2">
          <span className="text-cream">Switch anytime</span> — your
          account, your choice.
        </p>
      </div>
    </div>
  );
}
