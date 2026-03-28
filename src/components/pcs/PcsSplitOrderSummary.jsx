import { Badge } from "@/components/ui/badge";
import { Award } from "lucide-react";

const fmt = (n) =>
  n != null ? Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00";

export default function PcsSplitOrderSummary({ lineItems, providers, quotes }) {
  const sortedItems = [...(lineItems || [])].sort((a, b) => (a.item_number || 0) - (b.item_number || 0));
  const sortedProviders = [...(providers || [])].sort((a, b) => (a.provider_number || 0) - (b.provider_number || 0));

  // For each item, find the provider with the lowest QAR total
  const getLowestProvider = (item) => {
    let best = null;
    let bestQAR = Infinity;
    for (const p of sortedProviders) {
      const q = quotes.find((q) => q.line_item_id === item.id && q.provider_id === p.id);
      if (!q?.total_price) continue;
      const qar = q.total_price * (p.exchange_rate || 1);
      if (qar < bestQAR) { bestQAR = qar; best = { provider: p, quote: q, totalQAR: qar }; }
    }
    return best;
  };

  // Group items by their awarded provider
  const grouped = {};
  const unquoted = [];

  for (const item of sortedItems) {
    const best = getLowestProvider(item);
    if (!best) { unquoted.push(item); continue; }
    const pid = best.provider.id;
    if (!grouped[pid]) grouped[pid] = { provider: best.provider, items: [] };
    grouped[pid].items.push({ item, quote: best.quote, totalQAR: best.totalQAR });
  }

  if (Object.keys(grouped).length === 0 && unquoted.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/60 flex items-center gap-2">
        <Award className="w-4 h-4 text-violet-500" />
        <h2 className="font-semibold text-slate-800 text-sm">Split Order Summary</h2>
        <span className="text-xs text-slate-400 ml-1">- best price per line item</span>
      </div>

      <div className="p-5 space-y-5">
        {Object.values(grouped).map(({ provider: p, items }) => {
          const currency = p.currency || "QAR";
          const rate = p.exchange_rate || 1;
          const grandTotalQAR = items.reduce((s, r) => s + r.totalQAR, 0);
          const grandTotalNative = items.reduce((s, r) => s + (r.quote.total_price || 0), 0);

          return (
            <div key={p.id} className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-50 px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-3.5 h-3.5 text-violet-500" />
                  <span className="font-semibold text-slate-800 text-sm">{p.name}</span>
                  <Badge variant="outline" className="text-xs">{currency}</Badge>
                  {currency !== "QAR" && (
                    <span className="text-xs text-slate-400">@ {rate.toFixed(4)} per QAR</span>
                  )}
                </div>
                <div className="text-right">
                  {currency !== "QAR" && (
                    <div className="text-xs text-slate-400">{currency} {fmt(grandTotalNative)}</div>
                  )}
                  <div className="text-sm font-bold text-slate-900">QAR {fmt(grandTotalQAR)}</div>
                </div>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-2 px-4 text-xs font-semibold text-slate-400 uppercase w-8">#</th>
                    <th className="text-left py-2 px-4 text-xs font-semibold text-slate-400 uppercase">Description</th>
                    <th className="text-right py-2 px-4 text-xs font-semibold text-slate-400 uppercase w-16">Qty</th>
                    <th className="text-right py-2 px-4 text-xs font-semibold text-slate-400 uppercase w-32">Unit Price</th>
                    <th className="text-right py-2 px-4 text-xs font-semibold text-slate-400 uppercase w-36">Total (QAR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {items.map(({ item, quote, totalQAR }) => (
                    <tr key={item.id} className="hover:bg-emerald-50/30">
                      <td className="py-2 px-4 text-slate-400 text-xs font-mono">{item.item_number}</td>
                      <td className="py-2 px-4 text-slate-700">{item.description}</td>
                      <td className="py-2 px-4 text-right text-slate-600 tabular-nums">{item.quantity}</td>
                      <td className="py-2 px-4 text-right tabular-nums text-slate-600">
                        {currency} {fmt(quote.unit_price)}
                      </td>
                      <td className="py-2 px-4 text-right tabular-nums font-medium text-slate-900">
                        {currency !== "QAR" && (
                          <div className="text-xs text-slate-400">{currency} {fmt(quote.total_price)}</div>
                        )}
                        QAR {fmt(totalQAR)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}

        {unquoted.length > 0 && (
          <div className="border border-amber-100 rounded-xl overflow-hidden">
            <div className="bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700">
              Unquoted Items ({unquoted.length})
            </div>
            <ul className="divide-y divide-slate-50">
              {unquoted.map((item) => (
                <li key={item.id} className="px-4 py-2 text-sm text-slate-500 flex gap-3">
                  <span className="text-slate-300 font-mono text-xs">{item.item_number}</span>
                  {item.description}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}