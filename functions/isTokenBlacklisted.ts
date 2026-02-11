import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

async function hashToken(token) {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
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
    const { token, token_type } = await req.json();

    if (!token || !token_type) {
      return Response.json({
        success: false,
        blacklisted: false,
        error: 'Missing token or token_type'
      }, { status: 400 });
    }

    const hashedToken = await hashToken(token);

    // Buscar en blacklist
    const blacklist = await base44.asServiceRole.entities.TokenBlacklist.filter({
      token: hashedToken,
      token_type: token_type
    });

    const isBlacklisted = blacklist && blacklist.length > 0;

    return Response.json({
      success: true,
      blacklisted: isBlacklisted
    }, {
      status: 200,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  } catch (error) {
    console.error('[isTokenBlacklisted] Error:', error);
    return Response.json({
      success: false,
      blacklisted: false,
      error: error.message
    }, { status: 500 });
  }
});