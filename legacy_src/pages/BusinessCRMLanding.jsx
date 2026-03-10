import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import PublicHeader from "@/components/public/PublicHeader";
import PricingTable from "@/components/public/PricingTable";
import { Button } from "@/components/ui/button";
import {
  Users,
  TrendingUp,
  Megaphone,
  BarChart3,
  Zap,
  Shield,
  ArrowRight,
  Check,
} from "lucide-react";

export default function BusinessCRMLanding() {
  const features = [
    {
      icon: Users,
      title: "Customer Management",
      description: "Track customer interactions, history, and contact information",
    },
    {
      icon: TrendingUp,
      title: "Sales Pipeline",
      description: "Manage opportunities from discovery to close",
    },
    {
      icon: Megaphone,
      title: "Marketing Campaigns",
      description: "Create, track, and optimize your marketing campaigns",
    },
    {
      icon: BarChart3,
      title: "Reports & Analytics",
      description: "Get insights into sales performance and ROI",
    },
    {
      icon: Zap,
      title: "Automation",
      description: "Automate repetitive tasks and sales processes",
    },
    {
      icon: Shield,
      title: "Access Control",
      description: "Manage user data access easily and securely",
    },
  ];

  const plans = [
    {
      name: "Starter",
      description: "For startups and small teams",
      monthlyPrice: 49,
      setupFee: 500,
      ctaText: "Start Free Trial",
      features: [
        { name: "Up to 1,000 customers", included: true },
        { name: "Basic customer management", included: true },
        { name: "Sales pipeline", included: true },
        { name: "Basic reporting", included: true },
        { name: "3 users", included: true },
        { name: "Advanced automation", included: false },
        { name: "API & Integrations", included: false },
        { name: "Priority support", included: false },
      ],
    },
    {
      name: "Professional",
      description: "For growing businesses",
      monthlyPrice: 99,
      setupFee: 1200,
      ctaText: "Start Free Trial",
      recommended: true,
      features: [
        { name: "Up to 10,000 customers", included: true },
        { name: "Complete customer management", included: true },
        { name: "Marketing campaigns", included: true },
        { name: "Advanced automation", included: true },
        { name: "10 users", included: true },
        { name: "Custom reporting", included: true },
        { name: "Basic integrations", included: true },
        { name: "Priority support", included: false },
      ],
    },
    {
      name: "Enterprise",
      description: "For large enterprises",
      monthlyPrice: 249,
      setupFee: 2500,
      ctaText: "Contact Us",
      features: [
        { name: "Unlimited customers", included: true },
        { name: "All Professional features", included: true },
        { name: "Full API & Integrations", included: true },
        { name: "Unlimited users", included: true },
        { name: "Advanced BI & Reporting", included: true },
        { name: "Dedicated account manager", included: true },
        { name: "24/7 priority support", included: true },
        { name: "Training & Onboarding", included: true },
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
            Business CRM
          </h1>
          <p className="text-xl sm:text-2xl text-blue-100 mb-10 max-w-3xl mx-auto">
            Powerful CRM platform to grow your business
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
              Powerful tools to manage sales and marketing
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
              Choose the plan that fits your business needs
            </p>
          </div>

          <PricingTable plans={plans} color="blue" />

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
                q: "Does it integrate with other tools?",
                a: "Yes, we integrate with 500+ apps including Slack, Zapier, and more.",
              },
              {
                q: "How secure is my data?",
                a: "We use 256-bit encryption, daily backups, and comply with ISO 27001.",
              },
              {
                q: "Can I import my old data?",
                a: "Yes, we support importing from CSV, Excel, Salesforce, and other CRMs.",
              },
              {
                q: "What support is included?",
                a: "All plans include email support, Professional has phone support, Enterprise has 24/7 support.",
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
            Ready to grow your business?
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