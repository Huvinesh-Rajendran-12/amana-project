"use client";

import { useState, useEffect, useMemo } from "react";
import DashboardHeader from "@/components/client/DashboardHeader";
import ContextualInsight from "@/components/client/ContextualInsight";
import { useFinanceMode } from "@/context/FinanceModeContext";
import { useUser } from "@/context/UserContext";
import { useGoalsSummary } from "@/hooks/useGoals";
import { useInsightsList } from "@/hooks/useInsights";
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
  Loader2,
  AlertCircle,
  Landmark,
  Heart,
} from "lucide-react";

// Malaysian Ringgit formatter
const formatRM = (amount: number) =>
  `RM ${amount.toLocaleString("en-MY", { minimumFractionDigits: 0 })}`;

// USD formatter
const formatUSD = (amount: number) =>
  `$${amount.toLocaleString("en-US", { minimumFractionDigits: 0 })}`;

interface Goal {
  id: string;
  name: string;
  target: number;
  current: number;
  deadline: string;
  icon: LucideIcon;
  color: string;
  status: "on_track" | "behind" | "completed";
}

// Default goals for demo
const defaultGoals: Goal[] = [
  {
    id: "1",
    name: "Emergency Fund",
    target: 30000,
    current: 22500,
    deadline: "Dec 2025",
    icon: BadgeAlert,
    color: "#f43f5e",
    status: "on_track",
  },
  {
    id: "2",
    name: "New Car",
    target: 100000,
    current: 35000,
    deadline: "Jun 2026",
    icon: Car,
    color: "#06b6d4",
    status: "on_track",
  },
  {
    id: "3",
    name: "House Down Payment",
    target: 80000,
    current: 24000,
    deadline: "Dec 2027",
    icon: Home,
    color: "#10b981",
    status: "behind",
  },
  {
    id: "4",
    name: "Education Fund",
    target: 150000,
    current: 45000,
    deadline: "Sep 2035",
    icon: GraduationCap,
    color: "#f59e0b",
    status: "on_track",
  },
  {
    id: "5",
    name: "Vacation",
    target: 15000,
    current: 15000,
    deadline: "Completed",
    icon: Plane,
    color: "#22c55e",
    status: "completed",
  },
];

// Islamic mode goals
const islamicGoals: Goal[] = [
  {
    id: "hajj",
    name: "Hajj Savings",
    target: 45000,
    current: 28500,
    deadline: "2027",
    icon: Landmark,
    color: "#d4a853",
    status: "on_track",
  },
  {
    id: "emergency",
    name: "Emergency Fund",
    target: 30000,
    current: 22500,
    deadline: "Dec 2025",
    icon: BadgeAlert,
    color: "#f43f5e",
    status: "on_track",
  },
  {
    id: "sadaqah",
    name: "Sadaqah Fund",
    target: 12000,
    current: 8400,
    deadline: "Dec 2025",
    icon: Heart,
    color: "#10b981",
    status: "on_track",
  },
  {
    id: "house",
    name: "House (Halal Mortgage)",
    target: 80000,
    current: 24000,
    deadline: "Dec 2027",
    icon: Home,
    color: "#06b6d4",
    status: "behind",
  },
  {
    id: "education",
    name: "Children's Education",
    target: 150000,
    current: 45000,
    deadline: "Sep 2035",
    icon: GraduationCap,
    color: "#f59e0b",
    status: "on_track",
  },
];

export default function GoalsPage() {
  const { mode } = useFinanceMode();
  const { user, userId, isLoading: userLoading } = useUser();
  const [mounted, setMounted] = useState(false);

  // Fetch data
  const goalsSummary = useGoalsSummary();
  const insights = useInsightsList({ type: "goal_progress", limit: 3 });

  useEffect(() => {
    setMounted(true);
  }, []);

  const isIslamic = mounted ? mode === "islamic" : false;
  const formatCurrency = isIslamic || user?.currency === "MYR" ? formatRM : formatUSD;
  const accentColor = isIslamic ? "text-sentience-gold" : "text-violet-400";

  // Use appropriate goals based on mode
  const goals = useMemo(() => {
    // In a real app, these would come from the database
    // For now, we use the mock goals adjusted by actual savings rate
    const baseGoals = isIslamic ? islamicGoals : defaultGoals;
    const savingsMultiplier = goalsSummary.savingsRate > 0 ? goalsSummary.savingsRate / 25 : 1;

    return baseGoals.map((goal) => ({
      ...goal,
      // Adjust current amount based on actual savings behavior
      current: Math.min(
        goal.target,
        Math.round(goal.current * Math.max(0.5, Math.min(1.5, savingsMultiplier)))
      ),
    }));
  }, [isIslamic, goalsSummary.savingsRate]);

  // Calculate totals
  const totalSaved = goals.reduce((acc, g) => acc + g.current, 0);
  const totalTarget = goals.reduce((acc, g) => acc + g.target, 0);
  const activeGoals = goals.filter((g) => g.status !== "completed").length;
  const overallProgress = Math.round((totalSaved / totalTarget) * 100);

  // Generate suggestions based on real data
  const suggestions = useMemo(() => {
    const baseSuggestions: Array<{
      title: string;
      message: string;
      type: "info" | "success" | "warning" | "tip";
      actionLabel?: string;
    }> = [];

    if (goalsSummary.savingsRate < 20) {
      baseSuggestions.push({
        title: "Low savings rate detected",
        message: "Your savings rate is below 20%. Consider reducing discretionary spending to reach your goals faster.",
        type: "warning",
        actionLabel: "View spending",
      });
    } else if (goalsSummary.savingsRate >= 30) {
      baseSuggestions.push({
        title: "Excellent savings discipline",
        message: `Savings rate of ${goalsSummary.savingsRate.toFixed(0)}%! You're on track to exceed your goals.`,
        type: "success",
      });
    }

    const behindGoals = goals.filter((g) => g.status === "behind");
    if (behindGoals.length > 0) {
      baseSuggestions.push({
        title: `${behindGoals.length} goal${behindGoals.length > 1 ? "s" : ""} need${behindGoals.length === 1 ? "s" : ""} attention`,
        message: `You're behind on ${behindGoals.map(g => g.name).join(", ")}. Consider adjusting your monthly contributions.`,
        type: "warning",
        actionLabel: "Adjust contributions",
      });
    }

    if (isIslamic) {
      const hajjGoal = goals.find((g) => g.id === "hajj");
      if (hajjGoal) {
        const hajjProgress = (hajjGoal.current / hajjGoal.target) * 100;
        baseSuggestions.push({
          title: "Hajj savings progress",
          message: `MasyaAllah! Your Hajj savings are at ${hajjProgress.toFixed(0)}%. May Allah make your journey easy, insyaAllah.`,
          type: hajjProgress >= 50 ? "success" : "info",
        });
      }
      
      // Zakat reminder
      baseSuggestions.push({
        title: "Zakat obligation reminder",
        message: "Remember to calculate Zakat on your savings when they exceed nisab for one lunar year.",
        type: "tip",
        actionLabel: "Calculate Zakat",
      });
    } else {
      baseSuggestions.push({
        title: "Automate your savings",
        message: "Based on your income pattern, automating contributions can boost your savings rate by up to 30%.",
        type: "tip",
        actionLabel: "Set up automation",
      });
    }

    return baseSuggestions.slice(0, 3);
  }, [goals, goalsSummary.savingsRate, isIslamic]);

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
        title="Goals"
        subtitle={
          isIslamic
            ? "Track your savings goals and Islamic milestones"
            : "Track your savings goals and milestones"
        }
      />

      <div className="p-6 lg:p-8 space-y-6">
        {/* Header Actions */}
        <div className="flex justify-end">
          <button
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm transition-colors ${
              isIslamic
                ? "bg-sentience-gold/10 border-sentience-gold/20 text-sentience-gold hover:bg-sentience-gold/15"
                : "bg-violet-500/10 border-violet-500/20 text-violet-400 hover:bg-violet-500/15"
            }`}
          >
            <Plus className="w-4 h-4" />
            New Goal
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 bg-white/2 border border-white/5 rounded-xl">
            <p className="text-xs text-white/40 mb-2">Active Goals</p>
            <p className="text-2xl font-light font-mono text-white">{activeGoals}</p>
          </div>
          <div className="p-5 bg-white/2 border border-white/5 rounded-xl">
            <p className="text-xs text-white/40 mb-2">Total Saved</p>
            <p className="text-2xl font-light font-mono text-white">
              {formatCurrency(totalSaved)}
            </p>
          </div>
          <div className="p-5 bg-white/2 border border-white/5 rounded-xl">
            <p className="text-xs text-white/40 mb-2">Total Target</p>
            <p className="text-2xl font-light font-mono text-white">
              {formatCurrency(totalTarget)}
            </p>
          </div>
          <div
            className={`p-5 border rounded-xl ${
              isIslamic
                ? "bg-sentience-gold/5 border-sentience-gold/10"
                : "bg-violet-500/5 border-violet-500/10"
            }`}
          >
            <p
              className={`text-xs mb-2 ${
                isIslamic ? "text-sentience-gold/70" : "text-violet-400/70"
              }`}
            >
              Overall Progress
            </p>
            <p className={`text-2xl font-light font-mono ${accentColor}`}>
              {overallProgress}%
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
                      <IconComponent className="w-4 h-4" style={{ color: goal.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm text-white truncate">{goal.name}</span>
                        <span className="text-xs text-white/40 ml-2">{progress}%</span>
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
                      {formatCurrency(goal.current)}
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
                      <IconComponent className="w-5 h-5" style={{ color: goal.color }} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-light text-white truncate">{goal.name}</h4>
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
                        {formatCurrency(goal.current)}
                      </span>
                      <span className="text-sm font-mono text-white/40">
                        {formatCurrency(goal.target)}
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
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs ${
                          isIslamic
                            ? "bg-sentience-gold/10 text-sentience-gold"
                            : "bg-violet-500/10 text-violet-400"
                        }`}
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
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className={`w-4 h-4 ${accentColor}`} />
            <h3 className="text-sm font-light text-white/60">
              {isIslamic ? "Barakah Coaching" : "AI Coaching"}
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {suggestions.map((suggestion, i) => (
              <ContextualInsight
                key={i}
                title={suggestion.title}
                message={suggestion.message}
                type={suggestion.type}
                actionLabel={suggestion.actionLabel}
                isIslamic={isIslamic}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
