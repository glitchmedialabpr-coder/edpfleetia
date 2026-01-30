import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Clock, Edit2, Plus, Trash2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import EmptyState from '../components/common/EmptyState';

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export default function DriverSchedule() {
  const [editingDriver, setEditingDriver] = useState(null);
  const [formData, setFormData] = useState({
    shift_duration: 8,
    shift_start_time: '06:00',
    shift_days: [],
    assigned_vehicle_id: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  const { data: drivers = [], isLoading } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => base44.entities.Driver.filter({ status: 'active' })
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => base44.entities.Vehicle.filter({ status: 'available' })
  });

  const updateScheduleMutation = useMutation({
    mutationFn: async ({ driverId, data }) => {
      await base44.entities.Driver.update(driverId, data);
      
      // Crear notificación para admins
      await base44.entities.Notification.create({
        type: 'schedule_change',
        title: 'Horario de Conductor Actualizado',
        message: `Se actualizó el horario de ${editingDriver.full_name}`,
        driver_id: editingDriver.driver_id,
        driver_name: editingDriver.full_name,
        priority: 'medium',
        data: {
          shift_duration: data.shift_duration,
          shift_start_time: data.shift_start_time,
          shift_days: data.shift_days
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Horario actualizado exitosamente');
      handleCloseDialog();
    },
    onError: () => toast.error('Error al actualizar horario')
  });

  const handleOpenDialog = (driver) => {
    setEditingDriver(driver);
    setFormData({
      shift_duration: driver.shift_duration || 8,
      shift_start_time: driver.shift_start_time || '06:00',
      shift_days: driver.shift_days || [],
      assigned_vehicle_id: driver.assigned_vehicle_id || ''
    });
  };

  const handleCloseDialog = () => {
    setEditingDriver(null);
    setFormData({
      shift_duration: 8,
      shift_start_time: '06:00',
      shift_days: [],
      assigned_vehicle_id: ''
    });
  };

  const toggleDay = (dayIndex) => {
    setFormData(prev => ({
      ...prev,
      shift_days: prev.shift_days.includes(dayIndex)
        ? prev.shift_days.filter(d => d !== dayIndex)
        : [...prev.shift_days, dayIndex].sort((a, b) => a - b)
    }));
  };

  const handleSave = () => {
    if (!formData.shift_start_time || formData.shift_days.length === 0 || !formData.assigned_vehicle_id) {
      toast.error('Completa todos los campos');
      return;
    }

    updateScheduleMutation.mutate({
      driverId: editingDriver.id,
      data: formData
    });
  };

  const filteredDrivers = drivers.filter(driver =>
    driver.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.driver_id.includes(searchTerm)
  );

  if (isLoading) {
    return <div className="text-center py-8">Cargando...</div>;
  }

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Horarios de Conductores</h1>
        <p className="text-slate-500 mt-1">Gestiona turnos y asignaciones de vehículos</p>
      </div>

      <Input
        placeholder="Buscar por nombre o ID..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-md"
      />

      <div className="grid gap-4">
        {filteredDrivers.length === 0 ? (
          <Card className="p-8">
            <EmptyState
              icon={Clock}
              title="No hay conductores"
              description="No se encontraron conductores activos"
            />
          </Card>
        ) : (
          filteredDrivers.map(driver => {
            const vehicle = vehicles.find(v => v.id === driver.assigned_vehicle_id);
            const shiftEndTime = driver.shift_start_time
              ? new Date(`2000-01-01 ${driver.shift_start_time}`)
                  .setHours(
                    new Date(`2000-01-01 ${driver.shift_start_time}`).getHours() +
                    (driver.shift_duration || 8)
                  )
              : null;

            return (
              <Card key={driver.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div>
                        <h3 className="font-semibold text-slate-800 text-lg">{driver.full_name}</h3>
                        <p className="text-sm text-slate-500">ID: {driver.driver_id}</p>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      {driver.shift_start_time && (
                        <div className="flex items-center gap-2 text-slate-700">
                          <Clock className="w-4 h-4 text-teal-600" />
                          <span>
                            {driver.shift_start_time} - {driver.shift_duration} horas
                          </span>
                        </div>
                      )}

                      {driver.shift_days && driver.shift_days.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {driver.shift_days.map(dayIdx => (
                            <Badge key={dayIdx} variant="outline" className="bg-blue-50 text-blue-700">
                              {DAYS[dayIdx]}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {vehicle && (
                        <div className="flex items-center gap-2 text-slate-700">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>Vehículo: {vehicle.brand} {vehicle.model} - {vehicle.plate}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Dialog open={editingDriver?.id === driver.id} onOpenChange={(open) => {
                    if (!open) handleCloseDialog();
                  }}>
                    <DialogTrigger asChild>
                      <Button
                        onClick={() => handleOpenDialog(driver)}
                        className="bg-teal-600 hover:bg-teal-700"
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Editar Horario
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Editar Horario - {driver.full_name}</DialogTitle>
                      </DialogHeader>

                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-slate-700">
                            Duración del Turno
                          </label>
                          <Select
                            value={String(formData.shift_duration)}
                            onValueChange={(val) =>
                              setFormData(prev => ({ ...prev, shift_duration: parseInt(val) }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="8">8 horas</SelectItem>
                              <SelectItem value="12">12 horas</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-slate-700">
                            Hora de Inicio
                          </label>
                          <Input
                            type="time"
                            value={formData.shift_start_time}
                            onChange={(e) =>
                              setFormData(prev => ({ ...prev, shift_start_time: e.target.value }))
                            }
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium text-slate-700 block mb-2">
                            Días de Trabajo
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {DAYS.map((day, idx) => (
                              <Button
                                key={idx}
                                variant={formData.shift_days.includes(idx) ? 'default' : 'outline'}
                                onClick={() => toggleDay(idx)}
                                className={
                                  formData.shift_days.includes(idx)
                                    ? 'bg-teal-600 hover:bg-teal-700'
                                    : ''
                                }
                                size="sm"
                              >
                                {day.substring(0, 3)}
                              </Button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-slate-700">
                            Vehículo Asignado
                          </label>
                          <Select
                            value={formData.assigned_vehicle_id}
                            onValueChange={(val) =>
                              setFormData(prev => ({ ...prev, assigned_vehicle_id: val }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona vehículo" />
                            </SelectTrigger>
                            <SelectContent>
                              {vehicles.map(v => (
                                <SelectItem key={v.id} value={v.id}>
                                  {v.brand} {v.model} - {v.plate}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <Button
                          onClick={handleSave}
                          className="w-full bg-teal-600 hover:bg-teal-700"
                          disabled={updateScheduleMutation.isPending}
                        >
                          Guardar Cambios
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}