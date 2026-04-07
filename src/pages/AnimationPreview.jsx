import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Plus, CheckCircle2, Clock, Send, Truck, FileText, Award, AlertTriangle, ChevronRight, TrendingUp, Zap, X, Lock, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";

// ── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_SHEETS = [
  { id: "1", pcs_number: "PCS-00007", client_name: "FMM", po_number: "1400093056", rfq_number: "Pressure Relief Valve", date: "Apr 7, 2026", status: "pending_approval", total_selling_value: 2754, providers: 1, quotes_pct: 100, awarded_provider: null, tradeflow_order: null },
  { id: "2", pcs_number: "PCS-00004", client_name: "Darwish Interserve", po_number: "25-4669", rfq_number: "25-3123", date: "Mar 31, 2026", status: "pending_approval", total_selling_value: 7220, providers: 1, quotes_pct: 0, awarded_provider: null, tradeflow_order: null },
  { id: "3", pcs_number: "PCS-00002", client_name: "FMM", po_number: "1400092672", rfq_number: "N1168-3105894", date: "Mar 31, 2026", status: "approved", total_selling_value: 950, providers: 1, quotes_pct: 0, awarded_provider: "Rayleigh Instruments", tradeflow_order: null },
  { id: "4", pcs_number: "PCS-00001", client_name: "University of Doha", po_number: "0000038996", rfq_number: "8605", date: "Mar 31, 2026", status: "in_progress", total_selling_value: 3225, providers: 2, quotes_pct: 50, awarded_provider: null, tradeflow_order: null },
  { id: "5", pcs_number: "PCS-00005", client_name: "Qatar Rail", po_number: "QR-2241", rfq_number: "RF-1190", date: "Apr 1, 2026", status: "awarded", total_selling_value: 14800, providers: 3, quotes_pct: 100, awarded_provider: "Al Mana Trading", tradeflow_order: null },
  { id: "6", pcs_number: "PCS-00006", client_name: "Ooredoo", po_number: "OO-5531", rfq_number: "RFQ-8812", date: "Apr 3, 2026", status: "ordered", total_selling_value: 6500, providers: 2, quotes_pct: 100, awarded_provider: "Gulf Tech Supplies", tradeflow_order: "SSG-0042" },
  { id: "7", pcs_number: "PCS-00003", client_name: "Hamad Medical", po_number: "HMC-3310", rfq_number: "MED-221", date: "Mar 20, 2026", status: "completed", total_selling_value: 22400, providers: 4, quotes_pct: 100, awarded_provider: "MedEquip Int'l", tradeflow_order: "SSG-0038" },
];

// ── Pipeline Config ──────────────────────────────────────────────────────────
const PIPELINE = [
  { key: "in_progress",      label: "Gathering Quotes",           color: "bg-blue-500",    light: "bg-blue-50 border-blue-200",   text: "text-blue-700",   icon: FileText,    desc: "Gathering supplier quotes" },
  { key: "pending_approval", label: "Awaiting Approval", color: "bg-amber-500",   light: "bg-amber-50 border-amber-200", text: "text-amber-700",  icon: Clock,       desc: "Submitted, pending sign-off" },
  { key: "approved",         label: "Approved",          color: "bg-emerald-500", light: "bg-emerald-50 border-emerald-200", text: "text-emerald-700", icon: CheckCircle2, desc: "Approved — select a winner" },
  { key: "awarded",          label: "Awarded",           color: "bg-violet-500",  light: "bg-violet-50 border-violet-200",  text: "text-violet-700", icon: Award,       desc: "Supplier selected — create PO" },
  { key: "ordered",          label: "Ordered / In Trade",color: "bg-indigo-500",  light: "bg-indigo-50 border-indigo-200",  text: "text-indigo-700", icon: Truck,       desc: "Order sent to Tradeflow" },
  { key: "completed",        label: "Completed",         color: "bg-slate-400",   light: "bg-slate-50 border-slate-200",  text: "text-slate-600",  icon: CheckCircle2, desc: "Delivered & closed" },
];

function getStage(key) { return PIPELINE.find(p => p.key === key) || PIPELINE[0]; }

// ── Send to Tradeflow Modal ──────────────────────────────────────────────────
function SendToTradeflowModal({ sheet, onConfirm, onClose }) {
  const [form, setForm] = useState({
    product_name: sheet.rfq_number,
    supplier_name: sheet.awarded_provider || "",
    quantity: "",
    unit_price: sheet.total_selling_value,
    currency: "QAR",
    customer_name: sheet.client_name,
    source_platform: "Other Direct",
    fulfillment_type: "direct_express",
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 text-white">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-base">Send to Tradeflow</h2>
              <p className="text-indigo-200 text-xs">{sheet.pcs_number} · {sheet.client_name}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 text-sm text-indigo-700">
            This will create a new <strong>Tradeflow Order</strong> pre-filled with PCS data, linked back to <strong>{sheet.pcs_number}</strong>, and set the PCS status to <strong>"Ordered"</strong>.
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Product / RFQ Description</label>
              <input value={form.product_name} onChange={e => setForm(f => ({ ...f, product_name: e.target.value }))}
                className="w-full h-9 border border-slate-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Awarded Supplier</label>
              <input value={form.supplier_name} onChange={e => setForm(f => ({ ...f, supplier_name: e.target.value }))}
                className="w-full h-9 border border-slate-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Customer</label>
              <input value={form.customer_name} onChange={e => setForm(f => ({ ...f, customer_name: e.target.value }))}
                className="w-full h-9 border border-slate-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Order Value (QAR)</label>
              <input type="number" value={form.unit_price} onChange={e => setForm(f => ({ ...f, unit_price: e.target.value }))}
                className="w-full h-9 border border-slate-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">
            <Truck className="w-3.5 h-3.5 text-slate-400" />
            Fulfillment type will default to <strong className="text-slate-700 ml-1">Direct Express</strong> — you can change it in Tradeflow after creation.
          </div>
        </div>

        <div className="px-6 pb-6 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5" onClick={() => onConfirm(sheet.id, form)}>
            <Send className="w-3.5 h-3.5" /> Create Order in Tradeflow →
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── PCS Card ─────────────────────────────────────────────────────────────────
function PcsCard({ sheet, onSendToTradeflow, isAdmin }) {
  const stage = getStage(sheet.status);
  const Icon = stage.icon;
  const canSendToTradeflow = sheet.status === "awarded";
  const isLinked = sheet.status === "ordered" && sheet.tradeflow_order;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-xl border ${isLinked ? 'border-indigo-200' : 'border-slate-200'} p-3.5 shadow-sm hover:shadow-md transition-shadow cursor-pointer group`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <span className="font-bold text-slate-800 text-sm">{sheet.pcs_number}</span>
          <p className="text-xs text-slate-500 mt-0.5">{sheet.client_name}</p>
        </div>
        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${stage.light} ${stage.text}`}>
          <Icon className="w-2.5 h-2.5" />
          {stage.label}
        </span>
      </div>

      <p className="text-xs text-slate-400 truncate mb-2">PO: {sheet.po_number} · {sheet.date}</p>

      {/* Progress bar */}
      <div className="w-full h-1 bg-slate-100 rounded-full mb-2">
        <div className={`h-1 rounded-full ${stage.color}`} style={{ width: `${sheet.quotes_pct}%` }} />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400">{sheet.providers} vendor{sheet.providers !== 1 ? 's' : ''}</span>
        <span className="text-xs font-semibold text-slate-700">QAR {Number(sheet.total_selling_value).toLocaleString()}</span>
      </div>

      {sheet.awarded_provider && (
        <div className="mt-2 flex items-center gap-1 text-[11px] text-violet-700 bg-violet-50 border border-violet-100 rounded-lg px-2 py-1">
          <Award className="w-3 h-3" />
          <span className="font-medium truncate">{sheet.awarded_provider}</span>
        </div>
      )}

      {isLinked && (
        <div className="mt-2 flex items-center gap-1 text-[11px] text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-lg px-2 py-1">
          <Truck className="w-3 h-3" />
          <span className="font-medium">Tradeflow: {sheet.tradeflow_order}</span>
        </div>
      )}

      {canSendToTradeflow && (
        isAdmin ? (
          <button
            onClick={(e) => { e.stopPropagation(); onSendToTradeflow(sheet); }}
            className="mt-2.5 w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg py-1.5 transition-colors"
          >
            <Send className="w-3 h-3" /> Send to Tradeflow →
          </button>
        ) : (
          <div className="mt-2.5 w-full flex items-center justify-center gap-1.5 text-xs font-medium text-slate-400 bg-slate-50 border border-slate-200 rounded-lg py-1.5 cursor-not-allowed" title="Admin only">
            <Lock className="w-3 h-3" /> Admin only
          </div>
        )
      )}
    </motion.div>
  );
}

// ── Kanban Column ─────────────────────────────────────────────────────────────
function KanbanColumn({ stage, sheets, onSendToTradeflow, isAdmin }) {
  const Icon = stage.icon;
  return (
    <div className="flex-shrink-0 w-64">
      {/* Column Header */}
      <div className={`rounded-xl border ${stage.light} px-3 py-2.5 mb-3`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-lg ${stage.color} flex items-center justify-center`}>
              <Icon className="w-3.5 h-3.5 text-white" />
            </div>
            <span className={`text-xs font-bold ${stage.text}`}>{stage.label}</span>
          </div>
          <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${stage.color} text-white`}>{sheets.length}</span>
        </div>
        <p className="text-[10px] text-slate-400 mt-1 pl-8">{stage.desc}</p>
      </div>

      {/* Cards */}
      <div className="space-y-2.5 min-h-[120px]">
        <AnimatePresence>
          {sheets.map(sheet => (
            <PcsCard key={sheet.id} sheet={sheet} onSendToTradeflow={onSendToTradeflow} isAdmin={isAdmin} />
          ))}
        </AnimatePresence>
        {sheets.length === 0 && (
          <div className="border-2 border-dashed border-slate-200 rounded-xl h-20 flex items-center justify-center">
            <p className="text-xs text-slate-300">No sheets here</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Preview ──────────────────────────────────────────────────────────────
export default function AnimationPreview() {
  const [sheets, setSheets] = useState(MOCK_SHEETS);
  const [sendModal, setSendModal] = useState(null); // sheet to send
  const [toast, setToast] = useState(null);

  const { data: currentUser } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me(), staleTime: 60_000 });
  const isAdmin = currentUser?.role === 'admin';

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleSendToTradeflow = (sheet) => setSendModal(sheet);

  const handleConfirmSend = (sheetId, formData) => {
    const fakeOrderNum = `SSG-${String(Math.floor(Math.random() * 9000) + 1000)}`;
    setSheets(prev => prev.map(s =>
      s.id === sheetId ? { ...s, status: "ordered", tradeflow_order: fakeOrderNum } : s
    ));
    setSendModal(null);
    showToast(`✅ Order ${fakeOrderNum} created in Tradeflow — PCS updated to "Ordered"`);
  };

  // Stats
  const totalValue = sheets.filter(s => s.status !== "completed").reduce((sum, s) => sum + (s.total_selling_value || 0), 0);
  const awaitingAction = sheets.filter(s => ["approved", "awarded"].includes(s.status)).length;
  const orderedCount = sheets.filter(s => s.status === "ordered").length;
  const completedCount = sheets.filter(s => s.status === "completed").length;

  return (
    <div className="min-h-screen bg-slate-100">
      <Header />

      <div className="pt-24 px-4 md:px-6 pb-10 max-w-[1400px] mx-auto">

        {/* Back */}
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        {/* Preview Banner */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl px-6 py-4 mb-6 flex items-center justify-between shadow-lg">
          <div className="text-white">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-yellow-300" />
              <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider">Design Preview</span>
            </div>
            <h1 className="text-xl font-bold">New PCS Pipeline Dashboard</h1>
            <p className="text-indigo-200 text-sm mt-0.5">Kanban view · Full procurement lifecycle · Tradeflow integration</p>
          </div>
          <div className="hidden md:flex flex-col items-end gap-2 text-xs text-indigo-200">
            <span className="bg-white/10 border border-white/20 rounded-lg px-3 py-1.5">Mock data — click "Send to Tradeflow" on awarded cards</span>
            {isAdmin
              ? <span className="flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 rounded-lg px-3 py-1.5"><Shield className="w-3 h-3" /> You are Admin — Send to Tradeflow enabled</span>
              : <span className="flex items-center gap-1.5 bg-amber-500/20 border border-amber-400/30 text-amber-200 rounded-lg px-3 py-1.5"><Lock className="w-3 h-3" /> Non-admin — Send to Tradeflow is locked</span>
            }
          </div>
        </div>

        {/* Pipeline Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Active Pipeline Value", value: `QAR ${totalValue.toLocaleString()}`, icon: TrendingUp, color: "text-indigo-600", bg: "bg-indigo-50" },
            { label: "Needs Action", value: awaitingAction, sub: "Approved / Awarded", icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50" },
            { label: "Sent to Tradeflow", value: orderedCount, sub: "Orders in progress", icon: Truck, color: "text-indigo-600", bg: "bg-indigo-50" },
            { label: "Completed", value: completedCount, sub: "Closed PCS sheets", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
          ].map(stat => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white rounded-2xl border border-slate-200 px-5 py-4 flex items-center gap-4 shadow-sm">
                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-900">{stat.value}</p>
                  <p className="text-xs text-slate-500 leading-tight">{stat.label}</p>
                  {stat.sub && <p className="text-[10px] text-slate-400">{stat.sub}</p>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Kanban Board */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 overflow-x-auto">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-slate-800">Procurement Pipeline</h2>
              <p className="text-xs text-slate-400 mt-0.5">Full lifecycle from quote to delivery</p>
            </div>
            <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white gap-1.5 text-xs">
              <Plus className="w-3.5 h-3.5" /> New Sheet
            </Button>
          </div>

          {/* Flow arrows */}
          <div className="flex items-center gap-1 mb-4 overflow-x-auto pb-1">
            {PIPELINE.map((stage, i) => (
              <div key={stage.key} className="flex items-center gap-1 flex-shrink-0">
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border ${stage.light} ${stage.text}`}>
                  <div className={`w-2 h-2 rounded-full ${stage.color}`} />
                  {stage.label}
                </div>
                {i < PIPELINE.length - 1 && <ChevronRight className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />}
              </div>
            ))}
          </div>

          {/* Columns */}
          <div className="flex gap-4 overflow-x-auto pb-2" style={{ minWidth: 'max-content' }}>
            {PIPELINE.map(stage => (
              <KanbanColumn
                key={stage.key}
                stage={stage}
                sheets={sheets.filter(s => s.status === stage.key)}
                onSendToTradeflow={handleSendToTradeflow}
                isAdmin={isAdmin}
              />
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 bg-indigo-50 border border-indigo-100 rounded-xl px-5 py-3 flex flex-wrap items-center gap-4 text-xs text-indigo-700">
          <span className="font-bold">Key changes vs current dashboard:</span>
          <span className="flex items-center gap-1"><Award className="w-3 h-3" /> "Awarded" now has a clear next step</span>
          <span className="flex items-center gap-1"><Send className="w-3 h-3" /> One-click send to Tradeflow from awarded cards</span>
          <span className="flex items-center gap-1"><Truck className="w-3 h-3" /> New "Ordered" status tracks active POs</span>
          <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Pipeline value visible at a glance</span>
        </div>
      </div>

      {/* Send to Tradeflow Modal */}
      <AnimatePresence>
        {sendModal && (
          <SendToTradeflowModal
            sheet={sendModal}
            onConfirm={handleConfirmSend}
            onClose={() => setSendModal(null)}
          />
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-sm font-medium px-5 py-3 rounded-xl shadow-2xl z-50 max-w-sm text-center"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}