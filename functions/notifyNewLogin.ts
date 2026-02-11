import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

function parseUserAgent(ua) {
  if (!ua) return 'Dispositivo desconocido';
  if (ua.includes('Chrome')) return 'Chrome en';
  if (ua.includes('Safari')) return 'Safari en';
  if (ua.includes('Firefox')) return 'Firefox en';
  if (ua.includes('Edge')) return 'Edge en';
  return 'Navegador en';
}

function getDeviceType(ua) {
  if (!ua) return 'Dispositivo';
  if (ua.includes('iPhone')) return 'iPhone';
  if (ua.includes('iPad')) return 'iPad';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('Windows')) return 'Windows PC';
  if (ua.includes('Mac')) return 'Mac';
  return 'Dispositivo';
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
    const { user_id, email, ip_address, user_agent, is_suspicious } = await req.json();

    if (!user_id || !email) {
      return Response.json({
        success: false,
        error: 'Faltan datos'
      }, { status: 400 });
    }

    // Crear actividad de sesión
    const device = parseUserAgent(user_agent);
    const deviceType = getDeviceType(user_agent);

    const subject = is_suspicious 
      ? '🚨 Nuevo acceso detectado en tu cuenta - Fleetia'
      : '✅ Acceso a tu cuenta - Fleetia';

    const body = `
Hola,

${is_suspicious ? '⚠️ Se detectó un acceso NUEVO a tu cuenta desde:' : 'Tu cuenta fue accesada desde:'}

📍 IP: ${ip_address}
🖥️  Dispositivo: ${deviceType}
🌐 Navegador: ${device}

${is_suspicious ? 'Si NO fuiste tú, revisa tu cuenta inmediatamente y cambia tu contraseña.' : 'Si reconoces este acceso, puedes ignorar este mensaje.'}

Puedes ver todas tus sesiones activas en:
https://tuapp.com/security/sessions

---
Fleetia - Sistema de Gestión de Transporte
    `;

    // Enviar email
    await base44.integrations.Core.SendEmail({
      to: email,
      subject: subject,
      body: body
    });

    return Response.json({
      success: true,
      message: 'Notificación enviada'
    }, {
      status: 200,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  } catch (error) {
    console.error('[notifyNewLogin] Error:', error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
});