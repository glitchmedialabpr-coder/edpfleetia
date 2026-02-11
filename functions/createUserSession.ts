import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

function generateSessionToken() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Cache de sesiones activas para evitar consultas repetidas
const sessionCache = new Map();
const SESSION_CACHE_TTL = 5 * 60 * 1000; // 5 minutos

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
    const userId = userData.id || userData.user_id || `user_${generateSessionToken()}`;

    const sessionData = {
      user_id: userId,
      full_name: userData.full_name || 'Usuario',
      email: userData.email || '',
      role: userData.role || 'user',
      session_token: sessionToken,
      last_activity: now.toISOString(),
      expires_at: expiresAt.toISOString()
    };

    // Solo agregar campos opcionales si existen
    if (userData.phone) sessionData.phone = userData.phone;
    if (userData.user_type) sessionData.user_type = userData.user_type;
    if (userData.student_id) sessionData.student_id = userData.student_id;
    if (userData.driver_id) sessionData.driver_id = userData.driver_id;
    if (userData.housing_name) sessionData.housing_name = userData.housing_name;

    // Limpiar sesiones antiguas del mismo usuario antes de crear una nueva
    const existingSessions = await base44.asServiceRole.entities.UserSession.filter({
      user_id: userId
    });
    
    for (const oldSession of existingSessions) {
      await base44.asServiceRole.entities.UserSession.delete(oldSession.id);
    }
    
    const session = await base44.asServiceRole.entities.UserSession.create(sessionData);
    
    // Cachear la sesión
    sessionCache.set(sessionToken, {
      session,
      cachedAt: Date.now()
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
    console.error('[createUserSession] Error:', error);
    console.error('[createUserSession] Stack:', error.stack);
    console.error('[createUserSession] Message:', error.message);
    return Response.json({ 
      success: false, 
      error: error.message,
      details: error.stack 
    }, { 
      status: 500,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  }
});