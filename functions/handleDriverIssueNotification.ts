import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user || user.user_type !== 'driver') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { issue_type, description, priority = 'medium', data = {} } = await req.json();

    if (!issue_type || !description) {
      return Response.json({ error: 'issue_type and description are required' }, { status: 400 });
    }

    // Get all admin users
    const adminUsers = await base44.asServiceRole.entities.User.filter({ role: 'admin' });

    if (adminUsers.length === 0) {
      return Response.json({ error: 'No admin users found' }, { status: 404 });
    }

    // Create notifications for all admins
    const notifications = adminUsers.map(admin => ({
      type: 'driver_issue',
      title: `Reporte de ${user.full_name || user.email}`,
      message: `${issue_type}: ${description}`,
      driver_id: user.driver_id || user.id,
      driver_name: user.full_name || user.email,
      data: {
        issue_type,
        description,
        driver_id: user.driver_id || user.id,
        driver_name: user.full_name || user.email,
        ...data
      },
      created_by: admin.email,
      priority: priority,
      read: false
    }));

    await base44.asServiceRole.entities.Notification.bulkCreate(notifications);

    return Response.json({ 
      success: true,
      message: 'Reporte enviado a los administradores',
      notifications_sent: notifications.length
    });

  } catch (error) {
    console.error('Driver issue notification error:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});