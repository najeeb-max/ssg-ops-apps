import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const rawUsers = await base44.asServiceRole.entities.User.list();

    // _app_role is the actual role within this app (admin/user)
    // Custom fields like can_access_pcs are stored in data.* but also surfaced at top level
    const users = rawUsers.map(u => ({
      ...u,
      role: u._app_role || u.role || 'user',
      can_access_pcs: !!(u.can_access_pcs || (u.data && u.data.can_access_pcs)),
      can_access_tradeflow: !!(u.can_access_tradeflow || (u.data && u.data.can_access_tradeflow)),
    }));

    return Response.json({ users });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});