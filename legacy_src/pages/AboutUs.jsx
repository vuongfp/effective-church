import React from "react";
import PublicHeader from "@/components/public/PublicHeader";
import { Button } from "@/components/ui/button";
import { Zap, Users, Heart, Target } from "lucide-react";

export default function AboutUs() {
  const values = [
    {
      icon: Zap,
      title: "Simple & Powerful",
      description: "Complex technology doesn't have to be hard to use. We believe in simplicity.",
    },
    {
      icon: Users,
      title: "User-Focused",
      description: "Our products are designed with direct input from real users.",
    },
    {
      icon: Heart,
      title: "Impact-Driven",
      description: "We build tools that help improve lives and businesses.",
    },
    {
      icon: Target,
      title: "Always Improving",
      description: "Development never stops. We continuously improve based on feedback.",
    },
  ];

  const team = [
    {
      name: "Jackie Vuong",
      role: "Co‑founder & CEO",
      image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/699e4c6f10d75a58d927dbdd/10278968f_jackie.jpg",
    },
    {
      name: "Vuong Le",
      role: "Co‑founder & CTO",
      image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/699e4c6f10d75a58d927dbdd/10d1a4b27_VuongLe.png",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 py-16 sm:py-24 text-white pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">About Us</h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            We build tools that help churches, businesses, and individuals achieve great things
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-slate-600 mb-6">
                The Effective CRM Suite was established with a clear yet ambitious objective: to enhance efficiency and productivity in real business operations. Our mission is to improve operations management by leveraging advanced technology. We believe that excellent technology does not need to be complex to use or costly. We are dedicated to offering straightforward, robust, and impactful solutions.
              </p>
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                Learn Our Story
              </Button>
            </div>
            <div className="bg-slate-100 rounded-xl h-96 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop"
                alt="Team working"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 sm:py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Our Values
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              The principles that guide every decision we make
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => {
              const IconComponent = value.icon;
              return (
                <div
                  key={value.title}
                  className="bg-white rounded-xl p-8 border border-slate-200 text-center hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center justify-center w-14 h-14 bg-indigo-100 rounded-lg mx-auto mb-4">
                    <IconComponent className="w-7 h-7 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    {value.title}
                  </h3>
                  <p className="text-slate-600">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Meet Our Team
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              The talented people behind Effective CRM Suite
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {team.map((member) => (
              <div
                key={member.name}
                className="text-center bg-white rounded-xl overflow-hidden border border-slate-200 hover:shadow-lg transition-shadow"
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-80 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-1">
                    {member.name}
                  </h3>
                  <p className="text-slate-600">{member.role}</p>
                </div>
              </div>
            ))}
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