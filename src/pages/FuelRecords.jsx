import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Fuel, Plus, Search, TrendingUp, Calendar, DollarSign, Loader2, FileText, Upload, X } from 'lucide-react';
import EmptyState from '../components/common/EmptyState';
import { format, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';

export default function FuelRecords() {
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    vehicle_id: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    amount: '',
    gallons: '',
    odometer: '',
    station: '',
    notes: '',
    receipt_url: ''
  });

  const { data: records = [], refetch } = useQuery({
    queryKey: ['fuel-records'],
    queryFn: () => base44.entities.FuelRecord.list('-date')
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => base44.entities.Vehicle.list()
  });

  // Filter records
  const filteredRecords = records.filter(record => {
    const matchesSearch = record.vehicle_plate?.toLowerCase().includes(search.toLowerCase()) ||
                         record.station?.toLowerCase().includes(search.toLowerCase());
    const matchesVehicle = selectedVehicle === 'all' || record.vehicle_id === selectedVehicle;
    
    if (selectedMonth) {
      const recordDate = parseISO(record.date);
      const monthStart = parseISO(selectedMonth + '-01');
      const monthEnd = endOfMonth(monthStart);
      const matchesMonth = recordDate >= monthStart && recordDate <= monthEnd;
      return matchesSearch && matchesVehicle && matchesMonth;
    }
    
    return matchesSearch && matchesVehicle;
  });

  // Calculate statistics
  const stats = {
    total: filteredRecords.reduce((sum, r) => sum + (r.amount || 0), 0),
    count: filteredRecords.length,
    avgPerFill: filteredRecords.length > 0 
      ? filteredRecords.reduce((sum, r) => sum + (r.amount || 0), 0) / filteredRecords.length 
      : 0,
    totalGallons: filteredRecords.reduce((sum, r) => sum + (r.gallons || 0), 0)
  };

  // Stats by vehicle
  const vehicleStats = vehicles.map(vehicle => {
    const vehicleRecords = filteredRecords.filter(r => r.vehicle_id === vehicle.id);
    const total = vehicleRecords.reduce((sum, r) => sum + (r.amount || 0), 0);
    return {
      vehicle,
      total,
      count: vehicleRecords.length,
      avgPerMonth: total / (vehicleRecords.length || 1)
    };
  }).filter(s => s.count > 0).sort((a, b) => b.total - a.total);

  const openCreateModal = () => {
    setFormData({
      vehicle_id: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      amount: '',
      gallons: '',
      odometer: '',
      station: '',
      notes: '',
      receipt_url: ''
    });
    setModalOpen(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, receipt_url: file_url });
    } catch (error) {
      console.error('Error uploading file:', error);
    }
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const vehicle = vehicles.find(v => v.id === formData.vehicle_id);
    await base44.entities.FuelRecord.create({
      ...formData,
      vehicle_plate: vehicle?.plate,
      amount: parseFloat(formData.amount),
      gallons: formData.gallons ? parseFloat(formData.gallons) : null,
      odometer: formData.odometer ? parseFloat(formData.odometer) : null
    });

    setModalOpen(false);
    refetch();
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">Registro de Combustible</h1>
          <p className="text-slate-500 mt-1">Control de gastos de combustible por vehículo</p>
        </div>
        <Button 
          onClick={openCreateModal}
          className="bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-600/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          Registrar Carga
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-0 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Gastado</p>
              <p className="text-2xl font-bold text-slate-800">${stats.total.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-teal-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4 border-0 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Cargas</p>
              <p className="text-2xl font-bold text-slate-800">{stats.count}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Fuel className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4 border-0 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Promedio/Carga</p>
              <p className="text-2xl font-bold text-slate-800">${stats.avgPerFill.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4 border-0 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Galones</p>
              <p className="text-2xl font-bold text-slate-800">{stats.totalGallons.toFixed(1)}</p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <Fuel className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 border-0 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Buscar por placa o estación..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
            <SelectTrigger>
              <SelectValue placeholder="Todos los vehículos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los vehículos</SelectItem>
              {vehicles.map(v => (
                <SelectItem key={v.id} value={v.id}>
                  {v.plate} - {v.brand} {v.model}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          />
        </div>
      </Card>

      {/* Vehicle Stats Table */}
      {vehicleStats.length > 0 && (
        <Card className="p-6 border-0 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-teal-600" />
            Gastos por Vehículo
          </h3>
          <div className="space-y-3">
            {vehicleStats.map(stat => (
              <div key={stat.vehicle.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                    <Fuel className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{stat.vehicle.plate}</p>
                    <p className="text-sm text-slate-500">{stat.vehicle.brand} {stat.vehicle.model}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-slate-800">${stat.total.toFixed(2)}</p>
                  <p className="text-xs text-slate-500">{stat.count} cargas</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Records Table */}
      <Card className="border-0 shadow-sm overflow-hidden">
        {filteredRecords.length === 0 ? (
          <EmptyState
            icon={Fuel}
            title={search || selectedVehicle !== 'all' ? "No se encontraron registros" : "No hay registros de combustible"}
            description={search || selectedVehicle !== 'all' ? "Intenta con otros filtros" : "Registra la primera carga de combustible"}
            action={!search && selectedVehicle === 'all' ? openCreateModal : undefined}
            actionLabel="Registrar Carga"
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Fecha</TableHead>
                  <TableHead>Vehículo</TableHead>
                  <TableHead>Estación</TableHead>
                  <TableHead>Galones</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Kilometraje</TableHead>
                  <TableHead>Recibo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map(record => (
                  <TableRow key={record.id} className="hover:bg-slate-50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-700">
                          {format(parseISO(record.date), 'd MMM yyyy', { locale: es })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-800">{record.vehicle_plate}</p>
                        {record.notes && (
                          <p className="text-xs text-slate-500">{record.notes}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-slate-700">{record.station || '-'}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {record.gallons ? `${record.gallons.toFixed(2)} gal` : '-'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-teal-700">${record.amount.toFixed(2)}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-slate-700">{record.odometer ? `${record.odometer.toLocaleString()} km` : '-'}</span>
                    </TableCell>
                    <TableCell>
                      {record.receipt_url ? (
                        <a
                          href={record.receipt_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-teal-600 hover:text-teal-700"
                        >
                          <FileText className="w-4 h-4" />
                        </a>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Create Record Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Registrar Carga de Combustible</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Vehículo *</Label>
              <Select 
                value={formData.vehicle_id} 
                onValueChange={(val) => setFormData({ ...formData, vehicle_id: val })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar vehículo" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map(v => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.plate} - {v.brand} {v.model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fecha *</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Monto ($) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Galones</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.gallons}
                  onChange={(e) => setFormData({ ...formData, gallons: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label>Kilometraje</Label>
                <Input
                  type="number"
                  value={formData.odometer}
                  onChange={(e) => setFormData({ ...formData, odometer: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Estación de Gasolina</Label>
              <Input
                value={formData.station}
                onChange={(e) => setFormData({ ...formData, station: e.target.value })}
                placeholder="Ej: Shell, Exxon, etc."
              />
            </div>

            <div className="space-y-2">
              <Label>Recibo (opcional)</Label>
              {formData.receipt_url ? (
                <div className="flex items-center gap-2 p-3 border rounded-lg bg-slate-50">
                  <FileText className="w-5 h-5 text-teal-600" />
                  <span className="flex-1 text-sm truncate">Recibo cargado</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setFormData({ ...formData, receipt_url: '' })}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-2">
                    {uploading ? (
                      <span className="text-sm text-slate-500">Subiendo...</span>
                    ) : (
                      <>
                        <Upload className="w-5 h-5 text-slate-400" />
                        <span className="text-sm text-slate-500">Click para subir</span>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    accept="image/*,application/pdf"
                  />
                </label>
              )}
            </div>

            <div className="space-y-2">
              <Label>Notas</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Notas adicionales..."
                rows={2}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setModalOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-teal-600 hover:bg-teal-700"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Registrar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}