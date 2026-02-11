import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutos

Deno.serve(async (req) => {
  try {
    const { identifier, attempt_type } = await req.json();

    if (!identifier || !attempt_type) {
      return Response.json({ 
        error: 'identifier and attempt_type required' 
      }, { status: 400 });
    }

    const now = new Date();

    // Buscar rate limit existente
    const rateLimits = await base44.asServiceRole.entities.RateLimitLog.filter({
      identifier,
      attempt_type
    }, '-created_date', 1);

    let rateLimit = rateLimits.length > 0 ? rateLimits[0] : null;

    // Si no existe, crear uno nuevo
    if (!rateLimit) {
      await base44.asServiceRole.entities.RateLimitLog.create({
        identifier,
        attempt_type,
        attempts_count: 1,
        first_attempt: now.toISOString(),
        last_attempt: now.toISOString()
      });

      return Response.json({ 
        allowed: true,
        attempts: 1,
        remaining: MAX_ATTEMPTS - 1
      });
    }

    // Verificar si está bloqueado
    if (rateLimit.locked_until) {
      const lockedUntil = new Date(rateLimit.locked_until);
      
      if (now < lockedUntil) {
        const remainingMinutes = Math.ceil((lockedUntil - now) / 60000);
        
        // Log intento bloqueado
        await base44.functions.invoke('logSecurityEvent', {
          event_type: 'rate_limit_exceeded',
          details: { identifier, attempt_type, remainingMinutes },
          severity: 'medium',
          success: false
        });

        return Response.json({ 
          allowed: false,
          message: `Bloqueado. Intenta en ${remainingMinutes} minutos.`,
          locked_until: lockedUntil.toISOString()
        }, { status: 429 });
      }

      // Lockout expirado - resetear
      await base44.asServiceRole.entities.RateLimitLog.update(rateLimit.id, {
        attempts_count: 1,
        first_attempt: now.toISOString(),
        last_attempt: now.toISOString(),
        locked_until: null
      });

      return Response.json({ 
        allowed: true,
        attempts: 1,
        remaining: MAX_ATTEMPTS - 1
      });
    }

    // Incrementar intentos
    const newAttempts = rateLimit.attempts_count + 1;

    if (newAttempts >= MAX_ATTEMPTS) {
      const lockedUntil = new Date(now.getTime() + LOCKOUT_TIME);
      
      await base44.asServiceRole.entities.RateLimitLog.update(rateLimit.id, {
        attempts_count: newAttempts,
        last_attempt: now.toISOString(),
        locked_until: lockedUntil.toISOString()
      });

      // Log bloqueo
      await base44.functions.invoke('logSecurityEvent', {
        event_type: 'rate_limit_exceeded',
        details: { identifier, attempt_type, attempts: newAttempts },
        severity: 'high',
        success: false
      });

      return Response.json({ 
        allowed: false,
        message: 'Demasiados intentos. Bloqueado por 15 minutos.',
        locked_until: lockedUntil.toISOString()
      }, { status: 429 });
    }

    // Actualizar contador
    await base44.asServiceRole.entities.RateLimitLog.update(rateLimit.id, {
      attempts_count: newAttempts,
      last_attempt: now.toISOString()
    });

    return Response.json({ 
      allowed: true,
      attempts: newAttempts,
      remaining: MAX_ATTEMPTS - newAttempts
    });

  } catch (error) {
    console.error('[checkRateLimit] Error:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});