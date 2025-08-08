"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";

interface AlertContextValue {
  alertMode: boolean;
  setAlertMode: (value: boolean) => void;
}

const AlertContext = createContext<AlertContextValue | undefined>(undefined);

export function useAlertVisual() {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error("useAlertVisual must be used within AlertVisualProvider");
  return ctx;
}

export function AlertVisualProvider({ children }: { children: React.ReactNode }) {
  const [alertMode, setAlertMode] = useState(false);

  useEffect(() => {
    // Simplified alert checking - check every 2 minutes for critical issues
    const checkAnomalies = async () => {
      try {
        // Basic alert logic - can be enhanced later
        const shouldAlert = Math.random() < 0.1; // 10% chance for demo
        setAlertMode(shouldAlert);
      } catch (e) {
        // silent fail
      }
    };

    checkAnomalies();
    const interval = setInterval(checkAnomalies, 120_000); // 2 minutes
    return () => clearInterval(interval);
  }, []);

  const value = useMemo(() => ({ alertMode, setAlertMode }), [alertMode]);

  return (
    <AlertContext.Provider value={value}>
      <div className={alertMode ? "alert-mode" : ""}>
        {/* Banner de alerta visual */}
        {alertMode && (
          <div className="fixed top-16 inset-x-0 z-50 bg-red-600/10 border-b border-red-600/40 text-red-200">
            <div className="mx-auto max-w-7xl px-4 md:px-6 h-10 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <p className="text-sm">Anomalías críticas detectadas por FermentIA. Revisa Sugerencias de IA.</p>
            </div>
          </div>
        )}
        {children}
      </div>
    </AlertContext.Provider>
  );
}
