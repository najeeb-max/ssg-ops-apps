import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { ImagePlus, X, Loader2, ZoomIn } from "lucide-react";
import { toast } from "sonner";

export default function LineItemImageAttachment({ item, canEdit, pcsId }) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [lightbox, setLightbox] = useState(null); // url to preview full size

  const images = item.image_urls || [];

  const updateImages = async (newUrls) => {
    await base44.entities.LineItem.update(item.id, { image_urls: newUrls });
    queryClient.invalidateQueries({ queryKey: ["line-items", pcsId] });
  };

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const uploads = await Promise.all(
        files.map((file) => base44.integrations.Core.UploadFile({ file }))
      );
      const newUrls = uploads.map((r) => r.file_url);
      await updateImages([...images, ...newUrls]);
      toast.success(`${newUrls.length} image${newUrls.length > 1 ? "s" : ""} attached`);
    } catch (err) {
      toast.error("Upload failed: " + err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemove = async (url) => {
    await updateImages(images.filter((u) => u !== url));
    toast.success("Image removed");
  };

  return (
    <>
      <div className="flex items-center gap-1.5 flex-wrap">
        {/* Thumbnails */}
        {images.map((url, idx) => (
          <div key={idx} className="relative group w-8 h-8 flex-shrink-0">
            <img
              src={url}
              alt={`img-${idx}`}
              className="w-8 h-8 object-cover rounded border border-slate-200 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => setLightbox(url)}
            />
            {canEdit && (
              <button
                onClick={() => handleRemove(url)}
                className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full hidden group-hover:flex items-center justify-center shadow"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            )}
          </div>
        ))}

        {/* Upload button */}
        {canEdit && (
          <>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-8 h-8 flex-shrink-0 flex items-center justify-center border border-dashed border-slate-300 rounded hover:border-blue-400 hover:bg-blue-50 transition-colors text-slate-400 hover:text-blue-500"
              title="Attach image"
            >
              {uploading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ImagePlus className="w-3.5 h-3.5" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleUpload}
            />
          </>
        )}

        {/* Show count badge if no edit mode but images exist */}
        {!canEdit && images.length > 0 && (
          <button
            onClick={() => setLightbox(images[0])}
            className="text-xs text-blue-600 hover:underline flex items-center gap-1"
          >
            <ZoomIn className="w-3 h-3" /> {images.length}
          </button>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
          onClick={() => setLightbox(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] p-2" onClick={(e) => e.stopPropagation()}>
            <img src={lightbox} alt="Preview" className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" />
            {/* Navigate between images */}
            {images.length > 1 && (
              <div className="flex justify-center gap-2 mt-3">
                {images.map((url, idx) => (
                  <button
                    key={idx}
                    onClick={() => setLightbox(url)}
                    className={`w-12 h-12 rounded border-2 overflow-hidden transition-all ${lightbox === url ? "border-white" : "border-transparent opacity-60 hover:opacity-100"}`}
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
            <button
              onClick={() => setLightbox(null)}
              className="absolute top-0 right-0 w-8 h-8 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black/80"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}