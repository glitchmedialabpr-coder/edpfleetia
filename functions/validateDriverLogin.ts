import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Rate limiting
const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutos

function checkLoginAttempts(driverId) {
  const now = Date.now();
  const attempts = loginAttempts.get(driverId);
  
  if (!attempts) {
    loginAttempts.set(driverId, { count: 1, firstAttempt: now, lockedUntil: null });
    return { allowed: true };
  }
  
  if (attempts.lockedUntil && now < attempts.lockedUntil) {
    const remainingMinutes = Math.ceil((attempts.lockedUntil - now) / 60000);
    return { 
      allowed: false, 
      message: `Cuenta bloqueada. Intenta en ${remainingMinutes} minutos.` 
    };
  }
  
  if (attempts.lockedUntil && now >= attempts.lockedUntil) {
    loginAttempts.set(driverId, { count: 1, firstAttempt: now, lockedUntil: null });
    return { allowed: true };
  }
  
  attempts.count++;
  
  if (attempts.count >= MAX_ATTEMPTS) {
    attempts.lockedUntil = now + LOCKOUT_TIME;
    return { 
      allowed: false, 
      message: `Demasiados intentos. Cuenta bloqueada por 15 minutos.` 
    };
  }
  
  return { allowed: true };
}

function resetLoginAttempts(driverId) {
  loginAttempts.delete(driverId);
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
    const { driverId } = await req.json();
    
    // Validación
     if (!driverId || typeof driverId !== 'string' || driverId.length !== 3) {
      return Response.json({ success: false, error: 'ID inválido' }, { 
        status: 400,
        headers: { 'Access-Control-Allow-Origin': '*' }
      });
    }
    
    // Sanitizar input
    const sanitizedId = driverId.trim().replace(/[^0-9]/g, '').slice(0, 3);
    
    if (sanitizedId.length !== 3) {
      return Response.json({ success: false, error: 'ID inválido' }, { 
        status: 400,
        headers: { 'Access-Control-Allow-Origin': '*' }
      });
    }
    
    // Verificar rate limiting
     const attemptCheck = checkLoginAttempts(sanitizedId);
    if (!attemptCheck.allowed) {
      return Response.json({ 
        success: false, 
        error: attemptCheck.message 
      }, { 
        status: 429,
        headers: { 'Access-Control-Allow-Origin': '*' }
      });
    }
    
    const drivers = await base44.asServiceRole.entities.Driver.filter({ 
      driver_id: sanitizedId,
      status: 'active'
    });
    
    if (!drivers?.length) {
      return Response.json({ 
        success: false, 
        error: 'No encontrado' 
      }, { 
        status: 404,
        headers: { 'Access-Control-Allow-Origin': '*' }
      });
    }
    
    // Login exitoso - reset intentos y crear sesión
    resetLoginAttempts(sanitizedId);
    
    const driver = drivers[0];

    const sessionResponse = await base44.asServiceRole.functions.invoke('createUserSession', {
      id: driver.id,
      email: driver.email,
      full_name: driver.full_name,
      phone: driver.phone,
      role: 'user',
      user_type: 'driver',
      driver_id: driver.driver_id
    });

    return Response.json({ 
      success: true,
      user: sessionResponse.data.user,
      session_token: sessionResponse.data.session_token
    }, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': req.headers.get('origin') || '*',
        'Access-Control-Allow-Credentials': 'true',
        'Content-Type': 'application/json',
        'Set-Cookie': `session_token=${sessionResponse.data.session_token}; Path=/; Max-Age=${30*24*60*60}; HttpOnly; Secure; SameSite=Strict`,
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block'
      }
    });
  } catch (error) {
    console.error('[validateDriverLogin] Error:', error);
    return Response.json({ 
      success: false, 
      error: 'Error en el servidor' 
    }, { 
      status: 500,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  }
});