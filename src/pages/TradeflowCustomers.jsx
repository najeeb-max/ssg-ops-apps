import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, Search, Pencil, Trash2, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CustomerFormDialog from '../components/tradeflow/customers/CustomerFormDialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function TradeflowCustomers() {
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [search, setSearch] = useState('');
  const [deleteCustomer, setDeleteCustomer] = useState(null);
  const queryClient = useQueryClient();

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: () => base44.entities.Customer.list('-created_date'),
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['orders'],
    queryFn: () => base44.entities.Order.list(),
  });

  const handleDelete = async () => {
    await base44.entities.Customer.delete(deleteCustomer.id);
    setDeleteCustomer(null);
    queryClient.invalidateQueries({ queryKey: ['customers'] });
  };

  const filteredCustomers = customers.filter(c =>
    !search ||
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.contact_person?.toLowerCase().includes(search.toLowerCase())
  );

  const getOrderCount = (customerId) => orders.filter(o => o.customer_id === customerId).length;

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
          <p className="text-sm text-slate-400">{customers.length} customers</p>
        </div>
        <Button onClick={() => { setEditingCustomer(null); setShowForm(true); }} className="bg-indigo-600 hover:bg-indigo-700 gap-1.5">
          <Plus className="w-4 h-4" /> Add Customer
        </Button>
      </div>

      <div className="relative mb-4 max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customers..." className="pl-9" />
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredCustomers.map((customer) => (
          <div key={customer.id} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-slate-800">{customer.name}</h3>
                {customer.contact_person && <p className="text-sm text-slate-500">{customer.contact_person}</p>}
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingCustomer(customer); setShowForm(true); }}>
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-300 hover:text-destructive" onClick={() => setDeleteCustomer(customer)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
            <div className="space-y-1">
              {customer.email && <p className="text-xs text-slate-500 flex items-center gap-1.5"><Mail className="w-3 h-3" />{customer.email}</p>}
              {customer.phone && <p className="text-xs text-slate-500 flex items-center gap-1.5"><Phone className="w-3 h-3" />{customer.phone}</p>}
            </div>
            <p className="text-xs text-slate-400 mt-2">{getOrderCount(customer.id)} order{getOrderCount(customer.id) !== 1 ? 's' : ''}</p>
          </div>
        ))}
        {filteredCustomers.length === 0 && (
          <p className="col-span-3 text-center text-slate-400 py-12">{search ? 'No customers match your search.' : 'No customers yet. Add your first customer!'}</p>
        )}
      </div>

      <CustomerFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        customer={editingCustomer}
        onSaved={() => queryClient.invalidateQueries({ queryKey: ['customers'] })}
      />

      <AlertDialog open={!!deleteCustomer} onOpenChange={() => setDeleteCustomer(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Customer</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete "{deleteCustomer?.name}"? This can't be undone.</AlertDialogDescription>
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