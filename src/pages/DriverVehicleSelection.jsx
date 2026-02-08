import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Car, Check, Fuel, Users, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export default function DriverVehicleSelection() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const pinUser = localStorage.getItem('pin_user');
      if (!pinUser) {
        navigate(createPageUrl('DriverLogin'));
        return;
      }

      const userData = JSON.parse(pinUser);
      setUser(userData);
      setSelectedVehicleId(userData.selected_vehicle_id || null);

      const vehiclesData = await base44.entities.Vehicle.list();
      setVehicles(vehiclesData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error al cargar datos');
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
      toast.success(`Vehículo ${vehicle.plate} seleccionado correctamente`);
      navigate(createPageUrl('DriverDashboard'));
    } catch (error) {
      console.error('Error selecting vehicle:', error);
      toast.error('Error al seleccionar vehículo');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse text-slate-600">Cargando vehículos...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-16 lg:top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(createPageUrl('DriverDashboard'))}
            className="lg:hidden"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Seleccionar Vehículo</h1>
            <p className="text-sm text-slate-600">Elige el vehículo para tu turno</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {vehicles.length === 0 ? (
          <Card className="p-8 text-center">
            <Car className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600">No hay vehículos disponibles</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {vehicles.map((vehicle) => {
              const isSelected = selectedVehicleId === vehicle.id;
              return (
                <Card
                  key={vehicle.id}
                  className={`p-6 cursor-pointer transition-all border-2 hover:shadow-lg ${
                    isSelected
                      ? 'border-teal-600 bg-teal-50'
                      : 'border-slate-200 hover:border-teal-400'
                  }`}
                  onClick={() => setSelectedVehicleId(vehicle.id)}
                >
                  {/* Header with icon and selection */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Car className="w-7 h-7 text-teal-600" />
                    </div>
                    {isSelected && (
                      <Badge className="bg-teal-600 text-white">
                        <Check className="w-3 h-3 mr-1" />
                        Seleccionado
                      </Badge>
                    )}
                  </div>

                  {/* Vehicle Info */}
                  <h3 className="text-xl font-bold text-slate-800 mb-1">
                    {vehicle.brand} {vehicle.model}
                  </h3>
                  <p className="text-sm text-slate-600 mb-4">
                    Año {vehicle.year} • {vehicle.color}
                  </p>

                  {/* Badge with plate */}
                  <Badge className="bg-slate-100 text-slate-700 mb-4 text-base px-3 py-1">
                    {vehicle.plate}
                  </Badge>

                  {/* Vehicle Details Grid */}
                  <div className="space-y-3 mb-6 pt-4 border-t border-slate-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Users className="w-4 h-4" />
                        <span className="text-sm">Capacidad</span>
                      </div>
                      <span className="font-semibold text-slate-800">{vehicle.capacity} personas</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Fuel className="w-4 h-4" />
                        <span className="text-sm">Kilometraje</span>
                      </div>
                      <span className="font-semibold text-slate-800">
                        {vehicle.current_mileage?.toLocaleString()} km
                      </span>
                    </div>

                    {vehicle.next_service_date && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm">Próximo Servicio</span>
                        </div>
                        <span className="font-semibold text-slate-800">{vehicle.next_service_date}</span>
                      </div>
                    )}
                  </div>

                  {/* Select Button */}
                  <Button
                    onClick={() => handleSelectVehicle(vehicle)}
                    className={`w-full py-2 ${
                      isSelected
                        ? 'bg-teal-600 hover:bg-teal-700 text-white'
                        : 'bg-slate-100 hover:bg-teal-600 text-slate-800 hover:text-white'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Confirmar Selección
                      </>
                    ) : (
                      'Seleccionar Vehículo'
                    )}
                  </Button>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}