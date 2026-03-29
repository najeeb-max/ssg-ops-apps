import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { targetUserId, moduleKey, value } = await req.json();

    if (!targetUserId || !moduleKey) {
      return Response.json({ error: 'Missing targetUserId or moduleKey' }, { status: 400 });
    }

    // Fetch current user to get clean data (no nested data.data)
    const targetUsers = await base44.asServiceRole.entities.User.filter({ id: targetUserId });
    const targetUser = targetUsers[0];
    if (!targetUser) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    // Only keep known permission keys — never merge nested/corrupted data
    const existing = targetUser.data || {};
    const cleanData = {
      can_access_pcs: !!(existing.can_access_pcs),
      can_access_tradeflow: !!(existing.can_access_tradeflow),
      [moduleKey]: value,
    };

    await base44.asServiceRole.entities.User.update(targetUserId, { data: cleanData });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});