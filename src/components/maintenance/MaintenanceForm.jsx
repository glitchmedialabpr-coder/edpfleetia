import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Upload, FileText, X } from 'lucide-react';
import { format } from 'date-fns';

const serviceTypes = [
  { value: 'oil_change', label: 'Cambio de Aceite' },
  { value: 'tire_rotation', label: 'Rotación de Gomas' },
  { value: 'brake_service', label: 'Servicio de Frenos' },
  { value: 'alignment', label: 'Alineación' },
  { value: 'inspection', label: 'Inspección' },
  { value: 'battery', label: 'Batería' },
  { value: 'transmission', label: 'Transmisión' },
  { value: 'engine', label: 'Motor' },
  { value: 'ac_service', label: 'Servicio de A/C' },
  { value: 'other', label: 'Otro' }
];

export default function MaintenanceForm({ open, onClose, vehicle, onCreated }) {
  const [loading, setLoading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    vehicle_id: '',
    vehicle_plate: '',
    service_date: format(new Date(), 'yyyy-MM-dd'),
    mileage_at_service: 0,
    service_type: '',
    service_provider: '',
    description: '',
    cost: 0,
    files: [],
    next_service_date: '',
    next_service_mileage: 0,
    performed_by: '',
    notes: ''
  });

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (vehicle && open) {
      setFormData({
        ...formData,
        vehicle_id: vehicle.id,
        vehicle_plate: vehicle.plate,
        mileage_at_service: vehicle.current_mileage || 0,
        performed_by: user?.email || ''
      });
    }
  }, [vehicle, open, user]);

  const loadUser = async () => {
    const userData = await base44.auth.me();
    setUser(userData);
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingFile(true);
    try {
      const uploadPromises = files.map(async (file) => {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        return {
          url: file_url,
          name: file.name,
          notes: '',
          uploaded_date: format(new Date(), 'yyyy-MM-dd')
        };
      });
      
      const uploadedFiles = await Promise.all(uploadPromises);
      setFormData({ 
        ...formData, 
        files: [...formData.files, ...uploadedFiles] 
      });
    } catch (error) {
      console.error('Error uploading file:', error);
    }
    setUploadingFile(false);
  };

  const handleRemoveFile = (index) => {
    setFormData({
      ...formData,
      files: formData.files.filter((_, i) => i !== index)
    });
  };

  const handleFileNotes = (index, notes) => {
    const updatedFiles = [...formData.files];
    updatedFiles[index].notes = notes;
    setFormData({ ...formData, files: updatedFiles });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create maintenance record
      await base44.entities.MaintenanceRecord.create({
        ...formData,
        performed_by: user?.email || ''
      });

      // Update vehicle with new service info and mileage
      const updateData = {
        current_mileage: formData.mileage_at_service
      };
      
      if (formData.next_service_date) {
        updateData.next_service_date = formData.next_service_date;
      }
      
      if (formData.next_service_mileage) {
        updateData.next_service_mileage = formData.next_service_mileage;
      }

      await base44.entities.Vehicle.update(vehicle.id, updateData);

      onCreated();
      onClose();
      setFormData({
        vehicle_id: '',
        vehicle_plate: '',
        service_date: format(new Date(), 'yyyy-MM-dd'),
        mileage_at_service: 0,
        service_type: '',
        service_provider: '',
        description: '',
        cost: 0,
        files: [],
        next_service_date: '',
        next_service_mileage: 0,
        performed_by: '',
        notes: ''
      });
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Registrar Mantenimiento - {vehicle?.plate}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fecha de Servicio *</Label>
              <Input
                type="date"
                value={formData.service_date}
                onChange={(e) => setFormData({ ...formData, service_date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Kilometraje Actual *</Label>
              <Input
                type="number"
                value={formData.mileage_at_service}
                onChange={(e) => setFormData({ ...formData, mileage_at_service: parseInt(e.target.value) })}
                required
              />
            </div>
          </div>

          {/* Service Type */}
          <div className="space-y-2">
            <Label>Tipo de Servicio *</Label>
            <Select 
              value={formData.service_type} 
              onValueChange={(value) => setFormData({ ...formData, service_type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tipo de servicio" />
              </SelectTrigger>
              <SelectContent>
                {serviceTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Provider & Cost */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Proveedor del Servicio</Label>
              <Input
                value={formData.service_provider}
                onChange={(e) => setFormData({ ...formData, service_provider: e.target.value })}
                placeholder="Nombre del taller o proveedor"
              />
            </div>

            <div className="space-y-2">
              <Label>Costo ($)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) })}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Descripción del Servicio</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detalles del servicio realizado..."
              rows={3}
            />
          </div>

          {/* Files Upload */}
          <div className="space-y-2">
            <Label>Archivos (Facturas, Fotos, Reportes)</Label>
            <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
              <div className="flex items-center justify-center gap-2">
                {uploadingFile ? (
                  <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
                ) : (
                  <>
                    <Upload className="w-5 h-5 text-slate-400" />
                    <p className="text-sm text-slate-500">Click para subir archivos</p>
                  </>
                )}
              </div>
              <input 
                type="file" 
                className="hidden" 
                onChange={handleFileUpload}
                accept="image/*,.pdf"
                disabled={uploadingFile}
                multiple
              />
            </label>
            {formData.files.length > 0 && (
              <div className="space-y-2 mt-3">
                {formData.files.map((file, idx) => (
                  <div key={idx} className="p-3 border rounded-lg bg-slate-50">
                    <div className="flex items-start gap-3">
                      <FileText className="w-5 h-5 text-teal-600 mt-1" />
                      <div className="flex-1 min-w-0">
                        <a 
                          href={file.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-slate-700 hover:text-teal-600 truncate block"
                        >
                          {file.name}
                        </a>
                        <p className="text-xs text-slate-500 mt-1">
                          Subido: {file.uploaded_date}
                        </p>
                        <Input
                          placeholder="Notas sobre este archivo..."
                          value={file.notes}
                          onChange={(e) => handleFileNotes(idx, e.target.value)}
                          className="mt-2 text-sm"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveFile(idx)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Next Service */}
          <div className="border-t pt-4">
            <h4 className="font-semibold text-slate-800 mb-4">Próximo Servicio</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fecha del Próximo Servicio</Label>
                <Input
                  type="date"
                  value={formData.next_service_date}
                  onChange={(e) => setFormData({ ...formData, next_service_date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Próximo Servicio por Kilometraje</Label>
                <Input
                  type="number"
                  value={formData.next_service_mileage}
                  onChange={(e) => setFormData({ ...formData, next_service_mileage: parseInt(e.target.value) })}
                  placeholder="Ej: 50000"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notas Adicionales</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Notas adicionales..."
              rows={2}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !formData.service_type}
              className="flex-1 bg-teal-600 hover:bg-teal-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Registrar Mantenimiento'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}