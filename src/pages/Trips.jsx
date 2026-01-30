import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format, addDays, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Plus,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Bus
} from 'lucide-react';
import TripCard from '../components/trips/TripCard';
import CreateTripModal from '../components/trips/CreateTripModal';
import EmptyState from '../components/common/EmptyState';

export default function Trips() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [user, setUser] = useState(null);

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

  const formattedDate = format(selectedDate, 'yyyy-MM-dd');

  const { data: allTrips = [], refetch } = useQuery({
    queryKey: ['trips', formattedDate],
    queryFn: () => base44.entities.Trip.filter({ scheduled_date: formattedDate }, '-scheduled_time')
  });

  const trips = allTrips.filter(trip => trip.status === 'completed');

  const handlePrevDay = () => setSelectedDate(subDays(selectedDate, 1));
  const handleNextDay = () => setSelectedDate(addDays(selectedDate, 1));
  const handleToday = () => setSelectedDate(new Date());

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">Viajes</h1>
          <p className="text-slate-500 mt-1">Gestiona los viajes programados</p>
        </div>
        <Button 
          onClick={() => setCreateModalOpen(true)}
          className="bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-600/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Viaje
        </Button>
      </div>

      {/* Date Navigation */}
      <Card className="p-4 border-0 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handlePrevDay}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2 px-4">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span className="font-semibold text-slate-800">
                {format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })}
              </span>
            </div>
            <Button variant="outline" size="icon" onClick={handleNextDay}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleToday} size="sm">
              Hoy
            </Button>
            <Input
              type="date"
              value={formattedDate}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              className="w-auto"
            />
          </div>
        </div>
      </Card>

      {/* Trips */}
      {trips.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <EmptyState
            icon={Bus}
            title="No hay viajes para esta fecha"
            description="Crea un nuevo viaje o selecciona otra fecha"
            action={() => setCreateModalOpen(true)}
            actionLabel="Crear Viaje"
          />
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {trips.map(trip => (
            <TripCard
              key={trip.id}
              trip={trip}
              showDriver
              onStart={handleStartTrip}
              onComplete={handleCompleteTrip}
            />
          ))}
        </div>
      )}

      <CreateTripModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={refetch}
      />
    </div>
  );
}