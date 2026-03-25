import React, { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, ChevronDown, ChevronUp, ScanLine, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export default function PcsQuickAddItem({ pcsId, lineItems }) {
  const [open, setOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const scanInputRef = useRef();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    description: "",
    unit: "PCS",
    quantity: "",
    selling_price: "",
    item_number: (lineItems?.length || 0) + 1,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.LineItem.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["line-items", pcsId] });
      setOpen(false);
      setForm({ description: "", unit: "PCS", quantity: "", selling_price: "", item_number: (lineItems?.length || 0) + 2 });
      toast.success("Item added");
    },
  });

  const handleAdd = () => {
    if (!form.description.trim()) { toast.error("Description is required"); return; }
    if (!form.quantity || parseFloat(form.quantity) <= 0) { toast.error("Quantity must be > 0"); return; }
    if (!form.selling_price || parseFloat(form.selling_price) <= 0) { toast.error("Selling price must be > 0"); return; }
    const qty = parseFloat(form.quantity);
    const price = parseFloat(form.selling_price);
    createMutation.mutate({ pcs_id: pcsId, item_number: form.item_number, description: form.description, unit: form.unit, quantity: qty, selling_price: price, total_selling_price: qty * price });
  };

  const handleScanFill = async (file) => {
    if (!file) return;
    setScanning(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Extract the FIRST or most prominent line item from this image. Return a single item with: description (full product description), unit (e.g. MTR, PCS, PKT), quantity (number), selling_price (unit price as number, 0 if not visible).`,
        file_urls: [file_url],
        response_json_schema: { type: "object", properties: { description: { type: "string" }, unit: { type: "string" }, quantity: { type: "number" }, selling_price: { type: "number" } } },
      });
      if (result?.description) {
        setForm((prev) => ({ ...prev, description: result.description || prev.description, unit: result.unit || prev.unit, quantity: result.quantity || prev.quantity, selling_price: result.selling_price || prev.selling_price }));
        setOpen(true);
        toast.success("Fields filled from screenshot");
      }
    } catch (err) {
      toast.error("Could not read screenshot: " + err.message);
    } finally {
      setScanning(false);
    }
  };

  const total = form.quantity && form.selling_price ? (parseFloat(form.quantity) * parseFloat(form.selling_price)).toFixed(2) : "0.00";

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="flex items-center gap-2 mb-3">
        <CollapsibleTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5 text-sm font-medium">
            <Plus className="w-3.5 h-3.5" /> Add New Line Item
            {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </Button>
        </CollapsibleTrigger>
        <button onClick={(e) => { e.stopPropagation(); scanInputRef.current?.click(); }} disabled={scanning} className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-60">
          {scanning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ScanLine className="w-3.5 h-3.5" />}
          {scanning ? "Scanning..." : "From Screenshot"}
        </button>
        <input type="file" accept="image/*" ref={scanInputRef} className="hidden" onChange={(e) => handleScanFill(e.target.files?.[0])} />
      </div>
      <CollapsibleContent>
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 mb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Item #</label>
              <Input type="number" value={form.item_number} onChange={(e) => setForm({ ...form, item_number: parseInt(e.target.value) || 0 })} className="text-sm h-9" />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Unit</label>
              <Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="text-sm h-9" />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Quantity</label>
              <Input type="number" placeholder="0" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} className="text-sm h-9" />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Selling Price</label>
              <Input type="number" placeholder="0.00" value={form.selling_price} onChange={(e) => setForm({ ...form, selling_price: e.target.value })} className="text-sm h-9" />
            </div>
          </div>
          <div className="mb-3">
            <label className="text-xs text-slate-500 mb-1 block">Description *</label>
            <Input placeholder="Full product description..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="text-sm" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Total: <span className="font-bold text-slate-900">{total}</span></span>
            <Button size="sm" onClick={handleAdd} disabled={createMutation.isPending} className="bg-red-600 hover:bg-red-700 text-white gap-1.5">
              <Plus className="w-3.5 h-3.5" />{createMutation.isPending ? "Adding..." : "Add Item"}
            </Button>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}