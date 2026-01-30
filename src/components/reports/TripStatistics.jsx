import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Bus, TrendingUp, Clock, MapPin } from 'lucide-react';

const COLORS = ['#14b8a6', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function TripStatistics({ trips, period }) {
  const stats = useMemo(() => {
    const completed = trips.filter(t => t.status === 'completed').length;
    const inProgress = trips.filter(t => t.status === 'in_progress').length;
    const cancelled = trips.filter(t => t.status === 'cancelled').length;
    const scheduled = trips.filter(t => t.status === 'scheduled').length;

    // Rutas más frecuentes
    const routeCount = {};
    const routeTimes = {};
    
    trips.forEach(trip => {
      if (trip.route_name) {
        routeCount[trip.route_name] = (routeCount[trip.route_name] || 0) + 1;
        
        if (trip.departure_time && trip.arrival_time) {
          const [depH, depM] = trip.departure_time.split(':').map(Number);
          const [arrH, arrM] = trip.arrival_time.split(':').map(Number);
          const duration = (arrH * 60 + arrM) - (depH * 60 + depM);
          
          if (!routeTimes[trip.route_name]) {
            routeTimes[trip.route_name] = [];
          }
          routeTimes[trip.route_name].push(duration);
        }
      }
    });

    const topRoutes = Object.entries(routeCount)
      .map(([route, count]) => {
        const times = routeTimes[route] || [];
        const avgTime = times.length > 0 
          ? Math.round(times.reduce((a, b) => a + b, 0) / times.length)
          : 0;
        return { route, count, avgTime };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Datos por conductor
    const driverStats = {};
    trips.forEach(trip => {
      if (trip.driver_name) {
        if (!driverStats[trip.driver_name]) {
          driverStats[trip.driver_name] = { completed: 0, total: 0, students: 0 };
        }
        driverStats[trip.driver_name].total++;
        if (trip.status === 'completed') {
          driverStats[trip.driver_name].completed++;
          driverStats[trip.driver_name].students += trip.students?.length || 0;
        }
      }
    });

    const topDrivers = Object.entries(driverStats)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.completed - a.completed)
      .slice(0, 5);

    // Estudiantes más activos
    const studentCount = {};
    trips.forEach(trip => {
      if (trip.students) {
        trip.students.forEach(student => {
          if (student.student_name) {
            studentCount[student.student_name] = (studentCount[student.student_name] || 0) + 1;
          }
        });
      }
    });

    const topStudents = Object.entries(studentCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      completed,
      inProgress,
      cancelled,
      scheduled,
      total: trips.length,
      topRoutes,
      topDrivers,
      topStudents
    };
  }, [trips]);

  const statusData = [
    { name: 'Completados', value: stats.completed, color: COLORS[0] },
    { name: 'En Progreso', value: stats.inProgress, color: COLORS[1] },
    { name: 'Programados', value: stats.scheduled, color: COLORS[2] },
    { name: 'Cancelados', value: stats.cancelled, color: COLORS[3] }
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-6">
      {/* Resumen General */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Viajes</p>
              <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
              <Bus className="w-6 h-6 text-teal-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Completados</p>
              <p className="text-2xl font-bold text-emerald-600">{stats.completed}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">En Progreso</p>
              <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Cancelados</p>
              <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <MapPin className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Distribución de Estados */}
        <Card className="p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Distribución de Viajes</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Conductores Más Activos */}
        <Card className="p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Conductores Más Activos</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.topDrivers}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="completed" fill={COLORS[0]} name="Viajes Completados" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Rutas Más Frecuentes */}
      <Card className="p-6">
        <h3 className="font-semibold text-slate-800 mb-4">Rutas Más Frecuentes</h3>
        <div className="space-y-3">
          {stats.topRoutes.map((route, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Badge className="bg-teal-100 text-teal-700">{idx + 1}</Badge>
                <div>
                  <p className="font-medium text-slate-800">{route.route}</p>
                  <p className="text-sm text-slate-500">
                    {route.count} viajes • Tiempo promedio: {route.avgTime} min
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-teal-600">{route.count}</p>
              </div>
            </div>
          ))}
          {stats.topRoutes.length === 0 && (
            <p className="text-sm text-slate-500 text-center py-4">No hay datos de rutas</p>
          )}
        </div>
      </Card>

      {/* Estudiantes Más Activos */}
      <Card className="p-6">
        <h3 className="font-semibold text-slate-800 mb-4">Estudiantes Más Activos</h3>
        <div className="grid md:grid-cols-2 gap-3">
          {stats.topStudents.map((student, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Badge className="bg-purple-100 text-purple-700">{idx + 1}</Badge>
                <p className="font-medium text-slate-800">{student.name}</p>
              </div>
              <Badge className="bg-teal-100 text-teal-700">{student.count} viajes</Badge>
            </div>
          ))}
          {stats.topStudents.length === 0 && (
            <p className="text-sm text-slate-500 text-center py-4 col-span-2">No hay datos de estudiantes</p>
          )}
        </div>
      </Card>
    </div>
  );
}