import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  CheckCircle, 
  XCircle, 
  Clock,
  User,
  MapPin,
  Car,
  Search,
  Filter
} from 'lucide-react';
import EmptyState from '../components/common/EmptyState';

const responseConfig = {
  accepted: { label: 'Aceptado', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  rejected: { label: 'Rechazado', color: 'bg-red-100 text-red-700', icon: XCircle },
  timeout: { label: 'Sin Respuesta', color: 'bg-gray-100 text-gray-700', icon: Clock }
};

export default function ResponseHistory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterResponse, setFilterResponse] = useState('all');
  const [filterDriver, setFilterDriver] = useState('all');

  const { data: responses = [] } = useQuery({
    queryKey: ['trip-responses'],
    queryFn: () => base44.entities.TripRequestResponse.list('-created_date', 200)
  });

  const { data: drivers = [] } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => base44.entities.Driver.list()
  });

  const filteredResponses = responses.filter(response => {
    const matchesSearch = 
      response.passenger_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      response.driver_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      response.destination?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesResponse = filterResponse === 'all' || response.response === filterResponse;
    const matchesDriver = filterDriver === 'all' || response.driver_id === filterDriver;

    return matchesSearch && matchesResponse && matchesDriver;
  });

  // Statistics
  const stats = {
    total: responses.length,
    accepted: responses.filter(r => r.response === 'accepted').length,
    rejected: responses.filter(r => r.response === 'rejected').length,
    timeout: responses.filter(r => r.response === 'timeout').length
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">Historial de Respuestas</h1>
        <p className="text-slate-500 mt-1">Registro completo de aceptaciones y rechazos</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-2xl font-bold text-slate-800">{stats.total}</div>
          <div className="text-sm text-slate-500">Total Respuestas</div>
        </Card>
        <Card className="p-4 border-l-4 border-green-500">
          <div className="text-2xl font-bold text-green-600">{stats.accepted}</div>
          <div className="text-sm text-slate-500">Aceptados</div>
        </Card>
        <Card className="p-4 border-l-4 border-red-500">
          <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          <div className="text-sm text-slate-500">Rechazados</div>
        </Card>
        <Card className="p-4 border-l-4 border-gray-500">
          <div className="text-2xl font-bold text-gray-600">{stats.timeout}</div>
          <div className="text-sm text-slate-500">Sin Respuesta</div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-5 h-5 text-slate-400" />
          <h3 className="font-medium text-slate-700">Filtros</h3>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Buscar conductor, pasajero o destino..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterResponse} onValueChange={setFilterResponse}>
            <SelectTrigger>
              <SelectValue placeholder="Tipo de respuesta" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las respuestas</SelectItem>
              <SelectItem value="accepted">Aceptados</SelectItem>
              <SelectItem value="rejected">Rechazados</SelectItem>
              <SelectItem value="timeout">Sin respuesta</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterDriver} onValueChange={setFilterDriver}>
            <SelectTrigger>
              <SelectValue placeholder="Conductor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los conductores</SelectItem>
              {drivers.map(driver => (
                <SelectItem key={driver.id} value={driver.id}>
                  {driver.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Responses List */}
      {filteredResponses.length === 0 ? (
        <Card className="p-8">
          <EmptyState
            icon={Clock}
            title="No hay respuestas"
            description="No se encontraron registros con los filtros seleccionados"
          />
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredResponses.map(response => {
            const config = responseConfig[response.response];
            const Icon = config.icon;
            
            return (
              <Card key={response.id} className="p-5 hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${config.color.replace('text-', 'bg-').replace('100', '200')}`}>
                      <Icon className={`w-5 h-5 ${config.color.split(' ')[1]}`} />
                    </div>
                    <Badge className={config.color}>
                      {config.label}
                    </Badge>
                  </div>

                  <div className="flex-1 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-400" />
                      <div>
                        <div className="text-xs text-slate-500">Conductor</div>
                        <div className="font-medium text-slate-800 text-sm">{response.driver_name}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-400" />
                      <div>
                        <div className="text-xs text-slate-500">Pasajero</div>
                        <div className="font-medium text-slate-800 text-sm">{response.passenger_name}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <div>
                        <div className="text-xs text-slate-500">Destino</div>
                        <div className="font-medium text-slate-800 text-sm">{response.destination}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <div>
                        <div className="text-xs text-slate-500">Hora</div>
                        <div className="font-medium text-slate-800 text-sm">
                          {response.response_time || new Date(response.created_date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {response.vehicle_info && (
                    <div className="flex items-center gap-2 lg:ml-auto">
                      <Car className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-600">{response.vehicle_info}</span>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}