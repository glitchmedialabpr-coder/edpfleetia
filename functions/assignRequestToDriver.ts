import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { request_id } = await req.json();

    // Get all active drivers
    const drivers = await base44.asServiceRole.entities.Driver.filter({ status: 'active' });
    
    if (drivers.length === 0) {
      return Response.json({ 
        success: false, 
        message: 'No hay conductores disponibles' 
      });
    }

    // Get all pending/accepted requests for each driver to count their workload
    const allRequests = await base44.asServiceRole.entities.TripRequest.filter({
      status: { $in: ['pending', 'accepted', 'accepted_by_driver'] }
    });

    // Count requests per driver
    const driverWorkload = {};
    drivers.forEach(driver => {
      driverWorkload[driver.driver_id] = 0;
    });

    allRequests.forEach(req => {
      if (req.assigned_driver_id && driverWorkload[req.assigned_driver_id] !== undefined) {
        driverWorkload[req.assigned_driver_id]++;
      }
    });

    // Find driver with least workload and under 15 requests
    let selectedDriver = null;
    let minWorkload = 15;

    for (const driver of drivers) {
      const workload = driverWorkload[driver.driver_id];
      if (workload < minWorkload) {
        minWorkload = workload;
        selectedDriver = driver;
      }
    }

    if (!selectedDriver || minWorkload >= 15) {
      return Response.json({ 
        success: false, 
        message: 'Todos los conductores están ocupados (15 solicitudes máx)' 
      });
    }

    // Assign the request to the selected driver
    await base44.asServiceRole.entities.TripRequest.update(request_id, {
      assigned_driver_id: selectedDriver.driver_id
    });

    return Response.json({ 
      success: true, 
      assigned_driver_id: selectedDriver.driver_id,
      driver_name: selectedDriver.full_name
    });

  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});