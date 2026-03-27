import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import { Star } from 'lucide-react';

export default function SupplierFormDialog({ open, onOpenChange, supplier, onSaved }) {
  const [form, setForm] = useState({ name: '', contact_person: '', email: '', phone: '', country: '', product_categories: '', payment_terms: '', rating: '', notes: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (supplier) {
      setForm({ name: supplier.name || '', contact_person: supplier.contact_person || '', email: supplier.email || '', phone: supplier.phone || '', country: supplier.country || '', product_categories: supplier.product_categories || '', payment_terms: supplier.payment_terms || '', rating: supplier.rating || '', notes: supplier.notes || '' });
    } else {
      setForm({ name: '', contact_person: '', email: '', phone: '', country: '', product_categories: '', payment_terms: '', rating: '', notes: '' });
    }
  }, [supplier, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const data = { ...form, rating: form.rating ? Number(form.rating) : undefined };
    if (supplier) {
      await base44.entities.Supplier.update(supplier.id, data);
    } else {
      await base44.entities.Supplier.create(data);
    }
    setSaving(false);
    onSaved();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{supplier ? 'Edit Supplier' : 'New Supplier'}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Company / Supplier Name *</Label>
            <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. China Steel Corp" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Contact Person</Label>
              <Input value={form.contact_person} onChange={e => setForm({ ...form, contact_person: e.target.value })} placeholder="John Doe" />
            </div>
            <div className="space-y-1.5">
              <Label>Country</Label>
              <Input value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} placeholder="China" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="supplier@email.com" />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+86 10 1234 5678" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Product Categories</Label>
            <Input value={form.product_categories} onChange={e => setForm({ ...form, product_categories: e.target.value })} placeholder="Steel, Metals..." />
          </div>
          <div className="space-y-1.5">
            <Label>Payment Terms</Label>
            <Input value={form.payment_terms} onChange={e => setForm({ ...form, payment_terms: e.target.value })} placeholder="30% advance, TT" />
          </div>
          <div className="space-y-1.5">
            <Label>Internal Rating (1-5)</Label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" onClick={() => setForm({ ...form, rating: star })}>
                  <Star className={`w-5 h-5 cursor-pointer ${form.rating >= star ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} />
                </button>
              ))}
              {form.rating ? <span className="text-xs text-slate-500 ml-1">{form.rating}/5</span> : null}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={saving} className="bg-indigo-600 hover:bg-indigo-700">{saving ? 'Saving...' : supplier ? 'Save Changes' : 'Add Supplier'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}