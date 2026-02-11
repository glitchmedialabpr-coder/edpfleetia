import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Rate limiting para admin
const adminAttempts = new Map();
const MAX_ATTEMPTS = 3;
const LOCKOUT_TIME = 30 * 60 * 1000; // 30 minutos

function checkAdminAttempts(ip) {
  const now = Date.now();
  const attempts = adminAttempts.get(ip);
  
  if (!attempts) {
    adminAttempts.set(ip, { count: 1, firstAttempt: now, lockedUntil: null });
    return { allowed: true };
  }
  
  if (attempts.lockedUntil && now < attempts.lockedUntil) {
    const remainingMinutes = Math.ceil((attempts.lockedUntil - now) / 60000);
    return { 
      allowed: false, 
      message: `Bloqueado. Intenta en ${remainingMinutes} minutos.` 
    };
  }
  
  if (attempts.lockedUntil && now >= attempts.lockedUntil) {
    adminAttempts.set(ip, { count: 1, firstAttempt: now, lockedUntil: null });
    return { allowed: true };
  }
  
  attempts.count++;
  
  if (attempts.count >= MAX_ATTEMPTS) {
    attempts.lockedUntil = now + LOCKOUT_TIME;
    return { 
      allowed: false, 
      message: `Demasiados intentos. Bloqueado por 30 minutos.` 
    };
  }
  
  return { allowed: true };
}

function resetAdminAttempts(ip) {
  adminAttempts.delete(ip);
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
    const { pin, csrf_token } = await req.json();
    
    // CSRF Protection - OBLIGATORIO
    if (!csrf_token || typeof csrf_token !== 'string') {
      return Response.json({ 
        success: false,
        error: 'Token CSRF inválido' 
      }, { 
        status: 403,
        headers: { 'Access-Control-Allow-Origin': req.headers.get('origin') || '*' }
      });
    }
    
    // Obtener IP del cliente
    const clientIp = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    
    // Validación básica
    if (!pin || typeof pin !== 'string' || pin.length !== 4) {
      return Response.json({ 
        success: false, 
        error: 'PIN inválido' 
      }, { 
        status: 400,
        headers: { 'Access-Control-Allow-Origin': '*' }
      });
    }
    
    // Rate limiting
    const attemptCheck = checkAdminAttempts(clientIp);
    if (!attemptCheck.allowed) {
      return Response.json({ 
        success: false, 
        error: attemptCheck.message 
      }, { 
        status: 429,
        headers: { 'Access-Control-Allow-Origin': '*' }
      });
    }
    
    const ADMIN_PIN_HASH = Deno.env.get('ADMIN_PIN_HASH');

    if (!ADMIN_PIN_HASH) {
      return Response.json({ 
        success: false, 
        error: 'Configuración incompleta' 
      }, { 
        status: 500,
        headers: { 'Access-Control-Allow-Origin': '*' }
      });
    }

    // Comparar PIN usando SHA-256
    const encoder = new TextEncoder();
    const data = encoder.encode(pin);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const pinHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    const isValidPin = pinHash === ADMIN_PIN_HASH;

    if (!isValidPin) {
      return Response.json({ 
        success: false, 
        error: 'PIN incorrecto' 
      }, { 
        status: 401,
        headers: { 'Access-Control-Allow-Origin': '*' }
      });
    }
    
    // Login exitoso - crear sesión directamente
    resetAdminAttempts(clientIp);

    const sessionToken = crypto.randomUUID();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 horas
    
    // Generar JWT tokens
    const tokensResponse = await base44.functions.invoke('generateTokens', {
      user_id: 'admin',
      full_name: 'Administrador',
      email: 'admin@edp.edu',
      role: 'admin',
      user_type: 'admin'
    });
    
    const tokens = tokensResponse.data;

    // Generar session fingerprint
    const acceptLanguage = req.headers.get('accept-language') || 'unknown';
    const fingerprintResponse = await base44.functions.invoke('generateSessionFingerprint', {
      ip_address: clientIp,
      user_agent: req.headers.get('user-agent') || 'unknown',
      accept_language: acceptLanguage
    });

    const fingerprint = fingerprintResponse.data.fingerprint;

    const sessionData = {
      user_id: 'admin',
      full_name: 'Administrador',
      email: 'admin@edp.edu',
      role: 'admin',
      user_type: 'admin',
      session_token: sessionToken,
      session_fingerprint: fingerprint,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      access_token_expires: tokens.access_token_expires,
      refresh_token_expires: tokens.refresh_token_expires,
      last_activity: now.toISOString(),
      expires_at: expiresAt.toISOString(),
      ip_address: clientIp,
      user_agent: req.headers.get('user-agent') || 'unknown'
    };
    
    // Limpiar solo la sesión más reciente del admin (más rápido)
    const oldSessions = await base44.asServiceRole.entities.UserSession.filter(
      { user_id: 'admin' },
      '-created_date',
      1
    );
    
    if (oldSessions.length > 0) {
      await base44.asServiceRole.entities.UserSession.delete(oldSessions[0].id);
    }
    
    await base44.asServiceRole.entities.UserSession.create(sessionData);
    
    // Generar nuevo CSRF token para próximas requests
    const newCsrfToken = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    return Response.json({ 
      success: true,
      user: {
        id: 'admin',
        full_name: 'Administrador',
        email: 'admin@edp.edu',
        role: 'admin',
        user_type: 'admin'
      },
      session_token: sessionToken,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      access_token_expires: tokens.access_token_expires,
      csrf_token: newCsrfToken
    }, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': req.headers.get('origin') || '*',
        'Access-Control-Allow-Credentials': 'true',
        'Content-Type': 'application/json',
        'Set-Cookie': `session_token=${sessionToken}; Path=/; Max-Age=${24*60*60}; HttpOnly; Secure; SameSite=Strict`,
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block'
      }
    });
  } catch (error) {
    console.error('[validateAdminLogin] Error:', error);
    return Response.json({ 
      success: false, 
      error: 'Error en el servidor' 
    }, { 
      status: 500,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  }
});