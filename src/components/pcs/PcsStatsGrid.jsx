import { FileText, CheckCircle2, Clock, TrendingUp, Truck } from "lucide-react";

const stats = [
  { label: "Total Sheets", key: "total", icon: FileText, color: "bg-slate-100 text-slate-600", activeColor: "ring-2 ring-slate-400 bg-slate-50" },
  { label: "In Progress", key: "in_progress", icon: Clock, color: "bg-amber-50 text-amber-600", activeColor: "ring-2 ring-amber-400 bg-amber-50/60" },
  { label: "Awarded", key: "awarded", icon: TrendingUp, color: "bg-violet-50 text-violet-600", activeColor: "ring-2 ring-violet-400 bg-violet-50/60" },
  { label: "Ordered", key: "ordered", icon: Truck, color: "bg-indigo-50 text-indigo-600", activeColor: "ring-2 ring-indigo-400 bg-indigo-50/60" },
  { label: "Completed", key: "completed", icon: CheckCircle2, color: "bg-emerald-50 text-emerald-600", activeColor: "ring-2 ring-emerald-400 bg-emerald-50/60" },
];

export default function PcsStatsGrid({ sheets, activeFilter, onFilter }) {
  const counts = {
    total: sheets.length,
    completed: sheets.filter(s => s.status === "completed").length,
    in_progress: sheets.filter(s => s.status === "in_progress").length,
    awarded: sheets.filter(s => s.status === "awarded").length,
    ordered: sheets.filter(s => s.status === "ordered").length,
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      {stats.map((stat) => {
        const isActive = activeFilter === stat.key;
        return (
          <button
            key={stat.key}
            onClick={() => onFilter(isActive ? null : stat.key)}
            className={`bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3 text-left transition-all hover:shadow-md hover:border-slate-300 cursor-pointer ${isActive ? stat.activeColor : ""}`}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{counts[stat.key]}</p>
              <p className="text-xs text-slate-500">{stat.label}</p>
            </div>
            {isActive && (
              <span className="ml-auto text-xs font-semibold text-slate-400">✕</span>
            )}
          </button>
        );
      })}
    </div>
  );
}