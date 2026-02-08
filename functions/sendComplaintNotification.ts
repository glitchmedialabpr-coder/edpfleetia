import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const EMAIL_TEMPLATES = {
  newComplaint: {
    subject: (data) => `Nueva Queja Registrada: ${data.complaint_title}`,
    html: (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: white; padding: 20px; border-left: 4px solid #7c3aed; margin: 20px 0; border-radius: 5px; }
          .label { font-weight: bold; color: #7c3aed; margin-bottom: 5px; }
          .value { color: #333; margin-bottom: 15px; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
          .badge { display: inline-block; padding: 5px 15px; background: #fbbf24; color: #78350f; border-radius: 20px; font-size: 12px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">🔔 Nueva Queja Registrada</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Sistema de Quejas - Fleetia</p>
          </div>
          <div class="content">
            <div class="info-box">
              <div class="label">Título de la Queja:</div>
              <div class="value" style="font-size: 18px; font-weight: bold;">${data.complaint_title}</div>
              
              <div class="label">Empleado:</div>
              <div class="value">${data.employee_name}</div>
              
              <div class="label">Correo del Empleado:</div>
              <div class="value">${data.employee_email}</div>
              
              <div class="label">Descripción:</div>
              <div class="value">${data.complaint_description}</div>
              
              <div class="label">Estado:</div>
              <div class="value"><span class="badge">PENDIENTE</span></div>
              
              <div class="label">Fecha de Registro:</div>
              <div class="value">${new Date(data.created_date).toLocaleString('es-ES', { 
                dateStyle: 'full', 
                timeStyle: 'short' 
              })}</div>
            </div>
            
            ${data.document_urls && data.document_urls.length > 0 ? `
              <div style="background: white; padding: 15px; border-radius: 5px; margin-top: 15px;">
                <div class="label">📎 Documentos Adjuntos (${data.document_urls.length}):</div>
                ${data.document_urls.map((url, i) => `
                  <div style="margin: 10px 0;">
                    <a href="${url}" style="color: #7c3aed; text-decoration: none;">
                      📄 Documento ${i + 1} - Ver/Descargar
                    </a>
                  </div>
                `).join('')}
              </div>
            ` : ''}
            
            <p style="margin-top: 25px; color: #6b7280; font-size: 14px;">
              Por favor, revisa esta queja en el panel de administración y actualiza su estado según corresponda.
            </p>
          </div>
          <div class="footer">
            <p>Este es un mensaje automático del Sistema de Quejas de Fleetia</p>
            <p>© ${new Date().getFullYear()} Fleetia by Glitch Media Lab</p>
          </div>
        </div>
      </body>
      </html>
    `
  },
  
  statusUpdate: {
    subject: (data) => `Actualización de tu Queja: ${data.complaint_title}`,
    html: (data) => {
      const statusInfo = {
        pendiente: { color: '#fbbf24', bg: '#fef3c7', label: 'Pendiente', icon: '⏳' },
        aceptada: { color: '#3b82f6', bg: '#dbeafe', label: 'Aceptada', icon: '✅' },
        en_proceso: { color: '#7c3aed', bg: '#ede9fe', label: 'En Proceso', icon: '🔄' },
        atendida: { color: '#10b981', bg: '#d1fae5', label: 'Atendida', icon: '✔️' }
      };
      const status = statusInfo[data.new_status] || statusInfo.pendiente;
      
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .status-badge { display: inline-block; padding: 10px 20px; background: ${status.bg}; color: ${status.color}; border-radius: 25px; font-size: 16px; font-weight: bold; margin: 20px 0; }
            .info-box { background: white; padding: 20px; border-left: 4px solid #7c3aed; margin: 20px 0; border-radius: 5px; }
            .label { font-weight: bold; color: #7c3aed; margin-bottom: 5px; }
            .value { color: #333; margin-bottom: 15px; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">📬 Actualización de tu Queja</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Sistema de Quejas - Fleetia</p>
            </div>
            <div class="content">
              <p style="font-size: 16px; margin-bottom: 20px;">
                Hola <strong>${data.employee_name}</strong>,
              </p>
              
              <p style="font-size: 16px;">
                Te informamos que el estado de tu queja ha sido actualizado:
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <div class="status-badge">
                  ${status.icon} ${status.label}
                </div>
              </div>
              
              <div class="info-box">
                <div class="label">Título de tu Queja:</div>
                <div class="value" style="font-size: 18px; font-weight: bold;">${data.complaint_title}</div>
                
                <div class="label">Descripción Original:</div>
                <div class="value">${data.complaint_description}</div>
                
                ${data.old_status ? `
                  <div class="label">Estado Anterior:</div>
                  <div class="value" style="text-decoration: line-through; opacity: 0.6;">
                    ${statusInfo[data.old_status]?.label || 'Desconocido'}
                  </div>
                ` : ''}
                
                <div class="label">Nuevo Estado:</div>
                <div class="value">
                  <span style="color: ${status.color}; font-weight: bold; font-size: 16px;">
                    ${status.label}
                  </span>
                </div>
                
                <div class="label">Fecha de Registro:</div>
                <div class="value">${new Date(data.created_date).toLocaleString('es-ES', { 
                  dateStyle: 'full', 
                  timeStyle: 'short' 
                })}</div>
              </div>
              
              <div style="background: ${status.bg}; padding: 15px; border-radius: 5px; margin-top: 20px; border-left: 4px solid ${status.color};">
                <p style="margin: 0; color: ${status.color};">
                  ${data.new_status === 'atendida' 
                    ? '✅ Tu queja ha sido atendida. Gracias por tu paciencia.' 
                    : data.new_status === 'en_proceso' 
                      ? '🔄 Tu queja está siendo procesada. Te mantendremos informado.' 
                      : data.new_status === 'aceptada'
                        ? '✅ Tu queja ha sido aceptada y será revisada pronto.'
                        : 'ℹ️ Tu queja ha sido registrada y está pendiente de revisión.'}
                </p>
              </div>
              
              <p style="margin-top: 25px; color: #6b7280; font-size: 14px;">
                Si tienes alguna pregunta o necesitas más información, no dudes en contactarnos.
              </p>
            </div>
            <div class="footer">
              <p>Este es un mensaje automático del Sistema de Quejas de Fleetia</p>
              <p>© ${new Date().getFullYear()} Fleetia by Glitch Media Lab</p>
            </div>
          </div>
        </body>
        </html>
      `;
    }
  }
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const payload = await req.json();
    
    // Handle entity automation payload
    let template = payload.template;
    let data = payload.data;
    
    // If called from entity automation
    if (payload.event) {
      const complaint = payload.data;
      
      if (payload.event.type === 'create') {
        template = 'newComplaint';
        data = complaint;
      } else if (payload.event.type === 'update') {
        template = 'statusUpdate';
        // Only send if status changed
        if (payload.old_data && payload.old_data.status !== complaint.status) {
          data = {
            ...complaint,
            old_status: payload.old_data.status,
            new_status: complaint.status
          };
        } else {
          // Status didn't change, skip notification
          return Response.json({ 
            success: true, 
            message: 'Status unchanged, no notification sent' 
          });
        }
      }
    }
    
    if (!template || !EMAIL_TEMPLATES[template]) {
      return Response.json({ error: 'Invalid template' }, { status: 400 });
    }
    
    const emailTemplate = EMAIL_TEMPLATES[template];
    const subject = emailTemplate.subject(data);
    const body = emailTemplate.html(data);
    
    let toEmail;
    if (template === 'newComplaint') {
      toEmail = Deno.env.get('ADMIN_NOTIFICATION_EMAIL');
      if (!toEmail) {
        return Response.json({ error: 'ADMIN_NOTIFICATION_EMAIL not configured' }, { status: 500 });
      }
    } else if (template === 'statusUpdate') {
      // For status updates, we don't send emails externally
      // Just log the notification for now
      return Response.json({ 
        success: true, 
        message: 'Status update notification logged (external email disabled)',
        employee_email: data.employee_email,
        status_change: `${data.old_status} -> ${data.new_status}`
      });
    }
    
    await base44.asServiceRole.integrations.Core.SendEmail({
      from_name: 'Fleetia - Sistema de Quejas',
      to: toEmail,
      subject: subject,
      body: body
    });
    
    return Response.json({ 
      success: true, 
      message: `Email sent to ${toEmail}`,
      template: template 
    });
    
  } catch (error) {
    console.error('Error sending notification:', error);
    return Response.json({ 
      error: error.message || 'Failed to send notification' 
    }, { status: 500 });
  }
});