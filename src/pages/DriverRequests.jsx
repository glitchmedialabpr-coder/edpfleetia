import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
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
import moment from 'moment';
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
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const navigate = useNavigate();
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

  useEffect(() => {
    if (user?.driver_id) {
      checkAndSetVehicleFromSchedule();
    }
  }, [user?.driver_id]);

  const checkAndSetVehicleFromSchedule = async () => {
    try {
      // Check new vehicle selection (from DriverVehicleSelection)
      const vehicleSelection = localStorage.getItem('driver_vehicle_selection');
      if (vehicleSelection) {
        try {
          const selection = JSON.parse(vehicleSelection);
          if (Date.now() < selection.expires_at) {
            setSelectedVehicle(selection.vehicle_id);
            return;
          } else {
            localStorage.removeItem('driver_vehicle_selection');
          }
        } catch (e) {
          localStorage.removeItem('driver_vehicle_selection');
        }
      }

      const drivers = await base44.entities.Driver.filter({ driver_id: user.driver_id });
      if (drivers && drivers.length > 0) {
        const driver = drivers[0];
        
        // Verificar si está en turno
        if (driver.shift_start_time && driver.shift_days && driver.assigned_vehicle_id) {
          const now = new Date();
          const currentDay = now.getDay();
          const currentTime = now.getHours() * 60 + now.getMinutes();
          
          // Verificar si hoy es un día de turno
          if (driver.shift_days.includes(currentDay)) {
            const [startHour, startMin] = driver.shift_start_time.split(':').map(Number);
            const shiftStartMinutes = startHour * 60 + startMin;
            const shiftEndMinutes = shiftStartMinutes + (driver.shift_duration || 8) * 60;
            
            // Verificar si está dentro del horario de turno
            if (currentTime >= shiftStartMinutes && currentTime < shiftEndMinutes) {
              setSelectedVehicle(driver.assigned_vehicle_id);
              return;
            }
          }
        }
      }
      
      // Fallback a vehículo guardado si existe
      const savedVehicle = localStorage.getItem(`driver_vehicle_${user.driver_id}`);
      if (savedVehicle) {
        try {
          const { vehicleId, timestamp } = JSON.parse(savedVehicle);
          const now = Date.now();
          const elapsed = now - timestamp;
          const twentyFourHours = 24 * 60 * 60 * 1000;
          
          if (elapsed < twentyFourHours) {
            setSelectedVehicle(vehicleId);
          } else {
            localStorage.removeItem(`driver_vehicle_${user.driver_id}`);
          }
        } catch (e) {
          localStorage.removeItem(`driver_vehicle_${user.driver_id}`);
        }
      }
    } catch (error) {
      console.error('Error checking schedule:', error);
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  const loadUser = async () => {
    try {
      const pinUser = localStorage.getItem('pin_user');
      if (pinUser) {
        const userData = JSON.parse(pinUser);
        setUser(userData);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => base44.entities.Vehicle.filter({ status: 'available' }),
    staleTime: 1000 * 60 * 5
  });

  const { data: pendingRequests = [] } = useQuery({
    queryKey: ['pending-requests'],
    queryFn: () => base44.entities.TripRequest.filter({ status: 'pending' }, '-created_date', 50),
    refetchInterval: 1000
  });

  const { data: acceptedRequests = [] } = useQuery({
    queryKey: ['accepted-requests', user?.driver_id],
    queryFn: () => base44.entities.TripRequest.filter({ 
      driver_id: user?.driver_id,
      status: 'accepted_by_driver'
    }, '-created_date', 15),
    enabled: !!user?.driver_id
  });

  const { data: activeTrips = [] } = useQuery({
    queryKey: ['active-trips', user?.driver_id],
    queryFn: () => base44.entities.Trip.filter({ 
      driver_id: user?.driver_id,
      status: 'in_progress'
    }, '-created_date', 5),
    enabled: !!user?.driver_id
  });

  const handleAccept = async (request) => {
    if (!selectedVehicle) {
      toast.error('Selecciona vehículo');
      return;
    }

    if (!user?.driver_id) {
      toast.error('Error de sesión');
      return;
    }

    const vehicle = vehicles.find(v => v.id === selectedVehicle);
    const capacity = vehicle?.capacity || 15;

    if (acceptedRequests.length >= capacity) {
      toast.error(`Máximo ${capacity} estudiantes`);
      return;
    }

    const currentRequest = pendingRequests.find(r => r.id === request.id);
    if (!currentRequest || currentRequest.status !== 'pending') {
      toast.error('Ya no disponible');
      return;
    }

    try {
      const timeString = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      const vehicleInfo = vehicle ? `${vehicle.brand} ${vehicle.model} - ${vehicle.plate}` : '';

      await Promise.all([
        base44.entities.TripRequest.update(request.id, {
          status: 'accepted_by_driver',
          driver_id: user.driver_id,
          driver_name: user.full_name || user.email,
          vehicle_id: selectedVehicle,
          vehicle_info: vehicleInfo,
          accepted_at: timeString
        }),
        base44.entities.TripRequestResponse.create({
          trip_request_id: request.id,
          driver_id: user.driver_id,
          driver_name: user.full_name || user.email,
          response: 'accepted',
          response_time: timeString,
          vehicle_id: selectedVehicle,
          vehicle_info: vehicleInfo,
          passenger_name: request.passenger_name,
          destination: request.destination
        })
      ]);

      queryClient.invalidateQueries({ queryKey: ['pending-requests'] });
      queryClient.invalidateQueries({ queryKey: ['accepted-requests'] });
      toast.success(`✓ (${acceptedRequests.length + 1}/${capacity})`);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error');
    }
  };

  const handleReject = async (request) => {
    if (!user) return;

    try {
      await base44.entities.TripRequest.update(request.id, {
        status: 'rejected'
      });

      await base44.entities.TripRequestResponse.create({
        trip_request_id: request.id,
        driver_id: user.driver_id,
        driver_name: user.full_name || user.email,
        response: 'rejected',
        response_time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        vehicle_id: selectedVehicle,
        passenger_name: request.passenger_name,
        destination: request.destination
      });

      queryClient.invalidateQueries({ queryKey: ['pending-requests'] });
      toast.success('Solicitud rechazada');
    } catch (error) {
      console.error('Error rechazando:', error);
      toast.error('Error al rechazar');
    }
  };

  const handleStartTrip = async () => {
    if (!acceptedRequests.length) {
      toast.error('No hay estudiantes');
      return;
    }

    if (!user?.driver_id) {
      toast.error('Error de sesión');
      return;
    }

    try {
      const res = await base44.functions.invoke('createTripFromRequests', {
        acceptedRequests,
        selectedVehicle,
        driverId: user.driver_id,
        driverName: user.full_name || user.email
      });

      if (res.data.success) {
        queryClient.invalidateQueries({ queryKey: ['accepted-requests'] });
        queryClient.invalidateQueries({ queryKey: ['active-trips'] });
        queryClient.invalidateQueries({ queryKey: ['driver-trips'] });
        toast.success('Viaje iniciado');
      } else {
        toast.error('Error');
      }
    } catch (error) {
      toast.error('Error');
    }
  };

  const handleDeliverStudent = async (trip, studentIndex) => {
    if (!trip?.students?.[studentIndex]) return;
    
    try {
      const now = new Date();
      const timeString = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      
      const updatedStudents = [...trip.students];
      updatedStudents[studentIndex] = {
        ...updatedStudents[studentIndex],
        delivery_status: 'delivered',
        delivery_time: timeString
      };

      await base44.entities.Trip.update(trip.id, { students: updatedStudents });
      queryClient.invalidateQueries({ queryKey: ['active-trips'] });
      toast.success('✓');
    } catch (error) {
      toast.error('Error');
    }
  };

  const handleCompleteTrip = async (trip) => {
    if (!trip?.students?.every(s => s.delivery_status === 'delivered')) {
      toast.error('Entrega todos primero');
      return;
    }

    try {
      const now = new Date();
      const timeString = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      
      await Promise.all([
        base44.entities.Trip.update(trip.id, {
          status: 'completed',
          arrival_time: timeString
        }),
        ...trip.students.map(s =>
          base44.entities.TripRequest.update(s.request_id, {
            status: 'completed',
            completed_at: timeString
          })
        )
      ]);

      queryClient.invalidateQueries({ queryKey: ['active-trips'] });
      queryClient.invalidateQueries({ queryKey: ['driver-trips'] });
      toast.success('Completado');
    } catch (error) {
      toast.error('Error');
    }
  };

  // Ordenar y calcular tiempo de espera
  const sortedPendingRequests = pendingRequests
    .sort((a, b) => new Date(a.created_date).getTime() - new Date(b.created_date).getTime())
    .map(request => {
      const createdDate = moment(request.created_date);
      const now = moment();
      const duration = moment.duration(now.diff(createdDate));
      const hours = Math.floor(duration.asHours());
      const minutes = duration.minutes();
      const waitingTime = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
      
      return { ...request, waitingTime };
    });

  return (
    <div className="w-full space-y-4 md:space-y-6">
      <div>
        <h1 className="text-xl md:text-3xl font-bold text-slate-800">Solicitudes de Viaje</h1>
        <p className="text-sm md:text-base text-slate-500 mt-1">Acepta y gestiona viajes disponibles</p>
      </div>

      {/* Accepted Students - Pending to Start Trip */}
      {acceptedRequests && acceptedRequests.length > 0 && activeTrips.length === 0 && (
        <div className="space-y-4">
          <Card className="p-4 md:p-6 bg-gradient-to-br from-purple-50 to-white border border-purple-200">
            <div className="mb-4">
              <h2 className="text-lg md:text-xl font-semibold text-slate-800">
                {acceptedRequests.length} Estudiante{acceptedRequests.length > 1 ? 's' : ''} Aceptado{acceptedRequests.length > 1 ? 's' : ''}
              </h2>
              <p className="text-sm text-slate-500 mt-1">Listo para comenzar el viaje</p>
            </div>

            <div className="space-y-3 mb-4">
              {acceptedRequests.map(req => (
                <div key={req.id} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-slate-200 hover:border-purple-300 transition-colors">
                  <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm md:text-base">{req.passenger_name}</p>
                    <div className="flex items-center gap-1 mt-1 text-slate-600">
                      <MapPin className="w-4 h-4 text-red-500 flex-shrink-0" />
                      <span className="text-xs md:text-sm truncate">{req.destination}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button 
              onClick={handleStartTrip}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 md:py-4 text-base md:text-lg h-auto"
            >
              <Navigation className="w-5 h-5 mr-2" />
              Comenzar Viaje
            </Button>
          </Card>
        </div>
      )}

      {/* Active Trips */}
      <div className="space-y-3 md:space-y-4">
        <h2 className="text-base md:text-lg font-semibold text-slate-800">Viajes en Vivo</h2>
        {activeTrips.length > 0 ? (
          <div className="grid gap-3 md:gap-4">
            {activeTrips.map(trip => (
              <Card key={trip.id} className="p-4 md:p-6 border-l-4 border-indigo-600">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="bg-indigo-100 text-indigo-700">
                      En Viaje
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {trip.students?.length || 0} est.
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
                    <Clock className="w-4 h-4 flex-shrink-0" />
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
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-800 truncate">{student.student_name}</p>
                          <p className="text-sm text-slate-500 truncate">{student.destination}</p>
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
                            className="flex-shrink-0 ml-2 bg-green-600 hover:bg-green-700 text-xs sm:text-sm"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            <span className="hidden sm:inline">Entregado</span>
                            <span className="sm:hidden">OK</span>
                          </Button>
                        ) : (
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 ml-2" />
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
        ) : (
          <Card className="p-4 bg-slate-50 border-slate-200">
            <p className="text-sm text-slate-500 text-center">Sin viajes en progreso</p>
          </Card>
        )}
      </div>

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

        {sortedPendingRequests.length === 0 ? (
          <Card className="p-8">
            <EmptyState
              icon={Car}
              title="No hay solicitudes disponibles"
              description="Las nuevas solicitudes aparecerán aquí automáticamente"
            />
          </Card>
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            {sortedPendingRequests.map(request => {
              const requestStatus = request.status && statusConfig[request.status] ? statusConfig[request.status] : statusConfig.pending;
              return (
                <Card key={request.id} className="p-4 sm:p-6 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-4 gap-2">
                    <Badge className={requestStatus.color}>
                      Nuevo
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-slate-500 flex-shrink-0">
                      <Clock className="w-3 h-3" />
                      <span>{request.waitingTime}</span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-start gap-2">
                      <Navigation className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm text-slate-500">Origen</p>
                        <p className="font-medium text-slate-800 truncate text-sm">{request.origin}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <MapPin className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm text-slate-500">Destino</p>
                        <p className="font-medium text-slate-800 truncate text-sm">{request.destination}</p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs sm:text-sm text-slate-600">
                      {request.pickup_time && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 flex-shrink-0" />
                          <span>{request.pickup_time}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4 flex-shrink-0" />
                        <span>{request.passengers_count} pas.</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button 
                      onClick={() => handleReject(request)}
                      variant="outline"
                      className="flex-1 border-red-200 text-red-600 hover:bg-red-50 text-sm"
                    >
                      Rechazar
                    </Button>
                    <Button 
                      onClick={() => handleAccept(request)}
                      disabled={!selectedVehicle}
                      className="flex-1 bg-teal-600 hover:bg-teal-700 text-sm"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Aceptar
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}