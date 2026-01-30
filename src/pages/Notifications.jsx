import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Bell,
  Trash2,
  Check,
  Clock,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import EmptyState from '../components/common/EmptyState';

const typeConfig = {
  schedule_change: {
    icon: Clock,
    label: 'Cambio de Horario',
    color: 'bg-blue-100 text-blue-700'
  },
  driver_login: {
    icon: Check,
    label: 'Inicio de Sesión',
    color: 'bg-green-100 text-green-700'
  },
  trip_completed: {
    icon: CheckCircle,
    label: 'Viaje Completado',
    color: 'bg-emerald-100 text-emerald-700'
  },
  accident_reported: {
    icon: AlertCircle,
    label: 'Accidente Reportado',
    color: 'bg-red-100 text-red-700'
  },
  system: {
    icon: Info,
    label: 'Sistema',
    color: 'bg-slate-100 text-slate-700'
  }
};

const priorityConfig = {
  low: { label: 'Baja', color: 'bg-blue-50 border-blue-200' },
  medium: { label: 'Media', color: 'bg-yellow-50 border-yellow-200' },
  high: { label: 'Alta', color: 'bg-red-50 border-red-200' }
};

export default function Notifications() {
  const [filter, setFilter] = useState('all');
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => base44.entities.Notification.list('-created_date', 100),
    refetchInterval: 5000
  });

  const markAsReadMutation = useMutation({
    mutationFn: ({ notificationId, data }) =>
      base44.entities.Notification.update(notificationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: (notificationId) =>
      base44.entities.Notification.delete(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notificación eliminada');
    }
  });

  const handleMarkAsRead = (notification) => {
    if (!notification.read) {
      const now = new Date().toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      });
      markAsReadMutation.mutate({
        notificationId: notification.id,
        data: {
          read: true,
          read_at: now
        }
      });
    }
  };

  const handleDelete = (notificationId) => {
    deleteNotificationMutation.mutate(notificationId);
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.read;
    return n.priority === filter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Notificaciones</h1>
        <p className="text-slate-500 mt-1">
          {unreadCount > 0 && (
            <Badge className="bg-red-500 text-white mr-2">
              {unreadCount} sin leer
            </Badge>
          )}
          Gestiona todas tus notificaciones
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="unread">Sin leer</SelectItem>
            <SelectItem value="high">Prioridad Alta</SelectItem>
            <SelectItem value="medium">Prioridad Media</SelectItem>
            <SelectItem value="low">Prioridad Baja</SelectItem>
          </SelectContent>
        </Select>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            onClick={() => {
              notifications
                .filter(n => !n.read)
                .forEach(n => handleMarkAsRead(n));
            }}
            className="border-teal-200 text-teal-600 hover:bg-teal-50"
          >
            <Check className="w-4 h-4 mr-2" />
            Marcar todo como leído
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <Card className="p-8">
            <EmptyState
              icon={Bell}
              title="No hay notificaciones"
              description={
                filter === 'all'
                  ? 'Todas tus notificaciones aparecerán aquí'
                  : 'No hay notificaciones con este filtro'
              }
            />
          </Card>
        ) : (
          filteredNotifications.map(notification => {
            const typeInfo = typeConfig[notification.type] || typeConfig.system;
            const TypeIcon = typeInfo.icon;
            const priorityInfo =
              priorityConfig[notification.priority || 'medium'];

            return (
              <Card
                key={notification.id}
                className={`p-4 sm:p-6 border-l-4 transition-all ${
                  !notification.read
                    ? 'border-l-teal-600 bg-teal-50'
                    : 'border-l-slate-200 bg-white'
                } ${priorityInfo.color}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex gap-3 flex-1">
                    <div
                      className={`p-2 rounded-lg h-fit ${
                        typeInfo.color
                      }`}
                    >
                      <TypeIcon className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-800">
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <div className="w-2 h-2 rounded-full bg-teal-600" />
                        )}
                      </div>

                      <p className="text-sm text-slate-600 mb-2">
                        {notification.message}
                      </p>

                      {notification.driver_name && (
                        <p className="text-xs text-slate-500">
                          Conductor: {notification.driver_name}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {typeInfo.label}
                        </Badge>
                        {notification.priority && (
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              notification.priority === 'high'
                                ? 'bg-red-50 text-red-700'
                                : notification.priority === 'medium'
                                ? 'bg-yellow-50 text-yellow-700'
                                : 'bg-blue-50 text-blue-700'
                            }`}
                          >
                            {priorityConfig[notification.priority]?.label}
                          </Badge>
                        )}
                      </div>

                      {notification.read_at && (
                        <p className="text-xs text-slate-400 mt-2">
                          Leído a las {notification.read_at}
                        </p>
                      )}

                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(
                          notification.created_date
                        ).toLocaleString('es-ES')}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    {!notification.read && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMarkAsRead(notification)}
                        className="border-teal-200 text-teal-600 hover:bg-teal-50"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(notification.id)}
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}