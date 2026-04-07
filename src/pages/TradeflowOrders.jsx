import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Plus, Search, Pencil, Trash2, Zap, Package, Ship, AlertTriangle, Plane, Truck, Train } from 'lucide-react';
import { getTransportIcon } from '@/lib/transportIcons';
import { buildShipmentColorMap, NEUTRAL_COLOR } from '@/lib/shipmentColors';
import OrderDraftsPanel from '../components/tradeflow/orders/OrderDraftsPanel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OrderFormDialog from '../components/tradeflow/orders/OrderFormDialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const ACTIVE_STATUSES = ['pending', 'confirmed', 'received_at_hub', 'in_transit'];
const CLOSED_STATUSES = ['delivered', 'cancelled'];

const statusStyles = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  received_at_hub: 'bg-teal-50 text-teal-700 border-teal-200',
  in_transit: 'bg-purple-50 text-purple-700 border-purple-200',
  delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-slate-100 text-slate-500 border-slate-200',
};

const platformLogos = {
  Alibaba: 'https://cdn.worldvectorlogo.com/logos/alibaba-1.svg',
  'Alibaba Direct': 'https://cdn.worldvectorlogo.com/logos/alibaba-1.svg',
  eBay: 'https://cdn.worldvectorlogo.com/logos/ebay-1.svg',
  Amazon: 'https://cdn.worldvectorlogo.com/logos/amazon-2.svg',
  TEM: '⚡',
  'Other Direct': '🌍',
};

export default function TradeflowOrders() {
  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [resumingDraftId, setResumingDraftId] = useState(null);
  const [draftRefresh, setDraftRefresh] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [bookingFilter, setBookingFilter] = useState('all'); // 'all' | 'booked' | 'unbooked'
  const [deleteOrder, setDeleteOrder] = useState(null);
  const [activeTab, setActiveTab] = useState('active');
  const [closedLoaded, setClosedLoaded] = useState(false);
  const [activeVisible, setActiveVisible] = useState(50);
  const [closedVisible, setClosedVisible] = useState(50);
  const queryClient = useQueryClient();

  // Real-time subscriptions — invalidate cache on any Order or Shipment change
  useEffect(() => {
    const unsubOrder = base44.entities.Order.subscribe(() => {
      queryClient.invalidateQueries({ queryKey: ['orders', 'active'] });
      queryClient.invalidateQueries({ queryKey: ['orders', 'closed'] });
    });
    const unsubShipment = base44.entities.Shipment.subscribe(() => {
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
    });
    return () => { unsubOrder(); unsubShipment(); };
  }, [queryClient]);

  // Active orders only — small bounded set, always needed
  const { data: activeOrdersRaw = [], isLoading } = useQuery({
    queryKey: ['orders', 'active'],
    queryFn: () => base44.entities.Order.filter({ status: { $in: ['pending', 'confirmed', 'received_at_hub', 'in_transit'] } }, '-created_date', 500),
    staleTime: 30_000,
  });

  // Closed orders — lazy loaded only when user opens the Closed tab
  const { data: closedOrdersRaw = [], isFetching: closedFetching } = useQuery({
    queryKey: ['orders', 'closed'],
    queryFn: () => base44.entities.Order.filter({ status: { $in: ['delivered', 'cancelled'] } }, '-created_date', 200),
    staleTime: 60_000,
    enabled: closedLoaded,
  });

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
    if (tab === 'closed') setClosedLoaded(true);
  }, []);

  const { data: shipments = [] } = useQuery({
    queryKey: ['shipments'],
    queryFn: () => base44.entities.Shipment.list('-created_date'),
    staleTime: 30_000,
  });

  // Quick lookup map: shipment_id → shipment
  const shipmentMap = useMemo(() => {
    const m = {};
    shipments.forEach(s => { m[s.id] = s; });
    return m;
  }, [shipments]);

  const shipmentColorMap = useMemo(() => buildShipmentColorMap(shipments), [shipments]);

  const { data: currentUser } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me(), staleTime: 60_000 });
  const isAdmin = currentUser?.role === 'admin';

  const handleDelete = async () => {
    await base44.entities.Order.update(deleteOrder.id, { status: 'cancelled' });
    setDeleteOrder(null);
    queryClient.invalidateQueries({ queryKey: ['orders', 'active'] });
    queryClient.invalidateQueries({ queryKey: ['orders', 'closed'] });
    toast.success(`"${deleteOrder.product_name}" moved to Cancelled.`);
  };

  const { activeOrders, closedOrders, hubOrders, directOrders } = useMemo(() => {
    const q = search.toLowerCase();
    const matchesSearch = (o) => !q ||
      o.product_name?.toLowerCase().includes(q) ||
      o.customer_name?.toLowerCase().includes(q) ||
      o.supplier_name?.toLowerCase().includes(q) ||
      o.domestic_tracking_number?.toLowerCase().includes(q) ||
      o.express_tracking_number?.toLowerCase().includes(q) ||
      o.team_member_name?.toLowerCase().includes(q) ||
      o.alibaba_order_ref?.toLowerCase().includes(q);

    const filterOrder = (o) =>
      matchesSearch(o) &&
      (statusFilter === 'all' || o.status === statusFilter) &&
      (platformFilter === 'all' || o.source_platform === platformFilter ||
        (platformFilter === 'direct' && o.fulfillment_type === 'direct_express') ||
        (platformFilter === 'hub' && o.fulfillment_type !== 'direct_express')) &&
      (bookingFilter === 'all' || (bookingFilter === 'booked' && !!o.shipment_id) || (bookingFilter === 'unbooked' && !o.shipment_id));

    return {
      activeOrders: activeOrdersRaw.filter(filterOrder),
      closedOrders: closedOrdersRaw.filter(filterOrder),
      hubOrders: activeOrdersRaw.filter(o => o.fulfillment_type !== 'direct_express'),
      directOrders: activeOrdersRaw.filter(o => o.fulfillment_type === 'direct_express'),
    };
  }, [activeOrdersRaw, closedOrdersRaw, search, statusFilter, platformFilter, bookingFilter]);

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 bg-slate-100 rounded w-48 animate-pulse" />
        <div className="h-10 bg-slate-100 rounded w-full animate-pulse" />
        {[...Array(6)].map((_, i) => <div key={i} className="h-12 bg-slate-50 rounded animate-pulse" />)}
      </div>
    );
  }

  // Mobile card view (Point 12)
  const OrderCard = ({ order }) => {
    const isDirect = order.fulfillment_type === 'direct_express';
    const tracking = isDirect ? order.express_tracking_number : order.domestic_tracking_number;
    const shipment = order.shipment_id ? shipmentMap[order.shipment_id] : null;
    return (
      <div className="p-4 border-b border-slate-100 last:border-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className="font-medium text-slate-800 text-sm">{order.product_name}</p>
          <Badge className={`text-xs border shrink-0 ${statusStyles[order.status] || ''}`}>{order.status?.replace(/_/g, ' ')}</Badge>
        </div>
        <p className="text-xs text-slate-400">{order.customer_name || ''}{order.supplier_name ? ` · ${order.supplier_name}` : ''}</p>
        {tracking && <p className="text-xs text-slate-400 font-mono mt-1">{tracking}</p>}
        <div className="flex items-center justify-between mt-2 flex-wrap gap-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`text-xs px-1.5 py-0.5 rounded flex items-center gap-0.5 ${isDirect ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'}`}>
              {isDirect ? <><Zap className="w-3 h-3" />Direct</> : <><Package className="w-3 h-3" />Hub</>}
            </span>
            {shipment ? (() => {
              const c = shipmentColorMap[shipment.id] || NEUTRAL_COLOR;
              const TransportIcon = getTransportIcon(shipment.transport_mode);
              return (
                <span className={`text-xs px-1.5 py-0.5 rounded-full flex items-center gap-0.5 font-bold border ${c.badge}`}>
                  <TransportIcon className="w-3 h-3" />{shipment.shipment_number}
                </span>
              );
            })() : !isDirect && (
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200 flex items-center gap-0.5">
                <AlertTriangle className="w-3 h-3" />No Shipment
              </span>
            )}
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingOrder(order); setResumingDraftId(null); setShowForm(true); }}><Pencil className="w-3.5 h-3.5" /></Button>
            {isAdmin && <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-300 hover:text-destructive" onClick={() => setDeleteOrder(order)}><Trash2 className="w-3.5 h-3.5" /></Button>}
          </div>
        </div>
      </div>
    );
  };

  const OrderTable = ({ list, visible, onLoadMore }) => {
    const slice = list.slice(0, visible);
    const hasMore = list.length > visible;
    return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase">Commodity</th>
              <th className="text-left py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase">Platform</th>
              <th className="text-left py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase">Supplier / Seller</th>
              <th className="text-left py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase">Person</th>
              <th className="text-left py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
              <th className="text-left py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase">Booking / Shipment</th>
              <th className="text-left py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase">Tracking</th>
              <th className="w-20"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {slice.map((order) => {
              const isDirect = order.fulfillment_type === 'direct_express';
              const tracking = isDirect ? order.express_tracking_number : order.domestic_tracking_number;
              const logo = platformLogos[order.source_platform];
              const shipment = order.shipment_id ? shipmentMap[order.shipment_id] : null;
              return (
                <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-2.5 px-4">
                    <p className="font-medium text-slate-800">{order.product_name}</p>
                    <p className="text-xs text-slate-400">{order.customer_name || '—'}</p>
                    {order.alibaba_order_ref && <span className="text-xs font-mono text-slate-400">{order.alibaba_order_ref}</span>}
                  </td>
                  <td className="py-2.5 px-4">
                    <div className="flex items-center gap-1.5">
                      {logo?.startsWith('http') ? (
                        <img src={logo} alt={order.source_platform} loading="lazy" className="h-4 w-auto object-contain" />
                      ) : <span>{logo}</span>}
                    </div>
                    <div className="flex gap-1 mt-1">
                      {isDirect ? (
                        <span className="text-xs bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded flex items-center gap-0.5"><Zap className="w-3 h-3" />Direct</span>
                      ) : (
                        <span className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded flex items-center gap-0.5"><Package className="w-3 h-3" />Hub</span>
                      )}
                    </div>
                  </td>
                  <td className="py-2.5 px-4 text-slate-600">
                    <p>{order.supplier_name || '—'}</p>
                    {order.supplier_wechat && <p className="text-xs text-slate-400">{order.supplier_wechat}</p>}
                  </td>
                  <td className="py-2.5 px-4 text-slate-600 text-sm">{order.team_member_name || '—'}</td>
                  <td className="py-2.5 px-4">
                    <Badge className={`text-xs border ${statusStyles[order.status] || ''}`}>
                      {order.status?.replace(/_/g, ' ')}
                    </Badge>
                    {isDirect && order.estimated_delivery_date && (
                      <p className="text-xs text-slate-400 mt-0.5">ETA: {order.estimated_delivery_date}</p>
                    )}
                  </td>
                  <td className="py-2.5 px-4">
                    {isDirect ? (
                      <span className="text-xs text-slate-300 italic">Direct Route</span>
                    ) : shipment ? (() => {
                      const c = shipmentColorMap[shipment.id] || NEUTRAL_COLOR;
                      const TransportIcon = getTransportIcon(shipment.transport_mode);
                      return (
                        <div>
                          <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full border ${c.badge}`}>
                            <TransportIcon className="w-3 h-3" />{shipment.shipment_number}
                          </span>
                          <p className="text-xs text-slate-400 mt-0.5 capitalize">{shipment.status?.replace(/_/g, ' ')}{shipment.carrier ? ` · ${shipment.carrier}` : ''}</p>
                          {shipment.arrival_date && <p className="text-xs text-slate-400">ETA: {shipment.arrival_date}</p>}
                        </div>
                      );
                    })() : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                        <AlertTriangle className="w-3 h-3" />Not Booked
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-xs text-slate-500 font-mono">{tracking || '—'}</td>
                  <td className="py-2.5 px-4">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingOrder(order); setResumingDraftId(null); setShowForm(true); }}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      {isAdmin && (
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-300 hover:text-destructive" onClick={() => setDeleteOrder(order)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {slice.length === 0 && (
              <tr><td colSpan={8} className="text-center py-10 text-slate-400 text-sm">No orders found.</td></tr>
            )}
          </tbody>
        </table>
        {hasMore && (
          <div className="flex items-center justify-center py-4 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={onLoadMore} className="text-xs gap-1.5">
              Load more <span className="text-slate-400">({list.length - visible} remaining)</span>
            </Button>
          </div>
        )}
      </div>
      {/* Mobile cards */}
      <div className="md:hidden">
        {slice.length === 0
          ? <p className="text-center py-10 text-slate-400 text-sm">No orders found.</p>
          : slice.map(order => <OrderCard key={order.id} order={order} />)}
        {hasMore && (
          <div className="flex justify-center py-4 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={onLoadMore} className="text-xs">
              Load more ({list.length - visible} remaining)
            </Button>
          </div>
        )}
      </div>
    </>
    );
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {activeOrdersRaw.length} active · {hubOrders.length} via hub · {directOrders.length} direct
          </p>
        </div>
        <Button onClick={() => { setEditingOrder(null); setResumingDraftId(null); setShowForm(true); }} className="bg-indigo-600 hover:bg-indigo-700 gap-1.5">
          <Plus className="w-4 h-4" /> New Order
        </Button>
      </div>

      {/* Drafts Panel */}
      <OrderDraftsPanel
        refreshTrigger={draftRefresh}
        onResume={(id) => { setResumingDraftId(id); setEditingOrder(null); setShowForm(true); }}
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orders..." className="pl-9 w-56" />
        </div>
        <Select value={platformFilter} onValueChange={setPlatformFilter}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Platforms</SelectItem>
            <SelectItem value="hub">🏭 China Hub</SelectItem>
            <SelectItem value="direct">⚡ Direct Express</SelectItem>
            <SelectItem value="Alibaba">🇨🇳 Alibaba</SelectItem>
            <SelectItem value="eBay">🌐 eBay</SelectItem>
            <SelectItem value="Amazon">📦 Amazon</SelectItem>
            <SelectItem value="TEM">⚡ TEM</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="received_at_hub">Received at Hub</SelectItem>
            <SelectItem value="in_transit">In Transit</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        {/* Booking filter pill buttons */}
        <div className="flex items-center rounded-lg border border-slate-200 bg-white overflow-hidden divide-x divide-slate-200 text-xs font-medium h-9">
          {[
            { value: 'all', label: 'All' },
            { value: 'booked', label: '✅ Booked' },
            { value: 'unbooked', label: '⚠️ Not Booked' },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => setBookingFilter(opt.value)}
              className={`px-3 h-full transition-colors ${bookingFilter === opt.value ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <TabsList className="bg-slate-50 border-b border-slate-100 rounded-none w-full justify-start px-4 py-0 h-11">
          <TabsTrigger value="active" className="text-sm">Active Orders <span className="ml-1.5 bg-indigo-100 text-indigo-700 text-xs font-semibold px-1.5 py-0.5 rounded-full">{activeOrders.length}</span></TabsTrigger>
          <TabsTrigger value="closed" className="text-sm">Completed / Closed {closedLoaded && <span className="ml-1.5 bg-slate-100 text-slate-600 text-xs font-semibold px-1.5 py-0.5 rounded-full">{closedOrders.length}</span>}</TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="m-0">
          <OrderTable list={activeOrders} visible={activeVisible} onLoadMore={() => setActiveVisible(v => v + 50)} />
        </TabsContent>
        <TabsContent value="closed" className="m-0">
          {closedFetching ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              <div className="w-5 h-5 border-2 border-slate-200 border-t-slate-500 rounded-full animate-spin mx-auto mb-2" />
              Loading closed orders...
            </div>
          ) : (
            <OrderTable list={closedOrders} visible={closedVisible} onLoadMore={() => setClosedVisible(v => v + 50)} />
          )}
        </TabsContent>
      </Tabs>

      <OrderFormDialog
        open={showForm}
        onOpenChange={(v) => { setShowForm(v); if (!v) setResumingDraftId(null); }}
        order={editingOrder}
        draftId={resumingDraftId}
        onSaved={() => { queryClient.invalidateQueries({ queryKey: ['orders', 'active'] }); queryClient.invalidateQueries({ queryKey: ['orders', 'closed'] }); }}
        onDraftSaved={() => setDraftRefresh(n => n + 1)}
      />

      <AlertDialog open={!!deleteOrder} onOpenChange={() => setDeleteOrder(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Order</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete the order for "{deleteOrder?.product_name}"? This can't be undone.</AlertDialogDescription>
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