import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { Loader2, GraduationCap, Building2 } from 'lucide-react';

export default function CreateTripModal({ open, onClose, onCreated }) {
  const [loading, setLoading] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const [students, setStudents] = useState([]);
  const [housings, setHousings] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [formData, setFormData] = useState({
    driver_id: '',
    driver_name: '',
    vehicle_id: '',
    scheduled_date: format(new Date(), 'yyyy-MM-dd'),
    scheduled_time: '',
    route_name: '',
    origin: 'EDP University',
    students: [],
    destinations: [],
    vehicle_info: '',
    notes: ''
  });
  const [selectedStudents, setSelectedStudents] = useState([]);

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  const loadData = async () => {
    try {
      const [driversData, studentsData, housingsData, vehiclesData] = await Promise.all([
        base44.entities.Driver.filter({ status: 'active' }),
        base44.entities.Student.filter({ status: 'active' }),
        base44.entities.Housing.list(),
        base44.entities.Vehicle.filter({ status: 'available' })
      ]);
      setDrivers(driversData);
      setStudents(studentsData);
      setHousings(housingsData);
      setVehicles(vehiclesData);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDriverChange = (driverId) => {
    const driver = drivers.find(d => d.id === driverId);
    setFormData({
      ...formData,
      driver_id: driverId,
      driver_name: driver?.full_name || driver?.email || ''
    });
  };

  const handleStudentToggle = (student) => {
    const isSelected = selectedStudents.find(s => s.id === student.id);
    if (isSelected) {
      setSelectedStudents(selectedStudents.filter(s => s.id !== student.id));
    } else {
      setSelectedStudents([...selectedStudents, student]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const studentData = selectedStudents.map(s => ({
      student_id: s.id,
      student_name: s.full_name,
      housing_name: s.housing_name || ''
    }));

    const destinations = [...new Set(selectedStudents.map(s => s.housing_name).filter(Boolean))];

    try {
      await base44.entities.Trip.create({
        ...formData,
        students: studentData,
        destinations,
        status: 'scheduled'
      });
      onCreated();
      onClose();
      setFormData({
        driver_id: '',
        driver_name: '',
        vehicle_id: '',
        scheduled_date: format(new Date(), 'yyyy-MM-dd'),
        scheduled_time: '',
        route_name: '',
        origin: 'EDP University',
        students: [],
        destinations: [],
        vehicle_info: '',
        notes: ''
      });
      setSelectedStudents([]);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al crear viaje');
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">Programar Nuevo Viaje</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-6 pb-4">
              {/* Driver & Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Chofer</Label>
                  <Select value={formData.driver_id} onValueChange={handleDriverChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar chofer" />
                    </SelectTrigger>
                    <SelectContent>
                      {drivers.map(driver => (
                        <SelectItem key={driver.id} value={driver.id}>
                          {driver.full_name} {driver.license_number ? `- Lic: ${driver.license_number}` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Fecha</Label>
                  <Input
                    type="date"
                    value={formData.scheduled_date}
                    onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Time & Route */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Hora de Salida (12 horas)</Label>
                  <Input
                    type="time"
                    value={formData.scheduled_time}
                    onChange={(e) => {
                      const time24 = e.target.value;
                      if (time24) {
                        const [hours, minutes] = time24.split(':');
                        const hour = parseInt(hours);
                        const period = hour >= 12 ? 'PM' : 'AM';
                        const hour12 = hour % 12 || 12;
                        const time12 = `${hour12}:${minutes} ${period}`;
                        setFormData({ ...formData, scheduled_time: time12 });
                      } else {
                        setFormData({ ...formData, scheduled_time: '' });
                      }
                    }}
                    required
                  />
                  {formData.scheduled_time && (
                    <p className="text-xs text-slate-500">{formData.scheduled_time}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Nombre de Ruta (opcional)</Label>
                  <Input
                    value={formData.route_name}
                    onChange={(e) => setFormData({ ...formData, route_name: e.target.value })}
                    placeholder="Ej: Ruta Norte"
                  />
                </div>
              </div>

              {/* Vehicle */}
              <div className="space-y-2">
                <Label>Vehículo</Label>
                <Select 
                  value={formData.vehicle_id} 
                  onValueChange={(value) => {
                    const vehicle = vehicles.find(v => v.id === value);
                    setFormData({ 
                      ...formData, 
                      vehicle_id: value,
                      vehicle_info: vehicle ? `${vehicle.brand} ${vehicle.model} - ${vehicle.plate}` : ''
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar vehículo" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map(vehicle => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.brand} {vehicle.model} - {vehicle.plate}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Students Selection */}
              <div className="space-y-3">
                <Label>Estudiantes ({selectedStudents.length} seleccionados)</Label>
                <div className="border rounded-xl divide-y max-h-64 overflow-y-auto">
                  {students.length === 0 ? (
                    <div className="p-6 text-center text-slate-500">
                      <GraduationCap className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      <p>No hay estudiantes registrados</p>
                    </div>
                  ) : (
                    students.map(student => (
                      <label
                        key={student.id}
                        className="flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        <Checkbox
                          checked={!!selectedStudents.find(s => s.id === student.id)}
                          onCheckedChange={() => handleStudentToggle(student)}
                        />
                        <div className="flex-1">
                          <p className="font-medium text-slate-800">{student.full_name}</p>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span>ID: {student.student_id}</span>
                            {student.housing_name && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Building2 className="w-3 h-3" />
                                  {student.housing_name}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label>Notas (opcional)</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Notas adicionales sobre el viaje..."
                  rows={3}
                />
              </div>
            </div>
          </ScrollArea>

          <div className="flex gap-3 pt-4 border-t mt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !formData.driver_id}
              className="flex-1 bg-teal-600 hover:bg-teal-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creando...
                </>
              ) : (
                'Crear Viaje'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}