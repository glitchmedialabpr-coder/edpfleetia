import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Bell, X, CheckCircle, AlertCircle, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const typeConfig = {
  new_request: { icon: Bell, color: 'text-blue-600', bg: 'bg-blue-50' },
  new_trip_request: { icon: Bell, color: 'text-teal-600', bg: 'bg-teal-50' },
  status_change: { icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50' },
  trip_deleted: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
  driver_issue: { icon: AlertCircle, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  task_completed: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
  admin_message: { icon: MessageSquare, color: 'text-purple-600', bg: 'bg-purple-50' }
};

export default function NotificationCenter({ user }) {
  const [isOpen, setIsOpen] = useState(false);

  const { data: notifications = [], refetch } = useQuery({
    queryKey: ['notifications', user?.driver_id || user?.email],
    queryFn: async () => {
      // For drivers, filter by driver_id
      if (user?.driver_id) {
        return base44.entities.Notification.filter({
          driver_id: user.driver_id
        }, '-created_date', 50);
      }
      // For admins, filter by created_by (their email)
      if (user?.role === 'admin') {
        return base44.entities.Notification.filter({
          created_by: user.email
        }, '-created_date', 50);
      }
      return [];
    },
    enabled: !!(user?.driver_id || user?.role === 'admin'),
    staleTime: 1000 * 5,
    refetchInterval: 1000 * 10
  });

  useEffect(() => {
    if (!user?.driver_id && user?.role !== 'admin') return;

    const unsubscribe = base44.entities.Notification.subscribe((event) => {
      // For drivers, check driver_id
      if (user?.driver_id && event.data?.driver_id === user.driver_id) {
        refetch();
        // Play notification sound for high priority
        if (event.data?.priority === 'high' && event.type === 'create') {
          const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSA0PVa3m8KlbGAg+lunywHAlBSuAzPLaizsIGWi77OihUBELTKXh8bVnHgU2jdXx0H0pBSh+yPDajkEKElyx5O+qWBUIQ5zd8sFuJAUthM/z1YU2Bhxqvu7mnU0QDlOq5O+0aBwGNo/U8dCBKgUrfs7y2Iw+CRZmu+rloVITC0mi4PG4aiEFMIjO8tSCMwYfbsDv45lIDg9Wreb0qVoXCT+W6fK+bSMFLIHN8tmJOAgZaLvt559NEAxPqOPwtmQcBjiP1/HNeSYEKn/M8Nr+');
          audio.play().catch(() => {});
        }
      }
      // For admins, check created_by
      if (user?.role === 'admin' && event.data?.created_by === user.email) {
        refetch();
        // Play notification sound for high priority
        if (event.data?.priority === 'high' && event.type === 'create') {
          const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSA0PVa3m8KlbGAg+lunywHAlBSuAzPLaizsIGWi77OihUBELTKXh8bVnHgU2jdXx0H0pBSh+yPDajkEKElyx5O+qWBUIQ5zd8sFuJAUthM/z1YU2Bhxqvu7mnU0QDlOq5O+0aBwGNo/U8dCBKgUrfs7y2Iw+CRZmu+rloVITC0mi4PG4aiEFMIjO8tSCMwYfbsDv45lIDg9Wreb0qVoXCT+W6fK+bSMFLIHN8tmJOAgZaLvt559NEAxPqOPwtmQcBjiP1/HNeSYEKn/M8Nr+');
          audio.play().catch(() => {});
        }
      }
    });

    return () => unsubscribe();
  }, [user?.driver_id, user?.role, user?.email, refetch]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = async (notificationId) => {
    await base44.entities.Notification.update(notificationId, { read: true });
    refetch();
  };

  const handleClearAll = async () => {
    for (const notification of notifications) {
      await base44.entities.Notification.update(notification.id, { read: true });
    }
    refetch();
  };

  const config = typeConfig[notifications[0]?.type] || typeConfig.new_request;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative hover:bg-slate-100"
      >
        <Bell className="w-5 h-5 text-slate-600" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
            {unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-96 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-slate-100 p-4 flex justify-between items-center">
            <h3 className="font-semibold text-slate-800">Notificaciones</h3>
            {unreadCount > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleClearAll}
                className="text-xs text-slate-500 hover:text-slate-700"
              >
                Marcar todo como leído
              </Button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">Sin notificaciones</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {notifications.map(notification => {
                const Config = typeConfig[notification.type] || typeConfig.new_request;
                const Icon = Config.icon;
                return (
                  <div
                    key={notification.id}
                    className={cn(
                      'p-4 hover:bg-slate-50 transition-colors cursor-pointer',
                      !notification.read && 'bg-blue-50'
                    )}
                    onClick={() => handleMarkAsRead(notification.id)}
                  >
                    <div className="flex gap-3">
                      <div className={cn('flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center', Config.bg)}>
                        <Icon className={cn('w-5 h-5', Config.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-slate-800">{notification.title}</p>
                        <p className="text-xs text-slate-500 line-clamp-2 mt-1">{notification.message}</p>
                        <p className="text-xs text-slate-400 mt-2">
                          {new Date(notification.created_date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-600 mt-2" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}