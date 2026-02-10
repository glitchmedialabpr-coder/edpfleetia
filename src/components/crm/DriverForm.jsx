import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import { X, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export default function DriverForm({ driver, onClose }) {
  const [formData, setFormData] = useState(driver || {
    driver_id: '',
    full_name: '',
    email: '',
    phone: '',
    license_number: '',
    license_category: 'B',
    license_expiry: '',
    hire_date: '',
    status: 'active',
    weekly_schedule: DAYS.map((dayName, idx) => ({
      day: idx,
      dayName,
      start_time: '',
      end_time: '',
      active: false
    }))
  });

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data) =>
      driver ? base44.entities.Driver.update(driver.id, data) : base44.entities.Driver.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      toast.success(driver ? 'Conductor actualizado' : 'Conductor creado');
      onClose();
    },
    onError: () => toast.error('Error al guardar conductor'),
  });

  const updateScheduleDay = (dayIndex, field, value) => {
    setFormData(prev => ({
      ...prev,
      weekly_schedule: prev.weekly_schedule.map((day, idx) =>
        idx === dayIndex ? { ...day, [field]: value } : day
      )
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <Card className="border-teal-200 dark:border-teal-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{driver ? 'Editar Conductor' : 'Nuevo Conductor'}</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="ID Conductor"
              placeholder="ID único"
              value={formData.driver_id}
              onChange={(e) => setFormData({...formData, driver_id: e.target.value})}
              required
            />
            <Input
              label="Nombre Completo"
              placeholder="Nombre completo"
              value={formData.full_name}
              onChange={(e) => setFormData({...formData, full_name: e.target.value})}
              required
            />
            <Input
              label="Email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
            <Input
              label="Teléfono"
              placeholder="Teléfono"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
            <Input
              label="Número de Licencia"
              placeholder="Número de licencia"
              value={formData.license_number}
              onChange={(e) => setFormData({...formData, license_number: e.target.value})}
              required
            />
            <div>
              <label className="text-sm font-medium mb-1 block">Categoría de Licencia</label>
              <Select
                value={formData.license_category}
                onValueChange={(value) => setFormData({...formData, license_category: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">A</SelectItem>
                  <SelectItem value="B">B</SelectItem>
                  <SelectItem value="C">C</SelectItem>
                  <SelectItem value="D">D</SelectItem>
                  <SelectItem value="E">E</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Estado</label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({...formData, status: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="inactive">Inactivo</SelectItem>
                  <SelectItem value="on_leave">Licencia</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Fecha de Contratación</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.hire_date ? format(new Date(formData.hire_date), 'PPP', { locale: es }) : 'Seleccionar fecha'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.hire_date ? new Date(formData.hire_date) : undefined}
                    onSelect={(date) => setFormData({...formData, hire_date: date ? format(date, 'yyyy-MM-dd') : ''})}
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Vencimiento de Licencia</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.license_expiry ? format(new Date(formData.license_expiry), 'PPP', { locale: es }) : 'Seleccionar fecha'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.license_expiry ? new Date(formData.license_expiry) : undefined}
                    onSelect={(date) => setFormData({...formData, license_expiry: date ? format(date, 'yyyy-MM-dd') : ''})}
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Horario Semanal</label>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {formData.weekly_schedule?.map((day, idx) => (
                <Card key={idx} className={day.active ? 'border-teal-200 bg-teal-50/50' : 'border-slate-200'}>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        checked={day.active}
                        onChange={(e) => updateScheduleDay(idx, 'active', e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300"
                      />
                      <label className="font-medium text-slate-700 text-sm">
                        {day.dayName}
                      </label>
                    </div>
                    {day.active && (
                      <div className="grid grid-cols-2 gap-2 ml-6">
                        <div>
                          <label className="text-xs text-slate-600">Entrada</label>
                          <Input
                            type="time"
                            value={day.start_time}
                            onChange={(e) => updateScheduleDay(idx, 'start_time', e.target.value)}
                            className="h-9"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-slate-600">Salida</label>
                          <Input
                            type="time"
                            value={day.end_time}
                            onChange={(e) => updateScheduleDay(idx, 'end_time', e.target.value)}
                            className="h-9"
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}