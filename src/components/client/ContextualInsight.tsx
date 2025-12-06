"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Sparkles, ChevronRight, ThumbsUp, ThumbsDown } from "lucide-react";

interface ContextualInsightProps {
  title: string;
  message: string;
  type?: "info" | "success" | "warning" | "tip";
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  onDismiss?: () => void;
  dismissible?: boolean;
  isIslamic?: boolean;
  compact?: boolean;
}

export default function ContextualInsight({
  title,
  message,
  type = "info",
  actionLabel,
  actionHref,
  onAction,
  onDismiss,
  dismissible = true,
  isIslamic = false,
  compact = false,
}: ContextualInsightProps) {
  const [dismissed, setDismissed] = useState(false);
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);
  const router = useRouter();

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  const handleAction = () => {
    if (onAction) {
      onAction();
    } else if (actionHref) {
      router.push(actionHref);
    }
  };

  const hasAction = actionLabel && (onAction || actionHref);

  const typeStyles = {
    info: {
      bg: isIslamic ? "bg-sentience-gold/5" : "bg-violet-500/5",
      border: isIslamic ? "border-sentience-gold/10" : "border-violet-500/10",
      icon: isIslamic ? "text-sentience-gold" : "text-violet-400",
      dot: isIslamic ? "bg-sentience-gold" : "bg-violet-500",
    },
    success: {
      bg: "bg-emerald-500/5",
      border: "border-emerald-500/10",
      icon: "text-emerald-400",
      dot: "bg-emerald-500",
    },
    warning: {
      bg: "bg-amber-500/5",
      border: "border-amber-500/10",
      icon: "text-amber-400",
      dot: "bg-amber-500",
    },
    tip: {
      bg: "bg-cyan-500/5",
      border: "border-cyan-500/10",
      icon: "text-cyan-400",
      dot: "bg-cyan-500",
    },
  };

  const styles = typeStyles[type];

  if (compact) {
    return (
      <div
        className={`flex items-center gap-3 px-3 py-2 rounded-lg border ${styles.bg} ${styles.border} group transition-all duration-200 hover:border-white/10`}
      >
        <div className={`w-1.5 h-1.5 rounded-full ${styles.dot} shrink-0`} />
        <p className="text-xs text-white/70 flex-1">{message}</p>
        {hasAction && (
          <button
            onClick={handleAction}
            className={`text-xs ${styles.icon} opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1`}
          >
            {actionLabel}
            <ChevronRight className="w-3 h-3" />
          </button>
        )}
        {dismissible && (
          <button
            onClick={handleDismiss}
            className="text-white/20 hover:text-white/40 transition-colors opacity-0 group-hover:opacity-100"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={`relative rounded-xl border ${styles.bg} ${styles.border} overflow-hidden transition-all duration-300 hover:border-white/10`}
    >
      {/* Subtle glow effect */}
      <div
        className={`absolute inset-0 opacity-30 pointer-events-none`}
        style={{
          background: `radial-gradient(ellipse at top left, ${
            isIslamic ? "rgba(191, 149, 63, 0.1)" : "rgba(139, 92, 246, 0.1)"
          }, transparent 50%)`,
        }}
      />

      <div className="relative p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              isIslamic ? "bg-sentience-gold/10" : "bg-violet-500/10"
            }`}
          >
            <Sparkles className={`w-4 h-4 ${styles.icon}`} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h4 className="text-sm font-medium text-white">{title}</h4>
              {dismissible && (
                <button
                  onClick={handleDismiss}
                  className="text-white/20 hover:text-white/40 transition-colors p-1 -m-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <p className="text-sm text-white/50 mt-1 leading-relaxed">{message}</p>

            {/* Actions */}
            <div className="flex items-center gap-3 mt-3">
              {hasAction && (
                <button
                  onClick={handleAction}
                  className={`text-xs font-medium ${styles.icon} hover:underline flex items-center gap-1 transition-colors`}
                >
                  {actionLabel}
                  <ChevronRight className="w-3 h-3" />
                </button>
              )}

              {/* Feedback buttons */}
              <div className="flex items-center gap-1 ml-auto">
                <button
                  onClick={() => setFeedback("up")}
                  className={`p-1.5 rounded-md transition-colors ${
                    feedback === "up"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "text-white/20 hover:text-white/40 hover:bg-white/5"
                  }`}
                >
                  <ThumbsUp className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setFeedback("down")}
                  className={`p-1.5 rounded-md transition-colors ${
                    feedback === "down"
                      ? "bg-red-500/20 text-red-400"
                      : "text-white/20 hover:text-white/40 hover:bg-white/5"
                  }`}
                >
                  <ThumbsDown className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

