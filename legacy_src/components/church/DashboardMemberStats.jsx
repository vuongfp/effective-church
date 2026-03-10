import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { useLang } from "@/components/i18n/LanguageContext";

const COLORS = ["#6366f1", "#ec4899", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4"];

export default function DashboardMemberStats({ contacts }) {
  const { lang } = useLang();

  const genderData = [
    { name: lang === "vi" ? "Nam" : lang === "fr" ? "Homme" : "Male", value: contacts.filter(c => c.sex === "M").length },
    { name: lang === "vi" ? "Nữ" : lang === "fr" ? "Femme" : "Female", value: contacts.filter(c => c.sex === "F").length },
    { name: lang === "vi" ? "Chưa rõ" : lang === "fr" ? "N/A" : "Unknown", value: contacts.filter(c => !c.sex).length },
  ].filter(d => d.value > 0);

  const maritalData = [
    { name: lang === "vi" ? "Độc thân" : lang === "fr" ? "Célibataire" : "Single", value: contacts.filter(c => c.marital_status === "Single").length },
    { name: lang === "vi" ? "Đã kết hôn" : lang === "fr" ? "Marié(e)" : "Married", value: contacts.filter(c => c.marital_status === "Married").length },
    { name: lang === "vi" ? "Góa" : lang === "fr" ? "Veuf/Veuve" : "Widowed", value: contacts.filter(c => c.marital_status === "Widowed").length },
    { name: lang === "vi" ? "Ly hôn" : lang === "fr" ? "Divorcé(e)" : "Divorced", value: contacts.filter(c => c.marital_status === "Divorced").length },
  ].filter(d => d.value > 0);

  const title1 = lang === "vi" ? "Giới tính" : lang === "fr" ? "Genre" : "Gender";
  const title2 = lang === "vi" ? "Hôn nhân" : lang === "fr" ? "État civil" : "Marital Status";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-500" /> {title1}
          </CardTitle>
        </CardHeader>
        <CardContent>
           <ResponsiveContainer width="100%" height={220}>
             <PieChart margin={{ top: 10, right: 70, left: 70, bottom: 10 }}>
               <Pie data={genderData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={55}
                 label={({ name, value }) => `${name}: ${value}`} labelLine={true}>
                 {genderData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
               </Pie>
               <Tooltip />
             </PieChart>
           </ResponsiveContainer>
         </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
         <CardHeader className="pb-2">
           <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
             <Users className="w-4 h-4 text-violet-500" /> {title2}
           </CardTitle>
         </CardHeader>
         <CardContent>
           <ResponsiveContainer width="100%" height={220}>
             <PieChart margin={{ top: 10, right: 70, left: 70, bottom: 10 }}>
               <Pie data={maritalData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={55}
                 label={({ name, value }) => `${name}: ${value}`} labelLine={true}>
                 {maritalData.map((_, i) => <Cell key={i} fill={COLORS[(i + 2) % COLORS.length]} />)}
               </Pie>
               <Tooltip />
             </PieChart>
           </ResponsiveContainer>
         </CardContent>
      </Card>
    </div>
  );
}