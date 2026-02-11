import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

async function hashToken(token) {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

    const { session_token, access_token, refresh_token } = await req.json();

    // Revocar tokens
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 días

    const blacklistEntries = [];

    if (session_token) {
      const hashedToken = await hashToken(session_token);
      blacklistEntries.push({
        token: hashedToken,
        token_type: 'session_token',
        user_id: user.id,
        revoked_at: now.toISOString(),
        reason: 'logout',
        expires_at: expiresAt.toISOString()
      });
    }

    if (access_token) {
      const hashedToken = await hashToken(access_token);
      blacklistEntries.push({
        token: hashedToken,
        token_type: 'access_token',
        user_id: user.id,
        revoked_at: now.toISOString(),
        reason: 'logout',
        expires_at: expiresAt.toISOString()
      });
    }

    if (refresh_token) {
      const hashedToken = await hashToken(refresh_token);
      blacklistEntries.push({
        token: hashedToken,
        token_type: 'refresh_token',
        user_id: user.id,
        revoked_at: now.toISOString(),
        reason: 'logout',
        expires_at: expiresAt.toISOString()
      });
    }

    // Guardar en blacklist
    if (blacklistEntries.length > 0) {
      await base44.asServiceRole.entities.TokenBlacklist.bulkCreate(blacklistEntries);
    }

    // Eliminar sesión
    const sessions = await base44.asServiceRole.entities.UserSession.filter({
      user_id: user.id,
      session_token: session_token
    });

    if (sessions?.length > 0) {
      await base44.asServiceRole.entities.UserSession.delete(sessions[0].id);
    }

    // Log logout
    await base44.functions.invoke('logSecurityEvent', {
      event_type: 'logout',
      user_id: user.id,
      user_email: user.email,
      user_type: user.user_type,
      details: { method: 'user_logout' },
      severity: 'low',
      success: true
    });

    return Response.json({ 
      success: true,
      message: 'Sesión cerrada correctamente'
    }, {
      status: 200,
      headers: { 
        'Access-Control-Allow-Origin': '*',
        'Set-Cookie': 'session_token=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict'
      }
    });
  } catch (error) {
    console.error('[logoutUser] Error:', error);
    return Response.json({ 
      success: false,
      error: 'Error al cerrar sesión'
    }, { status: 500 });
  }
});