import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({
        success: false,
        error: 'No autenticado'
      }, { status: 401 });
    }

    // Obtener sesiones activas
    const sessions = await base44.asServiceRole.entities.UserSession.filter({
      user_id: user.id
    }, '-last_activity', 50);

    if (!sessions) {
      return Response.json({
        success: true,
        sessions: []
      }, { status: 200 });
    }

    const now = new Date();
    const sessionsData = sessions.map(session => {
      const expiresAt = new Date(session.expires_at);
      const isExpired = now > expiresAt;

      return {
        id: session.id,
        ip_address: session.ip_address,
        user_agent: session.user_agent,
        login_time: session.created_date,
        last_activity: session.last_activity,
        is_expired: isExpired,
        device: parseUserAgent(session.user_agent),
        device_type: getDeviceType(session.user_agent)
      };
    });

    return Response.json({
      success: true,
      sessions: sessionsData
    }, {
      status: 200,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  } catch (error) {
    console.error('[getActiveSessionsForUser] Error:', error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
});

function parseUserAgent(ua) {
  if (!ua) return 'Unknown Device';

  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Safari')) return 'Safari';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Edge')) return 'Edge';
  if (ua.includes('Mobile')) return 'Mobile Browser';

  return 'Unknown Browser';
}

function getDeviceType(ua) {
  if (!ua) return 'unknown';
  if (ua.includes('Mobile') || ua.includes('Android') || ua.includes('iPhone')) return 'mobile';
  if (ua.includes('Tablet') || ua.includes('iPad')) return 'tablet';
  return 'desktop';
}