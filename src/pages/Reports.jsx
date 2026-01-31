import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
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
  Download, 
  FileText, 
  Filter,
  Calendar,
  User,
  MapPin,
  Clock,
  TrendingUp,
  Bus,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import jsPDF from 'jspdf';

const statusConfig = {
  pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700' },
  accepted_by_driver: { label: 'Aceptado', color: 'bg-blue-100 text-blue-700' },
  in_trip: { label: 'En Viaje', color: 'bg-indigo-100 text-indigo-700' },
  completed: { label: 'Completado', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-700' }
};

export default function Reports() {
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDriver, setFilterDriver] = useState('all');
  const [filterRoute, setFilterRoute] = useState('all');

  const { data: allTrips = [] } = useQuery({
    queryKey: ['all-trips-reports'],
    queryFn: () => base44.entities.Trip.list('-created_date', 500),
    staleTime: 1000 * 60 * 5
  });

  const { data: allTripRequests = [] } = useQuery({
    queryKey: ['all-requests-reports'],
    queryFn: () => base44.entities.TripRequest.list('-created_date', 1000),
    staleTime: 1000 * 60 * 5
  });

  const { data: drivers = [] } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => base44.entities.Driver.list(),
    staleTime: 1000 * 60 * 5
  });

  // Apply filters
  const filteredRequests = allTripRequests.filter(req => {
    const reqDate = req.created_date?.split('T')[0] || '';
    const matchesDate = reqDate >= startDate && reqDate <= endDate;
    const matchesStatus = filterStatus === 'all' || req.status === filterStatus;
    const matchesDriver = filterDriver === 'all' || req.driver_id === filterDriver;
    const matchesRoute = filterRoute === 'all' || req.destination?.includes(filterRoute);
    
    return matchesDate && matchesStatus && matchesDriver && matchesRoute;
  });

  const filteredTrips = allTrips.filter(trip => {
    const tripDate = trip.scheduled_date || '';
    const matchesDate = tripDate >= startDate && tripDate <= endDate;
    const matchesDriver = filterDriver === 'all' || trip.driver_id === filterDriver;
    
    return matchesDate && matchesDriver;
  });

  // Calculate statistics
  const stats = {
    totalRequests: filteredRequests.length,
    completed: filteredRequests.filter(r => r.status === 'completed').length,
    cancelled: filteredRequests.filter(r => r.status === 'cancelled').length,
    inProgress: filteredRequests.filter(r => r.status === 'in_trip').length,
    totalTrips: filteredTrips.length,
    totalStudentsTransported: filteredTrips.reduce((sum, trip) => 
      sum + (trip.students?.length || 0), 0
    )
  };

  // Get unique routes
  const routes = [...new Set(allTripRequests.map(r => r.destination).filter(Boolean))];

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      'Fecha',
      'Hora',
      'Estudiante',
      'Origen',
      'Destino',
      'Estado',
      'Conductor',
      'Vehículo',
      'Hora Aceptación',
      'Hora Inicio',
      'Hora Completado'
    ];

    const rows = filteredRequests.map(req => [
      req.created_date?.split('T')[0] || '',
      req.pickup_time || new Date(req.created_date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      req.passenger_name || '',
      req.origin || '',
      req.destination || '',
      statusConfig[req.status]?.label || req.status,
      req.driver_name || 'Sin asignar',
      req.vehicle_info || '',
      req.accepted_at || '',
      req.started_at || '',
      req.completed_at || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `reporte_viajes_${startDate}_${endDate}.csv`;
    link.click();
    
    toast.success('Reporte CSV descargado');
  };

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(18);
    doc.text('Reporte de Viajes', 20, 20);
    
    doc.setFontSize(10);
    doc.text(`Período: ${startDate} a ${endDate}`, 20, 30);
    doc.text(`Generado: ${format(new Date(), "d 'de' MMMM yyyy HH:mm", { locale: es })}`, 20, 35);
    
    // Statistics
    doc.setFontSize(12);
    doc.text('Resumen:', 20, 45);
    
    doc.setFontSize(10);
    let y = 52;
    doc.text(`Total Solicitudes: ${stats.totalRequests}`, 25, y);
    doc.text(`Completadas: ${stats.completed}`, 25, y + 6);
    doc.text(`En Progreso: ${stats.inProgress}`, 25, y + 12);
    doc.text(`Canceladas: ${stats.cancelled}`, 25, y + 18);
    doc.text(`Total Viajes: ${stats.totalTrips}`, 25, y + 24);
    doc.text(`Estudiantes Transportados: ${stats.totalStudentsTransported}`, 25, y + 30);
    
    // Details
    y = 90;
    doc.setFontSize(12);
    doc.text('Detalle de Solicitudes:', 20, y);
    
    y += 7;
    doc.setFontSize(8);
    
    filteredRequests.slice(0, 30).forEach((req, idx) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      
      doc.text(`${idx + 1}. ${req.passenger_name} - ${req.destination}`, 25, y);
      doc.text(`   Estado: ${statusConfig[req.status]?.label || req.status}`, 30, y + 4);
      doc.text(`   Conductor: ${req.driver_name || 'N/A'}`, 30, y + 8);
      y += 14;
    });
    
    if (filteredRequests.length > 30) {
      doc.text(`... y ${filteredRequests.length - 30} más`, 25, y);
    }
    
    doc.save(`reporte_viajes_${startDate}_${endDate}.pdf`);
    toast.success('Reporte PDF descargado');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">Reportes de Viajes</h1>
        <p className="text-slate-500 mt-1">Genera informes detallados y exporta datos</p>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-slate-400" />
          <h3 className="font-semibold text-slate-700">Filtros de Reporte</h3>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Fecha Inicio</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Fecha Fin</label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Estado</label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="accepted_by_driver">Aceptado</SelectItem>
                <SelectItem value="in_trip">En Viaje</SelectItem>
                <SelectItem value="completed">Completado</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Conductor</label>
            <Select value={filterDriver} onValueChange={setFilterDriver}>
              <SelectTrigger>
                <SelectValue placeholder="Conductor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {drivers.map(driver => (
                  <SelectItem key={driver.id} value={driver.id}>
                    {driver.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Ruta/Destino</label>
            <Select value={filterRoute} onValueChange={setFilterRoute}>
              <SelectTrigger>
                <SelectValue placeholder="Ruta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {routes.slice(0, 20).map((route, idx) => (
                  <SelectItem key={idx} value={route}>
                    {route}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex gap-3 mt-4">
          <Button
            onClick={exportToCSV}
            variant="outline"
            className="flex-1 sm:flex-none"
            disabled={filteredRequests.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
          <Button
            onClick={exportToPDF}
            variant="outline"
            className="flex-1 sm:flex-none"
            disabled={filteredRequests.length === 0}
          >
            <FileText className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bus className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-slate-800">{stats.totalRequests}</div>
          </div>
          <div className="text-sm text-slate-500">Total Solicitudes</div>
        </Card>
        
        <Card className="p-5 border-l-4 border-green-500">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </div>
          <div className="text-sm text-slate-500">Completadas</div>
        </Card>
        
        <Card className="p-5 border-l-4 border-indigo-500">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Clock className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="text-2xl font-bold text-indigo-600">{stats.inProgress}</div>
          </div>
          <div className="text-sm text-slate-500">En Progreso</div>
        </Card>
        
        <Card className="p-5 border-l-4 border-red-500">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
          </div>
          <div className="text-sm text-slate-500">Canceladas</div>
        </Card>
        
        <Card className="p-5 border-l-4 border-purple-500">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-600">{stats.totalTrips}</div>
          </div>
          <div className="text-sm text-slate-500">Total Viajes</div>
        </Card>
        
        <Card className="p-5 border-l-4 border-teal-500">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-teal-100 rounded-lg">
              <User className="w-5 h-5 text-teal-600" />
            </div>
            <div className="text-2xl font-bold text-teal-600">{stats.totalStudentsTransported}</div>
          </div>
          <div className="text-sm text-slate-500">Estudiantes Transportados</div>
        </Card>
      </div>

      {/* Driver Performance */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-teal-600" />
          Rendimiento por Conductor
        </h3>
        <div className="space-y-3">
          {drivers.map(driver => {
            const driverRequests = filteredRequests.filter(r => r.driver_id === driver.id);
            const driverTrips = filteredTrips.filter(t => t.driver_id === driver.id);
            const completed = driverRequests.filter(r => r.status === 'completed').length;
            
            if (driverRequests.length === 0) return null;
            
            return (
              <div key={driver.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <div className="font-medium text-slate-800">{driver.full_name}</div>
                    <div className="text-xs text-slate-500">ID: {driver.driver_id}</div>
                  </div>
                </div>
                <div className="flex gap-6 text-sm">
                  <div className="text-center">
                    <div className="font-bold text-slate-800">{driverTrips.length}</div>
                    <div className="text-xs text-slate-500">Viajes</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-slate-800">{driverRequests.length}</div>
                    <div className="text-xs text-slate-500">Solicitudes</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-green-600">{completed}</div>
                    <div className="text-xs text-slate-500">Completadas</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-teal-600">
                      {driverRequests.length > 0 ? Math.round((completed / driverRequests.length) * 100) : 0}%
                    </div>
                    <div className="text-xs text-slate-500">Tasa Éxito</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Recent Requests Table */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          Solicitudes del Período ({filteredRequests.length})
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-2 text-slate-600 font-medium">Fecha</th>
                <th className="text-left py-3 px-2 text-slate-600 font-medium">Estudiante</th>
                <th className="text-left py-3 px-2 text-slate-600 font-medium">Destino</th>
                <th className="text-left py-3 px-2 text-slate-600 font-medium">Estado</th>
                <th className="text-left py-3 px-2 text-slate-600 font-medium">Conductor</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.slice(0, 50).map(req => (
                <tr key={req.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-2 text-slate-700">
                    {req.created_date ? new Date(req.created_date).toLocaleDateString('es-ES') : '-'}
                  </td>
                  <td className="py-3 px-2 text-slate-700">{req.passenger_name}</td>
                  <td className="py-3 px-2 text-slate-700">{req.destination}</td>
                  <td className="py-3 px-2">
                    <Badge className={statusConfig[req.status]?.color || 'bg-gray-100 text-gray-700'}>
                      {statusConfig[req.status]?.label || req.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-2 text-slate-700">{req.driver_name || 'Sin asignar'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredRequests.length > 50 && (
            <div className="text-center py-4 text-sm text-slate-500">
              Mostrando 50 de {filteredRequests.length} solicitudes. Exporta el reporte completo.
            </div>
          )}
          {filteredRequests.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              No hay solicitudes que coincidan con los filtros seleccionados
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}