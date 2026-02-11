import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

function parseCookie(cookieString, name) {
  if (!cookieString) return null;
  
  const cookies = cookieString.split(';').map(c => c.trim());
  const targetCookie = cookies.find(c => c.startsWith(`${name}=`));
  
  if (!targetCookie) return null;
  
  return targetCookie.substring(name.length + 1);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Leer cookie del header
    const cookieString = req.headers.get('cookie');
    const sessionToken = parseCookie(cookieString, 'session_token');
    
    if (!sessionToken) {
      return Response.json({ 
        authenticated: false,
        user: null
      }, {
        status: 200,
        headers: { 'Access-Control-Allow-Origin': '*' }
      });
    }
    
    // Verificar si el token está en blacklist
    const blacklistCheck = await base44.functions.invoke('isTokenBlacklisted', {
      token: sessionToken,
      token_type: 'session_token'
    });
    
    if (blacklistCheck.data.blacklisted) {
      return Response.json({ 
        authenticated: false,
        user: null,
        reason: 'token_revoked'
      }, {
        status: 200,
        headers: { 'Access-Control-Allow-Origin': '*' }
      });
    }
    
    // Buscar sesión en la base de datos
    const sessions = await base44.asServiceRole.entities.UserSession.filter({
      session_token: sessionToken
    });
    
    if (!sessions || sessions.length === 0) {
      return Response.json({ 
        authenticated: false,
        user: null,
        reason: 'session_not_found'
      }, {
        status: 200,
        headers: { 'Access-Control-Allow-Origin': '*' }
      });
    }
    
    const session = sessions[0];
    
    // Verificar si la sesión ha expirado
    const now = new Date();
    const expiresAt = new Date(session.expires_at);
    
    if (now > expiresAt) {
      // Eliminar sesión expirada
      await base44.asServiceRole.entities.UserSession.delete(session.id);
      
      return Response.json({ 
        authenticated: false,
        user: null,
        reason: 'session_expired'
      }, {
        status: 200,
        headers: { 'Access-Control-Allow-Origin': '*' }
      });
    }
    
    // Validar session fingerprint
    const clientIp = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    const acceptLanguage = req.headers.get('accept-language') || 'unknown';

    const fingerprintCheck = await base44.functions.invoke('validateSessionFingerprint', {
      session_id: session.id,
      ip_address: clientIp,
      user_agent: userAgent,
      accept_language: acceptLanguage
    });

    // Si el fingerprint no coincide y hay cambios sospechosos, rechazar
    if (!fingerprintCheck.data.valid && fingerprintCheck.data.suspicious) {
      await base44.functions.invoke('logSecurityEvent', {
        event_type: 'suspicious_activity',
        user_id: session.user_id,
        user_email: session.email,
        user_type: session.user_type,
        ip_address: clientIp,
        details: {
          reason: 'session_fingerprint_mismatch',
          changes: fingerprintCheck.data.changes
        },
        severity: 'high',
        success: false
      });

      // Eliminar sesión comprometida
      await base44.asServiceRole.entities.UserSession.delete(session.id);

      return Response.json({ 
        authenticated: false,
        user: null,
        reason: 'session_fingerprint_invalid'
      }, {
        status: 200,
        headers: { 'Access-Control-Allow-Origin': '*' }
      });
    }

    // Actualizar última actividad solo cada 5 minutos para reducir escrituras
    const lastActivity = new Date(session.last_activity);
    const minutesSinceLastUpdate = (now - lastActivity) / (1000 * 60);

    if (minutesSinceLastUpdate > 5) {
      await base44.asServiceRole.entities.UserSession.update(session.id, {
        last_activity: now.toISOString()
      });
    }

    // Construir objeto de usuario
    const userData = {
      id: session.user_id,
      full_name: session.full_name,
      email: session.email,
      role: session.role,
      user_type: session.user_type,
      phone: session.phone,
      student_id: session.student_id,
      driver_id: session.driver_id,
      housing_name: session.housing_name
    };
    
    return Response.json({ 
      authenticated: true,
      user: userData
    }, {
      status: 200,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
    
  } catch (error) {
    console.error('[getCurrentUserFromCookie] Error:', error);
    return Response.json({ 
      authenticated: false,
      user: null,
      error: error.message
    }, { 
      status: 500,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  }
});