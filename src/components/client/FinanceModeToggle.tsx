"use client";

import { useFinanceMode } from "@/context/FinanceModeContext";
import { Moon, Percent } from "lucide-react";

export default function FinanceModeToggle() {
  const { mode, toggleMode } = useFinanceMode();
  const isIslamic = mode === "islamic";

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={toggleMode}
        className={`group relative flex items-center justify-center w-14 h-14 rounded-full shadow-2xl transition-all duration-500 border backdrop-blur-md ${
          isIslamic
            ? "bg-sentience-dark/80 border-sentience-gold/30 hover:border-sentience-gold"
            : "bg-sentience-dark/80 border-violet-500/30 hover:border-violet-400"
        }`}
      >
        <div className="relative w-6 h-6">
          <Moon
            className={`absolute inset-0 w-full h-full transition-all duration-500 ${
              isIslamic
                ? "opacity-100 rotate-0 scale-100 text-sentience-gold"
                : "opacity-0 -rotate-90 scale-50 text-violet-400"
            }`}
          />
          <Percent
            className={`absolute inset-0 w-full h-full transition-all duration-500 ${
              !isIslamic
                ? "opacity-100 rotate-0 scale-100 text-violet-400"
                : "opacity-0 rotate-90 scale-50 text-sentience-gold"
            }`}
          />
        </div>

        {/* Tooltip */}
        <span
          className={`absolute right-full mr-4 px-3 py-1.5 rounded-lg text-xs font-medium tracking-widest uppercase whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 border backdrop-blur-md ${
            isIslamic
              ? "bg-sentience-gold/10 border-sentience-gold/20 text-sentience-gold"
              : "bg-violet-500/10 border-violet-500/20 text-violet-400"
          }`}
        >
          Switch to {isIslamic ? "Conventional" : "Islamic"}
        </span>
      </button>
    </div>
  );
}
