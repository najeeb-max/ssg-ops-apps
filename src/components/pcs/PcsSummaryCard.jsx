import { DollarSign, TrendingDown, Percent, Award } from "lucide-react";

export default function PcsSummaryCard({ sheet, lineItems, providers, quotes }) {
  const sellingTotal = (lineItems || []).reduce((sum, i) => sum + (i.total_selling_price || 0), 0);

  const getProviderTotalQAR = (provider) => {
    const rate = provider?.exchange_rate || 1;
    return (quotes || []).filter(q => q.provider_id === provider.id).reduce((sum, q) => sum + (q.total_price || 0) * rate, 0) || 0;
  };

  const providerTotals = (providers || [])
    .map(p => ({ id: p.id, name: p.name, total: getProviderTotalQAR(p), freight: (p.freight_charges || 0) * (p.exchange_rate || 1) }))
    .filter(p => p.total > 0)
    .sort((a, b) => (a.total + a.freight) - (b.total + b.freight));

  const lowestTotal = providerTotals.length > 0 ? providerTotals[0].total + providerTotals[0].freight : 0;
  const savings = sellingTotal > 0 && lowestTotal > 0 ? sellingTotal - lowestTotal : 0;
  const savingsPercent = sellingTotal > 0 && savings > 0 ? ((savings / sellingTotal) * 100).toFixed(1) : 0;

  const rows = lineItems?.length || 0;
  const cols = providers?.length || 0;
  const total = rows * cols;
  const filled = quotes?.length || 0;
  const pct = total > 0 ? Math.round((filled / total) * 100) : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {/* Selling Value */}
      <div className="bg-white rounded-lg border border-slate-200 px-4 py-2.5 flex items-center gap-3">
        <div className="w-7 h-7 bg-blue-50 rounded-md flex items-center justify-center shrink-0">
          <DollarSign className="w-3.5 h-3.5 text-blue-600" />
        </div>
        <div>
          <p className="text-[11px] font-medium text-slate-500">Selling Price</p>
          <p className="text-base font-bold text-slate-900 leading-tight">QAR {sellingTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p className="text-[11px] text-slate-400">{lineItems?.length || 0} items</p>
        </div>
      </div>

      {/* Best Offer */}
      <div className="bg-white rounded-lg border border-slate-200 px-4 py-2.5 flex items-center gap-3">
        <div className="w-7 h-7 bg-emerald-50 rounded-md flex items-center justify-center shrink-0">
          <Award className="w-3.5 h-3.5 text-emerald-600" />
        </div>
        <div>
          <p className="text-[11px] font-medium text-slate-500">Best Offer</p>
          <p className="text-base font-bold text-slate-900 leading-tight">QAR {lowestTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p className="text-[11px] text-slate-400">{providerTotals.length > 0 ? providerTotals[0].name : "No quotes yet"}</p>
        </div>
      </div>

      {/* Margin */}
      <div className="bg-white rounded-lg border border-slate-200 px-4 py-2.5 flex items-center gap-3">
        <div className="w-7 h-7 bg-amber-50 rounded-md flex items-center justify-center shrink-0">
          <TrendingDown className="w-3.5 h-3.5 text-amber-600" />
        </div>
        <div>
          <p className="text-[11px] font-medium text-slate-500">Operating Margin</p>
          <p className={`text-base font-bold leading-tight ${savings > 0 ? "text-amber-900" : "text-slate-400"}`}>
            {savings > 0 ? `QAR ${savings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "-"}
          </p>
          <p className="text-[11px] text-slate-400">{savings > 0 ? `${savingsPercent}% margin` : "Enter quotes"}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white rounded-lg border border-slate-200 px-4 py-2.5 flex items-center gap-3">
        <div className="w-7 h-7 bg-slate-50 rounded-md flex items-center justify-center shrink-0">
          <Percent className="w-3.5 h-3.5 text-slate-600" />
        </div>
        <div className="flex-1">
          <p className="text-[11px] font-medium text-slate-500">Order Progress</p>
          <p className="text-base font-bold text-slate-900 leading-tight">{pct}%</p>
          <div className="h-1 bg-slate-100 rounded-full overflow-hidden mt-0.5">
            <div className={`h-full rounded-full transition-all ${pct === 100 ? "bg-emerald-500" : pct > 50 ? "bg-amber-400" : "bg-blue-500"}`} style={{ width: `${pct}%` }} />
          </div>
          <p className="text-[11px] text-slate-400">{filled}/{total} filled</p>
        </div>
      </div>
    </div>
  );
}