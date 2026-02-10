import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';

const slides = [
  {
    title: 'FLEETIA',
    subtitle: 'Gestión Integral de Flota y Transporte',
    footer: 'Por Glitch Media Lab',
    bg: 'from-slate-900 to-slate-800',
    textColor: 'text-white',
    type: 'cover'
  },
  {
    title: 'Acerca de Fleetia',
    content: [
      'La plataforma integral diseñada para administrar todos los aspectos de operaciones de transporte y flota.',
      'Características Principales:',
      '• Eficiencia: Optimiza rutas y reduce costos operativos',
      '• Visibilidad: Monitoreo en tiempo real de todas las operaciones',
      '• Seguridad: Control y reportes de incidentes y mantenimiento',
      '• Datos: Reportes detallados y análisis completo'
    ],
    type: 'content'
  },
  {
    title: 'Portal Administrador',
    subtitle: 'Control total del sistema',
    content: [
      '• Gestión de conductores y datos completos',
      '• Asignación de horarios semanales',
      '• Control y gestión de vehículos',
      '• Registro de mantenimiento preventivo',
      '• Reportes de accidentes e incidentes',
      '• Monitoreo en vivo de viajes',
      '• Gestión de combustible y costos',
      '• Reportes consolidados y análisis',
      '• Sistema de advertencias a conductores',
      '• Gestión de estudiantes y hospedajes',
      '• Trabajos de servicio general',
      '• Centro de notificaciones y alertas'
    ],
    type: 'content'
  },
  {
    title: 'Portal Conductor',
    subtitle: 'Gestión de viajes y solicitudes',
    content: [
      '• Dashboard de actividad diaria',
      '• Recepción de solicitudes en tiempo real',
      '• Aceptar o rechazar viajes inmediatamente',
      '• Historial completo de viajes realizados',
      '• Notificaciones y alertas en vivo',
      '• Perfil del conductor y gestión de documentos'
    ],
    type: 'content'
  },
  {
    title: 'Portal Estudiante',
    subtitle: 'Solicitud de transporte',
    content: [
      '• Solicitar viaje con destino específico',
      '• Ver asignación de conductor en tiempo real',
      '• Rastrear viaje durante la ejecución',
      '• Historial de viajes realizados'
    ],
    type: 'content'
  },
  {
    title: 'Portal Solicitudes',
    subtitle: 'Formulario de peticiones',
    content: [
      '• Formulario estructurado para peticiones',
      '• Opción de envío anónimo o identificado',
      '• Seguimiento de estado de solicitudes',
      '• Historial completo de peticiones'
    ],
    type: 'content'
  },
  {
    title: '¿Por Qué Elegir Fleetia?',
    content: [
      'Solución Multiusuario Integral: Diseñado para todos los usuarios con portales optimizados para cada necesidad.',
      'Operaciones Completas: Gestión de flota hasta servicio al cliente en una plataforma centralizada.',
      'Tiempo Real: Monitoreo en vivo, notificaciones instantáneas y actualización de datos.',
      'Inteligencia de Datos: Reportes detallados, análisis de costos y métricas de desempeño.'
    ],
    type: 'content'
  },
  {
    title: 'Beneficios Clave',
    content: [
      '✓ Reducción de costos operacionales',
      '✓ Mayor visibilidad y control en tiempo real',
      '✓ Mejora en comunicación organizacional',
      '✓ Seguimiento completo de seguridad vehicular',
      '✓ Automatización de procesos administrativos',
      '✓ Mejor experiencia para estudiantes',
      '✓ Reportes detallados para decisiones',
      '✓ Sistema centralizado y escalable',
      '✓ Interfaz intuitiva para todos',
      '✓ Soporte integral de operaciones'
    ],
    type: 'content'
  },
  {
    title: 'Transforma tu Operación',
    subtitle: 'Con Fleetia, la gestión de flota y transporte es más eficiente, segura y rentable',
    footer: 'FLEETIA by Glitch Media Lab',
    bg: 'from-slate-900 to-slate-800',
    textColor: 'text-white',
    type: 'cover'
  }
];

export default function FleetiaPresentation() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  const slide = slides[currentSlide];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 p-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Presentación Fleetia</h1>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate(createPageUrl('Settings'))}
          >
            <Home className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </div>

        {/* Main Slide */}
        {slide.type === 'cover' ? (
          <div className={`bg-gradient-to-br ${slide.bg} rounded-2xl p-12 mb-6 h-96 flex flex-col items-center justify-center text-center`}>
            <h2 className={`text-5xl font-bold ${slide.textColor} mb-4`}>{slide.title}</h2>
            {slide.subtitle && (
              <p className={`text-2xl ${slide.textColor === 'text-white' ? 'text-teal-400' : 'text-teal-600'} mb-8`}>
                {slide.subtitle}
              </p>
            )}
            {slide.footer && (
              <p className={`text-slate-400 mt-auto`}>{slide.footer}</p>
            )}
          </div>
        ) : (
          <Card className="p-12 mb-6 h-96 overflow-y-auto bg-white dark:bg-slate-800">
            <h2 className="text-4xl font-bold text-slate-800 dark:text-white mb-4">{slide.title}</h2>
            {slide.subtitle && (
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-6">{slide.subtitle}</p>
            )}
            <div className="space-y-2">
              {slide.content.map((line, idx) => (
                <p key={idx} className={`${line.startsWith('•') || line.startsWith('✓') ? 'text-slate-700 dark:text-slate-300' : line.includes(':') ? 'font-semibold text-slate-800 dark:text-white mt-4' : 'text-slate-600 dark:text-slate-400'}`}>
                  {line}
                </p>
              ))}
            </div>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentSlide === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>

          <div className="flex items-center gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentSlide
                    ? 'bg-teal-600 w-8'
                    : 'bg-slate-300 dark:bg-slate-600 w-2 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>

          <Button
            variant="outline"
            onClick={handleNext}
            disabled={currentSlide === slides.length - 1}
          >
            Siguiente
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Slide Counter */}
        <div className="text-center mt-6 text-slate-600 dark:text-slate-400">
          Diapositiva {currentSlide + 1} de {slides.length}
        </div>
      </div>
    </div>
  );
}