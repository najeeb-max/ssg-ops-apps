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

export const ORDER_STATUSES_HUB = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'received_at_hub', label: 'Received at Hub' },
  { value: 'in_transit', label: 'In Transit' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

export const ORDER_STATUSES_DIRECT = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Ordered / Confirmed' },
  { value: 'in_transit', label: 'Shipped / In Transit' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

export const STATUS_STYLES = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  received_at_hub: 'bg-teal-50 text-teal-700 border-teal-200',
  in_transit: 'bg-purple-50 text-purple-700 border-purple-200',
  delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-slate-100 text-slate-500 border-slate-200',
};