import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Car,
  Gauge,
  Calendar,
  AlertTriangle,
  Pencil,
  Wrench,
  Shield
} from 'lucide-react';
import { format, differenceInDays, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const statusConfig = {
  available: { label: 'Disponible', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  in_use: { label: 'En Uso', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  maintenance: { label: 'Mantenimiento', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  inactive: { label: 'Inactivo', color: 'bg-slate-100 text-slate-700 border-slate-200' }
};

export default function VehicleCard({ vehicle, onEdit, onMaintenance, onDocuments }) {
  const status = statusConfig[vehicle.status] || statusConfig.available;
  
  // Check service alerts
  const needsService = () => {
    const alerts = [];
    
    // Check mileage
    if (vehicle.next_service_mileage && vehicle.current_mileage) {
      const remaining = vehicle.next_service_mileage - vehicle.current_mileage;
      if (remaining <= 500 && remaining > 0) {
        alerts.push({ type: 'warning', message: `${remaining} km para servicio` });
      } else if (remaining <= 0) {
        alerts.push({ type: 'danger', message: 'Servicio vencido por km' });
      }
    }
    
    // Check date
    if (vehicle.next_service_date) {
      const daysUntil = differenceInDays(parseISO(vehicle.next_service_date), new Date());
      if (daysUntil <= 7 && daysUntil > 0) {
        alerts.push({ type: 'warning', message: `Servicio en ${daysUntil} días` });
      } else if (daysUntil <= 0) {
        alerts.push({ type: 'danger', message: 'Servicio vencido' });
      }
    }
    
    // Check insurance
    if (vehicle.insurance_expiry) {
      const daysUntil = differenceInDays(parseISO(vehicle.insurance_expiry), new Date());
      if (daysUntil <= 30 && daysUntil > 0) {
        alerts.push({ type: 'warning', message: `Seguro vence en ${daysUntil} días` });
      } else if (daysUntil <= 0) {
        alerts.push({ type: 'danger', message: 'Seguro vencido' });
      }
    }
    
    return alerts;
  };

  const alerts = needsService();

  return (
    <Card className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow">
      {vehicle.photo_url && (
        <div className="h-40 bg-slate-100 overflow-hidden">
          <img 
            src={vehicle.photo_url} 
            alt={`${vehicle.brand} ${vehicle.model}`}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {!vehicle.photo_url && (
              <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                <Car className="w-6 h-6 text-teal-600" />
              </div>
            )}
            <div>
              <h3 className="font-bold text-slate-800 text-lg">
                {vehicle.brand} {vehicle.model}
              </h3>
              <p className="text-sm text-slate-500">{vehicle.plate}</p>
            </div>
          </div>
          <Badge variant="outline" className={cn("font-medium border", status.color)}>
            {status.label}
          </Badge>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="space-y-2 mb-4">
            {alerts.map((alert, idx) => (
              <div 
                key={idx}
                className={cn(
                  "flex items-center gap-2 p-2 rounded-lg text-sm",
                  alert.type === 'danger' ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"
                )}
              >
                <AlertTriangle className="w-4 h-4" />
                <span className="font-medium">{alert.message}</span>
              </div>
            ))}
          </div>
        )}

        {/* Details */}
        <div className="space-y-2 mb-4">
          {vehicle.year && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Año</span>
              <span className="font-medium text-slate-700">{vehicle.year}</span>
            </div>
          )}
          {vehicle.color && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Color</span>
              <span className="font-medium text-slate-700">{vehicle.color}</span>
            </div>
          )}
          {vehicle.capacity && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Capacidad</span>
              <span className="font-medium text-slate-700">{vehicle.capacity} pasajeros</span>
            </div>
          )}
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500 flex items-center gap-1">
              <Gauge className="w-3 h-3" />
              Kilometraje
            </span>
            <span className="font-medium text-slate-700">
              {vehicle.current_mileage?.toLocaleString() || 0} km
            </span>
          </div>
        </div>

        {/* Service Info */}
        <div className="space-y-2 p-3 bg-slate-50 rounded-xl mb-4">
          {vehicle.next_service_date && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span className="text-slate-600">
                Próximo servicio: {format(parseISO(vehicle.next_service_date), 'd MMM yyyy', { locale: es })}
              </span>
            </div>
          )}
          {vehicle.insurance_expiry && (
            <div className="flex items-center gap-2 text-sm">
              <Shield className="w-4 h-4 text-slate-400" />
              <span className="text-slate-600">
                Seguro: {format(parseISO(vehicle.insurance_expiry), 'd MMM yyyy', { locale: es })}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => onEdit(vehicle)}
          >
            <Pencil className="w-4 h-4 mr-2" />
            Editar
          </Button>
          <Button 
            className="flex-1 bg-teal-600 hover:bg-teal-700"
            onClick={() => onMaintenance(vehicle)}
          >
            <Wrench className="w-4 h-4 mr-2" />
            Mantenimiento
          </Button>
        </div>
      </div>
    </Card>
  );
}