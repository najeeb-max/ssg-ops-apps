import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Users, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function PcsProvidersSection({ pcsId, providers, canEdit = true }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    name: "", contact_person: "", delivery_period: "", payment_terms: "", delivery_terms: "", currency: "QAR",
    provider_number: (providers?.length || 0) + 1,
  });

  const canAddMore = !providers || providers.length < 4;

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Provider.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["providers", pcsId] });
      setOpen(false);
      setForm({ name: "", contact_person: "", delivery_period: "", payment_terms: "", delivery_terms: "", currency: "QAR", provider_number: (providers?.length || 0) + 2 });
      toast.success("Provider added");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Provider.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["providers", pcsId] }); toast.success("Provider removed"); },
  });

  const awardMutation = useMutation({
    mutationFn: ({ id, isAwarded }) => base44.entities.Provider.update(id, { is_awarded: isAwarded }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["providers", pcsId] }); toast.success("Updated"); },
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-slate-800 flex items-center gap-2">
          <Users className="w-4 h-4" />
          Suppliers <span className="text-slate-400 font-normal text-sm">({providers?.length || 0}/4)</span>
        </h2>
        {canEdit && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" disabled={!canAddMore} className="bg-red-600 hover:bg-red-700 text-white gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Add Provider {providers?.length ? `(${providers.length}/4)` : ""}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Provider</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Provider #</Label><Input type="number" value={form.provider_number} onChange={(e) => setForm({ ...form, provider_number: parseInt(e.target.value) || 0 })} /></div>
                <div><Label className="text-xs">Currency</Label><Input value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} /></div>
              </div>
              <div><Label className="text-xs">Provider Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label className="text-xs">Contact Person</Label><Input value={form.contact_person} onChange={(e) => setForm({ ...form, contact_person: e.target.value })} /></div>
              <div><Label className="text-xs">Delivery Period</Label><Input value={form.delivery_period} onChange={(e) => setForm({ ...form, delivery_period: e.target.value })} /></div>
              <div><Label className="text-xs">Payment Terms</Label><Input value={form.payment_terms} onChange={(e) => setForm({ ...form, payment_terms: e.target.value })} /></div>
              <div><Label className="text-xs">Delivery Terms</Label><Input value={form.delivery_terms} onChange={(e) => setForm({ ...form, delivery_terms: e.target.value })} /></div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={() => { if (!form.name) { toast.error("Name required"); return; } createMutation.mutate({ ...form, pcs_id: pcsId }); }} disabled={createMutation.isPending} className="bg-red-600 hover:bg-red-700 text-white">
                  {createMutation.isPending ? "Adding..." : "Add Provider"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        )}
      </div>

      {(!providers || providers.length === 0) ? (
        <div className="text-center py-8 text-slate-400 text-sm">No suppliers yet. Add up to 4 to compare quotes.</div>
      ) : (
        <div className="space-y-3">
          {providers.sort((a, b) => (a.provider_number || 0) - (b.provider_number || 0)).map((prov) => (
            <div key={prov.id} className={`rounded-xl border p-3 ${prov.is_awarded ? "border-emerald-200 bg-emerald-50" : "border-slate-100 bg-slate-50"}`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 text-sm">{prov.name}</span>
                    {prov.is_awarded && <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">✓ AWARDED</Badge>}
                  </div>
                  {prov.contact_person && <p className="text-xs text-slate-500 mt-0.5">{prov.contact_person}</p>}
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-slate-400">
                    {prov.currency && <span>Currency: {prov.currency}</span>}
                    {prov.delivery_period && <span>Delivery: {prov.delivery_period}</span>}
                    {prov.payment_terms && <span>Payment: {prov.payment_terms}</span>}
                  </div>
                </div>
                {canEdit && (
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => awardMutation.mutate({ id: prov.id, isAwarded: !prov.is_awarded })} className="text-xs h-7 px-2">
                    {prov.is_awarded ? "Remove Award" : "Award This"}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-300 hover:text-destructive" onClick={() => deleteMutation.mutate(prov.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}