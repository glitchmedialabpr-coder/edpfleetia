import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
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
import { toast } from 'sonner';
import EmptyState from '../components/common/EmptyState';

const statusConfig = {
  pending: { label: 'Buscando conductor', color: 'bg-yellow-100 text-yellow-700' },
  accepted: { label: 'Conductor asignado', color: 'bg-blue-100 text-blue-700' },
  in_progress: { label: 'En camino', color: 'bg-purple-100 text-purple-700' },
  completed: { label: 'Completado', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-700' }
};

export default function PassengerTrips() {
  const [modalOpen, setModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    student_name: '',
    student_id: ''
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const { data: requests = [], refetch } = useQuery({
    queryKey: ['trip-requests', user?.id],
    queryFn: () => base44.entities.TripRequest.filter({ passenger_id: user?.id }, '-created_date'),
    enabled: !!user?.id
  });

  useEffect(() => {
    if (!user?.id) return;

    const unsubscribe = base44.entities.TripRequest.subscribe((event) => {
      if (event.type === 'update' && event.data?.passenger_id === user.id) {
        refetch();
        if (event.data.status === 'accepted') {
          toast.success('¡Un conductor aceptó tu viaje!');
        }
      }
    });

    return unsubscribe;
  }, [user?.id, refetch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    try {
      const now = new Date();
      const timeString = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      
      await base44.entities.TripRequest.create({
        passenger_id: user.id,
        passenger_name: formData.student_name,
        passenger_phone: user.phone || '',
        origin: 'EDP University',
        destination: formData.student_id,
        pickup_time: timeString,
        status: 'pending'
      });

      toast.success('Solicitud enviada');
      setModalOpen(false);
      setFormData({
        student_name: '',
        student_id: ''
      });
      refetch();
    } catch (error) {
      toast.error('Error al crear solicitud');
    }
  };

  const handleCancel = async (request) => {
    if (!confirm('¿Cancelar esta solicitud?')) return;

    try {
      await base44.entities.TripRequest.update(request.id, { status: 'cancelled' });
      toast.success('Solicitud cancelada');
      refetch();
    } catch (error) {
      toast.error('Error al cancelar');
    }
  };

  const activeRequests = requests.filter(r => ['pending', 'accepted', 'in_progress'].includes(r.status));
  const historyRequests = requests.filter(r => ['completed', 'cancelled'].includes(r.status));

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">Mis Viajes</h1>
          <p className="text-slate-500 mt-1">Solicita un viaje cuando lo necesites</p>
        </div>
        <Button 
          onClick={() => setModalOpen(true)}
          className="bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-600/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          Solicitar Viaje
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
                      className="text-red-600 hover:text-red-700"
                    >
                      Cancelar
                    </Button>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Navigation className="w-5 h-5 text-teal-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-slate-500">Origen</p>
                      <p className="font-medium text-slate-800">{request.origin}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <MapPin className="w-5 h-5 text-red-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-slate-500">Destino</p>
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
            <DialogTitle>Solicitar Viaje</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre del Estudiante *</Label>
              <Input
                value={formData.student_name}
                onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
                placeholder="Nombre completo"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>ID del Estudiante *</Label>
              <Input
                value={formData.student_id}
                onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                placeholder="ID del estudiante"
                required
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-lg text-sm text-slate-600">
              <p className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                La hora se registrará automáticamente al enviar
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" className="flex-1 bg-teal-600 hover:bg-teal-700">
                Enviar Solicitud
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}