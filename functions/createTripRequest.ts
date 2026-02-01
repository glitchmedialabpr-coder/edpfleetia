import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const { destination_type, destination_other, student_id, student_name, student_phone } = await req.json();

    if (!destination_type || !student_id) {
      return Response.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    const now = new Date();
    const timeString = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    const destination = destination_type === 'otros' ? destination_other : destination_type;

    const tripRequest = await base44.asServiceRole.entities.TripRequest.create({
      passenger_id: student_id,
      passenger_name: student_name,
      passenger_phone: student_phone || '',
      origin: 'EDP University',
      destination: destination,
      destination_type: destination_type,
      destination_other: destination_other,
      passengers_count: 1,
      pickup_time: timeString,
      status: 'pending'
    });

    return Response.json({ success: true, tripRequest });
  } catch (error) {
    return Response.json({ error: error.message || 'Error' }, { status: 500 });
  }
});