import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

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
    console.log('[validateDriverLogin] Request received');
    const base44 = createClientFromRequest(req);
    console.log('[validateDriverLogin] Base44 client created');
    const { driverId, csrf_token } = await req.json();
    console.log('[validateDriverLogin] Request parsed:', { driverId, csrf_token });

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

      // Test drivers fetch
      console.log('[validateDriverLogin] Attempting to fetch drivers for ID:', sanitizedId);

      // Buscar conductor - use list instead of filter
      let drivers = [];
      try {
        const allDrivers = await base44.asServiceRole.entities.Driver.list('', 100);
        console.log('[validateDriverLogin] Total drivers fetched:', allDrivers.length);
        console.log('[validateDriverLogin] First driver:', allDrivers[0]);
        drivers = allDrivers.filter(d => d.driver_id === sanitizedId);
        console.log('[validateDriverLogin] Matching drivers:', drivers.length);
      } catch (e) {
        console.error('[validateDriverLogin] Driver fetch error:', e.message);
        console.error('[validateDriverLogin] Error details:', e);
        return Response.json({ success: false, error: 'Error fetching drivers: ' + e.message }, { status: 500 });
      }

      if (!drivers?.length) {
      await base44.functions.invoke('logSecurityEvent', {
        event_type: 'login_failed',
        user_id: sanitizedId,
        user_type: 'driver',
        details: { reason: 'driver_not_found' },
        severity: 'low',
        success: false
      });
      
      return Response.json({ 
        success: false, 
        error: 'Conductor no encontrado' 
      }, { 
        status: 404,
        headers: { 'Access-Control-Allow-Origin': '*' }
      });
    }
    
    // Login exitoso - reset rate limit
    await base44.functions.invoke('resetRateLimit', {
      identifier: sanitizedId,
      attempt_type: 'driver_login'
    });
    
    const driver = drivers[0];

    // Crear sesión directamente sin invocar otra función
    const sessionToken = crypto.randomUUID();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 12 * 60 * 60 * 1000);
    
    const clientIp = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    
    // Generar JWT tokens
    const tokensResponse = await base44.functions.invoke('generateTokens', {
      user_id: driver.id,
      full_name: driver.full_name,
      email: driver.email,
      role: 'user',
      user_type: 'driver',
      driver_id: driver.driver_id
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
      user_id: driver.id,
      full_name: driver.full_name,
      email: driver.email || '',
      phone: driver.phone || '',
      role: 'user',
      user_type: 'driver',
      driver_id: driver.driver_id,
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
    
    // Limpiar solo la sesión más reciente (más rápido)
    const oldSessions = await base44.asServiceRole.entities.UserSession.filter(
      { user_id: driver.id },
      '-created_date',
      1
    );
    
    if (oldSessions.length > 0) {
      await base44.asServiceRole.entities.UserSession.delete(oldSessions[0].id);
    }
    
    await base44.asServiceRole.entities.UserSession.create(sessionData);

    // Log login exitoso
    await base44.functions.invoke('logSecurityEvent', {
      event_type: 'login_success',
      user_id: driver.id,
      user_email: driver.email,
      user_type: 'driver',
      details: { driver_id: driver.driver_id },
      severity: 'low',
      success: true
    });

    return Response.json({ 
      success: true,
      user: {
        id: driver.id,
        full_name: driver.full_name,
        email: driver.email,
        phone: driver.phone,
        role: 'user',
        user_type: 'driver',
        driver_id: driver.driver_id
      },
      session_token: sessionToken,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      access_token_expires: tokens.access_token_expires
    }, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': req.headers.get('origin') || '*',
        'Access-Control-Allow-Credentials': 'true',
        'Content-Type': 'application/json',
        'Set-Cookie': `session_token=${sessionToken}; Path=/; Max-Age=${12*60*60}; HttpOnly; Secure; SameSite=Strict`,
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block'
      }
    });
  } catch (error) {
    console.error('[validateDriverLogin] Error:', error);
    console.error('[validateDriverLogin] Stack:', error.stack);
    console.error('[validateDriverLogin] Message:', error.message);
    return Response.json({ 
      success: false, 
      error: 'Error en el servidor',
      details: error.message 
    }, { 
      status: 500,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  }
});