import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, MapPin, Clock, AlertCircle } from 'lucide-react';
import StatsCard from '@/components/common/StatsCard';

export default function DriverDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const pinUser = localStorage.getItem('pin_user');
    if (pinUser) {
      try {
        setUser(JSON.parse(pinUser));
      } catch (e) {
        localStorage.removeItem('pin_user');
      }
    }
    setLoading(false);
  }, []);

  // Fetch driver data
  const { data: driver } = useQuery({
    queryKey: ['driver', user?.driver_id],
    queryFn: async () => {
      if (!user?.driver_id) return null;
      const drivers = await base44.entities.Driver.filter({ driver_id: user.driver_id });
      return drivers?.[0];
    },
    enabled: !!user?.driver_id,
  });

  // Fetch all trips for this driver
  const { data: allTrips = [] } = useQuery({
    queryKey: ['driver-all-trips', user?.driver_id],
    queryFn: async () => {
      if (!user?.driver_id) return [];
      return await base44.entities.Trip.filter({ driver_id: user.driver_id });
    },
    enabled: !!user?.driver_id,
  });

  // Fetch trip requests
  const { data: tripRequests = [] } = useQuery({
    queryKey: ['driver-trip-requests', user?.driver_id],
    queryFn: async () => {
      if (!user?.driver_id) return [];
      return await base44.entities.TripRequest.filter({ driver_id: user.driver_id });
    },
    enabled: !!user?.driver_id,
  });

  // Calculate statistics
  const today = new Date().toISOString().split('T')[0];
  const todayTrips = allTrips.filter(t => t.scheduled_date === today);
  const completedTrips = allTrips.filter(t => t.status === 'completed');
  const totalStudents = allTrips.reduce((sum, trip) => sum + (trip.students?.length || 0), 0);
  const acceptedRequests = tripRequests.filter(r => r.status === 'accepted').length;
  const completedRequests = tripRequests.filter(r => r.status === 'completed').length;

  // Chart data - Weekly trips
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  const weeklyData = last7Days.map(date => {
    const dayTrips = allTrips.filter(t => t.scheduled_date === date);
    const dayLabel = new Date(date).toLocaleDateString('es-ES', { weekday: 'short' });
    return {
      date: dayLabel,
      viajes: dayTrips.length,
      completados: dayTrips.filter(t => t.status === 'completed').length,
    };
  });

  // Chart data - Trip status distribution
  const statusDistribution = [
    { name: 'Programados', value: allTrips.filter(t => t.status === 'scheduled').length },
    { name: 'En Progreso', value: allTrips.filter(t => t.status === 'in_progress').length },
    { name: 'Completados', value: completedTrips.length },
    { name: 'Cancelados', value: allTrips.filter(t => t.status === 'cancelled').length },
  ];

  const colors = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-800">Panel del Conductor</h1>
        <p className="text-slate-600">
          Bienvenido, {user?.full_name}
          {driver && ` • Vehículo: ${driver.assigned_vehicle_id || 'No asignado'}`}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <StatsCard
          title="Viajes Hoy"
          value={todayTrips.length}
          icon={MapPin}
          color="blue"
          subtitle="Programados"
        />
        <StatsCard
          title="Viajes Totales"
          value={completedTrips.length}
          icon={TrendingUp}
          color="green"
          subtitle="Completados"
        />
        <StatsCard
          title="Estudiantes"
          value={totalStudents}
          icon={Users}
          color="purple"
          subtitle="Transportados"
        />
        <StatsCard
          title="Solicitudes"
          value={acceptedRequests}
          icon={Clock}
          color="orange"
          subtitle="Aceptadas"
        />
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Weekly Trips Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Viajes por Semana</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                  cursor={{ stroke: '#cbd5e1', strokeWidth: 2 }}
                />
                <Legend />
                <Line type="monotone" dataKey="viajes" stroke="#3b82f6" strokeWidth={2} name="Total" />
                <Line type="monotone" dataKey="completados" stroke="#10b981" strokeWidth={2} name="Completados" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Estado de Viajes</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {colors.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Upcoming Trips */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Próximos Viajes</CardTitle>
          </CardHeader>
          <CardContent>
            {todayTrips.length === 0 ? (
              <p className="text-slate-500 text-sm">No hay viajes programados para hoy</p>
            ) : (
              <div className="space-y-3">
                {todayTrips.slice(0, 5).map(trip => (
                  <div key={trip.id} className="flex justify-between items-start p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div>
                      <p className="font-medium text-sm text-slate-800">{trip.route_name || 'Sin nombre'}</p>
                      <p className="text-xs text-slate-500">
                        Hora: {trip.scheduled_time || 'No especificada'}
                      </p>
                      <p className="text-xs text-slate-500">
                        Estudiantes: {trip.students?.length || 0}
                      </p>
                    </div>
                    <Badge className={
                      trip.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                      trip.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                      trip.status === 'completed' ? 'bg-green-100 text-green-800' :
                      'bg-slate-100 text-slate-800'
                    }>
                      {trip.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Desempeño</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Tasa de Completación</span>
                <span className="font-semibold text-slate-800">
                  {allTrips.length > 0 ? Math.round((completedTrips.length / allTrips.length) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{
                    width: `${allTrips.length > 0 ? (completedTrips.length / allTrips.length) * 100 : 0}%`
                  }}
                ></div>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Promedio Estudiantes/Viaje</p>
                    <p className="text-2xl font-bold text-slate-800">
                      {completedTrips.length > 0 ? (totalStudents / completedTrips.length).toFixed(1) : '0'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Viajes Completados</p>
                    <p className="text-2xl font-bold text-slate-800">{completedTrips.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Requests */}
      {acceptedRequests > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Solicitudes Aceptadas Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tripRequests
                .filter(r => r.status === 'accepted')
                .slice(0, 3)
                .map(request => (
                  <div key={request.id} className="flex justify-between items-start p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div>
                      <p className="font-medium text-sm text-slate-800">{request.passenger_name}</p>
                      <p className="text-xs text-slate-500">{request.destination}</p>
                      <p className="text-xs text-slate-500">Tipo: {request.destination_type}</p>
                    </div>
                    <Badge className="bg-teal-100 text-teal-800">Aceptada</Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}