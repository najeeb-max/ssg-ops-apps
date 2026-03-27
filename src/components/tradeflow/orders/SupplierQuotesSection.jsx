import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, CheckCircle2, Circle } from 'lucide-react';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'AED', 'SAR', 'INR', 'CNY', 'JPY'];

export default function SupplierQuotesSection({ quotes = [], onChange }) {
  const addQuote = () => {
    onChange([...quotes, { supplier_id: '', supplier_name: '', unit_price: '', currency: 'USD', lead_time_days: '', payment_terms: '', notes: '', is_selected: false }]);
  };

  const updateQuote = (index, field, value) => {
    const updated = quotes.map((q, i) => i === index ? { ...q, [field]: value } : q);
    onChange(updated);
  };

  const selectQuote = (index) => {
    onChange(quotes.map((q, i) => ({ ...q, is_selected: i === index })));
  };

  const removeQuote = (index) => {
    onChange(quotes.filter((_, i) => i !== index));
  };

  const selectedIndex = quotes.findIndex(q => q.is_selected);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-700">Supplier Quotes</p>
          <p className="text-xs text-slate-400">Add multiple quotes to compare and select the best</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addQuote} className="gap-1.5 text-xs">
          <Plus className="w-3.5 h-3.5" /> Add Quote
        </Button>
      </div>

      {quotes.length === 0 && (
        <p className="text-xs text-slate-400 text-center py-3 border border-dashed border-slate-200 rounded-lg">
          No supplier quotes yet. Click "Add Quote" to compare suppliers.
        </p>
      )}

      {quotes.map((quote, index) => (
        <div key={index} className={`border rounded-lg p-3 space-y-2 ${quote.is_selected ? 'border-emerald-300 bg-emerald-50/40' : 'border-slate-200 bg-white'}`}>
          <div className="flex items-center justify-between">
            <button type="button" onClick={() => selectQuote(index)} title="Select this supplier" className="flex items-center gap-2 text-sm font-medium">
              {quote.is_selected
                ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                : <Circle className="w-4 h-4 text-slate-300" />}
              {quote.is_selected ? <span className="text-emerald-600">✓ Selected</span> : <span className="text-slate-500">{`Quote ${index + 1}`}</span>}
            </button>
            <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-slate-300 hover:text-destructive" onClick={() => removeQuote(index)}>
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <Input value={quote.supplier_name} onChange={e => updateQuote(index, 'supplier_name', e.target.value)} placeholder="Supplier name" className="h-8 text-sm" />
            <Input value={quote.unit_price} onChange={e => updateQuote(index, 'unit_price', e.target.value)} placeholder="Unit price" type="number" className="h-8 text-sm" />
            <Select value={quote.currency} onValueChange={v => updateQuote(index, 'currency', v)}>
              <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>{CURRENCIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
            <Input value={quote.lead_time_days} onChange={e => updateQuote(index, 'lead_time_days', e.target.value)} placeholder="Lead time (days)" className="h-8 text-sm" />
            <Input value={quote.payment_terms} onChange={e => updateQuote(index, 'payment_terms', e.target.value)} placeholder="Payment terms" className="h-8 text-sm" />
            <Input value={quote.notes} onChange={e => updateQuote(index, 'notes', e.target.value)} placeholder="Notes" className="h-8 text-sm" />
          </div>
        </div>
      ))}

      {quotes.length > 1 && selectedIndex === -1 && (
        <p className="text-xs text-amber-600">⚠ Click the circle on a quote to select your preferred supplier.</p>
      )}
    </div>
  );
}