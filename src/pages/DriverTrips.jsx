import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Bus, 
  Clock, 
  CheckCircle2,
  Calendar
} from 'lucide-react';
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
    const userData = await base44.auth.me();
    setUser(userData);
  };

  const { data: trips = [], refetch } = useQuery({
    queryKey: ['driver-trips', user?.id],
    queryFn: () => base44.entities.Trip.filter({ driver_id: user?.id }, '-scheduled_date'),
    enabled: !!user?.id
  });

  const todayTrips = trips.filter(t => t.scheduled_date === today);
  const scheduledToday = todayTrips.filter(t => t.status === 'scheduled');
  const inProgressToday = todayTrips.filter(t => t.status === 'in_progress');
  const completedToday = todayTrips.filter(t => t.status === 'completed');

  const handleStartTrip = async (trip) => {
    const now = format(new Date(), 'HH:mm');
    await base44.entities.Trip.update(trip.id, {
      status: 'in_progress',
      departure_time: now
    });
    refetch();
  };

  const handleCompleteTrip = async (trip) => {
    const now = format(new Date(), 'HH:mm');
    await base44.entities.Trip.update(trip.id, {
      status: 'completed',
      arrival_time: now
    });
    refetch();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">Mis Viajes</h1>
        <p className="text-slate-500 mt-1">
          {format(new Date(), "EEEE, d 'de' MMMM yyyy", { locale: es })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatsCard
          title="Programados"
          value={scheduledToday.length}
          icon={Calendar}
          color="amber"
        />
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

      {/* Today's Trips */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="bg-slate-100 mb-4">
          <TabsTrigger value="pending">
            Pendientes ({scheduledToday.length + inProgressToday.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completados ({completedToday.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          {scheduledToday.length === 0 && inProgressToday.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <EmptyState
                icon={Bus}
                title="No tienes viajes pendientes"
                description="Los viajes asignados aparecerán aquí"
              />
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {[...inProgressToday, ...scheduledToday].map(trip => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  onStart={handleStartTrip}
                  onComplete={handleCompleteTrip}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed">
          {completedToday.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <EmptyState
                icon={CheckCircle2}
                title="No hay viajes completados hoy"
                description="Los viajes finalizados aparecerán aquí"
              />
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {completedToday.map(trip => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}