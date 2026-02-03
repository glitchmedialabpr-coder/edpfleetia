import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Car, 
  Navigation,
  AlertCircle,
  Clock,
  Gauge,
  Calendar,
  Check,
  ChevronRight,
  Fuel
} from 'lucide-react';
import { toast } from 'sonner';

export default function DriverDashboard() {
  const [user, setUser] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [currentVehicleData, setCurrentVehicleData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const pinUser = localStorage.getItem('pin_user');
      if (pinUser) {
        const userData = JSON.parse(pinUser);
        setUser(userData);
        // Set vehicle immediately when user loads
        if (userData.selected_vehicle_id) {
          setSelectedVehicle(userData.selected_vehicle_id);
        }
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => base44.entities.Vehicle.list(),
    staleTime: 1000 * 60 * 5
  });

  const { data: pendingRequests = [] } = useQuery({
    queryKey: ['pending-requests'],
    queryFn: () => base44.entities.TripRequest.filter({ status: 'pending' }),
    staleTime: 1000 * 30
  });

  const { data: acceptedRequests = [] } = useQuery({
    queryKey: ['accepted-requests', user?.driver_id],
    queryFn: () => base44.entities.TripRequest.filter({ 
      driver_id: user?.driver_id,
      status: 'accepted_by_driver'
    }, '-created_date'),
    enabled: !!user?.driver_id,
    staleTime: 1000 * 30
  });

  // Load vehicle data when selectedVehicle changes
  useEffect(() => {
    if (selectedVehicle && vehicles.length > 0) {
      const vehicle = vehicles.find(v => v.id === selectedVehicle);
      setCurrentVehicleData(vehicle);
    }
  }, [selectedVehicle, vehicles]);

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-800">Mi Dashboard</h1>
        <p className="text-slate-500">Bienvenido, {user?.full_name}</p>
      </div>

      {/* Vehicle Info Card */}
      {user?.selected_vehicle_plate && (
        <Card className="p-6 bg-gradient-to-br from-teal-50 to-white border-teal-200">
          <div className="flex items-center gap-3 mb-4">
            <Car className="w-6 h-6 text-teal-600" />
            <h2 className="text-xl font-semibold text-slate-800">Mi Vehículo</h2>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">Vehículo seleccionado:</span>
              <Badge className="bg-teal-600 text-white text-base px-3 py-1">
                {user.selected_vehicle_info} - {user.selected_vehicle_plate}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Seleccionado durante el inicio de sesión
            </p>
          </div>
        </Card>
      )}

      {/* Vehicle Details */}
      {currentVehicleData && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Vehicle Info Card */}
          <Card className="p-6">
            <h3 className="font-semibold text-slate-800 mb-4">Información del Vehículo</h3>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">Placa</span>
                <span className="font-medium text-slate-800">{currentVehicleData.plate}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">Marca y Modelo</span>
                <span className="font-medium text-slate-800">{currentVehicleData.brand} {currentVehicleData.model}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">Año</span>
                <span className="font-medium text-slate-800">{currentVehicleData.year}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">Color</span>
                <span className="font-medium text-slate-800">{currentVehicleData.color}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-600">Capacidad de Pasajeros</span>
                <Badge className="bg-teal-100 text-teal-700">{currentVehicleData.capacity} personas</Badge>
              </div>
            </div>
          </Card>

          {/* Vehicle Status Card */}
          <Card className="p-6">
            <h3 className="font-semibold text-slate-800 mb-4">Estado y Mantenimiento</h3>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">Estado</span>
                <Badge className="bg-green-100 text-green-700">Disponible</Badge>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">Kilometraje</span>
                <span className="font-medium text-slate-800">{currentVehicleData.current_mileage?.toLocaleString()} km</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">Próximo Servicio</span>
                <span className="font-medium text-slate-800">{currentVehicleData.next_service_date || 'No programado'}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-600">Seguro Vence</span>
                <span className="font-medium text-slate-800">{currentVehicleData.insurance_expiry || 'No especificado'}</span>
              </div>
            </div>
          </Card>
        </div>
      )}



      {/* Quick Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Solicitudes Pendientes</p>
              <p className="text-3xl font-bold text-slate-800">{pendingRequests.length}</p>
            </div>
            <Navigation className="w-10 h-10 text-slate-200" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Estudiantes Aceptados</p>
              <p className="text-3xl font-bold text-slate-800">{acceptedRequests.length}</p>
            </div>
            <Check className="w-10 h-10 text-slate-200" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Capacidad Disponible</p>
              <p className="text-3xl font-bold text-slate-800">{currentVehicleData ? currentVehicleData.capacity - acceptedRequests.length : 0}</p>
            </div>
            <Car className="w-10 h-10 text-slate-200" />
          </div>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button 
          onClick={() => navigate(createPageUrl('DriverRequests'))}
          className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-3 text-base"
          disabled={!selectedVehicle}
        >
          <Navigation className="w-4 h-4 mr-2" />
          Ver Solicitudes de Viaje
          <ChevronRight className="w-4 h-4 ml-auto" />
        </Button>
        
        <Button 
          onClick={() => navigate(createPageUrl('DriverTrips'))}
          variant="outline"
          className="flex-1 py-3 text-base"
        >
          <Calendar className="w-4 h-4 mr-2" />
          Mis Viajes
          <ChevronRight className="w-4 h-4 ml-auto" />
        </Button>
      </div>
    </div>
  );
}