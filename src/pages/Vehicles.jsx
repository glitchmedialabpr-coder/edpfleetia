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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Plus, 
  Search, 
  Car,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import VehicleCard from '../components/vehicles/VehicleCard';
import MaintenanceForm from '../components/maintenance/MaintenanceForm';
import EmptyState from '../components/common/EmptyState';
import { Badge } from '@/components/ui/badge';
import { differenceInDays, parseISO } from 'date-fns';

export default function Vehicles() {
  const [modalOpen, setModalOpen] = useState(false);
  const [maintenanceModalOpen, setMaintenanceModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    plate: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    color: '',
    current_mileage: 0,
    capacity: 0,
    status: 'available',
    next_service_date: '',
    next_service_mileage: 0,
    insurance_expiry: '',
    notes: '',
    photo_url: ''
  });

  const { data: vehicles = [], refetch } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => base44.entities.Vehicle.list('-created_date')
  });

  const filteredVehicles = vehicles.filter(v => 
    v.plate?.toLowerCase().includes(search.toLowerCase()) ||
    v.brand?.toLowerCase().includes(search.toLowerCase()) ||
    v.model?.toLowerCase().includes(search.toLowerCase())
  );

  // Count alerts
  const vehiclesNeedingAttention = vehicles.filter(v => {
    if (v.next_service_date) {
      const daysUntil = differenceInDays(parseISO(v.next_service_date), new Date());
      if (daysUntil <= 7) return true;
    }
    if (v.next_service_mileage && v.current_mileage) {
      if (v.next_service_mileage - v.current_mileage <= 500) return true;
    }
    if (v.insurance_expiry) {
      const daysUntil = differenceInDays(parseISO(v.insurance_expiry), new Date());
      if (daysUntil <= 30) return true;
    }
    return false;
  }).length;

  const openCreateModal = () => {
    setEditingVehicle(null);
    setFormData({
      plate: '',
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      color: '',
      current_mileage: 0,
      capacity: 0,
      status: 'available',
      next_service_date: '',
      next_service_mileage: 0,
      insurance_expiry: '',
      notes: '',
      photo_url: ''
    });
    setModalOpen(true);
  };

  const openEditModal = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      plate: vehicle.plate || '',
      brand: vehicle.brand || '',
      model: vehicle.model || '',
      year: vehicle.year || new Date().getFullYear(),
      color: vehicle.color || '',
      current_mileage: vehicle.current_mileage || 0,
      capacity: vehicle.capacity || 0,
      status: vehicle.status || 'available',
      next_service_date: vehicle.next_service_date || '',
      next_service_mileage: vehicle.next_service_mileage || 0,
      insurance_expiry: vehicle.insurance_expiry || '',
      notes: vehicle.notes || '',
      photo_url: vehicle.photo_url || ''
    });
    setModalOpen(true);
  };

  const openMaintenanceModal = (vehicle) => {
    setSelectedVehicle(vehicle);
    setMaintenanceModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (editingVehicle) {
      await base44.entities.Vehicle.update(editingVehicle.id, formData);
    } else {
      await base44.entities.Vehicle.create(formData);
    }

    setModalOpen(false);
    refetch();
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">Vehículos</h1>
          <p className="text-slate-500 mt-1">Gestiona la flota de vehículos</p>
        </div>
        <Button 
          onClick={openCreateModal}
          className="bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-600/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          Agregar Vehículo
        </Button>
      </div>

      {/* Alert Banner */}
      {vehiclesNeedingAttention > 0 && (
        <Card className="p-4 bg-amber-50 border-amber-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <div>
              <p className="font-semibold text-amber-800">
                {vehiclesNeedingAttention} vehículo{vehiclesNeedingAttention > 1 ? 's' : ''} necesita{vehiclesNeedingAttention > 1 ? 'n' : ''} atención
              </p>
              <p className="text-sm text-amber-600">Servicio próximo o vencido</p>
            </div>
          </div>
        </Card>
      )}

      {/* Search & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card className="lg:col-span-3 p-4 border-0 shadow-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Buscar por placa, marca o modelo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </Card>
        
        <Card className="p-4 border-0 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Vehículos</p>
              <p className="text-2xl font-bold text-slate-800">{vehicles.length}</p>
            </div>
            <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
              <Car className="w-6 h-6 text-teal-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Status Filters */}
      <div className="flex gap-2 flex-wrap">
        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
          Disponibles: {vehicles.filter(v => v.status === 'available').length}
        </Badge>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          En Uso: {vehicles.filter(v => v.status === 'in_use').length}
        </Badge>
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
          Mantenimiento: {vehicles.filter(v => v.status === 'maintenance').length}
        </Badge>
      </div>

      {/* Vehicles Grid */}
      {filteredVehicles.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <EmptyState
            icon={Car}
            title={search ? "No se encontraron vehículos" : "No hay vehículos registrados"}
            description={search ? "Intenta con otra búsqueda" : "Agrega el primer vehículo para comenzar"}
            action={!search ? openCreateModal : undefined}
            actionLabel="Agregar Vehículo"
          />
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredVehicles.map(vehicle => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              onEdit={openEditModal}
              onMaintenance={openMaintenanceModal}
            />
          ))}
        </div>
      )}

      {/* Vehicle Form Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingVehicle ? 'Editar Vehículo' : 'Agregar Vehículo'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Placa *</Label>
                <Input
                  value={formData.plate}
                  onChange={(e) => setFormData({ ...formData, plate: e.target.value })}
                  placeholder="ABC-123"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Marca *</Label>
                <Input
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  placeholder="Toyota, Ford, etc."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Modelo *</Label>
                <Input
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  placeholder="Corolla, Transit, etc."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Año</Label>
                <Input
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label>Color</Label>
                <Input
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="Blanco, Gris, etc."
                />
              </div>

              <div className="space-y-2">
                <Label>Capacidad (pasajeros)</Label>
                <Input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label>Kilometraje Actual</Label>
                <Input
                  type="number"
                  value={formData.current_mileage}
                  onChange={(e) => setFormData({ ...formData, current_mileage: parseInt(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label>Estado</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(val) => setFormData({ ...formData, status: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Disponible</SelectItem>
                    <SelectItem value="in_use">En Uso</SelectItem>
                    <SelectItem value="maintenance">Mantenimiento</SelectItem>
                    <SelectItem value="inactive">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Vencimiento del Seguro</Label>
                <Input
                  type="date"
                  value={formData.insurance_expiry}
                  onChange={(e) => setFormData({ ...formData, insurance_expiry: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notas</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Notas adicionales sobre el vehículo..."
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" disabled={loading} className="flex-1 bg-teal-600 hover:bg-teal-700">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingVehicle ? 'Guardar' : 'Agregar')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Maintenance Modal */}
      <MaintenanceForm
        open={maintenanceModalOpen}
        onClose={() => {
          setMaintenanceModalOpen(false);
          setSelectedVehicle(null);
        }}
        vehicle={selectedVehicle}
        onCreated={() => {
          refetch();
          setMaintenanceModalOpen(false);
          setSelectedVehicle(null);
        }}
      />
    </div>
  );
}