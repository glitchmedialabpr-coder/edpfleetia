import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { driverId } = await req.json();
    
    if (!driverId || driverId.length !== 3) {
      return Response.json({ success: false, error: 'ID inválido' }, { status: 400 });
    }
    
    const drivers = await base44.asServiceRole.entities.Driver.filter({ 
      driver_id: driverId.trim(),
      status: 'active'
    }, '', 1);
    
    if (!drivers?.length) {
      return Response.json({ success: false, error: 'No encontrado' }, { status: 404 });
    }
    
    const driver = drivers[0];
    return Response.json({ 
      success: true,
      user: {
        id: driver.id,
        email: driver.email,
        full_name: driver.full_name,
        phone: driver.phone,
        role: 'user',
        user_type: 'driver',
        driver_id: driver.driver_id,
        session_expiry: Date.now() + (12 * 60 * 60 * 1000)
      }
    });
  } catch (error) {
    return Response.json({ success: false, error: 'Error' }, { status: 500 });
  }
});