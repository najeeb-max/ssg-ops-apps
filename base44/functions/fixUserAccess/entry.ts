import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// One-time fix: clean up all user data fields and set correct permissions
// Grants all non-sales users access to both modules
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { grants } = await req.json();
    // grants = [{ id, can_access_pcs, can_access_tradeflow }, ...]

    const results = [];
    for (const g of grants) {
      await base44.asServiceRole.entities.User.update(g.id, {
        data: {
          can_access_pcs: g.can_access_pcs,
          can_access_tradeflow: g.can_access_tradeflow,
        }
      });
      results.push({ id: g.id, done: true });
    }

    return Response.json({ results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});