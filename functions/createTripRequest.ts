import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.user_type !== 'passenger') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { destination_type, destination_other } = await req.json();

    if (!destination_type) {
      return Response.json({ error: 'Invalid destination' }, { status: 400 });
    }

    const now = new Date();
    const timeString = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    const destination = destination_type === 'otros' ? destination_other : destination_type;

    const tripRequest = await base44.asServiceRole.entities.TripRequest.create({
      passenger_id: user.student_id,
      passenger_name: user.full_name,
      passenger_phone: user.phone || '',
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