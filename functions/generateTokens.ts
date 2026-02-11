import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { create } from 'https://deno.land/x/djwt@v3.0.2/mod.ts';

const JWT_SECRET = Deno.env.get('JWT_SECRET');

// CRITICAL SECURITY: JWT_SECRET must be configured
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  console.error('[SECURITY] JWT_SECRET not configured or too weak');
  throw new Error('CRITICAL: JWT_SECRET must be configured with minimum 32 characters');
}

const encoder = new TextEncoder();
const keyData = encoder.encode(JWT_SECRET);

async function generateJWT(payload, expiresIn) {
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );

  const jwt = await create(
    { alg: 'HS256', typ: 'JWT' },
    { ...payload, exp: Math.floor(Date.now() / 1000) + expiresIn },
    key
  );

  return jwt;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();
    
    const { user_id, full_name, email, role, user_type, driver_id, student_id } = payload;

    if (!user_id) {
      return Response.json({ error: 'user_id required' }, { status: 400 });
    }

    // Access token: 15 minutos
    const accessTokenPayload = {
      sub: user_id,
      name: full_name,
      email,
      role,
      user_type,
      driver_id,
      student_id,
      type: 'access'
    };
    const accessToken = await generateJWT(accessTokenPayload, 15 * 60);
    const accessTokenExpires = new Date(Date.now() + 15 * 60 * 1000);

    // Refresh token: 7 días
    const refreshTokenPayload = {
      sub: user_id,
      type: 'refresh'
    };
    const refreshToken = await generateJWT(refreshTokenPayload, 7 * 24 * 60 * 60);
    const refreshTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    return Response.json({
      success: true,
      access_token: accessToken,
      refresh_token: refreshToken,
      access_token_expires: accessTokenExpires.toISOString(),
      refresh_token_expires: refreshTokenExpires.toISOString()
    });

  } catch (error) {
    console.error('[generateTokens] Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});