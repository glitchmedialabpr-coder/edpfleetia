import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { notification_id } = body;

    if (!notification_id) {
      return Response.json({ error: 'Missing notification_id' }, { status: 400 });
    }

    // Update notification to mark as read
    const notification = await base44.entities.UserNotification.update(
      notification_id,
      { 
        read: true,
        read_at: new Date().toISOString()
      }
    );

    return Response.json({ 
      success: true, 
      notification 
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});