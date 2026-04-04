/**
 * Vivid color palette for shipments.
 * Colors are assigned to ACTIVE shipments only.
 * Once a shipment is closed (delivered/cancelled/received_in_qatar), its color slot is freed.
 */

export const SHIPMENT_COLORS = [
  { bg: 'bg-rose-500',    light: 'bg-rose-50',    border: 'border-rose-300',    text: 'text-rose-700',    badge: 'bg-rose-500 text-white border-rose-600',       card: 'border-rose-300 bg-rose-50/40',    dot: 'bg-rose-500' },
  { bg: 'bg-indigo-500',  light: 'bg-indigo-50',  border: 'border-indigo-300',  text: 'text-indigo-700',  badge: 'bg-indigo-500 text-white border-indigo-600',   card: 'border-indigo-300 bg-indigo-50/40', dot: 'bg-indigo-500' },
  { bg: 'bg-emerald-500', light: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-700', badge: 'bg-emerald-500 text-white border-emerald-600', card: 'border-emerald-300 bg-emerald-50/40', dot: 'bg-emerald-500' },
  { bg: 'bg-amber-500',   light: 'bg-amber-50',   border: 'border-amber-300',   text: 'text-amber-700',   badge: 'bg-amber-500 text-white border-amber-600',     card: 'border-amber-300 bg-amber-50/40',  dot: 'bg-amber-500' },
  { bg: 'bg-fuchsia-500', light: 'bg-fuchsia-50', border: 'border-fuchsia-300', text: 'text-fuchsia-700', badge: 'bg-fuchsia-500 text-white border-fuchsia-600', card: 'border-fuchsia-300 bg-fuchsia-50/40', dot: 'bg-fuchsia-500' },
  { bg: 'bg-cyan-500',    light: 'bg-cyan-50',    border: 'border-cyan-300',    text: 'text-cyan-700',    badge: 'bg-cyan-500 text-white border-cyan-600',       card: 'border-cyan-300 bg-cyan-50/40',    dot: 'bg-cyan-500' },
  { bg: 'bg-orange-500',  light: 'bg-orange-50',  border: 'border-orange-300',  text: 'text-orange-700',  badge: 'bg-orange-500 text-white border-orange-600',   card: 'border-orange-300 bg-orange-50/40', dot: 'bg-orange-500' },
  { bg: 'bg-violet-500',  light: 'bg-violet-50',  border: 'border-violet-300',  text: 'text-violet-700',  badge: 'bg-violet-500 text-white border-violet-600',   card: 'border-violet-300 bg-violet-50/40', dot: 'bg-violet-500' },
];

const CLOSED_STATUSES = new Set(['delivered', 'cancelled']);

/**
 * Builds a map of shipmentId → color object.
 * Only active (non-closed, non-received) shipments get colors.
 * Colors wrap around once exhausted.
 */
export function buildShipmentColorMap(shipments) {
  const active = shipments.filter(s => !s.received_in_qatar && !CLOSED_STATUSES.has(s.status));
  const map = {};
  active.forEach((s, i) => {
    map[s.id] = SHIPMENT_COLORS[i % SHIPMENT_COLORS.length];
  });
  return map;
}

/** Returns the color object for a given shipment, or a neutral fallback. */
export const NEUTRAL_COLOR = {
  bg: 'bg-slate-400', light: 'bg-slate-50', border: 'border-slate-200',
  text: 'text-slate-600', badge: 'bg-slate-100 text-slate-600 border-slate-200',
  card: 'border-slate-200', dot: 'bg-slate-400',
};