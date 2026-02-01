import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Rate limiting simple en memoria
const requestCounts = new Map();
const RATE_LIMIT = 5; // 5 requests por minuto
const RATE_WINDOW = 60000; // 1 minuto

function checkRateLimit(userId) {
  const now = Date.now();
  const userRequests = requestCounts.get(userId) || [];
  
  // Limpiar requests viejos
  const recentRequests = userRequests.filter(time => now - time < RATE_WINDOW);
  
  if (recentRequests.length >= RATE_LIMIT) {
    return false;
  }
  
  recentRequests.push(now);
  requestCounts.set(userId, recentRequests);
  return true;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const { destination_type, destination_other, student_id, student_name, student_phone } = await req.json();

    // Validación robusta
    if (!destination_type || typeof destination_type !== 'string') {
      return Response.json({ error: 'Tipo de destino inválido' }, { status: 400 });
    }
    
    if (!student_id || typeof student_id !== 'string' || student_id.length !== 4) {
      return Response.json({ error: 'ID de estudiante inválido' }, { status: 400 });
    }
    
    if (!student_name || typeof student_name !== 'string' || student_name.length > 200) {
      return Response.json({ error: 'Nombre inválido' }, { status: 400 });
    }

    // Rate limiting
    if (!checkRateLimit(student_id)) {
      return Response.json({ 
        error: 'Demasiadas solicitudes. Espera un momento.' 
      }, { status: 429 });
    }

    // Validar que el tipo de destino sea válido
    const validDestinations = ['hospedaje', 'farmacia', 'hospital', 'supermercado', 'biblioteca', 'edp_university', 'piedras_blancas', 'wellness_edp', 'otros'];
    if (!validDestinations.includes(destination_type)) {
      return Response.json({ error: 'Destino no válido' }, { status: 400 });
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