import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Type, Zap, Wind } from "lucide-react";

const SAMPLE = {
  name: "Supplier Co.",
  contact_person: "John Doe",
  delivery_period: "4-6 weeks",
  payment_terms: "30 days",
  delivery_terms: "FOB, CIF...",
  freight_charges: "0",
  currency: "QAR",
};

// Style 1: Typewriter effect - text appears character by character
function TypewriterPreview() {
  const [chars, setChars] = useState("");
  useEffect(() => {
    const name = SAMPLE.name;
    let i = 0;
    const type = () => {
      setChars(name.substring(0, i));
      i++;
      if (i <= name.length) {
        setTimeout(type, 50);
      } else {
        setTimeout(() => { i = 0; type(); }, 2000);
      }
    };
    type();
  }, []);

  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-6 border border-blue-200">
      <div className="flex items-center gap-2 mb-4">
        <Type className="w-4 h-4 text-blue-600" />
        <h3 className="font-semibold text-blue-900">Typewriter Effect</h3>
      </div>
      <div className="space-y-3">
        <div>
          <label className="text-xs text-blue-700 mb-1 block font-medium">Company Name *</label>
          <Input
            value={chars}
            readOnly
            className="text-sm h-9 bg-white border-blue-300 cursor-text"
            style={{ minHeight: "36px" }}
          />
        </div>
        <p className="text-xs text-blue-600 italic">Text appears character by character...</p>
      </div>
    </div>
  );
}

// Style 2: Fade-in staggered - each field fades in sequentially
function StaggeredFadePreview() {
  const [reset, setReset] = useState(0);
  const fields = [
    { label: "Company Name *", value: SAMPLE.name },
    { label: "Contact Person", value: SAMPLE.contact_person },
    { label: "Delivery Period", value: SAMPLE.delivery_period },
  ];

  useEffect(() => {
    const timer = setTimeout(() => setReset(prev => prev + 1), 2500);
    return () => clearTimeout(timer);
  }, [reset]);

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl p-6 border border-emerald-200">
      <div className="flex items-center gap-2 mb-4">
        <Wind className="w-4 h-4 text-emerald-600" />
        <h3 className="font-semibold text-emerald-900">Staggered Fade-In</h3>
      </div>
      <div className="space-y-3">
        {fields.map((field, idx) => (
          <motion.div
            key={`${idx}-${reset}`}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.15, duration: 0.4 }}
          >
            <label className="text-xs text-emerald-700 mb-1 block font-medium">{field.label}</label>
            <Input
              value={field.value}
              readOnly
              className="text-sm h-9 bg-white border-emerald-300"
            />
          </motion.div>
        ))}
        <p className="text-xs text-emerald-600 italic">Fields appear one after another...</p>
      </div>
    </div>
  );
}

// Style 3: Placeholder morph - placeholder transitions to value
function PlaceholderMorphPreview() {
  const [showValue, setShowValue] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowValue(true), 300);
    const reset = setTimeout(() => setShowValue(false), 2000);
    return () => { clearTimeout(timer); clearTimeout(reset); };
  }, [showValue]);

  return (
    <div className="bg-gradient-to-br from-violet-50 to-violet-100/50 rounded-xl p-6 border border-violet-200">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4 text-violet-600" />
        <h3 className="font-semibold text-violet-900">Placeholder Morph</h3>
      </div>
      <div className="space-y-3">
        <motion.div
          initial={{ scale: 0.98, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <label className="text-xs text-violet-700 mb-1 block font-medium">Company Name *</label>
          <Input
            placeholder={!showValue ? "Supplier Co." : ""}
            value={showValue ? SAMPLE.name : ""}
            readOnly
            className="text-sm h-9 bg-white border-violet-300"
            style={{
              color: showValue ? "#1e1b4b" : "#a78bfa",
              fontStyle: !showValue ? "italic" : "normal",
            }}
          />
        </motion.div>
        <p className="text-xs text-violet-600 italic">Placeholder text transitions to value...</p>
      </div>
    </div>
  );
}

// Style 4: Pulse fill - field pulses as it fills
function PulseFillPreview() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      i += Math.random() * 30;
      if (i >= 100) {
        setProgress(100);
        clearInterval(timer);
        setTimeout(() => setProgress(0), 2000);
      } else {
        setProgress(i);
      }
    }, 80);
    return () => clearInterval(timer);
  }, [progress]);

  const displayValue = SAMPLE.name.substring(0, Math.ceil((progress / 100) * SAMPLE.name.length));

  return (
    <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-xl p-6 border border-amber-200">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-4 h-4 text-amber-600" />
        <h3 className="font-semibold text-amber-900">Pulse Fill</h3>
      </div>
      <div className="space-y-3">
        <div>
          <label className="text-xs text-amber-700 mb-1 block font-medium">Company Name *</label>
          <div className="relative">
            <Input
              value={displayValue}
              readOnly
              className="text-sm h-9 bg-white border-amber-300"
            />
            <motion.div
              className="absolute inset-0 bg-amber-200 rounded-md opacity-20 pointer-events-none"
              animate={{ scale: progress === 100 ? 0 : 1 }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
        <div className="w-full h-1.5 bg-amber-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-amber-400"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
        <p className="text-xs text-amber-600 italic">Field fills with progress indicator...</p>
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
        <button onClick={() => handleSelect("typewriter")} className={`text-left transition-all ${selected === "typewriter" ? "ring-2 ring-blue-400" : ""}`}>
          <TypewriterPreview />
        </button>

        <button onClick={() => handleSelect("staggered")} className={`text-left transition-all ${selected === "staggered" ? "ring-2 ring-emerald-400" : ""}`}>
          <StaggeredFadePreview />
        </button>

        <button onClick={() => handleSelect("morph")} className={`text-left transition-all ${selected === "morph" ? "ring-2 ring-violet-400" : ""}`}>
          <PlaceholderMorphPreview />
        </button>

        <button onClick={() => handleSelect("pulse")} className={`text-left transition-all ${selected === "pulse" ? "ring-2 ring-amber-400" : ""}`}>
          <PulseFillPreview />
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