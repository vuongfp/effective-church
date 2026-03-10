"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

export type LangCode = "vi" | "en";

interface LanguageContextType {
  lang: LangCode;
  setLang: (l: LangCode) => void;
}

const LanguageContext = createContext<LanguageContextType>({ lang: "vi", setLang: () => { } });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<LangCode>(() => {
    if (typeof window === "undefined") return "vi";
    return (localStorage.getItem("church_lang") as LangCode) || "vi";
  });

  const changeLang = (l: LangCode) => {
    setLang(l);
    if (typeof window !== "undefined") {
      localStorage.setItem("church_lang", l);
    }
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang: changeLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}