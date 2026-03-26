import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export default function PcsQuickAddItem({ pcsId, lineItems, defaultOpen = false, onClose }) {
  const [open, setOpen] = useState(defaultOpen);
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

  const total = form.quantity && form.selling_price ? (parseFloat(form.quantity) * parseFloat(form.selling_price)).toFixed(2) : "0.00";

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      {!defaultOpen && (
        <div className="flex items-center gap-2 mb-3">
          <CollapsibleTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5 text-sm font-medium">
              <Plus className="w-3.5 h-3.5" /> Add New Line Item
              {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </Button>
          </CollapsibleTrigger>
        </div>
      )}
      <CollapsibleContent>
        <div className="rounded-xl p-1">
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
            <div className="flex items-center gap-2">
              {defaultOpen && onClose && (
                <Button size="sm" variant="ghost" onClick={onClose} className="text-slate-400 hover:text-slate-600">Cancel</Button>
              )}
              <Button size="sm" onClick={handleAdd} disabled={createMutation.isPending} className="bg-red-600 hover:bg-red-700 text-white gap-1.5">
                <Plus className="w-3.5 h-3.5" />{createMutation.isPending ? "Adding..." : "Add Item"}
              </Button>
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}