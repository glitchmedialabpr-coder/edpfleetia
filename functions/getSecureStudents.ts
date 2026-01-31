Deno.serve(async (req) => {
  try {
    const { createClientFromRequest } = await import('npm:@base44/sdk@0.8.6');
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Admin: get all students
    if (user.role === 'admin') {
      const students = await base44.asServiceRole.entities.Student.list('-created_date');
      return Response.json({ students });
    }

    // Passenger: only own data
    if (user.user_type === 'passenger' && user.student_id) {
      const students = await base44.asServiceRole.entities.Student.filter({ 
        student_id: user.student_id 
      }, '', 1);
      return Response.json({ students: students || [] });
    }

    // Non-admin: forbidden
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  } catch (error) {
    return Response.json({ error: 'Error' }, { status: 500 });
  }
});