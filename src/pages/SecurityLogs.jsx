import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Shield, AlertTriangle, CheckCircle, XCircle, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

const severityConfig = {
  low: { color: 'bg-slate-100 text-slate-700', icon: Shield },
  medium: { color: 'bg-yellow-100 text-yellow-700', icon: AlertTriangle },
  high: { color: 'bg-orange-100 text-orange-700', icon: AlertTriangle },
  critical: { color: 'bg-red-100 text-red-700', icon: XCircle }
};

const eventTypeLabels = {
  login_success: 'Login Exitoso',
  login_failed: 'Login Fallido',
  logout: 'Logout',
  session_expired: 'Sesión Expirada',
  rate_limit_exceeded: 'Rate Limit Excedido',
  unauthorized_access: 'Acceso No Autorizado',
  data_modified: 'Datos Modificados',
  password_change: 'Cambio de Contraseña',
  suspicious_activity: 'Actividad Sospechosa'
};

export default function SecurityLogs() {
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterEvent, setFilterEvent] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['security-logs'],
    queryFn: () => base44.entities.SecurityLog.list('-created_date', 200),
    staleTime: 1000 * 10,
    refetchInterval: 1000 * 30
  });

  const filteredLogs = logs.filter(log => {
    const matchesSeverity = filterSeverity === 'all' || log.severity === filterSeverity;
    const matchesEvent = filterEvent === 'all' || log.event_type === filterEvent;
    const matchesSearch = !searchTerm || 
      log.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ip_address?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSeverity && matchesEvent && matchesSearch;
  });

  const stats = {
    total: logs.length,
    success: logs.filter(l => l.success).length,
    failed: logs.filter(l => !l.success).length,
    critical: logs.filter(l => l.severity === 'critical' || l.severity === 'high').length
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse">Cargando logs...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Logs de Seguridad</h1>
          <p className="text-slate-500 mt-1">Auditoría completa de eventos del sistema</p>
        </div>
        <Shield className="w-10 h-10 text-teal-600" />
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-slate-600">Total Eventos</p>
          <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-slate-600">Exitosos</p>
          <p className="text-2xl font-bold text-green-600">{stats.success}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-slate-600">Fallidos</p>
          <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-slate-600">Alta Prioridad</p>
          <p className="text-2xl font-bold text-orange-600">{stats.critical}</p>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="p-4">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">Severidad</label>
            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="low">Baja</SelectItem>
                <SelectItem value="medium">Media</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="critical">Crítica</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">Tipo de Evento</label>
            <Select value={filterEvent} onValueChange={setFilterEvent}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {Object.entries(eventTypeLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">Buscar</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Usuario, IP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Logs */}
      <div className="space-y-2">
        {filteredLogs.map((log) => {
          const SeverityIcon = severityConfig[log.severity].icon;
          return (
            <Card key={log.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                  severityConfig[log.severity].color
                )}>
                  <SeverityIcon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-slate-800">
                      {eventTypeLabels[log.event_type] || log.event_type}
                    </h3>
                    <Badge className={cn('text-xs', severityConfig[log.severity].color)}>
                      {log.severity}
                    </Badge>
                    {log.success ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                  </div>

                  <div className="mt-2 space-y-1 text-sm text-slate-600">
                    {log.user_email && (
                      <p><span className="font-medium">Usuario:</span> {log.user_email}</p>
                    )}
                    {log.user_type && (
                      <p><span className="font-medium">Tipo:</span> {log.user_type}</p>
                    )}
                    {log.ip_address && (
                      <p><span className="font-medium">IP:</span> {log.ip_address}</p>
                    )}
                    {log.details && Object.keys(log.details).length > 0 && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-xs text-slate-500 hover:text-slate-700">
                          Ver detalles
                        </summary>
                        <pre className="mt-2 p-2 bg-slate-50 rounded text-xs overflow-auto">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 mt-2">
                    {new Date(log.created_date).toLocaleString('es-ES')}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredLogs.length === 0 && (
        <Card className="p-12 text-center">
          <Shield className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No hay logs que coincidan con los filtros</p>
        </Card>
      )}
    </div>
  );
}