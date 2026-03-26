import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";

export default function TypewriterInput({ value, onChange, onFocus, onBlur, placeholder, label, ...props }) {
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    if (value && displayText.length < value.length) {
      const timer = setTimeout(() => setDisplayText(value.slice(0, displayText.length + 1)), 40);
      return () => clearTimeout(timer);
    }
  }, [displayText, value]);

  return (
    <div className="relative">
      {label && <label className="text-xs text-slate-600 mb-1 block font-medium">{label}</label>}
      <Input
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        {...props}
      />
      {value && displayText.length < value.length && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 pointer-events-none flex items-center px-3 text-sm text-amber-400 font-semibold"
          style={{ paddingTop: '0.375rem' }}
        >
          <span className="opacity-60">{displayText}</span>
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.6, repeat: Infinity }}
            className="w-1.5 h-5 bg-amber-400 ml-1 rounded-sm"
          />
        </motion.div>
      )}
    </div>
  );
}