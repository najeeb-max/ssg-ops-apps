import { useState, useCallback } from "react";

const CACHE = {};

/**
 * Fetches exchange rate from `currency` to QAR using frankfurter.app (ECB data, free, no key).
 * Returns { fetchRate, loading }
 * fetchRate(currency) - resolves to rate (number) or null on error
 */
export function useFxRate() {
  const [loading, setLoading] = useState(false);

  const fetchRate = useCallback(async (currency) => {
    if (!currency || currency === "QAR") return 1;
    const key = currency.toUpperCase();
    if (CACHE[key]) return CACHE[key];
    setLoading(true);
    try {
      const res = await fetch(`https://api.frankfurter.app/latest?from=${key}&to=QAR`);
      if (!res.ok) throw new Error("FX fetch failed");
      const data = await res.json();
      const rate = data?.rates?.QAR;
      if (!rate) throw new Error("QAR rate not found");
      CACHE[key] = rate;
      return rate;
    } catch {
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { fetchRate, loading };
}