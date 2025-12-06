"use client";

import { useState } from "react";
import { X, Sparkles, Copy, Check, ChevronDown, ChevronUp } from "lucide-react";

interface AIResponseCardProps {
  question?: string;
  response: string;
  timestamp?: Date;
  isIslamic?: boolean;
  onDismiss?: () => void;
  expandable?: boolean;
  actions?: Array<{
    label: string;
    onClick: () => void;
  }>;
}

export default function AIResponseCard({
  question,
  response,
  timestamp,
  isIslamic = false,
  onDismiss,
  expandable = false,
  actions,
}: AIResponseCardProps) {
  const [expanded, setExpanded] = useState(!expandable);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const accentColor = isIslamic ? "text-sentience-gold" : "text-violet-400";
  const accentBg = isIslamic ? "bg-sentience-gold" : "bg-violet-500";
  const accentBgLight = isIslamic ? "bg-sentience-gold/10" : "bg-violet-500/10";

  // Truncate response for collapsed state
  const displayResponse = expandable && !expanded 
    ? response.slice(0, 150) + (response.length > 150 ? "..." : "")
    : response;

  return (
    <div
      className={`relative rounded-xl border overflow-hidden transition-all duration-300 ${
        isIslamic
          ? "bg-sentience-gold/5 border-sentience-gold/10 hover:border-sentience-gold/20"
          : "bg-violet-500/5 border-violet-500/10 hover:border-violet-500/20"
      }`}
    >
      {/* Gradient accent line */}
      <div
        className={`absolute top-0 left-0 right-0 h-0.5 ${accentBg} opacity-50`}
      />

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${accentBgLight}`}
          >
            <Sparkles className={`w-4 h-4 ${accentColor}`} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className={`text-xs font-medium ${accentColor}`}>
                {isIslamic ? "Amana Nur" : "Amana AI"}
              </span>
              <div className="flex items-center gap-1">
                {timestamp && (
                  <span className="text-xs text-white/30">
                    {timestamp.toLocaleTimeString([], {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                )}
                {onDismiss && (
                  <button
                    onClick={onDismiss}
                    className="p-1 text-white/20 hover:text-white/40 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Question if provided */}
            {question && (
              <div className="mt-2 mb-3 px-3 py-2 bg-white/5 rounded-lg border border-white/5">
                <p className="text-xs text-white/40">You asked:</p>
                <p className="text-sm text-white/70 mt-0.5">{question}</p>
              </div>
            )}

            {/* Response */}
            <p className="text-sm text-white/80 leading-relaxed mt-2">
              {displayResponse}
            </p>

            {/* Expand/Collapse button */}
            {expandable && response.length > 150 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className={`flex items-center gap-1 mt-2 text-xs ${accentColor} hover:underline transition-colors`}
              >
                {expanded ? (
                  <>
                    Show less <ChevronUp className="w-3 h-3" />
                  </>
                ) : (
                  <>
                    Show more <ChevronDown className="w-3 h-3" />
                  </>
                )}
              </button>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-white/40 hover:text-white/60 hover:bg-white/5 rounded-md transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    Copy
                  </>
                )}
              </button>

              {actions?.map((action, i) => (
                <button
                  key={i}
                  onClick={action.onClick}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-md transition-colors ${accentBgLight} ${accentColor} hover:opacity-80`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

