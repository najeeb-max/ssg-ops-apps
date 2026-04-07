import { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { base44 } from "@/api/base44Client";
import { Package, Ship, Clock, CheckCircle2, Truck, ChevronDown, Lock, AlertCircle, RefreshCw, AlertTriangle, Box, Shield, Plane, Train, Zap } from "lucide-react";
import { getTransportIcon } from "@/lib/transportIcons";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

// Agent-owned statuses (can be changed by agent via portal)
// SSG-owned statuses (read-only for agent: pending, confirmed, in_transit, delivered)
const STATUSES = [
  { value: "pending",           label: "Pending",              color: "bg-amber-100 text-amber-700",    icon: Clock,         agentOwned: false },
  { value: "confirmed",         label: "Confirmed",            color: "bg-blue-100 text-blue-700",      icon: CheckCircle2,  agentOwned: false },
  { value: "dispatched_to_hub", label: "Dispatched to Hub",   color: "bg-orange-100 text-orange-700",  icon: Truck,         agentOwned: true  },
  { value: "received_at_hub",   label: "Received at Hub",     color: "bg-teal-100 text-teal-700",      icon: Package,       agentOwned: true  },
  { value: "in_transit",        label: "In Transit to Qatar", color: "bg-indigo-100 text-indigo-700",  icon: Ship,          agentOwned: false },
  { value: "delivered",         label: "Delivered",            color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2, agentOwned: false },
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
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
  const btnRef = useRef(null);

  const currentStatus = STATUSES.find(s => s.value === current);
  const isAgentOwned = currentStatus?.agentOwned ?? false;
  const agentStatuses = STATUSES.filter(s => s.agentOwned);

  async function handleSelect(newStatus) {
    if (newStatus === current) { setOpen(false); return; }
    setLoading(true);
    setOpen(false);
    await onUpdate(orderId, newStatus);
    setLoading(false);
  }

  function handleOpen() {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setMenuPos({
        top: rect.bottom + 4,
        right: window.innerWidth - rect.right,
      });
    }
    setOpen(v => !v);
  }

  if (!isAgentOwned) {
    return (
      <div className="flex items-center gap-1 text-xs font-medium text-slate-400 bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5">
        <Lock className="w-3 h-3" />
        <span>SSG</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={handleOpen}
        disabled={disabled || loading}
        className="flex items-center gap-1.5 text-xs font-semibold bg-white border border-orange-300 hover:border-orange-400 text-orange-700 rounded-lg px-3 py-1.5 transition-colors shadow-sm disabled:opacity-50"
      >
        {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <>
          <span>Update</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
        </>}
      </button>
      <AnimatePresence>
        {open && typeof document !== 'undefined' && ReactDOM.createPortal(
          <>
            <div className="fixed inset-0 z-[9998]" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.12 }}
              style={{ top: menuPos.top, right: menuPos.right }}
              className="fixed bg-white border border-slate-200 rounded-xl shadow-xl z-[9999] w-64 py-2 overflow-hidden"
            >
              <p className="text-[10px] font-bold text-slate-400 uppercase px-3 pb-1.5">Your Actions</p>
              {agentStatuses.map(s => {
                const Icon = s.icon;
                const isActive = s.value === current;
                return (
                  <button
                    key={s.value}
                    onClick={() => handleSelect(s.value)}
                    className={`w-full flex items-start gap-2.5 px-3 py-2 text-xs hover:bg-orange-50 transition-colors text-left ${isActive ? 'bg-orange-50' : ''}`}
                  >
                    <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full flex-shrink-0 mt-0.5 ${s.color}`}>
                      <Icon className="w-2.5 h-2.5" />
                    </span>
                    <div>
                      <p className={`font-semibold ${isActive ? 'text-orange-700' : 'text-slate-700'}`}>{s.label}</p>
                      <p className="text-slate-400 text-[10px] leading-snug">{
                        s.value === 'dispatched_to_hub' ? 'Supplier sent it — on the way to hub' :
                        s.value === 'received_at_hub'   ? 'Goods arrived & checked in at hub' : ''
                      }</p>
                    </div>
                    {isActive && <span className="ml-auto text-orange-400 text-[10px] font-bold flex-shrink-0">✓ current</span>}
                  </button>
                );
              })}
            </motion.div>
          </>,
          document.body
        )}
      </AnimatePresence>
    </div>
  );
}

const shipmentStatusColors = {
  preparing:  'bg-slate-100 text-slate-600',
  booked:     'bg-blue-100 text-blue-700',
  in_transit: 'bg-indigo-100 text-indigo-700',
  customs:    'bg-amber-100 text-amber-700',
  delivered:  'bg-emerald-100 text-emerald-700',
  cancelled:  'bg-red-100 text-red-600',
};

function ShipmentTag({ order }) {
  if (order.shipment_number) {
    return (
      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 px-2.5 py-1 rounded-full">
          <Ship className="w-3 h-3" /> {order.shipment_number}
        </span>
        {order.shipment_status && (
          <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full capitalize ${shipmentStatusColors[order.shipment_status] || 'bg-slate-100 text-slate-600'}`}>
            {order.shipment_status.replace(/_/g, ' ')}
          </span>
        )}
        {order.shipment_carrier && (
          <span className="text-xs text-slate-400">{order.shipment_carrier}</span>
        )}
        {order.shipment_arrival_date && (
          <span className="text-xs text-slate-400">ETA: {order.shipment_arrival_date}</span>
        )}
      </div>
    );
  }
  return (
    <div className="mt-1.5">
      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
        <AlertTriangle className="w-3 h-3" /> Not yet assigned to a shipment
      </span>
    </div>
  );
}

const shipmentGroupColors = [
  { header: 'bg-indigo-600', border: 'border-indigo-200', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { header: 'bg-emerald-600', border: 'border-emerald-200', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { header: 'bg-rose-600', border: 'border-rose-200', badge: 'bg-rose-50 text-rose-700 border-rose-200' },
  { header: 'bg-amber-600', border: 'border-amber-200', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  { header: 'bg-fuchsia-600', border: 'border-fuchsia-200', badge: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200' },
  { header: 'bg-cyan-600', border: 'border-cyan-200', badge: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  { header: 'bg-orange-600', border: 'border-orange-200', badge: 'bg-orange-50 text-orange-700 border-orange-200' },
  { header: 'bg-violet-600', border: 'border-violet-200', badge: 'bg-violet-50 text-violet-700 border-violet-200' },
];

let _colorIndex = 0;
const _shipmentColorAssigned = {};
function getGroupColor(shipmentId) {
  if (!_shipmentColorAssigned[shipmentId]) {
    _shipmentColorAssigned[shipmentId] = shipmentGroupColors[_colorIndex % shipmentGroupColors.length];
    _colorIndex++;
  }
  return _shipmentColorAssigned[shipmentId];
}

function ShipmentGroup({ group, onUpdate }) {
  const [collapsed, setCollapsed] = useState(false);
  const color = getGroupColor(group.shipmentId);
  const totalKg = group.orders.reduce((s, o) => s + (o.weight_kgs || 0), 0);
  const totalCartons = group.orders.reduce((s, o) => s + (o.num_cartons || 0), 0);
  const TransportIcon = getTransportIcon(group.transportMode);

  return (
    <div className={`rounded-xl border-2 overflow-hidden ${color.border}`}>
      {/* Shipment header */}
      <button
        className={`w-full flex items-center justify-between px-4 py-3 text-white ${color.header} hover:opacity-95 transition-opacity`}
        onClick={() => setCollapsed(v => !v)}
      >
        <div className="flex items-center gap-3">
          <TransportIcon className="w-5 h-5 text-white/80 flex-shrink-0" />
          <div className="text-left">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-base">{group.shipmentNumber}</span>
              {group.shipmentStatus && (
                <span className="text-xs font-semibold bg-white/20 px-2 py-0.5 rounded-full capitalize">
                  {group.shipmentStatus.replace(/_/g, ' ')}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-0.5 text-white/70 text-xs flex-wrap">
              {group.shipmentCarrier && <span>{group.shipmentCarrier}</span>}
              {group.shipmentArrivalDate && <span>ETA: {group.shipmentArrivalDate}</span>}
              <span className="flex items-center gap-1"><Box className="w-3 h-3" />{group.orders.length} order{group.orders.length !== 1 ? 's' : ''}</span>
              {totalKg > 0 && <span>{totalKg.toFixed(1)} kg</span>}
              {totalCartons > 0 && <span>{totalCartons} ctn</span>}
            </div>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-white/70 transition-transform flex-shrink-0 ${collapsed ? '-rotate-90' : ''}`} />
      </button>

      {/* Orders inside shipment */}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="divide-y divide-slate-100 bg-white">
              {group.orders.map((order, idx) => (
                <OrderCard key={order.id} order={order} onUpdate={onUpdate} hideShipmentTag insideGroup groupColor={color} orderIndex={idx + 1} totalInGroup={group.orders.length} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function OrderCard({ order, onUpdate, hideShipmentTag, insideGroup, groupColor, orderIndex, totalInGroup }) {
  const [expanded, setExpanded] = useState(false);

  const cardBorder = insideGroup ? 'border-0' : (order.shipment_number ? 'border border-slate-200 rounded-xl' : 'border border-amber-200 rounded-xl');

  return (
    <div className={`bg-white overflow-hidden hover:bg-slate-50/60 transition-colors ${cardBorder}`}>
      <div className="px-4 py-3 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          {insideGroup ? (
            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold text-white/90"
              style={{ background: 'rgba(0,0,0,0.12)' }}>
              {orderIndex}
            </div>
          ) : (
            <div className={`w-9 h-9 rounded-lg border flex items-center justify-center flex-shrink-0 mt-0.5 ${order.shipment_number ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'}`}>
              {order.shipment_number
                ? <Ship className="w-4 h-4 text-emerald-600" />
                : <Package className="w-4 h-4 text-amber-500" />}
            </div>
          )}
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
            {!hideShipmentTag && <ShipmentTag order={order} />}
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
  const [adminBypass, setAdminBypass] = useState(false);

  async function fetchOrders(bypassToken) {
    setLoading(true);
    setError(null);
    const useToken = bypassToken || token;
    const res = await base44.functions.invoke('chinaAgentPortal', { action: 'getOrders', token: useToken });
    if (res.data.error) throw new Error(res.data.error);
    setOrders(res.data.orders || []);
    setLastRefresh(new Date());
    setLoading(false);
  }

  useEffect(() => {
    if (token) {
      fetchOrders().catch(err => {
        setError(err.message || 'Access denied');
        setLoading(false);
      });
      return;
    }
    // No token — check if admin user is logged in (preview/dev access)
    base44.auth.me().then(user => {
      if (user?.role === 'admin') {
        // Admin: fetch their own saved tokens and use the first one
        const savedTokens = user?.data?.china_agent_tokens || [];
        if (savedTokens.length > 0) {
          setAdminBypass(true);
          fetchOrders(savedTokens[0]).catch(err => {
            setError(err.message || 'Failed to load');
            setLoading(false);
          });
        } else {
          setLoading(false);
          setError('no_token');
        }
      } else {
        setLoading(false);
        setError('no_token');
      }
    }).catch(() => {
      setLoading(false);
      setError('no_token');
    });
  }, [token]);

  async function handleUpdate(orderId, newStatus) {
    const useToken = token || (await base44.auth.me().then(u => u?.data?.china_agent_tokens?.[0]).catch(() => null));
    const res = await base44.functions.invoke('chinaAgentPortal', { action: 'updateStatus', token: useToken, orderId, status: newStatus });
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
    dispatched: orders.filter(o => o.status === 'dispatched_to_hub').length,
    atHub: orders.filter(o => o.status === 'received_at_hub').length,
    inTransit: orders.filter(o => o.status === 'in_transit').length,
    notBooked: orders.filter(o => !o.shipment_id && o.status !== 'delivered').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  };

  // Group orders by shipment
  const groupedByShipment = orders.reduce((acc, order) => {
    if (!order.shipment_id) {
      acc.__unbooked = acc.__unbooked || [];
      acc.__unbooked.push(order);
    } else {
      acc[order.shipment_id] = acc[order.shipment_id] || [];
      acc[order.shipment_id].push(order);
    }
    return acc;
  }, {});

  // Build shipment groups sorted: active shipments first, then delivered/cancelled, unbooked last
  const shipmentGroups = Object.entries(groupedByShipment)
    .filter(([key]) => key !== '__unbooked')
    .map(([shipmentId, shipmentOrders]) => {
      const first = shipmentOrders[0];
      return {
        shipmentId,
        shipmentNumber: first.shipment_number,
        shipmentStatus: first.shipment_status,
        shipmentCarrier: first.shipment_carrier,
        shipmentArrivalDate: first.shipment_arrival_date,
        transportMode: first.shipment_transport_mode,
        orders: shipmentOrders,
        isDone: first.shipment_status === 'delivered' || first.shipment_status === 'cancelled',
      };
    })
    .sort((a, b) => {
      if (a.isDone !== b.isDone) return a.isDone ? 1 : -1;
      return (a.shipmentNumber || '').localeCompare(b.shipmentNumber || '');
    });

  const unbookedOrders = groupedByShipment.__unbooked || [];

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
              onClick={() => fetchOrders(token || undefined).catch(err => toast.error(err.message))}
              className="flex items-center gap-1.5 text-xs text-indigo-200 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "Total", value: stats.total, bg: "bg-white/10" },
              { label: "Dispatched", value: stats.dispatched, bg: "bg-orange-400/20" },
              { label: "At Hub", value: stats.atHub, bg: "bg-teal-400/20" },
              { label: "Delivered", value: stats.delivered, bg: "bg-emerald-400/20" },
            ].map(s => (
              <div key={s.label} className={`${s.bg} rounded-xl px-3 py-2 text-center`}>
                <p className="text-xl font-bold">{s.value}</p>
                <p className="text-indigo-200 text-[11px]">{s.label}</p>
              </div>
            ))}
          </div>
          {/* Booking status summary bar */}
          <div className="mt-3 flex items-center justify-between bg-white/10 rounded-xl px-3 py-2">
            <div className="flex items-center gap-2">
              <Ship className="w-4 h-4 text-emerald-300" />
              <span className="text-sm font-semibold text-white">{orders.length - stats.notBooked} booked</span>
              <span className="text-indigo-300 text-xs">into shipments</span>
            </div>
            {stats.notBooked > 0 && (
              <div className="flex items-center gap-1.5 bg-amber-400/30 border border-amber-300/30 rounded-lg px-2.5 py-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
                <span className="text-sm font-bold text-amber-200">{stats.notBooked} unbooked</span>
              </div>
            )}
            {stats.notBooked === 0 && (
              <span className="text-xs text-emerald-300 font-medium">✓ All booked</span>
            )}
          </div>

          {adminBypass && (
            <div className="mt-3 flex items-center gap-2 bg-yellow-400/20 border border-yellow-300/30 rounded-lg px-3 py-2 text-xs text-yellow-200">
              <Shield className="w-3.5 h-3.5 flex-shrink-0" />
              <span><strong>Admin Preview:</strong> You're viewing this as an admin using your first saved agent token. Agents access this via their secret link.</span>
            </div>
          )}
          {lastRefresh && (
            <p className="text-indigo-300 text-[11px] mt-2 text-right">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>

      {/* Orders grouped by shipment */}
      <div className="max-w-3xl mx-auto px-4 py-5 space-y-5">

        {orders.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No China Hub orders at the moment.</p>
          </div>
        )}

        {/* Active shipment groups */}
        {shipmentGroups.map(group => (
          <ShipmentGroup key={group.shipmentId} group={group} onUpdate={handleUpdate} />
        ))}

        {/* Unbooked orders */}
        {unbookedOrders.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2 px-1">
              <div className="flex items-center gap-1.5 bg-amber-100 border border-amber-200 rounded-lg px-3 py-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-bold text-amber-700">Awaiting Shipment Booking</span>
                <span className="bg-amber-200 text-amber-800 text-xs font-bold px-1.5 py-0.5 rounded-full ml-1">{unbookedOrders.length}</span>
              </div>
              <p className="text-xs text-slate-400">Not yet assigned to any shipment</p>
            </div>
            <div className="border-2 border-dashed border-amber-200 rounded-xl p-1 space-y-1.5 bg-amber-50/40">
              {unbookedOrders.map(order => (
                <OrderCard key={order.id} order={order} onUpdate={handleUpdate} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center py-6 text-xs text-slate-400">
        SSG International Trading · China Hub Agent Portal
      </div>
    </div>
  );
}