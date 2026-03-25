import { FileText, CheckCircle2, Clock, TrendingUp } from "lucide-react";

const stats = [
  { label: "Total Sheets", key: "total", icon: FileText, color: "bg-slate-100 text-slate-600" },
  { label: "Completed", key: "completed", icon: CheckCircle2, color: "bg-emerald-50 text-emerald-600" },
  { label: "In Progress", key: "in_progress", icon: Clock, color: "bg-amber-50 text-amber-600" },
  { label: "Awarded", key: "awarded", icon: TrendingUp, color: "bg-violet-50 text-violet-600" },
];

export default function PcsStatsGrid({ sheets }) {
  const counts = {
    total: sheets.length,
    completed: sheets.filter(s => s.status === "completed").length,
    in_progress: sheets.filter(s => s.status === "in_progress").length,
    awarded: sheets.filter(s => s.status === "awarded").length,
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => (
        <div key={stat.key} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${stat.color}`}>
            <stat.icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{counts[stat.key]}</p>
            <p className="text-xs text-slate-500">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}