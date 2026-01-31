import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Settings as SettingsIcon,
  Bell,
  Users,
  Bus,
  Shield,
  Save,
  Download,
  Upload,
  RefreshCw,
  Database,
  Clock,
  MessageSquare,
  AlertTriangle,
  Video,
  Loader2,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [settings, setSettings] = useState({
    // General
    app_name: 'EDP Transport',
    request_timeout_minutes: '5',
    max_passengers_per_trip: '4',
    enable_auto_assign: 'false',
    
    // Notifications
    notify_on_new_request: 'true',
    notify_on_trip_complete: 'true',
    notify_on_driver_login: 'true',
    notification_sound: 'true',
    
    // Trips
    require_trip_approval: 'false',
    allow_trip_cancellation: 'true',
    min_advance_booking_minutes: '15',
    max_trip_duration_hours: '8',
    
    // Users
    require_student_id: 'true',
    auto_create_student_account: 'true',
    driver_shift_reminder_hours: '2',
    
    // System
    backup_frequency_days: '7',
    data_retention_days: '365',
    enable_analytics: 'true'
  });

  const { data: savedSettings = [] } = useQuery({
    queryKey: ['app-settings'],
    queryFn: () => base44.entities.AppSettings.list()
  });

  useEffect(() => {
    if (savedSettings.length > 0) {
      const settingsObj = {};
      savedSettings.forEach(setting => {
        settingsObj[setting.setting_key] = setting.setting_value;
        if (setting.setting_key === 'splash_video_url') {
          setVideoUrl(setting.setting_value);
        }
      });
      setSettings(prev => ({ ...prev, ...settingsObj }));
    }
  }, [savedSettings]);

  const saveSettingMutation = useMutation({
    mutationFn: async ({ key, value, category, description }) => {
      const existing = savedSettings.find(s => s.setting_key === key);
      if (existing) {
        return base44.entities.AppSettings.update(existing.id, {
          setting_value: value,
          category,
          description
        });
      } else {
        return base44.entities.AppSettings.create({
          setting_key: key,
          setting_value: value,
          category,
          description
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['app-settings']);
    }
  });

  const handleSave = async () => {
    try {
      const settingsToSave = [
        // General
        { key: 'app_name', value: settings.app_name, category: 'general', description: 'Nombre de la aplicación' },
        { key: 'request_timeout_minutes', value: settings.request_timeout_minutes, category: 'general', description: 'Tiempo de espera para solicitudes' },
        { key: 'max_passengers_per_trip', value: settings.max_passengers_per_trip, category: 'general', description: 'Máximo de pasajeros por viaje' },
        { key: 'enable_auto_assign', value: settings.enable_auto_assign, category: 'general', description: 'Asignación automática de conductores' },
        
        // Notifications
        { key: 'notify_on_new_request', value: settings.notify_on_new_request, category: 'notifications', description: 'Notificar en nueva solicitud' },
        { key: 'notify_on_trip_complete', value: settings.notify_on_trip_complete, category: 'notifications', description: 'Notificar al completar viaje' },
        { key: 'notify_on_driver_login', value: settings.notify_on_driver_login, category: 'notifications', description: 'Notificar inicio de sesión conductor' },
        { key: 'notification_sound', value: settings.notification_sound, category: 'notifications', description: 'Sonido de notificaciones' },
        
        // Trips
        { key: 'require_trip_approval', value: settings.require_trip_approval, category: 'trips', description: 'Requerir aprobación de viajes' },
        { key: 'allow_trip_cancellation', value: settings.allow_trip_cancellation, category: 'trips', description: 'Permitir cancelación de viajes' },
        { key: 'min_advance_booking_minutes', value: settings.min_advance_booking_minutes, category: 'trips', description: 'Minutos mínimos para reservar' },
        { key: 'max_trip_duration_hours', value: settings.max_trip_duration_hours, category: 'trips', description: 'Duración máxima de viaje' },
        
        // Users
        { key: 'require_student_id', value: settings.require_student_id, category: 'users', description: 'Requerir ID de estudiante' },
        { key: 'auto_create_student_account', value: settings.auto_create_student_account, category: 'users', description: 'Crear cuentas automáticamente' },
        { key: 'driver_shift_reminder_hours', value: settings.driver_shift_reminder_hours, category: 'users', description: 'Recordatorio de turno (horas)' },
        
        // System
        { key: 'backup_frequency_days', value: settings.backup_frequency_days, category: 'system', description: 'Frecuencia de respaldo (días)' },
        { key: 'data_retention_days', value: settings.data_retention_days, category: 'system', description: 'Retención de datos (días)' },
        { key: 'enable_analytics', value: settings.enable_analytics, category: 'system', description: 'Habilitar analíticas' }
      ];

      for (const setting of settingsToSave) {
        await saveSettingMutation.mutateAsync(setting);
      }

      toast.success('Configuración guardada exitosamente');
    } catch (error) {
      toast.error('Error al guardar configuración');
    }
  };

  const handleExportData = async () => {
    try {
      const [trips, students, drivers, vehicles] = await Promise.all([
        base44.entities.Trip.list('-created_date', 1000),
        base44.entities.Student.list(),
        base44.entities.Driver.list(),
        base44.entities.Vehicle.list()
      ]);

      const exportData = {
        exported_at: new Date().toISOString(),
        trips,
        students,
        drivers,
        vehicles,
        settings: savedSettings
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success('Datos exportados exitosamente');
    } catch (error) {
      toast.error('Error al exportar datos');
    }
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      toast.error('Por favor selecciona un archivo de video');
      return;
    }

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      const existingSetting = savedSettings.find(s => s.setting_key === 'splash_video_url');
      
      if (existingSetting) {
        await base44.entities.AppSettings.update(existingSetting.id, {
          setting_value: file_url
        });
      } else {
        await base44.entities.AppSettings.create({
          setting_key: 'splash_video_url',
          setting_value: file_url,
          category: 'general',
          description: 'URL del video splash de bienvenida'
        });
      }

      setVideoUrl(file_url);
      queryClient.invalidateQueries(['app-settings']);
      toast.success('Video subido exitosamente');
    } catch (error) {
      toast.error('Error al subir el video');
    }
    setUploading(false);
  };

  const handleResetToDefaults = () => {
    if (confirm('¿Está seguro de restaurar la configuración predeterminada?')) {
      setSettings({
        app_name: 'EDP Transport',
        request_timeout_minutes: '5',
        max_passengers_per_trip: '4',
        enable_auto_assign: 'false',
        notify_on_new_request: 'true',
        notify_on_trip_complete: 'true',
        notify_on_driver_login: 'true',
        notification_sound: 'true',
        require_trip_approval: 'false',
        allow_trip_cancellation: 'true',
        min_advance_booking_minutes: '15',
        max_trip_duration_hours: '8',
        require_student_id: 'true',
        auto_create_student_account: 'true',
        driver_shift_reminder_hours: '2',
        backup_frequency_days: '7',
        data_retention_days: '365',
        enable_analytics: 'true'
      });
      toast.success('Configuración restaurada');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">Configuración General</h1>
          <p className="text-slate-500 mt-1">Administra las preferencias y ajustes del sistema</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportData}>
            <Download className="w-4 h-4 mr-2" />
            Exportar Datos
          </Button>
          <Button onClick={handleSave} className="bg-teal-600 hover:bg-teal-700">
            <Save className="w-4 h-4 mr-2" />
            Guardar Cambios
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">
            <SettingsIcon className="w-4 h-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            Notificaciones
          </TabsTrigger>
          <TabsTrigger value="trips">
            <Bus className="w-4 h-4 mr-2" />
            Viajes
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="w-4 h-4 mr-2" />
            Usuarios
          </TabsTrigger>
          <TabsTrigger value="system">
            <Shield className="w-4 h-4 mr-2" />
            Sistema
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Configuración General</CardTitle>
              <CardDescription>Ajustes básicos de la aplicación</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="app_name">Nombre de la Aplicación</Label>
                <Input
                  id="app_name"
                  value={settings.app_name}
                  onChange={(e) => setSettings({...settings, app_name: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="request_timeout">Tiempo de Espera para Solicitudes (minutos)</Label>
                <Input
                  id="request_timeout"
                  type="number"
                  value={settings.request_timeout_minutes}
                  onChange={(e) => setSettings({...settings, request_timeout_minutes: e.target.value})}
                />
                <p className="text-xs text-slate-500">
                  Tiempo que el conductor tiene para aceptar o rechazar una solicitud
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_passengers">Máximo de Pasajeros por Viaje</Label>
                <Input
                  id="max_passengers"
                  type="number"
                  value={settings.max_passengers_per_trip}
                  onChange={(e) => setSettings({...settings, max_passengers_per_trip: e.target.value})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Asignación Automática de Conductores</Label>
                  <p className="text-sm text-slate-500">
                    Asignar automáticamente el conductor disponible más cercano
                  </p>
                </div>
                <Switch
                  checked={settings.enable_auto_assign === 'true'}
                  onCheckedChange={(checked) => 
                    setSettings({...settings, enable_auto_assign: checked ? 'true' : 'false'})
                    }
                    />
                    </div>

                    <div className="pt-6 border-t space-y-4">
                    <div className="space-y-2">
                    <Label>Video de Inicio de Sesión</Label>
                    <p className="text-sm text-slate-500">
                    Video que se reproduce después de iniciar sesión
                    </p>
                    </div>

                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-6">
                    <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="hidden"
                    id="video-upload"
                    disabled={uploading}
                    />
                    <label 
                    htmlFor="video-upload"
                    className="cursor-pointer flex flex-col items-center gap-3"
                    >
                    {uploading ? (
                      <Loader2 className="w-10 h-10 text-slate-400 animate-spin" />
                    ) : videoUrl ? (
                      <CheckCircle className="w-10 h-10 text-green-500" />
                    ) : (
                      <Video className="w-10 h-10 text-slate-400" />
                    )}
                    <div className="text-center">
                      <p className="font-medium text-slate-700">
                        {uploading ? 'Subiendo...' : videoUrl ? 'Video Configurado' : 'Subir Video'}
                      </p>
                      <p className="text-sm text-slate-500 mt-1">
                        {videoUrl ? 'Haz clic para cambiar el video' : 'Formatos: MP4, MOV, AVI'}
                      </p>
                    </div>
                    </label>
                    </div>

                    {videoUrl && (
                    <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-700">Vista previa:</p>
                    <video
                      src={videoUrl}
                      controls
                      className="w-full rounded-lg max-h-48"
                    />
                    </div>
                    )}
                    </div>
                    </CardContent>
                    </Card>
                    </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Notificaciones</CardTitle>
              <CardDescription>Gestiona las notificaciones del sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificar en Nueva Solicitud</Label>
                  <p className="text-sm text-slate-500">
                    Enviar notificación cuando hay una nueva solicitud de viaje
                  </p>
                </div>
                <Switch
                  checked={settings.notify_on_new_request === 'true'}
                  onCheckedChange={(checked) => 
                    setSettings({...settings, notify_on_new_request: checked ? 'true' : 'false'})
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificar al Completar Viaje</Label>
                  <p className="text-sm text-slate-500">
                    Enviar notificación cuando un viaje es completado
                  </p>
                </div>
                <Switch
                  checked={settings.notify_on_trip_complete === 'true'}
                  onCheckedChange={(checked) => 
                    setSettings({...settings, notify_on_trip_complete: checked ? 'true' : 'false'})
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificar Inicio de Sesión de Conductor</Label>
                  <p className="text-sm text-slate-500">
                    Enviar notificación cuando un conductor inicia sesión
                  </p>
                </div>
                <Switch
                  checked={settings.notify_on_driver_login === 'true'}
                  onCheckedChange={(checked) => 
                    setSettings({...settings, notify_on_driver_login: checked ? 'true' : 'false'})
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Sonido de Notificaciones</Label>
                  <p className="text-sm text-slate-500">
                    Reproducir sonido con las notificaciones
                  </p>
                </div>
                <Switch
                  checked={settings.notification_sound === 'true'}
                  onCheckedChange={(checked) => 
                    setSettings({...settings, notification_sound: checked ? 'true' : 'false'})
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trips Settings */}
        <TabsContent value="trips">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Viajes</CardTitle>
              <CardDescription>Ajustes relacionados con la gestión de viajes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Requerir Aprobación de Viajes</Label>
                  <p className="text-sm text-slate-500">
                    Los viajes requieren aprobación administrativa antes de iniciar
                  </p>
                </div>
                <Switch
                  checked={settings.require_trip_approval === 'true'}
                  onCheckedChange={(checked) => 
                    setSettings({...settings, require_trip_approval: checked ? 'true' : 'false'})
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Permitir Cancelación de Viajes</Label>
                  <p className="text-sm text-slate-500">
                    Los usuarios pueden cancelar sus solicitudes de viaje
                  </p>
                </div>
                <Switch
                  checked={settings.allow_trip_cancellation === 'true'}
                  onCheckedChange={(checked) => 
                    setSettings({...settings, allow_trip_cancellation: checked ? 'true' : 'false'})
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="min_booking">Tiempo Mínimo de Anticipación (minutos)</Label>
                <Input
                  id="min_booking"
                  type="number"
                  value={settings.min_advance_booking_minutes}
                  onChange={(e) => setSettings({...settings, min_advance_booking_minutes: e.target.value})}
                />
                <p className="text-xs text-slate-500">
                  Tiempo mínimo que debe pasar antes de solicitar un viaje
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_duration">Duración Máxima de Viaje (horas)</Label>
                <Input
                  id="max_duration"
                  type="number"
                  value={settings.max_trip_duration_hours}
                  onChange={(e) => setSettings({...settings, max_trip_duration_hours: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Settings */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Usuarios</CardTitle>
              <CardDescription>Gestión de cuentas y permisos de usuarios</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Requerir ID de Estudiante</Label>
                  <p className="text-sm text-slate-500">
                    Los estudiantes deben tener un ID válido para usar el sistema
                  </p>
                </div>
                <Switch
                  checked={settings.require_student_id === 'true'}
                  onCheckedChange={(checked) => 
                    setSettings({...settings, require_student_id: checked ? 'true' : 'false'})
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Crear Cuentas Automáticamente</Label>
                  <p className="text-sm text-slate-500">
                    Crear cuenta de estudiante automáticamente al primer inicio de sesión
                  </p>
                </div>
                <Switch
                  checked={settings.auto_create_student_account === 'true'}
                  onCheckedChange={(checked) => 
                    setSettings({...settings, auto_create_student_account: checked ? 'true' : 'false'})
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shift_reminder">Recordatorio de Turno (horas antes)</Label>
                <Input
                  id="shift_reminder"
                  type="number"
                  value={settings.driver_shift_reminder_hours}
                  onChange={(e) => setSettings({...settings, driver_shift_reminder_hours: e.target.value})}
                />
                <p className="text-xs text-slate-500">
                  Enviar recordatorio a conductores antes de su turno
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings */}
        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>Configuración del Sistema</CardTitle>
              <CardDescription>Ajustes avanzados y mantenimiento del sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="backup_freq">Frecuencia de Respaldo (días)</Label>
                <Input
                  id="backup_freq"
                  type="number"
                  value={settings.backup_frequency_days}
                  onChange={(e) => setSettings({...settings, backup_frequency_days: e.target.value})}
                />
                <p className="text-xs text-slate-500">
                  Cada cuántos días se debe realizar un respaldo automático
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="retention">Retención de Datos (días)</Label>
                <Input
                  id="retention"
                  type="number"
                  value={settings.data_retention_days}
                  onChange={(e) => setSettings({...settings, data_retention_days: e.target.value})}
                />
                <p className="text-xs text-slate-500">
                  Tiempo que se mantienen los datos históricos en el sistema
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Habilitar Analíticas</Label>
                  <p className="text-sm text-slate-500">
                    Recopilar datos de uso para mejorar el sistema
                  </p>
                </div>
                <Switch
                  checked={settings.enable_analytics === 'true'}
                  onCheckedChange={(checked) => 
                    setSettings({...settings, enable_analytics: checked ? 'true' : 'false'})
                  }
                />
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium text-slate-800 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  Zona de Peligro
                </h4>
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    onClick={handleResetToDefaults}
                    className="w-full border-orange-200 hover:bg-orange-50 text-orange-700"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Restaurar Configuración Predeterminada
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={handleExportData}
                    className="w-full"
                  >
                    <Database className="w-4 h-4 mr-2" />
                    Crear Respaldo Manual de Datos
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}