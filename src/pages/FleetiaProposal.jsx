import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Shield, Truck, Users, ClipboardList, BarChart3, Zap, Lock, Bell, FileText, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';

export default function FleetiaProposal() {
  const navigate = useNavigate();
  const [expandedSection, setExpandedSection] = useState(null);

  const sections = [
    {
      id: 'admin',
      title: 'Portal Administrador',
      icon: Shield,
      color: 'from-blue-600 to-blue-700',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      description: 'Centro de control integral del sistema de transporte y flota',
      features: [
        {
          title: 'Gestión de Conductores',
          description: 'Crear, editar y monitorear perfiles completos de conductores. Incluye datos personales, licencias, documentos, horarios semanales y estado laboral.'
        },
        {
          title: 'Control de Vehículos',
          description: 'Administrar toda la flota con detalles técnicos, capacidad, estado, seguros, registros de documentos y asignación a conductores.'
        },
        {
          title: 'Asignación de Horarios',
          description: 'Definir y gestionar horarios semanales para conductores con control granular de días y horas de trabajo.'
        },
        {
          title: 'Mantenimiento Preventivo',
          description: 'Registrar servicios realizados, costos, próximas fechas de mantenimiento por kilometraje y gestionar proveedores.'
        },
        {
          title: 'Monitoreo en Vivo',
          description: 'Ver en tiempo real la ubicación y estado de todos los viajes activos con información del conductor y estudiantes.'
        },
        {
          title: 'Reportes de Accidentes',
          description: 'Documentar incidentes con detalles de daños, costos estimados, seguros y notas para análisis de seguridad.'
        },
        {
          title: 'Gestión de Combustible',
          description: 'Registrar carga de combustible, monitorear consumo por vehículo y analizar eficiencia operativa.'
        },
        {
          title: 'Compras y Gastos',
          description: 'Registrar todas las compras de repuestos, materiales y servicios con categorización y vinculación a vehículos.'
        },
        {
          title: 'Reportes Consolidados',
          description: 'Generar reportes detallados de viajes, gastos, mantenimiento, accidentes y desempeño operativo con exportación a PDF.'
        },
        {
          title: 'Advertencias a Conductores',
          description: 'Emitir advertencias verbales, escritas o finales con documentación y seguimiento de disciplina.'
        },
        {
          title: 'Gestión de Estudiantes',
          description: 'Administrar datos de estudiantes, asignación de hospedajes y asociación con solicitudes de transporte.'
        },
        {
          title: 'Servicios Generales',
          description: 'Crear y gestionar trabajos de mantenimiento, reparación, limpieza y construcción con asignación de personal.'
        },
        {
          title: 'Centro de Notificaciones',
          description: 'Configurar notificaciones personalizadas, horarios de envío y preferencias para diferentes eventos del sistema.'
        }
      ]
    },
    {
      id: 'driver',
      title: 'Portal Conductor',
      icon: Truck,
      color: 'from-teal-600 to-teal-700',
      bgColor: 'bg-teal-50 dark:bg-teal-950/20',
      borderColor: 'border-teal-200 dark:border-teal-800',
      description: 'Interfaz simplificada para conductores realizar sus labores diarias',
      features: [
        {
          title: 'Dashboard de Actividad',
          description: 'Vista general de estadísticas diarias: viajes completados, estudiantes transportados, horas trabajadas y calificación de desempeño.'
        },
        {
          title: 'Recepción de Solicitudes',
          description: 'Recibir notificaciones de nuevas solicitudes de viaje con detalles de estudiante, destino y horario.'
        },
        {
          title: 'Aceptar/Rechazar Viajes',
          description: 'Responder solicitudes de transporte en tiempo real con asignación automática de vehículo y visualización de ruta.'
        },
        {
          title: 'Viajes en Curso',
          description: 'Visualizar viajes activos con lista de estudiantes a recoger, destinos, direcciones y seguimiento de entregas.'
        },
        {
          title: 'Historial de Viajes',
          description: 'Acceso a todo el registro histórico de viajes realizados con detalles de duración, distancia y estudiantes transportados.'
        },
        {
          title: 'Notificaciones en Vivo',
          description: 'Recibir alertas de nuevas solicitudes, cambios de horario, mensajes administrativos y recordatorios de documentos vencidos.'
        },
        {
          title: 'Gestión de Documentos',
          description: 'Subir y actualizar documentos requeridos como licencia, certificados médicos, seguros y certificados de capacitación.'
        },
        {
          title: 'Reporte Diario',
          description: 'Enviar resumen diario de trabajo realizado con notas, fotos y detalles de viajes completados.'
        }
      ]
    },
    {
      id: 'student',
      title: 'Portal Estudiante',
      icon: Users,
      color: 'from-purple-600 to-purple-700',
      bgColor: 'bg-purple-50 dark:bg-purple-950/20',
      borderColor: 'border-purple-200 dark:border-purple-800',
      description: 'Plataforma accesible para solicitar y rastrear transporte',
      features: [
        {
          title: 'Solicitud de Viaje',
          description: 'Crear solicitudes especificando origen (universidad), destino, tipo de destino (hospedaje, farmacia, hospital, etc.) y número de estudiantes.'
        },
        {
          title: 'Asignación Automática',
          description: 'Recibir notificación inmediata con detalles del conductor asignado, vehículo, placa y contacto de emergencia.'
        },
        {
          title: 'Rastreo en Tiempo Real',
          description: 'Ver ubicación actual del conductor en mapa interactivo mientras se dirige al punto de recogida y durante el viaje.'
        },
        {
          title: 'Detalles del Viaje',
          description: 'Visualizar información completa del viaje: horario estimado, distancia, conductor asignado y estado de entrega.'
        },
        {
          title: 'Historial de Viajes',
          description: 'Acceso a registro completo de todos los viajes solicitados con detalles históricos y confirmaciones de entrega.'
        },
        {
          title: 'Notificaciones',
          description: 'Recibir alertas cuando el conductor está en camino, ha llegado, inicia el viaje y completa la entrega.'
        }
      ]
    },
    {
      id: 'complaints',
      title: 'Portal de Solicitudes Estructurales',
      icon: ClipboardList,
      color: 'from-orange-600 to-orange-700',
      bgColor: 'bg-orange-50 dark:bg-orange-950/20',
      borderColor: 'border-orange-200 dark:border-orange-800',
      description: 'Sistema de reporte anónimo y confidencial para solicitudes y reportes',
      features: [
        {
          title: 'Formulario Estructurado',
          description: 'Interfaz clara y organizada para reportar problemas con categorías predefinidas: mantenimiento, seguridad, servicios, etc.'
        },
        {
          title: 'Solicitudes Anónimas',
          description: 'Opción de reportar de forma anónima garantizando confidencialidad y protección de identidad del reportante.'
        },
        {
          title: 'Envío de Documentación',
          description: 'Adjuntar fotos, videos y archivos para soportar y documentar cada solicitud reportada.'
        },
        {
          title: 'Seguimiento de Estado',
          description: 'Ver estado actualizado de solicitudes: recibida, en análisis, en proceso, resuelta o cerrada.'
        },
        {
          title: 'Historial Completo',
          description: 'Acceso a todas las solicitudes históricas con detalles, respuestas y resoluciones implementadas.'
        },
        {
          title: 'Notificaciones de Progreso',
          description: 'Recibir notificaciones cuando la solicitud cambia de estado o cuando se implementan las soluciones.'
        }
      ]
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-12">
      {/* Header with Back Button */}
      <div className="max-w-6xl mx-auto px-4 mb-8">
        <Button
          variant="outline"
          onClick={() => navigate(createPageUrl('Settings'))}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a Configuración
        </Button>
      </div>

      {/* Header */}
      <div className="max-w-6xl mx-auto px-4 mb-12">
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto mb-6">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6962e1b8eae90299f24a170a/a12aa5730_Addaheading.jpg" 
              alt="Fleetia"
              className="w-full h-full object-cover rounded-2xl"
            />
          </div>
          <h1 className="text-5xl font-bold text-slate-900 dark:text-white mb-4">Fleetia</h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-2">Plataforma Integral de Gestión de Transporte y Flota</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Diseñada por Glitch Media Lab | © 2026</p>
        </div>

        {/* Overview Card */}
        <Card className="p-8 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 mb-12">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <Zap className="w-12 h-12 text-blue-600 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800 dark:text-white mb-2">Eficiencia</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Optimiza operaciones y reduce costos operativos</p>
            </div>
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800 dark:text-white mb-2">Visibilidad</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Monitoreo en tiempo real de toda la flota</p>
            </div>
            <div className="text-center">
              <Lock className="w-12 h-12 text-purple-600 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800 dark:text-white mb-2">Seguridad</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Gestión segura y cumplimiento normativo</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Portals Section */}
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {sections.map((section) => {
            const Icon = section.icon;
            const isExpanded = expandedSection === section.id;

            return (
              <motion.div key={section.id} variants={itemVariants}>
                <Card className={`${section.bgColor} ${section.borderColor} overflow-hidden transition-all duration-300`}>
                  <button
                    onClick={() => setExpandedSection(isExpanded ? null : section.id)}
                    className="w-full p-6 flex items-start justify-between hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-start gap-4 flex-1 text-left">
                      <div className={`p-3 rounded-lg bg-gradient-to-br ${section.color} text-white flex-shrink-0`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{section.title}</h2>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{section.description}</p>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-6 h-6 text-slate-600 dark:text-slate-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-6 h-6 text-slate-600 dark:text-slate-400 flex-shrink-0" />
                    )}
                  </button>

                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-current border-opacity-20"
                    >
                      <div className="p-6 bg-black/2 dark:bg-white/2">
                        <div className="grid md:grid-cols-2 gap-6">
                          {section.features.map((feature, idx) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              className="bg-white dark:bg-slate-700/50 rounded-lg p-4 border border-current border-opacity-10"
                            >
                              <h3 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                                <span className={`inline-block w-2 h-2 rounded-full bg-gradient-to-r ${section.color}`}></span>
                                {feature.title}
                              </h3>
                              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                {feature.description}
                              </p>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Footer Section */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="mt-12 p-8 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-center"
        >
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Beneficios Clave</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-semibold text-blue-600 dark:text-blue-400">Automatización</span>
              <p className="text-slate-600 dark:text-slate-400 mt-1">Reducción de tareas manuales</p>
            </div>
            <div>
              <span className="font-semibold text-green-600 dark:text-green-400">Reportes</span>
              <p className="text-slate-600 dark:text-slate-400 mt-1">Análisis detallado en tiempo real</p>
            </div>
            <div>
              <span className="font-semibold text-purple-600 dark:text-purple-400">Accesibilidad</span>
              <p className="text-slate-600 dark:text-slate-400 mt-1">Múltiples portales para diferentes roles</p>
            </div>
            <div>
              <span className="font-semibold text-orange-600 dark:text-orange-400">Escalabilidad</span>
              <p className="text-slate-600 dark:text-slate-400 mt-1">Crece con tus necesidades</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}