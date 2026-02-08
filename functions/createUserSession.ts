import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

function generateSessionToken() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const userData = await req.json();

    const sessionToken = generateSessionToken();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 5 * 60 * 60 * 1000); // 5 horas
    
    // Generar ID único para el usuario si no existe
    const userId = userData.id || userData.user_id || `user_${crypto.getRandomUUID()}`;

    const session = await base44.asServiceRole.entities.UserSession.create({
      user_id: userId,
      full_name: userData.full_name,
      email: userData.email,
      phone: userData.phone,
      role: userData.role,
      user_type: userData.user_type,
      session_token: sessionToken,
      student_id: userData.student_id,
      driver_id: userData.driver_id,
      housing_name: userData.housing_name,
      last_activity: now.toISOString(),
      expires_at: expiresAt.toISOString()
    });

    return Response.json({
      success: true,
      session_id: session.id,
      session_token: sessionToken,
      user: {
        ...userData,
        session_id: session.id
      }
    }, {
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  } catch (error) {
    console.error('[createUserSession]', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});