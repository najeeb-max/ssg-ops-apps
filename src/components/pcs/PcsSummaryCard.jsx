import React from "react";
import { DollarSign, TrendingDown, Percent, Award } from "lucide-react";

export default function PcsSummaryCard({ sheet, lineItems, providers, quotes }) {
  const sellingTotal = (lineItems || []).reduce((sum, i) => sum + (i.total_selling_price || 0), 0);

  const getProviderTotal = (providerId) =>
    (quotes || []).filter(q => q.provider_id === providerId).reduce((sum, q) => sum + (q.total_price || 0), 0) || 0;

  const providerTotals = (providers || [])
    .map(p => ({ id: p.id, name: p.name, total: getProviderTotal(p.id), freight: p.freight_charges || 0 }))
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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Selling Value */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
            <DollarSign className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-xs font-medium text-slate-500">Your Selling Price</p>
        </div>
        <p className="text-xl font-bold text-slate-900">{sellingTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        <p className="text-xs text-slate-400">{lineItems?.length || 0} items included</p>
      </div>

      {/* Best Offer */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xs font-medium text-slate-500">Best Offer</p>
        </div>
        <p className="text-xl font-bold text-slate-900">{lowestTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        <p className="text-xs text-slate-400">{providerTotals.length > 0 ? providerTotals[0].name : "No quotes yet"}</p>
      </div>

      {/* Margin */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
            <TrendingDown className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-xs font-medium text-slate-500">Operating Margin</p>
        </div>
        <p className={`text-xl font-bold ${savings > 0 ? "text-amber-900" : "text-slate-400"}`}>
          {savings > 0 ? savings.toLocaleString(undefined, { minimumFractionDigits: 2 }) : "—"}
        </p>
        <p className="text-xs text-slate-400">{savings > 0 ? `${savingsPercent}% less than your price` : "Enter quotes to see savings"}</p>
      </div>

      {/* Progress */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center">
            <Percent className="w-4 h-4 text-slate-600" />
          </div>
          <p className="text-xs font-medium text-slate-500">Order Progress</p>
        </div>
        <p className="text-xl font-bold text-slate-900">{pct}%</p>
        <div className="mt-1">
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${pct === 100 ? "bg-emerald-500" : pct > 50 ? "bg-amber-400" : "bg-blue-500"}`} style={{ width: `${pct}%` }} />
          </div>
          <p className="text-xs text-slate-400 mt-1">{filled}/{total} quotes filled</p>
        </div>
      </div>
    </div>
  );
}