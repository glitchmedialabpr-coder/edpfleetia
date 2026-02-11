import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ReportIssueButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [issueType, setIssueType] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!issueType || !description) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    try {
      const response = await base44.functions.invoke('handleDriverIssueNotification', {
        issue_type: issueType,
        description,
        priority
      });

      if (response.data?.success) {
        toast.success('Reporte enviado a los administradores');
        setOpen(false);
        setIssueType('');
        setDescription('');
        setPriority('medium');
      } else {
        toast.error('Error al enviar el reporte');
      }
    } catch (error) {
      toast.error('Error al enviar el reporte');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <AlertCircle className="w-4 h-4" />
          Reportar Problema
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reportar Problema</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Tipo de Problema</Label>
            <Select value={issueType} onValueChange={setIssueType}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Problema Mecánico">Problema Mecánico</SelectItem>
                <SelectItem value="Accidente">Accidente</SelectItem>
                <SelectItem value="Problema con Pasajero">Problema con Pasajero</SelectItem>
                <SelectItem value="Problema de Ruta">Problema de Ruta</SelectItem>
                <SelectItem value="Emergencia">Emergencia</SelectItem>
                <SelectItem value="Otro">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Prioridad</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Baja</SelectItem>
                <SelectItem value="medium">Media</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Descripción</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe el problema en detalle..."
              rows={4}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar Reporte'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}