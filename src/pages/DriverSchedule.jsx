import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
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
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Clock, Edit2, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Copy } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import EmptyState from '../components/common/EmptyState';
import { format, startOfWeek, endOfWeek, addWeeks } from 'date-fns';
import { es } from 'date-fns/locale';

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const generateTimeOptions = () => {
  const options = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const hour24 = String(hour).padStart(2, '0');
      const minuteStr = String(minute).padStart(2, '0');
      const time24 = `${hour24}:${minuteStr}`;
      
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      const period = hour < 12 ? 'AM' : 'PM';
      const displayStr = `${displayHour}:${minuteStr} ${period}`;
      
      options.push({ value: time24, display: displayStr });
    }
  }
  return options;
};

const TIME_OPTIONS = generateTimeOptions();

export default function DriverSchedule() {
  const [editingDriver, setEditingDriver] = useState(null);
  const [formData, setFormData] = useState({
    weekly_schedule: []
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const queryClient = useQueryClient();

  const weekRange = useMemo(() => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const end = endOfWeek(selectedDate, { weekStartsOn: 1 });
    return { start, end };
  }, [selectedDate]);

  const weekDays = useMemo(() => {
    const days = [];
    const start = weekRange.start;
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      days.push(date);
    }
    return days;
  }, [weekRange]);

  const { data: drivers = [], isLoading } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => base44.entities.Driver.filter({ status: 'active' }),
    staleTime: 1000 * 60 * 5
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
          weekly_schedule: data.weekly_schedule
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Horario actualizado exitosamente');
      handleCloseDialog();
    },
    onError: (error) => {
      console.error('Error:', error);
      toast.error('Error al actualizar horario');
    }
  });

  const handleOpenDialog = (driver) => {
    setEditingDriver(driver);
    const schedule = driver.weekly_schedule || DAYS.map((_, idx) => ({
      day: idx,
      dayName: DAYS[idx],
      start_time: '',
      end_time: '',
      active: false
    }));
    setFormData({
      weekly_schedule: schedule
    });
  };

  const handleCloseDialog = () => {
    setEditingDriver(null);
    setFormData({
      weekly_schedule: []
    });
  };

  const updateScheduleDay = (dayIndex, field, value) => {
    setFormData(prev => ({
      ...prev,
      weekly_schedule: prev.weekly_schedule.map((day, idx) =>
        idx === dayIndex ? { ...day, [field]: value } : day
      )
    }));
  };

  const handleSave = () => {
    console.log('handleSave llamado');
    console.log('formData:', formData);
    console.log('editingDriver:', editingDriver);
    
    const hasActiveDay = formData.weekly_schedule.some(day => day.active);
    const allActiveDaysHaveTimes = formData.weekly_schedule
      .filter(day => day.active)
      .every(day => day.start_time && day.end_time);
    
    console.log('hasActiveDay:', hasActiveDay);
    console.log('allActiveDaysHaveTimes:', allActiveDaysHaveTimes);
    
    if (!hasActiveDay || !allActiveDaysHaveTimes) {
      toast.error('Completa todos los campos requeridos');
      return;
    }

    console.log('Enviando mutation con:', {
      driverId: editingDriver.id,
      data: formData
    });

    updateScheduleMutation.mutate({
      driverId: editingDriver.id,
      data: formData
    });
  };

  const handleCopyToAllDays = (dayIndex) => {
    const selectedDay = formData.weekly_schedule[dayIndex];
    if (!selectedDay.active || !selectedDay.start_time || !selectedDay.end_time) {
      toast.error('Selecciona un día con horario completo');
      return;
    }

    setFormData(prev => ({
      ...prev,
      weekly_schedule: prev.weekly_schedule.map(day => ({
        ...day,
        active: true,
        start_time: selectedDay.start_time,
        end_time: selectedDay.end_time
      }))
    }));
    toast.success('Horario aplicado a todos los días');
  };

  const convertTo12Hour = (time24) => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const period = hour < 12 ? 'AM' : 'PM';
    return `${displayHour}:${minutes} ${period}`;
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
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Horarios de Conductores</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Gestiona los horarios de trabajo de conductores</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <Input
          placeholder="Buscar por nombre o ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSelectedDate(prev => addWeeks(prev, -1))}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="min-w-[280px] justify-start">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(weekRange.start, 'dd MMM', { locale: es })} - {format(weekRange.end, 'dd MMM yyyy', { locale: es })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                locale={es}
              />
            </PopoverContent>
          </Popover>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setSelectedDate(prev => addWeeks(prev, 1))}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>

          <Button
            variant="outline"
            onClick={() => setSelectedDate(new Date())}
          >
            Hoy
          </Button>
        </div>
      </div>

      <Card className="p-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-2 text-sm text-blue-800 dark:text-blue-200">
          <CalendarIcon className="w-4 h-4" />
          <span className="font-medium">Semana seleccionada:</span>
          <div className="flex gap-2 flex-wrap">
            {weekDays.map((day, idx) => (
              <Badge key={idx} variant="outline" className="bg-white dark:bg-slate-800">
                {DAYS[idx]} {format(day, 'dd/MM')}
              </Badge>
            ))}
          </div>
        </div>
      </Card>

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
          filteredDrivers.map(driver => (
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
                      {driver.weekly_schedule && driver.weekly_schedule.length > 0 && (
                        <div className="space-y-1">
                          {driver.weekly_schedule.filter(day => day.active).map(day => (
                            <div key={day.day} className="flex items-center gap-2 text-slate-700">
                              <Clock className="w-4 h-4 text-teal-600" />
                              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                {day.dayName}
                              </Badge>
                              <span>{day.start_time} - {day.end_time}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <Drawer open={editingDriver?.id === driver.id} onOpenChange={(open) => {
                    if (!open) handleCloseDialog();
                  }}>
                    <DrawerTrigger asChild>
                      <Button
                        onClick={() => handleOpenDialog(driver)}
                        className="bg-teal-600 hover:bg-teal-700"
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Editar Horario
                      </Button>
                    </DrawerTrigger>
                    <DrawerContent>
                      <DrawerHeader>
                        <DrawerTitle>Editar Horario - {driver.full_name}</DrawerTitle>
                      </DrawerHeader>

                      <div className="space-y-4 px-4 pb-24 overflow-y-auto">
                        <div>
                          <label className="text-sm font-medium text-slate-700 block mb-3">
                            Resumen de Horarios
                          </label>
                          <Card className="border-slate-200 bg-slate-50 mb-4">
                            <CardContent className="p-3">
                              {formData.weekly_schedule.filter(day => day.active).length === 0 ? (
                                <p className="text-xs text-slate-500 text-center py-2">No hay horarios seleccionados</p>
                              ) : (
                                <div className="space-y-2">
                                  {formData.weekly_schedule.map((day, idx) => (
                                    day.active && (
                                      <div key={idx} className="flex items-center justify-between bg-white p-2 rounded border border-slate-200">
                                        <div className="flex-1">
                                          <p className="text-xs font-medium text-slate-700">
                                            {day.dayName}
                                          </p>
                                          <p className="text-xs text-slate-500">
                                            {format(weekDays[idx], 'dd MMM yyyy', { locale: es })}
                                          </p>
                                        </div>
                                        <div className="text-right">
                                          <p className="text-xs font-semibold text-teal-600">
                                            {convertTo12Hour(day.start_time)} - {convertTo12Hour(day.end_time)}
                                          </p>
                                        </div>
                                      </div>
                                    )
                                  ))}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-slate-700 block mb-3">
                            Horario Semanal
                          </label>
                          <div className="space-y-3">
                            {formData.weekly_schedule.map((day, idx) => (
                              <Card key={idx} className={day.active ? 'border-teal-200 bg-teal-50/50' : 'border-slate-200'}>
                                <CardContent className="p-3">
                                  <div className="flex items-center gap-2 mb-2">
                                    <input
                                      type="checkbox"
                                      checked={day.active}
                                      onChange={(e) => updateScheduleDay(idx, 'active', e.target.checked)}
                                      className="w-4 h-4 rounded border-slate-300"
                                    />
                                    <label className="font-medium text-slate-700">
                                      {day.dayName}
                                    </label>
                                  </div>
                                  {day.active && (
                                    <div className="space-y-2 ml-6">
                                      <div className="grid grid-cols-2 gap-2">
                                        <div>
                                          <label className="text-xs text-slate-600">Entrada</label>
                                          <Select value={day.start_time} onValueChange={(value) => updateScheduleDay(idx, 'start_time', value)}>
                                            <SelectTrigger className="h-9">
                                              <SelectValue placeholder="Seleccionar" />
                                            </SelectTrigger>
                                            <SelectContent className="max-h-48">
                                              {TIME_OPTIONS.map((time) => (
                                                <SelectItem key={time.value} value={time.value}>
                                                  {time.display}
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        <div>
                                          <label className="text-xs text-slate-600">Salida</label>
                                          <Select value={day.end_time} onValueChange={(value) => updateScheduleDay(idx, 'end_time', value)}>
                                            <SelectTrigger className="h-9">
                                              <SelectValue placeholder="Seleccionar" />
                                            </SelectTrigger>
                                            <SelectContent className="max-h-48">
                                              {TIME_OPTIONS.map((time) => (
                                                <SelectItem key={time.value} value={time.value}>
                                                  {time.display}
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      </div>
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleCopyToAllDays(idx)}
                                        className="w-full h-8 text-xs"
                                      >
                                        <Copy className="w-3 h-3 mr-1" />
                                        Copiar a todos los días
                                      </Button>
                                      </div>
                                      )}
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                          </div>
                          </div>

                          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
                          <Button
                          onClick={handleSave}
                          className="w-full bg-teal-600 hover:bg-teal-700"
                          disabled={updateScheduleMutation.isPending}
                          >
                          {updateScheduleMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
                          </Button>
                          </div>
                    </DrawerContent>
                  </Drawer>
                </div>
              </Card>
            )
          )
        )}
      </div>
    </div>
  );
}