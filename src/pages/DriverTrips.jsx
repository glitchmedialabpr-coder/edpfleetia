import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Bus, Clock, CheckCircle2 } from 'lucide-react';
import TripCard from '../components/trips/TripCard';
import EmptyState from '../components/common/EmptyState';
import StatsCard from '../components/common/StatsCard';

export default function DriverTrips() {
  const [user, setUser] = useState(null);
  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const pinUser = localStorage.getItem('pin_user');
    if (pinUser) {
      const userData = JSON.parse(pinUser);
      setUser(userData);
    }
  };

  const { data: trips = [] } = useQuery({
    queryKey: ['driver-trips', user?.driver_id, user?.role],
    queryFn: () => {
      if (user?.role === 'admin') {
        return base44.entities.Trip.list('-scheduled_date');
      }
      return base44.entities.Trip.filter({ driver_id: user?.driver_id }, '-scheduled_date');
    },
    enabled: !!user?.driver_id || user?.role === 'admin',
    refetchInterval: 20000
  });

  const todayTrips = trips.filter(t => t.scheduled_date === today);
  const inProgressToday = todayTrips.filter(t => t.status === 'in_progress');
  const completedToday = todayTrips.filter(t => t.status === 'completed');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">
          {user?.role === 'admin' ? 'Todos los Viajes' : 'Mis Viajes'}
        </h1>
        <p className="text-slate-500 mt-1">
          {format(new Date(), "EEEE, d 'de' MMMM yyyy", { locale: es })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <StatsCard
          title="En Progreso"
          value={inProgressToday.length}
          icon={Clock}
          color="teal"
        />
        <StatsCard
          title="Completados"
          value={completedToday.length}
          icon={CheckCircle2}
          color="emerald"
        />
      </div>

      {/* In Progress Alert */}
      {inProgressToday.length > 0 && (
        <Card className="p-4 bg-teal-50 border-teal-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center animate-pulse">
              <Bus className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-teal-800">Viaje en Progreso</p>
              <p className="text-sm text-teal-600">
                Tienes {inProgressToday.length} viaje{inProgressToday.length > 1 ? 's' : ''} activo{inProgressToday.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Active Trips */}
      {inProgressToday.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Viajes Activos</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {inProgressToday.map(trip => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        </div>
      )}

      {/* Completed Trips */}
      {completedToday.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Completados Hoy</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {completedToday.map(trip => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        </div>
      )}

      {inProgressToday.length === 0 && completedToday.length === 0 && (
        <Card className="p-8">
          <EmptyState
            icon={Bus}
            title="Sin viajes hoy"
            description="Gestiona tus viajes desde Solicitudes"
          />
        </Card>
      )}
    </div>
  );
}