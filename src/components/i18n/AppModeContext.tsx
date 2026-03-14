import React, { createContext, useContext, useState } from "react";

const AppModeContext = createContext<{ mode: string; setMode: (m: string) => void }>({
  mode: "crm",
  setMode: () => { }
});

export function AppModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<string>(() => {
    try { return localStorage.getItem("app_mode") || "crm"; } catch { return "crm"; }
  });

  const changeMode = (m: string) => {
    try { localStorage.setItem("app_mode", m); } catch { }
    setMode(m);
  };

  return (
    <AppModeContext.Provider value={{ mode, setMode: changeMode }}>
      {children}
    </AppModeContext.Provider>
  );
}

export function useAppMode() {
  return useContext(AppModeContext);
}