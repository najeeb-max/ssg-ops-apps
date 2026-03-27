import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CURRENCIES } from '@/lib/constants';
import { X, Plus, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

const STORAGE_KEY = 'ssg_currencies';

function getCurrencies() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : CURRENCIES;
  } catch {
    return CURRENCIES;
  }
}

function saveCurrencies(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export default function CurrenciesSettings() {
  const [currencies, setCurrencies] = useState(getCurrencies);
  const [newCode, setNewCode] = useState('');

  const handleAdd = () => {
    const trimmed = newCode.trim().toUpperCase();
    if (!trimmed) return;
    if (currencies.includes(trimmed)) {
      toast.error('Currency already exists');
      return;
    }
    const updated = [...currencies, trimmed];
    setCurrencies(updated);
    saveCurrencies(updated);
    setNewCode('');
    toast.success(`${trimmed} added`);
  };

  const handleRemove = (code) => {
    const updated = currencies.filter(c => c !== code);
    setCurrencies(updated);
    saveCurrencies(updated);
    toast.success(`${code} removed`);
  };

  const handleReset = () => {
    setCurrencies(CURRENCIES);
    saveCurrencies(CURRENCIES);
    toast.success('Reset to defaults');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <DollarSign className="w-4 h-4" /> Currencies
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Currency codes available when creating orders.</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleReset}>Reset to default</Button>
      </div>

      <div className="flex gap-2">
        <Input
          value={newCode}
          onChange={e => setNewCode(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder="e.g. QAR"
          maxLength={5}
          className="h-9 w-36 uppercase"
        />
        <Button size="sm" onClick={handleAdd} className="gap-1">
          <Plus className="w-4 h-4" /> Add
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {currencies.map(code => (
          <span key={code} className="flex items-center gap-1.5 bg-slate-100 text-slate-700 text-sm font-mono px-3 py-1.5 rounded-full">
            {code}
            <button onClick={() => handleRemove(code)} className="text-slate-400 hover:text-destructive transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}

export { getCurrencies };