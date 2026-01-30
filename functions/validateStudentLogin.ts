import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { studentId } = await req.json();
    
    if (!studentId || studentId.length !== 4) {
      return Response.json({ 
        success: false, 
        error: 'ID de estudiante inválido' 
      }, { status: 400 });
    }
    
    // Fetch student from database
    const students = await base44.asServiceRole.entities.Student.filter({ 
      student_id: studentId.trim(),
      status: 'active'
    });
    
    if (students && students.length > 0) {
      const student = students[0];
      
      // Generate session token - short expiry for students
      const sessionToken = crypto.randomUUID();
      const sessionExpiry = Date.now() + (5 * 60 * 1000); // 5 minutes
      
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
          session_token: sessionToken,
          session_expiry: sessionExpiry,
          login_time: Date.now()
        }
      });
    } else {
      return Response.json({ 
        success: false, 
        error: 'Estudiante no encontrado o inactivo' 
      }, { status: 404 });
    }
  } catch (error) {
    return Response.json({ 
      success: false, 
      error: 'Error al validar estudiante' 
    }, { status: 500 });
  }
});