import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get unread notifications for the current user
    const notifications = await base44.entities.UserNotification.filter(
      { 
        user_id: user.id,
        read: false 
      },
      '-created_date',
      50
    );

    return Response.json({ 
      success: true, 
      notifications 
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});