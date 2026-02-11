import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event, data, old_data } = await req.json();

    // Validate event data
    if (!event || !data) {
      return Response.json({ error: 'Invalid event data' }, { status: 400 });
    }

    const notifications = [];

    // Handle different event types
    if (event.type === 'create') {
      // New trip request created
      if (data.driver_id && data.driver_name) {
        // Notify assigned driver
        notifications.push({
          type: 'new_trip_request',
          title: 'Nueva Solicitud de Viaje',
          message: `Tienes una nueva solicitud de viaje desde ${data.origin || 'EDP University'} hasta ${data.destination}. Pasajero: ${data.passenger_name}`,
          driver_id: data.driver_id,
          driver_name: data.driver_name,
          data: {
            trip_request_id: data.id,
            passenger_name: data.passenger_name,
            origin: data.origin,
            destination: data.destination,
            pickup_time: data.pickup_time
          },
          priority: 'high'
        });
      }

      // Notify admins of new request
      const adminUsers = await base44.asServiceRole.entities.User.filter({ role: 'admin' });
      for (const admin of adminUsers) {
        notifications.push({
          type: 'new_trip_request',
          title: 'Nueva Solicitud de Viaje',
          message: `Nueva solicitud de ${data.passenger_name} hacia ${data.destination}`,
          data: {
            trip_request_id: data.id,
            passenger_name: data.passenger_name,
            destination: data.destination,
            status: data.status
          },
          created_by: admin.email,
          priority: 'medium'
        });
      }
    } 
    else if (event.type === 'update') {
      // Trip request updated
      const statusChanged = old_data && old_data.status !== data.status;
      
      if (statusChanged) {
        // Notify driver if status changed
        if (data.driver_id && data.driver_name) {
          let message = '';
          if (data.status === 'cancelled') {
            message = `La solicitud de viaje de ${data.passenger_name} ha sido cancelada.`;
          } else if (data.status === 'rejected') {
            message = `La solicitud de viaje de ${data.passenger_name} fue rechazada.`;
          } else if (data.status === 'completed') {
            message = `Viaje con ${data.passenger_name} completado exitosamente.`;
          } else if (data.status === 'accepted') {
            message = `Has aceptado el viaje de ${data.passenger_name}.`;
          } else if (data.status === 'in_trip') {
            message = `Viaje con ${data.passenger_name} en progreso.`;
          }

          if (message) {
            notifications.push({
              type: 'status_change',
              title: 'Actualización de Viaje',
              message: message,
              driver_id: data.driver_id,
              driver_name: data.driver_name,
              data: {
                trip_request_id: data.id,
                old_status: old_data.status,
                new_status: data.status,
                passenger_name: data.passenger_name
              },
              priority: data.status === 'cancelled' ? 'high' : 'medium'
            });
          }
        }

        // Notify admins of status changes
        if (['cancelled', 'rejected', 'completed'].includes(data.status)) {
          const adminUsers = await base44.asServiceRole.entities.User.filter({ role: 'admin' });
          for (const admin of adminUsers) {
            notifications.push({
              type: 'status_change',
              title: 'Cambio de Estado de Viaje',
              message: `Viaje de ${data.passenger_name}: ${old_data.status} → ${data.status}`,
              data: {
                trip_request_id: data.id,
                old_status: old_data.status,
                new_status: data.status,
                driver_name: data.driver_name
              },
              created_by: admin.email,
              priority: 'medium'
            });
          }
        }
      }

      // Check if driver was reassigned
      const driverChanged = old_data && old_data.driver_id !== data.driver_id;
      if (driverChanged && data.driver_id) {
        notifications.push({
          type: 'new_trip_request',
          title: 'Viaje Reasignado',
          message: `Se te ha asignado un nuevo viaje de ${data.passenger_name} hacia ${data.destination}`,
          driver_id: data.driver_id,
          driver_name: data.driver_name,
          data: {
            trip_request_id: data.id,
            passenger_name: data.passenger_name,
            destination: data.destination
          },
          priority: 'high'
        });
      }
    }
    else if (event.type === 'delete') {
      // Trip request deleted
      if (data.driver_id && data.driver_name) {
        notifications.push({
          type: 'trip_deleted',
          title: 'Solicitud Eliminada',
          message: `La solicitud de viaje de ${data.passenger_name} ha sido eliminada del sistema.`,
          driver_id: data.driver_id,
          driver_name: data.driver_name,
          data: {
            passenger_name: data.passenger_name,
            destination: data.destination
          },
          priority: 'medium'
        });
      }
    }

    // Create all notifications
    if (notifications.length > 0) {
      await base44.asServiceRole.entities.Notification.bulkCreate(notifications);
    }

    return Response.json({ 
      success: true, 
      notifications_created: notifications.length 
    });

  } catch (error) {
    console.error('Notification error:', error);
    return Response.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
});