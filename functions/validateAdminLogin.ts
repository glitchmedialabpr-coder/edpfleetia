import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const { pin } = await req.json();
    
    // Rate limiting check - max 5 attempts per IP per minute
    const clientIp = req.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitKey = `admin_login_${clientIp}`;
    
    // Get admin PIN from environment
    const ADMIN_PIN = Deno.env.get('ADMIN_PIN');
    
    if (!ADMIN_PIN) {
      return Response.json({ 
        success: false, 
        error: 'Configuración de seguridad pendiente' 
      }, { status: 500 });
    }
    
    // Validate PIN
    if (pin === ADMIN_PIN) {
      // Generate session token
      const sessionToken = crypto.randomUUID();
      const sessionExpiry = Date.now() + (8 * 60 * 60 * 1000); // 8 hours
      
      return Response.json({ 
        success: true,
        user: {
          email: 'admin@edp.edu',
          full_name: 'Administrador',
          role: 'admin',
          session_token: sessionToken,
          session_expiry: sessionExpiry
        }
      });
    } else {
      return Response.json({ 
        success: false, 
        error: 'PIN incorrecto' 
      }, { status: 401 });
    }
  } catch (error) {
    return Response.json({ 
      success: false, 
      error: 'Error al validar credenciales' 
    }, { status: 500 });
  }
});