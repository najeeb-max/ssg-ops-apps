import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { toast } from "sonner";

const fmt = (n, decimals = 2) =>
  n != null ? Number(n).toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) : "-";

export default function PcsQuickEntryTable({ pcsId, lineItems, providers, quotes, canEdit = true }) {
  const queryClient = useQueryClient();

  const sortedProviders = [...(providers || [])].sort((a, b) => (a.provider_number || 0) - (b.provider_number || 0));
  const sortedItems = [...(lineItems || [])].sort((a, b) => (a.item_number || 0) - (b.item_number || 0));

  const getQuote = (lineItemId, providerId) =>
    (quotes || []).find((q) => q.line_item_id === lineItemId && q.provider_id === providerId);

  const upsertMutation = useMutation({
    mutationFn: async ({ lineItemId, providerId, unitPrice }) => {
      const existing = getQuote(lineItemId, providerId);
      const item = lineItems.find((i) => i.id === lineItemId);
      const total = unitPrice * (item?.quantity || 1);
      if (existing) {
        return base44.entities.ProviderQuote.update(existing.id, { unit_price: unitPrice, total_price: total });
      }
      return base44.entities.ProviderQuote.create({ pcs_id: pcsId, provider_id: providerId, line_item_id: lineItemId, unit_price: unitPrice, total_price: total });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["quotes", pcsId] }),
  });

  const handlePriceChange = (lineItemId, providerId, value) => {
    const unitPrice = parseFloat(value);
    if (isNaN(unitPrice) || unitPrice < 0) return;
    upsertMutation.mutate({ lineItemId, providerId, unitPrice });
  };

  // For a given item, find the lowest QAR total among providers
  const getLowestQAR = (lineItemId) => {
    const item = sortedItems.find((i) => i.id === lineItemId);
    const totalsQAR = sortedProviders
      .map((p) => {
        const q = getQuote(lineItemId, p.id);
        if (q?.unit_price == null) return null;
        return q.unit_price * (item?.quantity || 1) * (p.exchange_rate || 1);
      })
      .filter((v) => v != null && v > 0);
    return totalsQAR.length ? Math.min(...totalsQAR) : null;
  };

  if (!sortedItems.length || !sortedProviders.length) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center text-slate-400 text-sm">
        Add line items and providers to start entering quotes.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/60">
        <h2 className="font-semibold text-slate-800 text-sm">Price Comparison Table</h2>
        <p className="text-xs text-slate-400 mt-0.5">Enter supplier quotes - lowest QAR price is highlighted. Totals converted to QAR.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide w-8">#</th>
              <th className="text-left py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide min-w-[200px]">Description</th>
              <th className="text-right py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide w-16">Qty</th>
              {sortedProviders.map((p) => {
                const currency = p.currency || "QAR";
                const rateOk = currency === "QAR" || (p.exchange_rate && p.exchange_rate !== 1);
                return (
                  <th key={p.id} className="text-center py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide min-w-[160px]">
                    <div>{p.name}</div>
                    <div className="flex items-center justify-center gap-1 mt-0.5">
                      <Badge variant="outline" className="text-xs font-normal">{currency}</Badge>
                      {!rateOk && (
                        <span title="Exchange rate may be incorrect (set to 1)" className="text-amber-500 text-[10px] font-bold cursor-help">⚠️ rate=1</span>
                      )}
                    </div>
                    {currency !== "QAR" && p.exchange_rate && (
                      <div className="text-[10px] text-slate-400 font-normal">1 {currency} = {Number(p.exchange_rate).toFixed(4)} QAR</div>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {sortedItems.map((item, idx) => {
              const lowestQAR = getLowestQAR(item.id);
              return (
                <tr key={item.id} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/30"}>
                  <td className="py-2 px-3 text-slate-400 font-mono text-xs">{item.item_number}</td>
                  <td className="py-2 px-3 text-slate-700 font-medium text-xs leading-snug">{item.description}</td>
                  <td className="py-2 px-3 text-right text-slate-600 tabular-nums text-xs">{item.quantity}</td>
                  {sortedProviders.map((p) => {
                    const q = getQuote(item.id, p.id);
                    const rate = p.exchange_rate || 1;
                    const currency = p.currency || "QAR";
                    // total_price is stored in provider currency; multiply by exchange_rate to get QAR
                    const totalInProviderCurrency = q?.unit_price != null ? q.unit_price * (item.quantity || 1) : null;
                    const totalQAR = totalInProviderCurrency != null ? totalInProviderCurrency * rate : null;
                    const lowestQARVal = getLowestQAR(item.id);
                    const isLowest = totalQAR != null && lowestQARVal != null && Math.abs(totalQAR - lowestQARVal) < 0.001;

                    return (
                      <td key={p.id} className={`py-1.5 px-2 text-center ${isLowest ? "bg-emerald-50" : ""}`}>
                        <div className="flex flex-col items-center gap-0.5">
                          {canEdit ? (
                            <Input
                              type="number"
                              defaultValue={q?.unit_price ?? ""}
                              onBlur={(e) => handlePriceChange(item.id, p.id, e.target.value)}
                              placeholder="0.00"
                              className={`text-xs h-7 text-center w-28 tabular-nums ${isLowest ? "border-emerald-300 bg-emerald-50" : ""}`}
                            />
                          ) : (
                            <span className="text-xs tabular-nums">{q?.unit_price != null ? `${currency} ${fmt(q.unit_price)}` : "-"}</span>
                          )}
                          {totalInProviderCurrency != null && (
                            <div className="text-xs text-slate-400 tabular-nums leading-tight">
                              {currency !== "QAR" && <div>{currency} {fmt(totalInProviderCurrency)}</div>}
                              <div className={isLowest ? "text-emerald-700 font-semibold" : ""}>
                                {isLowest && <Star className="w-2.5 h-2.5 inline mr-0.5 text-emerald-500" />}
                                @ QAR {fmt(totalQAR)}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-slate-50 border-t-2 border-slate-200">
              <td colSpan={3} className="py-3 px-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wide">Total (QAR)</td>
              {sortedProviders.map((p) => {
                const rate = p.exchange_rate || 1;
                // Recalculate from unit_price * qty to avoid stale total_price values
                const total = sortedItems.reduce((sum, item) => {
                  const q = getQuote(item.id, p.id);
                  if (q?.unit_price == null) return sum;
                  return sum + q.unit_price * (item.quantity || 1) * rate;
                }, 0);
                const freight = (p.freight_charges || 0) * rate;
                return (
                  <td key={p.id} className="py-3 px-3 text-center">
                    <div className="font-bold text-slate-900 tabular-nums text-sm">QAR {fmt(total)}</div>
                    {freight > 0 && <div className="text-xs text-slate-400">+QAR {fmt(freight)} freight</div>}
                    <div className="text-xs font-semibold text-slate-600 border-t border-slate-200 mt-1 pt-1">
                      QAR {fmt(total + freight)}
                    </div>
                  </td>
                );
              })}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}