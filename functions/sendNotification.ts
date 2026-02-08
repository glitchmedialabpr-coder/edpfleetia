import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Only admins can send notifications
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { user_id, type, title, message, data, priority } = body;

    if (!user_id || !type || !title || !message) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create notification in database
    const notification = await base44.asServiceRole.entities.UserNotification.create({
      user_id,
      user_email: user.email,
      type,
      title,
      message,
      data: data || {},
      priority: priority || 'medium',
      read: false
    });

    return Response.json({ 
      success: true, 
      notification 
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});