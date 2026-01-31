import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { createPageUrl } from '../utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  Search, 
  History as HistoryIcon,
  Calendar,
  User,
  Users,
  Clock,
  Filter,
  Car
} from 'lucide-react';
import EmptyState from '../components/common/EmptyState';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const statusConfig = {
  scheduled: { label: 'Programado', color: 'bg-amber-100 text-amber-700' },
  in_progress: { label: 'En Progreso', color: 'bg-blue-100 text-blue-700' },
  completed: { label: 'Completado', color: 'bg-emerald-100 text-emerald-700' },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-700' }
};

export default function History() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [driverFilter, setDriverFilter] = useState('all');
  const [user, setUser] = useState(null);

  React.useEffect(() => {
    const loadUser = async () => {
      const pinUser = localStorage.getItem('pin_user');
      if (pinUser) {
        const userData = JSON.parse(pinUser);
        if (userData.role !== 'admin') {
          window.location.href = createPageUrl('Dashboard');
          return;
        }
        setUser(userData);
      } else {
        window.location.href = createPageUrl('Home');
      }
    };
    loadUser();
  }, []);

  const { data: trips = [] } = useQuery({
    queryKey: ['trips-history'],
    queryFn: () => base44.entities.Trip.list('-scheduled_date', 200),
    enabled: !!user,
    staleTime: 1000 * 60 * 5
  });

  const { data: drivers = [] } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => base44.entities.Driver.list(),
    staleTime: 1000 * 60 * 5
  });

  const filteredTrips = trips.filter(trip => {
    const matchesSearch = 
      trip.driver_name?.toLowerCase().includes(search.toLowerCase()) ||
      trip.route_name?.toLowerCase().includes(search.toLowerCase()) ||
      trip.students?.some(s => s.student_name?.toLowerCase().includes(search.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || trip.status === statusFilter;
    const matchesDriver = driverFilter === 'all' || trip.driver_id === driverFilter;

    return matchesSearch && matchesStatus && matchesDriver;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">Historial de Viajes</h1>
        <p className="text-slate-500 mt-1">Consulta todos los viajes realizados</p>
      </div>

      {/* Filters */}
      <Card className="p-4 border-0 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Buscar por chofer, ruta o estudiante..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <Filter className="w-4 h-4 mr-2 text-slate-400" />
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="completed">Completados</SelectItem>
                <SelectItem value="scheduled">Programados</SelectItem>
                <SelectItem value="in_progress">En Progreso</SelectItem>
                <SelectItem value="cancelled">Cancelados</SelectItem>
              </SelectContent>
            </Select>

            <Select value={driverFilter} onValueChange={setDriverFilter}>
              <SelectTrigger className="w-48">
                <User className="w-4 h-4 mr-2 text-slate-400" />
                <SelectValue placeholder="Chofer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los choferes</SelectItem>
                {drivers.map(driver => (
                  <SelectItem key={driver.id} value={driver.id}>
                    {driver.full_name || driver.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="border-0 shadow-sm overflow-hidden">
        {filteredTrips.length === 0 ? (
          <EmptyState
            icon={HistoryIcon}
            title="No hay viajes en el historial"
            description="Los viajes completados aparecerán aquí"
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Fecha</TableHead>
                  <TableHead>Chofer</TableHead>
                  <TableHead>Vehículo</TableHead>
                  <TableHead>Ruta</TableHead>
                  <TableHead>Estudiantes</TableHead>
                  <TableHead>Horario</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTrips.map(trip => {
                  const status = statusConfig[trip.status] || statusConfig.scheduled;
                  return (
                    <TableRow key={trip.id} className="hover:bg-slate-50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <div>
                            <p className="font-medium text-slate-800">
                              {trip.scheduled_date ? format(new Date(trip.scheduled_date), 'd MMM yyyy', { locale: es }) : '-'}
                            </p>
                            {trip.scheduled_time && (
                              <p className="text-xs text-slate-500">{trip.scheduled_time}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-semibold text-teal-600">
                              {trip.driver_name?.charAt(0) || '?'}
                            </span>
                          </div>
                          <span className="text-slate-700">{trip.driver_name || 'Sin asignar'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600 text-sm">
                        {trip.vehicle_info || '-'}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {trip.route_name || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-600">{trip.students?.length || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {trip.departure_time && (
                            <div className="flex items-center gap-1 text-slate-500">
                              <Clock className="w-3 h-3" />
                              Salida: {trip.departure_time}
                            </div>
                          )}
                          {trip.arrival_time && (
                            <div className="flex items-center gap-1 text-emerald-600">
                              <Clock className="w-3 h-3" />
                              Llegada: {trip.arrival_time}
                            </div>
                          )}
                          {!trip.departure_time && !trip.arrival_time && (
                            <span className="text-slate-400">-</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={status.color}>
                          {status.label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}