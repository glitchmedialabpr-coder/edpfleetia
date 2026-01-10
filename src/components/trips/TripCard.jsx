import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  MapPin, 
  Users, 
  Play, 
  CheckCircle2,
  Building2,
  User
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const statusConfig = {
  scheduled: { label: 'Programado', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  in_progress: { label: 'En Progreso', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  completed: { label: 'Completado', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-700 border-red-200' }
};

export default function TripCard({ 
  trip, 
  onStart, 
  onComplete, 
  showDriver = false,
  compact = false 
}) {
  const status = statusConfig[trip.status] || statusConfig.scheduled;

  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-300 hover:shadow-lg border-0 shadow-sm",
      trip.status === 'in_progress' && "ring-2 ring-blue-500 ring-offset-2"
    )}>
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-slate-400" />
              <span className="font-semibold text-slate-800">
                {trip.scheduled_time || 'Sin hora'}
              </span>
            </div>
            {trip.route_name && (
              <p className="text-sm text-slate-500">{trip.route_name}</p>
            )}
          </div>
          <Badge variant="outline" className={cn("font-medium border", status.color)}>
            {status.label}
          </Badge>
        </div>

        {/* Driver Info */}
        {showDriver && trip.driver_name && (
          <div className="flex items-center gap-2 mb-4 p-3 bg-slate-50 rounded-xl">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">{trip.driver_name}</p>
              <p className="text-xs text-slate-500">Chofer asignado</p>
            </div>
          </div>
        )}

        {/* Students */}
        {trip.students && trip.students.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-600">
                {trip.students.length} estudiante{trip.students.length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="space-y-2">
              {trip.students.slice(0, compact ? 2 : 5).map((student, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-xs font-medium text-slate-600">
                    {student.student_name?.charAt(0) || '?'}
                  </div>
                  <span className="text-slate-700 flex-1 truncate">{student.student_name}</span>
                  {student.housing_name && (
                    <span className="text-slate-400 text-xs flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      {student.housing_name}
                    </span>
                  )}
                </div>
              ))}
              {trip.students.length > (compact ? 2 : 5) && (
                <p className="text-xs text-slate-400 pl-8">
                  +{trip.students.length - (compact ? 2 : 5)} más
                </p>
              )}
            </div>
          </div>
        )}

        {/* Destinations */}
        {trip.destinations && trip.destinations.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-600">Destinos</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {trip.destinations.map((dest, idx) => (
                <Badge key={idx} variant="secondary" className="bg-slate-100 text-slate-600">
                  {dest}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Times */}
        {(trip.departure_time || trip.arrival_time) && (
          <div className="flex gap-4 text-sm text-slate-500 mb-4 p-3 bg-slate-50 rounded-xl">
            {trip.departure_time && (
              <div>
                <span className="text-slate-400">Salida:</span>{' '}
                <span className="font-medium text-slate-700">{trip.departure_time}</span>
              </div>
            )}
            {trip.arrival_time && (
              <div>
                <span className="text-slate-400">Llegada:</span>{' '}
                <span className="font-medium text-emerald-600">{trip.arrival_time}</span>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        {(trip.status === 'scheduled' || trip.status === 'in_progress') && (
          <div className="flex gap-2 pt-2">
            {trip.status === 'scheduled' && onStart && (
              <Button 
                onClick={() => onStart(trip)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20"
              >
                <Play className="w-4 h-4 mr-2" />
                Iniciar Viaje
              </Button>
            )}
            {trip.status === 'in_progress' && onComplete && (
              <Button 
                onClick={() => onComplete(trip)}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Marcar Llegada
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}