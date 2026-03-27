import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ShipmentFormDialog from '../components/tradeflow/shipments/ShipmentFormDialog';
import ShipmentBoard from '../components/tradeflow/shipments/ShipmentBoard';
import UnassignedPool from '../components/tradeflow/shipments/UnassignedPool';
import ReceivedInQatarArchive from '../components/tradeflow/shipments/ReceivedInQatarArchive';
import MarkQatarReceivedDialog from '../components/tradeflow/shipments/MarkQatarReceivedDialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function TradeflowShipments() {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [qatarTarget, setQatarTarget] = useState(null);
  const queryClient = useQueryClient();

  const { data: shipments = [], isLoading: loadingShipments } = useQuery({
    queryKey: ['shipments'],
    queryFn: () => base44.entities.Shipment.list('-created_date'),
  });

  const { data: orders = [], isLoading: loadingOrders } = useQuery({
    queryKey: ['orders'],
    queryFn: () => base44.entities.Order.list('-created_date', 200),
  });

  const isLoading = loadingShipments || loadingOrders;

  const handleDelete = async () => {
    // Point 16: Unlink all orders before deleting shipment to prevent orphaned shipment_ids
    const linked = orders.filter(o => o.shipment_id === toDelete.id);
    await Promise.all(linked.map(o => base44.entities.Order.update(o.id, { shipment_id: null, status: o.status === 'in_transit' ? 'received_at_hub' : o.status })));
    await base44.entities.Shipment.delete(toDelete.id);
    setToDelete(null);
    queryClient.invalidateQueries({ queryKey: ['shipments'] });
    queryClient.invalidateQueries({ queryKey: ['orders'] });
    toast.success(`Shipment "${toDelete?.shipment_number}" deleted. ${linked.length} order(s) returned to unassigned pool.`);
  };

  const handleAssign = async (order, shipment) => {
    const newIds = [...(shipment.order_ids || []), order.id];
    await Promise.all([
      base44.entities.Order.update(order.id, { shipment_id: shipment.id }),
      base44.entities.Shipment.update(shipment.id, { order_ids: newIds }),
    ]);
    queryClient.invalidateQueries({ queryKey: ['orders'] });
    queryClient.invalidateQueries({ queryKey: ['shipments'] });
  };

  const handleUnassign = async (order) => {
    const shipment = shipments.find(s => s.id === order.shipment_id);
    const promises = [base44.entities.Order.update(order.id, { shipment_id: null })];
    if (shipment) {
      const newIds = (shipment.order_ids || []).filter(id => id !== order.id);
      promises.push(base44.entities.Shipment.update(shipment.id, { order_ids: newIds }));
    }
    await Promise.all(promises);
    queryClient.invalidateQueries({ queryKey: ['orders'] });
    queryClient.invalidateQueries({ queryKey: ['shipments'] });
  };

  const handleQatarReceived = async ({ qatar_received_date, qatar_notes }) => {
    await base44.entities.Shipment.update(qatarTarget.id, {
      received_in_qatar: true, qatar_received_date, qatar_notes, status: 'delivered',
    });
    queryClient.invalidateQueries({ queryKey: ['shipments'] });
    toast.success(`Shipment "${qatarTarget?.shipment_number}" marked as received in Qatar.`);
    setQatarTarget(null);
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 bg-slate-100 rounded w-48 animate-pulse" />
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-40 bg-slate-50 rounded-xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Shipments</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Group received orders into shipments · {orders.filter(o => !o.shipment_id).length} orders unassigned
          </p>
        </div>
        <Button onClick={() => { setEditing(null); setShowForm(true); }} className="bg-indigo-600 hover:bg-indigo-700 gap-1.5">
          <Plus className="w-4 h-4" /> New Shipment
        </Button>
      </div>

      <UnassignedPool orders={orders} shipments={shipments} onAssign={handleAssign} />

      <ShipmentBoard
        shipments={shipments}
        orders={orders}
        onEdit={s => { setEditing(s); setShowForm(true); }}
        onDelete={setToDelete}
        onUnassign={handleUnassign}
        onMarkQatarReceived={setQatarTarget}
      />

      <ReceivedInQatarArchive
        shipments={shipments}
        orders={orders}
        onEdit={s => { setEditing(s); setShowForm(true); }}
        onDelete={setToDelete}
        onUnassign={handleUnassign}
      />

      <ShipmentFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        shipment={editing}
        onSaved={() => queryClient.invalidateQueries({ queryKey: ['shipments'] })}
      />

      <MarkQatarReceivedDialog
        open={!!qatarTarget}
        onOpenChange={v => { if (!v) setQatarTarget(null); }}
        shipment={qatarTarget}
        onConfirm={handleQatarReceived}
      />

      <AlertDialog open={!!toDelete} onOpenChange={() => setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Shipment</AlertDialogTitle>
            <AlertDialogDescription>Delete "{toDelete?.shipment_number}"? All orders in it will return to the unassigned pool.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}