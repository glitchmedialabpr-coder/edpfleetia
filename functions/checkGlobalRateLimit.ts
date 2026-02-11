import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const GLOBAL_MAX_REQUESTS = 100; // requests por ventana
const WINDOW_TIME = 60 * 1000; // 1 minuto

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { endpoint } = await req.json();
    
    const clientIp = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    
    const identifier = `${clientIp}_global`;
    const now = new Date();
    
    // Buscar rate limit global para esta IP
    const rateLimits = await base44.asServiceRole.entities.RateLimitLog.filter({
      identifier,
      attempt_type: 'api_call'
    }, '-created_date', 1);
    
    let rateLimit = rateLimits.length > 0 ? rateLimits[0] : null;
    
    // Si no existe, crear
    if (!rateLimit) {
      await base44.asServiceRole.entities.RateLimitLog.create({
        identifier,
        attempt_type: 'api_call',
        attempts_count: 1,
        first_attempt: now.toISOString(),
        last_attempt: now.toISOString()
      });
      
      return Response.json({ 
        allowed: true,
        requests: 1,
        remaining: GLOBAL_MAX_REQUESTS - 1
      });
    }
    
    // Verificar si está bloqueado
    if (rateLimit.locked_until) {
      const lockedUntil = new Date(rateLimit.locked_until);
      
      if (now < lockedUntil) {
        const remainingSeconds = Math.ceil((lockedUntil - now) / 1000);
        
        await base44.functions.invoke('logSecurityEvent', {
          event_type: 'rate_limit_exceeded',
          details: { 
            identifier, 
            endpoint,
            reason: 'global_rate_limit',
            remainingSeconds 
          },
          severity: 'medium',
          success: false
        });
        
        return Response.json({ 
          allowed: false,
          message: `Too many requests. Retry in ${remainingSeconds} seconds.`,
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
        requests: 1,
        remaining: GLOBAL_MAX_REQUESTS - 1
      });
    }
    
    // Verificar ventana de tiempo
    const firstAttempt = new Date(rateLimit.first_attempt);
    const timeDiff = now.getTime() - firstAttempt.getTime();
    
    // Si pasó la ventana, resetear
    if (timeDiff > WINDOW_TIME) {
      await base44.asServiceRole.entities.RateLimitLog.update(rateLimit.id, {
        attempts_count: 1,
        first_attempt: now.toISOString(),
        last_attempt: now.toISOString()
      });
      
      return Response.json({ 
        allowed: true,
        requests: 1,
        remaining: GLOBAL_MAX_REQUESTS - 1
      });
    }
    
    // Incrementar contador
    const newAttempts = rateLimit.attempts_count + 1;
    
    if (newAttempts > GLOBAL_MAX_REQUESTS) {
      const lockedUntil = new Date(now.getTime() + WINDOW_TIME);
      
      await base44.asServiceRole.entities.RateLimitLog.update(rateLimit.id, {
        attempts_count: newAttempts,
        last_attempt: now.toISOString(),
        locked_until: lockedUntil.toISOString()
      });
      
      await base44.functions.invoke('logSecurityEvent', {
        event_type: 'rate_limit_exceeded',
        details: { 
          identifier, 
          endpoint,
          attempts: newAttempts,
          limit: GLOBAL_MAX_REQUESTS
        },
        severity: 'high',
        success: false
      });
      
      return Response.json({ 
        allowed: false,
        message: 'Rate limit exceeded. Too many requests.',
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
      requests: newAttempts,
      remaining: GLOBAL_MAX_REQUESTS - newAttempts
    });
    
  } catch (error) {
    console.error('[checkGlobalRateLimit] Error:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});