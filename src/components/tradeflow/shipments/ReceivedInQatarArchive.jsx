import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, MapPin, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

const modeIcon = { sea: '🚢', air: '✈️', road: '🚛', rail: '🚂', express: '📦' };

export default function ReceivedInQatarArchive({ shipments, orders, onEdit, onDelete, onUnassign }) {
  const [open, setOpen] = useState(false);
  const received = shipments.filter(s => s.received_in_qatar);

  if (received.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-3 w-full text-left px-4 py-3 border-b border-slate-100 bg-slate-50/60 hover:bg-slate-100 transition-colors">
        <h2 className="text-sm font-semibold text-slate-700">Received in Qatar</h2>
        <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-1.5 py-0.5 rounded-full">{received.length} shipment{received.length !== 1 ? 's' : ''}</span>
        <span className="ml-auto">{open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}</span>
      </button>

      {open && (
        <div className="p-3 grid md:grid-cols-2 xl:grid-cols-3 gap-3">
          {received.map(s => (
            <ReceivedCard key={s.id} shipment={s} orders={orders} onEdit={onEdit} onDelete={onDelete} onUnassign={onUnassign} />
          ))}
        </div>
      )}
    </div>
  );
}

function ReceivedCard({ shipment, orders, onEdit, onDelete, onUnassign }) {
  const [expanded, setExpanded] = useState(false);
  const included = orders.filter(o => o.shipment_id === shipment.id);
  const totalKgs = included.reduce((s, o) => s + (o.weight_kgs || 0), 0);
  const totalCbm = included.reduce((s, o) => s + (o.cbm || 0), 0);
  const totalCtns = included.reduce((s, o) => s + (o.num_cartons || 0), 0);

  return (
    <div className="border border-emerald-200 rounded-xl overflow-hidden bg-emerald-50/30">
      <div className="p-3">
        <div className="flex items-start justify-between mb-1.5">
          <div>
            <p className="font-semibold text-slate-800 text-sm">{shipment.shipment_number}</p>
            <span className="text-xs text-emerald-600 font-medium">✅ Received in Qatar</span>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onEdit(shipment)}><Pencil className="w-3 h-3" /></Button>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-300 hover:text-destructive" onClick={() => onDelete(shipment)}><Trash2 className="w-3 h-3" /></Button>
          </div>
        </div>
        <div className="text-xs text-slate-500 space-y-0.5">
          {shipment.transport_mode && <span className="inline-block mr-2">{modeIcon[shipment.transport_mode]} {shipment.transport_mode}</span>}
          {shipment.origin && shipment.destination && <p className="flex items-center gap-1"><MapPin className="w-3 h-3" />{shipment.origin} → {shipment.destination}</p>}
          {shipment.qatar_received_date && <p className="text-emerald-600">Received: {format(new Date(shipment.qatar_received_date), 'MMM d, yyyy')}</p>}
          {shipment.qatar_notes && <p className="italic">"{shipment.qatar_notes}"</p>}
        </div>
        {included.length > 0 && (
          <div className="flex gap-2 mt-1.5 text-xs text-slate-400">
            <span>📦 {totalCtns} ctns</span><span>⚖️ {totalKgs.toFixed(1)} KGS</span><span>📐 {totalCbm.toFixed(3)} CBM</span>
          </div>
        )}
      </div>
      <button className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 hover:bg-slate-100" onClick={() => setExpanded(!expanded)}>
        <span>{included.length} order{included.length !== 1 ? 's' : ''}</span>
        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>
      {expanded && (
        <div className="px-3 py-2 border-t border-slate-100 space-y-1">
          {included.length === 0 ? <p className="text-xs text-slate-400">No orders.</p> : included.map(order => (
            <div key={order.id} className="text-xs">
              <p className="font-medium text-slate-700">{order.product_name}</p>
              <p className="text-slate-400">{[order.supplier_name, order.team_member_name].filter(Boolean).join(' · ')}</p>
              <div className="flex gap-2 text-slate-400">
                {order.weight_kgs && <span>{order.weight_kgs} KGS</span>}
                {order.cbm && <span>{order.cbm} CBM</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}