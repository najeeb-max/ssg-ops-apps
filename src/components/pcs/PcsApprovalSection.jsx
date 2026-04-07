import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2, XCircle, Clock, Send, UserCog, ChevronDown, RotateCcw, Award, Trophy, Loader2, Truck, PackageCheck, ExternalLink, X
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { format } from "date-fns";

const STATUS_CONFIG = {
  draft:            { label: "Draft",            color: "bg-slate-100 text-slate-600" },
  in_progress:      { label: "In Progress",      color: "bg-amber-50 text-amber-700 border-amber-200" },
  pending_approval: { label: "Pending Approval", color: "bg-blue-50 text-blue-700 border-blue-200" },
  approved:         { label: "Approved",         color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  rejected:         { label: "Rejected",         color: "bg-red-50 text-red-700 border-red-200" },
  awarded:          { label: "Awarded",          color: "bg-violet-50 text-violet-700 border-violet-200" },
  ordered:          { label: "Ordered",          color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  completed:        { label: "Completed",        color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};

export default function PcsApprovalSection({ pcsId, sheet, currentUser }) {
  const queryClient = useQueryClient();
  const [remarks, setRemarks] = useState("");
  const [showReassign, setShowReassign] = useState(false);
  const [showTradeflowModal, setShowTradeflowModal] = useState(false);
  const [tradeflowForm, setTradeflowForm] = useState({});

  const isManager = currentUser?.role === "manager" || currentUser?.role === "admin";
  const effectiveOwner = sheet?.assigned_to || sheet?.created_by;
  const isOwner = currentUser?.email === effectiveOwner;
  const canEdit = isOwner || isManager;

  // Fetch all users (for reassignment — admin/manager only)
  const { data: allUsers = [] } = useQuery({
    queryKey: ["all-users"],
    queryFn: () => base44.entities.User.list(),
    enabled: isManager,
  });

  const { data: approval } = useQuery({
    queryKey: ["approval", pcsId],
    queryFn: async () => {
      const approvals = await base44.entities.Approval.filter({ pcs_id: pcsId });
      return approvals[0] || null;
    },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["approval", pcsId] });
    queryClient.invalidateQueries({ queryKey: ["pcs-sheet", pcsId] });
    queryClient.invalidateQueries({ queryKey: ["pcs-sheets"] });
  };

  // Owner submits for approval
  const submitMutation = useMutation({
    mutationFn: () => base44.entities.PriceComparisonSheet.update(pcsId, {
      status: "pending_approval",
      submitted_by: currentUser.email,
    }),
    onSuccess: () => { invalidate(); toast.success("Submitted for approval"); },
  });

  // Manager approves
  const approveMutation = useMutation({
    mutationFn: async () => {
      const payload = { status: "approved", approved_by: currentUser.email, approval_date: new Date().toISOString(), remarks };
      if (approval) return base44.entities.Approval.update(approval.id, payload);
      return base44.entities.Approval.create({ pcs_id: pcsId, requested_by: sheet.submitted_by || sheet.created_by, ...payload });
    },
    onSuccess: async () => {
      await base44.entities.PriceComparisonSheet.update(pcsId, { status: "approved" });
      invalidate(); setRemarks(""); toast.success("Sheet approved ✓");
    },
  });

  // Manager rejects
  const rejectMutation = useMutation({
    mutationFn: async () => {
      const payload = { status: "rejected", approved_by: currentUser.email, approval_date: new Date().toISOString(), remarks };
      if (approval) return base44.entities.Approval.update(approval.id, payload);
      return base44.entities.Approval.create({ pcs_id: pcsId, requested_by: sheet.submitted_by || sheet.created_by, ...payload });
    },
    onSuccess: async () => {
      await base44.entities.PriceComparisonSheet.update(pcsId, { status: "rejected" });
      invalidate(); setRemarks(""); toast.success("Sheet rejected");
    },
  });

  // Owner or manager reverts rejected/approved back to in_progress
  const revertMutation = useMutation({
    mutationFn: () => base44.entities.PriceComparisonSheet.update(pcsId, { status: "in_progress" }),
    onSuccess: () => { invalidate(); toast.success("Sheet returned to In Progress"); },
  });

  // Manager/admin marks as Awarded (final step)
  const awardMutation = useMutation({
    mutationFn: () => base44.entities.PriceComparisonSheet.update(pcsId, { status: "awarded" }),
    onSuccess: () => { invalidate(); toast.success("PCS marked as Awarded ✓"); },
  });

  // Manager reassigns ownership
  const reassignMutation = useMutation({
    mutationFn: (email) => base44.entities.PriceComparisonSheet.update(pcsId, { assigned_to: email }),
    onSuccess: (_, email) => { invalidate(); setShowReassign(false); toast.success(`PCS reassigned to ${email}`); },
  });

  // Admin: Send to Tradeflow — creates Order, links back, sets status to "ordered"
  const sendToTradeflowMutation = useMutation({
    mutationFn: async (formData) => {
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
      await base44.entities.PriceComparisonSheet.update(pcsId, {
        status: "ordered",
        tradeflow_order_ref: order.alibaba_order_ref || `TF-${order.id.slice(-6)}`,
        tradeflow_order_id: order.id,
      });
      return order;
    },
    onSuccess: (order) => {
      invalidate();
      setShowTradeflowModal(false);
      toast.success(`Tradeflow order created — PCS is now "Ordered"`);
    },
  });

  // Admin: Mark as Completed
  const completeMutation = useMutation({
    mutationFn: () => base44.entities.PriceComparisonSheet.update(pcsId, { status: "completed" }),
    onSuccess: () => { invalidate(); toast.success("PCS marked as Completed ✓"); },
  });

  const pcsStatus = sheet?.status;
  const statusCfg = STATUS_CONFIG[pcsStatus] || STATUS_CONFIG.draft;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-semibold text-slate-800 flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-500" />
          Workflow & Approval
        </h2>
        <div className="flex items-center gap-2">
          <Badge className={statusCfg.color}>{statusCfg.label}</Badge>
          {isManager && (
            <DropdownMenu open={showReassign} onOpenChange={setShowReassign}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs h-7">
                  <UserCog className="w-3.5 h-3.5" /> Reassign <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="text-xs">Assign PCS to user</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {allUsers.filter(u => u.email !== effectiveOwner).map(u => (
                  <DropdownMenuItem key={u.id} onClick={() => reassignMutation.mutate(u.email)} className="text-xs">
                    <div>
                      <div className="font-medium">{u.full_name || u.email}</div>
                      <div className="text-slate-400">{u.email}</div>
                    </div>
                  </DropdownMenuItem>
                ))}
                {allUsers.filter(u => u.email !== effectiveOwner).length === 0 && (
                  <div className="text-xs text-slate-400 px-3 py-2">No other users found</div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Current owner info */}
      <div className="flex items-center gap-2 text-xs text-slate-500 mb-5 bg-slate-50 rounded-lg px-3 py-2">
        <UserCog className="w-3.5 h-3.5 flex-shrink-0" />
        <span>Responsible: <strong className="text-slate-700">{effectiveOwner || "-"}</strong></span>
        {sheet?.assigned_to && sheet.assigned_to !== sheet.created_by && (
          <Badge className="ml-auto text-xs bg-amber-50 text-amber-700 border-amber-200">Reassigned</Badge>
        )}
      </div>

      {/* Workflow Timeline */}
      <div className="flex items-center gap-1 mb-6 text-xs overflow-x-auto pb-1">
        {["draft", "in_progress", "pending_approval", "approved", "awarded", "ordered", "completed"].map((s, i, arr) => {
          const cfg = STATUS_CONFIG[s];
          const statuses = ["draft", "in_progress", "pending_approval", "approved", "rejected", "awarded", "ordered", "completed"];
          const currentIdx = statuses.indexOf(pcsStatus);
          const stepIdx = statuses.indexOf(s);
          const isActive = pcsStatus === s;
          const isPast = currentIdx > stepIdx && pcsStatus !== "rejected";
          return (
            <div key={s} className="flex items-center gap-1 flex-shrink-0">
              <div className={`text-center py-1 px-2 rounded text-[10px] font-medium border transition-all whitespace-nowrap ${isActive ? cfg.color + " border-current" : isPast ? "bg-slate-100 text-slate-400 border-transparent" : "bg-white text-slate-300 border-slate-100"}`}>
                {cfg.label}
              </div>
              {i < arr.length - 1 && <div className={`w-3 h-px flex-shrink-0 ${isPast ? "bg-slate-400" : "bg-slate-200"}`} />}
            </div>
          );
        })}
      </div>

      {/* Rejected notice */}
      {pcsStatus === "rejected" && approval && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-1">
            <XCircle className="w-4 h-4 text-red-600" />
            <span className="font-semibold text-red-700 text-sm">Rejected</span>
            <span className="text-xs text-slate-400 ml-auto">{approval.approval_date ? format(new Date(approval.approval_date), "MMM d, yyyy") : ""}</span>
          </div>
          <p className="text-xs text-slate-600"><strong>By:</strong> {approval.approved_by}</p>
          {approval.remarks && <p className="text-xs text-slate-600 mt-1 italic">"{approval.remarks}"</p>}
          {canEdit && (
            <Button size="sm" variant="outline" className="mt-3 gap-1.5 text-xs h-7" onClick={() => revertMutation.mutate()}>
              <RotateCcw className="w-3 h-3" /> Revise & Resubmit
            </Button>
          )}
        </div>
      )}

      {/* Approved notice */}
      {pcsStatus === "approved" && approval && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold text-emerald-700 text-sm">Approved</span>
            <span className="text-xs text-slate-400 ml-auto">{approval.approval_date ? format(new Date(approval.approval_date), "MMM d, yyyy") : ""}</span>
          </div>
          <p className="text-xs text-slate-600"><strong>By:</strong> {approval.approved_by}</p>
          {approval.remarks && <p className="text-xs text-slate-600 mt-1 italic">"{approval.remarks}"</p>}
          {isManager && (
            <Button
              size="sm"
              onClick={() => awardMutation.mutate()}
              disabled={awardMutation.isPending}
              className="mt-3 bg-violet-600 hover:bg-violet-700 text-white gap-2 text-xs h-8"
            >
              {awardMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trophy className="w-3.5 h-3.5" />}
              Award PCS to Suppliers
            </Button>
          )}
        </div>
      )}

      {/* Awarded notice */}
      {pcsStatus === "awarded" && (
        <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4 h-4 text-violet-600" />
            <span className="font-semibold text-violet-700 text-sm">Awarded — Ready for Tradeflow</span>
          </div>
          <p className="text-xs text-slate-600 mb-3">Supplier selected. Create a Tradeflow order to proceed with procurement.</p>
          <div className="flex flex-wrap gap-2">
            {currentUser?.role === "admin" ? (
              <Button
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 text-xs"
                onClick={() => {
                  setTradeflowForm({
                    product_name: sheet.rfq_number || sheet.po_number || "",
                    supplier_name: "",
                    customer_name: sheet.client_name || "",
                    unit_price: sheet.total_selling_value || "",
                  });
                  setShowTradeflowModal(true);
                }}
              >
                <Send className="w-3.5 h-3.5" /> Send to Tradeflow
              </Button>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
                <Truck className="w-3 h-3" /> Admin only — Send to Tradeflow
              </div>
            )}
            {isManager && (
              <Button size="sm" variant="outline" className="gap-1.5 text-xs h-7 border-violet-200 text-violet-600" onClick={() => revertMutation.mutate()}>
                <RotateCcw className="w-3 h-3" /> Revert to In Progress
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Ordered notice */}
      {pcsStatus === "ordered" && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-1">
            <Truck className="w-4 h-4 text-indigo-600" />
            <span className="font-semibold text-indigo-700 text-sm">Ordered — In Tradeflow</span>
            {sheet.tradeflow_order_ref && (
              <span className="ml-auto text-xs font-mono bg-indigo-100 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded">
                {sheet.tradeflow_order_ref}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-600 mb-3">This PCS has been sent to Tradeflow for procurement processing.</p>
          {currentUser?.role === "admin" && (
            <Button
              size="sm"
              onClick={() => completeMutation.mutate()}
              disabled={completeMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 text-xs"
            >
              {completeMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <PackageCheck className="w-3.5 h-3.5" />}
              Mark as Completed
            </Button>
          )}
        </div>
      )}

      {/* Completed notice */}
      {pcsStatus === "completed" && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold text-emerald-700 text-sm">Completed</span>
            {sheet.tradeflow_order_ref && (
              <span className="ml-auto text-xs font-mono bg-emerald-100 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded">
                {sheet.tradeflow_order_ref}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-600">This PCS has been fully delivered and closed.</p>
        </div>
      )}

      {/* Send to Tradeflow Modal */}
      {showTradeflowModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowTradeflowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 px-5 py-4 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-3 text-white">
                <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center"><Send className="w-4 h-4" /></div>
                <div>
                  <h3 className="font-bold text-sm">Send to Tradeflow</h3>
                  <p className="text-indigo-200 text-xs">{sheet.pcs_number} · {sheet.client_name}</p>
                </div>
              </div>
              <button onClick={() => setShowTradeflowModal(false)} className="text-white/70 hover:text-white"><X className="w-4 h-4" /></button>
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
                    value={tradeflowForm[field] || ""}
                    onChange={e => setTradeflowForm(f => ({ ...f, [field]: e.target.value }))}
                    className="w-full h-9 border border-slate-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                </div>
              ))}
            </div>
            <div className="px-5 pb-5 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowTradeflowModal(false)}>Cancel</Button>
              <Button
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5"
                disabled={sendToTradeflowMutation.isPending}
                onClick={() => sendToTradeflowMutation.mutate(tradeflowForm)}
              >
                {sendToTradeflowMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                Create Order in Tradeflow →
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Owner: Submit for Approval */}
      {(pcsStatus === "in_progress" || pcsStatus === "draft") && isOwner && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <p className="text-sm text-blue-800 font-medium mb-1">Ready to submit?</p>
          <p className="text-xs text-blue-600 mb-3">Once submitted, a manager will review and approve or reject this PCS.</p>
          <Button
            onClick={() => submitMutation.mutate()}
            disabled={submitMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2 text-sm"
          >
            <Send className="w-3.5 h-3.5" />
            Submit for Approval
          </Button>
        </div>
      )}

      {/* Non-owner, non-manager view when in progress */}
      {(pcsStatus === "in_progress" || pcsStatus === "draft") && !isOwner && !isManager && (
        <p className="text-sm text-slate-400 text-center py-2">Only the assigned user can submit this PCS for approval.</p>
      )}

      {/* Manager: Review pending approval */}
      {pcsStatus === "pending_approval" && isManager && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-50 rounded-lg px-3 py-2 mb-2">
            <Clock className="w-4 h-4" />
            Submitted by <strong>{sheet?.submitted_by || "user"}</strong> - awaiting your review.
          </div>
          <Textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Manager comments (optional)..."
            rows={2}
            className="resize-none text-sm"
          />
          <div className="flex gap-3">
            <Button onClick={() => approveMutation.mutate()} disabled={approveMutation.isPending} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 flex-1">
              <CheckCircle2 className="w-4 h-4" />Approve
            </Button>
            <Button onClick={() => rejectMutation.mutate()} disabled={rejectMutation.isPending} variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 gap-2 flex-1">
              <XCircle className="w-4 h-4" />Reject
            </Button>
          </div>
        </div>
      )}

      {/* Non-manager waiting view */}
      {pcsStatus === "pending_approval" && !isManager && (
        <div className="text-center py-3 text-sm text-slate-500 bg-blue-50 rounded-lg">
          <Clock className="w-5 h-5 text-blue-400 mx-auto mb-1" />
          Awaiting manager approval...
        </div>
      )}
    </div>
  );
}