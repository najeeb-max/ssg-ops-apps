// Shared App List
import { Files, BookOpen, ShoppingCart, Ship } from 'lucide-react';

export const COMPANY_APPS = [
  {
    id: 9,
    name: 'TradeFlow',
    description: 'Manage orders, shipments, suppliers and customers for China hub and direct express logistics',
    icon: Ship,
    color: 'bg-white',
    link: '/tradeflow',
    category: 'Collaboration',
    hideName: true,
    customImage: 'https://media.base44.com/images/public/69bc62c36ed6e9abb825f80f/686c2d1b3_tradeflow_clean.png',
  },
  {
    id: 8,
    name: 'PCS',
    description: 'Overview of SSG procurement price comparisons for Existing System Orders',
    icon: ShoppingCart,
    color: 'bg-red-600',
    link: '/pcs',
    category: 'Collaboration',
    hideName: true,
    customImage: 'https://media.base44.com/images/public/69bc62c36ed6e9abb825f80f/24c7c041b_price_comparison_clean.png',
  },
  {
    id: 2,
    name: 'Document Hub',
    description: 'Create, edit, and collaborate on documents with seamless Google Docs sync',
    icon: Files,
    color: 'bg-red-700',
    link: '/documents',
    category: 'Collaboration',
  },
  {
    id: 5,
    name: 'Training Portal',
    description: 'Access courses and track learning progress via Google Classroom',
    icon: BookOpen,
    color: 'bg-red-700',
    link: '/learning',
    category: 'Learning',
  },
];

// TradeFlow Constants
export const CURRENCIES = ['USD', 'EUR', 'GBP', 'AED', 'SAR', 'INR', 'CNY', 'JPY'];

export const TEAM_MEMBERS = ['Najeeb', 'Hilal', 'Prasad', 'Kiptta', 'SSG', 'Jassim', 'Ishan'];

export const PLATFORMS = [
  { value: 'Alibaba', label: 'Alibaba', type: 'china_hub', logo: 'https://media.base44.com/images/public/69b6a3cfbeec26cd3fa13483/597a9d494_image.png' },
  { value: 'eBay', label: 'eBay', type: 'direct_express', logo: 'https://media.base44.com/images/public/69b6a3cfbeec26cd3fa13483/b83155519_Screenshot2026-03-18220909.png' },
  { value: 'Amazon', label: 'Amazon.com', type: 'direct_express', logo: 'https://media.base44.com/images/public/69b6a3cfbeec26cd3fa13483/527d85689_image.png' },
  { value: 'TEM', label: 'TEM', type: 'direct_express', logo: 'https://media.base44.com/images/public/69b6a3cfbeec26cd3fa13483/36c75e972_image.png' },
  { value: 'Alibaba Direct', label: 'Alibaba Direct', type: 'direct_express', logo: 'https://media.base44.com/images/public/69b6a3cfbeec26cd3fa13483/597a9d494_image.png' },
  { value: 'Other Direct', label: 'Other (Direct)', type: 'direct_express', logo: 'https://media.base44.com/images/public/69b6a3cfbeec26cd3fa13483/efc049276_image.png' },
];

// ── Unified status labels (single source of truth) ───────────────────────────
// These labels are used everywhere: forms, badges, filters, portals.
export const STATUS_LABELS = {
  pending:           'Pending',
  confirmed:         'Order Placed - Awaiting Supplier To Ship',
  dispatched_to_hub: 'Dispatched to Hub',
  received_at_hub:   'Received at Hub',
  in_transit:        'In Transit to Qatar',
  delivered:         'Delivered',
  cancelled:         'Cancelled',
};

// Helper: get display label for any status value
export const getStatusLabel = (value) => STATUS_LABELS[value] || (value?.replace(/_/g, ' ') ?? '');

// China Hub order status flow:
// SSG:   pending → confirmed
// Agent: confirmed → dispatched_to_hub → received_at_hub
// SSG:   received_at_hub → in_transit → delivered
export const ORDER_STATUSES_HUB = [
  { value: 'pending',           label: STATUS_LABELS.pending,           owner: 'ssg',   description: 'Order placed, awaiting supplier confirmation' },
  { value: 'confirmed',         label: STATUS_LABELS.confirmed,         owner: 'ssg',   description: 'Supplier confirmed, goods being prepared' },
  { value: 'dispatched_to_hub', label: STATUS_LABELS.dispatched_to_hub, owner: 'agent', description: 'Supplier shipped goods — moving to hub within China' },
  { value: 'received_at_hub',   label: STATUS_LABELS.received_at_hub,   owner: 'agent', description: 'Goods arrived and checked in at the hub' },
  { value: 'in_transit',        label: STATUS_LABELS.in_transit,        owner: 'ssg',   description: 'Loaded on shipment, en route to Qatar' },
  { value: 'delivered',         label: STATUS_LABELS.delivered,         owner: 'ssg',   description: 'Arrived in Qatar' },
  { value: 'cancelled',         label: STATUS_LABELS.cancelled,         owner: 'ssg',   description: '' },
];

// Direct Express uses the same full status set (minus hub-specific steps)
export const ORDER_STATUSES_DIRECT = [
  { value: 'pending',    label: STATUS_LABELS.pending },
  { value: 'confirmed',  label: STATUS_LABELS.confirmed },
  { value: 'in_transit', label: STATUS_LABELS.in_transit },
  { value: 'delivered',  label: STATUS_LABELS.delivered },
  { value: 'cancelled',  label: STATUS_LABELS.cancelled },
];

export const STATUS_STYLES = {
  pending:           'bg-amber-50 text-amber-700 border-amber-200',
  confirmed:         'bg-blue-50 text-blue-700 border-blue-200',
  dispatched_to_hub: 'bg-orange-50 text-orange-700 border-orange-200',
  received_at_hub:   'bg-teal-50 text-teal-700 border-teal-200',
  in_transit:        'bg-purple-50 text-purple-700 border-purple-200',
  delivered:         'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled:         'bg-slate-100 text-slate-500 border-slate-200',
};