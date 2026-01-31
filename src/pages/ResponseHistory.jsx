import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  CheckCircle, 
  XCircle, 
  Clock,
  User,
  MapPin,
  Car,
  Search,
  Filter,
  Bell,
  Check,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import EmptyState from '../components/common/EmptyState';

const responseConfig = {
  accepted: { label: 'Aceptado', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  rejected: { label: 'Rechazado', color: 'bg-red-100 text-red-700', icon: XCircle },
  timeout: { label: 'Sin Respuesta', color: 'bg-gray-100 text-gray-700', icon: Clock }
};

export default function ResponseHistory() {
  const [tab, setTab] = useState('responses');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterResponse, setFilterResponse] = useState('all');
  const [filterDriver, setFilterDriver] = useState('all');

  const { data: responses = [] } = useQuery({
    queryKey: ['trip-responses'],
    queryFn: () => base44.entities.TripRequestResponse.list('-created_date', 200),
    staleTime: 1000 * 60 * 5
  });

  const { data: drivers = [] } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => base44.entities.Driver.list(),
    staleTime: 1000 * 60 * 5
  });

  const filteredResponses = responses.filter(response => {
    const matchesSearch = 
      response.passenger_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      response.driver_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      response.destination?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesResponse = filterResponse === 'all' || response.response === filterResponse;
    const matchesDriver = filterDriver === 'all' || response.driver_id === filterDriver;

    return matchesSearch && matchesResponse && matchesDriver;
  });

  const { data: allTrips = [] } = useQuery({
    queryKey: ['all-trips'],
    queryFn: () => base44.entities.Trip.list('-created_date', 200),
    staleTime: 1000 * 60 * 5
  });

  const { data: allTripRequests = [] } = useQuery({
    queryKey: ['all-trip-requests'],
    queryFn: () => base44.entities.TripRequest.list('-created_date', 500),
    staleTime: 1000 * 60 * 5
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => base44.entities.Notification.list('-created_date', 200),
    staleTime: 1000 * 60 * 5
  });

  // Calculate time statistics
  const calculateTimeStats = () => {
    // Tiempo de respuesta (aceptar/rechazar)
    const responseTimes = [];
    allTripRequests.forEach(req => {
      if (req.pickup_time && req.accepted_at) {
        const [pickupH, pickupM] = req.pickup_time.split(':').map(Number);
        const [acceptH, acceptM] = req.accepted_at.split(':').map(Number);
        const diff = (acceptH * 60 + acceptM) - (pickupH * 60 + pickupM);
        if (diff >= 0 && diff < 120) { // Solo si es razonable (menos de 2 horas)
          responseTimes.push(diff);
        }
      }
    });

    // Tiempo de entrega (desde salida hasta entregar estudiantes)
    const deliveryTimes = [];
    allTrips.forEach(trip => {
      if (trip.departure_time && trip.students) {
        trip.students.forEach(student => {
          if (student.delivery_time) {
            const [deptH, deptM] = trip.departure_time.split(':').map(Number);
            const [delivH, delivM] = student.delivery_time.split(':').map(Number);
            const diff = (delivH * 60 + delivM) - (deptH * 60 + deptM);
            if (diff >= 0 && diff < 300) { // Menos de 5 horas
              deliveryTimes.push(diff);
            }
          }
        });
      }
    });

    // Tiempo de regreso a base (desde última entrega hasta completar viaje)
    const returnTimes = [];
    allTrips.forEach(trip => {
      if (trip.arrival_time && trip.students && trip.students.length > 0) {
        const lastDelivery = trip.students
          .filter(s => s.delivery_time)
          .map(s => s.delivery_time)
          .sort()
          .pop();
        
        if (lastDelivery) {
          const [lastH, lastM] = lastDelivery.split(':').map(Number);
          const [arrH, arrM] = trip.arrival_time.split(':').map(Number);
          const diff = (arrH * 60 + arrM) - (lastH * 60 + lastM);
          if (diff >= 0 && diff < 180) { // Menos de 3 horas
            returnTimes.push(diff);
          }
        }
      }
    });

    const avgResponse = responseTimes.length > 0 
      ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
      : 0;
    
    const avgDelivery = deliveryTimes.length > 0
      ? Math.round(deliveryTimes.reduce((a, b) => a + b, 0) / deliveryTimes.length)
      : 0;
    
    const avgReturn = returnTimes.length > 0
      ? Math.round(returnTimes.reduce((a, b) => a + b, 0) / returnTimes.length)
      : 0;

    return { avgResponse, avgDelivery, avgReturn };
  };

  const timeStats = calculateTimeStats();

  // Statistics
  const stats = {
    total: responses.length,
    accepted: responses.filter(r => r.response === 'accepted').length,
    rejected: responses.filter(r => r.response === 'rejected').length,
    timeout: responses.filter(r => r.response === 'timeout').length
  };

  const notificationTypeConfig = {
    schedule_change: { label: 'Cambio de Horario', color: 'bg-blue-100 text-blue-700' },
    driver_login: { label: 'Login Conductor', color: 'bg-green-100 text-green-700' },
    trip_completed: { label: 'Viaje Completado', color: 'bg-teal-100 text-teal-700' },
    accident_reported: { label: 'Accidente Reportado', color: 'bg-red-100 text-red-700' },
    system: { label: 'Sistema', color: 'bg-slate-100 text-slate-700' }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">Respuestas y Notificaciones</h1>
        <p className="text-slate-500 mt-1">Registro completo de aceptaciones, rechazos y notificaciones</p>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="responses">
            <CheckCircle className="w-4 h-4 mr-2" />
            Respuestas
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            Notificaciones
          </TabsTrigger>
        </TabsList>

        <TabsContent value="responses" className="space-y-6">

      {/* Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-2xl font-bold text-slate-800">{stats.total}</div>
          <div className="text-sm text-slate-500">Total Respuestas</div>
        </Card>
        <Card className="p-4 border-l-4 border-green-500">
          <div className="text-2xl font-bold text-green-600">{stats.accepted}</div>
          <div className="text-sm text-slate-500">Aceptados</div>
        </Card>
        <Card className="p-4 border-l-4 border-red-500">
          <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          <div className="text-sm text-slate-500">Rechazados</div>
        </Card>
        <Card className="p-4 border-l-4 border-gray-500">
          <div className="text-2xl font-bold text-gray-600">{stats.timeout}</div>
          <div className="text-sm text-slate-500">Sin Respuesta</div>
        </Card>
      </div>

      {/* Time Statistics */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-teal-600" />
          Estadísticas de Tiempo Promedio
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-3xl font-bold text-blue-600 mb-1">
              {timeStats.avgResponse} min
            </div>
            <div className="text-sm text-blue-700 font-medium">Tiempo de Respuesta</div>
            <div className="text-xs text-blue-600 mt-1">Desde solicitud hasta aceptar/rechazar</div>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="text-3xl font-bold text-purple-600 mb-1">
              {timeStats.avgDelivery} min
            </div>
            <div className="text-sm text-purple-700 font-medium">Tiempo de Entrega</div>
            <div className="text-xs text-purple-600 mt-1">Desde salida hasta entregar estudiantes</div>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="text-3xl font-bold text-orange-600 mb-1">
              {timeStats.avgReturn} min
            </div>
            <div className="text-sm text-orange-700 font-medium">Tiempo de Regreso</div>
            <div className="text-xs text-orange-600 mt-1">Desde última entrega hasta regresar a base</div>
          </div>
        </div>
      </Card>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-5 h-5 text-slate-400" />
          <h3 className="font-medium text-slate-700">Filtros</h3>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Buscar conductor, pasajero o destino..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterResponse} onValueChange={setFilterResponse}>
            <SelectTrigger>
              <SelectValue placeholder="Tipo de respuesta" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las respuestas</SelectItem>
              <SelectItem value="accepted">Aceptados</SelectItem>
              <SelectItem value="rejected">Rechazados</SelectItem>
              <SelectItem value="timeout">Sin respuesta</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterDriver} onValueChange={setFilterDriver}>
            <SelectTrigger>
              <SelectValue placeholder="Conductor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los conductores</SelectItem>
              {drivers.map(driver => (
                <SelectItem key={driver.id} value={driver.id}>
                  {driver.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Responses List */}
      {filteredResponses.length === 0 ? (
        <Card className="p-8">
          <EmptyState
            icon={Clock}
            title="No hay respuestas"
            description="No se encontraron registros con los filtros seleccionados"
          />
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredResponses.map(response => {
            const config = responseConfig[response.response];
            const Icon = config.icon;
            
            return (
              <Card key={response.id} className="p-5 hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${config.color.replace('text-', 'bg-').replace('100', '200')}`}>
                      <Icon className={`w-5 h-5 ${config.color.split(' ')[1]}`} />
                    </div>
                    <Badge className={config.color}>
                      {config.label}
                    </Badge>
                  </div>

                  <div className="flex-1 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-400" />
                      <div>
                        <div className="text-xs text-slate-500">Conductor</div>
                        <div className="font-medium text-slate-800 text-sm">{response.driver_name}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-400" />
                      <div>
                        <div className="text-xs text-slate-500">Pasajero</div>
                        <div className="font-medium text-slate-800 text-sm">{response.passenger_name}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <div>
                        <div className="text-xs text-slate-500">Destino</div>
                        <div className="font-medium text-slate-800 text-sm">{response.destination}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <div>
                        <div className="text-xs text-slate-500">Hora</div>
                        <div className="font-medium text-slate-800 text-sm">
                          {response.response_time || new Date(response.created_date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {response.vehicle_info && (
                    <div className="flex items-center gap-2 lg:ml-auto">
                      <Car className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-600">{response.vehicle_info}</span>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="text-2xl font-bold text-slate-800">{notifications.length}</div>
              <div className="text-sm text-slate-500">Total Notificaciones</div>
            </Card>
            <Card className="p-4 border-l-4 border-blue-500">
              <div className="text-2xl font-bold text-blue-600">
                {notifications.filter(n => !n.read).length}
              </div>
              <div className="text-sm text-slate-500">No Leídas</div>
            </Card>
            <Card className="p-4 border-l-4 border-red-500">
              <div className="text-2xl font-bold text-red-600">
                {notifications.filter(n => n.priority === 'high').length}
              </div>
              <div className="text-sm text-slate-500">Alta Prioridad</div>
            </Card>
          </div>

          {notifications.length === 0 ? (
            <Card className="p-8">
              <EmptyState
                icon={Bell}
                title="No hay notificaciones"
                description="No se han registrado notificaciones"
              />
            </Card>
          ) : (
            <div className="grid gap-4">
              {notifications.map(notification => {
                const typeConfig = notificationTypeConfig[notification.type] || { label: notification.type, color: 'bg-slate-100 text-slate-700' };
                const priorityColor = {
                  low: 'bg-slate-100 text-slate-700',
                  medium: 'bg-yellow-100 text-yellow-700',
                  high: 'bg-red-100 text-red-700'
                }[notification.priority] || 'bg-slate-100 text-slate-700';

                return (
                  <Card key={notification.id} className={`p-5 hover:shadow-md transition-shadow ${!notification.read ? 'border-l-4 border-blue-500 bg-blue-50' : ''}`}>
                    <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                      <div className="flex gap-3 flex-1">
                        <div className={`p-2 rounded-full ${!notification.read ? 'bg-blue-200' : 'bg-slate-200'}`}>
                          <Bell className={`w-5 h-5 ${!notification.read ? 'text-blue-600' : 'text-slate-600'}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex gap-2 items-center mb-2">
                            <h3 className="font-semibold text-slate-800">{notification.title}</h3>
                            <Badge className={typeConfig.color}>{typeConfig.label}</Badge>
                            <Badge className={priorityColor}>
                              {notification.priority === 'low' ? 'Baja' : notification.priority === 'medium' ? 'Media' : 'Alta'} Prioridad
                            </Badge>
                            {!notification.read && (
                              <Badge className="bg-blue-500 text-white">Nueva</Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 mb-2">{notification.message}</p>
                          {notification.driver_name && (
                            <div className="text-xs text-slate-500">
                              Conductor: <span className="font-medium">{notification.driver_name}</span>
                            </div>
                          )}
                          <div className="text-xs text-slate-400 mt-2">
                            {new Date(notification.created_date).toLocaleString('es-ES')}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 lg:ml-auto">
                        {!notification.read && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 hover:bg-green-50"
                            onClick={() => toast.success('Marcada como leída')}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}