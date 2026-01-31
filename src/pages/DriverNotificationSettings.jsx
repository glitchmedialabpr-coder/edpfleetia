import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Bell, Volume2, Radio, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { toast } from 'sonner';


export default function DriverNotificationSettings() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const pinUser = localStorage.getItem('pin_user');
    if (pinUser) {
      const userData = JSON.parse(pinUser);
      setUser(userData);
    }
  }, []);

  const { data: driverSettings, isLoading } = useQuery({
    queryKey: ['notification-settings', user?.driver_id],
    queryFn: async () => {
      const result = await base44.entities.DriverNotificationSettings.filter({
        driver_id: user?.driver_id
      });
      
      if (result?.length > 0) {
        return result[0];
      }
      
      // Create default settings if doesn't exist
      const newSettings = await base44.entities.DriverNotificationSettings.create({
        driver_id: user?.driver_id,
        driver_name: user?.full_name || user?.email,
        new_request_enabled: true,
        new_request_sound: true,
        status_change_enabled: true,
        admin_message_enabled: true,
        admin_message_sound: true,
        push_notifications_enabled: true,
        notification_sound: 'default'
      });
      return newSettings;
    },
    enabled: !!user?.driver_id
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.DriverNotificationSettings.update(driverSettings.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-settings'] });
      toast.success('Preferencias guardadas');
    },
    onError: () => {
      toast.error('Error al guardar preferencias');
    }
  });

  const handleToggle = (field) => {
    if (!driverSettings) return;
    const newValue = !driverSettings[field];
    setSettings({ ...currentSettings, [field]: newValue });
    updateMutation.mutate({ [field]: newValue });
  };

  const handleAdvanceMinutesChange = (field, value) => {
    const minutes = Math.max(0, parseInt(value) || 0);
    setSettings({ ...currentSettings, [field]: minutes });
    updateMutation.mutate({ [field]: minutes });
  };

  const currentSettings = settings || driverSettings;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse">Cargando preferencias...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(createPageUrl('DriverDashboard'))}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Preferencias de Notificaciones</h1>
          <p className="text-slate-500 text-sm mt-1">Personaliza cómo recibir alertas</p>
        </div>
      </div>

      {/* New Requests */}
      <Card className="p-6 border-l-4 border-blue-600">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Nuevas Solicitudes</h3>
                <p className="text-sm text-slate-500 mt-1">Recibe alertas cuando hay nuevas solicitudes de viaje disponibles</p>
              </div>
            </div>
            <Switch
              checked={currentSettings?.new_request_enabled || false}
              onCheckedChange={() => handleToggle('new_request_enabled')}
            />
          </div>

          {currentSettings?.new_request_enabled && (
            <div className="ml-13 space-y-3">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <Volume2 className="w-4 h-4 text-slate-600" />
                <label className="flex items-center gap-2 flex-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentSettings?.new_request_sound || false}
                    onChange={() => handleToggle('new_request_sound')}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm text-slate-700">Reproducir sonido</span>
                </label>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <Clock className="w-4 h-4 text-slate-600" />
                <label className="flex items-center gap-2 flex-1">
                  <span className="text-sm text-slate-700">Anticipación:</span>
                  <Input
                    type="number"
                    min="0"
                    max="120"
                    value={currentSettings?.new_request_advance_minutes || 0}
                    onChange={(e) => handleAdvanceMinutesChange('new_request_advance_minutes', e.target.value)}
                    className="w-20 h-8"
                  />
                  <span className="text-sm text-slate-600">minutos</span>
                </label>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Status Changes */}
      <Card className="p-6 border-l-4 border-orange-600">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                <Radio className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Cambios de Estado</h3>
                <p className="text-sm text-slate-500 mt-1">Notificaciones sobre cambios en tus viajes (inicio, entrega, completado)</p>
              </div>
            </div>
            <Switch
              checked={currentSettings?.status_change_enabled || false}
              onCheckedChange={() => handleToggle('status_change_enabled')}
            />
          </div>
          {currentSettings?.status_change_enabled && (
            <div className="ml-13 flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <Clock className="w-4 h-4 text-slate-600" />
              <label className="flex items-center gap-2 flex-1">
                <span className="text-sm text-slate-700">Anticipación:</span>
                <Input
                  type="number"
                  min="0"
                  max="120"
                  value={currentSettings?.status_change_advance_minutes || 0}
                  onChange={(e) => handleAdvanceMinutesChange('status_change_advance_minutes', e.target.value)}
                  className="w-20 h-8"
                />
                <span className="text-sm text-slate-600">minutos</span>
              </label>
            </div>
          )}
        </div>
      </Card>

      {/* Admin Messages */}
      <Card className="p-6 border-l-4 border-purple-600">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                <Bell className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Mensajes del Administrador</h3>
                <p className="text-sm text-slate-500 mt-1">Recibe mensajes y anuncios importantes del administrador</p>
              </div>
            </div>
            <Switch
              checked={currentSettings?.admin_message_enabled || false}
              onCheckedChange={() => handleToggle('admin_message_enabled')}
            />
          </div>

          {currentSettings?.admin_message_enabled && (
            <div className="ml-13 space-y-3">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <Volume2 className="w-4 h-4 text-slate-600" />
                <label className="flex items-center gap-2 flex-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentSettings?.admin_message_sound || false}
                    onChange={() => handleToggle('admin_message_sound')}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm text-slate-700">Reproducir sonido</span>
                </label>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <Clock className="w-4 h-4 text-slate-600" />
                <label className="flex items-center gap-2 flex-1">
                  <span className="text-sm text-slate-700">Anticipación:</span>
                  <Input
                    type="number"
                    min="0"
                    max="120"
                    value={currentSettings?.admin_message_advance_minutes || 0}
                    onChange={(e) => handleAdvanceMinutesChange('admin_message_advance_minutes', e.target.value)}
                    className="w-20 h-8"
                  />
                  <span className="text-sm text-slate-600">minutos</span>
                </label>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Push Notifications */}
      <Card className="p-6 border-l-4 border-teal-600">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                <Bell className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Notificaciones Push del Navegador</h3>
                <p className="text-sm text-slate-500 mt-1">Recibe alertas incluso cuando la aplicación está cerrada</p>
              </div>
            </div>
            <Switch
              checked={currentSettings?.push_notifications_enabled || false}
              onCheckedChange={() => handleToggle('push_notifications_enabled')}
            />
          </div>
          {currentSettings?.push_notifications_enabled && (
            <div className="ml-13 flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <Clock className="w-4 h-4 text-slate-600" />
              <label className="flex items-center gap-2 flex-1">
                <span className="text-sm text-slate-700">Anticipación:</span>
                <Input
                  type="number"
                  min="0"
                  max="120"
                  value={currentSettings?.push_notifications_advance_minutes || 0}
                  onChange={(e) => handleAdvanceMinutesChange('push_notifications_advance_minutes', e.target.value)}
                  className="w-20 h-8"
                />
                <span className="text-sm text-slate-600">minutos</span>
              </label>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}