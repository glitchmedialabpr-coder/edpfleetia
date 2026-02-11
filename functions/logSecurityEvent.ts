import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();
    
    const {
      event_type,
      user_id,
      user_email,
      user_type,
      details = {},
      severity = 'low',
      success = true
    } = payload;

    if (!event_type) {
      return Response.json({ error: 'event_type is required' }, { status: 400 });
    }

    // Extraer IP y User Agent
    const ip_address = req.headers.get('x-forwarded-for') || 
                       req.headers.get('x-real-ip') || 
                       'unknown';
    const user_agent = req.headers.get('user-agent') || 'unknown';

    // Crear log de seguridad
    const logEntry = {
      event_type,
      user_id,
      user_email,
      user_type,
      ip_address,
      user_agent,
      details,
      severity,
      success
    };

    await base44.asServiceRole.entities.SecurityLog.create(logEntry);

    // Si es crítico, notificar admin
    if (severity === 'critical' || severity === 'high') {
      await base44.asServiceRole.entities.Notification.create({
        type: 'system',
        title: `Evento de Seguridad: ${event_type}`,
        message: `Severidad: ${severity} - Usuario: ${user_email || user_id || 'Desconocido'}`,
        data: details,
        priority: 'high',
        created_by: Deno.env.get('ADMIN_NOTIFICATION_EMAIL') || 'admin@system.com'
      });
    }

    return Response.json({ 
      success: true,
      logged: true 
    });

  } catch (error) {
    console.error('[logSecurityEvent] Error:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});