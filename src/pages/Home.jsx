import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { Shield, Truck, GraduationCap, BarChart3, Clock, Users, MapPin, AlertCircle, Zap, Eye, ChevronDown } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const [expandedSection, setExpandedSection] = useState(null);

  return (
    <div className="px-4 py-12">
      {/* Hero Section */}
      <div className="max-w-5xl mx-auto mb-20">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="w-32 h-32 mx-auto mb-8">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6962e1b8eae90299f24a170a/a12aa5730_Addaheading.jpg" 
              alt="Fleetia"
              className="w-full h-full object-cover rounded-2xl"
            />
          </div>
          <h1 className="text-6xl font-bold text-white mb-4">Fleetia</h1>
          <p className="text-2xl text-teal-400 font-semibold mb-2">Gestión Integral de Flota y Transporte</p>
          <p className="text-xl text-slate-300">La plataforma más completa para administrar conductores, vehículos, rutas y operaciones</p>
        </div>



        {/* Portals Section */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold text-white mb-12 text-center">Cuatro Portales Integrados</h2>
          
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            {/* Admin Login */}
          <button
            onClick={() => navigate(createPageUrl('AdminLogin'))}
            className="group relative bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center group-hover:bg-blue-600/30 transition-colors">
                <Shield className="w-10 h-10 text-blue-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Administrador</h3>
                <p className="text-sm text-slate-400">Gestión completa del sistema</p>
              </div>
              <div className="pt-4">
                <span className="text-blue-400 font-semibold group-hover:underline">
                  Acceso con PIN →
                </span>
              </div>
            </div>
          </button>

          {/* Employee Complaints Login */}
          <button
            onClick={() => navigate(createPageUrl('EmployeeLogin'))}
            className="group relative bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 bg-purple-600/20 rounded-full flex items-center justify-center group-hover:bg-purple-600/30 transition-colors">
                <Shield className="w-10 h-10 text-purple-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Solicitudes</h3>
                <p className="text-sm text-slate-400">Solicitudes Estructurales</p>
              </div>
              <div className="pt-4">
                <span className="text-purple-400 font-semibold group-hover:underline">
                  Acceso con Clave →
                </span>
              </div>
            </div>
          </button>

          {/* Driver Login */}
          <button
            onClick={() => navigate(createPageUrl('DriverLogin'))}
            className="group relative bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 bg-teal-600/20 rounded-full flex items-center justify-center group-hover:bg-teal-600/30 transition-colors">
                <Truck className="w-10 h-10 text-teal-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Conductor</h3>
                <p className="text-sm text-slate-400">Portal de conductores</p>
              </div>
              <div className="pt-4">
                <span className="text-teal-400 font-semibold group-hover:underline">
                  Acceso con ID →
                </span>
              </div>
            </div>
          </button>

          {/* Passenger Login */}
          <button
            onClick={() => navigate(createPageUrl('PassengerLogin'))}
            className="group relative bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 bg-purple-600/20 rounded-full flex items-center justify-center group-hover:bg-purple-600/30 transition-colors">
                <GraduationCap className="w-10 h-10 text-purple-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Estudiante</h3>
                <p className="text-sm text-slate-400">Solicita tu transporte</p>
              </div>
              <div className="pt-4">
                <span className="text-purple-400 font-semibold group-hover:underline">
                  Acceso con ID →
                </span>
              </div>
            </div>
          </button>
          </div>

          {/* Features by Portal */}
          <div className="space-y-4 mt-16">
            {/* Admin Features */}
            <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden">
              <button
                onClick={() => setExpandedSection(expandedSection === 'admin' ? null : 'admin')}
                className="w-full p-6 flex items-center justify-between hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <Shield className="w-6 h-6 text-blue-400" />
                  <div className="text-left">
                    <h3 className="text-xl font-bold text-white">Portal Administrador</h3>
                    <p className="text-sm text-slate-400">Control total del sistema</p>
                  </div>
                </div>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${expandedSection === 'admin' ? 'rotate-180' : ''}`} />
              </button>
              {expandedSection === 'admin' && (
                <div className="p-6 border-t border-white/10 bg-black/20">
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div><span className="text-teal-400">✓</span> <span className="text-slate-300">Gestión de conductores y datos completos</span></div>
                    <div><span className="text-teal-400">✓</span> <span className="text-slate-300">Asignación de horarios semanales</span></div>
                    <div><span className="text-teal-400">✓</span> <span className="text-slate-300">Control y gestión de vehículos</span></div>
                    <div><span className="text-teal-400">✓</span> <span className="text-slate-300">Registro de mantenimiento preventivo</span></div>
                    <div><span className="text-teal-400">✓</span> <span className="text-slate-300">Reportes de accidentes e incidentes</span></div>
                    <div><span className="text-teal-400">✓</span> <span className="text-slate-300">Monitoreo en vivo de viajes</span></div>
                    <div><span className="text-teal-400">✓</span> <span className="text-slate-300">Gestión de combustible y costos</span></div>
                    <div><span className="text-teal-400">✓</span> <span className="text-slate-300">Reportes consolidados y analytics</span></div>
                    <div><span className="text-teal-400">✓</span> <span className="text-slate-300">Advertencias a conductores</span></div>
                    <div><span className="text-teal-400">✓</span> <span className="text-slate-300">Gestión de estudiantes y hospedajes</span></div>
                    <div><span className="text-teal-400">✓</span> <span className="text-slate-300">Trabajos de servicio general</span></div>
                    <div><span className="text-teal-400">✓</span> <span className="text-slate-300">Centro de notificaciones y alertas</span></div>
                  </div>
                </div>
              )}
            </div>

            {/* Driver Features */}
            <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden">
              <button
                onClick={() => setExpandedSection(expandedSection === 'driver' ? null : 'driver')}
                className="w-full p-6 flex items-center justify-between hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <Truck className="w-6 h-6 text-teal-400" />
                  <div className="text-left">
                    <h3 className="text-xl font-bold text-white">Portal Conductor</h3>
                    <p className="text-sm text-slate-400">Gestión de viajes y solicitudes</p>
                  </div>
                </div>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${expandedSection === 'driver' ? 'rotate-180' : ''}`} />
              </button>
              {expandedSection === 'driver' && (
                <div className="p-6 border-t border-white/10 bg-black/20">
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div><span className="text-teal-400">✓</span> <span className="text-slate-300">Dashboard de actividad diaria</span></div>
                    <div><span className="text-teal-400">✓</span> <span className="text-slate-300">Recepción de solicitudes de viaje</span></div>
                    <div><span className="text-teal-400">✓</span> <span className="text-slate-300">Aceptar/Rechazar viajes en tiempo real</span></div>
                    <div><span className="text-teal-400">✓</span> <span className="text-slate-300">Historial de viajes completados</span></div>
                    <div><span className="text-teal-400">✓</span> <span className="text-slate-300">Notificaciones y alertas en vivo</span></div>
                    <div><span className="text-teal-400">✓</span> <span className="text-slate-300">Perfil y documentos</span></div>
                  </div>
                </div>
              )}
            </div>

            {/* Passenger Features */}
            <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden">
              <button
                onClick={() => setExpandedSection(expandedSection === 'passenger' ? null : 'passenger')}
                className="w-full p-6 flex items-center justify-between hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <GraduationCap className="w-6 h-6 text-purple-400" />
                  <div className="text-left">
                    <h3 className="text-xl font-bold text-white">Portal Estudiante</h3>
                    <p className="text-sm text-slate-400">Solicitud de transporte</p>
                  </div>
                </div>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${expandedSection === 'passenger' ? 'rotate-180' : ''}`} />
              </button>
              {expandedSection === 'passenger' && (
                <div className="p-6 border-t border-white/10 bg-black/20">
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div><span className="text-teal-400">✓</span> <span className="text-slate-300">Solicitar viaje con destino específico</span></div>
                    <div><span className="text-teal-400">✓</span> <span className="text-slate-300">Ver asignación de conductor</span></div>
                    <div><span className="text-teal-400">✓</span> <span className="text-slate-300">Rastrear viaje en tiempo real</span></div>
                    <div><span className="text-teal-400">✓</span> <span className="text-slate-300">Historial de viajes realizados</span></div>
                  </div>
                </div>
              )}
            </div>

            {/* Employee Complaints */}
            <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden">
              <button
                onClick={() => setExpandedSection(expandedSection === 'employee' ? null : 'employee')}
                className="w-full p-6 flex items-center justify-between hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <AlertCircle className="w-6 h-6 text-purple-400" />
                  <div className="text-left">
                    <h3 className="text-xl font-bold text-white">Portal Solicitudes</h3>
                    <p className="text-sm text-slate-400">Formulario de peticiones</p>
                  </div>
                </div>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${expandedSection === 'employee' ? 'rotate-180' : ''}`} />
              </button>
              {expandedSection === 'employee' && (
                <div className="p-6 border-t border-white/10 bg-black/20">
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div><span className="text-teal-400">✓</span> <span className="text-slate-300">Formulario de peticiones estructurado</span></div>
                    <div><span className="text-teal-400">✓</span> <span className="text-slate-300">Envío de solicitudes anónimas o identificadas</span></div>
                    <div><span className="text-teal-400">✓</span> <span className="text-slate-300">Seguimiento de estado</span></div>
                    <div><span className="text-teal-400">✓</span> <span className="text-slate-300">Historial de solicitudes</span></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Why Choose Fleetia */}
        <div className="bg-gradient-to-r from-teal-600/20 to-blue-600/20 rounded-2xl border border-teal-500/30 p-8 mb-20">
          <h2 className="text-3xl font-bold text-white mb-8">¿Por qué Fleetia?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-400" />
                Solución Multiusuario
              </h3>
              <p className="text-slate-300">Diseñado para todos: administradores, conductores, estudiantes y empleados. Cada portal optimizado para sus necesidades específicas.</p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-teal-400" />
                Operaciones Completas
              </h3>
              <p className="text-slate-300">Desde la gestión de flota hasta el servicio al cliente, todo en una plataforma centralizada.</p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-teal-400" />
                Tiempo Real
              </h3>
              <p className="text-slate-300">Monitoreo en vivo, notificaciones instantáneas y actualización de datos en tiempo real.</p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-teal-400" />
                Inteligencia de Datos
              </h3>
              <p className="text-slate-300">Reportes detallados, análisis de costos y métricas de desempeño para decisiones informadas.</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Accede a tu Portal</h2>
          <p className="text-slate-400 mb-8">Selecciona tu tipo de usuario para continuar</p>
        </div>
      </div>
    </div>
  );
}