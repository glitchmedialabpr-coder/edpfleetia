import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Shield, Truck, GraduationCap, Briefcase } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black flex flex-col justify-center items-center p-6">
      {/* Logo and Title */}
      <div className="text-center mb-16">
        <div className="mb-8">
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-1 tracking-tight">EDP</h1>
          <h2 className="text-xl md:text-2xl font-light text-white tracking-widest">UNIVERSITY</h2>
          <div className="mt-2">
            <h3 className="text-3xl md:text-4xl font-bold text-white tracking-wide">FLEETIA</h3>
            <p className="text-xs text-gray-500 mt-1 tracking-widest">by GLITCH MEDIA LAB</p>
          </div>
        </div>
        
        <p className="text-gray-400 text-sm md:text-base mb-2">Sistema de Gestión de Flotas y Transporte</p>
        <p className="text-gray-500 text-sm">EDP University</p>
      </div>

      {/* Login Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl w-full mb-16">
        {/* Admin Card */}
        <button
          onClick={() => navigate(createPageUrl('AdminLogin'))}
          className="group relative bg-gradient-to-br from-red-600 to-red-700 rounded-2xl p-8 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/50"
        >
          <div className="mb-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Administrador</h3>
          <p className="text-red-100 text-sm">Gestiona vehículos, conductores y viajes del sistema</p>
        </button>

        {/* Driver Card */}
        <button
          onClick={() => navigate(createPageUrl('DriverLogin'))}
          className="group relative bg-gradient-to-br from-teal-600 to-teal-700 rounded-2xl p-8 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-teal-500/50"
        >
          <div className="mb-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <Truck className="w-8 h-8 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Chofer</h3>
          <p className="text-teal-100 text-sm">Visualiza y gestiona tus viajes asignados</p>
        </button>

        {/* Student Card */}
        <button
          onClick={() => navigate(createPageUrl('PassengerLogin'))}
          className="group relative bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl p-8 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50"
        >
          <div className="mb-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Estudiante</h3>
          <p className="text-purple-100 text-sm">Solicita transporte y rastrea tus viajes</p>
        </button>

        {/* Employee Card */}
        <button
          onClick={() => navigate(createPageUrl('EmployeeLogin'))}
          className="group relative bg-gradient-to-br from-orange-600 to-orange-700 rounded-2xl p-8 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/50"
        >
          <div className="mb-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <Briefcase className="w-8 h-8 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Empleado</h3>
          <p className="text-orange-100 text-sm">Solicita transporte para actividades laborales</p>
        </button>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-600">
        <p>© 2026 FLEETIA - EDP University. Todos los derechos reservados.</p>
      </div>
    </div>
  );
}