import { useState, useCallback } from "react";

// In-memory cache: { "USD": { rate: 3.64, fetchedAt: timestamp } }
const CACHE = {};
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Fetches exchange rate: 1 {currency} = ? QAR
 * Uses exchangerate-api (open endpoint, no key, supports QAR).
 * fetchRate(currency, force=false) - resolves to rate (number) or null on error
 * force=true bypasses cache (used by the Refresh button)
 */
export function useFxRate() {
  const [loading, setLoading] = useState(false);

  const fetchRate = useCallback(async (currency, force = false) => {
    if (!currency || currency === "QAR") return 1;

    const key = currency.toUpperCase();

    // Return cached value if fresh and not forced
    if (!force && CACHE[key] && Date.now() - CACHE[key].fetchedAt < CACHE_TTL_MS) {
      return CACHE[key].rate;
    }

    setLoading(true);
    try {
      // exchangerate.host supports QAR and 150+ currencies, no API key required
      const res = await fetch(
        `https://api.exchangerate.host/convert?from=${key}&to=QAR&amount=1`
      );
      if (!res.ok) throw new Error("FX fetch failed");
      const data = await res.json();

      const rate = data?.result;
      if (!rate || rate <= 0) throw new Error("Invalid rate received");

      CACHE[key] = { rate, fetchedAt: Date.now() };
      return rate;
    } catch {
      // Fallback: try frankfurter for non-QAR pairs routed through USD
      try {
        const res2 = await fetch(
          `https://api.frankfurter.app/latest?from=${key}&to=USD`
        );
        if (!res2.ok) throw new Error();
        const data2 = await res2.json();
        const usdRate = data2?.rates?.USD;
        if (!usdRate) throw new Error();
        // QAR is pegged at 3.64 USD
        const qarRate = usdRate * 3.64;
        CACHE[key] = { rate: qarRate, fetchedAt: Date.now() };
        return qarRate;
      } catch {
        return null;
      }
    } finally {
      setLoading(false);
    }
  }, []);

  return { fetchRate, loading };
}