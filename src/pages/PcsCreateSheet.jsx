import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import Header from "../components/Header";
import TypewriterInput from "../components/TypewriterInput";

function Field({ label, required, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-sm font-medium text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      {children}
    </div>
  );
}

export default function PcsCreateSheet() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    po_number: "",
    sq_number: "",
    rfq_number: "",
    client_name: "",
    po_date: "",
    quoted_lead_time_weeks: "",
    quoted_lead_time_days: "",
    status: "draft",
    remarks: "",
  });

  const autoStatus = (() => {
    const hasCore = form.client_name && form.po_number && form.rfq_number && form.sq_number;
    const hasDates = form.po_date && (form.quoted_lead_time_weeks || form.quoted_lead_time_days);
    const hasRemarks = form.remarks?.trim().length > 0;
    if (!form.client_name && !form.po_number) return "draft";
    if (hasCore && hasDates && hasRemarks) return "completed";
    if (hasCore && hasDates) return "in_progress";
    if (hasCore) return "in_progress";
    return "draft";
  })();

  const stageConfig = {
    draft: { label: "DRAFT", ribbon: "from-slate-400 to-slate-600" },
    in_progress: { label: "IN PROGRESS", ribbon: "from-amber-400 to-amber-600" },
    completed: { label: "COMPLETED", ribbon: "from-blue-400 to-blue-600" },
    awarded: { label: "AWARDED", ribbon: "from-emerald-400 to-emerald-600" },
  };
  const currentStage = stageConfig[autoStatus];

  const mutation = useMutation({
    mutationFn: async (formData) => {
      const allSheets = await base44.entities.PriceComparisonSheet.list();
      const numbers = (allSheets || [])
        .map((s) => {
          const match = s.pcs_number?.match(/PCS-(\d+)/);
          return match ? parseInt(match[1], 10) : 0;
        })
        .filter((n) => !isNaN(n) && n > 0);
      const next = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
      const pcs_number = `PCS-${String(next).padStart(5, "0")}`;
      return base44.entities.PriceComparisonSheet.create({
        ...formData,
        pcs_number,
        date: new Date().toISOString().split("T")[0],
      });
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["pcs-sheets"] });
      toast.success("Sheet created successfully");
      navigate(`/pcs-detail?id=${result.id}`);
    },
    onError: (err) => {
      toast.error("Failed to create sheet: " + (err?.message || "Unknown error"));
    },
  });

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.client_name) { toast.error("Client Name is required"); return; }
    if (!form.po_number) { toast.error("Client PO Number is required"); return; }
    if (!form.rfq_number) { toast.error("Client RFQ Number is required"); return; }
    if (!form.sq_number) { toast.error("SSG Sales Order Number is required"); return; }
    const cleanedForm = {
      ...form,
      quoted_lead_time_weeks: form.quoted_lead_time_weeks !== "" ? parseFloat(form.quoted_lead_time_weeks) : undefined,
      quoted_lead_time_days: form.quoted_lead_time_days !== "" ? parseFloat(form.quoted_lead_time_days) : undefined,
    };
    mutation.mutate({ ...cleanedForm, status: autoStatus });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex-1 pt-24 px-4 md:px-6 pb-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="flex items-center gap-3 mb-6">
            <Link to="/pcs">
              <Button variant="ghost" size="icon" className="rounded-full border border-slate-200 bg-white shadow-sm">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-900">New Price Comparison Sheet</h1>
              <p className="text-sm text-slate-500">PCS date will be auto-stamped on creation</p>
            </div>
            {/* Status badge */}
            <div className={`px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${currentStage.ribbon}`}>
              {currentStage.label}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* LEFT: Client & Reference Numbers */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
                <h2 className="font-semibold text-slate-800 text-sm uppercase tracking-wide border-b pb-3">Client & Reference Details</h2>
                <Field label="Client Name" required>
                   <TypewriterInput
                     value={form.client_name}
                     onChange={(e) => handleChange("client_name", e.target.value)}
                     placeholder="e.g. Qatar Petroleum"
                     className="bg-slate-50 focus:bg-white"
                   />
                 </Field>
                 <Field label="Client PO Number" required>
                   <TypewriterInput
                     value={form.po_number}
                     onChange={(e) => handleChange("po_number", e.target.value)}
                     placeholder="e.g. PO-2024-001"
                     className="bg-red-50 border-red-200 focus:bg-white font-mono text-sm"
                   />
                 </Field>
                 <Field label="Client RFQ Number" required>
                   <TypewriterInput
                     value={form.rfq_number}
                     onChange={(e) => handleChange("rfq_number", e.target.value)}
                     placeholder="e.g. RFQ-2024-001"
                     className="bg-amber-50 border-amber-200 focus:bg-white font-mono text-sm"
                   />
                 </Field>
                 <Field label="SSG Sales Order No." required>
                   <TypewriterInput
                     value={form.sq_number}
                     onChange={(e) => handleChange("sq_number", e.target.value)}
                     placeholder="e.g. SQ-2024-001"
                     className="bg-emerald-50 border-emerald-200 focus:bg-white font-mono text-sm"
                   />
                 </Field>
              </div>

              {/* RIGHT: Dates + Remarks */}
              <div className="space-y-5">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
                  <h2 className="font-semibold text-slate-800 text-sm uppercase tracking-wide border-b pb-3">Dates & Timeline</h2>
                  <Field label="Customer PO Date">
                    <Input
                      type="date"
                      value={form.po_date}
                      onChange={(e) => handleChange("po_date", e.target.value)}
                      className="bg-slate-50 focus:bg-white"
                    />
                  </Field>
                  <div>
                    <Label className="text-sm font-medium text-slate-700 mb-2 block">Quoted Lead Time</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="relative">
                        <Input
                          type="number"
                          placeholder="0"
                          value={form.quoted_lead_time_weeks}
                          onChange={(e) => handleChange("quoted_lead_time_weeks", e.target.value)}
                          className="pr-12 bg-slate-50 focus:bg-white"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-semibold">WKS</span>
                      </div>
                      <div className="relative">
                        <Input
                          type="number"
                          placeholder="0"
                          value={form.quoted_lead_time_days}
                          onChange={(e) => handleChange("quoted_lead_time_days", e.target.value)}
                          className="pr-12 bg-slate-50 focus:bg-white"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-semibold">DAYS</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                  <h2 className="font-semibold text-slate-800 text-sm uppercase tracking-wide border-b pb-3">Remarks</h2>
                  <Textarea
                    value={form.remarks}
                    onChange={(e) => handleChange("remarks", e.target.value)}
                    placeholder="Any additional notes..."
                    rows={4}
                    className="bg-slate-50 focus:bg-white resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={mutation.isPending}
                  className="w-full bg-red-600 hover:bg-red-700 text-white gap-2 py-6 text-base font-semibold"
                >
                  <Save className="w-5 h-5" />
                  {mutation.isPending ? "Creating..." : "Create Sheet"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}