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

    // Update the permission as a top-level field directly on the User entity
    await base44.asServiceRole.entities.User.update(targetUserId, { [moduleKey]: value });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});