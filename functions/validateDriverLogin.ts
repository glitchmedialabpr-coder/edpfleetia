import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { driverId } = await req.json();
    
    if (!driverId || driverId.length !== 3) {
      return Response.json({ 
        success: false, 
        error: 'ID de conductor inválido' 
      }, { status: 400 });
    }
    
    // Fetch driver from database
    const drivers = await base44.asServiceRole.entities.Driver.filter({ 
      driver_id: driverId.trim(),
      status: 'active'
    });
    
    if (drivers && drivers.length > 0) {
      const driver = drivers[0];
      
      // Generate session token
      const sessionToken = crypto.randomUUID();
      const sessionExpiry = Date.now() + (12 * 60 * 60 * 1000); // 12 hours
      
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
          session_token: sessionToken,
          session_expiry: sessionExpiry
        }
      });
    } else {
      return Response.json({ 
        success: false, 
        error: 'Conductor no encontrado o inactivo' 
      }, { status: 404 });
    }
  } catch (error) {
    return Response.json({ 
      success: false, 
      error: 'Error al validar conductor' 
    }, { status: 500 });
  }
});