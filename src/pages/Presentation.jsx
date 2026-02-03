import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { 
  Bus, 
  Users, 
  GraduationCap, 
  Car,
  Shield,
  Clock,
  CheckCircle2,
  TrendingUp,
  Bell,
  BarChart3,
  Smartphone,
  MapPin,
  ChevronRight,
  Star,
  Zap,
  FileText,
  Calendar,
  Settings,
  Target,
  Play,
  ArrowRight,
  Wrench,
  DollarSign,
  AlertTriangle,
  History,
  FileBarChart,
  Palette,
  Laptop,
  Database,
  Lock,
  Globe
} from 'lucide-react';

export default function Presentation() {
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    { id: 'overview', label: 'Visión General', icon: Target },
    { id: 'features', label: 'Características', icon: Star },
    { id: 'modules', label: 'Módulos', icon: Settings },
    { id: 'users', label: 'Usuarios', icon: Users },
    { id: 'benefits', label: 'Beneficios', icon: TrendingUp },
    { id: 'tech', label: 'Tecnología', icon: Database },
    { id: 'demo', label: 'Demo', icon: Play },
  ];

  const features = [
    {
      icon: Bus,
      title: 'Gestión de Viajes',
      description: 'Sistema completo para programar, rastrear y completar viajes estudiantiles en tiempo real',
      color: 'teal'
    },
    {
      icon: Users,
      title: 'Portal de Conductores',
      description: 'Interfaz intuitiva para aceptar solicitudes, gestionar rutas y reportar entregas',
      color: 'purple'
    },
    {
      icon: GraduationCap,
      title: 'Acceso Estudiantil',
      description: 'Sistema simple y rápido para que estudiantes soliciten transporte a diferentes destinos',
      color: 'blue'
    },
    {
      icon: Bell,
      title: 'Notificaciones en Tiempo Real',
      description: 'Alertas automáticas con sonido para nuevas solicitudes y cambios de estado',
      color: 'amber'
    },
    {
      icon: BarChart3,
      title: 'Reportes y Analytics',
      description: 'Dashboard administrativo con métricas, gráficos y reportes consolidados',
      color: 'emerald'
    },
    {
      icon: Shield,
      title: 'Seguridad y Control',
      description: 'Sistema de autenticación por roles, rate limiting y protección de datos',
      color: 'red'
    }
  ];

  const userFlows = [
    {
      role: 'Administrador',
      color: 'from-blue-600 to-blue-700',
      icon: Shield,
      access: 'PIN de 4 dígitos',
      features: [
        'Dashboard completo con estadísticas',
        'Gestión de conductores y vehículos',
        'Reportes diarios y consolidados',
        'Control de mantenimiento y compras',
        'Alertas de documentos por vencer',
        'Sistema de notificaciones'
      ]
    },
    {
      role: 'Conductor',
      color: 'from-teal-600 to-teal-700',
      icon: Bus,
      access: 'ID de 3 dígitos',
      features: [
        'Selección de vehículo al inicio',
        'Vista de solicitudes disponibles',
        'Aceptar/rechazar viajes',
        'Gestión de entregas en tiempo real',
        'Historial de viajes completados',
        'Configuración de notificaciones'
      ]
    },
    {
      role: 'Estudiante',
      color: 'from-purple-600 to-purple-700',
      icon: GraduationCap,
      access: 'ID de 4 dígitos',
      features: [
        'Solicitar viaje rápidamente',
        'Ver estado del viaje en vivo',
        'Múltiples destinos disponibles',
        'Historial de viajes',
        'Interfaz simple y directa'
      ]
    }
  ];

  const benefits = [
    {
      title: 'Eficiencia Operativa',
      description: 'Reduce tiempos de respuesta y optimiza la asignación de recursos',
      metrics: '70% más rápido',
      icon: Zap
    },
    {
      title: 'Trazabilidad Total',
      description: 'Seguimiento completo desde la solicitud hasta la entrega',
      metrics: '100% rastreado',
      icon: MapPin
    },
    {
      title: 'Satisfacción Estudiantil',
      description: 'Sistema simple y accesible que mejora la experiencia del usuario',
      metrics: 'Fácil de usar',
      icon: Star
    },
    {
      title: 'Control Administrativo',
      description: 'Reportes detallados y métricas para toma de decisiones',
      metrics: 'Data-driven',
      icon: BarChart3
    },
    {
      title: 'Ahorro de Tiempo',
      description: 'Automatización de procesos manuales y reducción de errores',
      metrics: '5+ horas/día',
      icon: Clock
    },
    {
      title: 'Escalabilidad',
      description: 'Sistema preparado para crecer con las necesidades de la institución',
      metrics: 'Sin límites',
      icon: TrendingUp
    }
  ];

  const modules = [
    {
      title: 'Gestión de Viajes',
      icon: Bus,
      color: 'teal',
      features: [
        'Creación y programación de viajes',
        'Asignación automática de conductores',
        'Seguimiento en tiempo real',
        'Estado de entregas por estudiante',
        'Rutas optimizadas',
        'Historial completo'
      ],
      screenshot: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&h=500&fit=crop'
    },
    {
      title: 'Portal de Conductores',
      icon: Users,
      color: 'purple',
      features: [
        'Dashboard personalizado',
        'Solicitudes en tiempo real',
        'Selección de vehículo',
        'Sistema de aceptar/rechazar',
        'Gestión de entregas',
        'Notificaciones con sonido'
      ],
      screenshot: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&h=500&fit=crop'
    },
    {
      title: 'Acceso Estudiantil',
      icon: GraduationCap,
      color: 'blue',
      features: [
        'Solicitud rápida de viaje',
        'Múltiples destinos',
        'Estado en tiempo real',
        'Historial de viajes',
        'Interfaz simple',
        'Sin necesidad de registro'
      ],
      screenshot: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=500&fit=crop'
    },
    {
      title: 'Gestión de Vehículos',
      icon: Car,
      color: 'emerald',
      features: [
        'Registro completo de vehículos',
        'Control de mantenimiento',
        'Alertas de servicio',
        'Historial de reparaciones',
        'Documentación digital',
        'Seguimiento de kilometraje'
      ],
      screenshot: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&h=500&fit=crop'
    },
    {
      title: 'Reportes y Analytics',
      icon: BarChart3,
      color: 'amber',
      features: [
        'Dashboard administrativo',
        'Reportes diarios automáticos',
        'Métricas de desempeño',
        'Gráficos interactivos',
        'Exportación de datos',
        'Análisis de tendencias'
      ],
      screenshot: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=500&fit=crop'
    },
    {
      title: 'Control de Gastos',
      icon: DollarSign,
      color: 'rose',
      features: [
        'Registro de compras',
        'Control de combustible',
        'Reportes financieros',
        'Categorización de gastos',
        'Recibos digitales',
        'Presupuestos y alertas'
      ],
      screenshot: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&h=500&fit=crop'
    }
  ];

  const techStack = [
    'React + TailwindCSS',
    'Real-time Database',
    'Responsive Design',
    'Progressive Web App',
    'Cloud Infrastructure',
    'Secure Authentication'
  ];

  const demoVideos = [
    {
      title: 'Tour Completo del Sistema',
      description: 'Recorrido general por todas las funcionalidades principales',
      duration: '5:30',
      thumbnail: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&h=400&fit=crop'
    },
    {
      title: 'Flujo de Conductor',
      description: 'Cómo los conductores aceptan y completan viajes',
      duration: '3:45',
      thumbnail: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=600&h=400&fit=crop'
    },
    {
      title: 'Panel Administrativo',
      description: 'Gestión completa desde el dashboard de admin',
      duration: '4:20',
      thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop'
    }
  ];

  const colorClasses = {
    teal: 'bg-teal-100 text-teal-700',
    purple: 'bg-purple-100 text-purple-700',
    blue: 'bg-blue-100 text-blue-700',
    amber: 'bg-amber-100 text-amber-700',
    emerald: 'bg-emerald-100 text-emerald-700',
    red: 'bg-red-100 text-red-700'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-teal-600 via-teal-700 to-blue-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8 relative">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <motion.div 
              className="inline-flex items-center justify-center w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl mb-8 shadow-2xl"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Bus className="w-12 h-12" />
            </motion.div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 tracking-tight">
              EDP Transport System
            </h1>
            <p className="text-xl md:text-3xl text-teal-100 mb-4 max-w-4xl mx-auto font-light">
              Sistema inteligente de gestión de transporte estudiantil
            </p>
            <p className="text-lg text-teal-200 mb-10 max-w-2xl mx-auto">
              Eficiencia, seguridad y control total en una sola plataforma
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <Badge className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 text-base shadow-lg">
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Tiempo Real
              </Badge>
              <Badge className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 text-base shadow-lg">
                <Shield className="w-5 h-5 mr-2" />
                100% Seguro
              </Badge>
              <Badge className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 text-base shadow-lg">
                <Smartphone className="w-5 h-5 mr-2" />
                Multi-Plataforma
              </Badge>
              <Badge className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 text-base shadow-lg">
                <Globe className="w-5 h-5 mr-2" />
                Cloud-Based
              </Badge>
            </div>
          </motion.div>
        </div>
        
        {/* Hero Image/Screenshot */}
        <div className="max-w-7xl mx-auto px-4 pb-16 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20"
          >
            <img 
              src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1400&h=800&fit=crop" 
              alt="Dashboard Preview"
              className="w-full h-auto"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-teal-900/50 to-transparent"></div>
          </motion.div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto py-4">
            {sections.map((section) => (
              <Button
                key={section.id}
                variant={activeSection === section.id ? "default" : "ghost"}
                onClick={() => setActiveSection(section.id)}
                className={activeSection === section.id ? 'bg-teal-600 hover:bg-teal-700' : ''}
              >
                <section.icon className="w-4 h-4 mr-2" />
                {section.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Overview Section */}
        {activeSection === 'overview' && (
          <div className="space-y-12">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-slate-800 mb-4">
                Transformando el Transporte Estudiantil
              </h2>
              <p className="text-lg text-slate-600">
                Una solución completa que conecta estudiantes, conductores y administración en un sistema 
                eficiente, seguro y fácil de usar.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-teal-600" />
                </div>
                <h3 className="text-4xl font-bold text-slate-800 mb-2">3</h3>
                <p className="text-slate-600">Roles de Usuario</p>
              </Card>

              <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-4xl font-bold text-slate-800 mb-2">100%</h3>
                <p className="text-slate-600">Trazabilidad</p>
              </Card>

              <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-4xl font-bold text-slate-800 mb-2">Real-time</h3>
                <p className="text-slate-600">Actualizaciones</p>
              </Card>
            </div>
          </div>
        )}

        {/* Features Section */}
        {activeSection === 'features' && (
          <div className="space-y-12">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-bold text-slate-800 mb-4">
                Características Principales
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Funcionalidades diseñadas para optimizar cada aspecto del transporte estudiantil
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="p-8 hover:shadow-2xl transition-all hover:-translate-y-2 h-full border-t-4 border-teal-500">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${colorClasses[feature.color]} shadow-lg`}>
                      <feature.icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 text-lg leading-relaxed">
                      {feature.description}
                    </p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Modules Section */}
        {activeSection === 'modules' && (
          <div className="space-y-16">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-slate-800 mb-4">
                Módulos del Sistema
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Solución completa e integrada para todas las necesidades de transporte
              </p>
            </div>

            <div className="space-y-20">
              {modules.map((module, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className={`grid md:grid-cols-2 gap-8 items-center ${idx % 2 === 1 ? 'md:flex-row-reverse' : ''}`}
                >
                  {idx % 2 === 0 ? (
                    <>
                      <div className="space-y-6">
                        <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-full ${colorClasses[module.color]}`}>
                          <module.icon className="w-5 h-5" />
                          <span className="font-semibold">Módulo {idx + 1}</span>
                        </div>
                        <h3 className="text-3xl font-bold text-slate-800">{module.title}</h3>
                        <ul className="space-y-3">
                          {module.features.map((feature, fidx) => (
                            <li key={fidx} className="flex items-start gap-3">
                              <CheckCircle2 className="w-6 h-6 text-teal-600 flex-shrink-0 mt-0.5" />
                              <span className="text-lg text-slate-700">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <Card className="overflow-hidden shadow-2xl">
                        <img 
                          src={module.screenshot} 
                          alt={module.title}
                          className="w-full h-80 object-cover"
                        />
                      </Card>
                    </>
                  ) : (
                    <>
                      <Card className="overflow-hidden shadow-2xl md:order-2">
                        <img 
                          src={module.screenshot} 
                          alt={module.title}
                          className="w-full h-80 object-cover"
                        />
                      </Card>
                      <div className="space-y-6 md:order-1">
                        <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-full ${colorClasses[module.color]}`}>
                          <module.icon className="w-5 h-5" />
                          <span className="font-semibold">Módulo {idx + 1}</span>
                        </div>
                        <h3 className="text-3xl font-bold text-slate-800">{module.title}</h3>
                        <ul className="space-y-3">
                          {module.features.map((feature, fidx) => (
                            <li key={fidx} className="flex items-start gap-3">
                              <CheckCircle2 className="w-6 h-6 text-teal-600 flex-shrink-0 mt-0.5" />
                              <span className="text-lg text-slate-700">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Users Section */}
        {activeSection === 'users' && (
          <div className="space-y-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-800 mb-4">
                Flujos de Usuario
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Experiencias optimizadas para cada tipo de usuario
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {userFlows.map((user, idx) => (
                <Card key={idx} className="overflow-hidden hover:shadow-xl transition-shadow">
                  <div className={`bg-gradient-to-r ${user.color} p-6 text-white`}>
                    <user.icon className="w-12 h-12 mb-4" />
                    <h3 className="text-2xl font-bold mb-2">{user.role}</h3>
                    <Badge className="bg-white/20 text-white">
                      {user.access}
                    </Badge>
                  </div>
                  <div className="p-6">
                    <ul className="space-y-3">
                      {user.features.map((feature, fidx) => (
                        <li key={fidx} className="flex items-start gap-2">
                          <ChevronRight className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                          <span className="text-slate-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Benefits Section */}
        {activeSection === 'benefits' && (
          <div className="space-y-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-800 mb-4">
                Beneficios para la Institución
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Impacto real y medible en la operación diaria
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((benefit, idx) => (
                <Card key={idx} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                      <benefit.icon className="w-6 h-6 text-teal-600" />
                    </div>
                    <Badge variant="outline" className="text-teal-600 border-teal-600">
                      {benefit.metrics}
                    </Badge>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-slate-600">
                    {benefit.description}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Demo Section */}
        {activeSection === 'demo' && (
          <div className="space-y-12">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-slate-800 mb-4">
                Demos y Videos
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Explora el sistema en acción con nuestros videos demostrativos
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {demoVideos.map((video, idx) => (
                <Card key={idx} className="overflow-hidden hover:shadow-2xl transition-all group cursor-pointer">
                  <div className="relative">
                    <img 
                      src={video.thumbnail} 
                      alt={video.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl">
                        <Play className="w-8 h-8 text-teal-600 ml-1" />
                      </div>
                    </div>
                    <Badge className="absolute top-4 right-4 bg-black/70 text-white">
                      <Clock className="w-3 h-3 mr-1" />
                      {video.duration}
                    </Badge>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-slate-800 mb-2">
                      {video.title}
                    </h3>
                    <p className="text-slate-600">
                      {video.description}
                    </p>
                  </div>
                </Card>
              ))}
            </div>

            {/* Live Demo CTA */}
            <Card className="p-12 bg-gradient-to-r from-teal-50 to-blue-50 border-2 border-teal-200 text-center">
              <div className="max-w-2xl mx-auto">
                <div className="w-20 h-20 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                  <Laptop className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-slate-800 mb-4">
                  ¿Quieres ver el sistema en vivo?
                </h3>
                <p className="text-xl text-slate-600 mb-8">
                  Agenda una demostración personalizada con nuestro equipo
                </p>
                <Button size="lg" className="bg-teal-600 hover:bg-teal-700 text-lg px-8 shadow-lg">
                  <Calendar className="w-5 h-5 mr-2" />
                  Agendar Demo en Vivo
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Tech Section */}
        {activeSection === 'tech' && (
          <div className="space-y-12">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-slate-800 mb-4">
                Tecnología Moderna y Confiable
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Construido con las mejores prácticas y tecnologías del mercado
              </p>
            </div>

            {/* Architecture Diagram */}
            <Card className="p-10 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
              <h3 className="text-2xl font-bold mb-8 text-center">Arquitectura del Sistema</h3>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-20 h-20 bg-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                    <Laptop className="w-10 h-10" />
                  </div>
                  <h4 className="font-bold mb-2">Frontend</h4>
                  <p className="text-sm text-slate-300">React, TailwindCSS, Framer Motion</p>
                </div>
                <div className="text-center">
                  <div className="w-20 h-20 bg-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                    <Database className="w-10 h-10" />
                  </div>
                  <h4 className="font-bold mb-2">Backend</h4>
                  <p className="text-sm text-slate-300">Base44 BaaS, Real-time Sync</p>
                </div>
                <div className="text-center">
                  <div className="w-20 h-20 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                    <Lock className="w-10 h-10" />
                  </div>
                  <h4 className="font-bold mb-2">Seguridad</h4>
                  <p className="text-sm text-slate-300">Auth, Rate Limiting, Encryption</p>
                </div>
              </div>
            </Card>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="p-8 border-2 border-teal-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                    <Palette className="w-6 h-6 text-teal-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800">Stack Tecnológico</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {techStack.map((tech, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg"
                    >
                      <CheckCircle2 className="w-5 h-5 text-teal-600 flex-shrink-0" />
                      <span className="text-slate-700 font-medium">{tech}</span>
                    </motion.div>
                  ))}
                </div>
              </Card>

              <Card className="p-8 border-2 border-purple-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800">Características Técnicas</h3>
                </div>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                    <Shield className="w-6 h-6 text-teal-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-800">Seguridad Empresarial</p>
                      <p className="text-sm text-slate-600">Rate limiting, autenticación segura, encriptación de datos</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                    <Smartphone className="w-6 h-6 text-teal-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-800">100% Responsive</p>
                      <p className="text-sm text-slate-600">Diseño adaptativo para móvil, tablet y escritorio</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                    <Zap className="w-6 h-6 text-teal-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-800">Alto Rendimiento</p>
                      <p className="text-sm text-slate-600">Carga instantánea y actualizaciones en tiempo real</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                    <Globe className="w-6 h-6 text-teal-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-800">Cloud Infrastructure</p>
                      <p className="text-sm text-slate-600">Escalable, confiable y disponible 24/7</p>
                    </div>
                  </li>
                </ul>
              </Card>
            </div>

            {/* Security Features */}
            <Card className="p-10 bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Seguridad de Nivel Empresarial</h3>
                <p className="text-slate-600">Protección integral de datos y usuarios</p>
              </div>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600 mb-2">3</div>
                  <p className="text-sm text-slate-600">Niveles de autenticación por roles</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600 mb-2">256-bit</div>
                  <p className="text-sm text-slate-600">Encriptación de datos</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600 mb-2">99.9%</div>
                  <p className="text-sm text-slate-600">Uptime garantizado</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600 mb-2">24/7</div>
                  <p className="text-sm text-slate-600">Monitoreo continuo</p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Stats Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Impacto Medible</h2>
            <p className="text-xl text-slate-600">Resultados reales desde el primer día</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '70%', label: 'Reducción en tiempos de gestión', icon: Clock },
              { value: '100%', label: 'Trazabilidad de viajes', icon: MapPin },
              { value: '50+', label: 'Horas ahorradas al mes', icon: TrendingUp },
              { value: '99.9%', label: 'Disponibilidad del sistema', icon: CheckCircle2 }
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-8 h-8 text-teal-600" />
                </div>
                <div className="text-4xl font-bold text-teal-600 mb-2">{stat.value}</div>
                <p className="text-slate-600">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative bg-gradient-to-r from-teal-600 via-teal-700 to-blue-700 text-white mt-16 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              ¿Listo para transformar tu sistema de transporte?
            </h2>
            <p className="text-xl md:text-2xl text-teal-100 mb-10 max-w-3xl mx-auto">
              Implementación en 48 horas • Soporte 24/7 • Resultados inmediatos
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button size="lg" className="bg-white text-teal-700 hover:bg-teal-50 text-xl px-12 py-6 h-auto shadow-2xl">
                <Play className="w-6 h-6 mr-3" />
                Ver Demo en Vivo
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 text-xl px-12 py-6 h-auto">
                <Calendar className="w-6 h-6 mr-3" />
                Agendar Reunión
              </Button>
            </div>
            <div className="mt-12 flex flex-wrap justify-center gap-8 text-teal-100">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>Sin costos ocultos</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>Soporte incluido</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>Actualizaciones gratis</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-slate-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Bus className="w-8 h-8 text-teal-400" />
            <span className="text-2xl font-bold">EDP Transport System</span>
          </div>
          <p className="text-slate-400">© 2026 - Sistema de Gestión de Transporte Estudiantil</p>
        </div>
      </div>
    </div>
  );
}