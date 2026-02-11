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
    const { ip_address, user_agent, accept_language } = await req.json();

    if (!ip_address || !user_agent) {
      return Response.json({
        success: false,
        error: 'Missing required fingerprint data'
      }, { status: 400 });
    }

    // Crear fingerprint usando IP + User-Agent + Accept-Language
    // Este es un hash simple pero efectivo para detectar cambios
    const fingerprintData = `${ip_address}|${user_agent}|${accept_language || 'unknown'}`;
    
    // Hash SHA-256 del fingerprint
    const encoder = new TextEncoder();
    const data = encoder.encode(fingerprintData);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const fingerprint = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return Response.json({
      success: true,
      fingerprint: fingerprint,
      components: {
        ip_address,
        user_agent,
        accept_language: accept_language || 'unknown'
      }
    }, {
      status: 200,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  } catch (error) {
    console.error('[generateSessionFingerprint] Error:', error);
    return Response.json({
      success: false,
      error: 'Error generando fingerprint'
    }, { status: 500 });
  }
});