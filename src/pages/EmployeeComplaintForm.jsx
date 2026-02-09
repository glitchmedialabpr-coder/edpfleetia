import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Upload, X, FileText, LogOut } from 'lucide-react';
import { toast } from 'sonner';

export default function EmployeeComplaintForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    employee_name: '',
    employee_email: '',
    location: '',
    category: '',
    category_other: '',
    complaint_title: '',
    complaint_description: ''
  });
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = files.map(file => 
        base44.integrations.Core.UploadFile({ file })
      );
      const results = await Promise.all(uploadPromises);
      const newUrls = results.map(r => r.file_url);
      setDocuments([...documents, ...newUrls]);
      toast.success('Documentos subidos exitosamente');
    } catch (error) {
      toast.error('Error al subir documentos');
    }
    setUploading(false);
  };

  const removeDocument = (index) => {
    setDocuments(documents.filter((_, i) => i !== index));
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate(createPageUrl('EmployeeLogin'));
    toast.success('Sesión cerrada');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await base44.functions.invoke('submitEmployeeComplaint', {
        ...formData,
        document_urls: documents,
        status: 'pendiente'
      });

      toast.success('Solicitud enviada exitosamente');
      navigate(createPageUrl('EmployeeComplaintHistory'));
    } catch (error) {
      toast.error('Error al enviar la solicitud');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 lg:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Registrar Solicitud</h1>
            <p className="text-slate-600">Complete el formulario para registrar su solicitud</p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleLogout}
            className="text-slate-600 hover:text-red-600 hover:bg-red-50"
            title="Cerrar sesión"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-purple-600" />
              Información de la Solicitud
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nombre Completo *
                  </label>
                  <Input
                    value={formData.employee_name}
                    onChange={(e) => setFormData({...formData, employee_name: e.target.value})}
                    placeholder="Juan Pérez"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Correo Electrónico *
                  </label>
                  <Input
                    type="email"
                    value={formData.employee_email}
                    onChange={(e) => setFormData({...formData, employee_email: e.target.value})}
                    placeholder="juan.perez@ejemplo.com"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Ubicación del Incidente
                  </label>
                  <Select
                    value={formData.location}
                    onValueChange={(value) => setFormData({...formData, location: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione una ubicación" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="edificio_principal">Edificio Principal</SelectItem>
                      <SelectItem value="anexo">Anexo</SelectItem>
                      <SelectItem value="anexo_2">Anexo 2</SelectItem>
                      <SelectItem value="san_juan_school_of_design">San Juan School of Design</SelectItem>
                      <SelectItem value="piedras_blancas">Piedras Blancas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Categoría del Problema Estructural
                  </label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({...formData, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="electrico">Eléctrico</SelectItem>
                      <SelectItem value="estructural">Estructural</SelectItem>
                      <SelectItem value="plomeria">Plomería</SelectItem>
                      <SelectItem value="otros">Otros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.category === 'otros' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Especifique el Tipo de Problema
                  </label>
                  <Input
                    value={formData.category_other}
                    onChange={(e) => setFormData({...formData, category_other: e.target.value})}
                    placeholder="Describa el tipo de problema"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Título de la Solicitud *
                </label>
                <Input
                  value={formData.complaint_title}
                  onChange={(e) => setFormData({...formData, complaint_title: e.target.value})}
                  placeholder="Breve descripción del problema"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Descripción Detallada *
                </label>
                <Textarea
                  value={formData.complaint_description}
                  onChange={(e) => setFormData({...formData, complaint_description: e.target.value})}
                  placeholder="Describa su solicitud con el mayor detalle posible..."
                  rows={6}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Documentos Adjuntos (Opcional)
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-600">
                      {uploading ? 'Subiendo...' : 'Click para subir documentos'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">PDF, DOC, Imágenes</p>
                  </label>
                </div>

                {documents.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {documents.map((doc, index) => (
                      <div key={index} className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg">
                        <FileText className="w-4 h-4 text-slate-500" />
                        <span className="text-sm text-slate-700 flex-1 truncate">
                          Documento {index + 1}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeDocument(index)}
                          className="h-8 w-8"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(createPageUrl('EmployeeComplaintHistory'))}
                  className="flex-1"
                >
                  Ver Mis Solicitudes
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  {submitting ? 'Enviando...' : 'Enviar Solicitud'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}