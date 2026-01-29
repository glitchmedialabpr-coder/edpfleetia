import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Clock, Users, MapPin, TrendingUp } from 'lucide-react';

export default function DriverStats({ drivers, trips }) {
  const [selectedDriver, setSelectedDriver] = useState('');

  // Calculate stats per driver
  const driverStats = drivers.map(driver => {
    const driverTrips = trips.filter(t => 
      t.driver_id === driver.id && 
      t.status === 'completed' &&
      t.started_at &&
      t.completed_at
    );

    // Calculate average duration
    const durations = driverTrips.map(trip => {
      if (!trip.started_at || !trip.completed_at) return 0;
      const [startH, startM] = trip.started_at.split(':').map(Number);
      const [endH, endM] = trip.completed_at.split(':').map(Number);
      return (endH * 60 + endM) - (startH * 60 + startM);
    }).filter(d => d > 0);

    const avgDuration = durations.length > 0 
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      : 0;

    // Total students transported
    const totalStudents = driverTrips.reduce((sum, trip) => 
      sum + (trip.passengers_count || 0), 0
    );

    // Average students per trip
    const avgStudentsPerTrip = driverTrips.length > 0
      ? (totalStudents / driverTrips.length).toFixed(1)
      : 0;

    // Destinations breakdown
    const destinationTypes = {};
    const towns = {};
    
    driverTrips.forEach(trip => {
      if (trip.destination_type) {
        destinationTypes[trip.destination_type] = (destinationTypes[trip.destination_type] || 0) + 1;
      }
      if (trip.destination_town) {
        towns[trip.destination_town] = (towns[trip.destination_town] || 0) + 1;
      }
    });

    return {
      driver,
      totalTrips: driverTrips.length,
      avgDuration,
      totalStudents,
      avgStudentsPerTrip,
      destinationTypes,
      towns
    };
  }).filter(stat => stat.totalTrips > 0);

  const selectedStats = selectedDriver 
    ? driverStats.find(s => s.driver.id === selectedDriver)
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Estadísticas por Chofer</h2>
        <Select value={selectedDriver} onValueChange={setSelectedDriver}>
          <SelectTrigger className="w-full lg:w-80">
            <SelectValue placeholder="Selecciona un chofer" />
          </SelectTrigger>
          <SelectContent>
            {driverStats.map(stat => (
              <SelectItem key={stat.driver.id} value={stat.driver.id}>
                {stat.driver.full_name} ({stat.totalTrips} viajes)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedStats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Viajes Completados</p>
                <p className="text-2xl font-bold text-slate-800">{selectedStats.totalTrips}</p>
              </div>
              <div className="p-2 bg-teal-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-teal-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Tiempo Promedio</p>
                <p className="text-2xl font-bold text-slate-800">{selectedStats.avgDuration} min</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Total Estudiantes</p>
                <p className="text-2xl font-bold text-slate-800">{selectedStats.totalStudents}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Promedio por Viaje</p>
                <p className="text-2xl font-bold text-slate-800">{selectedStats.avgStudentsPerTrip}</p>
              </div>
              <div className="p-2 bg-amber-100 rounded-lg">
                <Users className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </Card>
        </div>
      )}

      {selectedStats && (
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Destination Types */}
          <Card className="p-6">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-slate-600" />
              Tipos de Destino
            </h3>
            <div className="space-y-3">
              {Object.entries(selectedStats.destinationTypes).length > 0 ? (
                Object.entries(selectedStats.destinationTypes)
                  .sort((a, b) => b[1] - a[1])
                  .map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 capitalize">{type}</span>
                      <Badge variant="outline" className="bg-slate-50">
                        {count} viaje{count !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  ))
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">No hay datos de destinos</p>
              )}
            </div>
          </Card>

          {/* Towns */}
          <Card className="p-6">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-slate-600" />
              Pueblos Visitados
            </h3>
            <div className="space-y-3">
              {Object.entries(selectedStats.towns).length > 0 ? (
                Object.entries(selectedStats.towns)
                  .sort((a, b) => b[1] - a[1])
                  .map(([town, count]) => (
                    <div key={town} className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">{town}</span>
                      <Badge variant="outline" className="bg-slate-50">
                        {count} viaje{count !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  ))
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">No hay datos de pueblos</p>
              )}
            </div>
          </Card>
        </div>
      )}

      {!selectedDriver && driverStats.length > 0 && (
        <Card className="p-8">
          <div className="text-center text-slate-500">
            <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="text-sm">Selecciona un chofer para ver sus estadísticas detalladas</p>
          </div>
        </Card>
      )}

      {driverStats.length === 0 && (
        <Card className="p-8">
          <div className="text-center text-slate-500">
            <TrendingUp className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="text-sm">No hay viajes completados para mostrar estadísticas</p>
          </div>
        </Card>
      )}
    </div>
  );
}