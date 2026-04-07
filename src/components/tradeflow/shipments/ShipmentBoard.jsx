import React, { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, ChevronDown, ChevronUp, MapPin, Zap, Ship, Plane, Truck, Train } from 'lucide-react';
import { getTransportIcon } from '@/lib/transportIcons';
import { format } from 'date-fns';
import { buildShipmentColorMap, NEUTRAL_COLOR } from '@/lib/shipmentColors';

const statusStyles = {
  preparing: 'bg-slate-100 text-slate-600 border-slate-300',
  booked: 'bg-blue-50 text-blue-700 border-blue-200',
  in_transit: 'bg-purple-50 text-purple-700 border-purple-200',
  customs: 'bg-amber-50 text-amber-700 border-amber-200',
  delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-rose-50 text-rose-500 border-rose-200',
};

const modeIcon = { sea: '🚢', air: '✈️', road: '🚛', rail: '🚂', express: '📦' };

const modeColors = {
  sea: 'bg-blue-100 text-blue-800',
  air: 'bg-sky-100 text-sky-800',
  road: 'bg-orange-100 text-orange-800',
  rail: 'bg-yellow-100 text-yellow-800',
  express: 'bg-pink-100 text-pink-800',
};

export default function ShipmentBoard({ shipments, orders, onEdit, onDelete, onUnassign, onMarkQatarReceived }) {
  const active = shipments.filter(s => !s.received_in_qatar && s.status !== 'cancelled');
  const dispatched = shipments.filter(s => !s.received_in_qatar && (s.status === 'in_transit' || s.status === 'customs' || s.status === 'booked'));

  const colorMap = useMemo(() => buildShipmentColorMap(shipments), [shipments]);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-base font-semibold text-slate-700">Active Shipments</h2>
          <span className="bg-slate-100 text-slate-600 text-xs font-semibold px-1.5 py-0.5 rounded-full">{active.length}</span>
        </div>
        {active.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6 border border-dashed border-slate-200 rounded-xl">No active shipments. Create one to start grouping orders.</p>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {active.map(s => (
              <ShipmentCard key={s.id} shipment={s} orders={orders} color={colorMap[s.id] || NEUTRAL_COLOR} onEdit={onEdit} onDelete={onDelete} onUnassign={onUnassign} onMarkQatarReceived={onMarkQatarReceived} />
            ))}
          </div>
        )}
      </div>

      {dispatched.filter(s => s.status !== 'preparing').length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-slate-700 mb-3">Dispatched / In Transit</h2>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {dispatched.filter(s => s.status !== 'preparing').map(s => (
              <ShipmentCard key={s.id} shipment={s} orders={orders} color={colorMap[s.id] || NEUTRAL_COLOR} onEdit={onEdit} onDelete={onDelete} onUnassign={onUnassign} onMarkQatarReceived={onMarkQatarReceived} dimmed />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ShipmentCard({ shipment, orders, color, onEdit, onDelete, onUnassign, onMarkQatarReceived, dimmed }) {
  const [expanded, setExpanded] = useState(false);
  const included = orders.filter(o => o.shipment_id === shipment.id);
  const totalKgs = included.reduce((s, o) => s + (o.weight_kgs || 0), 0);
  const totalCbm = included.reduce((s, o) => s + (o.cbm || 0), 0);
  const totalCtns = included.reduce((s, o) => s + (o.num_cartons || 0), 0);
  const isDirect = shipment.shipment_type === 'direct_express';
  const TransportIcon = getTransportIcon(isDirect ? 'express' : shipment.transport_mode);

  return (
    <div className={`bg-white rounded-xl border-2 overflow-hidden ${color.border} ${dimmed ? 'opacity-70' : ''}`}>
      {/* Vivid color header strip */}
      <div className={`${color.bg} px-4 py-2 flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <TransportIcon className="w-4 h-4 text-white/80" />
          <span className="font-bold text-white text-sm tracking-wide">{shipment.shipment_number}</span>
          {isDirect && (
            <span className="inline-flex items-center gap-0.5 bg-white/20 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">
              Direct
            </span>
          )}
        </div>
        <div className="flex gap-0.5">
          <Button variant="ghost" size="icon" className="h-6 w-6 text-white/70 hover:text-white hover:bg-white/20" onClick={() => onEdit(shipment)} title="Edit"><Pencil className="w-3 h-3" /></Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-white/70 hover:text-white hover:bg-white/20" onClick={() => onMarkQatarReceived(shipment)} title="Mark Received in Qatar">
            <span className="text-xs">✅</span>
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-white/70 hover:text-white hover:bg-white/20" onClick={() => onDelete(shipment)} title="Delete"><Trash2 className="w-3 h-3" /></Button>
        </div>
      </div>

      <div className="p-4">
        <div className="mb-2">
          <Badge className={`text-xs border ${statusStyles[shipment.status] || 'bg-slate-100 text-slate-600'}`}>
            {shipment.status?.replace(/_/g, ' ')}
          </Badge>
        </div>

        <div className="space-y-1 text-xs text-slate-500">
          {shipment.transport_mode && !isDirect && (
            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium ${modeColors[shipment.transport_mode] || 'bg-slate-100 text-slate-600'}`}>
              {modeIcon[shipment.transport_mode]} {shipment.transport_mode}
            </span>
          )}
          {shipment.origin && shipment.destination && (
            <p className="flex items-center gap-1"><MapPin className="w-3 h-3" />{shipment.origin} → {shipment.destination}</p>
          )}
          {shipment.carrier && <p>{shipment.carrier}{shipment.tracking_number && ` · ${shipment.tracking_number}`}</p>}
          {shipment.arrival_date && (
            <p className={`font-medium ${color.text}`}>ETA: {format(new Date(shipment.arrival_date), 'MMM d, yyyy')}</p>
          )}
        </div>

        {included.length > 0 && (
          <div className="flex gap-2 mt-2 text-xs text-slate-500">
            <span>📦 {totalCtns} ctns</span>
            <span>⚖️ {totalKgs.toFixed(1)} KGS</span>
            <span>📐 {totalCbm.toFixed(3)} CBM</span>
          </div>
        )}
      </div>

      <button
        className={`w-full flex items-center justify-between px-4 py-2 border-t text-xs text-slate-500 hover:opacity-80 transition-colors ${color.light} ${color.border.replace('border-', 'border-t-')}`}
        onClick={() => setExpanded(!expanded)}
      >
        <span>{included.length} order{included.length !== 1 ? 's' : ''}</span>
        {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {expanded && (
        <div className="px-4 py-3 border-t border-slate-100 space-y-2">
          {included.length === 0 ? (
            <p className="text-xs text-slate-400">No orders yet.</p>
          ) : (
            included.map(order => (
              <div key={order.id} className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-700 truncate">{order.product_name}</p>
                  <p className="text-xs text-slate-400">{[order.supplier_name, order.team_member_name].filter(Boolean).join(' · ')}</p>
                  {order.domestic_tracking_number && <p className="text-xs text-slate-400">🚚 {order.domestic_tracking_number}</p>}
                  <div className="flex gap-1.5 text-xs text-slate-400">
                    {order.weight_kgs && <span>{order.weight_kgs} KGS</span>}
                    {order.cbm && <span>{order.cbm} CBM</span>}
                  </div>
                </div>
                {!dimmed && (
                  <button onClick={() => onUnassign(order)} title="Remove from shipment" className="text-xs text-slate-400 hover:text-destructive shrink-0">remove</button>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}