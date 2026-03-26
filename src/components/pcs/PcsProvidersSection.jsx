import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TypewriterInput from "../TypewriterInput";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Users, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useFxRate } from "@/hooks/useFxRate";

const CURRENCIES = ["QAR", "USD", "EUR", "GBP", "AED", "SAR", "KWD", "OMR", "BHD", "JPY", "CNY"];

function ProviderForm({ pcsId, providerCount, onClose }) {
  const queryClient = useQueryClient();
  const { fetchRate, loading: fxLoading } = useFxRate();
  const [form, setForm] = useState({
    name: "",
    contact_person: "",
    delivery_period: "",
    payment_terms: "",
    delivery_terms: "",
    currency: "QAR",
    exchange_rate: 1,
    freight_charges: 0,
  });

  const handleCurrencyChange = async (currency) => {
    setForm((f) => ({ ...f, currency }));
    if (currency !== "QAR") {
      const rate = await fetchRate(currency);
      if (rate) setForm((f) => ({ ...f, currency, exchange_rate: rate }));
    } else {
      setForm((f) => ({ ...f, currency: "QAR", exchange_rate: 1 }));
    }
  };

  const handleRefreshRate = async () => {
    if (form.currency === "QAR") return;
    const rate = await fetchRate(form.currency);
    if (rate) setForm((f) => ({ ...f, exchange_rate: rate }));
  };

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Provider.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["providers", pcsId] });
      toast.success("Provider added");
      onClose();
    },
  });

  const handleSubmit = () => {
    if (!form.name.trim()) { toast.error("Provider name is required"); return; }
    createMutation.mutate({
      pcs_id: pcsId,
      provider_number: providerCount + 1,
      ...form,
      exchange_rate: parseFloat(form.exchange_rate) || 1,
      freight_charges: parseFloat(form.freight_charges) || 0,
    });
  };

  return (
    <div className="bg-blue-50/40 border border-blue-100 rounded-xl p-4 mt-3 space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-slate-500 mb-1 block">Company Name *</label>
          <TypewriterInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Supplier Co." className="text-sm h-9" />
        </div>
        <div>
          <label className="text-xs text-slate-500 mb-1 block">Contact Person</label>
          <TypewriterInput value={form.contact_person} onChange={(e) => setForm({ ...form, contact_person: e.target.value })} placeholder="John Doe" className="text-sm h-9" />
        </div>
        <div>
          <label className="text-xs text-slate-500 mb-1 block">Delivery Period</label>
          <TypewriterInput value={form.delivery_period} onChange={(e) => setForm({ ...form, delivery_period: e.target.value })} placeholder="4-6 weeks" className="text-sm h-9" />
        </div>
        <div>
          <label className="text-xs text-slate-500 mb-1 block">Payment Terms</label>
          <TypewriterInput value={form.payment_terms} onChange={(e) => setForm({ ...form, payment_terms: e.target.value })} placeholder="30 days" className="text-sm h-9" />
        </div>
        <div>
          <label className="text-xs text-slate-500 mb-1 block">Delivery Terms</label>
          <TypewriterInput value={form.delivery_terms} onChange={(e) => setForm({ ...form, delivery_terms: e.target.value })} placeholder="FOB, CIF..." className="text-sm h-9" />
        </div>
        <div>
          <label className="text-xs text-slate-500 mb-1 block">Freight Charges</label>
          <Input type="number" value={form.freight_charges} onChange={(e) => setForm({ ...form, freight_charges: e.target.value })} placeholder="0.00" className="text-sm h-9" />
        </div>
      </div>

      {/* Currency Row */}
      <div className="flex items-end gap-3">
        <div>
          <label className="text-xs text-slate-500 mb-1 block">Currency</label>
          <select
            value={form.currency}
            onChange={(e) => handleCurrencyChange(e.target.value)}
            className="text-sm h-9 border border-input rounded-md px-2 bg-background"
          >
            {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        {form.currency !== "QAR" && (
          <div className="flex items-end gap-2">
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Exchange Rate (1 {form.currency} = ? QAR)</label>
              <Input
                type="number"
                value={form.exchange_rate}
                onChange={(e) => setForm({ ...form, exchange_rate: e.target.value })}
                className="text-sm h-9 w-36"
              />
            </div>
            <Button variant="outline" size="icon" className="h-9 w-9" onClick={handleRefreshRate} disabled={fxLoading} title="Refresh live rate">
              {fxLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            </Button>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
        <Button size="sm" onClick={handleSubmit} disabled={createMutation.isPending} className="bg-red-600 hover:bg-red-700 text-white gap-1.5">
          {createMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
          Add Provider
        </Button>
      </div>
    </div>
  );
}

export default function PcsProvidersSection({ pcsId, providers, canEdit = true }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Provider.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["providers", pcsId] });
      toast.success("Provider removed");
    },
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50/60">
        <h2 className="font-semibold text-slate-800 flex items-center gap-2 text-sm">
          <Users className="w-4 h-4 text-slate-500" />
          Suppliers / Providers
          <span className="bg-slate-200 text-slate-600 text-xs font-semibold px-1.5 py-0.5 rounded-full">{providers?.length || 0}</span>
        </h2>
        {canEdit && (
          <Button size="sm" variant="outline" className="gap-1.5 text-xs h-7" onClick={() => setShowForm((v) => !v)}>
            <Plus className="w-3 h-3" /> Add Provider
          </Button>
        )}
      </div>

      <div className="px-5 py-4">
        {showForm && canEdit && (
          <ProviderForm pcsId={pcsId} providerCount={providers?.length || 0} onClose={() => setShowForm(false)} />
        )}

        {(!providers || providers.length === 0) && !showForm ? (
          <p className="text-center text-slate-400 text-sm py-6">No providers yet. Add one above.</p>
        ) : (
          <div className="overflow-x-auto mt-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">#</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Company</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Contact</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Delivery</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Payment</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Currency</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Freight</th>
                  <th className="w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {(providers || []).sort((a, b) => (a.provider_number || 0) - (b.provider_number || 0)).map((p, idx) => (
                  <tr key={p.id} className={`hover:bg-blue-50/30 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/30"}`}>
                    <td className="py-2 px-3 text-slate-400 font-mono text-xs">{p.provider_number}</td>
                    <td className="py-2 px-3 font-medium text-slate-800">{p.name}</td>
                    <td className="py-2 px-3 text-slate-600">{p.contact_person || "—"}</td>
                    <td className="py-2 px-3 text-slate-600">{p.delivery_period || "—"}</td>
                    <td className="py-2 px-3 text-slate-600">{p.payment_terms || "—"}</td>
                    <td className="py-2 px-3">
                      <Badge variant="outline" className="text-xs font-semibold">{p.currency || "QAR"}</Badge>
                      {p.currency && p.currency !== "QAR" && (
                        <span className="text-xs text-slate-400 ml-1">@ {(p.exchange_rate || 1).toFixed(4)}</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-600">
                      {p.freight_charges ? `${p.currency || "QAR"} ${Number(p.freight_charges).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "—"}
                    </td>
                    <td className="py-2 px-3">
                      {canEdit && (
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-300 hover:text-destructive hover:bg-red-50" onClick={() => deleteMutation.mutate(p.id)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}