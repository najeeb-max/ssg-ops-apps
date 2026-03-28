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

    // Fetch the target user's current data using service role
    const targetUser = await base44.asServiceRole.entities.User.get(targetUserId);
    // user.data is the custom data object (not the top-level entity fields)
    const currentData = (targetUser?.data && typeof targetUser.data === 'object' && !Array.isArray(targetUser.data))
      ? Object.fromEntries(Object.entries(targetUser.data).filter(([k]) => k !== 'data'))
      : {};

    const updatedData = Object.assign({}, currentData, { [moduleKey]: value });

    await base44.asServiceRole.entities.User.update(targetUserId, { data: updatedData });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});