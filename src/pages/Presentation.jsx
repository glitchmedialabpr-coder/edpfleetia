import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Target
} from 'lucide-react';

export default function Presentation() {
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    { id: 'overview', label: 'Visión General', icon: Target },
    { id: 'features', label: 'Características', icon: Star },
    { id: 'users', label: 'Usuarios', icon: Users },
    { id: 'benefits', label: 'Beneficios', icon: TrendingUp },
    { id: 'tech', label: 'Tecnología', icon: Settings },
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

  const techStack = [
    'React + TailwindCSS',
    'Real-time Database',
    'Responsive Design',
    'Progressive Web App',
    'Cloud Infrastructure',
    'Secure Authentication'
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
      <div className="bg-gradient-to-r from-teal-600 via-teal-700 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl mb-6">
              <Bus className="w-10 h-10" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              EDP Transport System
            </h1>
            <p className="text-xl md:text-2xl text-teal-100 mb-8 max-w-3xl mx-auto">
              Sistema inteligente de gestión de transporte estudiantil
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Badge className="bg-white/20 text-white px-4 py-2 text-base">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Tiempo Real
              </Badge>
              <Badge className="bg-white/20 text-white px-4 py-2 text-base">
                <Shield className="w-4 h-4 mr-2" />
                100% Seguro
              </Badge>
              <Badge className="bg-white/20 text-white px-4 py-2 text-base">
                <Smartphone className="w-4 h-4 mr-2" />
                Multi-Plataforma
              </Badge>
            </div>
          </div>
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
          <div className="space-y-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-800 mb-4">
                Características Principales
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Funcionalidades diseñadas para optimizar cada aspecto del transporte estudiantil
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, idx) => (
                <Card key={idx} className="p-6 hover:shadow-xl transition-all hover:-translate-y-1">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${colorClasses[feature.color]}`}>
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600">
                    {feature.description}
                  </p>
                </Card>
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

        {/* Tech Section */}
        {activeSection === 'tech' && (
          <div className="space-y-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-800 mb-4">
                Tecnología Moderna y Confiable
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Construido con las mejores prácticas y tecnologías del mercado
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="p-8">
                <h3 className="text-2xl font-semibold text-slate-800 mb-6">Stack Tecnológico</h3>
                <div className="grid grid-cols-2 gap-4">
                  {techStack.map((tech, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-teal-600 flex-shrink-0" />
                      <span className="text-slate-700">{tech}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-8">
                <h3 className="text-2xl font-semibold text-slate-800 mb-6">Características Técnicas</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-slate-800">Seguridad</p>
                      <p className="text-sm text-slate-600">Rate limiting, autenticación segura, protección CSRF</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Smartphone className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-slate-800">Responsive</p>
                      <p className="text-sm text-slate-600">Optimizado para móvil, tablet y escritorio</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-slate-800">Performance</p>
                      <p className="text-sm text-slate-600">Carga rápida, actualizaciones en tiempo real</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <TrendingUp className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-slate-800">Escalable</p>
                      <p className="text-sm text-slate-600">Preparado para crecer sin límites</p>
                    </div>
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-teal-600 to-blue-700 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            ¿Listo para transformar tu sistema de transporte?
          </h2>
          <p className="text-xl text-teal-100 mb-8 max-w-2xl mx-auto">
            Implementación rápida, soporte completo y resultados inmediatos
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-teal-700 hover:bg-teal-50 text-lg px-8">
              <FileText className="w-5 h-5 mr-2" />
              Solicitar Demo
            </Button>
            <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 text-lg px-8">
              <Calendar className="w-5 h-5 mr-2" />
              Agendar Reunión
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}