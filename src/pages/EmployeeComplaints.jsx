import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, FileText, Download, CheckCircle, Clock, PlayCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

const statusColors = {
  pendiente: 'bg-yellow-100 text-yellow-800',
  aceptada: 'bg-blue-100 text-blue-800',
  en_proceso: 'bg-purple-100 text-purple-800',
  atendida: 'bg-green-100 text-green-800'
};

const statusLabels = {
  pendiente: 'Pendiente',
  aceptada: 'Aceptada',
  en_proceso: 'En Proceso',
  atendida: 'Atendida'
};

export default function EmployeeComplaints() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);

  const { data: complaints = [], isLoading } = useQuery({
    queryKey: ['admin-employee-complaints'],
    queryFn: () => base44.entities.EmployeeComplaint.list('-created_date')
  });

  const handleStatusChange = async (complaintId, newStatus) => {
    setUpdatingId(complaintId);
    try {
      await base44.entities.EmployeeComplaint.update(complaintId, { status: newStatus });
      queryClient.invalidateQueries(['admin-employee-complaints']);
      toast.success(`Estado actualizado a: ${statusLabels[newStatus]}`);
    } catch (error) {
      toast.error('Error al actualizar el estado');
    }
    setUpdatingId(null);
  };

  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = 
      complaint.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.employee_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.complaint_title?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || complaint.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: complaints.length,
    pendiente: complaints.filter(c => c.status === 'pendiente').length,
    en_proceso: complaints.filter(c => c.status === 'en_proceso').length,
    atendida: complaints.filter(c => c.status === 'atendida').length
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse text-slate-600">Cargando quejas...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Quejas de Empleados</h1>
        <p className="text-slate-600">Administración y seguimiento de quejas</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-slate-800">{stats.total}</div>
            <div className="text-sm text-slate-600">Total de Quejas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">{stats.pendiente}</div>
            <div className="text-sm text-slate-600">Pendientes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-600">{stats.en_proceso}</div>
            <div className="text-sm text-slate-600">En Proceso</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{stats.atendida}</div>
            <div className="text-sm text-slate-600">Atendidas</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Buscar por nombre, email o título..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="aceptada">Aceptada</SelectItem>
                <SelectItem value="en_proceso">En Proceso</SelectItem>
                <SelectItem value="atendida">Atendida</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Complaints List */}
      {filteredComplaints.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">No se encontraron quejas</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredComplaints.map((complaint) => (
            <Card key={complaint.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{complaint.complaint_title}</CardTitle>
                    <div className="flex flex-wrap gap-2 text-sm text-slate-600">
                      <span className="font-medium">{complaint.employee_name}</span>
                      <span>•</span>
                      <span>{complaint.employee_email}</span>
                      <span>•</span>
                      <span>
                        {format(new Date(complaint.created_date), 'dd MMM yyyy HH:mm', { locale: es })}
                      </span>
                    </div>
                  </div>
                  <Badge className={statusColors[complaint.status]}>
                    {statusLabels[complaint.status]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 mb-4">{complaint.complaint_description}</p>

                {complaint.document_urls?.length > 0 && (
                  <div className="border-t pt-4 mb-4">
                    <p className="text-sm font-medium text-slate-700 mb-2">
                      Documentos Adjuntos ({complaint.document_urls.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {complaint.document_urls.map((url, index) => (
                        <a
                          key={index}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                          <FileText className="w-4 h-4 text-slate-600" />
                          <span className="text-sm text-slate-700">Documento {index + 1}</span>
                          <Download className="w-3 h-3 text-slate-500" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-slate-700 mb-3">Cambiar Estado:</p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant={complaint.status === 'aceptada' ? 'default' : 'outline'}
                      onClick={() => handleStatusChange(complaint.id, 'aceptada')}
                      disabled={updatingId === complaint.id || complaint.status === 'aceptada'}
                      className={complaint.status === 'aceptada' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Aceptar
                    </Button>
                    <Button
                      size="sm"
                      variant={complaint.status === 'en_proceso' ? 'default' : 'outline'}
                      onClick={() => handleStatusChange(complaint.id, 'en_proceso')}
                      disabled={updatingId === complaint.id || complaint.status === 'en_proceso'}
                      className={complaint.status === 'en_proceso' ? 'bg-purple-600 hover:bg-purple-700' : ''}
                    >
                      <PlayCircle className="w-4 h-4 mr-2" />
                      En Proceso
                    </Button>
                    <Button
                      size="sm"
                      variant={complaint.status === 'atendida' ? 'default' : 'outline'}
                      onClick={() => handleStatusChange(complaint.id, 'atendida')}
                      disabled={updatingId === complaint.id || complaint.status === 'atendida'}
                      className={complaint.status === 'atendida' ? 'bg-green-600 hover:bg-green-700' : ''}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Atendida
                    </Button>
                  </div>
                  {updatingId === complaint.id && (
                    <p className="text-sm text-slate-500 mt-2">Actualizando...</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}