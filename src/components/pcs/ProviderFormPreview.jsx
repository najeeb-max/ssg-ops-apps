import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Zap, Wind, Rocket, Droplet, Type, RotateCw } from "lucide-react";

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

// Style 5: Ink Drop - content spreads like ink
function InkDropPreview() {
  const [reset, setReset] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setReset(prev => prev + 1), 2700);
    return () => clearTimeout(timer);
  }, [reset]);

  return (
    <div className="bg-gradient-to-br from-rose-50 to-rose-100/50 rounded-xl p-6 border border-rose-200">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <Droplet className="w-4 h-4 text-rose-600" />
          <h3 className="font-semibold text-rose-900">Ink Drop</h3>
        </div>
        <Badge className="bg-rose-200 text-rose-700 text-xs font-bold">PREVIEW</Badge>
      </div>
      <div className="space-y-3">
        <div>
          <label className="text-xs text-rose-700 mb-1 block font-medium">Company Name *</label>
          <motion.div
            key={reset}
            initial={{ clipPath: "circle(0% at 0% 50%)" }}
            animate={{ clipPath: "circle(100% at 0% 50%)" }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="h-9 bg-slate-100 border border-slate-300 rounded-md px-3 flex items-center text-sm font-medium text-slate-500 opacity-70 overflow-hidden"
          >
            {SAMPLE.name}
          </motion.div>
        </div>
        <p className="text-xs text-rose-600 italic">Content spreads like ink from left...</p>
      </div>
    </div>
  );
}

// Style 6: Typewriter with Cursor
function TypewriterPreview() {
  const [reset, setReset] = useState(0);
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    const text = SAMPLE.name;
    if (displayText.length < text.length) {
      const timer = setTimeout(() => setDisplayText(text.slice(0, displayText.length + 1)), 80);
      return () => clearTimeout(timer);
    } else {
      const resetTimer = setTimeout(() => {
        setReset(prev => prev + 1);
        setDisplayText("");
      }, 2000);
      return () => clearTimeout(resetTimer);
    }
  }, [displayText, reset]);

  return (
    <div className="bg-gradient-to-br from-cyan-50 to-cyan-100/50 rounded-xl p-6 border border-cyan-200">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <Type className="w-4 h-4 text-cyan-600" />
          <h3 className="font-semibold text-cyan-900">Typewriter</h3>
        </div>
        <Badge className="bg-cyan-200 text-cyan-700 text-xs font-bold">PREVIEW</Badge>
      </div>
      <div className="space-y-3">
        <div>
          <label className="text-xs text-cyan-700 mb-1 block font-medium">Company Name *</label>
          <div className="h-9 bg-slate-100 border border-slate-300 rounded-md px-3 flex items-center text-sm font-mono text-slate-500 opacity-70">
            {displayText}
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="inline-block w-1 h-4 bg-cyan-600 ml-0.5"
            />
          </div>
        </div>
        <p className="text-xs text-cyan-600 italic">Classic typewriter effect with blinking cursor...</p>
      </div>
    </div>
  );
}

// Style 7: Flip Card - 3D flip animation
function FlipCardPreview() {
  const [reset, setReset] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setReset(prev => prev + 1), 2500);
    return () => clearTimeout(timer);
  }, [reset]);

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-xl p-6 border border-indigo-200">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <RotateCw className="w-4 h-4 text-indigo-600" />
          <h3 className="font-semibold text-indigo-900">Flip Card</h3>
        </div>
        <Badge className="bg-indigo-200 text-indigo-700 text-xs font-bold">PREVIEW</Badge>
      </div>
      <div className="space-y-3">
        <div>
          <label className="text-xs text-indigo-700 mb-1 block font-medium">Company Name *</label>
          <motion.div
            key={reset}
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ perspective: "1000px" }}
            className="h-9 bg-slate-100 border border-slate-300 rounded-md px-3 flex items-center text-sm font-medium text-slate-500 opacity-70"
          >
            {SAMPLE.name}
          </motion.div>
        </div>
        <p className="text-xs text-indigo-600 italic">3D flip rotation into view...</p>
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

        <button onClick={() => handleSelect("inkdrop")} className={`text-left transition-all ${selected === "inkdrop" ? "ring-2 ring-rose-400" : ""}`}>
          <InkDropPreview />
        </button>

        <button onClick={() => handleSelect("typewriter")} className={`text-left transition-all ${selected === "typewriter" ? "ring-2 ring-cyan-400" : ""}`}>
          <TypewriterPreview />
        </button>

        <button onClick={() => handleSelect("flip")} className={`text-left transition-all ${selected === "flip" ? "ring-2 ring-indigo-400" : ""}`}>
          <FlipCardPreview />
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