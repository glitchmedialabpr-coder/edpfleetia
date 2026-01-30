import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const { session_token, session_expiry, user_type } = await req.json();
    
    if (!session_token || !session_expiry) {
      return Response.json({ 
        valid: false, 
        error: 'Sesión inválida' 
      }, { status: 401 });
    }
    
    // Check if session is expired
    if (Date.now() > session_expiry) {
      return Response.json({ 
        valid: false, 
        error: 'Sesión expirada',
        expired: true
      }, { status: 401 });
    }
    
    // For passengers, also check 5-minute auto-logout
    if (user_type === 'passenger') {
      const fiveMinutes = 5 * 60 * 1000;
      if (Date.now() > session_expiry) {
        return Response.json({ 
          valid: false, 
          error: 'Sesión de estudiante expirada',
          expired: true
        }, { status: 401 });
      }
    }
    
    return Response.json({ 
      valid: true,
      remaining_time: session_expiry - Date.now()
    });
  } catch (error) {
    return Response.json({ 
      valid: false, 
      error: 'Error al validar sesión' 
    }, { status: 500 });
  }
});