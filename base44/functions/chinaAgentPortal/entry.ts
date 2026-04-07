import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Valid tokens are stored in the app's User entity data on the admin user
// Token format stored in admin's data.china_agent_tokens = ["token1", "token2"]
const VALID_TOKEN_KEY = 'china_agent_tokens';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { action, token, orderId, status } = await req.json();

    // ── Validate token ──────────────────────────────────────────────────────
    // Tokens are stored on any admin user's data field
    const allUsers = await base44.asServiceRole.entities.User.list();
    const adminUsers = allUsers.filter(u => u.role === 'admin');

    let tokenValid = false;
    for (const admin of adminUsers) {
      const tokens = admin.data?.[VALID_TOKEN_KEY] || [];
      if (tokens.includes(token)) { tokenValid = true; break; }
    }

    if (!tokenValid) {
      return Response.json({ error: 'Invalid or expired access token' }, { status: 401 });
    }

    // ── GET orders ───────────────────────────────────────────────────────────
    if (action === 'getOrders') {
      const [allOrders, allShipments] = await Promise.all([
        base44.asServiceRole.entities.Order.list('-created_date', 500),
        base44.asServiceRole.entities.Shipment.list('-created_date', 200),
      ]);

      // Build a quick lookup: shipment_id → shipment
      const shipmentMap = {};
      for (const s of allShipments) {
        shipmentMap[s.id] = s;
      }

      // Only China Hub orders — strip financial & customer data
      const chinaHubOrders = allOrders
        .filter(o => o.fulfillment_type === 'china_hub')
        .map(o => {
          const shipment = o.shipment_id ? shipmentMap[o.shipment_id] : null;
          return {
            id: o.id,
            alibaba_order_ref: o.alibaba_order_ref,
            platform_order_ref: o.platform_order_ref,
            product_name: o.product_name,
            quantity: o.quantity,
            unit: o.unit,
            supplier_name: o.supplier_name,
            supplier_wechat: o.supplier_wechat,
            supplier_salesperson: o.supplier_salesperson,
            status: o.status,
            domestic_tracking_number: o.domestic_tracking_number,
            estimated_delivery_date: o.estimated_delivery_date,
            order_date: o.order_date,
            weight_kgs: o.weight_kgs,
            num_cartons: o.num_cartons,
            notes: o.notes,
            shipment_id: o.shipment_id || null,
            shipment_number: shipment?.shipment_number || null,
            shipment_status: shipment?.status || null,
            shipment_carrier: shipment?.carrier || null,
            shipment_arrival_date: shipment?.arrival_date || null,
            shipment_transport_mode: shipment?.transport_mode || null,
            // Intentionally excluded: customer_name, customer_id, unit_price, total_amount, team_member_name, express_tracking_number
          };
        });

      return Response.json({ orders: chinaHubOrders });
    }

    // ── UPDATE order status ──────────────────────────────────────────────────
    if (action === 'updateStatus') {
      if (!orderId || !status) {
        return Response.json({ error: 'Missing orderId or status' }, { status: 400 });
      }

      // Agents may only move orders forward through THEIR steps
      // SSG controls: pending, confirmed, in_transit, delivered
      // Agent controls: dispatched_to_hub, received_at_hub
      const AGENT_ALLOWED_STATUSES = ['dispatched_to_hub', 'received_at_hub'];
      if (!AGENT_ALLOWED_STATUSES.includes(status)) {
        return Response.json({ error: `Agents can only set status to: ${AGENT_ALLOWED_STATUSES.join(', ')}` }, { status: 403 });
      }

      // Verify this order is a china_hub order before allowing update
      const orders = await base44.asServiceRole.entities.Order.filter({ id: orderId });
      const order = orders[0];
      if (!order || order.fulfillment_type !== 'china_hub') {
        return Response.json({ error: 'Order not found or not a China Hub order' }, { status: 404 });
      }

      await base44.asServiceRole.entities.Order.update(orderId, { status });
      return Response.json({ success: true });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});