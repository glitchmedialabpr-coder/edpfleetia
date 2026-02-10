import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  User, 
  Car,
  MapPin,
  Navigation,
  CheckCircle2,
  Users,
  Pencil,
  Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { convertTo12Hour } from '@/components/common/timeUtils';

const statusConfig = {
  scheduled: { label: 'Programado', color: 'bg-blue-100 text-blue-700' },
  in_progress: { label: 'En Progreso', color: 'bg-purple-100 text-purple-700' },
  completed: { label: 'Completado', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-700' }
};

const TripCard = React.memo(({ trip, showDriver, onStart, onComplete, onEdit, onDelete }) => {
  const status = statusConfig[trip.status] || statusConfig.scheduled;
  
  return (
    <Card className="p-5 border-0 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <Badge className={status.color}>
          {status.label}
        </Badge>
        <div className="flex items-center gap-1">
          {onEdit && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => onEdit(trip)}
              className="h-8 w-8"
            >
              <Pencil className="w-4 h-4 text-slate-400" />
            </Button>
          )}
          {onDelete && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => onDelete(trip)}
              className="h-8 w-8"
            >
              <Trash2 className="w-4 h-4 text-red-400" />
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {showDriver && trip.driver_name && (
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-slate-400" />
            <span className="text-slate-700 font-medium">{trip.driver_name}</span>
          </div>
        )}

        {trip.vehicle_info && (
          <div className="flex items-center gap-2 text-sm">
            <Car className="w-4 h-4 text-slate-400" />
            <span className="text-slate-600">{trip.vehicle_info}</span>
          </div>
        )}

        {trip.scheduled_time && (
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-slate-400" />
            <span className="text-slate-600">{convertTo12Hour(trip.scheduled_time)}</span>
          </div>
        )}

        {trip.students && trip.students.length > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-slate-400" />
            <span className="text-slate-600">{trip.students.length} estudiante{trip.students.length > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {trip.status === 'scheduled' && onStart && (
        <Button 
          onClick={() => onStart(trip)}
          className="w-full mt-4 bg-teal-600 hover:bg-teal-700"
        >
          <Navigation className="w-4 h-4 mr-2" />
          Iniciar Viaje
        </Button>
      )}

      {trip.status === 'in_progress' && onComplete && (
        <Button 
          onClick={() => onComplete(trip)}
          className="w-full mt-4 bg-green-600 hover:bg-green-700"
        >
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Completar Viaje
        </Button>
      )}
    </Card>
  );
});

TripCard.displayName = 'TripCard';

export default TripCard;