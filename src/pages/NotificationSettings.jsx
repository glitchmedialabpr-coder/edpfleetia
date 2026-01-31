import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Bell, Volume2, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { toast } from 'sonner';

const NOTIFICATION_TYPES = {
  new_requests: { label: 'Nuevas Solicitudes', icon: Bell, color: 'blue' },
  status_changes: { label: 'Cambios de Estado', icon: Clock, color: 'orange' },
  admin_messages: { label: 'Mensajes del Administrador', icon: Bell, color: 'purple' },
  license_expiry: { label: 'Vencimiento de Licencia', icon: Clock, color: 'red' },
  accidents: { label: 'Accidentes', icon: Bell, color: 'red' },
  vehicle_alerts: { label: 'Alertas de Vehículos', icon: Bell, color: 'yellow' },
  maintenance_due: { label: 'Mantenimiento Vencido', icon: Clock, color: 'green' }
};

const DAYS_OF_WEEK = [
  { id: 0, label: 'Domingo' },
  { id: 1, label: 'Lunes' },
  { id: 2, label: 'Martes' },
  { id: 3, label: 'Miércoles' },
  { id: 4, label: 'Jueves' },
  { id: 5, label: 'Viernes' },
  { id: 6, label: 'Sábado' }
];

const MONTHS = [
  { id: 1, label: 'Enero' },
  { id: 2, label: 'Febrero' },
  { id: 3, label: 'Marzo' },
  { id: 4, label: 'Abril' },
  { id: 5, label: 'Mayo' },
  { id: 6, label: 'Junio' },
  { id: 7, label: 'Julio' },
  { id: 8, label: 'Agosto' },
  { id: 9, label: 'Septiembre' },
  { id: 10, label: 'Octubre' },
  { id: 11, label: 'Noviembre' },
  { id: 12, label: 'Diciembre' }
];

export default function NotificationSettings() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [expandedType, setExpandedType] = useState(null);

  useEffect(() => {
    const pinUser = localStorage.getItem('pin_user');
    if (pinUser) {
      const userData = JSON.parse(pinUser);
      setUser(userData);
    }
  }, []);

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notification-settings', user?.id || user?.driver_id],
    queryFn: async () => {
      const driverId = user?.id || user?.driver_id;
      const result = await base44.entities.NotificationSettings.filter({
        driver_id: driverId
      });

      if (!result || result.length === 0) {
        // Crear notificaciones por defecto
        const defaultNotifications = Object.keys(NOTIFICATION_TYPES).map(type =>
          base44.entities.NotificationSettings.create({
            driver_id: driverId,
            driver_name: user?.full_name || user?.email,
            notification_type: type,
            enabled: true,
            sound_enabled: true,
            notification_sound: 'default',
            advance_minutes: 0,
            scheduled_time: '09:00',
            push_enabled: true
          })
        );
        return Promise.all(defaultNotifications);
      }
      return result;
    },
    enabled: !!(user?.id || user?.driver_id)
  });

  const updateMutation = useMutation({
    mutationFn: (data) =>
      base44.entities.NotificationSettings.update(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-settings'] });
      toast.success('Preferencias actualizadas');
    },
    onError: () => {
      toast.error('Error al guardar');
    }
  });

  const handleUpdateField = (notification, field, value) => {
    updateMutation.mutate({
      id: notification.id,
      [field]: value
    });
  };

  const toggleScheduleDay = (notification, day) => {
    const current = notification.scheduled_days || [];
    const updated = current.includes(day)
      ? current.filter(d => d !== day)
      : [...current, day];
    handleUpdateField(notification, 'scheduled_days', updated);
  };

  const toggleScheduleMonth = (notification, month) => {
    const current = notification.scheduled_months || [];
    const updated = current.includes(month)
      ? current.filter(m => m !== month)
      : [...current, month];
    handleUpdateField(notification, 'scheduled_months', updated);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse">Cargando configuración...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(createPageUrl('DriverDashboard'))}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Centro de Notificaciones</h1>
          <p className="text-slate-500 text-sm mt-1">Configura cada tipo de notificación</p>
        </div>
      </div>

      <div className="space-y-4">
        {notifications.map((notification) => {
          const notifType = NOTIFICATION_TYPES[notification.notification_type];
          const isExpanded = expandedType === notification.id;

          return (
            <Card
              key={notification.id}
              className={`p-6 border-l-4 transition-all ${
                notifType.color === 'blue'
                  ? 'border-blue-600'
                  : notifType.color === 'orange'
                  ? 'border-orange-600'
                  : notifType.color === 'purple'
                  ? 'border-purple-600'
                  : notifType.color === 'red'
                  ? 'border-red-600'
                  : notifType.color === 'yellow'
                  ? 'border-yellow-600'
                  : 'border-green-600'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4 cursor-pointer"
                onClick={() => setExpandedType(isExpanded ? null : notification.id)}>
                <div className="flex gap-3 flex-1">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    notifType.color === 'blue' ? 'bg-blue-50' :
                    notifType.color === 'orange' ? 'bg-orange-50' :
                    notifType.color === 'purple' ? 'bg-purple-50' :
                    notifType.color === 'red' ? 'bg-red-50' :
                    notifType.color === 'yellow' ? 'bg-yellow-50' :
                    'bg-green-50'
                  }`}>
                    <Bell className={`w-5 h-5 ${
                      notifType.color === 'blue' ? 'text-blue-600' :
                      notifType.color === 'orange' ? 'text-orange-600' :
                      notifType.color === 'purple' ? 'text-purple-600' :
                      notifType.color === 'red' ? 'text-red-600' :
                      notifType.color === 'yellow' ? 'text-yellow-600' :
                      'text-green-600'
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">{notifType.label}</h3>
                  </div>
                </div>
                <Switch
                  checked={notification.enabled || false}
                  onCheckedChange={() => handleUpdateField(notification, 'enabled', !notification.enabled)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              {/* Expandable Settings */}
              {isExpanded && (
                <div className="mt-6 space-y-4 pt-4 border-t border-slate-100">
                  {/* Sonido */}
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Volume2 className="w-4 h-4 text-slate-600" />
                    <label className="flex items-center gap-2 flex-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notification.sound_enabled || false}
                        onChange={(e) => handleUpdateField(notification, 'sound_enabled', e.target.checked)}
                        className="w-4 h-4 rounded"
                      />
                      <span className="text-sm text-slate-700">Reproducir sonido</span>
                    </label>
                  </div>

                  {/* Anticipación */}
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Clock className="w-4 h-4 text-slate-600" />
                    <label className="flex items-center gap-2 flex-1">
                      <span className="text-sm text-slate-700">Anticipación:</span>
                      <Input
                        type="number"
                        min="0"
                        max="120"
                        value={notification.advance_minutes || 0}
                        onChange={(e) => handleUpdateField(notification, 'advance_minutes', parseInt(e.target.value))}
                        className="w-20 h-8"
                      />
                      <span className="text-sm text-slate-600">minutos</span>
                    </label>
                  </div>

                  {/* Hora */}
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Clock className="w-4 h-4 text-slate-600" />
                    <label className="flex items-center gap-2 flex-1">
                      <span className="text-sm text-slate-700">Hora:</span>
                      <Input
                        type="time"
                        value={notification.scheduled_time || '09:00'}
                        onChange={(e) => handleUpdateField(notification, 'scheduled_time', e.target.value)}
                        className="w-32 h-8"
                      />
                    </label>
                  </div>

                  {/* Meses */}
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <label className="text-sm font-medium text-slate-700 block mb-3">Meses:</label>
                    <div className="grid grid-cols-3 gap-2">
                      {MONTHS.map(month => (
                        <label key={month.id} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={(notification.scheduled_months || []).includes(month.id)}
                            onChange={() => toggleScheduleMonth(notification, month.id)}
                            className="w-4 h-4 rounded"
                          />
                          <span className="text-xs text-slate-700">{month.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Días de la semana */}
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <label className="text-sm font-medium text-slate-700 block mb-3">Días de la semana:</label>
                    <div className="grid grid-cols-4 gap-2">
                      {DAYS_OF_WEEK.map(day => (
                        <label key={day.id} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={(notification.scheduled_days || []).includes(day.id)}
                            onChange={() => toggleScheduleDay(notification, day.id)}
                            className="w-4 h-4 rounded"
                          />
                          <span className="text-xs text-slate-700">{day.label.substring(0, 3)}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}