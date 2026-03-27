import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';

export default function CustomerFormDialog({ open, onOpenChange, customer, onSaved }) {
  const [form, setForm] = useState({ name: '', contact_person: '', email: '', phone: '', notes: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (customer) {
      setForm({ name: customer.name || '', contact_person: customer.contact_person || '', email: customer.email || '', phone: customer.phone || '', notes: customer.notes || '' });
    } else {
      setForm({ name: '', contact_person: '', email: '', phone: '', notes: '' });
    }
  }, [customer, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    if (customer) {
      await base44.entities.Customer.update(customer.id, form);
    } else {
      await base44.entities.Customer.create(form);
    }
    setSaving(false);
    onSaved();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>{customer ? 'Edit Customer' : 'New Customer'}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Company / Customer Name *</Label>
            <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Al Futtaim Group" required />
          </div>
          <div className="space-y-1.5">
            <Label>Contact Person</Label>
            <Input value={form.contact_person} onChange={e => setForm({ ...form, contact_person: e.target.value })} placeholder="John Doe" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="client@email.com" />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+1 234 567 890" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={saving} className="bg-indigo-600 hover:bg-indigo-700">{saving ? 'Saving...' : customer ? 'Save Changes' : 'Add Customer'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}