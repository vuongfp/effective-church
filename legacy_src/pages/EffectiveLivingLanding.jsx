import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import PublicHeader from "@/components/public/PublicHeader";
import PricingTable from "@/components/public/PricingTable";
import { Button } from "@/components/ui/button";
import {
  Target,
  Zap,
  Heart,
  Calendar,
  TrendingUp,
  Users,
  ArrowRight,
  Check,
} from "lucide-react";

export default function EffectiveLivingLanding() {
  const features = [
    {
      icon: Target,
      title: "Goal Management",
      description: "Set clear goals and track progress daily",
    },
    {
      icon: Calendar,
      title: "Workout Scheduling",
      description: "Plan and track your daily workouts",
    },
    {
      icon: Heart,
      title: "Health Tracking",
      description: "Manage mental health, weight, and other metrics",
    },
    {
      icon: Zap,
      title: "Habit Building",
      description: "Build good habits with smart reminders",
    },
    {
      icon: TrendingUp,
      title: "Progress Analytics",
      description: "Get insights into your progress with charts and reports",
    },
    {
      icon: Users,
      title: "Community Support",
      description: "Connect with like-minded people and get encouragement",
    },
  ];

  const plans = [
    {
      name: "Free",
      description: "To get started",
      monthlyPrice: 0,
      ctaText: "Get Started",
      features: [
        { name: "Up to 5 goals", included: true },
        { name: "Daily tracking", included: true },
        { name: "Basic journaling", included: true },
        { name: "Data backup", included: true },
        { name: "Advanced reporting", included: false },
        { name: "Workout library", included: false },
        { name: "Private community groups", included: false },
        { name: "Personal coaching", included: false },
      ],
    },
    {
      name: "Plus",
      description: "For serious users",
      monthlyPrice: 19,
      ctaText: "Start Free Trial",
      recommended: true,
      features: [
        { name: "Unlimited goals", included: true },
        { name: "Smart workout scheduling", included: true },
        { name: "Detailed health tracking", included: true },
        { name: "500+ workout library", included: true },
        { name: "Advanced analytics", included: true },
        { name: "Private community groups", included: true },
        { name: "Export to PDF", included: true },
        { name: "Priority email support", included: false },
      ],
    },
    {
      name: "Premium",
      description: "Unlock your full potential",
      monthlyPrice: 49,
      ctaText: "Start Free Trial",
      features: [
        { name: "All Plus features", included: true },
        { name: "Weekly 1-on-1 coaching", included: true },
        { name: "Custom workouts & music", included: true },
        { name: "AI mood journaling", included: true },
        { name: "Personal AI coach", included: true },
        { name: "24/7 priority support", included: true },
        { name: "Nutrition coaching", included: true },
        { name: "Sleep optimization toolkit", included: true },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-600 to-emerald-800 py-20 sm:py-32 text-white pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            Effective LIVING
          </h1>
          <p className="text-xl sm:text-2xl text-emerald-100 mb-10 max-w-3xl mx-auto">
            Personal development, achieve your goals, live a meaningful life
          </p>
          <Link to={createPageUrl("Dashboard")}>
            <Button size="lg" className="bg-white text-emerald-600 hover:bg-slate-100">
              Start Free Trial <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 sm:py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Key Features
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              All the tools you need to turn goals into reality
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => {
              const IconComponent = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="bg-white rounded-xl p-8 border border-slate-200 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center justify-center w-14 h-14 bg-emerald-100 rounded-lg mb-4">
                    <IconComponent className="w-7 h-7 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 sm:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Pricing Plans
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Choose the plan that fits your journey
            </p>
          </div>

          <PricingTable plans={plans} color="emerald" />

          <div className="mt-16 bg-emerald-50 rounded-xl p-8 border border-emerald-200">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">
              All plans include:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "Automatic backups",
                "Free feature updates",
                "Security & Encryption",
                "GDPR compliant",
                "Responsive design",
                "Cancel anytime",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 sm:py-32 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-12 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {[
              {
                q: "Can I cancel anytime?",
                a: "Yes, you can cancel anytime with no cancellation fees.",
              },
              {
                q: "Is my data secure?",
                a: "Yes, we use 256-bit encryption, daily backups, and comply with GDPR.",
              },
              {
                q: "Can I share goals with friends?",
                a: "Yes, you can share goals and get encouragement from friends.",
              },
              {
                q: "Does it integrate with other apps?",
                a: "Yes, we integrate with Apple Health, Google Fit, Fitbit, and more.",
              },
            ].map((item, idx) => (
              <div key={idx} className="bg-white rounded-lg p-6 border border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 mb-3">{item.q}</h3>
                <p className="text-slate-600">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-emerald-600 text-white py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to change your life?
          </h2>
          <p className="text-xl text-emerald-100 mb-8">
            Start your free 7-day trial today. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={createPageUrl("Dashboard")}>
              <Button size="lg" className="bg-white text-emerald-600 hover:bg-slate-100">
                Get Started
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-emerald-700"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-400">
          <p>&copy; 2026 Effective CRM Suite. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}