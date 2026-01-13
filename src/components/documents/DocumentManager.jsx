import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FileText, Upload, X, AlertTriangle, Clock, Calendar } from 'lucide-react';
import { format, differenceInDays, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const documentTypeLabels = {
  // Driver
  license: 'Licencia',
  certificate: 'Certificado',
  medical: 'Certificado Médico',
  insurance: 'Seguro',
  identification: 'Identificación',
  contract: 'Contrato',
  training: 'Capacitación',
  // Vehicle
  registration: 'Registro',
  inspection: 'Inspección',
  permit: 'Permiso',
  warranty: 'Garantía',
  manual: 'Manual',
  other: 'Otro'
};

export default function DocumentManager({ 
  entityType, // 'driver' or 'vehicle'
  entity, 
  onUpdate,
  documentTypes
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'other',
    url: '',
    expiry_date: '',
    notes: '',
    uploaded_date: format(new Date(), 'yyyy-MM-dd')
  });

  const documents = entity?.documents || [];

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ 
        ...formData, 
        url: file_url,
        name: formData.name || file.name 
      });
    } catch (error) {
      console.error('Error uploading file:', error);
    }
    setUploading(false);
  };

  const handleAddDocument = async () => {
    const updatedDocuments = [...documents, formData];
    
    if (entityType === 'driver') {
      await base44.entities.Driver.update(entity.id, { documents: updatedDocuments });
    } else {
      await base44.entities.Vehicle.update(entity.id, { documents: updatedDocuments });
    }

    onUpdate();
    setModalOpen(false);
    setFormData({
      name: '',
      type: 'other',
      url: '',
      expiry_date: '',
      notes: '',
      uploaded_date: format(new Date(), 'yyyy-MM-dd')
    });
  };

  const handleRemoveDocument = async (index) => {
    const updatedDocuments = documents.filter((_, i) => i !== index);
    
    if (entityType === 'driver') {
      await base44.entities.Driver.update(entity.id, { documents: updatedDocuments });
    } else {
      await base44.entities.Vehicle.update(entity.id, { documents: updatedDocuments });
    }

    onUpdate();
  };

  const getExpiryStatus = (expiryDate) => {
    if (!expiryDate) return null;
    
    const days = differenceInDays(parseISO(expiryDate), new Date());
    
    if (days < 0) {
      return { label: 'Vencido', color: 'bg-red-100 text-red-700', icon: AlertTriangle };
    } else if (days <= 30) {
      return { label: `Vence en ${days}d`, color: 'bg-orange-100 text-orange-700', icon: AlertTriangle };
    } else if (days <= 60) {
      return { label: `Vence en ${days}d`, color: 'bg-yellow-100 text-yellow-700', icon: Clock };
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800">Documentos</h3>
        <Button 
          onClick={() => setModalOpen(true)}
          size="sm"
          className="bg-teal-600 hover:bg-teal-700"
        >
          <Upload className="w-4 h-4 mr-2" />
          Agregar Documento
        </Button>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <FileText className="w-12 h-12 mx-auto mb-2 text-slate-300" />
          <p>No hay documentos agregados</p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc, idx) => {
            const expiryStatus = getExpiryStatus(doc.expiry_date);
            return (
              <div key={idx} className="p-4 border rounded-lg bg-white hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-teal-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-slate-800 hover:text-teal-600 block truncate"
                      >
                        {doc.name}
                      </a>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <Badge className="bg-blue-100 text-blue-700 text-xs">
                          {documentTypeLabels[doc.type] || doc.type}
                        </Badge>
                        {expiryStatus && (
                          <Badge className={`${expiryStatus.color} text-xs flex items-center gap-1`}>
                            <expiryStatus.icon className="w-3 h-3" />
                            {expiryStatus.label}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveDocument(idx)}
                  >
                    <X className="w-4 h-4 text-slate-400 hover:text-red-600" />
                  </Button>
                </div>
                
                <div className="ml-13 space-y-1 text-sm">
                  {doc.expiry_date && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Calendar className="w-4 h-4" />
                      <span>Vence: {format(parseISO(doc.expiry_date), 'd MMM yyyy', { locale: es })}</span>
                    </div>
                  )}
                  {doc.notes && (
                    <p className="text-slate-600">{doc.notes}</p>
                  )}
                  <p className="text-xs text-slate-400">
                    Subido: {doc.uploaded_date ? format(parseISO(doc.uploaded_date), 'd MMM yyyy', { locale: es }) : '-'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Agregar Documento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nombre del Documento *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Licencia de Conducir"
              />
            </div>

            <div>
              <Label>Tipo de Documento *</Label>
              <Select 
                value={formData.type} 
                onValueChange={(val) => setFormData({ ...formData, type: val })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {documentTypeLabels[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Archivo *</Label>
              {formData.url ? (
                <div className="flex items-center gap-2 p-3 border rounded-lg bg-slate-50">
                  <FileText className="w-5 h-5 text-teal-600" />
                  <span className="flex-1 text-sm truncate">Archivo cargado</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setFormData({ ...formData, url: '' })}
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
                  />
                </label>
              )}
            </div>

            <div>
              <Label>Fecha de Expiración</Label>
              <Input
                type="date"
                value={formData.expiry_date}
                onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
              />
            </div>

            <div>
              <Label>Notas</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Notas adicionales sobre el documento..."
                rows={2}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button 
                variant="outline" 
                onClick={() => setModalOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAddDocument}
                disabled={!formData.name || !formData.url}
                className="flex-1 bg-teal-600 hover:bg-teal-700"
              >
                Guardar Documento
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}