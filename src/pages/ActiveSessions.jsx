import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '../components/auth/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
      const response = await base44.functions.invoke('getActiveSessionsForUser');
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
      const session = sessions.find(s => s.id === sessionId);
      if (!session) return;

      // Eliminar sesión
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
        return <Smartphone className="w-5 h-5" />;
      case 'tablet':
        return <Tablet className="w-5 h-5" />;
      default:
        return <Monitor className="w-5 h-5" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('es-ES');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Sesiones Activas</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Revisa todas las sesiones activas en tu cuenta
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
          {sessions.map((session, index) => (
            <Card key={session.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      {getDeviceIcon(session.device_type)}
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                          {session.device} - {session.device_type.charAt(0).toUpperCase() + session.device_type.slice(1)}
                        </h3>
                        {index === 0 && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded mt-1">
                            Sesión Actual
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>IP: {session.ip_address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>Acceso: {formatDate(session.login_time)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>Última actividad: {formatDate(session.last_activity)}</span>
                      </div>
                    </div>
                  </div>

                  {index !== 0 && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleLogoutSession(session.id)}
                      className="flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Cerrar Sesión
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
          <CardTitle className="text-blue-900 dark:text-blue-100">💡 Consejos de Seguridad</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
          <p>✓ Revisa regularmente las sesiones activas</p>
          <p>✓ Cierra sesiones que no reconozcas</p>
          <p>✓ Si ves actividad sospechosa, cambia tu contraseña</p>
          <p>✓ Usa una contraseña fuerte y única</p>
        </CardContent>
      </Card>
    </div>
  );
}