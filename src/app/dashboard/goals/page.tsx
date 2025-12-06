"use client";

import { useState, useEffect } from "react";
import DashboardHeader from "@/components/client/DashboardHeader";
import { useFinanceMode } from "@/context/FinanceModeContext";
import {
  Plus,
  TrendingUp,
  Calendar,
  CheckCircle,
  Clock,
  Sparkles,
  Home,
  Car,
  GraduationCap,
  Plane,
  BadgeAlert,
  LucideIcon,
} from "lucide-react";

// Malaysian Ringgit formatter
const formatRM = (amount: number) =>
  `RM ${amount.toLocaleString("en-MY", { minimumFractionDigits: 0 })}`;

interface Goal {
  id: number;
  name: string;
  target: number;
  current: number;
  deadline: string;
  icon: LucideIcon;
  color: string;
  status: "on_track" | "behind" | "completed";
}

const goals: Goal[] = [
  {
    id: 1,
    name: "Emergency Fund",
    target: 30000,
    current: 22500,
    deadline: "Dec 2025",
    icon: BadgeAlert,
    color: "#f43f5e",
    status: "on_track",
  },
  {
    id: 2,
    name: "New Car",
    target: 100000,
    current: 35000,
    deadline: "Jun 2026",
    icon: Car,
    color: "#06b6d4",
    status: "on_track",
  },
  {
    id: 3,
    name: "House Down Payment",
    target: 80000,
    current: 24000,
    deadline: "Dec 2027",
    icon: Home,
    color: "#10b981",
    status: "behind",
  },
  {
    id: 4,
    name: "Education Fund",
    target: 150000,
    current: 45000,
    deadline: "Sep 2035",
    icon: GraduationCap,
    color: "#f59e0b",
    status: "on_track",
  },
  {
    id: 5,
    name: "Vacation",
    target: 15000,
    current: 15000,
    deadline: "Completed",
    icon: Plane,
    color: "#22c55e",
    status: "completed",
  },
];

const suggestions = [
  "Increase your house down payment savings by RM500/month to reach your goal faster.",
  "Your emergency fund is almost complete. Consider high-yield savings for the final push.",
  "Based on your income pattern, automating contributions can boost your savings rate.",
];

export default function GoalsPage() {
  const { mode } = useFinanceMode();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isIslamic = mounted ? mode === "islamic" : false;
  const totalSaved = goals.reduce((acc, g) => acc + g.current, 0);
  const totalTarget = goals.reduce((acc, g) => acc + g.target, 0);
  const activeGoals = goals.filter((g) => g.status !== "completed").length;

  const accentColor = isIslamic ? "text-sentience-gold" : "text-violet-400";

  return (
    <div className="text-white">
      <DashboardHeader
        title="Goals"
        subtitle="Track your savings goals and milestones"
      />

      <div className="p-6 lg:p-8 space-y-6">
        {/* Header Actions */}
        <div className="flex justify-end">
          <button
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm transition-colors ${isIslamic ? "bg-sentience-gold/10 border-sentience-gold/20 text-sentience-gold hover:bg-sentience-gold/15" : "bg-violet-500/10 border-violet-500/20 text-violet-400 hover:bg-violet-500/15"}`}
          >
            <Plus className="w-4 h-4" />
            New Goal
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 bg-white/2 border border-white/5 rounded-xl">
            <p className="text-xs text-white/40 mb-2">Active Goals</p>
            <p className="text-2xl font-light font-mono text-white">
              {activeGoals}
            </p>
          </div>
          <div className="p-5 bg-white/2 border border-white/5 rounded-xl">
            <p className="text-xs text-white/40 mb-2">Total Saved</p>
            <p className="text-2xl font-light font-mono text-white">
              {formatRM(totalSaved)}
            </p>
          </div>
          <div className="p-5 bg-white/2 border border-white/5 rounded-xl">
            <p className="text-xs text-white/40 mb-2">Total Target</p>
            <p className="text-2xl font-light font-mono text-white">
              {formatRM(totalTarget)}
            </p>
          </div>
          <div
            className={`p-5 border rounded-xl ${isIslamic ? "bg-sentience-gold/5 border-sentience-gold/10" : "bg-violet-500/5 border-violet-500/10"}`}
          >
            <p
              className={`text-xs mb-2 ${isIslamic ? "text-sentience-gold/70" : "text-violet-400/70"}`}
            >
              Overall Progress
            </p>
            <p className={`text-2xl font-light font-mono ${accentColor}`}>
              {Math.round((totalSaved / totalTarget) * 100)}%
            </p>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="bg-white/2 border border-white/5 rounded-xl p-6">
          <h3 className="text-sm font-light text-white/40 uppercase tracking-wider mb-6 flex items-center gap-2">
            <TrendingUp className={`w-4 h-4 ${accentColor}`} />
            Progress Overview
          </h3>

          <div className="space-y-5">
            {goals
              .filter((g) => g.status !== "completed")
              .map((goal) => {
                const progress = Math.round((goal.current / goal.target) * 100);
                const IconComponent = goal.icon;

                return (
                  <div key={goal.id} className="flex items-center gap-4">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${goal.color}15` }}
                    >
                      <IconComponent
                        className="w-4 h-4"
                        style={{ color: goal.color }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm text-white truncate">
                          {goal.name}
                        </span>
                        <span className="text-xs text-white/40 ml-2">
                          {progress}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${progress}%`,
                            backgroundColor: goal.color,
                          }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-mono text-white/50 w-24 text-right shrink-0">
                      {formatRM(goal.current)}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Goals List */}
        <div className="space-y-3">
          <h3 className="text-sm font-light text-white/40 uppercase tracking-wider">
            All Goals
          </h3>

          {goals.map((goal) => {
            const progress = (goal.current / goal.target) * 100;
            const IconComponent = goal.icon;

            return (
              <div
                key={goal.id}
                className="p-5 bg-white/2 border border-white/5 hover:border-white/10 rounded-xl transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-5">
                  {/* Icon & Name */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${goal.color}15` }}
                    >
                      <IconComponent
                        className="w-5 h-5"
                        style={{ color: goal.color }}
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-light text-white truncate">
                        {goal.name}
                      </h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-white/40 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {goal.deadline}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-mono text-white">
                        {formatRM(goal.current)}
                      </span>
                      <span className="text-sm font-mono text-white/40">
                        {formatRM(goal.target)}
                      </span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(progress, 100)}%`,
                          backgroundColor: goal.color,
                        }}
                      />
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center">
                    {goal.status === "completed" ? (
                      <span className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-full text-xs">
                        <CheckCircle className="w-3 h-3" />
                        Completed
                      </span>
                    ) : goal.status === "on_track" ? (
                      <span
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs ${isIslamic ? "bg-sentience-gold/10 text-sentience-gold" : "bg-violet-500/10 text-violet-400"}`}
                      >
                        <TrendingUp className="w-3 h-3" />
                        On Track
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-3 py-1.5 bg-amber-500/10 text-amber-400 rounded-full text-xs">
                        <Clock className="w-3 h-3" />
                        Behind
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* AI Suggestions */}
        <div
          className={`border rounded-xl p-6 ${isIslamic ? "bg-sentience-gold/5 border-sentience-gold/10" : "bg-violet-500/5 border-violet-500/10"}`}
        >
          <h3 className="text-sm font-light text-white/40 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Sparkles className={`w-4 h-4 ${accentColor}`} />
            {isIslamic ? "Barakah Suggestions" : "AI Suggestions"}
          </h3>
          <div className="space-y-3">
            {suggestions.map((suggestion, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-4 bg-white/2 rounded-lg"
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${isIslamic ? "bg-sentience-gold/10" : "bg-violet-500/10"}`}
                >
                  <span className={`text-xs ${accentColor}`}>{i + 1}</span>
                </div>
                <p className="text-sm text-white/60">{suggestion}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
