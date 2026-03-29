import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const rawUsers = await base44.asServiceRole.entities.User.list();

    // Permissions are stored inside user.data — normalize them here
    const users = rawUsers.map(u => {
      const d = u.data || {};
      return {
        id: u.id,
        email: u.email,
        full_name: u.full_name,
        role: u.role || 'user',
        created_date: u.created_date,
        can_access_pcs: !!(d.can_access_pcs),
        can_access_tradeflow: !!(d.can_access_tradeflow),
      };
    });

    return Response.json({ users });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});