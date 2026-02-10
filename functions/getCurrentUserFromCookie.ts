import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

function parseCookie(cookieString, name) {
  if (!cookieString) return null;
  
  const cookies = cookieString.split(';').map(c => c.trim());
  const targetCookie = cookies.find(c => c.startsWith(`${name}=`));
  
  if (!targetCookie) return null;
  
  return targetCookie.substring(name.length + 1);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Leer cookie del header
    const cookieString = req.headers.get('cookie');
    const sessionToken = parseCookie(cookieString, 'session_token');
    
    if (!sessionToken) {
      return Response.json({ 
        authenticated: false,
        user: null
      }, {
        status: 200,
        headers: { 'Access-Control-Allow-Origin': '*' }
      });
    }
    
    // Buscar sesión en la base de datos
    const sessions = await base44.asServiceRole.entities.UserSession.filter({
      session_token: sessionToken
    });
    
    if (!sessions || sessions.length === 0) {
      return Response.json({ 
        authenticated: false,
        user: null,
        reason: 'session_not_found'
      }, {
        status: 200,
        headers: { 'Access-Control-Allow-Origin': '*' }
      });
    }
    
    const session = sessions[0];
    
    // Verificar si la sesión ha expirado
    const now = new Date();
    const expiresAt = new Date(session.expires_at);
    
    if (now > expiresAt) {
      // Eliminar sesión expirada
      await base44.asServiceRole.entities.UserSession.delete(session.id);
      
      return Response.json({ 
        authenticated: false,
        user: null,
        reason: 'session_expired'
      }, {
        status: 200,
        headers: { 'Access-Control-Allow-Origin': '*' }
      });
    }
    
    // Actualizar última actividad
    await base44.asServiceRole.entities.UserSession.update(session.id, {
      last_activity: now.toISOString()
    });
    
    // Construir objeto de usuario
    const userData = {
      id: session.user_id,
      full_name: session.full_name,
      email: session.email,
      role: session.role,
      user_type: session.user_type,
      phone: session.phone,
      student_id: session.student_id,
      driver_id: session.driver_id,
      housing_name: session.housing_name
    };
    
    return Response.json({ 
      authenticated: true,
      user: userData
    }, {
      status: 200,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
    
  } catch (error) {
    console.error('[getCurrentUserFromCookie] Error:', error);
    return Response.json({ 
      authenticated: false,
      user: null,
      error: error.message
    }, { 
      status: 500,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  }
});