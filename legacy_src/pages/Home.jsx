import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import {
  Church, Briefcase, Heart, ArrowRight, Check,
  Zap, Users, Target, Menu, X,
  Users as UsersIcon, DollarSign, Calendar, BarChart3,
  Shield, TrendingUp, Megaphone,
} from "lucide-react";

function PublicNav() {
  const [open, setOpen] = useState(false);
  const links = [
    { label: "Home", href: "#home" },
    { label: "Effective CHURCH", href: "#church-crm" },
    { label: "Effective BUSINESS", href: "#business-crm" },
    { label: "Effective LIVING", href: "#effective-living" },
    { label: "About Us", href: "#about-us" },
  ];
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <a href="#home" className="text-xl font-bold text-slate-900">Effective CRM Suite</a>
        <nav className="hidden md:flex items-center gap-6">
          {links.map(l => (
            <a key={l.href} href={l.href} className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              {l.label}
            </a>
          ))}
          <Link to={createPageUrl("Dashboard")}>
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">Launch App</Button>
          </Link>
        </nav>
        <button className="md:hidden text-slate-600 hover:text-slate-900" onClick={() => setOpen(!open)}>
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>
      {open && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-3">
          {links.map(l => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="block text-sm font-medium text-slate-700 hover:text-slate-900">
              {l.label}
            </a>
          ))}
          <Link to={createPageUrl("Dashboard")} onClick={() => setOpen(false)}>
            <Button size="sm" className="w-full bg-indigo-600 hover:bg-indigo-700 mt-2">Launch App</Button>
          </Link>
        </div>
      )}
    </header>
  );
}

export default function Home() {
  // ── Church CRM features & plans ──────────────────────────────────────────
  const churchFeatures = [
    { icon: UsersIcon, title: "Member Management", description: "Track member information, attendance, and engagement" },
    { icon: Heart, title: "Pastoral Care", description: "Manage pastoral visits, prayer requests, and follow-ups" },
    { icon: DollarSign, title: "Financial Management", description: "Track tithes, offerings, donations, and budgets" },
    { icon: Calendar, title: "Event Scheduling", description: "Plan and manage church events and activities" },
    { icon: BarChart3, title: "Reports & Analytics", description: "Get insights into member engagement and finances" },
    { icon: Shield, title: "Data Security", description: "Secure and confidential member information" },
  ];
  const churchPlans = [
    { name: "Basic", price: "$99/mo", setup: "$1,000", description: "For small churches", features: ["Up to 500 members", "Attendance tracking", "Basic reporting", "Email support"] },
    { name: "Professional", price: "$199/mo", setup: "$2,000", description: "For growing churches", features: ["Up to 5,000 members", "Pastoral care tracking", "Financial management", "Custom reports"], recommended: true },
    { name: "Enterprise", price: "$399/mo", setup: "$6,000", description: "For large churches", features: ["Unlimited members", "Advanced analytics", "API access", "24/7 support"] },
  ];

  // ── Business CRM features & plans ─────────────────────────────────────────
  const bizFeatures = [
    { icon: UsersIcon, title: "Customer Management", description: "Track customer interactions, history, and contact information" },
    { icon: TrendingUp, title: "Sales Pipeline", description: "Manage opportunities from discovery to close" },
    { icon: Megaphone, title: "Marketing Campaigns", description: "Create, track, and optimize your marketing campaigns" },
    { icon: BarChart3, title: "Reports & Analytics", description: "Get insights into sales performance and ROI" },
    { icon: Zap, title: "Automation", description: "Automate repetitive tasks and sales processes" },
    { icon: Shield, title: "Access Control", description: "Manage user data access easily and securely" },
  ];
  const bizPlans = [
    { name: "Starter", price: "$49/mo", setup: "$800", description: "For small teams", features: ["Up to 1,000 customers", "Sales pipeline", "3 users", "Basic reporting"] },
    { name: "Professional", price: "$99/mo", setup: "$1,600", description: "For growing businesses", features: ["Up to 10,000 customers", "Marketing campaigns", "Advanced automation", "10 users"], recommended: true },
    { name: "Enterprise", price: "$249/mo", setup: "$5,000", description: "For large enterprises", features: ["Unlimited customers", "Full API & Integrations", "Unlimited users", "24/7 priority support"] },
  ];

  // ── Effective LIVING features & plans ─────────────────────────────────────
  const livingFeatures = [
    { icon: Target, title: "Goal Management", description: "Set clear goals and track progress daily" },
    { icon: Calendar, title: "Workout Scheduling", description: "Plan and track your daily workouts" },
    { icon: Heart, title: "Health Tracking", description: "Manage mental health, weight, and other metrics" },
    { icon: Zap, title: "Habit Building", description: "Build good habits with smart reminders" },
    { icon: TrendingUp, title: "Progress Analytics", description: "Get insights into your progress with charts and reports" },
    { icon: Users, title: "Community Support", description: "Connect with like-minded people and get encouragement" },
  ];
  const livingPlans = [
    { name: "Free", price: "$0", setup: "$0", description: "To get started", features: ["Up to 5 goals", "Daily tracking", "Basic journaling", "Data backup"] },
    { name: "Plus", price: "$19/mo", setup: "$10", description: "For serious users", features: ["Unlimited goals", "Smart workout scheduling", "500+ workout library", "Advanced analytics"], recommended: true },
    { name: "Premium", price: "$49/mo", setup: "$50", description: "Unlock your full potential", features: ["All Plus features", "Weekly 1-on-1 coaching", "AI mood journaling", "Personal AI coach"] },
  ];

  // ── About Us ─────────────────────────────────────────────────────────────
  const values = [
    { icon: Zap, title: "Simple & Powerful", description: "Complex technology doesn't have to be hard to use. We believe in simplicity." },
    { icon: Users, title: "User-Focused", description: "Our products are designed with direct input from real users." },
    { icon: Heart, title: "Impact-Driven", description: "We build tools that help improve lives and businesses." },
    { icon: Target, title: "Always Improving", description: "Development never stops. We continuously improve based on feedback." },
  ];
  const team = [
    { name: "Jackie Vuong", role: "Co-founder & CEO", image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/699e4c6f10d75a58d927dbdd/10278968f_jackie.jpg" },
    { name: "Vuong Le", role: "Co-founder & CTO", image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/699e4c6f10d75a58d927dbdd/10d1a4b27_VuongLe.png" },
  ];

  const PlanCards = ({ plans, accentClass, btnClass }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {plans.map(p => (
        <div key={p.name} className={`relative bg-white rounded-2xl border p-8 flex flex-col ${p.recommended ? "border-indigo-400 shadow-xl" : "border-slate-200"}`}>
          {p.recommended && (
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-4 py-1 rounded-full">Recommended</span>
          )}
          <div className="mb-4">
            <p className="text-lg font-bold text-slate-900">{p.name}</p>
            <p className="text-sm text-slate-500">{p.description}</p>
            <p className={`text-3xl font-bold mt-2 ${accentClass}`}>{p.price}</p>
            {p.setup && (
              <p className="text-sm text-slate-500 mt-1">First installation: <span className="font-semibold text-slate-700">{p.setup}</span></p>
            )}
          </div>
          <ul className="space-y-2 flex-1 mb-6">
            {p.features.map(f => (
              <li key={f} className="flex items-center gap-2 text-slate-600 text-sm">
                <Check className="w-4 h-4 text-green-500 shrink-0" />{f}
              </li>
            ))}
          </ul>
          <Link to={createPageUrl("Dashboard")}>
            <Button className={`w-full ${btnClass}`}>Get Started</Button>
          </Link>
        </div>
      ))}
    </div>
  );

  const FeatureGrid = ({ features, iconBg, iconColor }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {features.map(f => {
        const Icon = f.icon;
        return (
          <div key={f.title} className="bg-white rounded-xl p-8 border border-slate-200 hover:shadow-lg transition-shadow">
            <div className={`flex items-center justify-center w-14 h-14 ${iconBg} rounded-lg mb-4`}>
              <Icon className={`w-7 h-7 ${iconColor}`} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">{f.title}</h3>
            <p className="text-slate-600">{f.description}</p>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <PublicNav />

      {/* ── HERO ── */}
      <section id="home" className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-32 pb-24 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Comprehensive Management Solutions for Every Need
          </h1>
          <p className="text-xl sm:text-2xl text-slate-300 mb-10 max-w-3xl mx-auto">
            From church management to business CRM and personal development. Choose the solution that fits you.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a href="#church-crm"><Button size="lg" className="bg-violet-600 hover:bg-violet-700"><Church className="w-5 h-5 mr-2" />Effective CHURCH</Button></a>
            <a href="#business-crm"><Button size="lg" className="bg-blue-600 hover:bg-blue-700"><Briefcase className="w-5 h-5 mr-2" />Effective BUSINESS</Button></a>
            <a href="#effective-living"><Button size="lg" className="bg-emerald-600 hover:bg-emerald-700"><Heart className="w-5 h-5 mr-2" />Effective LIVING</Button></a>
          </div>
        </div>
      </section>

      {/* ── PRODUCTS OVERVIEW ── */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Three Powerful Solutions</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">Each product is designed to meet your specific needs</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Church, title: "Effective CHURCH", desc: "Complete church management solution. Track members, pastoral activities, and finances.", feats: ["Member Management", "Pastoral Care", "Finance & Tithes"], color: "from-violet-50 to-violet-100", btn: "bg-violet-600 hover:bg-violet-700", href: "#church-crm" },
              { icon: Briefcase, title: "Effective BUSINESS", desc: "Powerful CRM for businesses. Manage customers, sales, and marketing effectively.", feats: ["Customer Management", "Sales Pipeline", "Marketing Campaigns"], color: "from-blue-50 to-blue-100", btn: "bg-blue-600 hover:bg-blue-700", href: "#business-crm" },
              { icon: Heart, title: "Effective LIVING", desc: "Personal development app. Manage goals, workouts, and mental health.", feats: ["Goal Tracking", "Workout Plans", "Daily Journaling"], color: "from-emerald-50 to-emerald-100", btn: "bg-emerald-600 hover:bg-emerald-700", href: "#effective-living" },
            ].map(p => {
              const Icon = p.icon;
              return (
                <div key={p.title} className={`bg-gradient-to-br ${p.color} rounded-2xl p-8 border border-slate-200 hover:shadow-xl transition-shadow`}>
                  <div className="flex items-center justify-center w-14 h-14 bg-white rounded-xl mb-6"><Icon className="w-7 h-7 text-slate-900" /></div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">{p.title}</h3>
                  <p className="text-slate-700 mb-6">{p.desc}</p>
                  <ul className="space-y-2 mb-8">
                    {p.feats.map(f => <li key={f} className="flex items-center gap-2 text-slate-700"><Check className="w-5 h-5 text-green-600 shrink-0" />{f}</li>)}
                  </ul>
                  <a href={p.href}><Button className={`w-full ${p.btn}`}>Learn More <ArrowRight className="w-4 h-4 ml-2" /></Button></a>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════ CHURCH CRM ══════════════ */}
      <section id="church-crm" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4"><Church className="w-4 h-4" />Effective CHURCH</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Complete Church Management</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">Everything you need to manage your church</p>
          </div>
          <FeatureGrid features={churchFeatures} iconBg="bg-violet-100" iconColor="text-violet-600" />
          {/* Demo Promotion Banner */}
          <div className="mt-16 bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-xs font-bold px-4 py-1.5 rounded-bl-xl">🔥 LIMITED OFFER</div>
            <div className="max-w-3xl">
              <h3 className="text-2xl font-bold mb-2">Early Adopter Special — First 10 Customers Only</h3>
              <p className="text-violet-100 mb-6">Lock in exclusive pricing before it's gone. This offer will not be repeated.</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white/10 rounded-xl p-4">
                  <p className="text-xs text-violet-200 uppercase font-semibold mb-1">First Installation</p>
                  <p className="text-2xl font-bold"><span className="line-through text-violet-300 text-lg mr-2">$1,000</span>$500 CAD</p>
                  <p className="text-xs text-violet-200 mt-1">One-time setup fee</p>
                </div>
                <div className="bg-white/10 rounded-xl p-4">
                  <p className="text-xs text-violet-200 uppercase font-semibold mb-1">Monthly Billing</p>
                  <p className="text-2xl font-bold">$99 <span className="text-base font-normal">CAD/mo</span></p>
                  <p className="text-xs text-violet-200 mt-1">Flexible monthly plan</p>
                </div>
                <div className="bg-white/10 rounded-xl p-4">
                  <p className="text-xs text-violet-200 uppercase font-semibold mb-1">Annual Billing</p>
                  <p className="text-2xl font-bold">$29 <span className="text-base font-normal">CAD/mo</span></p>
                  <p className="text-xs text-violet-200 mt-1">Billed annually — save 70%</p>
                </div>
              </div>
              <p className="mt-5 text-sm text-violet-100 flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-yellow-400 rounded-full"></span>
                Price locked for your first year — no surprises.
              </p>
              <Link to={createPageUrl("ChurchDashboard")} className="inline-block mt-5">
                <Button className="bg-white text-violet-700 hover:bg-violet-50 font-semibold">Claim This Offer <ArrowRight className="w-4 h-4 ml-2" /></Button>
              </Link>
            </div>
          </div>

          <div className="mt-20">
            <h3 className="text-2xl font-bold text-slate-900 text-center mb-10">Pricing Plans</h3>
            <PlanCards plans={churchPlans} accentClass="text-violet-600" btnClass="bg-violet-600 hover:bg-violet-700" />
          </div>
          <div className="mt-10 text-center">
            <Link to={createPageUrl("ChurchDashboard")}><Button size="lg" className="bg-violet-600 hover:bg-violet-700">Start Effective CHURCH <ArrowRight className="w-5 h-5 ml-2" /></Button></Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════ BUSINESS CRM ════════════ */}
      <section id="business-crm" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4"><Briefcase className="w-4 h-4" />Effective BUSINESS</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Powerful CRM for Businesses</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">Powerful tools to manage sales and marketing</p>
          </div>
          <FeatureGrid features={bizFeatures} iconBg="bg-blue-100" iconColor="text-blue-600" />
          <div className="mt-20">
            <h3 className="text-2xl font-bold text-slate-900 text-center mb-10">Pricing Plans</h3>
            <PlanCards plans={bizPlans} accentClass="text-blue-600" btnClass="bg-blue-600 hover:bg-blue-700" />
          </div>
          <div className="mt-10 text-center">
            <Link to={createPageUrl("Dashboard")}><Button size="lg" className="bg-blue-600 hover:bg-blue-700">Start Effective BUSINESS <ArrowRight className="w-5 h-5 ml-2" /></Button></Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════ EFFECTIVE LIVING ════════ */}
      <section id="effective-living" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4"><Heart className="w-4 h-4" />Effective LIVING</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Personal Development & Wellness</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">All the tools you need to turn goals into reality</p>
          </div>
          <FeatureGrid features={livingFeatures} iconBg="bg-emerald-100" iconColor="text-emerald-600" />
          <div className="mt-20">
            <h3 className="text-2xl font-bold text-slate-900 text-center mb-10">Pricing Plans</h3>
            <PlanCards plans={livingPlans} accentClass="text-emerald-600" btnClass="bg-emerald-600 hover:bg-emerald-700" />
          </div>
          <div className="mt-10 text-center">
            <Link to={createPageUrl("Dashboard")}><Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">Get Started <ArrowRight className="w-5 h-5 ml-2" /></Button></Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════ ABOUT US ════════════════ */}
      <section id="about-us" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">About Us</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">We build tools that help churches, businesses, and individuals achieve great things</p>
          </div>

          {/* Mission */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6">Our Mission</h3>
              <p className="text-lg text-slate-600 mb-6">
                The Effective CRM Suite was established with a clear yet ambitious objective: to enhance efficiency and productivity in real business operations. Our mission is to improve operations management by leveraging advanced technology. We believe that excellent technology does not need to be complex to use or costly. We are dedicated to offering straightforward, robust, and impactful solutions.
              </p>
            </div>
            <div className="bg-slate-100 rounded-xl h-80 overflow-hidden">
              <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop" alt="Team working" className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Values */}
          <div className="mb-20">
            <h3 className="text-2xl font-bold text-slate-900 text-center mb-10">Our Values</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map(v => {
                const Icon = v.icon;
                return (
                  <div key={v.title} className="bg-white rounded-xl p-8 border border-slate-200 text-center hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-center w-14 h-14 bg-indigo-100 rounded-lg mx-auto mb-4"><Icon className="w-7 h-7 text-indigo-600" /></div>
                    <h4 className="text-xl font-bold text-slate-900 mb-3">{v.title}</h4>
                    <p className="text-slate-600">{v.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Team */}
          <div>
            <h3 className="text-2xl font-bold text-slate-900 text-center mb-10">Meet Our Team</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
              {team.map(m => (
                <div key={m.name} className="text-center bg-white rounded-xl overflow-hidden border border-slate-200 hover:shadow-lg transition-shadow">
                  <img src={m.image} alt={m.name} className="w-full h-80 object-cover" />
                  <div className="p-6">
                    <h4 className="text-lg font-bold text-slate-900 mb-1">{m.name}</h4>
                    <p className="text-slate-600">{m.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-slate-900 text-white py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="text-lg font-bold mb-4">Effective CRM Suite</h4>
              <p className="text-slate-400">Comprehensive management solutions for every need</p>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#home" className="hover:text-white transition">Home</a></li>
                <li><a href="#church-crm" className="hover:text-white transition">Effective CHURCH</a></li>
                <li><a href="#business-crm" className="hover:text-white transition">Effective BUSINESS</a></li>
                <li><a href="#effective-living" className="hover:text-white transition">Effective LIVING</a></li>
                <li><a href="#about-us" className="hover:text-white transition">About Us</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">Contact</h4>
              <p className="text-slate-400">Email: jv@effectivecrm.app</p>
              <p className="text-slate-400">Phone: +1 (437) 605 0069</p>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-slate-400">
            <p>&copy; 2026 Effective CRM Suite. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}