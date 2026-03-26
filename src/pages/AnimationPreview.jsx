import { useState } from "react";
import Header from "@/components/Header";
import ProviderFormPreview from "@/components/pcs/ProviderFormPreview";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function AnimationPreview() {
  const [selected, setSelected] = useState(null);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="pt-24 px-4 md:px-6 pb-8 max-w-4xl mx-auto">
        <Link to="/pcs" className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to PCS
        </Link>

        <div className="bg-white rounded-2xl border border-slate-200 p-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Form Animation Styles</h1>
          <p className="text-slate-600 mb-8">Choose how the sample provider data should appear when adding a new supplier:</p>

          <ProviderFormPreview onSelect={setSelected} />

          {selected && (
            <div className="mt-8 pt-8 border-t border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Details</h2>
              <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                {selected === "typewriter" && (
                  <>
                    <p><strong>Typewriter Effect:</strong> Characters appear one by one, creating a classic typing animation.</p>
                    <p className="text-sm text-slate-600">Best for: Elegant, nostalgic feel. Good for grabbing attention.</p>
                  </>
                )}
                {selected === "staggered" && (
                  <>
                    <p><strong>Staggered Fade:</strong> Each field fades in smoothly with a slight delay between them.</p>
                    <p className="text-sm text-slate-600">Best for: Clean, modern appearance. Professional and subtle.</p>
                  </>
                )}
                {selected === "morph" && (
                  <>
                    <p><strong>Placeholder Morph:</strong> The placeholder text smoothly transitions into the actual value.</p>
                    <p className="text-sm text-slate-600">Best for: Minimal, elegant. Users see the transformation naturally.</p>
                  </>
                )}
                {selected === "pulse" && (
                  <>
                    <p><strong>Pulse Fill:</strong> The field fills progressively with a visual progress bar underneath.</p>
                    <p className="text-sm text-slate-600">Best for: Dynamic, engaging. Shows loading/completion progress.</p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}