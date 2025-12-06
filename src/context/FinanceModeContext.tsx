"use client";

import React, { createContext, useContext, useState } from "react";

type FinanceMode = "conventional" | "islamic";

interface FinanceModeContextType {
  mode: FinanceMode;
  toggleMode: () => void;
  setMode: (mode: FinanceMode) => void;
}

const FinanceModeContext = createContext<FinanceModeContextType | undefined>(
  undefined
);

export function FinanceModeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mode, setModeState] = useState<FinanceMode>(() => {
    // Load preference from local storage if available (runs only on client)
    if (typeof window !== "undefined") {
      const savedMode = localStorage.getItem("financeMode") as FinanceMode;
      if (savedMode) {
        return savedMode;
      }
    }
    return "conventional";
  });

  const setMode = (newMode: FinanceMode) => {
    setModeState(newMode);
    localStorage.setItem("financeMode", newMode);
  };

  const toggleMode = () => {
    const newMode = mode === "conventional" ? "islamic" : "conventional";
    setMode(newMode);
  };

  return (
    <FinanceModeContext.Provider value={{ mode, toggleMode, setMode }}>
      {children}
    </FinanceModeContext.Provider>
  );
}

export function useFinanceMode() {
  const context = useContext(FinanceModeContext);
  if (context === undefined) {
    throw new Error("useFinanceMode must be used within a FinanceModeProvider");
  }
  return context;
}
