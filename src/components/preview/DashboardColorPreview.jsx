import { useState } from "react";
import { ShoppingCart, Ship, AlertTriangle, TrendingUp, Package, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

// ── Mock data ────────────────────────────────────────────────────────────────
const MOCK_ORDERS = [
  { product: "YORK Compressor Oil", supplier: "Zhengzhou Haoxue Air Co.", status: "confirmed", booking: "direct" },
  { product: "Terminal Connectors", supplier: "Wenzhou Mogen Electric", status: "pending", booking: "unbooked" },
  { product: "Laptop Battery", supplier: "Dongguan Mingyiyuan Electronics", status: "received_at_hub", booking: "SHP-001" },
  { product: "Door Brushes", supplier: "Guangzhou AOQUN New Materials", status: "received_at_hub", booking: "SHP-001" },
  { product: "Haier Spareparts", supplier: "Shenzhen Runhengxin Tech", status: "confirmed", booking: "unbooked" },
  { product: "Acrylic Sheet", supplier: "Shenzhen Xintao New Materials", status: "confirmed", booking: "SHP-001" },
];

// ── Theme definitions ────────────────────────────────────────────────────────
const THEMES = [
  {
    id: "current",
    label: "Current (Pastel)",
    description: "All muted pastels — hard to distinguish at a glance",
    stats: [
      { label: "Total Orders", value: 7, sub: "1 pending", icon: ShoppingCart, bg: "bg-indigo-50", text: "text-indigo-600", border: "border-indigo-100" },
      { label: "Active Shipments", value: 1, sub: "1 total", icon: Ship, bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100" },
      { label: "Unbooked Orders", value: 2, sub: "Need assignment", icon: AlertTriangle, bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-100" },
      { label: "Total Value", value: "$3,290", sub: "", icon: TrendingUp, bg: "bg-rose-50", text: "text-rose-600", border: "border-rose-100" },
    ],
    statusBadge: (s) => ({
      pending:         "bg-amber-50 text-amber-700",
      confirmed:       "bg-blue-50 text-blue-700",
      received_at_hub: "bg-teal-50 text-teal-700",
    }[s] || "bg-slate-100 text-slate-500"),
    bookingBadge: (b) => b === "unbooked"
      ? "bg-amber-50 text-amber-600 border border-amber-200"
      : b === "direct"
      ? "text-slate-400 italic"
      : "bg-emerald-50 text-emerald-700 border border-emerald-200",
    alertBg: "bg-amber-50 border-amber-200 text-amber-800",
    cardBg: "bg-white border-slate-200",
    headerBg: "bg-white",
  },
  {
    id: "bold",
    label: "Bold Contrast",
    description: "Solid filled stat cards — instant visual hierarchy",
    stats: [
      { label: "Total Orders", value: 7, sub: "1 pending", icon: ShoppingCart, bg: "bg-indigo-600", text: "text-white", border: "border-indigo-700" },
      { label: "Active Shipments", value: 1, sub: "1 total", icon: Ship, bg: "bg-emerald-600", text: "text-white", border: "border-emerald-700" },
      { label: "Unbooked Orders", value: 2, sub: "Need assignment", icon: AlertTriangle, bg: "bg-orange-500", text: "text-white", border: "border-orange-600" },
      { label: "Total Value", value: "$3,290", sub: "", icon: TrendingUp, bg: "bg-slate-800", text: "text-white", border: "border-slate-900" },
    ],
    statusBadge: (s) => ({
      pending:         "bg-orange-500 text-white font-semibold",
      confirmed:       "bg-blue-600 text-white font-semibold",
      received_at_hub: "bg-teal-600 text-white font-semibold",
    }[s] || "bg-slate-400 text-white"),
    bookingBadge: (b) => b === "unbooked"
      ? "bg-red-500 text-white font-semibold"
      : b === "direct"
      ? "bg-purple-100 text-purple-700 font-medium"
      : "bg-emerald-600 text-white font-semibold",
    alertBg: "bg-orange-500 border-orange-600 text-white",
    cardBg: "bg-white border-slate-200",
    headerBg: "bg-slate-900 text-white",
  },
  {
    id: "traffic",
    label: "Traffic Light",
    description: "Red / Amber / Green — universally understood urgency signals",
    stats: [
      { label: "Total Orders", value: 7, sub: "1 pending", icon: ShoppingCart, bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-200" },
      { label: "Active Shipments", value: 1, sub: "1 total", icon: Ship, bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-200" },
      { label: "Unbooked Orders", value: 2, sub: "Need assignment", icon: AlertTriangle, bg: "bg-red-100", text: "text-red-700", border: "border-red-300" },
      { label: "Total Value", value: "$3,290", sub: "", icon: TrendingUp, bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-200" },
    ],
    statusBadge: (s) => ({
      pending:         "bg-red-100 text-red-700 border border-red-300",
      confirmed:       "bg-amber-100 text-amber-700 border border-amber-300",
      received_at_hub: "bg-green-100 text-green-700 border border-green-300",
    }[s] || "bg-slate-100 text-slate-500"),
    bookingBadge: (b) => b === "unbooked"
      ? "bg-red-100 text-red-700 border border-red-300 font-semibold"
      : b === "direct"
      ? "bg-purple-50 text-purple-600 border border-purple-200"
      : "bg-green-100 text-green-700 border border-green-300 font-semibold",
    alertBg: "bg-red-50 border-red-300 text-red-800",
    cardBg: "bg-white border-slate-200",
    headerBg: "bg-white",
  },
  {
    id: "dark",
    label: "Dark Mode",
    description: "Dark background with vivid accent colors — maximum contrast",
    stats: [
      { label: "Total Orders", value: 7, sub: "1 pending", icon: ShoppingCart, bg: "bg-blue-500/20", text: "text-blue-300", border: "border-blue-500/30" },
      { label: "Active Shipments", value: 1, sub: "1 total", icon: Ship, bg: "bg-emerald-500/20", text: "text-emerald-300", border: "border-emerald-500/30" },
      { label: "Unbooked Orders", value: 2, sub: "Need assignment", icon: AlertTriangle, bg: "bg-orange-500/20", text: "text-orange-300", border: "border-orange-500/30" },
      { label: "Total Value", value: "$3,290", sub: "", icon: TrendingUp, bg: "bg-pink-500/20", text: "text-pink-300", border: "border-pink-500/30" },
    ],
    statusBadge: (s) => ({
      pending:         "bg-orange-500/20 text-orange-300 border border-orange-500/30",
      confirmed:       "bg-blue-500/20 text-blue-300 border border-blue-500/30",
      received_at_hub: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
    }[s] || "bg-white/10 text-white/50"),
    bookingBadge: (b) => b === "unbooked"
      ? "bg-red-500/20 text-red-300 border border-red-500/30 font-semibold"
      : b === "direct"
      ? "text-white/30 italic"
      : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold",
    alertBg: "bg-orange-500/20 border-orange-500/40 text-orange-200",
    cardBg: "bg-slate-700/60 border-slate-600",
    headerBg: "bg-slate-900 text-white",
    dark: true,
  },
];

function StatusLabel(status) {
  return status.replace(/_/g, ' ');
}

function BookingLabel(b) {
  if (b === "unbooked") return "⚠ Not Booked";
  if (b === "direct") return "Direct";
  return `🚢 ${b}`;
}

function ThemePreview({ theme }) {
  const dark = theme.dark;
  const bg = dark ? "bg-slate-800" : "bg-slate-50";
  const textPrimary = dark ? "text-white" : "text-slate-900";
  const textSecondary = dark ? "text-slate-400" : "text-slate-500";
  const divider = dark ? "border-slate-700" : "border-slate-100";

  return (
    <div className={`rounded-xl overflow-hidden border ${dark ? "border-slate-700" : "border-slate-200"} ${bg} p-4 space-y-3`}>
      {/* Stats row */}
      <div className="grid grid-cols-4 gap-2">
        {theme.stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className={`rounded-lg border p-2.5 flex items-start gap-2 ${s.bg} ${s.border}`}>
              <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${s.text}`} />
              <div>
                <p className={`text-xs ${s.text} opacity-80`}>{s.label}</p>
                <p className={`text-lg font-bold leading-tight ${s.text}`}>{s.value}</p>
                {s.sub && <p className={`text-[10px] ${s.text} opacity-60`}>{s.sub}</p>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Alert banner */}
      <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${theme.alertBg}`}>
        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
        <p className="text-xs font-semibold">2 China Hub orders not yet assigned to a shipment</p>
      </div>

      {/* Orders list */}
      <div className={`rounded-lg border ${dark ? "border-slate-700 bg-slate-700/40" : "border-slate-200 bg-white"}`}>
        <div className={`px-3 py-2 border-b ${divider} flex items-center justify-between`}>
          <span className={`text-xs font-semibold ${textPrimary}`}>Active Orders</span>
          <span className={`text-xs ${dark ? "text-blue-400" : "text-indigo-600"}`}>View all →</span>
        </div>
        {MOCK_ORDERS.map((o, i) => (
          <div key={i} className={`px-3 py-2 flex items-center justify-between border-b last:border-0 ${divider}`}>
            <div>
              <p className={`text-xs font-medium ${textPrimary}`}>{o.product}</p>
              <p className={`text-[10px] ${textSecondary}`}>{o.supplier}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${theme.statusBadge(o.status)}`}>
                {StatusLabel(o.status)}
              </span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${theme.bookingBadge(o.booking)}`}>
                {BookingLabel(o.booking)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardColorPreview() {
  const [active, setActive] = useState("bold");

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-8 mt-6">
      <h1 className="text-3xl font-bold text-slate-900 mb-1">Dashboard Color Schemes</h1>
      <p className="text-slate-500 mb-6">The current design uses similar pastels for everything — hard to tell statuses apart at a glance. Pick a clearer alternative below.</p>

      <div className="flex flex-wrap gap-2 mb-6">
        {THEMES.map(t => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all ${
              active === t.id
                ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                : "border-gray-200 bg-white text-slate-600 hover:border-indigo-300"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {THEMES.map(t => (
          <motion.div
            key={t.id}
            onClick={() => setActive(t.id)}
            whileHover={{ scale: 1.01 }}
            className={`cursor-pointer rounded-xl overflow-hidden border-2 transition-all ${
              active === t.id ? "border-indigo-500 shadow-lg" : "border-slate-200"
            }`}
          >
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-slate-800">{t.label}</span>
                {active === t.id && <span className="ml-2 text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-semibold">Selected</span>}
              </div>
              <p className="text-xs text-slate-400 max-w-[200px] text-right">{t.description}</p>
            </div>
            <div className="p-3">
              <ThemePreview theme={t} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 bg-indigo-50 border border-indigo-200 rounded-lg p-4">
        <p className="text-sm font-semibold text-indigo-900">
          Selected: <span className="capitalize">{THEMES.find(t => t.id === active)?.label}</span>
        </p>
        <p className="text-xs text-indigo-700 mt-1">Tell me which color scheme to apply to the live dashboard and I'll implement it immediately.</p>
      </div>
    </div>
  );
}