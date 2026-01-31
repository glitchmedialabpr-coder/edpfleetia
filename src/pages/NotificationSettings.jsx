import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ArrowLeft, Send, Bell, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { toast } from 'sonner';
import { differenceInDays, parseISO, format } from 'date-fns';

export default function NotificationSettings() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [message, setMessage] = useState('');
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { data: drivers = [] } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => base44.entities.Driver.list()
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => base44.entities.Vehicle.list()
  });

  // Calcular alertas del sistema
  const systemAlerts = React.useMemo(() => {
    const alerts = [];

    // Licencias de choferes vencidas o próximas a vencer
    drivers.forEach(driver => {
      if (driver.license_expiry) {
        const days = differenceInDays(parseISO(driver.license_expiry), new Date());
        if (days <= 30) {
          alerts.push({
            id: `license-${driver.id}`,
            type: 'license_expiry',
            title: `Licencia de ${driver.full_name}`,
            message: days <= 0 ? 'Licencia vencida' : `Vence en ${days} días`,
            severity: days <= 0 ? 'critical' : days <= 7 ? 'high' : 'medium',
            date: driver.license_expiry,
            entity: driver.full_name
          });
        }
      }
    });

    // Documentos de choferes vencidos
    drivers.forEach(driver => {
      driver.documents?.forEach(doc => {
        if (doc.expiry_date) {
          const days = differenceInDays(parseISO(doc.expiry_date), new Date());
          if (days <= 30) {
            alerts.push({
              id: `doc-${driver.id}-${doc.name}`,
              type: 'driver_document',
              title: `${doc.name} de ${driver.full_name}`,
              message: days <= 0 ? 'Documento vencido' : `Vence en ${days} días`,
              severity: days <= 0 ? 'critical' : days <= 7 ? 'high' : 'medium',
              date: doc.expiry_date,
              entity: driver.full_name
            });
          }
        }
      });
    });

    // Seguro de vehículos
    vehicles.forEach(vehicle => {
      if (vehicle.insurance_expiry) {
        const days = differenceInDays(parseISO(vehicle.insurance_expiry), new Date());
        if (days <= 30) {
          alerts.push({
            id: `insurance-${vehicle.id}`,
            type: 'vehicle_insurance',
            title: `Seguro ${vehicle.plate}`,
            message: days <= 0 ? 'Seguro vencido' : `Vence en ${days} días`,
            severity: days <= 0 ? 'critical' : days <= 7 ? 'high' : 'medium',
            date: vehicle.insurance_expiry,
            entity: vehicle.plate
          });
        }
      }
    });

    // Mantenimiento próximo de vehículos
    vehicles.forEach(vehicle => {
      if (vehicle.next_service_date) {
        const days = differenceInDays(parseISO(vehicle.next_service_date), new Date());
        if (days <= 30 && days >= 0) {
          alerts.push({
            id: `maintenance-${vehicle.id}`,
            type: 'vehicle_maintenance',
            title: `Mantenimiento ${vehicle.plate}`,
            message: `Próximo servicio en ${days} días`,
            severity: days <= 7 ? 'high' : 'medium',
            date: vehicle.next_service_date,
            entity: vehicle.plate
          });
        }
      }
    });

    // Ordenar por severidad y fecha
    return alerts.sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2 };
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[a.severity] - severityOrder[b.severity];
      }
      return new Date(a.date) - new Date(b.date);
    });
  }, [drivers, vehicles]);

  const createNotificationMutation = useMutation({
    mutationFn: (data) =>
      base44.entities.Notification.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notificación enviada');
      setTitle('');
      setMessage('');
      setSelectedDriver(null);
    },
    onError: () => {
      toast.error('Error al enviar notificación');
    }
  });

  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!selectedDriver || !title || !message) {
      toast.error('Completa todos los campos');
      return;
    }

    setIsLoading(true);
    createNotificationMutation.mutate({
      type: 'admin_message',
      title,
      message,
      driver_id: selectedDriver,
      driver_name: drivers.find(d => d.id === selectedDriver)?.full_name || 'Conductor',
      priority: 'high'
    });
    setIsLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(createPageUrl('Dashboard'))}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Centro de Notificaciones</h1>
          <p className="text-slate-500 text-sm mt-1">Gestiona notificaciones y alertas del sistema</p>
        </div>
      </div>

      <Tabs defaultValue="alerts" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-slate-100">
          <TabsTrigger value="alerts">
            <Bell className="w-4 h-4 mr-2" />
            Alertas del Sistema ({systemAlerts.length})
          </TabsTrigger>
          <TabsTrigger value="send">
            <Send className="w-4 h-4 mr-2" />
            Enviar Notificación
          </TabsTrigger>
        </TabsList>

        {/* Alertas del Sistema */}
        <TabsContent value="alerts" className="space-y-4">
          {systemAlerts.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="flex justify-center mb-3">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <Bell className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <p className="text-slate-600">No hay alertas por el momento</p>
            </Card>
          ) : (
            systemAlerts.map(alert => (
              <Card
                key={alert.id}
                className={`p-4 border-l-4 ${
                  alert.severity === 'critical'
                    ? 'border-red-600 bg-red-50'
                    : alert.severity === 'high'
                    ? 'border-orange-600 bg-orange-50'
                    : 'border-yellow-600 bg-yellow-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    alert.severity === 'critical'
                      ? 'bg-red-100'
                      : alert.severity === 'high'
                      ? 'bg-orange-100'
                      : 'bg-yellow-100'
                  }`}>
                    <AlertCircle className={`w-5 h-5 ${
                      alert.severity === 'critical'
                        ? 'text-red-600'
                        : alert.severity === 'high'
                        ? 'text-orange-600'
                        : 'text-yellow-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-semibold ${
                      alert.severity === 'critical'
                        ? 'text-red-800'
                        : alert.severity === 'high'
                        ? 'text-orange-800'
                        : 'text-yellow-800'
                    }`}>
                      {alert.title}
                    </h3>
                    <p className={`text-sm mt-1 ${
                      alert.severity === 'critical'
                        ? 'text-red-700'
                        : alert.severity === 'high'
                        ? 'text-orange-700'
                        : 'text-yellow-700'
                    }`}>
                      {alert.message}
                    </p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Enviar Notificación */}
        <TabsContent value="send">
          <Card className="p-6 border-l-4 border-teal-600">
            <form onSubmit={handleSendNotification} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Seleccionar Chofer</label>
                <select
                  value={selectedDriver || ''}
                  onChange={(e) => setSelectedDriver(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                >
                  <option value="">-- Selecciona un chofer --</option>
                  {drivers.map(driver => (
                    <option key={driver.id} value={driver.id}>
                      {driver.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Título</label>
                <Input
                  type="text"
                  placeholder="Ej: Actualización importante"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Mensaje</label>
                <textarea
                  placeholder="Escribe el mensaje..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 h-32"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-teal-600 hover:bg-teal-700 gap-2"
              >
                <Send className="w-4 h-4" />
                {isLoading ? 'Enviando...' : 'Enviar Notificación'}
              </Button>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}