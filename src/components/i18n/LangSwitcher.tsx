"use client";
import React from "react";
import { useLang, LangCode } from "./LanguageContext";
import { LANGUAGES } from "./translations";

export function LangSwitcher({ className = "" }: { className?: string }) {
    const { lang, setLang } = useLang();

    return (
        <div className={`flex items-center gap-1 ${className}`}>
            {LANGUAGES.map((l) => (
                <button
                    key={l.code}
                    onClick={() => setLang(l.code as LangCode)}
                    title={l.label}
                    className={`text-xs font-medium px-2.5 py-1 rounded-lg transition-colors ${lang === l.code
                            ? "bg-white/20 text-white"
                            : "text-slate-400 hover:text-white hover:bg-white/10"
                        }`}
                >
                    {l.code.toUpperCase()}
                </button>
            ))}
        </div>
    );
}

/** Compact pill variant for public pages (dark text) */
export function LangSwitcherLight({ className = "" }: { className?: string }) {
    const { lang, setLang } = useLang();

    return (
        <div className={`flex items-center gap-0.5 ${className}`}>
            {LANGUAGES.map((l) => (
                <button
                    key={l.code}
                    onClick={() => setLang(l.code as LangCode)}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors ${lang === l.code
                            ? "bg-indigo-600 text-white"
                            : "text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
                        }`}
                >
                    {l.code.toUpperCase()}
                </button>
            ))}
        </div>
    );
}
