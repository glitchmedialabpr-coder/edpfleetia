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
  const [completeDialog, setCompleteDialog] = useState(null);
  const [newDate, setNewDate] = useState('');

  const { data: drivers = [] } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => base44.entities.Driver.list()
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => base44.entities.Vehicle.list()
  });

  // Función para determinar la etapa y severidad
  const getAlertStage = (days) => {
    if (days <= 1) return { stage: 3, severity: 'critical', label: 'CRÍTICO - 1 día' };
    if (days <= 15) return { stage: 2, severity: 'high', label: 'ALERTA - 15 días' };
    if (days <= 30) return { stage: 1, severity: 'medium', label: 'AVISO - 1 mes' };
    return null;
  };

  // Calcular alertas del sistema
  const systemAlerts = React.useMemo(() => {
    const alerts = [];

    // Licencias de choferes
    drivers.forEach(driver => {
      if (driver.license_expiry) {
        const days = differenceInDays(parseISO(driver.license_expiry), new Date());
        const stageInfo = getAlertStage(days);
        if (stageInfo && days <= 30) {
          alerts.push({
            id: `license-${driver.id}`,
            type: 'license_expiry',
            title: `Licencia de ${driver.full_name}`,
            description: `Número: ${driver.license_number} | Categoría: ${driver.license_category}`,
            message: days <= 0 ? 'Licencia vencida' : `Vence en ${days} días`,
            stage: stageInfo.stage,
            stageLabel: stageInfo.label,
            severity: stageInfo.severity,
            date: driver.license_expiry,
            entity: driver.full_name,
            entityId: driver.id,
            actionType: 'license'
          });
        }
      }
    });

    // Documentos de choferes (Marbete)
    drivers.forEach(driver => {
      driver.documents?.forEach(doc => {
        if (doc.type === 'license' && doc.expiry_date) {
          const days = differenceInDays(parseISO(doc.expiry_date), new Date());
          const stageInfo = getAlertStage(days);
          if (stageInfo && days <= 30) {
            alerts.push({
              id: `marbete-${driver.id}-${doc.name}`,
              type: 'marbete',
              title: `${doc.name} de ${driver.full_name}`,
              description: `Documento ID`,
              message: days <= 0 ? 'Marbete vencido' : `Vence en ${days} días`,
              stage: stageInfo.stage,
              stageLabel: stageInfo.label,
              severity: stageInfo.severity,
              date: doc.expiry_date,
              entity: driver.full_name,
              entityId: driver.id,
              actionType: 'marbete'
            });
          }
        }
      });
    });

    // Seguro de vehículos
    vehicles.forEach(vehicle => {
      if (vehicle.insurance_expiry) {
        const days = differenceInDays(parseISO(vehicle.insurance_expiry), new Date());
        const stageInfo = getAlertStage(days);
        if (stageInfo && days <= 30) {
          alerts.push({
            id: `insurance-${vehicle.id}`,
            type: 'vehicle_insurance',
            title: `Seguro ${vehicle.plate}`,
            description: `Vehículo: ${vehicle.brand} ${vehicle.model}`,
            message: days <= 0 ? 'Seguro vencido' : `Vence en ${days} días`,
            stage: stageInfo.stage,
            stageLabel: stageInfo.label,
            severity: stageInfo.severity,
            date: vehicle.insurance_expiry,
            entity: vehicle.plate,
            entityId: vehicle.id,
            actionType: 'insurance'
          });
        }
      }
    });

    // Mantenimiento próximo de vehículos
    vehicles.forEach(vehicle => {
      if (vehicle.next_service_date) {
        const days = differenceInDays(parseISO(vehicle.next_service_date), new Date());
        const stageInfo = getAlertStage(days);
        if (stageInfo && days <= 30 && days >= 0) {
          alerts.push({
            id: `maintenance-${vehicle.id}`,
            type: 'vehicle_maintenance',
            title: `Mantenimiento ${vehicle.plate}`,
            description: `Vehículo: ${vehicle.brand} ${vehicle.model} | Placa: ${vehicle.plate}`,
            message: days === 0 ? 'Mantenimiento hoy' : `Próximo servicio en ${days} días`,
            stage: stageInfo.stage,
            stageLabel: stageInfo.label,
            severity: stageInfo.severity,
            date: vehicle.next_service_date,
            entity: vehicle.plate,
            entityId: vehicle.id,
            actionType: 'maintenance'
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

  // Mutación para actualizar fechas
  const updateDateMutation = useMutation({
    mutationFn: async (data) => {
      const { entityType, entityId, fieldName, newDate } = data;
      
      if (entityType === 'driver') {
        await base44.entities.Driver.update(entityId, { [fieldName]: newDate });
      } else if (entityType === 'vehicle') {
        await base44.entities.Vehicle.update(entityId, { [fieldName]: newDate });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast.success('Fecha actualizada correctamente');
      setCompleteDialog(null);
      setNewDate('');
    },
    onError: () => {
      toast.error('Error al actualizar fecha');
    }
  });

  const handleCompleteAlert = (alert) => {
    setCompleteDialog(alert);
    setNewDate('');
  };

  const handleSaveNewDate = () => {
    if (!newDate) {
      toast.error('Por favor ingresa una fecha');
      return;
    }

    let fieldName = '';
    let entityType = '';

    if (completeDialog.actionType === 'license') {
      fieldName = 'license_expiry';
      entityType = 'driver';
    } else if (completeDialog.actionType === 'marbete') {
      fieldName = 'marbete_expiry';
      entityType = 'driver';
    } else if (completeDialog.actionType === 'insurance') {
      fieldName = 'insurance_expiry';
      entityType = 'vehicle';
    } else if (completeDialog.actionType === 'maintenance') {
      fieldName = 'next_service_date';
      entityType = 'vehicle';
    }

    updateDateMutation.mutate({
      entityType,
      entityId: completeDialog.entityId,
      fieldName,
      newDate
    });
  };

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
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <p className="text-slate-600 font-medium">Todo al día</p>
              <p className="text-slate-500 text-sm">No hay alertas por el momento</p>
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
                <div className="flex items-start gap-3 justify-between">
                  <div className="flex items-start gap-3 flex-1">
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
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-semibold ${
                          alert.severity === 'critical'
                            ? 'text-red-800'
                            : alert.severity === 'high'
                            ? 'text-orange-800'
                            : 'text-yellow-800'
                        }`}>
                          {alert.title}
                        </h3>
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${
                          alert.severity === 'critical'
                            ? 'bg-red-200 text-red-700'
                            : alert.severity === 'high'
                            ? 'bg-orange-200 text-orange-700'
                            : 'bg-yellow-200 text-yellow-700'
                        }`}>
                          {alert.stageLabel}
                        </span>
                      </div>
                      <p className={`text-xs mt-1 ${
                        alert.severity === 'critical'
                          ? 'text-red-700'
                          : alert.severity === 'high'
                          ? 'text-orange-700'
                          : 'text-yellow-700'
                      }`}>
                        {alert.description}
                      </p>
                      <p className={`text-sm font-medium mt-2 ${
                        alert.severity === 'critical'
                          ? 'text-red-800'
                          : alert.severity === 'high'
                          ? 'text-orange-800'
                          : 'text-yellow-800'
                      }`}>
                        {alert.message}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleCompleteAlert(alert)}
                    className={`flex-shrink-0 ml-4 ${
                      alert.severity === 'critical'
                        ? 'bg-red-600 hover:bg-red-700'
                        : alert.severity === 'high'
                        ? 'bg-orange-600 hover:bg-orange-700'
                        : 'bg-yellow-600 hover:bg-yellow-700'
                    }`}
                    size="sm"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Realizado
                  </Button>
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

      {/* Dialog para actualizar fecha */}
      <Dialog open={!!completeDialog} onOpenChange={(open) => {
        if (!open) {
          setCompleteDialog(null);
          setNewDate('');
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {completeDialog?.actionType === 'license' && 'Actualizar Licencia'}
              {completeDialog?.actionType === 'marbete' && 'Actualizar Marbete'}
              {completeDialog?.actionType === 'insurance' && 'Actualizar Seguro'}
              {completeDialog?.actionType === 'maintenance' && 'Próximo Mantenimiento'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-600 mb-2">
                {completeDialog?.type}
              </p>
              <p className="font-medium text-slate-800">{completeDialog?.title}</p>
              <p className="text-sm text-slate-500">{completeDialog?.description}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {completeDialog?.actionType === 'maintenance' 
                  ? 'Fecha del próximo mantenimiento' 
                  : 'Nueva fecha de vencimiento'}
              </label>
              <Input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                min={format(new Date(), 'yyyy-MM-dd')}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline"
              onClick={() => {
                setCompleteDialog(null);
                setNewDate('');
              }}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveNewDate}
              disabled={updateDateMutation.isPending}
              className="bg-teal-600 hover:bg-teal-700"
            >
              {updateDateMutation.isPending ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}