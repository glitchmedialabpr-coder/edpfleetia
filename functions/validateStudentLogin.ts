import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Cache de estudiantes
const studentCache = new Map();
const CACHE_TTL = 60 * 60 * 1000; // 1 hora
let lastCacheLoad = 0;

async function loadStudentCache(base44) {
   const now = Date.now();

   if (studentCache.size === 0 || now - lastCacheLoad > CACHE_TTL) {
     try {
       const students = await base44.asServiceRole.entities.Student.list();
      
      studentCache.clear();
      
      if (students?.length) {
        students.forEach(student => {
          studentCache.set(student.student_id, student);
        });
        lastCacheLoad = now;
      } else {
        throw new Error('No students found in database');
      }
    } catch (error) {
      console.error('[Cache] Error loading students:', error);
      throw error;
    }
  }
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
    const { studentId } = await req.json();
    
    // Validación
     if (!studentId || typeof studentId !== 'string' || studentId.length !== 4) {
      return Response.json({ success: false, error: 'ID inválido' }, { 
        status: 400,
        headers: { 'Access-Control-Allow-Origin': '*' }
      });
    }
    
    // Sanitizar input
    const sanitizedId = studentId.trim().replace(/[^0-9]/g, '').slice(0, 4);
    
    if (sanitizedId.length !== 4) {
      return Response.json({ success: false, error: 'ID inválido' }, { 
        status: 400,
        headers: { 'Access-Control-Allow-Origin': '*' }
      });
    }
    
    // Rate limiting con DB persistente
    const rateLimitCheck = await base44.functions.invoke('checkRateLimit', {
      identifier: sanitizedId,
      attempt_type: 'student_login'
    });
    
    if (!rateLimitCheck.data.allowed) {
      return Response.json({ 
        success: false, 
        error: rateLimitCheck.data.message 
      }, { 
        status: 429,
        headers: { 'Access-Control-Allow-Origin': '*' }
      });
    }
    
    // Cargar cache
     try {
       await loadStudentCache(base44);
     } catch (cacheError) {
       console.error('[Cache Load] Failed:', cacheError.message);
       return Response.json({ 
         success: false, 
         error: 'Error cargando datos' 
       }, { 
         status: 500,
         headers: { 'Access-Control-Allow-Origin': '*' }
       });
     }
    
    // Buscar en cache primero
    let student = studentCache.get(sanitizedId);
    
    // Si no está en cache, buscar directamente en DB (más rápido que recargar todo)
    if (!student) {
      const students = await base44.asServiceRole.entities.Student.filter({ 
        student_id: sanitizedId,
        status: 'active'
      });
      
      if (!students?.length) {
        await base44.functions.invoke('logSecurityEvent', {
          event_type: 'login_failed',
          user_id: sanitizedId,
          user_type: 'passenger',
          details: { reason: 'student_not_found' },
          severity: 'low',
          success: false
        });
        
        return Response.json({ success: false, error: 'Estudiante no encontrado' }, { 
          status: 404,
          headers: { 'Access-Control-Allow-Origin': '*' }
        });
      }
      
      student = students[0];
      // Agregar al cache para próximas consultas
      studentCache.set(sanitizedId, student);
    }
    
    // Login exitoso - reset rate limit
    await base44.functions.invoke('resetRateLimit', {
      identifier: sanitizedId,
      attempt_type: 'student_login'
    });

    const sessionToken = crypto.randomUUID();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 12 * 60 * 60 * 1000);
    
    const clientIp = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    
    // Generar JWT tokens
    const tokensResponse = await base44.functions.invoke('generateTokens', {
      user_id: student.id,
      full_name: student.full_name,
      email: student.email || `student_${student.student_id}@edp.edu`,
      role: 'user',
      user_type: 'passenger',
      student_id: student.student_id
    });
    
    const tokens = tokensResponse.data;
    
    const sessionData = {
      user_id: student.id,
      full_name: student.full_name,
      email: student.email || `student_${student.student_id}@edp.edu`,
      phone: student.phone || '',
      student_id: student.student_id,
      housing_name: student.housing_name || '',
      role: 'user',
      user_type: 'passenger',
      session_token: sessionToken,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      access_token_expires: tokens.access_token_expires,
      refresh_token_expires: tokens.refresh_token_expires,
      last_activity: now.toISOString(),
      expires_at: expiresAt.toISOString(),
      ip_address: clientIp,
      user_agent: req.headers.get('user-agent') || 'unknown'
    };
    
    // Limpiar solo la sesión más reciente (más rápido)
    const oldSessions = await base44.asServiceRole.entities.UserSession.filter(
      { user_id: student.id },
      '-created_date',
      1
    );
    
    if (oldSessions.length > 0) {
      await base44.asServiceRole.entities.UserSession.delete(oldSessions[0].id);
    }
    
    await base44.asServiceRole.entities.UserSession.create(sessionData);
    
    // Log login exitoso
    await base44.functions.invoke('logSecurityEvent', {
      event_type: 'login_success',
      user_id: student.id,
      user_email: student.email,
      user_type: 'passenger',
      details: { student_id: student.student_id },
      severity: 'low',
      success: true
    });
    
    return Response.json({ 
      success: true,
      user: {
        id: student.id,
        full_name: student.full_name,
        email: student.email || `student_${student.student_id}@edp.edu`,
        phone: student.phone,
        student_id: student.student_id,
        housing_name: student.housing_name,
        role: 'user',
        user_type: 'passenger'
      },
      session_token: sessionToken,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      access_token_expires: tokens.access_token_expires
    }, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': req.headers.get('origin') || '*',
        'Access-Control-Allow-Credentials': 'true',
        'Content-Type': 'application/json',
        'Set-Cookie': `session_token=${sessionToken}; Path=/; Max-Age=${12*60*60}; HttpOnly; Secure; SameSite=Strict`,
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block'
      }
    });
  } catch (error) {
    console.error('[validateStudentLogin] Error:', error);
    return Response.json({ 
      success: false, 
      error: 'Error en el servidor' 
    }, { 
      status: 500,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  }
});