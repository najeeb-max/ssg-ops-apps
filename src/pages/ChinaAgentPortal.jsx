import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Package, Ship, Clock, CheckCircle2, Truck, ChevronDown, Lock, AlertCircle, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const STATUSES = [
  { value: "pending",          label: "Pending",          color: "bg-amber-100 text-amber-700",   icon: Clock },
  { value: "confirmed",        label: "Confirmed",         color: "bg-blue-100 text-blue-700",     icon: CheckCircle2 },
  { value: "received_at_hub",  label: "Received at Hub",   color: "bg-teal-100 text-teal-700",     icon: Package },
  { value: "in_transit",       label: "In Transit",        color: "bg-indigo-100 text-indigo-700", icon: Truck },
  { value: "delivered",        label: "Delivered",         color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
];

function getStatusMeta(value) {
  return STATUSES.find(s => s.value === value) || STATUSES[0];
}

function StatusBadge({ status }) {
  const s = getStatusMeta(status);
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.color}`}>
      <Icon className="w-3 h-3" /> {s.label}
    </span>
  );
}

function StatusDropdown({ orderId, current, onUpdate, disabled }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSelect(newStatus) {
    if (newStatus === current) { setOpen(false); return; }
    setLoading(true);
    setOpen(false);
    await onUpdate(orderId, newStatus);
    setLoading(false);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        disabled={disabled || loading}
        className="flex items-center gap-1.5 text-xs font-semibold bg-white border border-slate-200 hover:border-indigo-400 rounded-lg px-3 py-1.5 transition-colors shadow-sm disabled:opacity-50"
      >
        {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-400" /> : <>
          <span className="text-slate-600">Update</span>
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </>}
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.12 }}
              className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-20 w-52 py-1 overflow-hidden"
            >
              {STATUSES.map(s => {
                const Icon = s.icon;
                const isActive = s.value === current;
                return (
                  <button
                    key={s.value}
                    onClick={() => handleSelect(s.value)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs hover:bg-slate-50 transition-colors text-left ${isActive ? 'bg-indigo-50' : ''}`}
                  >
                    <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full ${s.color}`}>
                      <Icon className="w-2.5 h-2.5" />
                    </span>
                    <span className={`font-medium ${isActive ? 'text-indigo-700' : 'text-slate-700'}`}>{s.label}</span>
                    {isActive && <span className="ml-auto text-indigo-400 text-[10px]">current</span>}
                  </button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function OrderCard({ order, onUpdate }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
      <div className="px-4 py-3 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Package className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-0.5">
              <span className="font-bold text-slate-900 text-sm">{order.alibaba_order_ref || order.id.slice(-6)}</span>
              <StatusBadge status={order.status} />
            </div>
            <p className="text-sm text-slate-700 font-medium truncate">{order.product_name}</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {order.quantity} {order.unit}
              {order.supplier_name ? ` · ${order.supplier_name}` : ''}
              {order.weight_kgs ? ` · ${order.weight_kgs} kg` : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <StatusDropdown orderId={order.id} current={order.status} onUpdate={onUpdate} />
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
                <p className="text-slate-400 font-medium mb-0.5">Order Ref</p>
                <p className="text-slate-700 font-mono">{order.alibaba_order_ref || '—'}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium mb-0.5">Platform Ref</p>
                <p className="text-slate-700 font-mono">{order.platform_order_ref || '—'}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium mb-0.5">Tracking #</p>
                <p className="text-slate-700 font-mono">{order.domestic_tracking_number || '—'}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium mb-0.5">Est. Delivery</p>
                <p className="text-slate-700">{order.estimated_delivery_date || '—'}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium mb-0.5">Supplier WeChat</p>
                <p className="text-slate-700">{order.supplier_wechat || '—'}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium mb-0.5">Cartons</p>
                <p className="text-slate-700">{order.num_cartons || '—'}</p>
              </div>
              {order.notes && (
                <div className="col-span-2">
                  <p className="text-slate-400 font-medium mb-0.5">Notes</p>
                  <p className="text-slate-700 italic">"{order.notes}"</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ChinaAgentPortal() {
  const token = new URLSearchParams(window.location.search).get('token');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);

  async function fetchOrders() {
    setLoading(true);
    setError(null);
    const res = await base44.functions.invoke('chinaAgentPortal', { action: 'getOrders', token });
    if (res.data.error) throw new Error(res.data.error);
    setOrders(res.data.orders || []);
    setLastRefresh(new Date());
    setLoading(false);
  }

  useEffect(() => {
    if (!token) { setLoading(false); setError('no_token'); return; }
    fetchOrders().catch(err => {
      setError(err.message || 'Access denied');
      setLoading(false);
    });
  }, [token]);

  async function handleUpdate(orderId, newStatus) {
    const res = await base44.functions.invoke('chinaAgentPortal', { action: 'updateStatus', token, orderId, status: newStatus });
    if (res.data.error) {
      toast.error('Update failed: ' + res.data.error);
      return;
    }
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    const label = STATUSES.find(s => s.value === newStatus)?.label;
    toast.success(`Status updated to "${label}"`);
  }

  const stats = {
    total: orders.length,
    atHub: orders.filter(o => o.status === 'received_at_hub').length,
    inTransit: orders.filter(o => o.status === 'in_transit').length,
    pending: orders.filter(o => o.status === 'pending' || o.status === 'confirmed').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  };

  // ── No token ─────────────────────────────────────────────────────────────
  if (!loading && error === 'no_token') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <Lock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-slate-700">Access Token Required</h2>
          <p className="text-sm text-slate-500 mt-2">This portal requires a valid access token. Please use the link provided by SSG.</p>
        </div>
      </div>
    );
  }

  // ── Invalid token ─────────────────────────────────────────────────────────
  if (!loading && error && error !== 'no_token') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <AlertCircle className="w-12 h-12 text-red-300 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-slate-700">Access Denied</h2>
          <p className="text-sm text-slate-500 mt-2">Your access token is invalid or has expired. Please contact SSG for a new link.</p>
        </div>
      </div>
    );
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-700 to-indigo-600 text-white px-4 py-5 shadow-md">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Ship className="w-6 h-6 text-indigo-200" />
              <div>
                <h1 className="font-bold text-lg leading-tight">SSG China Hub</h1>
                <p className="text-indigo-200 text-xs">Order Tracker · Agent Portal</p>
              </div>
            </div>
            <button
              onClick={() => fetchOrders().catch(err => toast.error(err.message))}
              className="flex items-center gap-1.5 text-xs text-indigo-200 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "Total", value: stats.total, bg: "bg-white/10" },
              { label: "At Hub", value: stats.atHub, bg: "bg-amber-400/20" },
              { label: "In Transit", value: stats.inTransit, bg: "bg-blue-400/20" },
              { label: "Delivered", value: stats.delivered, bg: "bg-emerald-400/20" },
            ].map(s => (
              <div key={s.label} className={`${s.bg} rounded-xl px-3 py-2 text-center`}>
                <p className="text-xl font-bold">{s.value}</p>
                <p className="text-indigo-200 text-[11px]">{s.label}</p>
              </div>
            ))}
          </div>

          {lastRefresh && (
            <p className="text-indigo-300 text-[11px] mt-2 text-right">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>

      {/* Orders */}
      <div className="max-w-3xl mx-auto px-4 py-5 space-y-3">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
          {orders.length} China Hub Order{orders.length !== 1 ? 's' : ''} · Tap to expand · Use "Update" to change status
        </p>

        {orders.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No China Hub orders at the moment.</p>
          </div>
        ) : (
          orders.map(order => (
            <OrderCard key={order.id} order={order} onUpdate={handleUpdate} />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="text-center py-6 text-xs text-slate-400">
        SSG International Trading · China Hub Agent Portal
      </div>
    </div>
  );
}