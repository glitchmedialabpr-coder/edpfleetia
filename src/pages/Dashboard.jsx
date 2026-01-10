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
  Users, 
  GraduationCap, 
  Clock, 
  CheckCircle2,
  Plus,
  ArrowRight,
  Calendar
} from 'lucide-react';
import StatsCard from '../components/common/StatsCard';
import TripCard from '../components/trips/TripCard';
import CreateTripModal from '../components/trips/CreateTripModal';
import EmptyState from '../components/common/EmptyState';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';

export default function Dashboard() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const today = format(new Date(), 'yyyy-MM-dd');

  const { data: trips = [], refetch: refetchTrips } = useQuery({
    queryKey: ['trips'],
    queryFn: () => base44.entities.Trip.list('-scheduled_date', 100)
  });

  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: () => base44.entities.Student.filter({ status: 'active' })
  });

  const { data: drivers = [] } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => base44.entities.User.filter({ role: 'user' })
  });

  const todayTrips = trips.filter(t => t.scheduled_date === today);
  const scheduledToday = todayTrips.filter(t => t.status === 'scheduled').length;
  const inProgressToday = todayTrips.filter(t => t.status === 'in_progress').length;
  const completedToday = todayTrips.filter(t => t.status === 'completed').length;

  const handleStartTrip = async (trip) => {
    const now = format(new Date(), 'HH:mm');
    await base44.entities.Trip.update(trip.id, {
      status: 'in_progress',
      departure_time: now
    });
    refetchTrips();
  };

  const handleCompleteTrip = async (trip) => {
    const now = format(new Date(), 'HH:mm');
    await base44.entities.Trip.update(trip.id, {
      status: 'completed',
      arrival_time: now
    });
    refetchTrips();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-slate-500 mt-1">
            {format(new Date(), "EEEE, d 'de' MMMM yyyy", { locale: es })}
          </p>
        </div>
        <Button 
          onClick={() => setCreateModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Viaje
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Viajes Hoy"
          value={todayTrips.length}
          icon={Calendar}
          color="blue"
          subtitle={`${completedToday} completados`}
        />
        <StatsCard
          title="En Progreso"
          value={inProgressToday}
          icon={Clock}
          color="amber"
        />
        <StatsCard
          title="Estudiantes"
          value={students.length}
          icon={GraduationCap}
          color="purple"
        />
        <StatsCard
          title="Choferes"
          value={drivers.length}
          icon={Users}
          color="emerald"
        />
      </div>

      {/* Today's Trips */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">Viajes de Hoy</h2>
          <Link 
            to={createPageUrl('Trips')}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            Ver todos <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="bg-slate-100 mb-4">
            <TabsTrigger value="all">Todos ({todayTrips.length})</TabsTrigger>
            <TabsTrigger value="scheduled">Programados ({scheduledToday})</TabsTrigger>
            <TabsTrigger value="in_progress">En Progreso ({inProgressToday})</TabsTrigger>
            <TabsTrigger value="completed">Completados ({completedToday})</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {todayTrips.length === 0 ? (
              <Card className="border-0 shadow-sm">
                <EmptyState
                  icon={Bus}
                  title="No hay viajes programados para hoy"
                  description="Crea un nuevo viaje para comenzar"
                  action={() => setCreateModalOpen(true)}
                  actionLabel="Crear Viaje"
                />
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {todayTrips.map(trip => (
                  <TripCard
                    key={trip.id}
                    trip={trip}
                    showDriver
                    onStart={handleStartTrip}
                    onComplete={handleCompleteTrip}
                    compact
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="scheduled">
            {scheduledToday === 0 ? (
              <Card className="border-0 shadow-sm">
                <EmptyState
                  icon={Clock}
                  title="No hay viajes programados"
                  description="Los viajes pendientes aparecerán aquí"
                />
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {todayTrips.filter(t => t.status === 'scheduled').map(trip => (
                  <TripCard
                    key={trip.id}
                    trip={trip}
                    showDriver
                    onStart={handleStartTrip}
                    compact
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="in_progress">
            {inProgressToday === 0 ? (
              <Card className="border-0 shadow-sm">
                <EmptyState
                  icon={Bus}
                  title="No hay viajes en progreso"
                  description="Los viajes activos aparecerán aquí"
                />
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {todayTrips.filter(t => t.status === 'in_progress').map(trip => (
                  <TripCard
                    key={trip.id}
                    trip={trip}
                    showDriver
                    onComplete={handleCompleteTrip}
                    compact
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed">
            {completedToday === 0 ? (
              <Card className="border-0 shadow-sm">
                <EmptyState
                  icon={CheckCircle2}
                  title="No hay viajes completados"
                  description="Los viajes finalizados aparecerán aquí"
                />
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {todayTrips.filter(t => t.status === 'completed').map(trip => (
                  <TripCard
                    key={trip.id}
                    trip={trip}
                    showDriver
                    compact
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <CreateTripModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={refetchTrips}
      />
    </div>
  );
}