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
  draft:            "bg-muted text-muted-foreground",
  in_progress:      "bg-amber-50 text-amber-700 border-amber-200",
  pending_approval: "bg-blue-50 text-blue-700 border-blue-200",
  approved:         "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected:         "bg-red-50 text-red-700 border-red-200",
  awarded:          "bg-violet-50 text-violet-700 border-violet-200",
  completed:        "bg-emerald-50 text-emerald-700 border-emerald-200",
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
    <div className={`rounded-lg border px-3 py-2 flex items-center gap-3 ${bgColor}`}>
      <div className="flex items-center gap-1">
        {isUrgent ? <AlertTriangle className="w-3.5 h-3.5 text-red-500" /> : <Clock className="w-3.5 h-3.5 text-amber-500" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] text-slate-500">Deadline</span>
          <span className={`font-bold text-xs ${textColor}`}>
            {daysLeft > 0 ? `${daysLeft}d left` : daysLeft === 0 ? "Due Today!" : `${Math.abs(daysLeft)}d overdue`}
          </span>
        </div>
        <div className="h-1 bg-white/60 rounded-full overflow-hidden mt-1">
          <div className={`h-full rounded-full ${barColor}`} style={{ width: `${progress}%` }} />
        </div>
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
    <div className="bg-white rounded-xl border border-slate-200 px-4 py-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <Link to="/pcs-sheets">
            <Button variant="ghost" size="icon" className="rounded-full border border-slate-200 h-7 w-7">
              <ArrowLeft className="w-3.5 h-3.5" />
            </Button>
          </Link>
          <h1 className="text-lg font-bold text-slate-900">{sheet.pcs_number}</h1>
          <Badge className={statusStyles[sheet.status]}>{sheet.status?.replace("_", " ")}</Badge>
          <span className="text-slate-600 flex items-center gap-1 text-sm">
            <Building2 className="w-3.5 h-3.5" />{sheet.client_name}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {sheet.po_number && (
              <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 rounded-md px-2 py-0.5 text-xs font-medium border border-slate-200">
                <Hash className="w-3 h-3 text-slate-400" /><span className="text-slate-400">PO</span>{sheet.po_number}
              </span>
            )}
            {sheet.rfq_number && (
              <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 rounded-md px-2 py-0.5 text-xs font-medium border border-slate-200">
                <span className="text-slate-400">RFQ</span>{sheet.rfq_number}
              </span>
            )}
            {sheet.sq_number && (
              <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 rounded-md px-2 py-0.5 text-xs font-medium border border-slate-200">
                <span className="text-slate-400">SQ</span>{sheet.sq_number}
              </span>
            )}
            {sheet.date && (
              <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 rounded-md px-2 py-0.5 text-xs font-medium border border-slate-200">
                <Calendar className="w-3 h-3 text-slate-400" />{format(new Date(sheet.date), "MMM d, yyyy")}
              </span>
            )}
            {(sheet.quoted_lead_time_weeks || sheet.quoted_lead_time_days) && (
              <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 rounded-md px-2 py-0.5 text-xs font-medium border border-slate-200">
                <Truck className="w-3 h-3 text-slate-400" />
                {sheet.quoted_lead_time_weeks ? `${sheet.quoted_lead_time_weeks}w` : ""}
                {sheet.quoted_lead_time_days ? ` ${sheet.quoted_lead_time_days}d` : ""}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {(sheet.po_date && (sheet.quoted_lead_time_weeks || sheet.quoted_lead_time_days)) && (
            <div className="w-56"><DeadlineCountdown sheet={sheet} /></div>
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