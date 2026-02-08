import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MapPin, Clock, Plus, Car, User, Phone, Navigation } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import EmptyState from '../components/common/EmptyState';

const statusConfig = {
  pending: { label: 'Buscando conductor', color: 'bg-yellow-100 text-yellow-700' },
  accepted_by_driver: { label: 'Conductor asignado', color: 'bg-blue-100 text-blue-700' },
  in_trip: { label: 'En camino', color: 'bg-purple-100 text-purple-700' },
  completed: { label: 'Completado', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-700' }
};

export default function PassengerTrips() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    destination_type: '',
    destination_other: ''
  });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const pinUser = localStorage.getItem('pin_user');
      if (pinUser) {
        const userData = JSON.parse(pinUser);
        setUser(userData);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const { data: requests = [] } = useQuery({
    queryKey: ['trip-requests', user?.student_id],
    queryFn: () => base44.entities.TripRequest.filter({ passenger_id: user?.student_id }, '-created_date'),
    enabled: !!user?.student_id,
    staleTime: 60000,
    gcTime: 120000,
    refetchInterval: 15000
  });

  const createRequestMutation = useMutation({
    mutationFn: async (requestData) => {
      const response = await base44.functions.invoke('createTripRequest', requestData);
      return response.data;
    },
    onMutate: async (requestData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['trip-requests', user?.student_id] });

      // Snapshot previous value
      const previousRequests = queryClient.getQueryData(['trip-requests', user?.student_id]);

      // Optimistically update
      const optimisticRequest = {
        id: 'temp-' + Date.now(),
        ...requestData,
        status: 'pending',
        created_date: new Date().toISOString(),
        origin: 'EDP University'
      };

      queryClient.setQueryData(['trip-requests', user?.student_id], (old = []) => [optimisticRequest, ...old]);

      return { previousRequests };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousRequests) {
        queryClient.setQueryData(['trip-requests', user?.student_id], context.previousRequests);
      }
      toast.error('Error al enviar la solicitud');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip-requests'] });
      queryClient.invalidateQueries({ queryKey: ['pending-requests'] });
      setModalOpen(false);
      setFormData({ destination_type: '', destination_other: '' });
      toast.success('✅ Su solicitud ha sido enviada', {
        description: 'Te notificaremos cuando un conductor acepte tu viaje',
        duration: 4000
      });
    }
  });

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!user?.student_id) {
      toast.error('Usuario no identificado');
      return;
    }

    if (!formData.destination_type) {
      toast.error('Selecciona un destino');
      return;
    }

    if (formData.destination_type === 'otros' && !formData.destination_other) {
      toast.error('Especifica el destino');
      return;
    }

    const requestData = {
      destination_type: formData.destination_type,
      destination_other: formData.destination_other,
      student_id: user.student_id,
      student_name: user.full_name,
      student_phone: user.phone || ''
    };

    createRequestMutation.mutate(requestData);
  }, [user, formData, createRequestMutation]);

  const handleCancel = useCallback(async (request) => {
    if (!confirm('¿Cancelar esta solicitud?')) return;

    try {
      await base44.entities.TripRequest.update(request.id, { status: 'cancelled' });
      queryClient.invalidateQueries({ queryKey: ['trip-requests'] });
      toast.success('Cancelado');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cancelar');
    }
  }, [queryClient]);

  const activeRequests = useMemo(() => requests.filter(r => ['pending', 'accepted_by_driver', 'in_trip'].includes(r.status)), [requests]);
  const historyRequests = useMemo(() => requests.filter(r => ['completed', 'cancelled'].includes(r.status)), [requests]);

  const handlePullToRefresh = useCallback(async () => {
    if (refreshing) return;
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['trip-requests'] });
    setTimeout(() => setRefreshing(false), 1000);
  }, [refreshing, queryClient]);

  useEffect(() => {
    let startY = 0;
    let currentY = 0;
    const threshold = 80;

    const handleTouchStart = (e) => {
      if (window.scrollY === 0) {
        startY = e.touches[0].pageY;
      }
    };

    const handleTouchMove = (e) => {
      if (startY === 0) return;
      currentY = e.touches[0].pageY;
      const diff = currentY - startY;
      
      if (diff > 0 && window.scrollY === 0) {
        e.preventDefault();
      }
    };

    const handleTouchEnd = () => {
      if (startY === 0) return;
      const diff = currentY - startY;
      
      if (diff > threshold && window.scrollY === 0) {
        handlePullToRefresh();
      }
      
      startY = 0;
      currentY = 0;
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handlePullToRefresh]);

  return (
    <div className="space-y-6">
      {refreshing && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-teal-600 text-white px-4 py-2 rounded-full shadow-lg">
          Actualizando...
        </div>
      )}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">Mis Viajes</h1>
          <p className="text-slate-500 mt-1">Solicita un viaje cuando lo necesites</p>
        </div>
        <Button 
          onClick={() => setModalOpen(true)}
          className="bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-600/20 text-lg h-12"
        >
          <Plus className="w-5 h-5 mr-2" />
          Pedir Viaje
        </Button>
      </div>

      {/* Active Trips */}
      {activeRequests.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-800">Viajes Activos</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {activeRequests.map(request => (
              <Card key={request.id} className="p-6 border-l-4 border-teal-600">
                <div className="flex justify-between items-start mb-4">
                  <Badge className={statusConfig[request.status].color}>
                    {statusConfig[request.status].label}
                  </Badge>
                  {request.status === 'pending' && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleCancel(request)}
                      className="text-red-600 hover:text-red-700 h-11 sm:h-8"
                    >
                      Cancelar
                    </Button>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Navigation className="w-5 h-5 text-teal-600 mt-0.5 select-none" />
                    <div className="flex-1">
                      <p className="text-sm text-slate-500 select-none">Origen</p>
                      <p className="font-medium text-slate-800">{request.origin}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <MapPin className="w-5 h-5 text-red-600 mt-0.5 select-none" />
                    <div className="flex-1">
                      <p className="text-sm text-slate-500 select-none">Destino</p>
                      <p className="font-medium text-slate-800">{request.destination}</p>
                    </div>
                  </div>

                  {request.pickup_time && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-600">{request.pickup_time}</span>
                    </div>
                  )}

                  {request.driver_name && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-semibold text-blue-900 mb-2">Conductor asignado</p>
                      <div className="flex items-center gap-2 text-sm text-blue-700">
                        <User className="w-4 h-4" />
                        <span>{request.driver_name}</span>
                      </div>
                      {request.vehicle_info && (
                        <div className="flex items-center gap-2 text-sm text-blue-700 mt-1">
                          <Car className="w-4 h-4" />
                          <span>{request.vehicle_info}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* History */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">Historial</h2>
        {historyRequests.length === 0 ? (
          <Card className="p-8">
            <EmptyState
              icon={Car}
              title="Sin viajes anteriores"
              description="Tus viajes completados aparecerán aquí"
            />
          </Card>
        ) : (
          <div className="space-y-3">
            {historyRequests.map(request => (
              <Card key={request.id} className="p-4 hover:bg-slate-50">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={statusConfig[request.status].color} variant="outline">
                        {statusConfig[request.status].label}
                      </Badge>
                      <span className="text-xs text-slate-400">
                        {new Date(request.created_date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 truncate">
                      {request.origin} → {request.destination}
                    </p>
                  </div>
                  {request.driver_name && (
                    <p className="text-sm text-slate-500">{request.driver_name}</p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Request Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>¿A dónde vas?</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {user && (
              <div className="p-4 bg-teal-50 rounded-lg border border-teal-200">
                <div className="flex items-center gap-2 text-teal-900">
                  <User className="w-5 h-5" />
                  <div>
                    <p className="font-medium">{user.full_name}</p>
                    <p className="text-sm text-teal-700">ID: {user.student_id}</p>
                  </div>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label>Tipo de Destino *</Label>
              <Select 
                value={formData.destination_type} 
                onValueChange={(value) => setFormData({ ...formData, destination_type: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="¿A dónde vas?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="biblioteca">Biblioteca</SelectItem>
                  <SelectItem value="edp_university">EDP University</SelectItem>
                  <SelectItem value="farmacia">Farmacia</SelectItem>
                  <SelectItem value="hospital">Hospital</SelectItem>
                  <SelectItem value="hospedaje">Hospedaje</SelectItem>
                  <SelectItem value="piedras_blancas">Piedras Blancas</SelectItem>
                  <SelectItem value="supermercado">Supermercado</SelectItem>
                  <SelectItem value="wellness_edp">Wellness EDP</SelectItem>
                  <SelectItem value="otros">Otros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.destination_type === 'otros' && (
              <div className="space-y-2">
                <Label>Especificar Destino *</Label>
                <Input
                  placeholder="¿A dónde vas?"
                  value={formData.destination_other}
                  onChange={(e) => setFormData({ ...formData, destination_other: e.target.value })}
                  required
                />
              </div>
            )}

            <div className="p-3 bg-slate-50 rounded-lg text-sm text-slate-600">
              <p className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                La hora se registrará automáticamente al enviar
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)} className="flex-1 h-11">
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="flex-1 bg-teal-600 hover:bg-teal-700 h-11"
                disabled={
                  !formData.destination_type ||
                  (formData.destination_type === 'otros' && !formData.destination_other)
                }
              >
                Enviar Solicitud
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}