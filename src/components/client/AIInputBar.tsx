"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Sparkles, Send, X, Loader2, ChevronUp, ChevronDown } from "lucide-react";
import { useFinanceMode } from "@/context/FinanceModeContext";
import { useUser } from "@/context/UserContext";
import { useSpendingSummary } from "@/hooks/useTransactions";
import { useCurrentMode } from "@/hooks/useSpendingModes";
import { useInsightsList } from "@/hooks/useInsights";
import AIResponseCard from "./AIResponseCard";

interface AIResponse {
  id: string;
  question: string;
  response: string;
  timestamp: Date;
}

// Generate contextual AI responses based on user data
function generateAIResponse(
  userMessage: string,
  isIslamic: boolean,
  spendingSummary?: {
    totalExpenses: number;
    savings: number;
    savingsRate: number;
  },
  currentMode?: { mode: string } | null,
  insights?: Array<{ title: string; message: string }>
): string {
  const message = userMessage.toLowerCase();

  // Check for Zakat related questions
  if (message.includes("zakat")) {
    if (spendingSummary && spendingSummary.savings > 0) {
      // Estimate annual savings (monthly * 12) and apply 2.5% Zakat rate
      const estimatedAnnualSavings = spendingSummary.savings * 12;
      const estimatedZakat = estimatedAnnualSavings * 0.025;
      return `Based on your current savings pattern, your estimated annual Zakat would be approximately RM${estimatedZakat.toFixed(2)} (2.5% of zakatable assets above nisab). Would you like me to break down the calculation or help you set up automatic Zakat reminders?`;
    }
    return "To calculate your Zakat accurately, I'll need to know your total zakatable assets including cash, gold, silver, and investments held for one lunar year above the nisab threshold. Would you like me to guide you through the calculation?";
  }

  // Check for Hajj related questions
  if (message.includes("hajj") || message.includes("pilgrimage")) {
    return "MashaaAllah! Your Hajj savings journey is important. Based on current Tabung Haji rates, the estimated cost is around RM45,000. I can help you create a savings plan. How many years would you like to save over?";
  }

  // Check for spending related questions
  if (message.includes("spending") || message.includes("spent") || message.includes("expenses")) {
    if (spendingSummary) {
      const { totalExpenses, savingsRate } = spendingSummary;
      if (savingsRate > 25) {
        return `Great news! You've spent RM${totalExpenses.toFixed(2)} this month with a healthy ${savingsRate.toFixed(0)}% savings rate. Keep up the excellent financial discipline!`;
      } else if (savingsRate > 0) {
        return `This month you've spent RM${totalExpenses.toFixed(2)} with a ${savingsRate.toFixed(0)}% savings rate. To improve, consider reviewing your discretionary spending categories.`;
      }
      return `You've spent RM${totalExpenses.toFixed(2)} this month. Would you like me to analyze your spending patterns and suggest areas for optimization?`;
    }
    return "I can help you analyze your spending! Add some transactions first, and I'll provide personalized insights.";
  }

  // Check for savings related questions
  if (message.includes("save") || message.includes("saving")) {
    if (spendingSummary && spendingSummary.savingsRate > 0) {
      return `Your current savings rate is ${spendingSummary.savingsRate.toFixed(0)}%. ${
        spendingSummary.savingsRate >= 20
          ? "Excellent work! You're on track for your financial goals."
          : "Consider aiming for at least 20% savings rate for long-term financial health."
      }`;
    }
    return "Building savings is crucial for financial security. I recommend starting with an emergency fund covering 3-6 months of expenses. Would you like me to help create a savings plan?";
  }

  // Check for mode related questions
  if (message.includes("mode") || message.includes("yolo") || message.includes("broke")) {
    if (currentMode) {
      return `You're currently in ${currentMode.mode.toUpperCase()} mode. ${
        currentMode.mode === "yolo"
          ? "Enjoy responsibly! I'll celebrate your purchases with you."
          : currentMode.mode === "broke"
            ? "I'm here to help you stay on budget. Every ringgit counts!"
            : currentMode.mode === "vacation"
              ? "Have a great trip! I'll track your vacation spending."
              : "I'm providing balanced financial coaching."
      } Would you like to switch modes?`;
    }
    return "You can switch between Normal, YOLO, Broke, and Vacation modes to adjust how I coach you. Which mode interests you?";
  }

  // Check for halal/shariah related questions
  if (isIslamic && (message.includes("halal") || message.includes("shariah") || message.includes("riba"))) {
    return "I help ensure your finances align with Islamic principles. I can check transactions for Shariah compliance, track riba (interest) for purification, and guide you on halal investments. What would you like to know more about?";
  }

  // Check for investment questions
  if (message.includes("invest") || message.includes("portfolio")) {
    if (isIslamic) {
      return "For Shariah-compliant investing, consider Sukuk (Islamic bonds), ASNB Islamic funds, or Shariah-compliant ETFs. I can help you evaluate options based on your risk tolerance. What's your investment goal?";
    }
    return "Based on your savings pattern, you might consider diversifying into fixed deposits, unit trusts, or stocks. What's your risk tolerance and investment timeline?";
  }

  // Default contextual responses
  if (insights && insights.length > 0) {
    const latestInsight = insights[0];
    return `Based on my analysis: ${latestInsight.message} Is there anything specific about your finances you'd like to discuss?`;
  }

  // Generic helpful responses
  const genericResponses = isIslamic
    ? [
        "Bismillah! I'm here to help with your Shariah-compliant financial journey. You can ask about Zakat, Hajj savings, halal investments, or general budgeting.",
        "Alhamdulillah for reaching out! I can assist with Zakat calculations, spending analysis, or Islamic financial planning. How may I help?",
      ]
    : [
        "I'm here to help with your financial goals! You can ask about spending patterns, savings strategies, or investment ideas.",
        "I can help you understand your spending, optimize your budget, or plan for the future. What would you like to explore?",
      ];

  return genericResponses[Math.floor(Math.random() * genericResponses.length)];
}

export default function AIInputBar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [responses, setResponses] = useState<AIResponse[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const { mode } = useFinanceMode();
  const { userId } = useUser();
  const spendingSummary = useSpendingSummary(1);
  const currentMode = useCurrentMode();
  const insights = useInsightsList({ limit: 3 });

  const isIslamic = mode === "islamic";
  const accentColor = isIslamic ? "text-sentience-gold" : "text-violet-400";
  const accentBg = isIslamic ? "bg-sentience-gold" : "bg-violet-500";
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
    setIsLoading(true);

    // Simulate AI response delay
    await new Promise((resolve) => setTimeout(resolve, 600 + Math.random() * 400));

    const response = generateAIResponse(
      question,
      isIslamic,
      spendingSummary
        ? {
            totalExpenses: spendingSummary.totalExpenses,
            savings: spendingSummary.savings,
            savingsRate: spendingSummary.savingsRate,
          }
        : undefined,
      currentMode,
      insights?.map((i) => ({ title: i.title, message: i.message }))
    );

    setResponses((prev) => [
      {
        id: Date.now().toString(),
        question,
        response,
        timestamp: new Date(),
      },
      ...prev.slice(0, 4), // Keep last 5 responses
    ]);

    setIsLoading(false);
    setIsExpanded(true);
  }, [input, isLoading, isIslamic, spendingSummary, currentMode, insights]);

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
                ? "Ask Lumina about Zakat, Hajj, halal investments..."
                : "Ask Lumina about spending, savings, investments..."
            }
            className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none"
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
                  "Track my Hajj savings",
                  "Is my spending halal?",
                ]
              : [
                  "How's my spending this month?",
                  "Tips to save more",
                  "Analyze my expenses",
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

