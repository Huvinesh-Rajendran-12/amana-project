"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Sparkles, Send, X, Loader2, ChevronUp, ChevronDown } from "lucide-react";
import { useFinanceMode } from "@/context/FinanceModeContext";
import { useUser } from "@/context/UserContext";
import { useChat } from "@/hooks/useChat";
import AIResponseCard from "./AIResponseCard";

interface AIResponse {
  id: string;
  question: string;
  response: string;
  agent?: string;
  timestamp: Date;
}

export default function AIInputBar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState("");
  const [responses, setResponses] = useState<AIResponse[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const { mode } = useFinanceMode();
  const { userId } = useUser();
  const { sendMessage, isLoading } = useChat();

  const isIslamic = mode === "islamic";
  const accentColor = isIslamic ? "text-sentience-gold" : "text-violet-400";
  const accentBgLight = isIslamic ? "bg-sentience-gold/10" : "bg-violet-500/10";
  const accentBorder = isIslamic ? "border-sentience-gold/20" : "border-violet-500/20";

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to focus
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsExpanded(true);
        inputRef.current?.focus();
      }
      // Escape to close
      if (e.key === "Escape" && isExpanded) {
        setIsExpanded(false);
        inputRef.current?.blur();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isExpanded]);

  const handleSubmit = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const question = input.trim();
    setInput("");

    // Call the backend
    const result = await sendMessage(question, isIslamic);

    if (result) {
      setResponses((prev) => [
        {
          id: Date.now().toString(),
          question,
          response: result.response,
          agent: result.agent,
          timestamp: new Date(),
        },
        ...prev.slice(0, 4), // Keep last 5 responses
      ]);
    } else {
      // Fallback if something went wrong
      setResponses((prev) => [
        {
          id: Date.now().toString(),
          question,
          response: "I'm having trouble connecting right now. Please try again in a moment.",
          timestamp: new Date(),
        },
        ...prev.slice(0, 4),
      ]);
    }

    setIsExpanded(true);
  }, [input, isLoading, isIslamic, sendMessage]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const dismissResponse = (id: string) => {
    setResponses((prev) => prev.filter((r) => r.id !== id));
  };

  if (!userId) return null;

  return (
    <div className="relative">
      {/* Main Input Bar */}
      <div
        className={`relative mx-6 lg:mx-8 mt-4 transition-all duration-300 ${
          isExpanded ? "mb-4" : ""
        }`}
      >
        <div
          className={`relative flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-300 ${
            isExpanded
              ? `${accentBgLight} ${accentBorder}`
              : "bg-white/2 border-white/5 hover:border-white/10"
          }`}
        >
          {/* Icon */}
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
              isExpanded ? accentBgLight : "bg-white/5"
            }`}
          >
            {isLoading ? (
              <Loader2 className={`w-4 h-4 animate-spin ${accentColor}`} />
            ) : (
              <Sparkles
                className={`w-4 h-4 transition-colors ${
                  isExpanded ? accentColor : "text-white/40"
                }`}
              />
            )}
          </div>

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => setIsExpanded(true)}
            placeholder={
              isIslamic
                ? "Ask Amana about Zakat, Hajj, halal investments..."
                : "Ask Amana about spending, savings, investments..."
            }
            className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none"
            disabled={isLoading}
          />

          {/* Keyboard shortcut hint */}
          {!isExpanded && !input && (
            <div className="hidden sm:flex items-center gap-1 text-xs text-white/20">
              <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 font-mono">
                ⌘K
              </kbd>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            {input && (
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className={`p-2 rounded-lg transition-colors ${accentBgLight} ${accentColor} hover:opacity-80 disabled:opacity-50`}
              >
                <Send className="w-4 h-4" />
              </button>
            )}

            {isExpanded && (
              <button
                onClick={() => setIsExpanded(false)}
                className="p-2 text-white/30 hover:text-white/50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Expand/Collapse indicator when there are responses */}
        {responses.length > 0 && !isExpanded && (
          <button
            onClick={() => setIsExpanded(true)}
            className={`absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-0.5 text-xs rounded-full ${accentBgLight} ${accentColor} border ${accentBorder}`}
          >
            <span>{responses.length} response{responses.length > 1 ? "s" : ""}</span>
            <ChevronDown className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Response Cards */}
      {isExpanded && responses.length > 0 && (
        <div className="mx-6 lg:mx-8 space-y-3 mb-4 animate-fade-in">
          {responses.map((r) => (
            <AIResponseCard
              key={r.id}
              question={r.question}
              response={r.response}
              timestamp={r.timestamp}
              isIslamic={isIslamic}
              onDismiss={() => dismissResponse(r.id)}
              expandable
              actions={[
                {
                  label: "Ask follow-up",
                  onClick: () => {
                    inputRef.current?.focus();
                  },
                },
              ]}
            />
          ))}

          {/* Collapse button */}
          <button
            onClick={() => setIsExpanded(false)}
            className="w-full flex items-center justify-center gap-1 py-2 text-xs text-white/30 hover:text-white/50 transition-colors"
          >
            <ChevronUp className="w-3 h-3" />
            Collapse
          </button>
        </div>
      )}

      {/* Quick suggestions when expanded and empty */}
      {isExpanded && responses.length === 0 && !input && (
        <div className="mx-6 lg:mx-8 mb-4">
          <p className="text-xs text-white/30 mb-2">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {(isIslamic
              ? [
                  "How much Zakat do I owe?",
                  "Help me plan for Hajj",
                  "Is my spending Shariah-compliant?",
                  "What are halal investment options?",
                ]
              : [
                  "How's my spending this month?",
                  "Tips to save more money",
                  "Analyze my expense patterns",
                  "What should I invest in?",
                ]
            ).map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => {
                  setInput(suggestion);
                  inputRef.current?.focus();
                }}
                className="px-3 py-1.5 text-xs text-white/50 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 hover:border-white/10 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
