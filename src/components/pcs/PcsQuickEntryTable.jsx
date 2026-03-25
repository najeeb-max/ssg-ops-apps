import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table as TableIcon, Save, MoreHorizontal, Award } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";

export default function PcsQuickEntryTable({ pcsId, lineItems, providers, quotes }) {
  const queryClient = useQueryClient();
  const [editingCell, setEditingCell] = useState(null);
  const [cellValue, setCellValue] = useState("");

  const sortedItems = [...(lineItems || [])].sort((a, b) => (a.item_number || 0) - (b.item_number || 0));
  const sortedProviders = [...(providers || [])].sort((a, b) => (a.provider_number || 0) - (b.provider_number || 0));

  const getQuote = (lineItemId, providerId) => quotes?.find(q => q.line_item_id === lineItemId && q.provider_id === providerId);
  const getEditKey = (lineItemId, providerId) => `${lineItemId}_${providerId}`;

  const createQuoteMutation = useMutation({
    mutationFn: (data) => base44.entities.ProviderQuote.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["quotes", pcsId] }),
  });
  const updateQuoteMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ProviderQuote.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["quotes", pcsId] }),
  });
  const deleteQuoteMutation = useMutation({
    mutationFn: (id) => base44.entities.ProviderQuote.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["quotes", pcsId] }),
  });
  const awardItemMutation = useMutation({
    mutationFn: ({ itemId, providerId }) => base44.entities.LineItem.update(itemId, { awarded_provider_id: providerId || null }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["line-items", pcsId] }); toast.success("Item awarded"); },
  });

  const handleCellClick = (lineItem, provider, quote) => {
    setEditingCell(getEditKey(lineItem.id, provider.id));
    setCellValue(quote?.unit_price?.toString() || "");
  };

  const handleSave = (lineItem, provider) => {
    const unitPrice = parseFloat(cellValue) || 0;
    if (unitPrice <= 0) { toast.error("Price must be greater than 0"); return; }
    const totalPrice = unitPrice * (lineItem.quantity || 0);
    const existing = getQuote(lineItem.id, provider.id);
    if (existing) {
      updateQuoteMutation.mutate({ id: existing.id, data: { unit_price: unitPrice, total_price: totalPrice } });
    } else {
      createQuoteMutation.mutate({ pcs_id: pcsId, provider_id: provider.id, line_item_id: lineItem.id, unit_price: unitPrice, total_price: totalPrice });
    }
    setEditingCell(null);
    setCellValue("");
  };

  const getProviderTotal = (providerId) =>
    quotes?.filter(q => q.provider_id === providerId).reduce((sum, q) => sum + (q.total_price || 0), 0) || 0;

  const lowestTotal = sortedProviders.length > 0
    ? Math.min(...sortedProviders.map(p => getProviderTotal(p.id)).filter(t => t > 0))
    : 0;

  if (!sortedItems.length || !sortedProviders.length) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-800 flex items-center gap-2 mb-4"><TableIcon className="w-4 h-4" />Price Comparison & Entry</h2>
        <div className="text-center py-8 text-slate-400 text-sm">Add line items and providers (max 4) to start comparing prices.</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-slate-800 flex items-center gap-2">
          <TableIcon className="w-4 h-4" />Price Comparison & Entry
        </h2>
        <span className="text-xs text-slate-400">{sortedItems.length} items × {sortedProviders.length} suppliers</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b-2 border-slate-200">
              <th className="text-left py-2 px-2 text-xs font-medium text-slate-500 whitespace-nowrap">#</th>
              <th className="text-left py-2 px-2 text-xs font-medium text-slate-500">Description</th>
              <th className="text-right py-2 px-2 text-xs font-medium text-slate-500 whitespace-nowrap">Qty</th>
              <th className="text-right py-2 px-2 text-xs font-medium text-slate-500 whitespace-nowrap">Your Price</th>
              <th className="text-right py-2 px-2 text-xs font-medium text-slate-500 whitespace-nowrap">Your Total</th>
              {sortedProviders.map((prov) => (
                <th key={prov.id} className="text-center py-2 px-2 text-xs font-medium text-blue-600 whitespace-nowrap min-w-[100px]">
                  {prov.name}
                  {prov.delivery_period && <div className="text-slate-400 font-normal">{prov.delivery_period}</div>}
                </th>
              ))}
              <th className="text-center py-2 px-2 text-xs font-medium text-slate-500">Award To</th>
            </tr>
          </thead>
          <tbody>
            {sortedItems.map((item) => (
              <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                <td className="py-2 px-2 text-slate-400 text-xs">{item.item_number}</td>
                <td className="py-2 px-2 text-slate-800 max-w-[150px] text-xs leading-tight">{item.description}</td>
                <td className="py-2 px-2 text-right text-slate-600 text-xs">{item.quantity?.toLocaleString()}</td>
                <td className="py-2 px-2 text-right text-slate-600 text-xs">{item.selling_price?.toFixed(2)}</td>
                <td className="py-2 px-2 text-right font-medium text-slate-900 text-xs">{item.total_selling_price?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                {sortedProviders.map((prov) => {
                  const quote = getQuote(item.id, prov.id);
                  const key = getEditKey(item.id, prov.id);
                  const isEditing = editingCell === key;
                  const isAwarded = item.awarded_provider_id === prov.id;
                  return (
                    <td key={prov.id} className={cn("py-1.5 px-2 text-center", isAwarded && "bg-emerald-50")}>
                      {isEditing ? (
                        <div className="flex flex-col gap-1 items-center">
                          <Input value={cellValue} onChange={(e) => setCellValue(e.target.value)} className="h-7 text-xs text-center w-24" autoFocus onKeyDown={(e) => { if (e.key === "Enter") handleSave(item, prov); if (e.key === "Escape") { setEditingCell(null); setCellValue(""); }}} />
                          <Button size="sm" className="h-6 text-xs px-2 bg-red-600 hover:bg-red-700" onClick={() => handleSave(item, prov)}><Save className="w-3 h-3" /></Button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-0.5">
                          <button onClick={() => handleCellClick(item, prov, quote)} className="cursor-pointer py-1 px-2 rounded hover:bg-blue-50 transition-colors w-full text-center">
                            {quote ? (
                              <div>
                                <div className="font-medium text-slate-900 text-xs">{quote.unit_price?.toFixed(2)}</div>
                                <div className="text-slate-400 text-xs">{quote.total_price?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                              </div>
                            ) : <span className="text-slate-300 text-xs">—</span>}
                            {isAwarded && <div className="text-emerald-600 text-xs font-bold mt-0.5">✓ AWARDED</div>}
                          </button>
                          {quote && !isEditing && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-5 w-5"><MoreHorizontal className="w-3 h-3" /></Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuLabel className="text-xs">Award item #{item.item_number}</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => awardItemMutation.mutate({ itemId: item.id, providerId: prov.id })} className="text-emerald-700 font-medium text-xs">Award to {prov.name}</DropdownMenuItem>
                                {item.awarded_provider_id === prov.id && <DropdownMenuItem onClick={() => awardItemMutation.mutate({ itemId: item.id, providerId: null })} className="text-slate-500 text-xs">Remove Award</DropdownMenuItem>}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => deleteQuoteMutation.mutate(quote.id)} className="text-destructive text-xs">Remove Quote</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      )}
                    </td>
                  );
                })}
                <td className="py-2 px-2 text-center text-xs">
                  {item.awarded_provider_id ? (
                    <span className="text-emerald-700 font-medium">{sortedProviders.find(p => p.id === item.awarded_provider_id)?.name || "—"}</span>
                  ) : (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-xs h-6 px-2 text-slate-400">+ Assign</Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel className="text-xs">Award item #{item.item_number} to:</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {sortedProviders.map(p => (
                          <DropdownMenuItem key={p.id} onClick={() => awardItemMutation.mutate({ itemId: item.id, providerId: p.id })} className="text-emerald-700 font-medium text-xs">{p.name}</DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-200 bg-slate-50">
              <td colSpan={4} className="py-2 px-2 text-right text-xs font-semibold text-slate-600">TOTALS</td>
              <td className="py-2 px-2 text-right font-bold text-slate-900 text-xs">
                {sortedItems.reduce((s, i) => s + (i.total_selling_price || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </td>
              {sortedProviders.map((prov) => {
                const total = getProviderTotal(prov.id);
                const isLowest = total > 0 && total === lowestTotal;
                return (
                  <td key={prov.id} className={cn("py-2 px-2 text-center text-xs font-bold", isLowest ? "text-emerald-700 bg-emerald-50" : "text-slate-700")}>
                    {total > 0 ? total.toLocaleString(undefined, { minimumFractionDigits: 2 }) : "—"}
                    {isLowest && <div className="text-emerald-500">★ Lowest</div>}
                  </td>
                );
              })}
              <td className="py-2 px-2 text-center text-xs text-slate-500">
                {(lineItems || []).filter(i => i.awarded_provider_id).length}/{(lineItems || []).length} awarded
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}