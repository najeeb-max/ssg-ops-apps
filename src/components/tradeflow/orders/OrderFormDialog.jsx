import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import SupplierQuotesSection from './SupplierQuotesSection';
import { CURRENCIES, TEAM_MEMBERS, PLATFORMS, ORDER_STATUSES_HUB, ORDER_STATUSES_DIRECT } from '@/lib/constants';
import UnsavedDraftDialog from './UnsavedDraftDialog';
import { saveDraft, deleteDraft, getDraftById } from '@/lib/orderDrafts';

// Only string fields that a user explicitly types count as meaningful.
const MEANINGFUL_FIELDS = [
  'product_name', 'supplier_name', 'supplier_salesperson', 'supplier_wechat',
  'customer_name', 'platform_order_ref', 'domestic_tracking_number',
  'express_tracking_number', 'notes',
];
const MEANINGFUL_NUMERIC_FIELDS = ['quantity', 'unit_price', 'weight_kgs', 'cbm', 'num_cartons'];

function hasMeaningfulData(formData) {
  const hasText = MEANINGFUL_FIELDS.some(f => {
    const v = formData[f];
    return typeof v === 'string' && v.trim() !== '';
  });
  const hasNumber = MEANINGFUL_NUMERIC_FIELDS.some(f => {
    const v = Number(formData[f]);
    return !isNaN(v) && v > 0;
  });
  return hasText || hasNumber;
}

const emptyForm = () => ({
  platform_order_ref: '',
  source_platform: 'Alibaba',
  fulfillment_type: 'china_hub',
  product_name: '',
  quantity: '',
  unit: '',
  unit_price: '',
  currency: 'USD',
  customer_name: '',
  supplier_name: '',
  supplier_salesperson: '',
  supplier_wechat: '',
  team_member_name: '',
  status: 'pending',
  domestic_tracking_number: '',
  express_tracking_number: '',
  estimated_delivery_date: '',
  weight_kgs: '',
  cbm: '',
  num_cartons: '',
  order_date: new Date().toISOString().split('T')[0],
  notes: '',
  supplier_quotes: [],
});

export default function OrderFormDialog({ open, onOpenChange, order, draftId, onSaved, onDraftSaved }) {
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [showDraftDialog, setShowDraftDialog] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  // Track which draft we're currently editing (so we can update it, not create a new one)
  const [activeDraftId, setActiveDraftId] = useState(null);

  const { data: currentUser } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });
  const { data: allOrders = [] } = useQuery({
    queryKey: ['orders-for-seq'],
    queryFn: () => base44.entities.Order.list('-created_date', 200),
    enabled: !order,
  });

  const generateSSGOrderNumber = () => {
    const ssgNums = allOrders.map(o => {
      const match = o.alibaba_order_ref?.match(/^SSG-(\d+)$/);
      return match ? parseInt(match[1], 10) : 0;
    }).filter(n => n > 0);
    const next = ssgNums.length > 0 ? Math.max(...ssgNums) + 1 : 1;
    return `SSG-${String(next).padStart(4, '0')}`;
  };

  useEffect(() => {
    if (!open) return;

    if (order) {
      // Editing an existing real order
      setForm({
        alibaba_order_ref: order.alibaba_order_ref || '',
        platform_order_ref: order.platform_order_ref || '',
        source_platform: order.source_platform || 'Alibaba',
        fulfillment_type: order.fulfillment_type || 'china_hub',
        product_name: order.product_name || '',
        quantity: order.quantity || '',
        unit: order.unit || '',
        unit_price: order.unit_price || '',
        currency: order.currency || 'USD',
        customer_name: order.customer_name || '',
        supplier_name: order.supplier_name || '',
        supplier_salesperson: order.supplier_salesperson || '',
        supplier_wechat: order.supplier_wechat || '',
        team_member_name: order.team_member_name || '',
        status: order.status || 'pending',
        domestic_tracking_number: order.domestic_tracking_number || '',
        express_tracking_number: order.express_tracking_number || '',
        estimated_delivery_date: order.estimated_delivery_date || '',
        weight_kgs: order.weight_kgs || '',
        cbm: order.cbm || '',
        num_cartons: order.num_cartons || '',
        order_date: order.order_date || new Date().toISOString().split('T')[0],
        notes: order.notes || '',
        supplier_quotes: order.supplier_quotes || [],
      });
      setIsDirty(false);
      setActiveDraftId(null);
    } else if (draftId) {
      // Resuming a saved draft — do NOT assign SSG number yet
      const draft = getDraftById(draftId);
      if (draft) {
        setForm({ ...emptyForm(), ...draft.form });
        setIsDirty(true);
        setActiveDraftId(draftId);
      } else {
        setForm({ ...emptyForm(), team_member_name: currentUser?.full_name || '' });
        setIsDirty(false);
        setActiveDraftId(null);
      }
    } else {
      // Brand new order — blank form, no SSG number until confirmed
      setForm({ ...emptyForm(), team_member_name: currentUser?.full_name || '' });
      setIsDirty(false);
      setActiveDraftId(null);
    }
  }, [order, draftId, open, currentUser]);

  const set = (field) => (e) => {
    const newForm = { ...form, [field]: e.target.value };
    setForm(newForm);
    if (!order) setIsDirty(hasMeaningfulData(newForm));
  };

  const handleCloseAttempt = useCallback((requestedOpen) => {
    if (!requestedOpen && !order && isDirty && hasMeaningfulData(form)) {
      setShowDraftDialog(true);
    } else {
      onOpenChange(requestedOpen);
    }
  }, [order, isDirty, form, onOpenChange]);

  const handleDiscard = () => {
    if (activeDraftId) deleteDraft(activeDraftId);
    setIsDirty(false);
    setActiveDraftId(null);
    setShowDraftDialog(false);
    onOpenChange(false);
    onDraftSaved?.(); // refresh draft panel
    toast.success('Draft discarded');
  };

  const handleKeepDraft = () => {
    const newId = saveDraft(form, activeDraftId);
    setActiveDraftId(newId);
    setShowDraftDialog(false);
    onOpenChange(false);
    onDraftSaved?.(); // refresh draft panel
    toast.success('Draft saved — resume it anytime from the Orders page');
  };

  const handleCancelClose = () => {
    setShowDraftDialog(false);
  };

  const handlePlatformChange = (value) => {
    const platform = PLATFORMS.find(p => p.value === value);
    setForm(f => ({ ...f, source_platform: value, fulfillment_type: platform?.type || 'china_hub' }));
  };

  const isDirectExpress = form.fulfillment_type === 'direct_express';
  const statuses = isDirectExpress ? ORDER_STATUSES_DIRECT : ORDER_STATUSES_HUB;

  const totalAmount = form.quantity && form.unit_price
    ? (Number(form.quantity) * Number(form.unit_price)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : null;

  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.product_name?.trim()) errs.product_name = 'Product name is required';
    if (form.quantity && isNaN(Number(form.quantity))) errs.quantity = 'Must be a number';
    if (form.unit_price && isNaN(Number(form.unit_price))) errs.unit_price = 'Must be a number';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);

    const data = {
      ...form,
      quantity: form.quantity ? Number(form.quantity) : undefined,
      unit_price: form.unit_price ? Number(form.unit_price) : undefined,
      total_amount: form.quantity && form.unit_price ? Number(form.quantity) * Number(form.unit_price) : undefined,
      weight_kgs: form.weight_kgs ? Number(form.weight_kgs) : undefined,
      cbm: form.cbm ? Number(form.cbm) : undefined,
      num_cartons: form.num_cartons ? Number(form.num_cartons) : undefined,
    };

    if (order) {
      await base44.entities.Order.update(order.id, data);
      toast.success('Order updated successfully');
    } else {
      // Assign SSG order number only NOW when the order is confirmed/created
      data.alibaba_order_ref = generateSSGOrderNumber();
      await base44.entities.Order.create(data);
      // Remove draft if this was created from one
      if (activeDraftId) deleteDraft(activeDraftId);
      toast.success(`Order ${data.alibaba_order_ref} created successfully`);
    }

    setSaving(false);
    setIsDirty(false);
    setActiveDraftId(null);
    onSaved();
    onDraftSaved?.();
    onOpenChange(false);
  };

  const isDraftMode = !order && !!activeDraftId;

  return (
    <>
      <UnsavedDraftDialog
        open={showDraftDialog}
        onDiscard={handleDiscard}
        onKeep={handleKeepDraft}
        onCancel={handleCancelClose}
      />
      <Dialog open={open} onOpenChange={handleCloseAttempt}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-2">
            <div>
              <DialogTitle className="text-lg font-bold">
                {order ? '✏️ Edit Order' : isDraftMode ? '📝 Resume Draft' : '+ New Order'}
              </DialogTitle>
              <p className="text-xs text-slate-500">
                {isDirectExpress ? '⚡ Direct Express → Qatar' : '🏭 China Hub Consolidation → Qatar'}
              </p>
            </div>
            {/* SSG number only shown on edit of existing order */}
            {order?.alibaba_order_ref && (
              <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded">{order.alibaba_order_ref}</span>
            )}
            {!order && (
              <span className="text-xs bg-amber-100 text-amber-700 border border-amber-200 px-2 py-1 rounded font-medium">
                {isDraftMode ? '📝 Draft' : 'Order # assigned on confirm'}
              </span>
            )}
          </div>

          {/* Draft banner */}
          {isDraftMode && (
            <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-1 text-xs text-amber-700">
              <span>📝 Resuming saved draft — confirm to create the real order.</span>
              <button onClick={handleDiscard} className="underline hover:text-amber-900 ml-2 font-semibold">Discard Draft</button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Product Section */}
            <div className="space-y-3 p-4 bg-slate-50 rounded-xl">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">📦 Product / Commodity</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label>Source Platform</Label>
                  <Select value={form.source_platform} onValueChange={handlePlatformChange}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Alibaba" disabled className="font-semibold text-xs text-slate-400">🏭 China Hub Consolidation</SelectItem>
                      {PLATFORMS.filter(p => p.type === 'china_hub').map(p => (
                        <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                      ))}
                      <SelectItem value="eBay" disabled className="font-semibold text-xs text-slate-400">⚡ Direct to Qatar</SelectItem>
                      {PLATFORMS.filter(p => p.type === 'direct_express').map(p => (
                        <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Platform Order Ref #</Label>
                  <Input value={form.platform_order_ref} onChange={set('platform_order_ref')} placeholder="Platform ref..." className="h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label>Order Date</Label>
                  <Input type="date" value={form.order_date} onChange={set('order_date')} className="h-9" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Product Name *</Label>
                <Input value={form.product_name} onChange={set('product_name')} placeholder="e.g. Steel pipes 2 inch..." required className={errors.product_name ? 'border-red-400' : ''} />
                {errors.product_name && <p className="text-xs text-red-500">{errors.product_name}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>{isDirectExpress ? 'Seller / Store' : 'Supplier'}</Label>
                <Input value={form.supplier_name} onChange={set('supplier_name')} placeholder="Supplier name" />
              </div>
              {!isDirectExpress && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Sales Contact</Label>
                    <Input value={form.supplier_salesperson} onChange={set('supplier_salesperson')} placeholder="Contact name" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>WeChat / Phone</Label>
                    <Input value={form.supplier_wechat} onChange={set('supplier_wechat')} placeholder="WeChat ID" />
                  </div>
                </div>
              )}
            </div>

            {/* Logistics & Financials */}
            <div className="space-y-3 p-4 bg-slate-50 rounded-xl">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Logistics & Financials</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label>KGS</Label>
                  <Input type="number" value={form.weight_kgs} onChange={set('weight_kgs')} placeholder="0" className="h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label>CBM</Label>
                  <Input type="number" value={form.cbm} onChange={set('cbm')} placeholder="0" className="h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label>Cartons</Label>
                  <Input type="number" value={form.num_cartons} onChange={set('num_cartons')} placeholder="0" className="h-9" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label>Quantity</Label>
                  <Input type="number" value={form.quantity} onChange={set('quantity')} placeholder="0" className="h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label>Unit Price {totalAmount && <span className="text-emerald-600 font-semibold">= {form.currency} {totalAmount}</span>}</Label>
                  <Input type="number" value={form.unit_price} onChange={set('unit_price')} placeholder="0.00" className="h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label>Currency</Label>
                  <Select value={form.currency} onValueChange={v => setForm(f => ({ ...f, currency: v }))}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>{CURRENCIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Tracking & Status */}
            <div className="space-y-3 p-4 bg-slate-50 rounded-xl">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Tracking & Status</p>
              <div className="grid grid-cols-2 gap-3">
                {isDirectExpress ? (
                  <>
                    <div className="space-y-1.5">
                      <Label>Express Tracking #</Label>
                      <Input value={form.express_tracking_number} onChange={set('express_tracking_number')} className="h-9" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Estimated Delivery to Qatar</Label>
                      <Input type="date" value={form.estimated_delivery_date} onChange={set('estimated_delivery_date')} className="h-9" />
                    </div>
                  </>
                ) : (
                  <div className="space-y-1.5 col-span-2">
                    <Label>China Domestic Tracking #</Label>
                    <Input value={form.domestic_tracking_number} onChange={set('domestic_tracking_number')} className="h-9" />
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>{statuses.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Team Member</Label>
                  <Select value={form.team_member_name} onValueChange={v => setForm(f => ({ ...f, team_member_name: v }))}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>{TEAM_MEMBERS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Customer Name</Label>
                <Input value={form.customer_name} onChange={set('customer_name')} placeholder="End customer" className="h-9" />
              </div>
            </div>

            {/* Supplier Quotes */}
            <div className="p-4 bg-slate-50 rounded-xl">
              <SupplierQuotesSection quotes={form.supplier_quotes || []} onChange={v => setForm(f => ({ ...f, supplier_quotes: v }))} />
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={set('notes')} rows={2} placeholder="Any additional notes..." />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => handleCloseAttempt(false)}>Cancel</Button>
              <Button type="submit" disabled={saving} className="bg-indigo-600 hover:bg-indigo-700">
                {saving ? 'Saving...' : order ? 'Save Changes' : 'Confirm & Create Order'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}