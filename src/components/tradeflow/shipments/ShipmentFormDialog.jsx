import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

const STATUSES = ['preparing', 'booked', 'in_transit', 'customs', 'delivered', 'cancelled'];
const TRANSPORT_MODES = [
  { value: 'sea', label: '🚢 Sea Freight' },
  { value: 'air', label: '✈️ Air Freight' },
  { value: 'express', label: '📦 Express Courier' },
];

const DESTINATION_BY_MODE = {
  sea: 'Mina Hamad (Hamad SeaPort), Doha',
  air: 'HIA (Hamad International Airport), Doha',
  express: 'SSG Head Office - Birkat Al Awamer, Doha',
};

const emptyForm = () => ({
  shipment_number: '', description: '', status: 'preparing', transport_mode: 'sea',
  carrier: '', tracking_number: '', origin: 'Shenzhen, China', destination: DESTINATION_BY_MODE['sea'],
  departure_date: '', arrival_date: '', notes: '',
});

export default function ShipmentFormDialog({ open, onOpenChange, shipment, onSaved }) {
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (shipment) {
      setForm({
        shipment_number: shipment.shipment_number || '',
        description: shipment.description || '',
        status: shipment.status || 'preparing',
        transport_mode: shipment.transport_mode || 'sea',
        carrier: shipment.carrier || '',
        tracking_number: shipment.tracking_number || '',
        origin: shipment.origin || '',
        destination: shipment.destination || '',
        departure_date: shipment.departure_date || '',
        arrival_date: shipment.arrival_date || '',
        notes: shipment.notes || '',
      });
    } else {
      setForm(emptyForm());
    }
  }, [shipment, open]);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    if (shipment) {
      await base44.entities.Shipment.update(shipment.id, form);
    } else {
      await base44.entities.Shipment.create({ ...form, order_ids: [] });
    }
    setSaving(false);
    queryClient.invalidateQueries({ queryKey: ['shipments'] });
    onSaved();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{shipment ? 'Edit Shipment' : 'New Shipment'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Shipment # *</Label>
              <Input value={form.shipment_number} onChange={set('shipment_number')} placeholder="e.g. SHP-001" required />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map(s => <SelectItem key={s} value={s}>{s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Transport Mode</Label>
            <Select value={form.transport_mode} onValueChange={v => setForm({ ...form, transport_mode: v, destination: DESTINATION_BY_MODE[v] || form.destination })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{TRANSPORT_MODES.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Input value={form.description} onChange={set('description')} placeholder="e.g. Electronics batch Q1" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Origin</Label>
              <Input value={form.origin} onChange={set('origin')} placeholder="Shenzhen, China" />
            </div>
            <div className="space-y-1.5">
              <Label>Destination (auto)</Label>
              <Input value={form.destination} onChange={set('destination')} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Carrier</Label>
              <Input value={form.carrier} onChange={set('carrier')} placeholder="MSC, DHL..." />
            </div>
            <div className="space-y-1.5">
              <Label>Tracking #</Label>
              <Input value={form.tracking_number} onChange={set('tracking_number')} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Departure Date</Label>
              <Input type="date" value={form.departure_date} onChange={set('departure_date')} />
            </div>
            <div className="space-y-1.5">
              <Label>Arrival Date (ETA)</Label>
              <Input type="date" value={form.arrival_date} onChange={set('arrival_date')} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea value={form.notes} onChange={set('notes')} rows={3} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={saving} className="bg-indigo-600 hover:bg-indigo-700">
              {saving ? 'Saving...' : shipment ? 'Save Changes' : 'Create Shipment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}