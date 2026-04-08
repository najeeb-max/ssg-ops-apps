import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const statusStyles = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  received_at_hub: 'bg-teal-50 text-teal-700 border-teal-200',
  in_transit: 'bg-purple-50 text-purple-700 border-purple-200',
  delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-slate-100 text-slate-500 border-slate-200',
};

export default function UnassignedPool({ orders, shipments, onAssign }) {
  // Direct Express orders ship directly — they don't need shipment assignment
  const unassigned = orders.filter(o => !o.shipment_id && o.fulfillment_type !== 'direct_express');

  if (unassigned.length === 0) {
    return (
      <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 text-sm text-emerald-700">
        All orders are assigned to a shipment.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60 flex items-center gap-2">
        <span className="text-sm font-semibold text-slate-700">Unassigned Orders</span>
        <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-1.5 py-0.5 rounded-full">{unassigned.length}</span>
        <span className="text-xs text-slate-400 ml-1">Drag or assign to a shipment →</span>
      </div>
      <div className="p-3 grid md:grid-cols-2 xl:grid-cols-3 gap-2">
        {unassigned.map(order => (
          <div key={order.id} className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
            <div className="flex items-start justify-between gap-2 mb-1">
              <p className="text-sm font-medium text-slate-800 truncate">{order.product_name}</p>
              <Badge className={`text-xs border shrink-0 ${statusStyles[order.status] || ''}`}>
                {order.status?.replace(/_/g, ' ')}
              </Badge>
            </div>
            <p className="text-xs text-slate-400">
              {[order.supplier_name, order.team_member_name, order.weight_kgs && `${order.weight_kgs} KGS`, order.cbm && `${order.cbm} CBM`, order.num_cartons && `${order.num_cartons} ctns`].filter(Boolean).join(' · ')}
            </p>
            {order.domestic_tracking_number && <p className="text-xs text-slate-400 mt-1">🚚 {order.domestic_tracking_number}</p>}
            {shipments.filter(s => s.status !== 'delivered' && s.status !== 'cancelled').length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {shipments.filter(s => s.status !== 'delivered' && s.status !== 'cancelled').map(s => (
                  <Button key={s.id} variant="outline" size="sm" className="h-6 text-xs gap-1" onClick={() => onAssign(order, s)}>
                    <Plus className="w-3 h-3" />{s.shipment_number}
                  </Button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}