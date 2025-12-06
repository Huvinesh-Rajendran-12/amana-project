"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, Moon } from "lucide-react";

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const initialMessages: Message[] = [
  {
    id: 1,
    text: "Hi there! I'm Lumina AI, your personal financial assistant. Whether you prefer conventional banking or Shariah-compliant options, I'm here to help with savings, investments, loans, insurance, Zakat, and more. How can I assist you today?",
    isUser: false,
    timestamp: new Date(),
  },
];

const aiResponses = [
  "Based on your current wealth, your estimated Zakat is $3,210 (2.5% of zakatable assets above nisab). Would you like me to break down the calculation?",
  "MashaAllah, your Hajj savings fund is 65% complete. At your current savings rate, you'll reach your goal in approximately 8 months, inshaAllah.",
  "I noticed a transaction at a business that may involve riba. Would you like me to suggest halal alternatives in your area?",
  "Your Takaful coverage looks comprehensive, Alhamdulillah. However, you might benefit from additional health Takaful for your growing family.",
  "This sukuk fund has a projected 4.2% profit rate and is certified by AAOIFI. Shall I add it to your watchlist?",
  "Ramadan is approaching in 3 months. Based on your income, I recommend setting aside $500/month for Zakat and Sadaqah. Would you like me to set up automatic transfers?",
];

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    setInput("");
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(
      () => {
        const aiResponse: Message = {
          id: messages.length + 2,
          text: aiResponses[Math.floor(Math.random() * aiResponses.length)],
          isUser: false,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiResponse]);
        setIsTyping(false);
      },
      1000 + Math.random() * 1000
    );
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
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <Moon className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-cream">Lumina AI</h3>
                <p className="text-xs text-emerald-400">
                  Your Financial Assistant
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
                      ? "bg-emerald-500/15 text-cream rounded-br-md"
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
                placeholder="Ask about Zakat, investments, Takaful..."
                className="flex-1 bg-cream/5 border border-cream/10 rounded-xl px-4 py-3 text-sm text-cream placeholder:text-cream/30 focus:outline-none focus:border-emerald-500/30 transition-colors"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="p-3 bg-emerald-500/15 text-emerald-400 rounded-xl hover:bg-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
            : "bg-linear-to-br from-emerald-600/80 to-cyan-600/80 text-white hover:from-emerald-600 hover:to-cyan-600"
        }`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
      </button>
    </>
  );
}
