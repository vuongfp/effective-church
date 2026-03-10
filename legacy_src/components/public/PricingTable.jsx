import React from "react";
import { Check, X } from "lucide-react";
import { useLang } from "@/components/i18n/LanguageContext";

const translations = {
  en: {
    "monthly": "/month",
    "setup_fee": "Setup Fee:",
    "includes": "Includes:",
    "recommended": "Most Popular"
  },
  vi: {
    "monthly": "/tháng",
    "setup_fee": "Phí cài đặt:",
    "includes": "Bao gồm:",
    "recommended": "Phó biên nhất"
  },
  fr: {
    "monthly": "/mois",
    "setup_fee": "Frais de configuration:",
    "includes": "Comprend:",
    "recommended": "Plus populaire"
  }
};

export default function PricingTable({ plans, color = "indigo" }) {
  const { lang } = useLang();
  const t = (key) => translations[lang]?.[key] || translations.en[key];

  const colorMap = {
    indigo: {
      badge: "bg-indigo-100 text-indigo-700",
      button: "bg-indigo-600 hover:bg-indigo-700",
      accent: "text-indigo-600"
    },
    violet: {
      badge: "bg-violet-100 text-violet-700",
      button: "bg-violet-600 hover:bg-violet-700",
      accent: "text-violet-600"
    },
    blue: {
      badge: "bg-blue-100 text-blue-700",
      button: "bg-blue-600 hover:bg-blue-700",
      accent: "text-blue-600"
    },
    emerald: {
      badge: "bg-emerald-100 text-emerald-700",
      button: "bg-emerald-600 hover:bg-emerald-700",
      accent: "text-emerald-600"
    }
  };

  const colors = colorMap[color] || colorMap.indigo;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {plans.map((plan) => (
        <div
          key={plan.name}
          className={`relative rounded-2xl border-2 transition-all ${
            plan.recommended 
              ? `border-${color}-500 shadow-2xl scale-105` 
              : "border-slate-200 hover:border-slate-300"
          }`}
        >
          {plan.recommended && (
            <div className={`absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full text-sm font-semibold ${colors.badge}`}>
              {t("recommended")}
            </div>
          )}

          <div className="p-8">
            {/* Plan name */}
            <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
            <p className="text-slate-600 mb-6">{plan.description}</p>

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-baseline gap-1 mb-2">
                <span className={`text-4xl font-bold ${colors.accent}`}>${plan.monthlyPrice}</span>
                <span className="text-slate-600">{t("monthly")}</span>
              </div>
              {plan.setupFee && (
                <p className="text-sm text-slate-600">
                  {t("setup_fee")} ${plan.setupFee}
                </p>
              )}
            </div>

            {/* CTA Button */}
            <button className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors ${colors.button} mb-8`}>
              {plan.ctaText}
            </button>

            {/* Features */}
            <div>
              <p className="font-semibold text-slate-900 mb-4">{t("includes")}:</p>
              <ul className="space-y-3">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    {feature.included ? (
                      <Check className={`w-5 h-5 ${colors.accent} shrink-0 mt-0.5`} />
                    ) : (
                      <X className="w-5 h-5 text-slate-300 shrink-0 mt-0.5" />
                    )}
                    <span className={feature.included ? "text-slate-700" : "text-slate-400"}>
                      {feature.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}