import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Car, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function VehicleSelectionModal({ open, onOpenChange, user, onVehicleSelected }) {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      loadVehicles();
    }
  }, [open]);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const data = await base44.entities.Vehicle.list();
      setVehicles(data || []);
    } catch (error) {
      console.error('Error loading vehicles:', error);
      toast.error('Error al cargar vehículos');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectVehicle = async (vehicle) => {
    try {
      const updatedUser = {
        ...user,
        selected_vehicle_id: vehicle.id,
        selected_vehicle_plate: vehicle.plate,
        selected_vehicle_info: `${vehicle.brand} ${vehicle.model}`
      };

      localStorage.setItem('pin_user', JSON.stringify(updatedUser));
      toast.success(`Vehículo ${vehicle.plate} seleccionado`);
      onVehicleSelected(updatedUser);
      onOpenChange(false);
    } catch (error) {
      console.error('Error selecting vehicle:', error);
      toast.error('Error al seleccionar vehículo');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Seleccionar Vehículo</DialogTitle>
          <DialogDescription>
            Elige el vehículo que usarás para tu turno
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-pulse">Cargando vehículos...</div>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="text-center py-8 text-slate-600">
            No hay vehículos disponibles
          </div>
        ) : (
          <div className="grid gap-4">
            {vehicles.map((vehicle) => (
              <Card
                key={vehicle.id}
                className="p-4 cursor-pointer border-2 transition-all hover:border-teal-500"
                onClick={() => handleSelectVehicle(vehicle)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-16 h-16 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Car className="w-8 h-8 text-teal-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-800">
                        {vehicle.brand} {vehicle.model} ({vehicle.year})
                      </h3>
                      <p className="text-sm text-slate-600">Placa: {vehicle.plate}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {vehicle.color}
                        </Badge>
                        <Badge className="bg-teal-100 text-teal-700 text-xs">
                          Capacidad: {vehicle.capacity}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectVehicle(vehicle);
                    }}
                    className="bg-teal-600 hover:bg-teal-700 text-white"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Seleccionar
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}