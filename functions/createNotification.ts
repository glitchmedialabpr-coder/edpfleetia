import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { driver_id, type, title, message, data, priority = 'medium' } = await req.json();

    if (!driver_id || !type || !title || !message) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get driver notification settings
    const settings = await base44.asServiceRole.entities.DriverNotificationSettings.filter({
      driver_id
    });

    const driverSettings = settings?.[0];
    let shouldNotify = true;

    // Check if notification type is enabled
    if (driverSettings) {
      if (type === 'new_request' && !driverSettings.new_request_enabled) {
        shouldNotify = false;
      } else if (type === 'status_change' && !driverSettings.status_change_enabled) {
        shouldNotify = false;
      } else if (type === 'admin_message' && !driverSettings.admin_message_enabled) {
        shouldNotify = false;
      }
    }

    if (!shouldNotify) {
      return Response.json({ success: true, skipped: true });
    }

    // Create notification record
    const notification = await base44.asServiceRole.entities.Notification.create({
      driver_id,
      type,
      title,
      message,
      data: data || {},
      priority,
      read: false
    });

    return Response.json({
      success: true,
      notification_id: notification.id,
      settings: driverSettings
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});