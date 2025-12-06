"use client";

import { useState, useRef, useEffect } from "react";
import { useCurrentMode, useModeMutations, useBrokeModeStatus, useVacationProgress } from "@/hooks/useSpendingModes";
import { useFinanceMode } from "@/context/FinanceModeContext";
import {
  Crown,
  Lock,
  Palmtree,
  Scale,
  ChevronDown,
  Check,
  Loader2,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

interface ModeOption {
  id: "normal" | "yolo" | "broke" | "vacation";
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
}

const MODES: ModeOption[] = [
  {
    id: "normal",
    name: "Normal",
    description: "Balanced coaching with helpful insights",
    icon: Scale,
    color: "#4ECDC4",
  },
  {
    id: "yolo",
    name: "YOLO Mode",
    description: "No judgment, just vibes. Celebrate your purchases!",
    icon: Crown,
    color: "#FFD700",
  },
  {
    id: "broke",
    name: "Broke Mode",
    description: "Aggressive limits and alerts. Serious savings.",
    icon: Lock,
    color: "#FF6B6B",
  },
  {
    id: "vacation",
    name: "Vacation Mode",
    description: "Relaxed tracking with trip-specific budget.",
    icon: Palmtree,
    color: "#45B7D1",
  },
];

export default function SpendingModeSelector() {
  const { mode: financeMode } = useFinanceMode();
  const currentMode = useCurrentMode();
  const brokeModeStatus = useBrokeModeStatus();
  const vacationProgress = useVacationProgress();
  const { setMode, toggleYoloMode, activateBrokeMode, startVacationMode } = useModeMutations();

  const [isOpen, setIsOpen] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const [showBrokeSettings, setShowBrokeSettings] = useState(false);
  const [showVacationSettings, setShowVacationSettings] = useState(false);
  const [dailyLimit, setDailyLimit] = useState(50);
  const [tripName, setTripName] = useState("");
  const [tripBudget, setTripBudget] = useState(5000);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const isIslamic = financeMode === "islamic";
  const accentColor = isIslamic ? "text-sentience-gold" : "text-violet-400";
  const activeModeId = currentMode?.mode ?? "normal";
  const activeMode = MODES.find((m) => m.id === activeModeId) ?? MODES[0];

  const handleModeChange = async (modeId: "normal" | "yolo" | "broke" | "vacation") => {
    // Close dropdown immediately for better UX
    setIsOpen(false);
    
    if (modeId === activeModeId) {
      return;
    }

    // Handle special mode settings
    if (modeId === "broke") {
      setShowBrokeSettings(true);
      return;
    }

    if (modeId === "vacation") {
      setShowVacationSettings(true);
      return;
    }

    setIsChanging(true);
    try {
      if (modeId === "yolo") {
        await toggleYoloMode(true, 1); // 1 day default
      } else {
        await setMode(modeId);
      }
    } catch (error) {
      console.error("Failed to change mode:", error);
    } finally {
      setIsChanging(false);
    }
  };

  const handleActivateBrokeMode = async () => {
    setIsChanging(true);
    try {
      await activateBrokeMode(dailyLimit, undefined, 30);
      setShowBrokeSettings(false);
    } catch (error) {
      console.error("Failed to activate broke mode:", error);
    } finally {
      setIsChanging(false);
    }
  };

  const handleStartVacation = async () => {
    if (!tripName.trim()) return;

    setIsChanging(true);
    try {
      const endDate = Date.now() + 14 * 24 * 60 * 60 * 1000; // 14 days default
      await startVacationMode(tripName, tripBudget, endDate);
      setShowVacationSettings(false);
      setTripName("");
    } catch (error) {
      console.error("Failed to start vacation mode:", error);
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <>
      {/* Mode Selector Button */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={isChanging}
          className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
        >
          {(() => {
            const IconComponent = activeMode.icon;
            return <IconComponent className="w-4 h-4" style={{ color: activeMode.color }} />;
          })()}
          <span className="text-sm text-white/70">{activeMode.name}</span>
          {isChanging ? (
            <Loader2 className="w-3 h-3 animate-spin text-white/50" />
          ) : (
            <ChevronDown className="w-3 h-3 text-white/40" />
          )}
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute top-full mt-2 right-0 w-64 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
            <div className="p-2">
              {MODES.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => handleModeChange(mode.id)}
                  className={`w-full flex items-start gap-3 p-3 rounded-lg transition-colors ${
                    mode.id === activeModeId
                      ? "bg-white/10"
                      : "hover:bg-white/5"
                  }`}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${mode.color}20` }}
                  >
                    {(() => {
                      const IconComponent = mode.icon;
                      return <IconComponent className="w-4 h-4" style={{ color: mode.color }} />;
                    })()}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">{mode.name}</span>
                      {mode.id === activeModeId && (
                        <Check className="w-3 h-3 text-emerald-400" />
                      )}
                    </div>
                    <p className="text-xs text-white/40 mt-0.5">{mode.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Broke Mode Settings Modal */}
      {showBrokeSettings && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                <Lock className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-white">Broke Mode Settings</h3>
                <p className="text-sm text-white/40">Set your daily spending limit</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-2">Daily Limit (RM)</label>
                <input
                  type="number"
                  value={dailyLimit}
                  onChange={(e) => setDailyLimit(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500/50"
                  min={10}
                  max={500}
                />
              </div>

              <p className="text-xs text-white/40">
                You&apos;ll receive alerts when approaching your limit and blocked when exceeding it.
              </p>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowBrokeSettings(false)}
                  className="flex-1 px-4 py-3 bg-white/5 text-white/70 rounded-lg hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleActivateBrokeMode}
                  disabled={isChanging}
                  className="flex-1 px-4 py-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50"
                >
                  {isChanging ? (
                    <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                  ) : (
                    "Activate Broke Mode"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vacation Mode Settings Modal */}
      {showVacationSettings && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                <Palmtree className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-white">Vacation Mode</h3>
                <p className="text-sm text-white/40">Set your trip budget</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-2">Trip Name</label>
                <input
                  type="text"
                  value={tripName}
                  onChange={(e) => setTripName(e.target.value)}
                  placeholder="e.g., Bali Adventure"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-2">Trip Budget (RM)</label>
                <input
                  type="number"
                  value={tripBudget}
                  onChange={(e) => setTripBudget(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50"
                  min={500}
                  max={50000}
                />
              </div>

              <p className="text-xs text-white/40">
                Vacation mode provides relaxed tracking while keeping you within your trip budget.
              </p>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowVacationSettings(false)}
                  className="flex-1 px-4 py-3 bg-white/5 text-white/70 rounded-lg hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStartVacation}
                  disabled={isChanging || !tripName.trim()}
                  className="flex-1 px-4 py-3 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-lg hover:bg-cyan-500/20 transition-colors disabled:opacity-50"
                >
                  {isChanging ? (
                    <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                  ) : (
                    "Start Vacation"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mode Status Display */}
      {activeModeId === "broke" && brokeModeStatus && (
        <div className="mt-2 p-3 bg-red-500/5 border border-red-500/10 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs text-red-400/70">Daily Budget</span>
            <span className="text-xs text-white/50">
              Streak: {brokeModeStatus.streak} days
            </span>
          </div>
          <div className="mt-2">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-white/70">
                RM{brokeModeStatus.todaySpent.toFixed(2)} spent
              </span>
              <span className="text-white/50">
                RM{brokeModeStatus.dailyLimit} limit
              </span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  brokeModeStatus.isOverLimit ? "bg-red-500" : "bg-emerald-500"
                }`}
                style={{
                  width: `${Math.min(brokeModeStatus.percentUsed, 100)}%`,
                }}
              />
            </div>
          </div>
          {brokeModeStatus.isOverLimit && (
            <div className="mt-2 flex items-center gap-1 text-xs text-red-400">
              <AlertTriangle className="w-3 h-3" />
              Over daily limit!
            </div>
          )}
        </div>
      )}

      {activeModeId === "vacation" && vacationProgress && (
        <div className="mt-2 p-3 bg-cyan-500/5 border border-cyan-500/10 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs text-cyan-400/70">{vacationProgress.tripName}</span>
            <span className="text-xs text-white/50">
              {vacationProgress.daysRemaining} days left
            </span>
          </div>
          <div className="mt-2">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-white/70">
                RM{vacationProgress.spent.toFixed(2)} spent
              </span>
              <span className="text-white/50">
                RM{vacationProgress.tripBudget} budget
              </span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  vacationProgress.isOverBudget ? "bg-amber-500" : "bg-cyan-500"
                }`}
                style={{
                  width: `${Math.min(vacationProgress.percentUsed, 100)}%`,
                }}
              />
            </div>
          </div>
          <div className="mt-2 text-xs text-white/40">
            Daily budget: RM{vacationProgress.dailyBudget.toFixed(2)}
          </div>
        </div>
      )}

      {activeModeId === "yolo" && (
        <div className="mt-2 p-3 bg-amber-500/5 border border-amber-500/10 rounded-lg">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-amber-400">YOLO Mode Active</span>
          </div>
          <p className="text-xs text-white/40 mt-1">
            No judgment, just vibes. Enjoy your day!
          </p>
        </div>
      )}
    </>
  );
}

