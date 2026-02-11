import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '../components/auth/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, LogOut, Smartphone, Monitor, Tablet, MapPin, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function ActiveSessions() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const response = await base44.functions.invoke('getActiveSessionsForUser', {});
      if (response?.data?.success) {
        setSessions(response.data.sessions || []);
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
      toast.error('Error cargando sesiones');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutSession = async (sessionId) => {
    try {
      // Eliminar sesión de BD
      await base44.asServiceRole.entities.UserSession.delete(sessionId);
      setSessions(sessions.filter(s => s.id !== sessionId));
      toast.success('Sesión cerrada');
    } catch (error) {
      console.error('Error logging out session:', error);
      toast.error('Error al cerrar sesión');
    }
  };

  const getDeviceIcon = (deviceType) => {
    switch (deviceType) {
      case 'mobile':
        return <Smartphone className="w-5 h-5 text-blue-600" />;
      case 'tablet':
        return <Tablet className="w-5 h-5 text-blue-600" />;
      default:
        return <Monitor className="w-5 h-5 text-blue-600" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Sesiones Activas</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Gestiona dónde has iniciado sesión en tu cuenta
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : sessions.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400">No hay sesiones activas</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {sessions.map((session) => (
            <Card key={session.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      {getDeviceIcon(session.device_type)}
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                          {session.browser} · {session.device_type.charAt(0).toUpperCase() + session.device_type.slice(1)}
                        </h3>
                        {session.is_current && (
                          <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100 px-2 py-1 rounded mt-1 inline-block">
                            Esta sesión
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span className="font-mono text-xs">{session.ip_address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>Acceso: {formatDate(session.login_time)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>Última actividad: {formatDate(session.last_activity)}</span>
                      </div>
                      {session.is_expired && (
                        <div className="text-orange-600 dark:text-orange-400 text-xs mt-2">
                          ⚠️ Sesión expirada
                        </div>
                      )}
                    </div>
                  </div>

                  {!session.is_current && !session.is_expired && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleLogoutSession(session.id)}
                      className="flex items-center gap-2 shrink-0"
                    >
                      <LogOut className="w-4 h-4" />
                      Cerrar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-blue-900 dark:text-blue-100 text-base">🔒 Seguridad de Sesiones</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
          <p>✓ Se registra cada inicio de sesión automáticamente</p>
          <p>✓ Cierra sesiones antiguas o que no reconozcas</p>
          <p>✓ Los datos sensibles se encriptan en la BD</p>
        </CardContent>
      </Card>
    </div>
  );
}