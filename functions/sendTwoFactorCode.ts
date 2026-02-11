import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function hashCode(code) {
  const encoder = new TextEncoder();
  const data = encoder.encode(code);
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

    // Generar código 6 dígitos
    const codePlain = generateCode();
    const codeHash = await hashCode(codePlain);

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutos

    const clientIp = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown';

    // Guardar en BD
    await base44.asServiceRole.entities.TwoFactorAuth.create({
      user_id: user.id,
      email: user.email,
      code: codeHash,
      code_plain: codePlain,
      attempts: 0,
      expires_at: expiresAt.toISOString(),
      ip_address: clientIp,
      user_agent: req.headers.get('user-agent') || 'unknown'
    });

    // Enviar código por email
    await base44.integrations.Core.SendEmail({
      to: user.email,
      subject: '🔐 Código de Verificación - Fleetia',
      body: `
Hola ${user.full_name},

Tu código de verificación es:

${codePlain}

Este código expira en 10 minutos.

Si no solicitaste este código, ignora este mensaje.

---
Fleetia - Sistema de Gestión de Transporte
      `
    });

    return Response.json({
      success: true,
      message: 'Código enviado a tu email',
      email: user.email
    }, {
      status: 200,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  } catch (error) {
    console.error('[sendTwoFactorCode] Error:', error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
});