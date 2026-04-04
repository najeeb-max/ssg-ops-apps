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

const SHIPMENT_TYPES = [
  { value: 'china_hub', label: '🏭 China Hub Consolidation' },
  { value: 'direct_express', label: '⚡ Direct Express' },
];

const DESTINATION_BY_MODE = {
  sea: 'Mina Hamad (Hamad SeaPort), Doha',
  air: 'HIA (Hamad International Airport), Doha',
  express: 'SSG Head Office - Birkat Al Awamer, Doha',
};

const emptyForm = () => ({
  shipment_number: '', shipment_type: 'china_hub', description: '', status: 'preparing',
  transport_mode: 'sea', carrier: '', tracking_number: '',
  origin: 'Shenzhen, China', destination: DESTINATION_BY_MODE['sea'],
  departure_date: '', arrival_date: '', notes: '',
});

async function generateShipmentNumber(type) {
  const all = await base44.entities.Shipment.list('-created_date', 500);
  const prefix = type === 'direct_express' ? 'DIR' : 'SHP';
  const nums = all.map(s => {
    const match = s.shipment_number?.match(new RegExp(`^${prefix}-(\\d+)$`));
    return match ? parseInt(match[1], 10) : 0;
  }).filter(n => n > 0);
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
  return `${prefix}-${String(next).padStart(3, '0')}`;
}

export default function ShipmentFormDialog({ open, onOpenChange, shipment, onSaved }) {
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!open) return;
    if (shipment) {
      setForm({
        shipment_number: shipment.shipment_number || '',
        shipment_type: shipment.shipment_type || 'china_hub',
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
      const f = emptyForm();
      setForm(f);
      // Auto-generate number for new shipments
      setGenerating(true);
      generateShipmentNumber('china_hub').then(num => {
        setForm(prev => ({ ...prev, shipment_number: num }));
        setGenerating(false);
      });
    }
  }, [shipment, open]);

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleTypeChange = async (type) => {
    setForm(prev => ({ ...prev, shipment_type: type }));
    if (!shipment) {
      setGenerating(true);
      const num = await generateShipmentNumber(type);
      setForm(prev => ({ ...prev, shipment_type: type, shipment_number: num }));
      setGenerating(false);
    }
  };

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

  const isDirectExpress = form.shipment_type === 'direct_express';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{shipment ? 'Edit Shipment' : 'New Shipment'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Shipment Type */}
          <div className="space-y-1.5">
            <Label>Shipment Type</Label>
            <Select value={form.shipment_type} onValueChange={handleTypeChange}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {SHIPMENT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Shipment # *</Label>
              <div className="relative">
                <Input
                  value={generating ? 'Generating...' : form.shipment_number}
                  onChange={set('shipment_number')}
                  placeholder={isDirectExpress ? 'DIR-001' : 'SHP-001'}
                  required
                  disabled={generating}
                  className={generating ? 'text-slate-400' : ''}
                />
              </div>
              <p className="text-xs text-slate-400">Auto-generated · editable</p>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm(prev => ({ ...prev, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map(s => <SelectItem key={s} value={s}>{s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {!isDirectExpress && (
            <div className="space-y-1.5">
              <Label>Transport Mode</Label>
              <Select value={form.transport_mode} onValueChange={v => setForm(prev => ({ ...prev, transport_mode: v, destination: DESTINATION_BY_MODE[v] || prev.destination }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{TRANSPORT_MODES.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Description</Label>
            <Input value={form.description} onChange={set('description')} placeholder={isDirectExpress ? 'e.g. Direct eBay order batch' : 'e.g. Electronics batch Q1'} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Origin</Label>
              <Input value={form.origin} onChange={set('origin')} placeholder="Shenzhen, China" />
            </div>
            <div className="space-y-1.5">
              <Label>Destination {!isDirectExpress && <span className="text-slate-400 text-xs">(auto)</span>}</Label>
              <Input value={form.destination} onChange={set('destination')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Carrier</Label>
              <Input value={form.carrier} onChange={set('carrier')} placeholder="MSC, DHL, FedEx..." />
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
            <Button type="submit" disabled={saving || generating} className="bg-indigo-600 hover:bg-indigo-700">
              {saving ? 'Saving...' : shipment ? 'Save Changes' : 'Create Shipment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}