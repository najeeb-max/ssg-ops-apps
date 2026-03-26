import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Zap, Wind, Rocket } from "lucide-react";

const SAMPLE = {
  name: "Supplier Co.",
  contact_person: "John Doe",
  delivery_period: "4-6 weeks",
  payment_terms: "30 days",
  delivery_terms: "FOB, CIF...",
  freight_charges: "0",
  currency: "QAR",
};

// Style 1: Spring Bounce - smooth springy entrance
function SpringBouncePreview() {
  const [reset, setReset] = useState(0);
  const fields = [
    { label: "Company Name *", value: SAMPLE.name },
    { label: "Contact Person", value: SAMPLE.contact_person },
    { label: "Delivery Period", value: SAMPLE.delivery_period },
  ];

  useEffect(() => {
    const timer = setTimeout(() => setReset(prev => prev + 1), 2800);
    return () => clearTimeout(timer);
  }, [reset]);

  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-6 border border-blue-200">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <Rocket className="w-4 h-4 text-blue-600" />
          <h3 className="font-semibold text-blue-900">Spring Bounce</h3>
        </div>
        <Badge className="bg-blue-200 text-blue-700 text-xs font-bold">PREVIEW</Badge>
      </div>
      <div className="space-y-2.5">
        {fields.map((field, idx) => (
          <motion.div
            key={`${idx}-${reset}`}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 180, damping: 12, delay: idx * 0.12 }}
          >
            <label className="text-xs text-blue-700 mb-1 block font-medium">{field.label}</label>
            <Input
              value={field.value}
              readOnly
              disabled
              className="text-sm h-9 bg-slate-100 border-slate-300 text-slate-500 cursor-not-allowed opacity-70"
            />
          </motion.div>
        ))}
        <p className="text-xs text-blue-600 italic">Bouncy spring entrance...</p>
      </div>
    </div>
  );
}

// Style 2: Shimmer Gradient - gradient shimmer across field
function ShimmerPreview() {
  const [reset, setReset] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setReset(prev => prev + 1), 2500);
    return () => clearTimeout(timer);
  }, [reset]);

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl p-6 border border-emerald-200">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <Wind className="w-4 h-4 text-emerald-600" />
          <h3 className="font-semibold text-emerald-900">Shimmer Gradient</h3>
        </div>
        <Badge className="bg-emerald-200 text-emerald-700 text-xs font-bold">PREVIEW</Badge>
      </div>
      <div className="space-y-3">
        <div>
          <label className="text-xs text-emerald-700 mb-1 block font-medium">Company Name *</label>
          <div className="relative overflow-hidden rounded-md h-9 bg-slate-100 border border-slate-300 opacity-70">
            <motion.div
              key={reset}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-200 to-transparent"
              animate={{ x: ["100%", "-100%"] }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
            <div className="relative h-full px-3 flex items-center text-sm text-slate-500 font-medium">
              {SAMPLE.name}
            </div>
          </div>
        </div>
        <p className="text-xs text-emerald-600 italic">Gradient shimmers across the field...</p>
      </div>
    </div>
  );
}

// Style 3: Elastic Wave - text expands with elastic effect
function ElasticWavePreview() {
  const [reset, setReset] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setReset(prev => prev + 1), 2800);
    return () => clearTimeout(timer);
  }, [reset]);

  const letters = SAMPLE.name.split("");

  return (
    <div className="bg-gradient-to-br from-violet-50 to-violet-100/50 rounded-xl p-6 border border-violet-200">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-violet-600" />
          <h3 className="font-semibold text-violet-900">Elastic Wave</h3>
        </div>
        <Badge className="bg-violet-200 text-violet-700 text-xs font-bold">PREVIEW</Badge>
      </div>
      <div className="space-y-3">
        <div>
          <label className="text-xs text-violet-700 mb-1 block font-medium">Company Name *</label>
          <div className="h-9 bg-slate-100 border border-slate-300 rounded-md px-3 flex items-center gap-0.5 text-sm font-medium text-slate-500 opacity-70">
            {letters.map((char, idx) => (
              <motion.span
                key={`${idx}-${reset}`}
                initial={{ scaleY: 0.5, opacity: 0 }}
                animate={{ scaleY: 1, opacity: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 120,
                  damping: 8,
                  delay: idx * 0.05,
                }}
                style={{ transformOrigin: "center" }}
              >
                {char}
              </motion.span>
            ))}
          </div>
        </div>
        <p className="text-xs text-violet-600 italic">Each letter bounces in with elastic motion...</p>
      </div>
    </div>
  );
}

// Style 4: Glow Pulse - field glows while content appears
function GlowPulsePreview() {
  const [reset, setReset] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setReset(prev => prev + 1), 2600);
    return () => clearTimeout(timer);
  }, [reset]);

  return (
    <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-xl p-6 border border-amber-200">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-600" />
          <h3 className="font-semibold text-amber-900">Glow Pulse</h3>
        </div>
        <Badge className="bg-amber-200 text-amber-700 text-xs font-bold">PREVIEW</Badge>
      </div>
      <div className="space-y-3">
        <div>
          <label className="text-xs text-amber-700 mb-1 block font-medium">Company Name *</label>
          <motion.div
            key={reset}
            initial={{ boxShadow: "0 0 0px rgba(217, 119, 6, 0)" }}
            animate={{ boxShadow: ["0 0 0px rgba(217, 119, 6, 0)", "0 0 12px rgba(217, 119, 6, 0.6)", "0 0 0px rgba(217, 119, 6, 0)"] }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="relative rounded-md"
          >
            <Input
              value={SAMPLE.name}
              readOnly
              disabled
              className="text-sm h-9 bg-slate-100 border-slate-300 text-slate-500 cursor-not-allowed opacity-70 relative z-10"
            />
          </motion.div>
        </div>
        <p className="text-xs text-amber-600 italic">Field glows with pulsing aura...</p>
      </div>
    </div>
  );
}

export default function ProviderFormPreview({ onSelect }) {
  const [selected, setSelected] = useState(null);

  const handleSelect = (style) => {
    setSelected(style);
    if (onSelect) onSelect(style);
  };

  return (
    <div className="space-y-4">
      <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
        <h2 className="text-sm font-semibold text-slate-700 mb-2">Choose Animation Style</h2>
        <p className="text-xs text-slate-500 mb-4">See how sample data can appear more interactive:</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button onClick={() => handleSelect("spring")} className={`text-left transition-all ${selected === "spring" ? "ring-2 ring-blue-400" : ""}`}>
          <SpringBouncePreview />
        </button>

        <button onClick={() => handleSelect("shimmer")} className={`text-left transition-all ${selected === "shimmer" ? "ring-2 ring-emerald-400" : ""}`}>
          <ShimmerPreview />
        </button>

        <button onClick={() => handleSelect("wave")} className={`text-left transition-all ${selected === "wave" ? "ring-2 ring-violet-400" : ""}`}>
          <ElasticWavePreview />
        </button>

        <button onClick={() => handleSelect("glow")} className={`text-left transition-all ${selected === "glow" ? "ring-2 ring-amber-400" : ""}`}>
          <GlowPulsePreview />
        </button>
      </div>

      {selected && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <p className="text-sm font-medium text-emerald-900">
            ✓ Selected: <span className="capitalize">{selected}</span> style
          </p>
          <p className="text-xs text-emerald-700 mt-1">This will be applied to the provider form inputs when adding new suppliers.</p>
        </div>
      )}
    </div>
  );
}