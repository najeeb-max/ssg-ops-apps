import { useState } from "react";
import { Package, Ship, Clock, CheckCircle2, Truck, ChevronDown, Globe, Lock, AlertCircle, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const STATUSES = [
  { value: "pending", label: "Pending", color: "bg-slate-100 text-slate-600", icon: Clock },
  { value: "confirmed", label: "Confirmed", color: "bg-blue-100 text-blue-700", icon: CheckCircle2 },
  { value: "received_at_hub", label: "Received at Hub", color: "bg-amber-100 text-amber-700", icon: Package },
  { value: "in_transit", label: "In Transit", color: "bg-indigo-100 text-indigo-700", icon: Truck },
  { value: "delivered", label: "Delivered", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
];

const MOCK_ORDERS = [
  {
    id: "1",
    alibaba_order_ref: "SSG-2026-0041",
    product_name: "Industrial Hydraulic Valves",
    quantity: 50,
    unit: "PCS",
    supplier_name: "Guangzhou Valve Co.",
    supplier_wechat: "gz_valve_2024",
    status: "received_at_hub",
    domestic_tracking_number: "SF1234567890CN",
    estimated_delivery_date: "2026-04-10",
    notes: "Handle with care — fragile components",
    weight_kgs: 120,
  },
  {
    id: "2",
    alibaba_order_ref: "SSG-2026-0042",
    product_name: "Stainless Steel Flanges 6\"",
    quantity: 200,
    unit: "PCS",
    supplier_name: "Shenzhen Metal Works",
    supplier_wechat: "sz_metalworks",
    status: "confirmed",
    domestic_tracking_number: "YT9876543210CN",
    estimated_delivery_date: "2026-04-18",
    notes: "",
    weight_kgs: 340,
  },
  {
    id: "3",
    alibaba_order_ref: "SSG-2026-0043",
    product_name: "Electric Control Panel",
    quantity: 3,
    unit: "SET",
    supplier_name: "Shanghai Electrics Ltd.",
    supplier_wechat: "sh_elec_ltd",
    status: "pending",
    domestic_tracking_number: "",
    estimated_delivery_date: "2026-04-25",
    notes: "Awaiting supplier confirmation on spec",
    weight_kgs: 85,
  },
  {
    id: "4",
    alibaba_order_ref: "SSG-2026-0039",
    product_name: "HDPE Pipes 110mm × 6m",
    quantity: 500,
    unit: "PCS",
    supplier_name: "Ningbo Plastics Co.",
    supplier_wechat: "nb_plastics",
    status: "in_transit",
    domestic_tracking_number: "JD0011223344CN",
    estimated_delivery_date: "2026-04-05",
    notes: "Loaded — en route to SSG hub",
    weight_kgs: 750,
  },
];

function StatusBadge({ status }) {
  const s = STATUSES.find(x => x.value === status) || STATUSES[0];
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.color}`}>
      <Icon className="w-3 h-3" />
      {s.label}
    </span>
  );
}

function StatusDropdown({ orderId, current, onChange }) {
  const [open, setOpen] = useState(false);
  const current_s = STATUSES.find(x => x.value === current) || STATUSES[0];
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 text-xs font-semibold bg-white border border-slate-200 hover:border-indigo-400 rounded-lg px-3 py-1.5 transition-colors shadow-sm"
      >
        <span className="text-slate-600">Update Status</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-10 w-52 py-1 overflow-hidden"
          >
            {STATUSES.map(s => {
              const Icon = s.icon;
              return (
                <button
                  key={s.value}
                  onClick={() => { onChange(orderId, s.value); setOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs hover:bg-slate-50 transition-colors text-left ${s.value === current ? 'bg-indigo-50' : ''}`}
                >
                  <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full ${s.color}`}>
                    <Icon className="w-2.5 h-2.5" />
                  </span>
                  <span className={`font-medium ${s.value === current ? 'text-indigo-700' : 'text-slate-700'}`}>{s.label}</span>
                  {s.value === current && <span className="ml-auto text-indigo-400 text-[10px]">current</span>}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function OrderCard({ order, onStatusChange }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
      <div className="px-4 py-3 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Package className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="font-bold text-slate-900 text-sm">{order.alibaba_order_ref}</span>
              <StatusBadge status={order.status} />
            </div>
            <p className="text-sm text-slate-700 font-medium truncate">{order.product_name}</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {order.quantity} {order.unit} · {order.supplier_name}
              {order.weight_kgs ? ` · ${order.weight_kgs} kg` : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <StatusDropdown orderId={order.id} current={order.status} onChange={onStatusChange} />
          <button onClick={() => setExpanded(v => !v)} className="text-slate-400 hover:text-slate-600 p-1">
            <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-slate-100 px-4 py-3 bg-slate-50 grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-slate-400 font-medium">Tracking #</p>
                <p className="text-slate-700 font-mono mt-0.5">{order.domestic_tracking_number || '—'}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Est. Delivery</p>
                <p className="text-slate-700 mt-0.5">{order.estimated_delivery_date || '—'}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Supplier WeChat</p>
                <p className="text-slate-700 mt-0.5">{order.supplier_wechat || '—'}</p>
              </div>
              {order.notes && (
                <div className="col-span-2">
                  <p className="text-slate-400 font-medium">Notes</p>
                  <p className="text-slate-700 mt-0.5 italic">"{order.notes}"</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function HiddenCard({ label }) {
  return (
    <div className="bg-slate-100 border border-dashed border-slate-300 rounded-xl px-4 py-3 flex items-center gap-3 opacity-60">
      <EyeOff className="w-4 h-4 text-slate-400" />
      <span className="text-xs text-slate-400 italic">{label} — not visible to agent</span>
    </div>
  );
}

export default function ChinaAgentPortalPreview() {
  const [orders, setOrders] = useState(MOCK_ORDERS);
  const [toast, setToast] = useState(null);

  function handleStatusChange(orderId, newStatus) {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    const label = STATUSES.find(s => s.value === newStatus)?.label;
    setToast(`Status updated to "${label}"`);
    setTimeout(() => setToast(null), 2500);
  }

  const stats = {
    total: orders.length,
    atHub: orders.filter(o => o.status === 'received_at_hub').length,
    inTransit: orders.filter(o => o.status === 'in_transit').length,
    pending: orders.filter(o => o.status === 'pending' || o.status === 'confirmed').length,
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-8 mt-6">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">China Agent Portal</h1>
          <p className="text-slate-500">Interactive mockup of what your China agent would see via a secret link.</p>
        </div>
        <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
          <Globe className="w-3.5 h-3.5" /> Option A Preview
        </span>
      </div>

      {/* How it works */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-6 flex items-start gap-3">
        <Lock className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-indigo-800">
          <span className="font-semibold">How it works:</span> You generate a secret link like{" "}
          <code className="bg-indigo-100 px-1.5 py-0.5 rounded text-xs font-mono">ssgops.com/china-agent?token=xK9mP2qR</code>
          {" "}and share it with your agent. No login needed. The token is validated on the backend — they only ever see China Hub orders.
        </div>
      </div>

      {/* Simulated Portal */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
        {/* Portal Header */}
        <div className="bg-gradient-to-r from-indigo-700 to-indigo-600 px-5 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Ship className="w-6 h-6 text-indigo-200" />
              <div>
                <h2 className="font-bold text-lg">SSG China Hub — Order Tracker</h2>
                <p className="text-indigo-200 text-xs">China Agent View · Read & Update Access</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-indigo-200 text-xs">Secured via token</p>
              <p className="text-white text-xs font-mono opacity-60">●●●●●●●●</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3 mt-4">
            {[
              { label: "Total Orders", value: stats.total, color: "bg-white/10" },
              { label: "At Hub", value: stats.atHub, color: "bg-amber-400/20" },
              { label: "In Transit", value: stats.inTransit, color: "bg-blue-400/20" },
              { label: "Pending", value: stats.pending, color: "bg-slate-400/20" },
            ].map(s => (
              <div key={s.label} className={`${s.color} rounded-lg px-3 py-2 text-center`}>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-indigo-200 text-[11px]">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Orders list */}
        <div className="p-4 space-y-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">China Hub Orders — Click to expand · Use dropdown to update status</p>
          {orders.map(order => (
            <OrderCard key={order.id} order={order} onStatusChange={handleStatusChange} />
          ))}
        </div>

        {/* What they CANNOT see */}
        <div className="px-4 pb-4 space-y-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Hidden from Agent</p>
          <HiddenCard label="Direct Express orders" />
          <HiddenCard label="Customer names & financial details" />
          <HiddenCard label="PCS / Price Comparison Sheets" />
          <HiddenCard label="Other team member data" />
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-sm px-5 py-2.5 rounded-full shadow-xl z-50"
          >
            ✅ {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* CTA */}
      <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
        <p className="text-sm font-semibold text-emerald-900">Like this? Say "implement the China Agent portal (Option A)" to build it for real.</p>
        <p className="text-xs text-emerald-700 mt-1">
          Real implementation will: generate a secure token, create a backend function that validates it and returns only China Hub orders, and build this portal as a live page.
        </p>
      </div>
    </div>
  );
}