"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

interface LanguageContextType {
  lang: string;
  setLang: (l: string) => void;
}

const LanguageContext = createContext<LanguageContextType>({ lang: "en", setLang: () => { } });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState(() => {
    if (typeof window === "undefined") return "en";
    return localStorage.getItem("church_lang") || "en";
  });

  const changeLang = (l: string) => {
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