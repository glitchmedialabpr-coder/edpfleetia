import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const reportDate = yesterday.toISOString().split('T')[0];

    // Obtener viajes del día anterior
    const trips = await base44.asServiceRole.entities.Trip.filter({});
    
    // Filtrar viajes por fecha
    const dayTrips = trips.filter(trip => {
      if (!trip.scheduled_date) return false;
      return trip.scheduled_date === reportDate;
    });

    // Obtener solicitudes de viaje del día
    const tripRequests = await base44.asServiceRole.entities.TripRequest.filter({});
    const dayRequests = tripRequests.filter(req => {
      if (!req.pickup_time) return false;
      const reqDate = req.pickup_time.split('T')[0];
      return reqDate === reportDate;
    });

    // Calcular estadísticas
    const totalTrips = dayTrips.length;
    const completedTrips = dayTrips.filter(t => t.status === 'completed').length;
    const pendingTrips = dayTrips.filter(t => t.status === 'scheduled' || t.status === 'in_progress').length;
    const cancelledTrips = dayTrips.filter(t => t.status === 'cancelled').length;
    
    // Contar estudiantes únicos
    const uniqueStudents = new Set();
    dayTrips.forEach(trip => {
      if (trip.students && Array.isArray(trip.students)) {
        trip.students.forEach(student => {
          if (student.student_id) uniqueStudents.add(student.student_id);
        });
      }
    });

    // Obtener conductores y vehículos activos
    const drivers = await base44.asServiceRole.entities.Driver.filter({ status: 'active' });
    const vehicles = await base44.asServiceRole.entities.Vehicle.filter({ status: 'available' });

    // Detalles de viajes
    const tripDetails = dayTrips.map(trip => ({
      trip_id: trip.id,
      driver_name: trip.driver_name || 'No asignado',
      vehicle_info: trip.vehicle_info || 'No especificado',
      status: trip.status,
      students_count: trip.students ? trip.students.length : 0,
      scheduled_time: trip.scheduled_time,
      departure_time: trip.departure_time,
      arrival_time: trip.arrival_time
    }));

    // Crear resumen
    const summary = `Reporte del ${reportDate}: ${totalTrips} viajes (${completedTrips} completados, ${pendingTrips} pendientes, ${cancelledTrips} cancelados). ${uniqueStudents.size} estudiantes transportados.`;

    // Guardar reporte en base de datos
    const report = await base44.asServiceRole.entities.DailyTripReport.create({
      report_date: reportDate,
      total_trips: totalTrips,
      completed_trips: completedTrips,
      pending_trips: pendingTrips,
      cancelled_trips: cancelledTrips,
      total_students: uniqueStudents.size,
      active_drivers: drivers.length,
      active_vehicles: vehicles.length,
      trip_details: tripDetails,
      summary: summary,
      generated_at: new Date().toISOString()
    });

    return Response.json({ 
      success: true, 
      message: `Reporte diario generado para ${reportDate}`,
      report_id: report.id,
      statistics: {
        total_trips: totalTrips,
        completed_trips: completedTrips,
        total_students: uniqueStudents.size
      }
    });
  } catch (error) {
    console.error('Error generating daily report:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});