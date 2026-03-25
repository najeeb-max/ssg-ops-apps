import React from "react";
import { GitBranch } from "lucide-react";

export default function PcsSplitOrderSummary({ lineItems, providers, quotes }) {
  const awardedItems = (lineItems || []).filter(i => i.awarded_provider_id);

  if (awardedItems.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-800 flex items-center gap-2 mb-3"><GitBranch className="w-4 h-4" />Split Order Summary</h2>
        <p className="text-center text-slate-400 text-sm py-4">Award individual line items to vendors in the comparison table to see a split order summary here.</p>
      </div>
    );
  }

  const providerMap = {};
  awardedItems.forEach(item => {
    const pid = item.awarded_provider_id;
    if (!providerMap[pid]) providerMap[pid] = { items: [], total: 0 };
    const quote = (quotes || []).find(q => q.line_item_id === item.id && q.provider_id === pid);
    providerMap[pid].items.push({ item, quote });
    providerMap[pid].total += quote?.total_price || item.total_selling_price || 0;
  });

  const grandTotal = Object.values(providerMap).reduce((s, p) => s + p.total, 0);

  const colorClasses = [
    { bg: "bg-blue-50", border: "border-blue-200", header: "bg-blue-100 text-blue-900" },
    { bg: "bg-emerald-50", border: "border-emerald-200", header: "bg-emerald-100 text-emerald-900" },
    { bg: "bg-amber-50", border: "border-amber-200", header: "bg-amber-100 text-amber-900" },
    { bg: "bg-purple-50", border: "border-purple-200", header: "bg-purple-100 text-purple-900" },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-slate-800 flex items-center gap-2"><GitBranch className="w-4 h-4" />Split Order Summary</h2>
        <span className="text-sm font-bold text-slate-700">Grand Total: {grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(providerMap).map(([providerId, data], idx) => {
          const provider = (providers || []).find(p => p.id === providerId);
          const colors = colorClasses[idx % colorClasses.length];
          return (
            <div key={providerId} className={`rounded-xl border ${colors.border} ${colors.bg} overflow-hidden`}>
              <div className={`px-3 py-2 ${colors.header}`}>
                <p className="font-bold text-sm">{provider?.name || "Unknown"}</p>
                {provider?.delivery_period && <p className="text-xs opacity-70">{provider.delivery_period}</p>}
                <p className="text-xs opacity-70">{data.items.length} item{data.items.length > 1 ? "s" : ""}</p>
              </div>
              <div className="p-3 space-y-2">
                {data.items.map(({ item, quote }) => (
                  <div key={item.id} className="text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">#{item.item_number}</span>
                      <span className="font-medium text-slate-900">{(quote?.total_price || item.total_selling_price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <p className="text-slate-600 truncate">{item.description}</p>
                    <p className="text-slate-400">{item.quantity} {item.unit} × {quote?.unit_price?.toFixed(2) || "—"}</p>
                  </div>
                ))}
                <div className="border-t border-current/20 pt-2 flex justify-between text-sm font-bold">
                  <span>Subtotal</span>
                  <span>{data.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {awardedItems.length < (lineItems || []).length && (
        <p className="mt-3 text-xs text-amber-600">⚠ {(lineItems || []).length - awardedItems.length} item(s) not yet awarded to any vendor.</p>
      )}
    </div>
  );
}