import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ShoppingCart, TrendingUp, Clock, Package, ArrowRight, Ship, AlertTriangle } from 'lucide-react';
import StatCard from '../components/tradeflow/dashboard/StatCard';
import { Link } from 'react-router-dom';
import { buildShipmentColorMap, NEUTRAL_COLOR } from '@/lib/shipmentColors';

const statusStyles = {
  pending: 'bg-amber-50 text-amber-700',
  confirmed: 'bg-blue-50 text-blue-700',
  received_at_hub: 'bg-teal-50 text-teal-700',
  in_transit: 'bg-purple-50 text-purple-700',
  delivered: 'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-slate-100 text-slate-500',
};

export default function TradeflowDashboard() {
  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => base44.entities.Order.list('-created_date', 200),
    staleTime: 30_000,
  });

  const { data: shipments = [] } = useQuery({
    queryKey: ['shipments'],
    queryFn: () => base44.entities.Shipment.list('-created_date'),
    staleTime: 30_000,
  });

  const shipmentMap = useMemo(() => {
    const m = {};
    shipments.forEach(s => { m[s.id] = s; });
    return m;
  }, [shipments]);

  const shipmentColorMap = useMemo(() => buildShipmentColorMap(shipments), [shipments]);

  const totalValue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const activeShipments = shipments.filter(s => !s.received_in_qatar && s.status !== 'cancelled').length;
  const hubOrders = orders.filter(o => o.fulfillment_type !== 'direct_express');
  const directOrders = orders.filter(o => o.fulfillment_type === 'direct_express');
  const unassignedOrders = hubOrders.filter(o => !o.shipment_id && ['pending', 'confirmed', 'received_at_hub'].includes(o.status)).length;
  const activeOrders = orders.filter(o => ['pending', 'confirmed', 'received_at_hub', 'in_transit'].includes(o.status));

  if (ordersLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-0.5">Overview of your logistics operations</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Orders" value={orders.length} subtitle={`${pendingOrders} pending`} icon={ShoppingCart} color="indigo" />
        <StatCard title="Active Shipments" value={activeShipments} subtitle={`${shipments.length} total`} icon={Ship} color="emerald" />
        <StatCard title="Unbooked Hub Orders" value={unassignedOrders} subtitle="Need shipment assignment" icon={AlertTriangle} color="amber" />
        <StatCard title="Total Value" value={totalValue > 0 ? `$${totalValue.toLocaleString()}` : '—'} icon={TrendingUp} color="rose" />
      </div>

      {/* Unbooked alert */}
      {unassignedOrders > 0 && (
        <Link to="/tradeflow/orders" className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 hover:bg-amber-100 transition-colors group">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">{unassignedOrders} China Hub order{unassignedOrders !== 1 ? 's' : ''} not yet assigned to a shipment</p>
            <p className="text-xs text-amber-600">These orders need to be booked into a shipment before they can be consolidated.</p>
          </div>
          <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      )}

      {/* Quick Access */}
      <div className="grid grid-cols-3 gap-4">
        <Link to="/tradeflow/orders" className="bg-white rounded-xl border border-slate-200 p-4 hover:border-indigo-200 hover:shadow-sm transition-all group">
          <p className="text-sm font-semibold text-slate-700 group-hover:text-indigo-700">China Hub Orders</p>
          <p className="text-xs text-slate-400 mt-0.5">{hubOrders.length} orders · Alibaba</p>
        </Link>
        <Link to="/tradeflow/orders" className="bg-white rounded-xl border border-slate-200 p-4 hover:border-indigo-200 hover:shadow-sm transition-all group">
          <p className="text-sm font-semibold text-slate-700 group-hover:text-indigo-700">Direct Express</p>
          <p className="text-xs text-slate-400 mt-0.5">{directOrders.length} orders · eBay · Amazon · TEM</p>
        </Link>
        <Link to="/tradeflow/shipments" className="bg-white rounded-xl border border-slate-200 p-4 hover:border-indigo-200 hover:shadow-sm transition-all group">
          <p className="text-sm font-semibold text-slate-700 group-hover:text-indigo-700">Shipments</p>
          <p className="text-xs text-slate-400 mt-0.5">{shipments.length} total · {activeShipments} active</p>
        </Link>
      </div>

      {/* Recent Active Orders */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">Active Orders</h2>
          <Link to="/tradeflow/orders" className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="divide-y divide-slate-50">
          {activeOrders.slice(0, 10).map(order => {
            const shipment = order.shipment_id ? shipmentMap[order.shipment_id] : null;
            const isDirect = order.fulfillment_type === 'direct_express';
            return (
              <div key={order.id} className="px-4 py-2.5 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-800 truncate">{order.product_name}</p>
                  <p className="text-xs text-slate-400">{[order.supplier_name, order.team_member_name].filter(Boolean).join(' · ')}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyles[order.status] || 'bg-slate-100 text-slate-500'}`}>
                    {order.status?.replace(/_/g, ' ')}
                  </span>
                  {isDirect ? (
                    <span className="text-xs text-slate-300 italic hidden sm:inline">Direct</span>
                  ) : shipment ? (() => {
                    const c = shipmentColorMap[shipment.id] || NEUTRAL_COLOR;
                    return (
                      <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full border ${c.badge}`}>
                        <Ship className="w-3 h-3" />{shipment.shipment_number}
                      </span>
                    );
                  })() : (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                      <AlertTriangle className="w-3 h-3" />Not Booked
                    </span>
                  )}
                </div>
              </div>
            );
          })}
          {activeOrders.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-8">No active orders.</p>
          )}
        </div>
      </div>
    </div>
  );
}