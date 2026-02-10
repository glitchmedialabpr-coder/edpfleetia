Deno.serve(async (req) => {
  try {
    const { createClientFromRequest } = await import('npm:@base44/sdk@0.8.6');
    const base44 = createClientFromRequest(req);
    
    const isAuthenticated = await base44.auth.isAuthenticated();
    if (!isAuthenticated) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await base44.auth.me();

    // Admin: get all vehicles
    if (user.role === 'admin') {
      const vehicles = await base44.asServiceRole.entities.Vehicle.list('-created_date');
      return Response.json({ vehicles });
    }

    // Driver: only assigned vehicle
    if (user.user_type === 'driver' && user.driver_id) {
      const drivers = await base44.asServiceRole.entities.Driver.filter({ 
        driver_id: user.driver_id 
      }, '', 1);
      
      if (drivers?.length && drivers[0].assigned_vehicle_id) {
        const vehicles = await base44.asServiceRole.entities.Vehicle.filter({
          id: drivers[0].assigned_vehicle_id
        }, '', 1);
        return Response.json({ vehicles: vehicles || [] });
      }
      return Response.json({ vehicles: [] });
    }

    // Non-admin/driver: forbidden
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  } catch (error) {
    return Response.json({ error: 'Error' }, { status: 500 });
  }
});