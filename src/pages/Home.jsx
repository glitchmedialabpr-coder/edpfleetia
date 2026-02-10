import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Shield, Truck, GraduationCap, Info } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col justify-center items-center p-4">
      {/* Hero Section */}
      <div className="max-w-3xl w-full text-center mb-16">
        <div className="w-32 h-32 mx-auto mb-8">
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6962e1b8eae90299f24a170a/a12aa5730_Addaheading.jpg" 
            alt="EDP Fleetia"
            className="w-full h-full object-cover rounded-2xl"
          />
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">Fleetia</h1>
        <p className="text-xl text-slate-300 mb-8">Gestión integral de transporte y flota</p>
        <p className="text-sm text-slate-400">by Glitch Media Lab</p>
      </div>

      {/* Login Options */}
      <div className="grid md:grid-cols-2 gap-4 max-w-2xl w-full mb-12">
        {/* Admin Login */}
        <button
          onClick={() => navigate(createPageUrl('AdminLogin'))}
          className="group bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:border-blue-400/50"
        >
          <Shield className="w-8 h-8 text-blue-400 mx-auto mb-3" />
          <h3 className="font-bold text-white mb-1">Administrador</h3>
          <p className="text-xs text-slate-400">PIN</p>
        </button>

        {/* Driver Login */}
        <button
          onClick={() => navigate(createPageUrl('DriverLogin'))}
          className="group bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:border-teal-400/50"
        >
          <Truck className="w-8 h-8 text-teal-400 mx-auto mb-3" />
          <h3 className="font-bold text-white mb-1">Conductor</h3>
          <p className="text-xs text-slate-400">ID de Conductor</p>
        </button>

        {/* Passenger Login */}
        <button
          onClick={() => navigate(createPageUrl('PassengerLogin'))}
          className="group bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:border-purple-400/50"
        >
          <GraduationCap className="w-8 h-8 text-purple-400 mx-auto mb-3" />
          <h3 className="font-bold text-white mb-1">Estudiante</h3>
          <p className="text-xs text-slate-400">ID de Estudiante</p>
        </button>

        {/* Complaints Login */}
        <button
          onClick={() => navigate(createPageUrl('EmployeeLogin'))}
          className="group bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:border-orange-400/50"
        >
          <Info className="w-8 h-8 text-orange-400 mx-auto mb-3" />
          <h3 className="font-bold text-white mb-1">Solicitudes</h3>
          <p className="text-xs text-slate-400">Clave de Acceso</p>
        </button>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-slate-500">
        <p>© 2026 by Glitch Media Lab</p>
      </div>
    </div>
  );
}