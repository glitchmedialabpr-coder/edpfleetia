import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { studentId } = await req.json();
    
    if (!studentId || studentId.length !== 4) {
      return Response.json({ success: false, error: 'ID inválido' }, { status: 400 });
    }
    
    const students = await base44.asServiceRole.entities.Student.filter({ 
      student_id: studentId.trim(),
      status: 'active'
    }, '', 1);
    
    if (!students?.length) {
      return Response.json({ success: false, error: 'No encontrado' }, { status: 404 });
    }
    
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
    });
  } catch (error) {
    return Response.json({ success: false, error: 'Error' }, { status: 500 });
  }
});