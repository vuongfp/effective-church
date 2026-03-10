import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import PublicHeader from "@/components/public/PublicHeader";
import PricingTable from "@/components/public/PricingTable";
import { Button } from "@/components/ui/button";
import {
  Users,
  Heart,
  DollarSign,
  Calendar,
  BarChart3,
  Shield,
  ArrowRight,
  Check,
} from "lucide-react";

export default function ChurchCRMLanding() {
  const features = [
    {
      icon: Users,
      title: "Member Management",
      description: "Track member information, attendance, and engagement",
    },
    {
      icon: Heart,
      title: "Pastoral Care",
      description: "Manage pastoral visits, prayer requests, and follow-ups",
    },
    {
      icon: DollarSign,
      title: "Financial Management",
      description: "Track tithes, offerings, donations, and budgets",
    },
    {
      icon: Calendar,
      title: "Event Scheduling",
      description: "Plan and manage church events and activities",
    },
    {
      icon: BarChart3,
      title: "Reports & Analytics",
      description: "Get insights into member engagement and finances",
    },
    {
      icon: Shield,
      title: "Data Security",
      description: "Secure and confidential member information",
    },
  ];

  const plans = [
    {
      name: "Basic",
      description: "For small churches",
      monthlyPrice: 29,
      setupFee: 500,
      ctaText: "Start Free Trial",
      features: [
        { name: "Up to 500 members", included: true },
        { name: "Basic member management", included: true },
        { name: "Attendance tracking", included: true },
        { name: "Basic reporting", included: true },
        { name: "Email support", included: true },
        { name: "Advanced pastoral care", included: false },
        { name: "Custom reports", included: false },
        { name: "Priority support", included: false },
      ],
    },
    {
      name: "Professional",
      description: "For growing churches",
      monthlyPrice: 79,
      setupFee: 1200,
      ctaText: "Start Free Trial",
      recommended: true,
      features: [
        { name: "Up to 5,000 members", included: true },
        { name: "Complete member management", included: true },
        { name: "Pastoral care tracking", included: true },
        { name: "Financial management", included: true },
        { name: "Event management", included: true },
        { name: "Custom reports", included: true },
        { name: "Email & phone support", included: true },
        { name: "Priority support", included: false },
      ],
    },
    {
      name: "Enterprise",
      description: "For large churches",
      monthlyPrice: 199,
      setupFee: 2500,
      ctaText: "Contact Us",
      features: [
        { name: "Unlimited members", included: true },
        { name: "All Professional features", included: true },
        { name: "Advanced analytics", included: true },
        { name: "API access", included: true },
        { name: "Unlimited users", included: true },
        { name: "Custom integrations", included: true },
        { name: "Dedicated support", included: true },
        { name: "24/7 phone support", included: true },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 py-20 sm:py-32 text-white pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            Church CRM
          </h1>
          <p className="text-xl sm:text-2xl text-violet-100 mb-10 max-w-3xl mx-auto">
            Complete management solution for your church
          </p>
          <Link to={createPageUrl("Dashboard")}>
            <Button size="lg" className="bg-white text-blue-600 hover:bg-slate-100">
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
              Everything you need to manage your church
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
                  <div className="flex items-center justify-center w-14 h-14 bg-blue-100 rounded-lg mb-4">
                    <IconComponent className="w-7 h-7 text-blue-600" />
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
              Choose the plan that fits your church
            </p>
          </div>

          <PricingTable plans={plans} color="violet" />

          <div className="mt-16 bg-blue-50 rounded-xl p-8 border border-blue-200">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">
              All plans include:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "Customer support",
                "Free updates",
                "Daily backups",
                "SSL & Security",
                "Responsive design",
                "GDPR compliant",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-blue-600 shrink-0" />
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
                q: "Can I import my current member data?",
                a: "Yes, we support importing from CSV, Excel, or other CRM systems.",
              },
              {
                q: "Is my data secure?",
                a: "Yes, we use 256-bit encryption, daily backups, and comply with ISO 27001.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept credit cards, bank transfers, and checks.",
              },
              {
                q: "Can I cancel anytime?",
                a: "Yes, you can cancel your subscription at any time without penalty.",
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
      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to manage your church better?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Start your free 14-day trial today. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={createPageUrl("Dashboard")}>
              <Button size="lg" className="bg-white text-blue-600 hover:bg-slate-100">
                Get Started
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-blue-700"
            >
              Contact Sales
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