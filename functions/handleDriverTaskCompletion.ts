import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user || user.user_type !== 'driver') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { task_type, task_description, is_critical = false, data = {} } = await req.json();

    if (!task_type || !task_description) {
      return Response.json({ error: 'task_type and task_description are required' }, { status: 400 });
    }

    // Get all admin users
    const adminUsers = await base44.asServiceRole.entities.User.filter({ role: 'admin' });

    if (adminUsers.length === 0) {
      return Response.json({ error: 'No admin users found' }, { status: 404 });
    }

    // Create notifications for all admins (only if critical or specified)
    if (is_critical) {
      const notifications = adminUsers.map(admin => ({
        type: 'task_completed',
        title: `Tarea Completada - ${user.full_name || user.email}`,
        message: `${task_type}: ${task_description}`,
        driver_id: user.driver_id || user.id,
        driver_name: user.full_name || user.email,
        data: {
          task_type,
          task_description,
          driver_id: user.driver_id || user.id,
          driver_name: user.full_name || user.email,
          is_critical,
          ...data
        },
        created_by: admin.email,
        priority: is_critical ? 'high' : 'medium',
        read: false
      }));

      await base44.asServiceRole.entities.Notification.bulkCreate(notifications);

      return Response.json({ 
        success: true,
        message: 'Notificación enviada a los administradores',
        notifications_sent: notifications.length
      });
    }

    return Response.json({ 
      success: true,
      message: 'Tarea registrada (no crítica, sin notificación)',
      notifications_sent: 0
    });

  } catch (error) {
    console.error('Task completion notification error:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});