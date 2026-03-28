import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Trash2, Package, Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";
import PcsQuickAddItem from "./PcsQuickAddItem";
import PcsImageImportDropzone from "./PcsImageImportDropzone";

export default function PcsLineItemsSection({ pcsId, lineItems, canEdit = true }) {
  const queryClient = useQueryClient();
  const [activePanel, setActivePanel] = useState(null); // null | "manual" | "ai"

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.LineItem.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["line-items", pcsId] });
      toast.success("Item removed");
    },
  });

  const togglePanel = (panel) => setActivePanel((prev) => (prev === panel ? null : panel));

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {/* Section Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50/60">
        <h2 className="font-semibold text-slate-800 flex items-center gap-2 text-sm">
          <Package className="w-4 h-4 text-slate-500" />
          Line Items
          <span className="bg-slate-200 text-slate-600 text-xs font-semibold px-1.5 py-0.5 rounded-full">{lineItems?.length || 0}</span>
        </h2>
      </div>

      {/* Action Cards - only for editors */}
      {canEdit && (
        <div className="px-5 pt-4 pb-3">
          <div className="grid grid-cols-2 gap-3">
            {/* Manual Add Card */}
            <button
              onClick={() => togglePanel("manual")}
              className={`relative rounded-xl border text-left backdrop-blur-sm shadow-sm overflow-hidden transition-all group ${
                activePanel === "manual"
                  ? "border-blue-300 bg-blue-50/80 ring-1 ring-blue-200"
                  : "border-white/60 bg-white/70 hover:border-blue-200 hover:shadow-md"
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-white/40 to-blue-100/30 pointer-events-none" />
              <div className={`absolute top-0 left-0 w-1 h-full rounded-l-xl transition-colors ${activePanel === "manual" ? "bg-blue-500" : "bg-blue-300 group-hover:bg-blue-400"}`} />
              <div className="relative px-4 py-3 flex items-center gap-3">
                <div className={`flex-shrink-0 w-9 h-9 rounded-lg border flex items-center justify-center shadow-inner transition-colors ${activePanel === "manual" ? "bg-blue-200/80 border-blue-300" : "bg-blue-100/80 border-blue-200/60"}`}>
                  <Plus className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800">Add Manually</p>
                  <p className="text-xs text-slate-500 truncate">Description · Unit · Qty · Price</p>
                </div>
                <span className={`flex-shrink-0 text-xs font-semibold px-1.5 py-0.5 rounded border transition-colors ${activePanel === "manual" ? "bg-blue-200 text-blue-800 border-blue-300" : "bg-blue-50 text-blue-600 border-blue-200"}`}>
                  {activePanel === "manual" ? "▲" : "▼"}
                </span>
              </div>
            </button>

            {/* AI Screenshot Card */}
            <button
              onClick={() => togglePanel("ai")}
              className={`relative rounded-xl border text-left backdrop-blur-sm shadow-sm overflow-hidden transition-all group ${
                activePanel === "ai"
                  ? "border-violet-300 bg-violet-50/80 ring-1 ring-violet-200"
                  : "border-white/60 bg-white/70 hover:border-violet-200 hover:shadow-md"
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-violet-50/80 via-white/40 to-purple-100/30 pointer-events-none" />
              <div className={`absolute top-0 left-0 w-1 h-full rounded-l-xl transition-colors ${activePanel === "ai" ? "bg-violet-500" : "bg-violet-300 group-hover:bg-violet-400"}`} />
              <div className="relative px-4 py-3 flex items-center gap-3">
                <div className={`flex-shrink-0 w-9 h-9 rounded-lg border flex items-center justify-center shadow-inner transition-colors ${activePanel === "ai" ? "bg-violet-200/80 border-violet-300" : "bg-violet-100/80 border-violet-200/60"}`}>
                  <Sparkles className="w-4 h-4 text-violet-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800">AI Screenshot Import</p>
                  <p className="text-xs text-slate-500 truncate">Drop · Paste Ctrl+V · Click to upload</p>
                </div>
                <span className={`flex-shrink-0 text-xs font-semibold px-1.5 py-0.5 rounded border transition-colors ${activePanel === "ai" ? "bg-violet-200 text-violet-800 border-violet-300" : "bg-violet-50 text-violet-600 border-violet-200"}`}>
                  AI
                </span>
              </div>
            </button>
          </div>

          {/* Expanded Panels */}
          {activePanel === "manual" && (
            <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50/40 p-3">
              <PcsQuickAddItem pcsId={pcsId} lineItems={lineItems} defaultOpen onClose={() => setActivePanel(null)} />
            </div>
          )}
          {activePanel === "ai" && (
            <div className="mt-3 rounded-xl border border-violet-100 bg-violet-50/40 p-3">
              <PcsImageImportDropzone pcsId={pcsId} lineItems={lineItems} />
            </div>
          )}
        </div>
      )}

      {(!lineItems || lineItems.length === 0) ? (
        <div className="text-center py-10 text-slate-400 text-sm px-5 pb-5">
          No line items yet. Add one above or drop a screenshot to get started.
        </div>
      ) : (
        <div className="overflow-x-auto border-t border-slate-100 mt-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide w-10">#</th>
                <th className="text-left py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Description</th>
                <th className="text-left py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide w-16">Unit</th>
                <th className="text-right py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide w-20">Qty</th>
                <th className="text-right py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide w-28">Unit Price</th>
                <th className="text-right py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide w-32">Total</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {lineItems.sort((a, b) => (a.item_number || 0) - (b.item_number || 0)).map((item, idx) => (
                <tr key={item.id} className={`hover:bg-blue-50/30 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/30"}`}>
                  <td className="py-2.5 px-4 text-slate-400 font-mono text-xs">{item.item_number}</td>
                  <td className="py-2.5 px-4 text-slate-800 font-medium">{item.description}</td>
                  <td className="py-2.5 px-4">
                    <span className="bg-slate-100 text-slate-600 text-xs font-medium px-1.5 py-0.5 rounded">{item.unit}</span>
                  </td>
                  <td className="py-2.5 px-4 text-right text-slate-700 tabular-nums">{item.quantity?.toLocaleString()}</td>
                  <td className="py-2.5 px-4 text-right text-slate-700 tabular-nums">QAR {item.selling_price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className="py-2.5 px-4 text-right font-semibold text-slate-900 tabular-nums">QAR {item.total_selling_price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className="py-2.5 px-4">
                    {canEdit && (
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-300 hover:text-destructive hover:bg-red-50" onClick={() => deleteMutation.mutate(item.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 border-t-2 border-slate-200">
                <td colSpan={5} className="py-3 px-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wide">Total Selling Value</td>
                <td className="py-3 px-4 text-right font-bold text-slate-900 tabular-nums text-sm">
                  QAR {lineItems.reduce((sum, i) => sum + (i.total_selling_price || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}