import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import jsPDF from 'npm:jspdf@4.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let yPosition = 15;

    // Helper functions
    const addTitle = (text) => {
      pdf.setFontSize(24);
      pdf.setTextColor(17, 24, 39);
      pdf.text(text, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 12;
    };

    const addSubtitle = (text) => {
      pdf.setFontSize(16);
      pdf.setTextColor(51, 65, 85);
      pdf.text(text, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;
    };

    const addHeading = (text) => {
      pdf.setFontSize(14);
      pdf.setTextColor(17, 24, 39);
      pdf.setFont(undefined, 'bold');
      pdf.text(text, 15, yPosition);
      yPosition += 8;
      pdf.setFont(undefined, 'normal');
    };

    const addText = (text) => {
      pdf.setFontSize(11);
      pdf.setTextColor(75, 85, 99);
      const lines = pdf.splitTextToSize(text, pageWidth - 30);
      pdf.text(lines, 15, yPosition);
      yPosition += lines.length * 5 + 2;
    };

    const addBullet = (text) => {
      pdf.setFontSize(10);
      pdf.setTextColor(75, 85, 99);
      const lines = pdf.splitTextToSize(text, pageWidth - 25);
      pdf.text('• ', 15, yPosition);
      pdf.text(lines, 20, yPosition);
      yPosition += lines.length * 5 + 2;
    };

    const checkNewPage = () => {
      if (yPosition > pageHeight - 15) {
        pdf.addPage();
        yPosition = 15;
      }
    };

    // Page 1: Cover
    pdf.setFillColor(15, 23, 42);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');
    
    yPosition = pageHeight / 3;
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(40);
    pdf.text('FLEETIA', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 15;
    pdf.setFontSize(18);
    pdf.setTextColor(20, 184, 166);
    pdf.text('Gestión Integral de Flota y Transporte', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 20;
    pdf.setFontSize(12);
    pdf.setTextColor(226, 232, 240);
    pdf.text('Por Glitch Media Lab', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition = pageHeight - 20;
    pdf.setFontSize(10);
    pdf.setTextColor(148, 163, 184);
    pdf.text('Febrero 2026', pageWidth / 2, yPosition, { align: 'center' });

    // Page 2: Introduction
    pdf.addPage();
    yPosition = 15;
    
    pdf.setTextColor(0, 0, 0);
    addTitle('Acerca de Fleetia');
    
    yPosition += 5;
    addText('Fleetia es la plataforma integral diseñada para administrar todos los aspectos de operaciones de transporte y flota. Proporciona una solución completa con cuatro portales especializados, cada uno optimizado para diferentes usuarios.');

    checkNewPage();
    yPosition += 5;

    addHeading('Características Principales');
    addBullet('Eficiencia: Optimiza rutas y reduce costos operativos');
    addBullet('Visibilidad: Monitoreo en tiempo real de todas las operaciones');
    addBullet('Seguridad: Control y reportes de incidentes y mantenimiento');
    addBullet('Datos: Reportes detallados y análisis completo');

    // Page 3: Admin Portal
    pdf.addPage();
    yPosition = 15;
    
    pdf.setTextColor(0, 0, 0);
    addTitle('Portal Administrador');
    
    yPosition += 5;
    addText('Control total del sistema con funcionalidades completas para la gestión operacional.');

    checkNewPage();
    yPosition += 5;

    addHeading('Funcionalidades Disponibles');
    addBullet('Gestión de conductores y datos completos');
    addBullet('Asignación de horarios semanales a conductores');
    addBullet('Control y gestión de vehículos');
    addBullet('Registro de mantenimiento preventivo');
    addBullet('Reportes de accidentes e incidentes');
    addBullet('Monitoreo en vivo de viajes');
    addBullet('Gestión de combustible y costos operacionales');
    addBullet('Reportes consolidados y análisis avanzado');
    addBullet('Sistema de advertencias a conductores');
    addBullet('Gestión de estudiantes y hospedajes');
    addBullet('Trabajos de servicio general');
    addBullet('Centro de notificaciones y alertas');

    // Page 4: Driver Portal
    pdf.addPage();
    yPosition = 15;
    
    pdf.setTextColor(0, 0, 0);
    addTitle('Portal Conductor');
    
    yPosition += 5;
    addText('Herramientas especializadas para que los conductores gestionen sus viajes y solicitudes de forma eficiente.');

    checkNewPage();
    yPosition += 5;

    addHeading('Funcionalidades Disponibles');
    addBullet('Dashboard de actividad diaria');
    addBullet('Recepción de solicitudes de viaje en tiempo real');
    addBullet('Aceptar o rechazar viajes inmediatamente');
    addBullet('Historial completo de viajes realizados');
    addBullet('Notificaciones y alertas en vivo');
    addBullet('Perfil del conductor y gestión de documentos');

    // Page 5: Student Portal
    pdf.addPage();
    yPosition = 15;
    
    pdf.setTextColor(0, 0, 0);
    addTitle('Portal Estudiante');
    
    yPosition += 5;
    addText('Interfaz simple e intuitiva para que los estudiantes soliciten transporte de forma rápida y segura.');

    checkNewPage();
    yPosition += 5;

    addHeading('Funcionalidades Disponibles');
    addBullet('Solicitar viaje con destino específico');
    addBullet('Ver asignación de conductor en tiempo real');
    addBullet('Rastrear viaje durante la ejecución');
    addBullet('Historial de viajes realizados');

    // Page 6: Complaints Portal
    pdf.addPage();
    yPosition = 15;
    
    pdf.setTextColor(0, 0, 0);
    addTitle('Portal Solicitudes');
    
    yPosition += 5;
    addText('Canal estructurado para que empleados envíen solicitudes, quejas y peticiones de forma segura y organizada.');

    checkNewPage();
    yPosition += 5;

    addHeading('Funcionalidades Disponibles');
    addBullet('Formulario estructurado para peticiones');
    addBullet('Opción de envío anónimo o identificado');
    addBullet('Seguimiento de estado de solicitudes');
    addBullet('Historial completo de peticiones');

    // Page 7: Why Choose Fleetia
    pdf.addPage();
    yPosition = 15;
    
    pdf.setTextColor(0, 0, 0);
    addTitle('¿Por Qué Elegir Fleetia?');

    checkNewPage();
    yPosition += 5;

    addHeading('Solución Multiusuario Integral');
    addText('Diseñado para todos: administradores, conductores, estudiantes y empleados. Cada portal está optimizado para las necesidades específicas de sus usuarios, garantizando una experiencia óptima.');

    checkNewPage();
    addHeading('Operaciones Completas');
    addText('Desde la gestión de flota hasta el servicio al cliente, todo funciona en una plataforma centralizada, eliminando la necesidad de múltiples herramientas.');

    checkNewPage();
    addHeading('Tiempo Real');
    addText('Monitoreo en vivo, notificaciones instantáneas y actualización de datos en tiempo real para tomar decisiones informadas al instante.');

    checkNewPage();
    addHeading('Inteligencia de Datos');
    addText('Reportes detallados, análisis de costos y métricas de desempeño que permiten optimizar operaciones y maximizar rentabilidad.');

    // Page 8: Benefits Summary
    pdf.addPage();
    yPosition = 15;
    
    pdf.setTextColor(0, 0, 0);
    addTitle('Beneficios Clave');

    checkNewPage();
    yPosition += 5;

    addBullet('Reducción de costos operacionales mediante optimización de rutas');
    addBullet('Mayor visibilidad y control de operaciones en tiempo real');
    addBullet('Mejora en la comunicación entre administración y conductores');
    addBullet('Seguimiento completo de seguridad vehicular e incidentes');
    addBullet('Automatización de procesos administrativos');
    addBullet('Mejor experiencia para estudiantes y pasajeros');
    addBullet('Reportes detallados para toma de decisiones');
    addBullet('Sistema centralizado y escalable');
    addBullet('Interfaz intuitiva para todos los usuarios');
    addBullet('Soporte integral de operaciones');

    // Page 9: Closing
    pdf.addPage();
    yPosition = pageHeight / 3;
    
    pdf.setFillColor(15, 23, 42);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(28);
    pdf.text('Transforma tu Operación', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 15;
    pdf.setFontSize(14);
    pdf.setTextColor(20, 184, 166);
    pdf.text('Con Fleetia, la gestión de flota y transporte', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 7;
    pdf.text('es más eficiente, segura y rentable', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition = pageHeight - 30;
    pdf.setFontSize(12);
    pdf.setTextColor(226, 232, 240);
    pdf.text('FLEETIA by Glitch Media Lab', pageWidth / 2, yPosition, { align: 'center' });

    const pdfBytes = pdf.output('arraybuffer');

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=Fleetia_Presentacion.pdf'
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});