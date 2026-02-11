import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { verify } from 'https://deno.land/x/djwt@v3.0.2/mod.ts';

const JWT_SECRET = Deno.env.get('JWT_SECRET');

// CRITICAL SECURITY: JWT_SECRET must be configured
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  console.error('[SECURITY] JWT_SECRET not configured or too weak');
  throw new Error('CRITICAL: JWT_SECRET must be configured with minimum 32 characters');
}

const encoder = new TextEncoder();
const keyData = encoder.encode(JWT_SECRET);

async function verifyJWT(token) {
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );

  return await verify(token, key);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { refresh_token } = await req.json();

    if (!refresh_token) {
      return Response.json({ error: 'refresh_token required' }, { status: 400 });
    }

    // Verificar refresh token
    let payload;
    try {
      payload = await verifyJWT(refresh_token);
    } catch (error) {
      await base44.functions.invoke('logSecurityEvent', {
        event_type: 'unauthorized_access',
        details: { reason: 'invalid_refresh_token' },
        severity: 'medium',
        success: false
      });
      
      return Response.json({ error: 'Invalid refresh token' }, { status: 401 });
    }

    if (payload.type !== 'refresh') {
      return Response.json({ error: 'Not a refresh token' }, { status: 401 });
    }

    // Buscar sesión activa
    const sessions = await base44.asServiceRole.entities.UserSession.filter({
      user_id: payload.sub,
      refresh_token
    }, '-created_date', 1);

    if (!sessions.length) {
      await base44.functions.invoke('logSecurityEvent', {
        event_type: 'unauthorized_access',
        user_id: payload.sub,
        details: { reason: 'session_not_found' },
        severity: 'high',
        success: false
      });
      
      return Response.json({ error: 'Session not found' }, { status: 401 });
    }

    const session = sessions[0];

    // Verificar expiración
    const now = new Date();
    if (now > new Date(session.refresh_token_expires)) {
      await base44.asServiceRole.entities.UserSession.delete(session.id);
      
      await base44.functions.invoke('logSecurityEvent', {
        event_type: 'session_expired',
        user_id: payload.sub,
        user_email: session.email,
        user_type: session.user_type,
        details: {},
        severity: 'low',
        success: false
      });
      
      return Response.json({ error: 'Refresh token expired' }, { status: 401 });
    }

    // Generar nuevo access token
    const tokensResponse = await base44.functions.invoke('generateTokens', {
      user_id: session.user_id,
      full_name: session.full_name,
      email: session.email,
      role: session.role,
      user_type: session.user_type,
      driver_id: session.driver_id,
      student_id: session.student_id
    });

    const tokens = tokensResponse.data;

    // Actualizar sesión con nuevos tokens
    await base44.asServiceRole.entities.UserSession.update(session.id, {
      access_token: tokens.access_token,
      access_token_expires: tokens.access_token_expires,
      last_activity: now.toISOString()
    });

    // Log rotación de token
    await base44.functions.invoke('logSecurityEvent', {
      event_type: 'login_success',
      user_id: session.user_id,
      user_email: session.email,
      user_type: session.user_type,
      details: { action: 'token_rotation' },
      severity: 'low',
      success: true
    });

    return Response.json({
      success: true,
      access_token: tokens.access_token,
      access_token_expires: tokens.access_token_expires
    });

  } catch (error) {
    console.error('[refreshAccessToken] Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});