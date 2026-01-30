import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format, addDays, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Plus,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Bus,
  Eye,
  User,
  MapPin,
  Clock,
  CheckCircle2,
  Users
} from 'lucide-react';
import TripCard from '../components/trips/TripCard';
import CreateTripModal from '../components/trips/CreateTripModal';
import EmptyState from '../components/common/EmptyState';

export default function Trips() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [user, setUser] = useState(null);
  const [selectedTrip, setSelectedTrip] = useState(null);

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

  const { data: trips = [], refetch } = useQuery({
    queryKey: ['trips', formattedDate],
    queryFn: () => base44.entities.Trip.filter({ scheduled_date: formattedDate }, '-scheduled_time')
  });

  const { data: allCompletedTrips = [] } = useQuery({
    queryKey: ['all-completed-trips'],
    queryFn: () => base44.entities.Trip.filter({ status: 'completed' }, '-scheduled_date', 100)
  });

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

      {/* All Completed Trips */}
      <div className="space-y-4 mt-8">
        <h2 className="text-xl font-bold text-slate-800">Todos los Viajes Completados</h2>
        {allCompletedTrips.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <EmptyState
              icon={Bus}
              title="No hay viajes completados"
              description="Los viajes completados aparecerán aquí"
            />
          </Card>
        ) : (
          <div className="grid gap-3">
            {allCompletedTrips.map(trip => (
              <Card key={trip.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-slate-500">Fecha</p>
                      <p className="font-semibold text-slate-800">
                        {trip.scheduled_date ? format(new Date(trip.scheduled_date), 'd MMM yyyy', { locale: es }) : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Conductor</p>
                      <p className="font-medium text-slate-700">{trip.driver_name || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Estudiantes</p>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-slate-400" />
                        <span className="font-medium text-slate-700">{trip.students?.length || 0}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Horario</p>
                      <p className="text-sm text-slate-600">
                        {trip.departure_time} - {trip.arrival_time}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setSelectedTrip(trip)}
                    size="sm"
                    variant="outline"
                    className="ml-4"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Ver Detalles
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Trip Details Modal */}
      <Dialog open={!!selectedTrip} onOpenChange={() => setSelectedTrip(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles del Viaje</DialogTitle>
          </DialogHeader>
          {selectedTrip && (
            <div className="space-y-6">
              {/* Trip Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Fecha</p>
                  <p className="font-semibold text-slate-800">
                    {selectedTrip.scheduled_date ? format(new Date(selectedTrip.scheduled_date), "d 'de' MMMM yyyy", { locale: es }) : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Estado</p>
                  <Badge className="bg-green-100 text-green-700">Completado</Badge>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Conductor</p>
                  <p className="font-medium text-slate-700">{selectedTrip.driver_name || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Vehículo</p>
                  <p className="font-medium text-slate-700">{selectedTrip.vehicle_info || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Hora de Salida</p>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="font-medium text-slate-700">{selectedTrip.departure_time || '-'}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Hora de Llegada</p>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-slate-700">{selectedTrip.arrival_time || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Students List */}
              <div>
                <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Estudiantes en el Viaje ({selectedTrip.students?.length || 0})
                </h3>
                <div className="space-y-2">
                  {selectedTrip.students && selectedTrip.students.length > 0 ? (
                    selectedTrip.students.map((student, idx) => (
                      <div 
                        key={idx}
                        className="p-4 rounded-lg border bg-slate-50 border-slate-200"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <User className="w-4 h-4 text-slate-400" />
                              <p className="font-semibold text-slate-800">{student.student_name}</p>
                            </div>
                            <div className="flex items-start gap-2 text-sm text-slate-600">
                              <MapPin className="w-4 h-4 text-red-500 mt-0.5" />
                              <div>
                                <p className="font-medium">{student.destination}</p>
                                {student.destination_town && (
                                  <p className="text-xs text-slate-500">{student.destination_town}</p>
                                )}
                              </div>
                            </div>
                            {student.delivery_time && (
                              <p className="text-xs text-green-600 mt-2">
                                Entregado: {student.delivery_time}
                              </p>
                            )}
                          </div>
                          {student.delivery_status === 'delivered' && (
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500 text-center py-4">No hay estudiantes registrados</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}