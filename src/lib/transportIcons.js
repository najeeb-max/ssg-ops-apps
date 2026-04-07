import { Ship, Plane, Truck, Train, Zap } from 'lucide-react';

/**
 * Returns the appropriate Lucide icon component for a given transport mode.
 * Matches the Shipment entity's transport_mode enum: sea, air, road, rail, express
 */
export function getTransportIcon(transportMode) {
  switch (transportMode) {
    case 'air':     return Plane;
    case 'road':    return Truck;
    case 'rail':    return Train;
    case 'express': return Zap;
    case 'sea':
    default:        return Ship;
  }
}