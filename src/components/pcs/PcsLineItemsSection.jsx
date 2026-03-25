import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Trash2, Package } from "lucide-react";
import { toast } from "sonner";
import PcsQuickAddItem from "./PcsQuickAddItem";
import PcsImageImportDropzone from "./PcsImageImportDropzone";

export default function PcsLineItemsSection({ pcsId, lineItems }) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.LineItem.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["line-items", pcsId] });
      toast.success("Item removed");
    },
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-slate-800 flex items-center gap-2">
          <Package className="w-4 h-4" />
          Line Items <span className="text-slate-400 font-normal text-sm">({lineItems?.length || 0})</span>
        </h2>
      </div>

      <PcsQuickAddItem pcsId={pcsId} lineItems={lineItems} />
      <PcsImageImportDropzone pcsId={pcsId} lineItems={lineItems} />

      {(!lineItems || lineItems.length === 0) ? (
        <div className="text-center py-8 text-slate-400 text-sm">
          No line items yet. Add one above to get started.
        </div>
      ) : (
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-2 px-3 text-xs font-medium text-slate-500">#</th>
                <th className="text-left py-2 px-3 text-xs font-medium text-slate-500">Description</th>
                <th className="text-left py-2 px-3 text-xs font-medium text-slate-500">Unit</th>
                <th className="text-right py-2 px-3 text-xs font-medium text-slate-500">Qty</th>
                <th className="text-right py-2 px-3 text-xs font-medium text-slate-500">Price</th>
                <th className="text-right py-2 px-3 text-xs font-medium text-slate-500">Total</th>
                <th className="py-2 px-3"></th>
              </tr>
            </thead>
            <tbody>
              {lineItems.sort((a, b) => (a.item_number || 0) - (b.item_number || 0)).map((item) => (
                <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <td className="py-2 px-3 text-slate-500">{item.item_number}</td>
                  <td className="py-2 px-3 text-slate-800 max-w-xs">{item.description}</td>
                  <td className="py-2 px-3 text-slate-500">{item.unit}</td>
                  <td className="py-2 px-3 text-right text-slate-700">{item.quantity?.toLocaleString()}</td>
                  <td className="py-2 px-3 text-right text-slate-700">{item.selling_price?.toFixed(2)}</td>
                  <td className="py-2 px-3 text-right font-medium text-slate-900">{item.total_selling_price?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="py-2 px-3">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-300 hover:text-destructive" onClick={() => deleteMutation.mutate(item.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-200">
                <td colSpan={5} className="py-2 px-3 text-right text-sm font-semibold text-slate-700">TOTAL:</td>
                <td className="py-2 px-3 text-right font-bold text-slate-900">
                  {lineItems.reduce((sum, i) => sum + (i.total_selling_price || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
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