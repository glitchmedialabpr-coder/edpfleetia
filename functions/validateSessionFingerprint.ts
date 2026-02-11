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
    const base44 = createClientFromRequest(req);
    const { 
      session_id, 
      ip_address, 
      user_agent, 
      accept_language 
    } = await req.json();

    if (!session_id) {
      return Response.json({
        success: false,
        valid: false,
        error: 'Missing session_id'
      }, { status: 400 });
    }

    // Obtener sesión de la BD
    const sessions = await base44.asServiceRole.entities.UserSession.filter({
      id: session_id
    });

    if (!sessions || sessions.length === 0) {
      return Response.json({
        success: false,
        valid: false,
        error: 'Session not found'
      }, { status: 404 });
    }

    const session = sessions[0];
    const storedFingerprint = session.session_fingerprint;

    // Generar fingerprint actual
    const fingerprintData = `${ip_address}|${user_agent}|${accept_language || 'unknown'}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(fingerprintData);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const currentFingerprint = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Comparar fingerprints
    const fingerprintMatch = storedFingerprint === currentFingerprint;

    // Detectar cambios sospechosos
    const suspicious = {
      ip_changed: session.ip_address !== ip_address,
      user_agent_changed: session.user_agent !== user_agent,
      fingerprint_match: fingerprintMatch
    };

    // Si todo cambia (IP + UA), es muy sospechoso
    const isSuspicious = suspicious.ip_changed && suspicious.user_agent_changed && !fingerprintMatch;

    return Response.json({
      success: true,
      valid: fingerprintMatch,
      suspicious: isSuspicious,
      changes: suspicious
    }, {
      status: 200,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  } catch (error) {
    console.error('[validateSessionFingerprint] Error:', error);
    return Response.json({
      success: false,
      valid: false,
      error: error.message
    }, { status: 500 });
  }
});