import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  Wrench,
  Calendar,
  DollarSign,
  FileText,
  Car,
  Filter,
  TrendingUp
} from 'lucide-react';
import EmptyState from '../components/common/EmptyState';
import StatsCard from '../components/common/StatsCard';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const serviceTypeLabels = {
  oil_change: 'Cambio de Aceite',
  tire_rotation: 'Rotación de Gomas',
  brake_service: 'Servicio de Frenos',
  alignment: 'Alineación',
  inspection: 'Inspección',
  battery: 'Batería',
  transmission: 'Transmisión',
  engine: 'Motor',
  ac_service: 'Servicio de A/C',
  other: 'Otro'
};

export default function Maintenance() {
  const [search, setSearch] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState('all');
  const [serviceTypeFilter, setServiceTypeFilter] = useState('all');

  const { data: records = [] } = useQuery({
    queryKey: ['maintenance-records'],
    queryFn: () => base44.entities.MaintenanceRecord.list('-service_date', 200),
    staleTime: 1000 * 60 * 5
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => base44.entities.Vehicle.list(),
    staleTime: 1000 * 60 * 5
  });

  const filteredRecords = records.filter(record => {
    const matchesSearch = 
      record.vehicle_plate?.toLowerCase().includes(search.toLowerCase()) ||
      record.service_provider?.toLowerCase().includes(search.toLowerCase()) ||
      record.description?.toLowerCase().includes(search.toLowerCase());
    
    const matchesVehicle = vehicleFilter === 'all' || record.vehicle_id === vehicleFilter;
    const matchesType = serviceTypeFilter === 'all' || record.service_type === serviceTypeFilter;

    return matchesSearch && matchesVehicle && matchesType;
  });

  // Calculate stats
  const totalCost = records.reduce((sum, r) => sum + (r.cost || 0), 0);
  const thisMonth = records.filter(r => {
    const recordDate = new Date(r.service_date);
    const now = new Date();
    return recordDate.getMonth() === now.getMonth() && recordDate.getFullYear() === now.getFullYear();
  });
  const monthCost = thisMonth.reduce((sum, r) => sum + (r.cost || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">Historial de Mantenimiento</h1>
        <p className="text-slate-500 mt-1">Consulta todos los servicios realizados</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Servicios"
          value={records.length}
          icon={Wrench}
          color="teal"
        />
        <StatsCard
          title="Este Mes"
          value={thisMonth.length}
          icon={Calendar}
          color="blue"
        />
        <StatsCard
          title="Costo Total"
          value={`$${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          icon={DollarSign}
          color="emerald"
        />
        <StatsCard
          title="Costo Mensual"
          value={`$${monthCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          icon={TrendingUp}
          color="purple"
        />
      </div>

      {/* Filters */}
      <Card className="p-4 border-0 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Buscar por placa, proveedor o descripción..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-3">
            <Select value={vehicleFilter} onValueChange={setVehicleFilter}>
              <SelectTrigger className="w-48">
                <Car className="w-4 h-4 mr-2 text-slate-400" />
                <SelectValue placeholder="Vehículo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los vehículos</SelectItem>
                {vehicles.map(vehicle => (
                  <SelectItem key={vehicle.id} value={vehicle.id}>
                    {vehicle.plate} - {vehicle.brand} {vehicle.model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={serviceTypeFilter} onValueChange={setServiceTypeFilter}>
              <SelectTrigger className="w-48">
                <Filter className="w-4 h-4 mr-2 text-slate-400" />
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                {Object.entries(serviceTypeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="border-0 shadow-sm overflow-hidden">
        {filteredRecords.length === 0 ? (
          <EmptyState
            icon={Wrench}
            title="No hay registros de mantenimiento"
            description="Los servicios realizados aparecerán aquí"
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Fecha</TableHead>
                  <TableHead>Vehículo</TableHead>
                  <TableHead>Tipo de Servicio</TableHead>
                  <TableHead>Proveedor</TableHead>
                  <TableHead>Kilometraje</TableHead>
                  <TableHead>Costo</TableHead>
                  <TableHead>Factura</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map(record => (
                  <TableRow key={record.id} className="hover:bg-slate-50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="font-medium text-slate-800">
                          {record.service_date ? format(new Date(record.service_date), 'd MMM yyyy', { locale: es }) : '-'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                          <Car className="w-4 h-4 text-teal-600" />
                        </div>
                        <span className="font-medium text-slate-700">{record.vehicle_plate}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-blue-100 text-blue-700">
                        {serviceTypeLabels[record.service_type] || record.service_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {record.service_provider || '-'}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {record.mileage_at_service?.toLocaleString() || '-'} km
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-emerald-600">
                        ${record.cost?.toFixed(2) || '0.00'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {record.invoice_url ? (
                        <a 
                          href={record.invoice_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-teal-600 hover:text-teal-700"
                        >
                          <FileText className="w-5 h-5" />
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
    </div>
  );
}