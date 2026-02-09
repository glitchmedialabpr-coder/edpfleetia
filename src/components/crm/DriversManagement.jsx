import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2, Edit2, Search } from 'lucide-react';
import { toast } from 'sonner';
import DriverForm from './DriverForm';

export default function DriversManagement() {
  const [showForm, setShowForm] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  const { data: drivers = [], isLoading } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => base44.entities.Driver.list(),
  });

  const deleteDriverMutation = useMutation({
    mutationFn: (id) => base44.entities.Driver.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      toast.success('Conductor eliminado');
    },
    onError: () => toast.error('Error al eliminar conductor'),
  });

  const filteredDrivers = drivers.filter(d =>
    d.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.driver_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Buscar por nombre, ID o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => { setEditingDriver(null); setShowForm(!showForm); }} className="gap-2">
          <Plus className="w-4 h-4" />
          Nuevo Conductor
        </Button>
      </div>

      {showForm && (
        <DriverForm
          driver={editingDriver}
          onClose={() => { setShowForm(false); setEditingDriver(null); }}
        />
      )}

      {isLoading ? (
        <div className="text-center py-8">Cargando...</div>
      ) : (
        <div className="grid gap-4">
          {filteredDrivers.map((driver) => (
            <Card key={driver.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 dark:text-white">{driver.full_name}</h3>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-sm text-slate-600 dark:text-slate-400">
                      <p>ID: {driver.driver_id}</p>
                      <p>Licencia: {driver.license_number}</p>
                      <p>Teléfono: {driver.phone || '-'}</p>
                      <p>Estado: <span className={driver.status === 'active' ? 'text-green-600' : 'text-red-600'}>{driver.status}</span></p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => { setEditingDriver(driver); setShowForm(true); }}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      onClick={() => deleteDriverMutation.mutate(driver.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {filteredDrivers.length === 0 && (
            <div className="text-center py-8 text-slate-500">No hay conductores</div>
          )}
        </div>
      )}
    </div>
  );
}