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
    const { pin } = await req.json();
    
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
      }, { status: 429 });
    }
    
    const ADMIN_PIN = Deno.env.get('ADMIN_PIN');
    
    if (pin !== ADMIN_PIN) {
      return Response.json({ 
        success: false, 
        error: 'PIN incorrecto' 
      }, { status: 401 });
    }
    
    // Login exitoso
    resetAdminAttempts(clientIp);
    
    return Response.json({ 
      success: true,
      user: {
        email: 'admin@edp.edu',
        full_name: 'Administrador',
        role: 'admin',
        session_expiry: Date.now() + (8 * 60 * 60 * 1000)
      }
    }, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
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
    }, { status: 500 });
  }
});