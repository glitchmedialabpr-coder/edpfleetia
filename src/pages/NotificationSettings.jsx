import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Send, Bell, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { toast } from 'sonner';
import { differenceInDays, parseISO } from 'date-fns';

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
    <div className="max-w-3xl mx-auto space-y-6">
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
          <p className="text-slate-500 text-sm mt-1">Enviar notificaciones a choferes</p>
        </div>
      </div>

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
    </div>
  );
}