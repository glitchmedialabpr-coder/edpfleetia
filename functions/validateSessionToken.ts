import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const { session_token } = await req.json();

    if (!session_token) {
      return Response.json({ success: false, error: 'No token' }, { status: 400 });
    }

    const sessions = await base44.asServiceRole.entities.UserSession.filter({
      session_token: session_token
    });

    if (!sessions || sessions.length === 0) {
      return Response.json({ success: false, error: 'Sesión inválida' }, { status: 401 });
    }

    const session = sessions[0];
    const now = new Date();
    const expiresAt = new Date(session.expires_at);

    if (now > expiresAt) {
      return Response.json({ success: false, error: 'Sesión expirada' }, { status: 401 });
    }

    // Update last activity
    await base44.asServiceRole.entities.UserSession.update(session.id, {
      last_activity: now.toISOString()
    });

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
        session_id: session.id
      }
    });
  } catch (error) {
    console.error('[validateSessionToken]', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});