import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Plus, 
  Search, 
  Building2,
  MapPin,
  Phone,
  Pencil,
  Trash2,
  Loader2
} from 'lucide-react';
import EmptyState from '../components/common/EmptyState';

export default function Housing() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingHousing, setEditingHousing] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    zone: '',
    contact_phone: '',
    notes: ''
  });

  const { data: housings = [], refetch } = useQuery({
    queryKey: ['housings'],
    queryFn: () => base44.entities.Housing.list('-created_date')
  });

  const filteredHousings = housings.filter(h => 
    h.name?.toLowerCase().includes(search.toLowerCase()) ||
    h.address?.toLowerCase().includes(search.toLowerCase()) ||
    h.zone?.toLowerCase().includes(search.toLowerCase())
  );

  const openCreateModal = () => {
    setEditingHousing(null);
    setFormData({
      name: '',
      address: '',
      zone: '',
      contact_phone: '',
      notes: ''
    });
    setModalOpen(true);
  };

  const openEditModal = (housing) => {
    setEditingHousing(housing);
    setFormData({
      name: housing.name || '',
      address: housing.address || '',
      zone: housing.zone || '',
      contact_phone: housing.contact_phone || '',
      notes: housing.notes || ''
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (editingHousing) {
      await base44.entities.Housing.update(editingHousing.id, formData);
    } else {
      await base44.entities.Housing.create(formData);
    }

    setModalOpen(false);
    refetch();
    setLoading(false);
  };

  const handleDelete = async (housing) => {
    if (confirm(`¿Eliminar ${housing.name}?`)) {
      await base44.entities.Housing.delete(housing.id);
      refetch();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">Hospedajes</h1>
          <p className="text-slate-500 mt-1">Gestiona los lugares de hospedaje de estudiantes</p>
        </div>
        <Button 
          onClick={openCreateModal}
          className="bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-600/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          Agregar Hospedaje
        </Button>
      </div>

      {/* Search */}
      <Card className="p-4 border-0 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Buscar por nombre, dirección o zona..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Cards Grid */}
      {filteredHousings.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <EmptyState
            icon={Building2}
            title={search ? "No se encontraron hospedajes" : "No hay hospedajes registrados"}
            description={search ? "Intenta con otra búsqueda" : "Agrega el primer hospedaje para comenzar"}
            action={!search ? openCreateModal : undefined}
            actionLabel="Agregar Hospedaje"
          />
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredHousings.map(housing => (
            <Card key={housing.id} className="p-5 border-0 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-teal-600" />
                </div>
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => openEditModal(housing)}
                  >
                    <Pencil className="w-4 h-4 text-slate-400" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDelete(housing)}
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </Button>
                </div>
              </div>

              <h3 className="font-semibold text-slate-800 text-lg mb-2">{housing.name}</h3>
              
              <div className="space-y-2">
                {housing.address && (
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                    <span className="text-slate-600">{housing.address}</span>
                  </div>
                )}
                {housing.zone && (
                  <div className="inline-block px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">
                    {housing.zone}
                  </div>
                )}
                {housing.contact_phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600">{housing.contact_phone}</span>
                  </div>
                )}
              </div>

              {housing.notes && (
                <p className="text-sm text-slate-500 mt-3 pt-3 border-t">{housing.notes}</p>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingHousing ? 'Editar Hospedaje' : 'Agregar Hospedaje'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre del Hospedaje *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Residencia Universitaria Norte"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Dirección *</Label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Dirección completa"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Zona</Label>
                <Input
                  value={formData.zone}
                  onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                  placeholder="Ej: Zona Norte"
                />
              </div>

              <div className="space-y-2">
                <Label>Teléfono de Contacto</Label>
                <Input
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  placeholder="787-xxx-xxxx"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notas</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Notas adicionales..."
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" disabled={loading} className="flex-1 bg-teal-600 hover:bg-teal-700">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingHousing ? 'Guardar' : 'Agregar')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}