import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";

export default function PcsApprovalSection({ pcsId, pcsStatus }) {
  const [remarks, setRemarks] = useState("");
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = React.useState(null);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => setCurrentUser(null));
  }, []);

  const { data: approval } = useQuery({
    queryKey: ["approval", pcsId],
    queryFn: async () => {
      const approvals = await base44.entities.Approval.filter({ pcs_id: pcsId });
      return approvals[0] || null;
    },
  });

  const approveMutation = useMutation({
    mutationFn: async () => {
      if (approval) {
        return base44.entities.Approval.update(approval.id, { status: "approved", approved_by: currentUser.email, approval_date: new Date().toISOString(), remarks });
      } else {
        return base44.entities.Approval.create({ pcs_id: pcsId, status: "approved", requested_by: currentUser.email, approved_by: currentUser.email, approval_date: new Date().toISOString(), remarks });
      }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["approval", pcsId] }); setRemarks(""); toast.success("Sheet approved"); },
  });

  const rejectMutation = useMutation({
    mutationFn: async () => {
      if (approval) {
        return base44.entities.Approval.update(approval.id, { status: "rejected", approved_by: currentUser.email, approval_date: new Date().toISOString(), remarks });
      } else {
        return base44.entities.Approval.create({ pcs_id: pcsId, status: "rejected", requested_by: currentUser.email, approved_by: currentUser.email, approval_date: new Date().toISOString(), remarks });
      }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["approval", pcsId] }); setRemarks(""); toast.success("Sheet rejected"); },
  });

  const isManager = currentUser?.role === "manager" || currentUser?.role === "admin";
  const canApprove = pcsStatus === "in_progress" && !approval;

  if (pcsStatus !== "in_progress" && !approval) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <h2 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
        <Clock className="w-4 h-4" />Manager Approval
      </h2>

      {!approval && pcsStatus === "in_progress" && (
        <p className="text-sm text-slate-500 mb-4">This sheet requires manager approval before awarding.</p>
      )}

      {approval && (
        <div className={`rounded-xl border p-4 mb-4 ${approval.status === "approved" ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"}`}>
          <div className="flex items-center gap-2 mb-2">
            {approval.status === "approved" ? (
              <><CheckCircle2 className="w-5 h-5 text-emerald-600" /><span className="font-semibold text-emerald-700">Approved</span></>
            ) : (
              <><XCircle className="w-5 h-5 text-red-600" /><span className="font-semibold text-red-700">Rejected</span></>
            )}
          </div>
          <p className="text-sm text-slate-600"><strong>By:</strong> {approval.approved_by}</p>
          {approval.remarks && <p className="text-sm text-slate-600 mt-1"><strong>Comments:</strong> {approval.remarks}</p>}
        </div>
      )}

      {isManager && canApprove && (
        <div className="space-y-3">
          <Textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Manager comments (optional)..."
            rows={3}
            className="resize-none"
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
    </div>
  );
}