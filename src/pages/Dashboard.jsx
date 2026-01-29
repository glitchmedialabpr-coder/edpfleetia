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
  Calendar,
  AlertTriangle,
  FileText
} from 'lucide-react';
import StatsCard from '../components/common/StatsCard';
import TripCard from '../components/trips/TripCard';
import CreateTripModal from '../components/trips/CreateTripModal';
import EmptyState from '../components/common/EmptyState';
import PinVerification from '../components/auth/PinVerification';
import DriverStats from '../components/dashboard/DriverStats';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { differenceInDays, parseISO } from 'date-fns';

export default function Dashboard() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
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
    queryFn: () => base44.entities.Driver.list()
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => base44.entities.Vehicle.list()
  });

  const { data: tripRequests = [] } = useQuery({
    queryKey: ['trip-requests'],
    queryFn: () => base44.entities.TripRequest.list('-created_date', 200)
  });

  const todayTrips = trips.filter(t => t.scheduled_date === today);
  const scheduledToday = todayTrips.filter(t => t.status === 'scheduled').length;
  const inProgressToday = todayTrips.filter(t => t.status === 'in_progress').length;
  const completedToday = todayTrips.filter(t => t.status === 'completed').length;

  // Check for expiring documents
  const expiringDocuments = [];
  
  drivers.forEach(driver => {
    if (driver.license_expiry) {
      const days = differenceInDays(parseISO(driver.license_expiry), new Date());
      if (days <= 30 && days >= 0) {
        expiringDocuments.push({ type: 'Licencia', name: driver.full_name, days, entity: 'driver' });
      }
    }
    driver.documents?.forEach(doc => {
      if (doc.expiry_date) {
        const days = differenceInDays(parseISO(doc.expiry_date), new Date());
        if (days <= 30 && days >= 0) {
          expiringDocuments.push({ type: doc.name, name: driver.full_name, days, entity: 'driver' });
        }
      }
    });
  });

  vehicles.forEach(vehicle => {
    if (vehicle.insurance_expiry) {
      const days = differenceInDays(parseISO(vehicle.insurance_expiry), new Date());
      if (days <= 30 && days >= 0) {
        expiringDocuments.push({ type: 'Seguro', name: vehicle.plate, days, entity: 'vehicle' });
      }
    }
    vehicle.documents?.forEach(doc => {
      if (doc.expiry_date) {
        const days = differenceInDays(parseISO(doc.expiry_date), new Date());
        if (days <= 30 && days >= 0) {
          expiringDocuments.push({ type: doc.name, name: vehicle.plate, days, entity: 'vehicle' });
        }
      }
    });
  });

  const handleStartTrip = (trip) => {
    setPendingAction({ type: 'start', trip });
    setPinModalOpen(true);
  };

  const handleCompleteTrip = (trip) => {
    setPendingAction({ type: 'complete', trip });
    setPinModalOpen(true);
  };

  const executeAction = async () => {
    if (!pendingAction) return;

    const now = format(new Date(), 'HH:mm');
    
    if (pendingAction.type === 'start') {
      await base44.entities.Trip.update(pendingAction.trip.id, {
        status: 'in_progress',
        departure_time: now
      });
    } else if (pendingAction.type === 'complete') {
      await base44.entities.Trip.update(pendingAction.trip.id, {
        status: 'completed',
        arrival_time: now
      });
    }

    refetchTrips();
    setPendingAction(null);
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
          className="bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-600/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Viaje
        </Button>
      </div>

      {/* Expiring Documents Alert */}
      {expiringDocuments.length > 0 && (
        <Card className="p-4 bg-amber-50 border-amber-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-amber-800 mb-2">
                {expiringDocuments.length} documento{expiringDocuments.length > 1 ? 's' : ''} por vencer
              </h3>
              <div className="space-y-1">
                {expiringDocuments.slice(0, 3).map((doc, idx) => (
                  <p key={idx} className="text-sm text-amber-700">
                    {doc.type} - {doc.name} (vence en {doc.days}d)
                  </p>
                ))}
                {expiringDocuments.length > 3 && (
                  <p className="text-sm text-amber-600">
                    +{expiringDocuments.length - 3} más
                  </p>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Viajes Hoy"
          value={todayTrips.length}
          icon={Calendar}
          color="teal"
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

      {/* Driver Statistics */}
      <DriverStats drivers={drivers} trips={tripRequests} />

      <CreateTripModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={refetchTrips}
      />

      <PinVerification
        open={pinModalOpen}
        onClose={() => {
          setPinModalOpen(false);
          setPendingAction(null);
        }}
        onVerified={executeAction}
        title={pendingAction?.type === 'start' ? 'Iniciar Viaje' : 'Completar Viaje'}
      />
    </div>
  );
}