import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  MapPin,
  User,
  Calendar,
  Navigation
} from 'lucide-react';
import { createPageUrl } from '../utils';
import { useNavigate } from 'react-router-dom';
import StatsCard from '../components/common/StatsCard';
import EmptyState from '../components/common/EmptyState';
import { toast } from 'sonner';

const statusConfig = {
  pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700' },
  accepted: { label: 'Aceptado', color: 'bg-blue-100 text-blue-700' },
  accepted_by_driver: { label: 'Aceptado', color: 'bg-blue-100 text-blue-700' },
  in_trip: { label: 'En viaje', color: 'bg-purple-100 text-purple-700' },
  completed: { label: 'Completado', color: 'bg-green-100 text-green-700' }
};

export default function DriverDashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
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

  // Fetch pending requests
  const { data: pendingRequests = [], refetch: refetchRequests } = useQuery({
    queryKey: ['pending-requests'],
    queryFn: () => base44.entities.TripRequest.filter({ status: 'pending' }, '-created_date'),
    enabled: !!user,
    refetchInterval: 5000
  });

  // Fetch accepted requests
  const { data: acceptedRequests = [] } = useQuery({
    queryKey: ['accepted-requests', user?.driver_id],
    queryFn: () => base44.entities.TripRequest.filter({ 
      driver_id: user?.driver_id,
      status: 'accepted_by_driver'
    }),
    enabled: !!user?.driver_id
  });

  // Fetch today's trips
  const { data: todayTrips = [] } = useQuery({
    queryKey: ['today-trips', user?.driver_id],
    queryFn: () => base44.entities.Trip.filter({ 
      driver_id: user?.driver_id,
      scheduled_date: today
    }),
    enabled: !!user?.driver_id
  });

  // Fetch earnings
  const { data: allEarnings = [] } = useQuery({
    queryKey: ['earnings', user?.driver_id],
    queryFn: () => base44.entities.DriverEarnings.filter({ driver_id: user?.driver_id }, '-date'),
    enabled: !!user?.driver_id
  });

  const todayEarnings = allEarnings.filter(e => e.date === today);
  const totalEarnings = allEarnings.reduce((sum, e) => sum + (e.amount || 0), 0);
  const todayTotal = todayEarnings.reduce((sum, e) => sum + (e.amount || 0), 0);

  const completedToday = todayTrips.filter(t => t.status === 'completed').length;
  const inProgressToday = todayTrips.filter(t => t.status === 'in_progress').length;

  const handleAcceptRequest = async (request) => {
    if (!user?.driver_id) return;
    
    try {
      await base44.entities.TripRequest.update(request.id, {
        status: 'accepted_by_driver',
        driver_id: user.driver_id,
        driver_name: user.full_name,
        accepted_at: format(new Date(), 'HH:mm')
      });
      
      toast.success('Solicitud aceptada');
      refetchRequests();
    } catch (error) {
      toast.error('Error al aceptar solicitud');
    }
  };

  const handleRejectRequest = async (request) => {
    try {
      await base44.entities.TripRequest.update(request.id, { status: 'rejected' });
      toast.success('Solicitud rechazada');
      refetchRequests();
    } catch (error) {
      toast.error('Error al rechazar');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">Panel de Control</h1>
        <p className="text-slate-500 mt-1">
          {format(new Date(), "EEEE, d 'de' MMMM yyyy", { locale: es })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Ganancias Hoy"
          value={`$${todayTotal.toFixed(2)}`}
          icon={DollarSign}
          color="emerald"
        />
        <StatsCard
          title="Total Ganado"
          value={`$${totalEarnings.toFixed(2)}`}
          icon={TrendingUp}
          color="blue"
        />
        <StatsCard
          title="Viajes Hoy"
          value={completedToday}
          icon={CheckCircle2}
          color="teal"
        />
        <StatsCard
          title="Solicitudes"
          value={pendingRequests.length}
          icon={AlertCircle}
          color="amber"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Button 
          onClick={() => navigate(createPageUrl('DriverRequests'))}
          className="h-auto py-4 bg-teal-600 hover:bg-teal-700 flex-col gap-2"
        >
          <AlertCircle className="w-6 h-6" />
          <span>Ver Solicitudes ({pendingRequests.length})</span>
        </Button>
        
        <Button 
          onClick={() => navigate(createPageUrl('DriverAcceptedStudents'))}
          variant="outline"
          className="h-auto py-4 flex-col gap-2"
        >
          <User className="w-6 h-6" />
          <span>Estudiantes Aceptados ({acceptedRequests.length})</span>
        </Button>

        <Button 
          onClick={() => navigate(createPageUrl('DriverTrips'))}
          variant="outline"
          className="h-auto py-4 flex-col gap-2"
        >
          <Calendar className="w-6 h-6" />
          <span>Mis Viajes</span>
        </Button>
      </div>

      {/* Pending Requests Preview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">Solicitudes Recientes</h2>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate(createPageUrl('DriverRequests'))}
          >
            Ver todas
          </Button>
        </div>

        {pendingRequests.length === 0 ? (
          <Card className="p-8">
            <EmptyState
              icon={AlertCircle}
              title="No hay solicitudes pendientes"
              description="Las nuevas solicitudes aparecerán aquí"
            />
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {pendingRequests.slice(0, 4).map(request => (
              <Card key={request.id} className="p-4 border-l-4 border-yellow-500">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <Badge className={statusConfig.pending.color}>
                      Nueva Solicitud
                    </Badge>
                    {request.pickup_time && (
                      <div className="flex items-center gap-1 text-sm text-slate-500">
                        <Clock className="w-4 h-4" />
                        {request.pickup_time}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <User className="w-4 h-4 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-slate-800">{request.passenger_name}</p>
                        {request.passenger_phone && (
                          <p className="text-xs text-slate-500">{request.passenger_phone}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Navigation className="w-4 h-4 text-teal-600 mt-0.5" />
                      <p className="text-sm text-slate-600">{request.origin}</p>
                    </div>

                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-red-600 mt-0.5" />
                      <p className="text-sm text-slate-600">{request.destination}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button 
                      onClick={() => handleAcceptRequest(request)}
                      className="flex-1 bg-teal-600 hover:bg-teal-700"
                      size="sm"
                    >
                      Aceptar
                    </Button>
                    <Button 
                      onClick={() => handleRejectRequest(request)}
                      variant="outline"
                      size="sm"
                    >
                      Rechazar
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Today's Earnings */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">Ganancias de Hoy</h2>
        
        {todayEarnings.length === 0 ? (
          <Card className="p-8">
            <EmptyState
              icon={DollarSign}
              title="No hay ganancias registradas hoy"
              description="Completa viajes para empezar a ganar"
            />
          </Card>
        ) : (
          <Card className="divide-y divide-slate-100">
            {todayEarnings.map(earning => (
              <div key={earning.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{earning.passenger_name}</p>
                    <p className="text-sm text-slate-500">{earning.destination}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-emerald-600">${earning.amount.toFixed(2)}</p>
                  <Badge 
                    variant="outline" 
                    className={earning.status === 'paid' ? 'border-emerald-500 text-emerald-700' : ''}
                  >
                    {earning.status === 'paid' ? 'Pagado' : 'Pendiente'}
                  </Badge>
                </div>
              </div>
            ))}
          </Card>
        )}
      </div>
    </div>
  );
}