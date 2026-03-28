import { useState, useRef, useCallback, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { ImagePlus, Loader2, CheckCircle2, X, Trash2, Sparkles, Clipboard, Camera } from "lucide-react";
import { toast } from "sonner";

export default function PcsImageImportDropzone({ pcsId, lineItems }) {
  const queryClient = useQueryClient();
  const [dragging, setDragging] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [preview, setPreview] = useState(null);
  const [pasteReady, setPasteReady] = useState(false);
  const inputRef = useRef();

  // Flash the paste-ready indicator when window gets focus (user may have just taken a screenshot)
  useEffect(() => {
    const onFocus = () => { if (!preview && !extracting) setPasteReady(true); };
    const onBlur = () => setPasteReady(false);
    window.addEventListener("focus", onFocus);
    window.addEventListener("blur", onBlur);
    return () => { window.removeEventListener("focus", onFocus); window.removeEventListener("blur", onBlur); };
  }, [preview, extracting]);

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
    if (imgItem) { setPasteReady(false); handleFiles([imgItem.getAsFile()]); }
  }, [preview, extracting]);

  useEffect(() => {
    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [handlePaste]);

  // Programmatic clipboard read (modern browsers)
  const handleClipboardRead = async () => {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const imgType = item.types.find((t) => t.startsWith("image/"));
        if (imgType) {
          const blob = await item.getType(imgType);
          const file = new File([blob], "screenshot.png", { type: imgType });
          handleFiles([file]);
          return;
        }
      }
      toast.error("No image in clipboard - take a screenshot first (PrtScr / Cmd+Shift+4)");
    } catch {
      // Fallback: just trigger file picker
      inputRef.current?.click();
    }
  };

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
    <div>
      {!preview && !extracting && (
        <div className="space-y-2">
          {/* Main drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl px-4 py-5 cursor-pointer transition-all w-full ${
              dragging
                ? "border-red-400 bg-red-50 scale-[1.01]"
                : pasteReady
                ? "border-emerald-400 bg-emerald-50 shadow-sm"
                : "border-slate-200 hover:border-blue-300 hover:bg-blue-50/40"
            }`}
          >
            {dragging ? (
              <>
                <ImagePlus className="w-6 h-6 text-red-400" />
                <span className="text-sm font-medium text-red-600">Release to extract items</span>
              </>
            ) : pasteReady ? (
              <>
                <Clipboard className="w-6 h-6 text-emerald-500" />
                <span className="text-sm font-semibold text-emerald-700">Screenshot detected in clipboard!</span>
                <span className="text-xs text-emerald-600">Press <kbd className="bg-white border border-emerald-300 rounded px-1.5 py-0.5 font-mono text-xs">Ctrl+V</kbd> to paste &amp; extract instantly</span>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <Camera className="w-5 h-5 text-slate-400" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-slate-600">Drop a screenshot or click to browse</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Or take a screenshot and press <kbd className="bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 font-mono text-xs">Ctrl+V</kbd> / <kbd className="bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 font-mono text-xs">Cmd+V</kbd> anywhere
                    </p>
                  </div>
                  <span className="ml-auto flex-shrink-0 text-xs bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded font-semibold">AI Extract</span>
                </div>
              </>
            )}
          </div>

          {/* Quick paste button */}
          <button
            onClick={handleClipboardRead}
            className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg px-3 py-2 transition-colors"
          >
            <Clipboard className="w-3.5 h-3.5" />
            Paste Screenshot from Clipboard
          </button>

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
              <span className="text-sm font-medium text-slate-700">{preview.items.length} items extracted - review &amp; confirm</span>
            </div>
            <button onClick={() => setPreview(null)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm table-fixed">
              <colgroup>
                <col className="w-[55%]" />
                <col className="w-[10%]" />
                <col className="w-[13%]" />
                <col className="w-[16%]" />
                <col className="w-[6%]" />
              </colgroup>
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500">Description</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500">Unit</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500">Qty</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500">Price</th>
                  <th className="py-2 px-3"></th>
                </tr>
              </thead>
              <tbody>
                {preview.items.map((item, idx) => (
                  <tr key={idx} className="border-b border-slate-50">
                    <td className="py-1.5 px-2"><textarea className="w-full text-xs border rounded px-2 py-1.5 resize-none leading-snug" rows={2} value={item.description} onChange={(e) => updateItem(idx, "description", e.target.value)} /></td>
                    <td className="py-1.5 px-2"><input className="w-full text-xs border rounded px-2 py-1.5" value={item.unit} onChange={(e) => updateItem(idx, "unit", e.target.value)} /></td>
                    <td className="py-1.5 px-2"><input type="number" className="w-full text-xs border rounded px-2 py-1.5" value={item.quantity} onChange={(e) => updateItem(idx, "quantity", parseFloat(e.target.value) || 0)} /></td>
                    <td className="py-1.5 px-2"><input type="number" className="w-full text-xs border rounded px-2 py-1.5" value={item.selling_price} onChange={(e) => updateItem(idx, "selling_price", parseFloat(e.target.value) || 0)} /></td>
                    <td className="py-1.5 px-2 text-center"><button onClick={() => removeItem(idx)} className="text-slate-300 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button></td>
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