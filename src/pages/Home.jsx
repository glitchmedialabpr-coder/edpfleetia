import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { Shield, Truck, GraduationCap } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <div className="w-40 h-40 mx-auto mb-8">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6962e1b8eae90299f24a170a/303d16ba3_471231367_1006775134815986_8615529326532786364_n.jpg" 
              alt="EDP University"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">Fleetia by Glitch Media Lab</h1>
          <p className="text-xl text-slate-300">Administra servicios, conductores y operaciones desde un solo lugar</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
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
                  Acceso con Código →
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
                  Acceso con Email →
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

        <div className="text-center mt-12">
          <p className="text-sm text-slate-500">
            © By Glitch Media Lab - Fleetia
          </p>
        </div>
      </div>
    </div>
  );
}