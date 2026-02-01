import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const requestCounts = new Map();
const RATE_LIMIT = 5;
const RATE_WINDOW = 60000;

function checkRateLimit(userId) {
  const now = Date.now();
  const userRequests = requestCounts.get(userId) || [];
  const recentRequests = userRequests.filter(time => now - time < RATE_WINDOW);
  
  if (recentRequests.length >= RATE_LIMIT) return false;
  
  recentRequests.push(now);
  requestCounts.set(userId, recentRequests);
  return true;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { destination_type, destination_other, student_id, student_name, student_phone } = await req.json();

    if (!destination_type) {
      return Response.json({ error: 'Destino requerido' }, { status: 400 });
    }
    
    if (!student_id || student_id.length !== 4) {
      return Response.json({ error: 'ID inválido' }, { status: 400 });
    }

    if (!checkRateLimit(student_id)) {
      return Response.json({ error: 'Espera un momento' }, { status: 429 });
    }

    const now = new Date();
    const timeString = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    const destination = destination_type === 'otros' ? destination_other : destination_type;

    await base44.asServiceRole.entities.TripRequest.create({
      passenger_id: student_id,
      passenger_name: student_name,
      passenger_phone: student_phone || '',
      origin: 'EDP University',
      destination,
      destination_type,
      destination_other,
      passengers_count: 1,
      pickup_time: timeString,
      status: 'pending'
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: 'Error al crear solicitud' }, { status: 500 });
  }
});