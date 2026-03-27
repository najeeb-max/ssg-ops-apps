import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, Search, Pencil, Trash2, Mail, Phone, Globe, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import SupplierFormDialog from '../components/tradeflow/suppliers/SupplierFormDialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} className={`w-3.5 h-3.5 ${rating >= s ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
      ))}
    </div>
  );
}

export default function TradeflowSuppliers() {
  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [search, setSearch] = useState('');
  const [deleteSupplier, setDeleteSupplier] = useState(null);
  const queryClient = useQueryClient();

  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => base44.entities.Supplier.list('-created_date'),
  });

  const handleDelete = async () => {
    await base44.entities.Supplier.delete(deleteSupplier.id);
    setDeleteSupplier(null);
    queryClient.invalidateQueries({ queryKey: ['suppliers'] });
  };

  const filtered = suppliers.filter(s =>
    !search ||
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.country?.toLowerCase().includes(search.toLowerCase()) ||
    s.product_categories?.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Suppliers</h1>
          <p className="text-sm text-slate-400">{suppliers.length} suppliers in your directory</p>
        </div>
        <Button onClick={() => { setEditingSupplier(null); setShowForm(true); }} className="bg-indigo-600 hover:bg-indigo-700 gap-1.5">
          <Plus className="w-4 h-4" /> Add Supplier
        </Button>
      </div>

      <div className="relative mb-4 max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search suppliers..." className="pl-9" />
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((supplier) => (
          <div key={supplier.id} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-slate-800">{supplier.name}</h3>
                {supplier.contact_person && <p className="text-sm text-slate-500">{supplier.contact_person}</p>}
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingSupplier(supplier); setShowForm(true); }}>
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-300 hover:text-destructive" onClick={() => setDeleteSupplier(supplier)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
            <div className="space-y-1">
              {supplier.country && <p className="text-xs text-slate-500 flex items-center gap-1.5"><Globe className="w-3 h-3" />{supplier.country}</p>}
              {supplier.email && <p className="text-xs text-slate-500 flex items-center gap-1.5"><Mail className="w-3 h-3" />{supplier.email}</p>}
              {supplier.phone && <p className="text-xs text-slate-500 flex items-center gap-1.5"><Phone className="w-3 h-3" />{supplier.phone}</p>}
            </div>
            {supplier.product_categories && (
              <p className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full inline-block mt-2">{supplier.product_categories}</p>
            )}
            {supplier.rating ? <div className="mt-2"><StarRating rating={supplier.rating} /></div> : null}
            {supplier.payment_terms && <p className="text-xs text-slate-400 mt-1">{supplier.payment_terms}</p>}
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-3 text-center text-slate-400 py-12">{search ? 'No suppliers match your search.' : 'No suppliers yet. Add your first supplier!'}</p>
        )}
      </div>

      <SupplierFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        supplier={editingSupplier}
        onSaved={() => queryClient.invalidateQueries({ queryKey: ['suppliers'] })}
      />

      <AlertDialog open={!!deleteSupplier} onOpenChange={() => setDeleteSupplier(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Supplier</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete "{deleteSupplier?.name}"?</AlertDialogDescription>
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