import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Car, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function DriverVehicleSelection() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [user, setUser] = useState(null);
  const [selecting, setSelecting] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadVehicles();
    }
  }, [user]);

  const loadUser = () => {
    const pinUser = localStorage.getItem('pin_user');
    if (!pinUser) {
      navigate(createPageUrl('DriverLogin'));
      return;
    }
    try {
      const userData = JSON.parse(pinUser);
      setUser(userData);
    } catch (e) {
      localStorage.removeItem('pin_user');
      navigate(createPageUrl('DriverLogin'));
    }
  };

  const loadVehicles = async () => {
    try {
      const allVehicles = await base44.entities.Vehicle.list();
      
      // Si el conductor tiene vehículo asignado, priorizarlo
      if (user?.assigned_vehicle_id) {
        const assigned = allVehicles.find(v => v.id === user.assigned_vehicle_id);
        if (assigned) {
          setVehicles([assigned, ...allVehicles.filter(v => v.id !== user.assigned_vehicle_id)]);
        } else {
          setVehicles(allVehicles);
        }
      } else {
        setVehicles(allVehicles);
      }
    } catch (error) {
      console.error('Error cargando vehículos:', error);
      toast.error('Error al cargar vehículos');
    }
    setLoading(false);
  };

  const handleSelectVehicle = (vehicle) => {
    if (selecting) return;
    
    setSelecting(true);
    setSelectedVehicle(vehicle.id);
    
    // Actualizar usuario con vehículo seleccionado
    const updatedUser = {
      ...user,
      selected_vehicle_id: vehicle.id,
      selected_vehicle_plate: vehicle.plate,
      selected_vehicle_info: `${vehicle.brand} ${vehicle.model}`
    };
    
    localStorage.setItem('pin_user', JSON.stringify(updatedUser));
    // Guardar vehículo seleccionado para DriverRequests
    localStorage.setItem(`driver_vehicle_${user.driver_id}`, JSON.stringify({
      vehicleId: vehicle.id,
      timestamp: Date.now()
    }));
    toast.success(`Vehículo ${vehicle.plate} seleccionado`);
    
    setTimeout(() => {
      navigate(createPageUrl('DriverDashboard'));
    }, 500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-900 via-teal-800 to-emerald-900 flex items-center justify-center p-4">
        <div className="animate-pulse">
          <div className="w-20 h-20 bg-teal-600/30 rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-900 via-teal-800 to-emerald-900 p-4 pt-20">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Seleccionar Vehículo</h1>
          <p className="text-teal-200">¿Qué vehículo usarás hoy?</p>
        </div>

        {vehicles.length === 0 ? (
          <Card className="bg-white/10 border-white/20">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="w-12 h-12 text-yellow-400 mb-4" />
              <p className="text-white text-lg">No hay vehículos disponibles</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vehicles.map((vehicle) => {
              const isAssigned = user.assigned_vehicle_id === vehicle.id;
              
              return (
                <Card 
                  key={vehicle.id}
                  className={`transition-all border-2 ${
                    selectedVehicle === vehicle.id
                      ? 'bg-teal-600/40 border-teal-300 ring-2 ring-teal-300 cursor-wait'
                      : isAssigned 
                        ? 'bg-teal-600/20 border-teal-400 ring-2 ring-teal-400 cursor-pointer hover:bg-teal-600/30' 
                        : 'bg-white/10 border-white/20 hover:border-teal-400/50 hover:bg-white/15 cursor-pointer'
                  } ${selecting ? 'pointer-events-none opacity-60' : ''}`}
                  onClick={() => handleSelectVehicle(vehicle)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-teal-600/30 rounded-lg flex items-center justify-center">
                          <Car className="w-6 h-6 text-teal-400" />
                        </div>
                        <div>
                          <CardTitle className="text-white">
                            {vehicle.brand} {vehicle.model}
                          </CardTitle>
                          <CardDescription className="text-teal-200">
                            Placa: {vehicle.plate}
                          </CardDescription>
                        </div>
                      </div>
                      {isAssigned && (
                        <div className="bg-teal-600 rounded-full p-1">
                          <Check className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="text-sm text-teal-200 space-y-1">
                    <p>Año: {vehicle.year}</p>
                    <p>Capacidad: {vehicle.capacity} pasajeros</p>
                    <p>Km: {vehicle.current_mileage}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <div className="mt-8 flex gap-3">
          <Button
            variant="ghost"
            className="flex-1 text-teal-200 border border-teal-400/30 hover:bg-white/10"
            onClick={() => {
              localStorage.removeItem('pin_user');
              navigate(createPageUrl('DriverLogin'));
            }}
          >
            Cambiar Conductor
          </Button>
        </div>
      </div>
    </div>
  );
}