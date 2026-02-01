import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { acceptedRequests, selectedVehicle, driverId, driverName } = await req.json();

    if (!acceptedRequests?.length || !selectedVehicle || !driverId) {
      return Response.json({ error: 'Datos inválidos' }, { status: 400 });
    }

    const vehicleId = typeof selectedVehicle === 'string' ? selectedVehicle : selectedVehicle?.id;
    const vehicles = await base44.asServiceRole.entities.Vehicle.filter({}, '', 100);
    const vehicle = vehicles?.find(v => v.id === vehicleId);

    const now = new Date();
    const timeString = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

    const trip = await base44.asServiceRole.entities.Trip.create({
      driver_id: driverId,
      driver_name: driverName,
      vehicle_id: vehicleId,
      vehicle_info: vehicle ? `${vehicle.brand} ${vehicle.model} - ${vehicle.plate}` : '',
      scheduled_date: new Date().toISOString().split('T')[0],
      scheduled_time: timeString,
      departure_time: timeString,
      students: acceptedRequests.map(req => ({
        request_id: req.id,
        student_id: req.passenger_id,
        student_name: req.passenger_name,
        housing_name: req.destination,
        destination: req.destination,
        destination_town: req.destination_town,
        delivery_status: 'pending',
        delivery_time: null
      })),
      origin: 'EDP University',
      status: 'in_progress'
    });

    await Promise.all(acceptedRequests.map(req =>
      base44.asServiceRole.entities.TripRequest.update(req.id, {
        status: 'in_trip',
        started_at: timeString,
        trip_id: trip.id
      })
    ));

    return Response.json({ success: true, trip });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: 'Error al crear viaje' }, { status: 500 });
  }
});