import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { AlertCircle, Plus, FileText, Download, LogOut } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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

export default function EmployeeComplaintHistory() {
  const navigate = useNavigate();
  const [emailFilter, setEmailFilter] = useState('');

  const { data: complaints = [], isLoading } = useQuery({
    queryKey: ['employee-complaints-history'],
    queryFn: () => base44.entities.EmployeeComplaint.list('-created_date')
  });

  const filteredComplaints = emailFilter
    ? complaints.filter(c => c.employee_email?.toLowerCase().includes(emailFilter.toLowerCase()))
    : complaints;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse text-slate-600">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Mis Solicitudes</h1>
            <p className="text-slate-600">Historial de solicitudes presentadas</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => navigate(createPageUrl('EmployeeComplaintForm'))}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nueva Solicitud
            </Button>
            <Button
              onClick={() => navigate(createPageUrl('Home'))}
              variant="outline"
              className="text-slate-600"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <Input
                placeholder="Filtrar por correo electrónico..."
                value={emailFilter}
                onChange={(e) => setEmailFilter(e.target.value)}
                className="max-w-md"
              />
              {emailFilter && (
                <Button variant="outline" onClick={() => setEmailFilter('')}>
                  Limpiar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {filteredComplaints.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 mb-4">
                {emailFilter ? 'No se encontraron solicitudes con ese correo' : 'No hay solicitudes registradas'}
              </p>
              <Button
                onClick={() => navigate(createPageUrl('EmployeeComplaintForm'))}
                variant="outline"
              >
                Registrar Primera Solicitud
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredComplaints.map((complaint) => (
              <Card key={complaint.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
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
                    <div className="border-t pt-4">
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
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}