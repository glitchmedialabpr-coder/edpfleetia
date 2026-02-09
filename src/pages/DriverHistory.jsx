import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../components/auth/AuthContext';
import { Card } from '@/components/ui/card';
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
  Search, 
  History,
  Calendar,
  Users,
  Clock,
  CheckCircle2
} from 'lucide-react';
import EmptyState from '../components/common/EmptyState';
import StatsCard from '../components/common/StatsCard';
import { format, subDays } from 'date-fns';
import { es } from 'date-fns/locale';

export default function DriverHistory() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');

  const { data: trips = [] } = useQuery({
    queryKey: ['driver-history', user?.driver_id, user?.role],
    queryFn: () => {
      if (user?.role === 'admin') {
        return base44.entities.Trip.list('-scheduled_date', 100);
      }
      return base44.entities.Trip.filter({ driver_id: user?.driver_id }, '-scheduled_date', 100);
    },
    enabled: !!user && (!!user.driver_id || user.role === 'admin'),
    staleTime: 1000 * 60 * 5
  });

  const completedTrips = trips.filter(t => t.status === 'completed');
  
  // Stats
  const totalStudentsTransported = completedTrips.reduce((acc, trip) => acc + (trip.students?.length || 0), 0);
  const last7Days = completedTrips.filter(t => new Date(t.scheduled_date) >= subDays(new Date(), 7)).length;

  const filteredTrips = completedTrips.filter(trip =>
    trip.route_name?.toLowerCase().includes(search.toLowerCase()) ||
    trip.students?.some(s => s.student_name?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">
          {user?.role === 'admin' ? 'Historial de Todos los Viajes' : 'Mi Historial'}
        </h1>
        <p className="text-slate-500 mt-1">
          {user?.role === 'admin' ? 'Consulta todos los viajes completados' : 'Consulta tus viajes completados'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard
          title="Total Viajes"
          value={completedTrips.length}
          icon={CheckCircle2}
          color="emerald"
        />
        <StatsCard
          title="Últimos 7 días"
          value={last7Days}
          icon={Calendar}
          color="teal"
        />
        <StatsCard
          title="Estudiantes Transportados"
          value={totalStudentsTransported}
          icon={Users}
          color="purple"
        />
      </div>

      {/* Search */}
      <Card className="p-4 border-0 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Buscar por ruta o estudiante..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Table */}
      <Card className="border-0 shadow-sm overflow-hidden">
        {filteredTrips.length === 0 ? (
          <EmptyState
            icon={History}
            title="No hay viajes en tu historial"
            description="Tus viajes completados aparecerán aquí"
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Fecha</TableHead>
                  {user?.role === 'admin' && <TableHead>Conductor</TableHead>}
                  <TableHead>Ruta</TableHead>
                  <TableHead>Estudiantes</TableHead>
                  <TableHead>Salida</TableHead>
                  <TableHead>Llegada</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTrips.map(trip => (
                  <TableRow key={trip.id} className="hover:bg-slate-50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="font-medium text-slate-800">
                          {trip.scheduled_date ? format(new Date(trip.scheduled_date), 'd MMM yyyy', { locale: es }) : '-'}
                        </span>
                      </div>
                    </TableCell>
                    {user?.role === 'admin' && (
                      <TableCell className="text-slate-600 font-medium">
                        {trip.driver_name || '-'}
                      </TableCell>
                    )}
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
                      <div className="flex items-center gap-1 text-slate-500">
                        <Clock className="w-3 h-3" />
                        {trip.departure_time || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-emerald-100 text-emerald-700">
                        {trip.arrival_time || '-'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}