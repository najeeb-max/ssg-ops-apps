import { useState, useRef, useCallback, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { ImagePlus, Loader2, CheckCircle2, X, Trash2, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function PcsImageImportDropzone({ pcsId, lineItems }) {
  const queryClient = useQueryClient();
  const [dragging, setDragging] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [preview, setPreview] = useState(null);
  const inputRef = useRef();

  const bulkCreate = useMutation({
    mutationFn: async (items) => {
      const nextNum = (lineItems?.length || 0) + 1;
      const records = items.map((item, i) => ({
        pcs_id: pcsId,
        item_number: nextNum + i,
        description: item.description,
        unit: item.unit || "",
        quantity: item.quantity || 0,
        selling_price: item.selling_price || 0,
        total_selling_price: (item.quantity || 0) * (item.selling_price || 0),
      }));
      return base44.entities.LineItem.bulkCreate(records);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["line-items", pcsId] });
      toast.success(`${preview.items.length} line items created!`);
      setPreview(null);
    },
  });

  const extractFromImage = async (file) => {
    setExtracting(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Extract all line items from this image. For each row in the table extract: description (full text), unit (e.g. MTR, PCS, PKT, SET), quantity (number), selling_price (unit price as number, 0 if not shown). Return ONLY the JSON array, no explanation.`,
        file_urls: [file_url],
        response_json_schema: {
          type: "object",
          properties: {
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  description: { type: "string" },
                  unit: { type: "string" },
                  quantity: { type: "number" },
                  selling_price: { type: "number" },
                },
              },
            },
          },
        },
      });
      if (!result?.items?.length) throw new Error("No items found in image");
      setPreview({ url: file_url, items: result.items });
    } catch (err) {
      toast.error("Could not extract items: " + err.message);
    } finally {
      setExtracting(false);
    }
  };

  const handleFiles = (files) => {
    const file = [...files].find((f) => f.type.startsWith("image/"));
    if (!file) return toast.error("Please drop an image file");
    extractFromImage(file);
  };

  const handleDrop = useCallback((e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }, []);

  const handlePaste = useCallback((e) => {
    if (preview || extracting) return;
    const items = [...e.clipboardData.items];
    const imgItem = items.find((i) => i.type.startsWith("image/"));
    if (imgItem) handleFiles([imgItem.getAsFile()]);
  }, [preview, extracting]);

  useEffect(() => {
    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [handlePaste]);

  const updateItem = (idx, field, value) => {
    setPreview((prev) => {
      const items = [...prev.items];
      items[idx] = { ...items[idx], [field]: value };
      return { ...prev, items };
    });
  };

  const removeItem = (idx) => {
    setPreview((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));
  };

  return (
    <div className="mb-3">
      {!preview && !extracting && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          style={{ resize: "horizontal", overflow: "hidden", minWidth: "220px", maxWidth: "100%" }}
          className={`flex items-center justify-center gap-3 border-2 border-dashed rounded-xl py-3 px-4 cursor-pointer transition-all ${dragging ? "border-red-400 bg-red-50" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/80"}`}
        >
          <ImagePlus className={`w-4 h-4 ${dragging ? "text-red-500" : "text-slate-400"}`} />
          <div className="text-center">
            <p className="text-xs font-medium text-slate-600">{dragging ? "Release to extract line items" : "Drop a screenshot or click to upload"}</p>
            <p className="text-xs text-slate-400">Paste from clipboard • PO · RFQ · Quotation tables</p>
          </div>
          <span className="ml-auto text-xs bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5 rounded font-medium">AI Extract</span>
          <input type="file" accept="image/*" className="hidden" ref={inputRef} onChange={(e) => handleFiles(e.target.files)} />
        </div>
      )}

      {extracting && (
        <div className="flex flex-col items-center gap-2 py-6 bg-blue-50 rounded-xl border border-blue-100">
          <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
          <p className="text-sm font-medium text-blue-700">AI is reading your image...</p>
          <p className="text-xs text-blue-500">Extracting descriptions, units, quantities & prices</p>
        </div>
      )}

      {preview && (
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-slate-700">{preview.items.length} items extracted — review & confirm</span>
            </div>
            <button onClick={() => setPreview(null)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-2 px-3 text-xs text-slate-500">Description</th>
                  <th className="text-left py-2 px-3 text-xs text-slate-500">Unit</th>
                  <th className="text-left py-2 px-3 text-xs text-slate-500">Qty</th>
                  <th className="text-left py-2 px-3 text-xs text-slate-500">Price</th>
                  <th className="py-2 px-3"></th>
                </tr>
              </thead>
              <tbody>
                {preview.items.map((item, idx) => (
                  <tr key={idx} className="border-b border-slate-50">
                    <td className="py-1.5 px-2"><input className="w-full text-xs border rounded px-2 py-1" value={item.description} onChange={(e) => updateItem(idx, "description", e.target.value)} /></td>
                    <td className="py-1.5 px-2"><input className="w-16 text-xs border rounded px-2 py-1" value={item.unit} onChange={(e) => updateItem(idx, "unit", e.target.value)} /></td>
                    <td className="py-1.5 px-2"><input type="number" className="w-20 text-xs border rounded px-2 py-1" value={item.quantity} onChange={(e) => updateItem(idx, "quantity", parseFloat(e.target.value) || 0)} /></td>
                    <td className="py-1.5 px-2"><input type="number" className="w-24 text-xs border rounded px-2 py-1" value={item.selling_price} onChange={(e) => updateItem(idx, "selling_price", parseFloat(e.target.value) || 0)} /></td>
                    <td className="py-1.5 px-2"><button onClick={() => removeItem(idx)} className="text-slate-300 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-end gap-2 px-4 py-3 bg-slate-50">
            <Button variant="outline" size="sm" onClick={() => setPreview(null)}>Cancel</Button>
            <Button size="sm" onClick={() => bulkCreate.mutate(preview.items)} disabled={bulkCreate.isPending || preview.items.length === 0} className="bg-red-600 hover:bg-red-700 text-white gap-1.5">
              {bulkCreate.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              Create {preview.items.length} Items
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}