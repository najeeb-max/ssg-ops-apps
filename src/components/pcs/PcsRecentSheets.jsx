import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Building2, Hash, Calendar, Truck } from "lucide-react";

const statusStyles = {
  draft: "bg-slate-100 text-slate-600 border-slate-200",
  in_progress: "bg-amber-50 text-amber-700 border-amber-200",
  pending_approval: "bg-blue-50 text-blue-700 border-blue-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  awarded: "bg-violet-50 text-violet-700 border-violet-200",
  ordered: "bg-indigo-50 text-indigo-700 border-indigo-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

function SheetTile({ sheet, providers, lineItems, quotes }) {
  const sheetProviders = providers.filter((p) => p.pcs_id === sheet.id);
  const sheetItems = lineItems.filter((i) => i.pcs_id === sheet.id);
  const sheetQuotes = quotes.filter((q) => q.pcs_id === sheet.id);

  const totalCells = sheetItems.length * sheetProviders.length;
  const filledCells = sheetQuotes.length;
  const progressPct = totalCells > 0 ? Math.round((filledCells / totalCells) * 100) : 0;

  const providerTotals = sheetProviders
    .map((p) => ({
      name: p.name,
      total: sheetQuotes.filter((q) => q.provider_id === p.id).reduce((s, q) => s + (q.total_price || 0), 0),
    }))
    .filter((p) => p.total > 0)
    .sort((a, b) => a.total - b.total);

  const sellingTotal = sheetItems.reduce((s, i) => s + (i.total_selling_price || 0), 0);
  const bestCost = providerTotals.length > 0 ? providerTotals[0] : null;
  const awardedVendors = sheetProviders.filter((p) => p.is_awarded);

  const barColor = progressPct === 100 ? "bg-emerald-500" : progressPct > 50 ? "bg-amber-400" : "bg-blue-500";

  return (
    <Link to={`/pcs-detail?id=${sheet.id}`}>
      <div className="bg-white border border-slate-200 hover:border-red-300 hover:shadow-md rounded-xl p-4 transition-all flex gap-4 items-start cursor-pointer">
        <div className="w-10 h-10 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Hash className="w-4 h-4 text-red-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-bold text-slate-900">{sheet.pcs_number}</span>
            <Badge className={statusStyles[sheet.status]}>{sheet.status?.replace("_", " ")}</Badge>
                  {awardedVendors.length > 1 && <Badge className="bg-blue-50 text-blue-600 border-blue-200 text-xs">split order</Badge>}
            {sheet.tradeflow_order_ref && (
              <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs flex items-center gap-1">
                <Truck className="w-2.5 h-2.5" />{sheet.tradeflow_order_ref}
              </Badge>
            )}
          </div>
          <p className="text-sm text-slate-600 flex items-center gap-1 mb-1">
            <Building2 className="w-3.5 h-3.5" />{sheet.client_name}
          </p>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-slate-400">
            {sheet.po_number && <span>PO: {sheet.po_number}</span>}
            {sheet.rfq_number && <span>RFQ: {sheet.rfq_number}</span>}
            {sheet.date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{format(new Date(sheet.date), "MMM d, yyyy")}</span>}
          </div>
          {totalCells > 0 && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Quotes {progressPct}%</span>
                <span>{sheetProviders.length} vendor{sheetProviders.length !== 1 ? "s" : ""}</span>
              </div>
              <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${progressPct}%` }} />
              </div>
            </div>
          )}
        </div>
        <div className="text-right flex-shrink-0">
          {sellingTotal > 0 ? (
            <div>
              <p className="text-xs text-slate-400">Selling</p>
              <p className="font-bold text-slate-900 text-sm">{sellingTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
          ) : bestCost ? (
            <div>
              <p className="text-xs text-slate-400">Best Quote</p>
              <p className="font-bold text-slate-900 text-sm">{bestCost.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
          ) : (
            <p className="text-xs text-slate-300">No quotes</p>
          )}
          <ArrowRight className="w-4 h-4 text-slate-300 mt-1 ml-auto" />
        </div>
      </div>
    </Link>
  );
}

export default function PcsRecentSheets({ sheets, searchActive, allProviders = [], allLineItems = [], allQuotes = [] }) {
  const sorted = [...sheets].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
  const recent = searchActive
    ? sorted
    : sorted.filter((s) => s.status !== "completed");

  if (recent.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        {searchActive ? "No sheets match your search." : "No active sheets. All completed/awarded or none exist yet."}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-slate-700">{searchActive ? `${recent.length} result${recent.length !== 1 ? "s" : ""} found` : "Active Sheets"}</h2>
        <Link to="/pcs-sheets" className="text-sm text-red-600 hover:underline font-medium">View all</Link>
      </div>
      <div className="space-y-3">
        {recent.map((sheet) => (
          <SheetTile
            key={sheet.id}
            sheet={sheet}
            providers={allProviders}
            lineItems={allLineItems}
            quotes={allQuotes}
          />
        ))}
      </div>
    </div>
  );
}