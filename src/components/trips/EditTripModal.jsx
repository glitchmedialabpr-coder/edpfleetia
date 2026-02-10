import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function EditTripModal({ trip, open, onClose, onUpdated }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    scheduled_date: '',
    scheduled_time: '',
    route_name: '',
    notes: ''
  });

  useEffect(() => {
    if (trip) {
      setFormData({
        scheduled_date: trip.scheduled_date || '',
        scheduled_time: trip.scheduled_time || '',
        route_name: trip.route_name || '',
        notes: trip.notes || ''
      });
    }
  }, [trip]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await base44.entities.Trip.update(trip.id, formData);
      toast.success('Viaje actualizado exitosamente');
      onUpdated();
      onClose();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al actualizar el viaje');
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Viaje</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Fecha</Label>
            <Input
              type="date"
              value={formData.scheduled_date}
              onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
              required
            />
          </div>

          <div>
            <Label>Hora (12 horas)</Label>
            <Input
              type="time"
              onChange={(e) => {
                const time24 = e.target.value;
                if (time24) {
                  const [hours, minutes] = time24.split(':');
                  const hour = parseInt(hours);
                  const period = hour >= 12 ? 'PM' : 'AM';
                  const hour12 = hour % 12 || 12;
                  const time12 = `${hour12}:${minutes} ${period}`;
                  setFormData({ ...formData, scheduled_time: time12 });
                } else {
                  setFormData({ ...formData, scheduled_time: '' });
                }
              }}
            />
            {formData.scheduled_time && (
              <p className="text-xs text-slate-500 mt-1">{formData.scheduled_time}</p>
            )}
          </div>

          <div>
            <Label>Nombre de Ruta</Label>
            <Input
              value={formData.route_name}
              onChange={(e) => setFormData({ ...formData, route_name: e.target.value })}
              placeholder="Ej: Ruta Centro"
            />
          </div>

          <div>
            <Label>Notas</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Notas adicionales..."
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-teal-600 hover:bg-teal-700"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar Cambios'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}