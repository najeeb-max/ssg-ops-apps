import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trash2, Building2, Hash, Calendar, Truck, Clock, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const statusStyles = {
  draft: "bg-muted text-muted-foreground",
  in_progress: "bg-amber-50 text-amber-700 border-amber-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  awarded: "bg-violet-50 text-violet-700 border-violet-200",
};

function DeadlineCountdown({ sheet }) {
  const poDate = sheet.po_date ? new Date(sheet.po_date) : null;
  const leadWeeks = parseFloat(sheet.quoted_lead_time_weeks) || 0;
  const leadDays = parseFloat(sheet.quoted_lead_time_days) || 0;
  const totalLeadDays = leadWeeks * 7 + leadDays;

  if (!poDate || totalLeadDays === 0) return null;

  const deadline = new Date(poDate);
  deadline.setDate(deadline.getDate() + totalLeadDays);
  deadline.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysLeft = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
  const poAgeDays = Math.ceil((today - poDate) / (1000 * 60 * 60 * 24));
  const pcsSubmitted = !!sheet.date;
  const submissionGapDays = pcsSubmitted ? Math.ceil((new Date(sheet.date) - poDate) / (1000 * 60 * 60 * 24)) : null;

  const progress = Math.max(0, Math.min(100, ((totalLeadDays - daysLeft) / totalLeadDays) * 100));
  const isUrgent = daysLeft <= 7;
  const isWarning = daysLeft <= 21;
  const barColor = isUrgent ? "bg-red-500" : isWarning ? "bg-amber-400" : "bg-emerald-500";
  const textColor = isUrgent ? "text-red-700" : isWarning ? "text-amber-700" : "text-emerald-700";
  const bgColor = isUrgent ? "bg-red-50 border-red-200" : isWarning ? "bg-amber-50 border-amber-200" : "bg-emerald-50 border-emerald-200";

  return (
    <div className={`rounded-xl border p-3 ${bgColor}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          {isUrgent ? <AlertTriangle className="w-4 h-4 text-red-500" /> : <Clock className="w-4 h-4 text-amber-500" />}
          <span className="text-xs font-semibold text-slate-600">Lead Time Deadline</span>
        </div>
        <div className="text-right">
          <span className={`font-bold text-sm ${textColor}`}>
            {daysLeft > 0 ? `${daysLeft}d left` : daysLeft === 0 ? "Due Today!" : `${Math.abs(daysLeft)}d overdue`}
          </span>
          <p className="text-xs text-slate-400">{format(deadline, "MMM d, yyyy")}</p>
        </div>
      </div>
      <div className="h-1.5 bg-white/60 rounded-full overflow-hidden mb-2">
        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${progress}%` }} />
      </div>
      <div className="text-xs">
        {pcsSubmitted ? (
          <span className={`${submissionGapDays > 3 ? "text-amber-600" : "text-emerald-600"}`}>
            PCS submitted {submissionGapDays}d after PO
          </span>
        ) : (
          <span className={`${poAgeDays > 3 ? "text-red-500" : "text-amber-500"}`}>
            ⚡ PO is {poAgeDays}d old — submit PCS now!
          </span>
        )}
      </div>
    </div>
  );
}

export default function PcsSheetHeader({ sheet }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => base44.entities.PriceComparisonSheet.delete(sheet.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pcs-sheets"] });
      toast.success("Sheet deleted");
      navigate("/pcs-sheets");
    },
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Link to="/pcs-sheets">
            <Button variant="ghost" size="icon" className="rounded-full border border-slate-200 mt-1">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <h1 className="text-2xl font-bold text-slate-900">{sheet.pcs_number}</h1>
              <Badge className={statusStyles[sheet.status]}>{sheet.status?.replace("_", " ")}</Badge>
            </div>
            <p className="text-slate-600 flex items-center gap-1.5 mb-3">
              <Building2 className="w-4 h-4" />{sheet.client_name}
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500">
              {sheet.po_number && <span className="flex items-center gap-1"><Hash className="w-3.5 h-3.5" />PO: {sheet.po_number}</span>}
              {sheet.po_date && <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />PO Date: {format(new Date(sheet.po_date), "MMM d, yyyy")}</span>}
              {sheet.rfq_number && <span className="flex items-center gap-1">RFQ: {sheet.rfq_number}</span>}
              {sheet.sq_number && <span className="flex items-center gap-1">SQ: {sheet.sq_number}</span>}
              {sheet.date && <span className="flex items-center gap-1">Date: {format(new Date(sheet.date), "MMM d, yyyy")}</span>}
              {(sheet.quoted_lead_time_weeks || sheet.quoted_lead_time_days) && (
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5" />Lead Time:
                  {sheet.quoted_lead_time_weeks ? ` ${sheet.quoted_lead_time_weeks}w` : ""}
                  {sheet.quoted_lead_time_days ? ` ${sheet.quoted_lead_time_days}d` : ""}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3 md:items-end">
          {(sheet.po_date && (sheet.quoted_lead_time_weeks || sheet.quoted_lead_time_days)) && (
            <div className="w-64"><DeadlineCountdown sheet={sheet} /></div>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/5 gap-1.5">
                <Trash2 className="w-3.5 h-3.5" />Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this sheet?</AlertDialogTitle>
                <AlertDialogDescription>This will permanently delete this comparison sheet and all its data.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => deleteMutation.mutate()} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}