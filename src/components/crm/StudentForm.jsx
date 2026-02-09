import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { X } from 'lucide-react';

export default function StudentForm({ student, onClose }) {
  const [formData, setFormData] = useState(student || {
    full_name: '',
    student_id: '',
    phone: '',
    email: '',
    housing_id: '',
    housing_name: '',
    status: 'active',
  });

  const queryClient = useQueryClient();
  const { data: housings = [] } = useQuery({
    queryKey: ['housings'],
    queryFn: () => base44.entities.Housing.list(),
  });

  const mutation = useMutation({
    mutationFn: (data) =>
      student ? base44.entities.Student.update(student.id, data) : base44.entities.Student.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success(student ? 'Estudiante actualizado' : 'Estudiante creado');
      onClose();
    },
    onError: () => toast.error('Error al guardar estudiante'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <Card className="border-blue-200 dark:border-blue-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{student ? 'Editar Estudiante' : 'Nuevo Estudiante'}</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nombre Completo"
              placeholder="Nombre completo"
              value={formData.full_name}
              onChange={(e) => setFormData({...formData, full_name: e.target.value})}
              required
            />
            <Input
              label="ID Estudiante"
              placeholder="ID del estudiante"
              value={formData.student_id}
              onChange={(e) => setFormData({...formData, student_id: e.target.value})}
              required
            />
            <Input
              label="Teléfono"
              placeholder="Teléfono"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
            <Input
              label="Email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
            <div>
              <label className="text-sm font-medium mb-1 block">Hospedaje</label>
              <Select
                value={formData.housing_id}
                onValueChange={(value) => {
                  const housing = housings.find(h => h.id === value);
                  setFormData({
                    ...formData,
                    housing_id: value,
                    housing_name: housing?.name || '',
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona hospedaje" />
                </SelectTrigger>
                <SelectContent>
                  {housings.map(h => (
                    <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Estado</label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({...formData, status: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="inactive">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}