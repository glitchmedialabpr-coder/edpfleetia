import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Bell, Lock, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { toast } from 'sonner';

export default function Settings() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('pin_user');
    toast.success('Sesión cerrada');
    navigate(createPageUrl('Home'));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Configuración</h1>
        <p className="text-slate-500 mt-2">Administra tus preferencias</p>
      </div>

      <div className="grid gap-4 max-w-2xl">
        {/* Notifications */}
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <Bell className="w-5 h-5 text-slate-600 mt-1" />
              <div>
                <h3 className="font-semibold text-slate-800">Notificaciones</h3>
                <p className="text-sm text-slate-500 mt-1">Manage notification preferences</p>
              </div>
            </div>
            <Button variant="outline" size="sm">Configurar</Button>
          </div>
        </Card>

        {/* Privacy */}
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <Lock className="w-5 h-5 text-slate-600 mt-1" />
              <div>
                <h3 className="font-semibold text-slate-800">Privacidad</h3>
                <p className="text-sm text-slate-500 mt-1">Gestiona tu privacidad y datos</p>
              </div>
            </div>
            <Button variant="outline" size="sm">Configurar</Button>
          </div>
        </Card>

        {/* Logout */}
        <Card className="p-6 bg-red-50 border-red-200">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <LogOut className="w-5 h-5 text-red-600 mt-1" />
              <div>
                <h3 className="font-semibold text-red-700">Cerrar Sesión</h3>
                <p className="text-sm text-red-600 mt-1">Termina tu sesión actual</p>
              </div>
            </div>
            <Button variant="destructive" size="sm" onClick={handleLogout}>
              Cerrar Sesión
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}