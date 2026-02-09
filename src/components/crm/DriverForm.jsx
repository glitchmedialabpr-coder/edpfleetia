import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { X } from 'lucide-react';

export default function DriverForm({ driver, onClose }) {
  const [formData, setFormData] = useState(driver || {
    driver_id: '',
    full_name: '',
    email: '',
    phone: '',
    license_number: '',
    license_category: 'B',
    status: 'active',
  });

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data) =>
      driver ? base44.entities.Driver.update(driver.id, data) : base44.entities.Driver.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      toast.success(driver ? 'Conductor actualizado' : 'Conductor creado');
      onClose();
    },
    onError: () => toast.error('Error al guardar conductor'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <Card className="border-teal-200 dark:border-teal-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{driver ? 'Editar Conductor' : 'Nuevo Conductor'}</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="ID Conductor"
              placeholder="ID único"
              value={formData.driver_id}
              onChange={(e) => setFormData({...formData, driver_id: e.target.value})}
              required
            />
            <Input
              label="Nombre Completo"
              placeholder="Nombre completo"
              value={formData.full_name}
              onChange={(e) => setFormData({...formData, full_name: e.target.value})}
              required
            />
            <Input
              label="Email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
            <Input
              label="Teléfono"
              placeholder="Teléfono"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
            <Input
              label="Número de Licencia"
              placeholder="Número de licencia"
              value={formData.license_number}
              onChange={(e) => setFormData({...formData, license_number: e.target.value})}
              required
            />
            <div>
              <label className="text-sm font-medium mb-1 block">Categoría de Licencia</label>
              <Select
                value={formData.license_category}
                onValueChange={(value) => setFormData({...formData, license_category: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">A</SelectItem>
                  <SelectItem value="B">B</SelectItem>
                  <SelectItem value="C">C</SelectItem>
                  <SelectItem value="D">D</SelectItem>
                  <SelectItem value="E">E</SelectItem>
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
                  <SelectItem value="on_leave">Licencia</SelectItem>
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