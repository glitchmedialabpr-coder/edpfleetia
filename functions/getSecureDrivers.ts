Deno.serve(async (req) => {
  try {
    const { createClientFromRequest } = await import('npm:@base44/sdk@0.8.6');
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Admin: get all drivers
    if (user.role === 'admin') {
      const drivers = await base44.asServiceRole.entities.Driver.list('-created_date');
      return Response.json({ drivers });
    }

    // Non-admin: forbidden
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  } catch (error) {
    return Response.json({ error: 'Error' }, { status: 500 });
  }
});