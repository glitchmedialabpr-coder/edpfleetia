import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.user_type !== 'driver') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { acceptedRequests, selectedVehicle } = await req.json();

    if (!acceptedRequests?.length || !selectedVehicle) {
      return Response.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    // Fetch vehicle info
    const vehicles = await base44.asServiceRole.entities.Vehicle.filter({ id: selectedVehicle }, '', 1);
    const vehicle = vehicles?.[0];

    const now = new Date();
    const timeString = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

    // Create Trip
    const studentsData = acceptedRequests.map(req => ({
      request_id: req.id,
      student_id: req.passenger_id,
      student_name: req.passenger_name,
      housing_name: req.destination,
      destination: req.destination,
      destination_town: req.destination_town,
      delivery_status: 'pending',
      delivery_time: null
    }));

    const trip = await base44.asServiceRole.entities.Trip.create({
      driver_id: user.driver_id,
      driver_name: user.full_name || user.email,
      vehicle_id: selectedVehicle,
      vehicle_info: vehicle ? `${vehicle.brand} ${vehicle.model} - ${vehicle.plate}` : '',
      scheduled_date: new Date().toISOString().split('T')[0],
      scheduled_time: timeString,
      departure_time: timeString,
      students: studentsData,
      origin: 'EDP University',
      status: 'in_progress'
    });

    // Update all accepted requests
    for (const req of acceptedRequests) {
      await base44.asServiceRole.entities.TripRequest.update(req.id, {
        status: 'in_trip',
        started_at: timeString,
        trip_id: trip.id
      });
    }

    return Response.json({ success: true, trip });
  } catch (error) {
    return Response.json({ error: error.message || 'Error' }, { status: 500 });
  }
});