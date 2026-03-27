import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, Search, Pencil, Trash2, Zap, Package } from 'lucide-react';
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
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [deleteOrder, setDeleteOrder] = useState(null);
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => base44.entities.Order.list('-created_date', 200),
  });

  const { data: currentUser } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });
  const isAdmin = currentUser?.role === 'admin';

  const handleDelete = async () => {
    await base44.entities.Order.delete(deleteOrder.id);
    setDeleteOrder(null);
    queryClient.invalidateQueries({ queryKey: ['orders'] });
  };

  const matchesSearch = (order) => !search ||
    order.product_name?.toLowerCase().includes(search.toLowerCase()) ||
    order.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
    order.supplier_name?.toLowerCase().includes(search.toLowerCase()) ||
    order.domestic_tracking_number?.toLowerCase().includes(search.toLowerCase()) ||
    order.express_tracking_number?.toLowerCase().includes(search.toLowerCase()) ||
    order.team_member_name?.toLowerCase().includes(search.toLowerCase()) ||
    order.alibaba_order_ref?.toLowerCase().includes(search.toLowerCase());

  const filterOrder = (o) =>
    matchesSearch(o) &&
    (statusFilter === 'all' || o.status === statusFilter) &&
    (platformFilter === 'all' || o.source_platform === platformFilter ||
      (platformFilter === 'direct' && o.fulfillment_type === 'direct_express') ||
      (platformFilter === 'hub' && o.fulfillment_type !== 'direct_express'));

  const activeOrders = orders.filter(o => ACTIVE_STATUSES.includes(o.status) && filterOrder(o));
  const closedOrders = orders.filter(o => CLOSED_STATUSES.includes(o.status) && filterOrder(o));
  const hubOrders = orders.filter(o => o.fulfillment_type !== 'direct_express');
  const directOrders = orders.filter(o => o.fulfillment_type === 'direct_express');

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  const OrderTable = ({ list }) => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            <th className="text-left py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase">Commodity</th>
            <th className="text-left py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase">Platform</th>
            <th className="text-left py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase">Supplier / Seller</th>
            <th className="text-left py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase">Person</th>
            <th className="text-left py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
            <th className="text-left py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase">Tracking</th>
            <th className="w-20"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {list.map((order) => {
            const isDirect = order.fulfillment_type === 'direct_express';
            const tracking = isDirect ? order.express_tracking_number : order.domestic_tracking_number;
            const logo = platformLogos[order.source_platform];
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
                      <img src={logo} alt={order.source_platform} className="h-4 w-auto object-contain" />
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
                <td className="py-2.5 px-4 text-xs text-slate-500 font-mono">{tracking || '—'}</td>
                <td className="py-2.5 px-4">
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingOrder(order); setShowForm(true); }}>
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
          {list.length === 0 && (
            <tr><td colSpan={7} className="text-center py-10 text-slate-400 text-sm">No orders found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {orders.length} total · {hubOrders.length} via hub · {directOrders.length} direct
          </p>
        </div>
        <Button onClick={() => { setEditingOrder(null); setShowForm(true); }} className="bg-indigo-600 hover:bg-indigo-700 gap-1.5">
          <Plus className="w-4 h-4" /> New Order
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
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
      </div>

      <Tabs defaultValue="active" className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <TabsList className="bg-slate-50 border-b border-slate-100 rounded-none w-full justify-start px-4 py-0 h-11">
          <TabsTrigger value="active" className="text-sm">Active Orders <span className="ml-1.5 bg-indigo-100 text-indigo-700 text-xs font-semibold px-1.5 py-0.5 rounded-full">{activeOrders.length}</span></TabsTrigger>
          <TabsTrigger value="closed" className="text-sm">Completed / Closed <span className="ml-1.5 bg-slate-100 text-slate-600 text-xs font-semibold px-1.5 py-0.5 rounded-full">{closedOrders.length}</span></TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="m-0"><OrderTable list={activeOrders} /></TabsContent>
        <TabsContent value="closed" className="m-0"><OrderTable list={closedOrders} /></TabsContent>
      </Tabs>

      <OrderFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        order={editingOrder}
        onSaved={() => queryClient.invalidateQueries({ queryKey: ['orders'] })}
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