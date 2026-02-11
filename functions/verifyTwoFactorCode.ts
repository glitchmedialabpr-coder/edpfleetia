import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

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

    const { code } = await req.json();

    if (!code || code.length !== 6) {
      return Response.json({
        success: false,
        error: 'Código inválido'
      }, { status: 400 });
    }

    // Buscar código pendiente
    const records = await base44.asServiceRole.entities.TwoFactorAuth.filter({
      user_id: user.id,
      verified: false
    });

    if (!records || records.length === 0) {
      return Response.json({
        success: false,
        error: 'No hay código pendiente'
      }, { status: 404 });
    }

    const record = records[0];

    // Verificar expiración
    const now = new Date();
    const expiresAt = new Date(record.expires_at);
    if (now > expiresAt) {
      await base44.asServiceRole.entities.TwoFactorAuth.delete(record.id);
      return Response.json({
        success: false,
        error: 'Código expirado'
      }, { status: 410 });
    }

    // Verificar intentos
    if (record.attempts >= record.max_attempts) {
      await base44.asServiceRole.entities.TwoFactorAuth.delete(record.id);
      return Response.json({
        success: false,
        error: 'Demasiados intentos. Intenta de nuevo más tarde.'
      }, { status: 429 });
    }

    // Verificar código
    const codeHash = await hashCode(code);
    if (codeHash !== record.code) {
      await base44.asServiceRole.entities.TwoFactorAuth.update(record.id, {
        attempts: record.attempts + 1
      });
      return Response.json({
        success: false,
        error: 'Código incorrecto'
      }, { status: 401 });
    }

    // Código válido
    await base44.asServiceRole.entities.TwoFactorAuth.update(record.id, {
      verified: true
    });

    // Log evento
    await base44.functions.invoke('logSecurityEvent', {
      event_type: 'login_success',
      user_id: user.id,
      user_email: user.email,
      user_type: user.user_type,
      details: { method: '2fa_verified' },
      severity: 'low',
      success: true
    });

    return Response.json({
      success: true,
      message: '✅ Verificación completada'
    }, {
      status: 200,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  } catch (error) {
    console.error('[verifyTwoFactorCode] Error:', error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
});