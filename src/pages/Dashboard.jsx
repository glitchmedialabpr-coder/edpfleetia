import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Bus, 
  Users, 
  GraduationCap, 
  Car,
  Plus,
  ArrowRight
} from 'lucide-react';
import StatsCard from '../components/common/StatsCard';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';

export default function Dashboard() {
  const today = format(new Date(), 'yyyy-MM-dd');

  const { data: trips = [] } = useQuery({
    queryKey: ['trips'],
    queryFn: () => base44.entities.Trip.list('-scheduled_date', 100),
    staleTime: 1000 * 60 * 5
  });

  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: () => base44.entities.Student.filter({ status: 'active' }),
    staleTime: 1000 * 60 * 5
  });

  const { data: drivers = [] } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => base44.entities.Driver.list(),
    staleTime: 1000 * 60 * 5
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => base44.entities.Vehicle.list(),
    staleTime: 1000 * 60 * 5
  });

  const todayTrips = trips.filter(t => t.scheduled_date === today);
  const completedToday = todayTrips.filter(t => t.status === 'completed').length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 dark:text-slate-100">Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {format(new Date(), "EEEE, d 'de' MMMM yyyy", { locale: es })}
          </p>
        </div>
        <Link
          to={createPageUrl('Trips')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo Viaje
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Viajes Hoy"
          value={todayTrips.length}
          icon={Bus}
          color="teal"
          subtitle={`${completedToday} completados`}
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
        <StatsCard
          title="Vehículos"
          value={vehicles.length}
          icon={Car}
          color="blue"
        />
      </div>

      {/* Quick Links */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to={createPageUrl('Trips')} className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all">
          <Bus className="w-6 h-6 text-teal-600 mb-2" />
          <h3 className="font-semibold text-slate-800 dark:text-slate-100">Viajes</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Gestiona viajes</p>
        </Link>
        
        <Link to={createPageUrl('Drivers')} className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all">
          <Users className="w-6 h-6 text-emerald-600 mb-2" />
          <h3 className="font-semibold text-slate-800 dark:text-slate-100">Choferes</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Administra choferes</p>
        </Link>

        <Link to={createPageUrl('VehicleManagement')} className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all">
          <Car className="w-6 h-6 text-blue-600 mb-2" />
          <h3 className="font-semibold text-slate-800 dark:text-slate-100">Vehículos</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Gestiona vehículos</p>
        </Link>

        <Link to={createPageUrl('Students')} className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all">
          <GraduationCap className="w-6 h-6 text-purple-600 mb-2" />
          <h3 className="font-semibold text-slate-800 dark:text-slate-100">Estudiantes</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Administra estudiantes</p>
        </Link>
      </div>
    </div>
  );
}