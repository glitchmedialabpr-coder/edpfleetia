import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ClipboardList,
  Plus,
  Search,
  Calendar,
  Building2,
  Clock,
  FileText,
  Trash2,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import EmptyState from '../components/common/EmptyState';
import StatsCard from '../components/common/StatsCard';

export default function DailyReports() {
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [search, setSearch] = useState('');
  const [driverFilter, setDriverFilter] = useState('all');
  const [formData, setFormData] = useState({
    driver_id: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    work_summary: '',
    building_maintenance: [],
    other_activities: [],
    hours_worked: 0,
    start_time: '',
    end_time: '',
    notes: ''
  });
  const [buildingWork, setBuildingWork] = useState({ building_name: '', work_type: '', description: '', time_spent: '' });

  const queryClient = useQueryClient();

  const { data: reports = [] } = useQuery({
    queryKey: ['daily-reports'],
    queryFn: () => base44.entities.DailyWorkReport.list('-date', 200)
  });

  const { data: drivers = [] } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => base44.entities.Driver.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.DailyWorkReport.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['daily-reports']);
      setModalOpen(false);
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.DailyWorkReport.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['daily-reports'])
  });

  const resetForm = () => {
    setFormData({
      driver_id: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      work_summary: '',
      building_maintenance: [],
      other_activities: [],
      hours_worked: 0,
      start_time: '',
      end_time: '',
      notes: ''
    });
    setBuildingWork({ building_name: '', work_type: '', description: '', time_spent: '' });
  };

  const handleAddBuildingWork = () => {
    if (buildingWork.building_name && buildingWork.work_type) {
      setFormData({
        ...formData,
        building_maintenance: [...formData.building_maintenance, { ...buildingWork }]
      });
      setBuildingWork({ building_name: '', work_type: '', description: '', time_spent: '' });
    }
  };

  const handleRemoveBuildingWork = (index) => {
    setFormData({
      ...formData,
      building_maintenance: formData.building_maintenance.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = () => {
    const driver = drivers.find(d => d.id === formData.driver_id);
    createMutation.mutate({
      ...formData,
      driver_name: driver?.full_name || ''
    });
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      report.driver_name?.toLowerCase().includes(search.toLowerCase()) ||
      report.work_summary?.toLowerCase().includes(search.toLowerCase());
    const matchesDriver = driverFilter === 'all' || report.driver_id === driverFilter;
    return matchesSearch && matchesDriver;
  });

  const todayReports = reports.filter(r => r.date === format(new Date(), 'yyyy-MM-dd')).length;
  const totalHours = reports.reduce((sum, r) => sum + (r.hours_worked || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">Reportes Diarios</h1>
          <p className="text-slate-500 mt-1">Registro de trabajo diario de choferes</p>
        </div>
        <Button onClick={() => setModalOpen(true)} className="bg-teal-600 hover:bg-teal-700">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Reporte
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard title="Reportes Hoy" value={todayReports} icon={ClipboardList} color="teal" />
        <StatsCard title="Total Reportes" value={reports.length} icon={FileText} color="blue" />
        <StatsCard title="Horas Trabajadas" value={totalHours.toFixed(1)} icon={Clock} color="purple" />
      </div>

      <Card className="p-4 border-0 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Buscar reportes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={driverFilter} onValueChange={setDriverFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Chofer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los choferes</SelectItem>
              {drivers.map(driver => (
                <SelectItem key={driver.id} value={driver.id}>
                  {driver.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card className="border-0 shadow-sm overflow-hidden">
        {filteredReports.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No hay reportes"
            description="Los reportes diarios aparecerán aquí"
            action={() => setModalOpen(true)}
            actionLabel="Crear Reporte"
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Fecha</TableHead>
                  <TableHead>Chofer</TableHead>
                  <TableHead>Resumen</TableHead>
                  <TableHead>Mantenimiento Edificios</TableHead>
                  <TableHead>Horas</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map(report => (
                  <TableRow key={report.id} className="hover:bg-slate-50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="font-medium">
                          {report.date ? format(new Date(report.date), 'd MMM yyyy', { locale: es }) : '-'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-slate-700">{report.driver_name}</span>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="text-slate-600 truncate">{report.work_summary || '-'}</p>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-blue-100 text-blue-700">
                        {report.building_maintenance?.length || 0} tareas
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-slate-700">{report.hours_worked || 0}h</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedReport(report);
                            setViewModalOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMutation.mutate(report.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Create Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nuevo Reporte Diario</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Chofer</Label>
                <Select value={formData.driver_id} onValueChange={(val) => setFormData({ ...formData, driver_id: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {drivers.map(driver => (
                      <SelectItem key={driver.id} value={driver.id}>
                        {driver.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Fecha</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>Resumen del Trabajo</Label>
              <Textarea
                value={formData.work_summary}
                onChange={(e) => setFormData({ ...formData, work_summary: e.target.value })}
                placeholder="Describe el trabajo realizado..."
                rows={3}
              />
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Mantenimiento de Edificios
              </h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="Nombre del edificio"
                    value={buildingWork.building_name}
                    onChange={(e) => setBuildingWork({ ...buildingWork, building_name: e.target.value })}
                  />
                  <Input
                    placeholder="Tipo de trabajo"
                    value={buildingWork.work_type}
                    onChange={(e) => setBuildingWork({ ...buildingWork, work_type: e.target.value })}
                  />
                </div>
                <Input
                  placeholder="Descripción"
                  value={buildingWork.description}
                  onChange={(e) => setBuildingWork({ ...buildingWork, description: e.target.value })}
                />
                <div className="flex gap-3">
                  <Input
                    placeholder="Tiempo dedicado (ej: 2h)"
                    value={buildingWork.time_spent}
                    onChange={(e) => setBuildingWork({ ...buildingWork, time_spent: e.target.value })}
                  />
                  <Button onClick={handleAddBuildingWork} variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar
                  </Button>
                </div>
                {formData.building_maintenance.length > 0 && (
                  <div className="space-y-2 mt-3">
                    {formData.building_maintenance.map((work, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                        <div>
                          <p className="font-medium text-sm">{work.building_name} - {work.work_type}</p>
                          <p className="text-xs text-slate-600">{work.description}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveBuildingWork(idx)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Hora Inicio</Label>
                <Input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                />
              </div>
              <div>
                <Label>Hora Fin</Label>
                <Input
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                />
              </div>
              <div>
                <Label>Horas Trabajadas</Label>
                <Input
                  type="number"
                  value={formData.hours_worked}
                  onChange={(e) => setFormData({ ...formData, hours_worked: parseFloat(e.target.value) })}
                />
              </div>
            </div>

            <div>
              <Label>Notas Adicionales</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Notas..."
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!formData.driver_id || !formData.date}
                className="bg-teal-600 hover:bg-teal-700"
              >
                Guardar Reporte
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles del Reporte</DialogTitle>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Chofer</p>
                  <p className="font-semibold">{selectedReport.driver_name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Fecha</p>
                  <p className="font-semibold">
                    {format(new Date(selectedReport.date), 'd MMM yyyy', { locale: es })}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-500">Resumen</p>
                <p className="text-slate-700">{selectedReport.work_summary}</p>
              </div>
              {selectedReport.building_maintenance?.length > 0 && (
                <div>
                  <p className="text-sm text-slate-500 mb-2">Mantenimiento de Edificios</p>
                  <div className="space-y-2">
                    {selectedReport.building_maintenance.map((work, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded">
                        <p className="font-medium">{work.building_name} - {work.work_type}</p>
                        <p className="text-sm text-slate-600">{work.description}</p>
                        {work.time_spent && (
                          <p className="text-xs text-slate-500 mt-1">Tiempo: {work.time_spent}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Hora Inicio</p>
                  <p className="font-semibold">{selectedReport.start_time || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Hora Fin</p>
                  <p className="font-semibold">{selectedReport.end_time || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Horas</p>
                  <p className="font-semibold">{selectedReport.hours_worked}h</p>
                </div>
              </div>
              {selectedReport.notes && (
                <div>
                  <p className="text-sm text-slate-500">Notas</p>
                  <p className="text-slate-700">{selectedReport.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}