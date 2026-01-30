import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  MapPin, 
  Clock, 
  User, 
  Navigation,
  Car,
  TrendingUp,
  Activity,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import StatsCard from '../components/common/StatsCard';

const statusConfig = {
  pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700' },
  accepted: { label: 'Aceptado', color: 'bg-blue-100 text-blue-700' },
  in_progress: { label: 'En Progreso', color: 'bg-purple-100 text-purple-700' },
  completed: { label: 'Completado', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-700' }
};

export default function LiveTrips() {
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    const loadUser = async () => {
      const pinUser = localStorage.getItem('pin_user');
      if (pinUser) {
        const userData = JSON.parse(pinUser);
        if (userData.role !== 'admin') {
          window.location.href = '/';
          return;
        }
        setUser(userData);
      }
    };
    loadUser();
  }, []);

  const { data: allRequests = [], refetch } = useQuery({
    queryKey: ['all-trip-requests'],
    queryFn: () => base44.entities.TripRequest.list('-created_date'),
    enabled: !!user
  });

  useEffect(() => {
    const unsubscribe = base44.entities.TripRequest.subscribe(() => {
      refetch();
    });

    return unsubscribe;
  }, [refetch]);

  const is48HoursOld = (createdDate) => {
    const now = new Date();
    const created = new Date(createdDate);
    const diffMs = now - created;
    const diff48Hours = 48 * 60 * 60 * 1000;
    return diffMs > diff48Hours;
  };

  const recentRequests = allRequests.filter(r => !is48HoursOld(r.created_date));
  
  const activeRequests = recentRequests.filter(r => 
    ['pending', 'accepted', 'accepted_by_driver', 'in_trip'].includes(r.status)
  );
  const todayRequests = recentRequests.filter(r => {
    const today = new Date().toDateString();
    return new Date(r.created_date).toDateString() === today;
  });
  const completedToday = todayRequests.filter(r => r.status === 'completed').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">Monitoreo en Tiempo Real</h1>
        <p className="text-slate-500 mt-1">Seguimiento de solicitudes y viajes activos</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Viajes Activos"
          value={activeRequests.length}
          icon={Activity}
          color="blue"
        />
        <StatsCard
          title="Pendientes"
          value={allRequests.filter(r => r.status === 'pending').length}
          icon={Clock}
          color="yellow"
        />
        <StatsCard
          title="En Progreso"
          value={allRequests.filter(r => r.status === 'in_progress').length}
          icon={Navigation}
          color="purple"
        />
        <StatsCard
          title="Completados Hoy"
          value={completedToday}
          icon={TrendingUp}
          color="green"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Activos ({activeRequests.length})</TabsTrigger>
          <TabsTrigger value="today">Hoy ({todayRequests.length})</TabsTrigger>
          <TabsTrigger value="all">Todos ({allRequests.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4 mt-4">
          {activeRequests.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-slate-500">No hay viajes activos en este momento</p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {activeRequests.map(request => (
                <TripRequestCard key={request.id} request={request} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="today" className="space-y-4 mt-4">
          {todayRequests.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-slate-500">No hay viajes hoy</p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {todayRequests.map(request => (
                <TripRequestCard key={request.id} request={request} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4 mt-4">
          <div className="grid gap-4">
            {recentRequests.map(request => (
              <TripRequestCard key={request.id} request={request} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TripRequestCard({ request }) {
  const status = request.status && statusConfig[request.status] ? statusConfig[request.status] : statusConfig.pending;
  
  return (
    <Card className="p-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3">
            <Badge className={status.color}>
              {status.label}
            </Badge>
            <span className="text-sm text-slate-400">
              {new Date(request.created_date).toLocaleString()}
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <div className="flex items-start gap-2">
              <Navigation className="w-5 h-5 text-teal-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-slate-500">Origen</p>
                <p className="font-medium text-slate-800">{request.origin}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <MapPin className="w-5 h-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-slate-500">Destino</p>
                <p className="font-medium text-slate-800">{request.destination}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-slate-600">
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>{request.passenger_name}</span>
            </div>
            {request.pickup_time && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{request.pickup_time}</span>
              </div>
            )}
          </div>
        </div>

        {request.driver_name && (
          <div className="lg:w-64 p-3 bg-slate-50 rounded-lg">
            <p className="text-xs font-semibold text-slate-700 mb-2">Conductor</p>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <User className="w-4 h-4" />
                <span>{request.driver_name}</span>
              </div>
              {request.vehicle_info && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Car className="w-4 h-4" />
                  <span className="text-xs">{request.vehicle_info}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}