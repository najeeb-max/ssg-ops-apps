import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";

export default function TypewriterInput({ value, onChange, onFocus, onBlur, placeholder, label, ...props }) {
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    if (value && displayText.length < value.length) {
      const timer = setTimeout(() => setDisplayText(value.slice(0, displayText.length + 1)), 50);
      return () => clearTimeout(timer);
    }
  }, [displayText, value]);

  const handleFocus = (e) => {
    onFocus?.(e);
  };

  const handleBlur = (e) => {
    onBlur?.(e);
  };

  return (
    <div className="relative">
      {label && <label className="text-xs text-slate-600 mb-1 block font-medium">{label}</label>}
      <div className="relative">
        <Input
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          {...props}
        />
        {value && displayText.length < value.length && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 pointer-events-none rounded-md px-3 py-2 flex items-center text-sm text-slate-500 overflow-hidden"
          >
            {displayText}
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="inline-block w-0.5 h-4 bg-slate-500 ml-0.5"
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}