import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Cache de estudiantes
const studentCache = new Map();
const CACHE_TTL = 60 * 60 * 1000; // 1 hora
let lastCacheLoad = 0;

// Rate limiting
const studentAttempts = new Map();
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 10 * 60 * 1000; // 10 minutos

function checkStudentAttempts(studentId) {
  const now = Date.now();
  const attempts = studentAttempts.get(studentId);
  
  if (!attempts) {
    studentAttempts.set(studentId, { count: 1, firstAttempt: now, lockedUntil: null });
    return { allowed: true };
  }
  
  if (attempts.lockedUntil && now < attempts.lockedUntil) {
    const remainingMinutes = Math.ceil((attempts.lockedUntil - now) / 60000);
    return { 
      allowed: false, 
      message: `Bloqueado. Intenta en ${remainingMinutes} minutos.` 
    };
  }
  
  if (attempts.lockedUntil && now >= attempts.lockedUntil) {
    studentAttempts.set(studentId, { count: 1, firstAttempt: now, lockedUntil: null });
    return { allowed: true };
  }
  
  attempts.count++;
  
  if (attempts.count >= MAX_ATTEMPTS) {
    attempts.lockedUntil = now + LOCKOUT_TIME;
    return { 
      allowed: false, 
      message: `Demasiados intentos. Bloqueado por 10 minutos.` 
    };
  }
  
  return { allowed: true };
}

function resetStudentAttempts(studentId) {
  studentAttempts.delete(studentId);
}

async function loadStudentCache(base44) {
  const now = Date.now();
  
  // Solo recargar si pasó más de 1 hora o si el cache está vacío
  if (studentCache.size === 0 || now - lastCacheLoad > CACHE_TTL) {
    try {
      const students = await base44.asServiceRole.entities.Student.filter({ 
        status: 'active'
      }, '', 500);
      
      studentCache.clear();
      
      if (students?.length) {
        students.forEach(student => {
          studentCache.set(student.student_id, student);
        });
      }
      
      lastCacheLoad = now;
    } catch (error) {
      console.error('[Cache] Error loading students:', error);
    }
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { studentId } = await req.json();
    
    // Validación
    if (!studentId || typeof studentId !== 'string' || studentId.length !== 4) {
      return Response.json({ success: false, error: 'ID inválido' }, { status: 400 });
    }
    
    // Sanitizar input
    const sanitizedId = studentId.trim().replace(/[^0-9]/g, '').slice(0, 4);
    
    if (sanitizedId.length !== 4) {
      return Response.json({ success: false, error: 'ID inválido' }, { status: 400 });
    }
    
    // Rate limiting
    const attemptCheck = checkStudentAttempts(sanitizedId);
    if (!attemptCheck.allowed) {
      return Response.json({ 
        success: false, 
        error: attemptCheck.message 
      }, { status: 429 });
    }
    
    // Cargar cache
    await loadStudentCache(base44);
    
    // Buscar en cache primero
    const student = studentCache.get(sanitizedId);
    
    if (!student) {
      return Response.json({ success: false, error: 'No encontrado' }, { status: 404 });
    }
    
    // Login exitoso
    resetStudentAttempts(sanitizedId);
    
    const student = students[0];
    return Response.json({ 
      success: true,
      user: {
        id: student.id,
        email: student.email || `student_${student.student_id}@edp.edu`,
        full_name: student.full_name,
        phone: student.phone,
        role: 'user',
        user_type: 'passenger',
        student_id: student.student_id,
        housing_name: student.housing_name,
        session_expiry: Date.now() + (5 * 60 * 1000),
        login_time: Date.now()
      }
    }, {
      headers: {
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
    }, { status: 500 });
  }
});