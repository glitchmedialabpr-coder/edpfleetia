import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  User, 
  Navigation,
  CheckCircle,
  ArrowLeft,
  Users
} from 'lucide-react';
import { toast } from 'sonner';

export default function DriverAcceptedStudents() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const pinUser = localStorage.getItem('pin_user');
      if (pinUser) {
        setUser(JSON.parse(pinUser));
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const { data: acceptedRequests = [] } = useQuery({
    queryKey: ['accepted-requests', user?.driver_id],
    queryFn: () => base44.entities.TripRequest.filter({ 
      driver_id: user?.driver_id,
      status: 'accepted_by_driver'
    }, '-created_date'),
    enabled: !!user?.driver_id,
    refetchInterval: 15000
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => base44.entities.Vehicle.filter({ status: 'available' }),
    staleTime: 1000 * 60 * 5
  });

  const handleStartTrip = async () => {
    if (!acceptedRequests.length) {
      toast.error('No hay estudiantes');
      return;
    }

    if (!user?.driver_id) {
      toast.error('Error de sesión');
      return;
    }

    try {
      await toast.promise(
        base44.functions.invoke('createTripFromRequests', {
          acceptedRequests,
          selectedVehicle: acceptedRequests[0].vehicle_id,
          driverId: user.driver_id,
          driverName: user.full_name || user.email
        }),
        {
          loading: 'Iniciando...',
          success: () => {
            setTimeout(() => navigate(createPageUrl('DriverTrips')), 200);
            return `${acceptedRequests.length} estudiantes`;
          },
          error: 'Error'
        }
      );
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(createPageUrl('DriverRequests'))}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Estudiantes Aceptados</h1>
          <p className="text-sm text-slate-500">Revisa y comienza el viaje</p>
        </div>
      </div>

      {acceptedRequests.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-slate-500">Sin estudiantes aceptados</p>
          <Button
            onClick={() => navigate(createPageUrl('DriverRequests'))}
            className="mt-4 w-full"
          >
            Volver a Solicitudes
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card className="p-4 md:p-6 bg-gradient-to-br from-purple-50 to-white border-purple-200">
            <div className="flex items-center justify-between mb-4">
              <Badge className="bg-purple-100 text-purple-700 text-sm px-3 py-1">
                <Users className="w-3 h-3 mr-1 inline" />
                {acceptedRequests.length} estudiantes
              </Badge>
              <span className="text-sm text-slate-500">Máximo: 15</span>
            </div>

            <div className="space-y-3">
              {acceptedRequests.map(req => (
                <div key={req.id} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-slate-200 hover:border-purple-300 transition-colors">
                  <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm md:text-base">{req.passenger_name}</p>
                    <div className="flex items-center gap-1 mt-1 text-slate-600">
                      <MapPin className="w-4 h-4 text-red-500 flex-shrink-0" />
                      <span className="text-xs md:text-sm truncate">{req.destination}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="space-y-2">
            <Button 
              onClick={handleStartTrip}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 md:py-4 text-base md:text-lg h-auto"
            >
              <Navigation className="w-5 h-5 mr-2" />
              Comenzar Viaje
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(createPageUrl('DriverRequests'))}
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}