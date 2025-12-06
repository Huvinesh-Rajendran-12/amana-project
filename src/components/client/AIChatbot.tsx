"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, Moon, Loader2 } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { useFinanceMode } from "@/context/FinanceModeContext";
import { useCoachingMessage, useInsightsList } from "@/hooks/useInsights";
import { useSpendingSummary } from "@/hooks/useTransactions";
import { useCurrentMode } from "@/hooks/useSpendingModes";

interface Message {
  id: number;
  text: string;
  isUser: boolean;
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
      const estimatedZakat = spendingSummary.savings * 6 * 0.025;
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

  // Check for takaful/insurance questions
  if (message.includes("takaful") || message.includes("insurance")) {
    if (isIslamic) {
      return "Takaful is Islamic insurance based on mutual cooperation. It's important to have adequate family protection. I can help you evaluate your current coverage. Do you have any Takaful policies?";
    }
    return "Insurance is essential for financial protection. I recommend reviewing your life, health, and property coverage regularly. Would you like me to analyze your insurance needs?";
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
        "As your Islamic finance assistant, I can help with Shariah compliance checks, Zakat tracking, and halal investment guidance. What's on your mind?",
      ]
    : [
        "I'm here to help with your financial goals! You can ask about spending patterns, savings strategies, or investment ideas.",
        "I can help you understand your spending, optimize your budget, or plan for the future. What would you like to explore?",
        "Whether it's tracking expenses, building savings, or planning investments - I'm here to guide you. How can I assist?",
      ];

  return genericResponses[Math.floor(Math.random() * genericResponses.length)];
}

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { user, userId } = useUser();
  const { mode } = useFinanceMode();
  const coachingMessage = useCoachingMessage();
  const spendingSummary = useSpendingSummary(1);
  const currentMode = useCurrentMode();
  const insights = useInsightsList({ limit: 3 });

  const isIslamic = mode === "islamic";

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage = isIslamic
      ? "Assalamualaikum! I'm Lumina AI, your Shariah-compliant financial assistant. I can help with Zakat calculations, Hajj savings, halal investments, and more. How may I assist you today?"
      : "Hi there! I'm Lumina AI, your personal financial assistant. Whether you need help with budgeting, savings, investments, or financial planning, I'm here to help. How can I assist you today?";

    setMessages([
      {
        id: 1,
        text: welcomeMessage,
        isUser: false,
        timestamp: new Date(),
      },
    ]);
  }, [isIslamic]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: input,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const userInput = input;
    setInput("");
    setIsTyping(true);

    // Generate contextual response
    setTimeout(() => {
      const aiResponse: Message = {
        id: messages.length + 2,
        text: generateAIResponse(
          userInput,
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
        ),
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 800 + Math.random() * 700);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chat Dialog */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[380px] h-[500px] bg-[#0a0a0a] border border-cream/10 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-cream/5 bg-[#0a0a0a]">
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isIslamic ? "bg-sentience-gold/10" : "bg-violet-500/10"
                }`}
              >
                <Moon
                  className={`w-4 h-4 ${isIslamic ? "text-sentience-gold" : "text-violet-400"}`}
                />
              </div>
              <div>
                <h3 className="text-sm font-medium text-cream">Lumina AI</h3>
                <p
                  className={`text-xs ${isIslamic ? "text-sentience-gold" : "text-violet-400"}`}
                >
                  {isIslamic ? "Islamic Finance Assistant" : "Your Financial Assistant"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-cream/40 hover:text-cream transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    message.isUser
                      ? isIslamic
                        ? "bg-sentience-gold/15 text-cream rounded-br-md"
                        : "bg-violet-500/15 text-cream rounded-br-md"
                      : "bg-cream/5 text-cream/80 rounded-bl-md"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-cream/5 p-3 rounded-2xl rounded-bl-md">
                  <div className="flex gap-1">
                    <span
                      className="w-2 h-2 bg-cream/40 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="w-2 h-2 bg-cream/40 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="w-2 h-2 bg-cream/40 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-cream/5 bg-black">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  isIslamic
                    ? "Ask about Zakat, Hajj, halal investments..."
                    : "Ask about spending, savings, investments..."
                }
                className={`flex-1 bg-cream/5 border border-cream/10 rounded-xl px-4 py-3 text-sm text-cream placeholder:text-cream/30 focus:outline-none transition-colors ${
                  isIslamic ? "focus:border-sentience-gold/30" : "focus:border-violet-500/30"
                }`}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className={`p-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                  isIslamic
                    ? "bg-sentience-gold/15 text-sentience-gold hover:bg-sentience-gold/25"
                    : "bg-violet-500/15 text-violet-400 hover:bg-violet-500/25"
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg z-50 flex items-center justify-center transition-all duration-300 ${
          isOpen
            ? "bg-cream/10 text-cream"
            : isIslamic
              ? "bg-linear-to-br from-sentience-gold/80 to-amber-600/80 text-black hover:from-sentience-gold hover:to-amber-600"
              : "bg-linear-to-br from-violet-600/80 to-fuchsia-600/80 text-white hover:from-violet-600 hover:to-fuchsia-600"
        }`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
      </button>
    </>
  );
}
