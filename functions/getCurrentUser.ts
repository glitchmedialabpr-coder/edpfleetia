import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const { session_token } = await req.json();

    if (!session_token) {
      return Response.json({ 
        success: false, 
        error: 'No token provided',
        code: 'NO_TOKEN'
      }, { status: 401 });
    }

    // Buscar sesión en la base de datos
    const sessions = await base44.asServiceRole.entities.UserSession.filter({
      session_token: session_token
    });

    if (!sessions || sessions.length === 0) {
      return Response.json({ 
        success: false, 
        error: 'Invalid session',
        code: 'INVALID_SESSION'
      }, { status: 401 });
    }

    const session = sessions[0];
    const now = new Date();
    const expiresAt = new Date(session.expires_at);

    // Validar expiración
    if (now > expiresAt) {
      await base44.asServiceRole.entities.UserSession.delete(session.id);
      return Response.json({ 
        success: false, 
        error: 'Session expired',
        code: 'SESSION_EXPIRED'
      }, { status: 401 });
    }

    // Actualizar última actividad
    await base44.asServiceRole.entities.UserSession.update(session.id, {
      last_activity: now.toISOString()
    });

    // Determinar portal basado en rol y user_type
    let portal = 'unknown';
    if (session.role === 'admin') {
      portal = 'admin';
    } else if (session.user_type === 'driver') {
      portal = 'driver';
    } else if (session.user_type === 'passenger') {
      portal = 'student';
    }

    return Response.json({
      success: true,
      user: {
        id: session.user_id,
        full_name: session.full_name,
        email: session.email,
        phone: session.phone,
        role: session.role,
        user_type: session.user_type,
        student_id: session.student_id,
        driver_id: session.driver_id,
        housing_name: session.housing_name,
        session_id: session.id,
        portal: portal,
        status: 'active'
      }
    }, {
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  } catch (error) {
    console.error('[getCurrentUser]', error);
    return Response.json({ 
      success: false, 
      error: error.message,
      code: 'SERVER_ERROR'
    }, { status: 500 });
  }
});