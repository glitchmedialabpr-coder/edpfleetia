import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  MapPin, 
  Clock, 
  User, 
  Phone, 
  Navigation,
  CheckCircle,
  AlertCircle,
  Car,
  Users
} from 'lucide-react';
import { toast } from 'sonner';
import EmptyState from '../components/common/EmptyState';

const statusConfig = {
  pending: { label: 'Disponible', color: 'bg-yellow-100 text-yellow-700' },
  accepted: { label: 'Aceptado', color: 'bg-blue-100 text-blue-700' },
  accepted_by_driver: { label: 'Por Iniciar', color: 'bg-orange-100 text-orange-700' },
  in_progress: { label: 'En Progreso', color: 'bg-purple-100 text-purple-700' },
  in_trip: { label: 'En Viaje', color: 'bg-indigo-100 text-indigo-700' },
  completed: { label: 'Completado', color: 'bg-green-100 text-green-700' }
};

export default function DriverRequests() {
  const [user, setUser] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [notificationSound] = useState(() => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUKnl87RiGwU7k9n0yHInBSh+zPLaizsKFF+28ud2URwMTKXh8bllHAU2jdTxy3ksiCV8zPDbjzsKEly18O2jUBsMSqPf8r1nHwU6kdnzxnErBSh+zvPaiTwKEV619Oy+aCAGL47V8tWTQwsVYLXp7JhPEAxMovTyvmsiBTaO1vLNdSYEJ4HO8tiJOAgZaLzu551NEQxPqOT0s2IcBTiQ2PPLeSgEKH7N8tmJPAoUXrXy77hVGApFnuHytW0hBSuCz/PaiDUHGWi78OWcTQ0OUKjk87NhHAU7k9jzy3krBCiAz/PaiD0GEly08uq5Vx0LRZP0yHMnBSh9zfDcjD4HEly18uq5V+0LPJrc8shzJwUng87y2Ik3CBpouPDmnk0PDlCo5fKzYhwFOpPZ88t5KwQogc7y2Yk3CBlopfHvnU0QDFGr5PK0YRsFO5TZ88p5LAUpgdDx14c5CBdltO3qnFENDlGp5fO0YRoFPJTY88p5TAUAAAAAAAA=');
    audio.volume = 0.5;
    return audio;
  });
  const [hasNewRequest, setHasNewRequest] = useState(false);

  useEffect(() => {
    loadUser();
    requestNotificationPermission();
  }, []);

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => base44.entities.Vehicle.filter({ status: 'available' })
  });

  const { data: pendingRequests = [], refetch: refetchPending } = useQuery({
    queryKey: ['pending-requests'],
    queryFn: () => base44.entities.TripRequest.filter({ status: 'pending' }, '-created_date')
  });

  const { data: acceptedRequests = [], refetch: refetchAccepted } = useQuery({
    queryKey: ['accepted-requests', user?.id],
    queryFn: () => base44.entities.TripRequest.filter({ 
      driver_id: user?.id,
      status: 'accepted_by_driver'
    }, '-created_date'),
    enabled: !!user?.id
  });

  const { data: activeTrips = [], refetch: refetchActiveTrips } = useQuery({
    queryKey: ['active-trips', user?.id],
    queryFn: () => base44.entities.Trip.filter({ 
      driver_id: user?.id,
      status: 'in_progress'
    }, '-created_date'),
    enabled: !!user?.id
  });

  useEffect(() => {
    const unsubscribeRequest = base44.entities.TripRequest.subscribe((event) => {
      if (event.type === 'create' && event.data?.status === 'pending' && selectedVehicle) {
        notificationSound.play().catch(e => console.log('Audio play failed:', e));
        setHasNewRequest(true);
        setTimeout(() => setHasNewRequest(false), 3000);
        
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('🚗 Nueva Solicitud de Viaje', {
            body: `${event.data.passenger_name} necesita ir a ${event.data.destination}`,
            icon: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6962e1b8eae90299f24a170a/303d16ba3_471231367_1006775134815986_8615529326532786364_n.jpg',
            vibrate: [200, 100, 200],
            requireInteraction: true
          });
        }
        
        toast.success('🔔 Nueva solicitud de viaje disponible!', {
          duration: 5000,
        });
        refetchPending();
      } else if (event.type === 'update') {
        refetchPending();
        refetchAccepted();
      }
    });

    const unsubscribeTrip = base44.entities.Trip.subscribe((event) => {
      if (event.type === 'update' && user?.driver_id && event.data?.driver_id === user.driver_id) {
        refetchActiveTrips();
      }
    });

    return () => {
      unsubscribeRequest();
      unsubscribeTrip();
    };
  }, [refetchPending, refetchAccepted, refetchActiveTrips, user?.driver_id, selectedVehicle, notificationSound]);

  const handleAccept = async (request) => {
    if (!selectedVehicle) {
      toast.error('Selecciona un vehículo primero');
      return;
    }

    if (!user || !user.driver_id) {
      toast.error('Error: ID de conductor no encontrado');
      return;
    }

    // Check limit of 15 students
    if (acceptedRequests.length >= 15) {
      toast.error('Máximo 15 estudiantes. Inicia el viaje primero.');
      return;
    }

    try {
      const vehicle = vehicles.find(v => v.id === selectedVehicle);
      const now = new Date();
      const timeString = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      
      await base44.entities.TripRequest.update(request.id, {
        status: 'accepted_by_driver',
        driver_id: user.driver_id,
        driver_name: user.full_name || user.email,
        vehicle_id: selectedVehicle,
        vehicle_info: vehicle ? `${vehicle.brand} ${vehicle.model} - ${vehicle.plate}` : '',
        accepted_at: timeString
      });

      await base44.entities.TripRequestResponse.create({
        trip_request_id: request.id,
        driver_id: user.driver_id,
        driver_name: user.full_name || user.email,
        response: 'accepted',
        response_time: timeString,
        vehicle_id: selectedVehicle,
        vehicle_info: vehicle ? `${vehicle.brand} ${vehicle.model} - ${vehicle.plate}` : '',
        passenger_name: request.passenger_name,
        destination: request.destination
      });

      toast.success(`Estudiante aceptado (${acceptedRequests.length + 1}/15)`);
      refetchPending();
      refetchAccepted();
    } catch (error) {
      toast.error('Error al aceptar estudiante');
    }
  };

  const handleReject = async (request) => {
    if (!user) return;

    try {
      const now = new Date();
      const timeString = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      
      // Save rejection in history
      await base44.entities.TripRequestResponse.create({
        trip_request_id: request.id,
        driver_id: user.driver_id,
        driver_name: user.full_name || user.email,
        response: 'rejected',
        response_time: timeString,
        vehicle_id: selectedVehicle,
        passenger_name: request.passenger_name,
        destination: request.destination
      });

      toast.info('Viaje rechazado');
      refetchPending();
    } catch (error) {
      toast.error('Error al rechazar viaje');
    }
  };

  const handleStartTrip = async () => {
    if (acceptedRequests.length === 0) {
      toast.error('No hay estudiantes aceptados');
      return;
    }

    try {
      const now = new Date();
      const timeString = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      const vehicle = vehicles.find(v => v.id === selectedVehicle);

      // Create Trip with all accepted students
      const studentsData = acceptedRequests.map(req => ({
        request_id: req.id,
        student_id: req.passenger_id,
        student_name: req.passenger_name,
        housing_name: req.destination,
        destination: req.destination,
        destination_town: req.destination_town,
        delivery_status: 'pending',
        delivery_time: null
      }));

      const trip = await base44.entities.Trip.create({
        driver_id: user.driver_id,
        driver_name: user.full_name || user.email,
        vehicle_id: selectedVehicle,
        vehicle_info: vehicle ? `${vehicle.brand} ${vehicle.model} - ${vehicle.plate}` : '',
        scheduled_date: new Date().toISOString().split('T')[0],
        scheduled_time: timeString,
        departure_time: timeString,
        students: studentsData,
        origin: 'EDP University',
        status: 'in_progress'
      });

      // Update all accepted requests to in_trip status
      for (const req of acceptedRequests) {
        await base44.entities.TripRequest.update(req.id, {
          status: 'in_trip',
          started_at: timeString,
          trip_id: trip.id
        });
      }

      toast.success(`Viaje iniciado con ${acceptedRequests.length} estudiante(s)`);
      refetchAccepted();
      refetchActiveTrips();
    } catch (error) {
      toast.error('Error al iniciar viaje');
      console.error(error);
    }
  };

  const handleDeliverStudent = async (trip, studentIndex) => {
    try {
      const now = new Date();
      const timeString = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      
      const updatedStudents = [...trip.students];
      updatedStudents[studentIndex] = {
        ...updatedStudents[studentIndex],
        delivery_status: 'delivered',
        delivery_time: timeString
      };

      await base44.entities.Trip.update(trip.id, {
        students: updatedStudents
      });

      toast.success('Estudiante entregado - ' + timeString);
      refetchActiveTrips();
    } catch (error) {
      toast.error('Error al marcar estudiante como entregado');
    }
  };

  const handleCompleteTrip = async (trip) => {
    const allDelivered = trip.students.every(s => s.delivery_status === 'delivered');
    
    if (!allDelivered) {
      toast.error('Debes entregar todos los estudiantes primero');
      return;
    }

    try {
      const now = new Date();
      const timeString = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      
      await base44.entities.Trip.update(trip.id, {
        status: 'completed',
        arrival_time: timeString
      });

      // Update all trip requests to completed
      const requestIds = trip.students.map(s => s.request_id);
      for (const reqId of requestIds) {
        await base44.entities.TripRequest.update(reqId, {
          status: 'completed',
          completed_at: timeString
        });
      }

      toast.success('Viaje completado - ' + timeString);
      refetchActiveTrips();
    } catch (error) {
      toast.error('Error al completar viaje');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">Solicitudes de Viaje</h1>
          <p className="text-slate-500 mt-1">Acepta y gestiona viajes disponibles</p>
        </div>
        <div className="w-full lg:w-64">
          <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona tu vehículo" />
            </SelectTrigger>
            <SelectContent>
              {vehicles.map(vehicle => (
                <SelectItem key={vehicle.id} value={vehicle.id}>
                  {vehicle.brand} {vehicle.model} - {vehicle.plate}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Accepted Students (Ready to Start Trip) */}
      {acceptedRequests.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">
              Estudiantes Aceptados ({acceptedRequests.length}/15)
            </h2>
            <Button 
              onClick={handleStartTrip}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Navigation className="w-4 h-4 mr-2" />
              Comenzar Viaje
            </Button>
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {acceptedRequests.map(req => (
              <Card key={req.id} className="p-4 border-l-4 border-orange-500">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-slate-400" />
                  <span className="font-medium text-slate-800">{req.passenger_name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <MapPin className="w-4 h-4 text-red-500" />
                  <span className="truncate">{req.destination}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Active Trips */}
      {activeTrips.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-800">Viajes en Vivo</h2>
          <div className="grid gap-4">
            {activeTrips.map(trip => (
              <Card key={trip.id} className="p-6 border-l-4 border-indigo-600">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-indigo-100 text-indigo-700">
                      En Viaje
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {trip.students?.length || 0} estudiantes
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Clock className="w-4 h-4" />
                    {trip.departure_time}
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <h3 className="font-medium text-slate-700">Estudiantes:</h3>
                  <div className="space-y-2">
                    {trip.students?.map((student, idx) => (
                      <div 
                        key={idx}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          student.delivery_status === 'delivered' 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="flex-1">
                          <p className="font-medium text-slate-800">{student.student_name}</p>
                          <p className="text-sm text-slate-500">{student.destination}</p>
                          {student.delivery_status === 'delivered' && (
                            <p className="text-xs text-green-600 mt-1">
                              Entregado: {student.delivery_time}
                            </p>
                          )}
                        </div>
                        {student.delivery_status === 'pending' ? (
                          <Button
                            size="sm"
                            onClick={() => handleDeliverStudent(trip, idx)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Entregado
                          </Button>
                        ) : (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={() => handleCompleteTrip(trip)}
                  className="w-full bg-teal-600 hover:bg-teal-700"
                  disabled={!trip.students?.every(s => s.delivery_status === 'delivered')}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Completar Viaje
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Available Requests */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-slate-800">Solicitudes Disponibles</h2>
          {hasNewRequest && (
            <Badge className="bg-red-500 text-white animate-pulse">
              ¡Nuevo!
            </Badge>
          )}
        </div>
        {!selectedVehicle && (
          <Card className="p-4 bg-amber-50 border-amber-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <p className="text-sm text-amber-800">Selecciona tu vehículo para aceptar viajes</p>
            </div>
          </Card>
        )}

        {pendingRequests.length === 0 ? (
          <Card className="p-8">
            <EmptyState
              icon={Car}
              title="No hay solicitudes disponibles"
              description="Las nuevas solicitudes aparecerán aquí automáticamente"
            />
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {pendingRequests.map(request => (
              <Card key={request.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <Badge className={statusConfig[request.status].color}>
                    Nuevo viaje
                  </Badge>
                  <span className="text-xs text-slate-400">
                    {new Date(request.created_date).toLocaleTimeString()}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-start gap-2">
                    <Navigation className="w-5 h-5 text-teal-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-slate-500">Origen</p>
                      <p className="font-medium text-slate-800">{request.origin}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <MapPin className="w-5 h-5 text-red-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-slate-500">Destino</p>
                      <p className="font-medium text-slate-800">{request.destination}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    {request.pickup_time && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{request.pickup_time}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{request.passengers_count} pasajero(s)</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleReject(request)}
                    variant="outline"
                    className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                  >
                    Rechazar
                  </Button>
                  <Button 
                    onClick={() => handleAccept(request)}
                    disabled={!selectedVehicle}
                    className="flex-1 bg-teal-600 hover:bg-teal-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Aceptar
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}