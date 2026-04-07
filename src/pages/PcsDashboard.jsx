import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Header from "../components/Header";
import {
  Plus, Search, X, ArrowLeft, ShieldOff, FileText, Clock, CheckCircle2,
  Award, Truck, ChevronRight, TrendingUp, AlertTriangle, Send, Lock, Shield
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

// ── Pipeline stages ───────────────────────────────────────────────────────────
const PIPELINE = [
  { key: "in_progress",      label: "Gathering Quotes",   color: "bg-blue-500",    light: "bg-blue-50 border-blue-200",      text: "text-blue-700",    icon: FileText,     desc: "Gathering supplier quotes" },
  { key: "pending_approval", label: "Awaiting Approval",  color: "bg-amber-500",   light: "bg-amber-50 border-amber-200",    text: "text-amber-700",   icon: Clock,        desc: "Submitted, pending sign-off" },
  { key: "approved",         label: "Approved",           color: "bg-emerald-500", light: "bg-emerald-50 border-emerald-200",text: "text-emerald-700", icon: CheckCircle2, desc: "Approved — select a winner" },
  { key: "awarded",          label: "Awarded",            color: "bg-violet-500",  light: "bg-violet-50 border-violet-200",  text: "text-violet-700",  icon: Award,        desc: "Supplier selected — create PO" },
  { key: "ordered",          label: "Ordered / In Trade", color: "bg-indigo-500",  light: "bg-indigo-50 border-indigo-200",  text: "text-indigo-700",  icon: Truck,        desc: "Order sent to Tradeflow" },
  { key: "completed",        label: "Completed",          color: "bg-slate-400",   light: "bg-slate-50 border-slate-200",   text: "text-slate-600",   icon: CheckCircle2, desc: "Delivered & closed" },
];

function getStage(key) { return PIPELINE.find(p => p.key === key) || PIPELINE[0]; }

// ── Send to Tradeflow Modal ───────────────────────────────────────────────────
function SendToTradeflowModal({ sheet, onConfirm, onClose, loading }) {
  const [form, setForm] = useState({
    product_name: sheet.rfq_number || sheet.po_number || "",
    supplier_name: "",
    customer_name: sheet.client_name || "",
    unit_price: sheet.total_selling_value || "",
  });

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 text-white">
            <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center"><Send className="w-4 h-4" /></div>
            <div>
              <h3 className="font-bold text-sm">Send to Tradeflow</h3>
              <p className="text-indigo-200 text-xs">{sheet.pcs_number} · {sheet.client_name}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-3">
          <div className="bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-2 text-xs text-indigo-700">
            Creates a new <strong>Tradeflow Order</strong> linked to <strong>{sheet.pcs_number}</strong> and sets status to <strong>"Ordered"</strong>.
          </div>
          {[
            { label: "Product / Description", field: "product_name" },
            { label: "Awarded Supplier", field: "supplier_name" },
            { label: "Customer", field: "customer_name" },
            { label: "Order Value (QAR)", field: "unit_price", type: "number" },
          ].map(({ label, field, type }) => (
            <div key={field}>
              <label className="text-xs text-slate-500 mb-1 block">{label}</label>
              <input
                type={type || "text"}
                value={form[field] || ""}
                onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                className="w-full h-9 border border-slate-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
          ))}
        </div>
        <div className="px-5 pb-5 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5"
            disabled={loading}
            onClick={() => onConfirm(form)}
          >
            {loading ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            Create Order in Tradeflow →
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// ── PCS Card ──────────────────────────────────────────────────────────────────
function PcsCard({ sheet, isAdmin, onSendToTradeflow }) {
  const stage = getStage(sheet.status);
  const Icon = stage.icon;
  const canSend = sheet.status === "awarded";
  const isLinked = sheet.status === "ordered" && sheet.tradeflow_order_ref;

  return (
    <Link to={`/pcs-detail?id=${sheet.id}`}>
      <motion.div
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-white rounded-xl border ${isLinked ? "border-indigo-200" : "border-slate-200"} p-3.5 shadow-sm hover:shadow-md transition-shadow cursor-pointer`}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <span className="font-bold text-slate-800 text-sm">{sheet.pcs_number}</span>
            <p className="text-xs text-slate-500 mt-0.5">{sheet.client_name}</p>
          </div>
          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${stage.light} ${stage.text} shrink-0`}>
            <Icon className="w-2.5 h-2.5" />{stage.label}
          </span>
        </div>

        <p className="text-xs text-slate-400 truncate mb-2">PO: {sheet.po_number}{sheet.date ? ` · ${sheet.date}` : ""}</p>

        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700">
            {sheet.total_selling_value ? `QAR ${Number(sheet.total_selling_value).toLocaleString()}` : "—"}
          </span>
        </div>

        {isLinked && (
          <div className="mt-2 flex items-center gap-1 text-[11px] text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-lg px-2 py-1">
            <Truck className="w-3 h-3" />
            <span className="font-medium">Tradeflow: {sheet.tradeflow_order_ref}</span>
          </div>
        )}

        {canSend && (
          isAdmin ? (
            <button
              onClick={e => { e.preventDefault(); onSendToTradeflow(sheet); }}
              className="mt-2.5 w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg py-1.5 transition-colors"
            >
              <Send className="w-3 h-3" /> Send to Tradeflow →
            </button>
          ) : (
            <div className="mt-2.5 w-full flex items-center justify-center gap-1.5 text-xs font-medium text-slate-400 bg-slate-50 border border-slate-200 rounded-lg py-1.5 cursor-not-allowed">
              <Lock className="w-3 h-3" /> Admin only
            </div>
          )
        )}
      </motion.div>
    </Link>
  );
}

// ── Kanban Column ─────────────────────────────────────────────────────────────
function KanbanColumn({ stage, sheets, isAdmin, onSendToTradeflow, search }) {
  const Icon = stage.icon;
  const filtered = search
    ? sheets.filter(s =>
        s.client_name?.toLowerCase().includes(search) ||
        s.pcs_number?.toLowerCase().includes(search) ||
        s.po_number?.toLowerCase().includes(search) ||
        s.rfq_number?.toLowerCase().includes(search)
      )
    : sheets;

  return (
    <div className="flex-shrink-0 w-64">
      <div className={`rounded-xl border ${stage.light} px-3 py-2.5 mb-3`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-lg ${stage.color} flex items-center justify-center`}>
              <Icon className="w-3.5 h-3.5 text-white" />
            </div>
            <span className={`text-xs font-bold ${stage.text}`}>{stage.label}</span>
          </div>
          <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${stage.color} text-white`}>{filtered.length}</span>
        </div>
        <p className="text-[10px] text-slate-400 mt-1 pl-8">{stage.desc}</p>
      </div>
      <div className="space-y-2.5 min-h-[80px]">
        <AnimatePresence>
          {filtered.map(sheet => (
            <PcsCard key={sheet.id} sheet={sheet} isAdmin={isAdmin} onSendToTradeflow={onSendToTradeflow} />
          ))}
        </AnimatePresence>
        {filtered.length === 0 && (
          <div className="border-2 border-dashed border-slate-200 rounded-xl h-16 flex items-center justify-center">
            <p className="text-xs text-slate-300">Empty</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function PcsDashboard() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [sendModal, setSendModal] = useState(null);

  const { data: currentUser, isLoading: userLoading } = useQuery({ queryKey: ["me"], queryFn: () => base44.auth.me(), staleTime: 60_000 });
  const isAdmin = currentUser?.role === "admin";

  const { data: sheets = [], isLoading } = useQuery({
    queryKey: ["pcs-sheets"],
    queryFn: () => base44.entities.PriceComparisonSheet.list("-created_date"),
  });

  const sendToTradeflowMutation = useMutation({
    mutationFn: async ({ sheet, formData }) => {
      const order = await base44.entities.Order.create({
        product_name: formData.product_name,
        supplier_name: formData.supplier_name,
        customer_name: formData.customer_name,
        unit_price: parseFloat(formData.unit_price) || 0,
        currency: "QAR",
        source_platform: "Other Direct",
        fulfillment_type: "direct_express",
        status: "pending",
        notes: `Linked from PCS ${sheet.pcs_number}`,
      });
      await base44.entities.PriceComparisonSheet.update(sheet.id, {
        status: "ordered",
        tradeflow_order_ref: order.alibaba_order_ref || `TF-${order.id.slice(-6)}`,
        tradeflow_order_id: order.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pcs-sheets"] });
      setSendModal(null);
      toast.success("Tradeflow order created — PCS is now Ordered");
    },
  });

  if (userLoading || !currentUser) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (currentUser.role !== "admin" && !currentUser.data?.can_access_pcs) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col">
        <Header />
        <div className="flex flex-col items-center justify-center flex-1 gap-4">
          <ShieldOff className="w-12 h-12 text-slate-300" />
          <h2 className="text-lg font-semibold text-slate-700">Access Restricted</h2>
          <p className="text-sm text-slate-500">You don't have permission to access the PCS module.</p>
          <Link to="/" className="text-sm text-red-600 hover:underline">Back to Portal</Link>
        </div>
      </div>
    );
  }

  const q = search.trim().toLowerCase();

  // Stats
  const totalValue = sheets.filter(s => s.status !== "completed").reduce((sum, s) => sum + (s.total_selling_value || 0), 0);
  const awaitingAction = sheets.filter(s => ["approved", "awarded"].includes(s.status)).length;
  const orderedCount = sheets.filter(s => s.status === "ordered").length;
  const completedCount = sheets.filter(s => s.status === "completed").length;

  const statCards = [
    { label: "Active Pipeline Value", value: `QAR ${totalValue.toLocaleString()}`, icon: TrendingUp, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Needs Action", value: awaitingAction, sub: "Approved / Awarded", icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Sent to Tradeflow", value: orderedCount, sub: "Orders in progress", icon: Truck, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Completed", value: completedCount, sub: "Closed PCS sheets", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  return (
    <div className="min-h-screen bg-slate-100">
      <Header />
      <div className="pt-24 px-4 md:px-6 pb-10 max-w-[1600px] mx-auto">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="icon" className="rounded-full border border-slate-200 bg-white shadow-sm">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">PCS Dashboard</h1>
              <p className="text-sm text-slate-500">Procurement pipeline · Full lifecycle</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <div className="hidden md:flex items-center gap-1.5 text-xs bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg px-3 py-1.5">
                <Shield className="w-3 h-3" /> Admin — Send to Tradeflow enabled
              </div>
            )}
            <Link to="/pcs-create">
              <Button className="bg-red-600 hover:bg-red-700 text-white gap-2">
                <Plus className="w-4 h-4" /> New Sheet
              </Button>
            </Link>
          </div>
        </div>

        {/* Stat Cards */}
        {!isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {statCards.map(stat => {
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
        )}

        {/* Kanban Board */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 overflow-x-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-800">Procurement Pipeline</h2>
              <p className="text-xs text-slate-400 mt-0.5">Click any card to open the sheet</p>
            </div>
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search sheets..."
                className="pl-8 pr-8 h-8 text-xs w-52"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
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

          {isLoading ? (
            <div className="flex gap-4 overflow-x-auto pb-2" style={{ minWidth: "max-content" }}>
              {PIPELINE.map(s => (
                <div key={s.key} className="flex-shrink-0 w-64">
                  <div className="h-16 bg-slate-100 rounded-xl animate-pulse mb-3" />
                  <div className="space-y-2.5">
                    {[1, 2].map(i => <div key={i} className="h-24 bg-slate-50 rounded-xl animate-pulse" />)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-2" style={{ minWidth: "max-content" }}>
              {PIPELINE.map(stage => (
                <KanbanColumn
                  key={stage.key}
                  stage={stage}
                  sheets={sheets.filter(s => s.status === stage.key)}
                  isAdmin={isAdmin}
                  onSendToTradeflow={setSendModal}
                  search={q}
                />
              ))}
            </div>
          )}
        </div>

        {/* View all link */}
        <div className="mt-4 text-right">
          <Link to="/pcs-sheets" className="text-sm text-red-600 hover:underline font-medium">View all sheets →</Link>
        </div>
      </div>

      {/* Send to Tradeflow Modal */}
      <AnimatePresence>
        {sendModal && (
          <SendToTradeflowModal
            sheet={sendModal}
            loading={sendToTradeflowMutation.isPending}
            onConfirm={(formData) => sendToTradeflowMutation.mutate({ sheet: sendModal, formData })}
            onClose={() => setSendModal(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}