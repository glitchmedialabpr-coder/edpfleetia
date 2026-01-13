import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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
  AlertTriangle,
  Plus,
  Search,
  Calendar,
  FileText,
  Upload,
  X,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import EmptyState from '../components/common/EmptyState';
import StatsCard from '../components/common/StatsCard';

const warningTypeLabels = {
  tardiness: 'Tardanza',
  absence: 'Ausencia',
  misconduct: 'Mala Conducta',
  safety_violation: 'Violación de Seguridad',
  policy_violation: 'Violación de Política',
  performance: 'Rendimiento',
  customer_complaint: 'Queja de Cliente',
  other: 'Otro'
};

const severityConfig = {
  verbal: { label: 'Verbal', color: 'bg-blue-100 text-blue-700' },
  written: { label: 'Escrita', color: 'bg-yellow-100 text-yellow-700' },
  final: { label: 'Final', color: 'bg-orange-100 text-orange-700' },
  suspension: { label: 'Suspensión', color: 'bg-red-100 text-red-700' }
};

const statusConfig = {
  active: { label: 'Activa', color: 'bg-red-100 text-red-700' },
  resolved: { label: 'Resuelta', color: 'bg-green-100 text-green-700' },
  appealed: { label: 'Apelada', color: 'bg-purple-100 text-purple-700' },
  dismissed: { label: 'Desestimada', color: 'bg-slate-100 text-slate-700' }
};

export default function Warnings() {
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedWarning, setSelectedWarning] = useState(null);
  const [search, setSearch] = useState('');
  const [driverFilter, setDriverFilter] = useState('all');
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    driver_id: '',
    warning_date: format(new Date(), 'yyyy-MM-dd'),
    warning_type: 'other',
    severity: 'verbal',
    description: '',
    action_taken: '',
    issued_by: '',
    witness: '',
    driver_acknowledgment: false,
    driver_comments: '',
    follow_up_date: '',
    documents: [],
    status: 'active',
    notes: ''
  });

  const queryClient = useQueryClient();

  const { data: warnings = [] } = useQuery({
    queryKey: ['warnings'],
    queryFn: () => base44.entities.DriverWarning.list('-warning_date', 200)
  });

  const { data: drivers = [] } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => base44.entities.Driver.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.DriverWarning.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['warnings']);
      setModalOpen(false);
      resetForm();
    }
  });

  const resetForm = () => {
    setFormData({
      driver_id: '',
      warning_date: format(new Date(), 'yyyy-MM-dd'),
      warning_type: 'other',
      severity: 'verbal',
      description: '',
      action_taken: '',
      issued_by: '',
      witness: '',
      driver_acknowledgment: false,
      driver_comments: '',
      follow_up_date: '',
      documents: [],
      status: 'active',
      notes: ''
    });
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    setUploading(true);
    
    try {
      const uploadPromises = files.map(async (file) => {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        return {
          url: file_url,
          name: file.name,
          notes: ''
        };
      });
      
      const uploadedDocs = await Promise.all(uploadPromises);
      setFormData({
        ...formData,
        documents: [...formData.documents, ...uploadedDocs]
      });
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveDocument = (index) => {
    setFormData({
      ...formData,
      documents: formData.documents.filter((_, i) => i !== index)
    });
  };

  const handleDocumentNotes = (index, notes) => {
    const updated = [...formData.documents];
    updated[index].notes = notes;
    setFormData({ ...formData, documents: updated });
  };

  const handleSubmit = () => {
    const driver = drivers.find(d => d.id === formData.driver_id);
    createMutation.mutate({
      ...formData,
      driver_name: driver?.full_name || ''
    });
  };

  const filteredWarnings = warnings.filter(warning => {
    const matchesSearch = 
      warning.driver_name?.toLowerCase().includes(search.toLowerCase()) ||
      warning.description?.toLowerCase().includes(search.toLowerCase());
    const matchesDriver = driverFilter === 'all' || warning.driver_id === driverFilter;
    return matchesSearch && matchesDriver;
  });

  const activeWarnings = warnings.filter(w => w.status === 'active').length;
  const verbalWarnings = warnings.filter(w => w.severity === 'verbal').length;
  const writtenWarnings = warnings.filter(w => w.severity === 'written' || w.severity === 'final' || w.severity === 'suspension').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">Advertencias</h1>
          <p className="text-slate-500 mt-1">Expediente de advertencias disciplinarias</p>
        </div>
        <Button onClick={() => setModalOpen(true)} className="bg-red-600 hover:bg-red-700">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Advertencia
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total" value={warnings.length} icon={AlertTriangle} color="red" />
        <StatsCard title="Activas" value={activeWarnings} icon={FileText} color="orange" />
        <StatsCard title="Verbales" value={verbalWarnings} icon={AlertTriangle} color="blue" />
        <StatsCard title="Escritas" value={writtenWarnings} icon={FileText} color="yellow" />
      </div>

      <Card className="p-4 border-0 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Buscar advertencias..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={driverFilter} onValueChange={setDriverFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Chofer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los choferes</SelectItem>
              {drivers.map(driver => (
                <SelectItem key={driver.id} value={driver.id}>
                  {driver.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card className="border-0 shadow-sm overflow-hidden">
        {filteredWarnings.length === 0 ? (
          <EmptyState
            icon={AlertTriangle}
            title="No hay advertencias registradas"
            description="Las advertencias aparecerán aquí"
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Fecha</TableHead>
                  <TableHead>Chofer</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Severidad</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWarnings.map(warning => (
                  <TableRow key={warning.id} className="hover:bg-slate-50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="font-medium">
                          {format(new Date(warning.warning_date), 'd MMM yyyy', { locale: es })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-slate-700">{warning.driver_name}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-600">
                        {warningTypeLabels[warning.warning_type]}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={severityConfig[warning.severity]?.color}>
                        {severityConfig[warning.severity]?.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="text-slate-600 truncate">{warning.description}</p>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusConfig[warning.status]?.color}>
                        {statusConfig[warning.status]?.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedWarning(warning);
                          setViewModalOpen(true);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Create Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nueva Advertencia</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Chofer *</Label>
                <Select value={formData.driver_id} onValueChange={(val) => setFormData({ ...formData, driver_id: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {drivers.map(driver => (
                      <SelectItem key={driver.id} value={driver.id}>
                        {driver.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Fecha *</Label>
                <Input
                  type="date"
                  value={formData.warning_date}
                  onChange={(e) => setFormData({ ...formData, warning_date: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tipo de Advertencia *</Label>
                <Select value={formData.warning_type} onValueChange={(val) => setFormData({ ...formData, warning_type: val })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(warningTypeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Severidad *</Label>
                <Select value={formData.severity} onValueChange={(val) => setFormData({ ...formData, severity: val })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(severityConfig).map(([value, { label }]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Descripción *</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción detallada de la falta..."
                rows={3}
              />
            </div>

            <div>
              <Label>Acción Tomada</Label>
              <Textarea
                value={formData.action_taken}
                onChange={(e) => setFormData({ ...formData, action_taken: e.target.value })}
                placeholder="Descripción de la acción correctiva..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Emitida Por</Label>
                <Input
                  value={formData.issued_by}
                  onChange={(e) => setFormData({ ...formData, issued_by: e.target.value })}
                  placeholder="Nombre del supervisor"
                />
              </div>
              <div>
                <Label>Testigo</Label>
                <Input
                  value={formData.witness}
                  onChange={(e) => setFormData({ ...formData, witness: e.target.value })}
                  placeholder="Nombre del testigo"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                checked={formData.driver_acknowledgment}
                onCheckedChange={(checked) => setFormData({ ...formData, driver_acknowledgment: checked })}
              />
              <Label>El chofer reconoce la advertencia</Label>
            </div>

            <div>
              <Label>Comentarios del Chofer</Label>
              <Textarea
                value={formData.driver_comments}
                onChange={(e) => setFormData({ ...formData, driver_comments: e.target.value })}
                placeholder="Comentarios o explicación del chofer..."
                rows={2}
              />
            </div>

            <div>
              <Label>Documentos de Soporte</Label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="flex-1"
                  />
                  {uploading && <span className="text-sm text-slate-500">Subiendo...</span>}
                </div>
                {formData.documents.length > 0 && (
                  <div className="space-y-2">
                    {formData.documents.map((doc, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded flex items-start gap-3">
                        <FileText className="w-5 h-5 text-slate-400 mt-1" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{doc.name}</p>
                          <Input
                            placeholder="Notas sobre este archivo..."
                            value={doc.notes}
                            onChange={(e) => handleDocumentNotes(idx, e.target.value)}
                            className="mt-2"
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveDocument(idx)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Fecha de Seguimiento</Label>
                <Input
                  type="date"
                  value={formData.follow_up_date}
                  onChange={(e) => setFormData({ ...formData, follow_up_date: e.target.value })}
                />
              </div>
              <div>
                <Label>Estado</Label>
                <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusConfig).map(([value, { label }]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Notas Adicionales</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Notas..."
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!formData.driver_id || !formData.description}
                className="bg-red-600 hover:bg-red-700"
              >
                Guardar Advertencia
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles de Advertencia</DialogTitle>
          </DialogHeader>
          {selectedWarning && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Chofer</p>
                  <p className="font-semibold">{selectedWarning.driver_name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Fecha</p>
                  <p className="font-semibold">
                    {format(new Date(selectedWarning.warning_date), 'd MMM yyyy', { locale: es })}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Tipo</p>
                  <p className="font-semibold">{warningTypeLabels[selectedWarning.warning_type]}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Severidad</p>
                  <Badge className={severityConfig[selectedWarning.severity]?.color}>
                    {severityConfig[selectedWarning.severity]?.label}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-500">Descripción</p>
                <p className="text-slate-700">{selectedWarning.description}</p>
              </div>
              {selectedWarning.action_taken && (
                <div>
                  <p className="text-sm text-slate-500">Acción Tomada</p>
                  <p className="text-slate-700">{selectedWarning.action_taken}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Emitida Por</p>
                  <p className="font-medium">{selectedWarning.issued_by || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Testigo</p>
                  <p className="font-medium">{selectedWarning.witness || '-'}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-500">Reconocimiento del Chofer</p>
                <Badge className={selectedWarning.driver_acknowledgment ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                  {selectedWarning.driver_acknowledgment ? 'Reconocida' : 'No Reconocida'}
                </Badge>
              </div>
              {selectedWarning.driver_comments && (
                <div>
                  <p className="text-sm text-slate-500">Comentarios del Chofer</p>
                  <p className="text-slate-700">{selectedWarning.driver_comments}</p>
                </div>
              )}
              {selectedWarning.documents?.length > 0 && (
                <div>
                  <p className="text-sm text-slate-500 mb-2">Documentos</p>
                  <div className="space-y-2">
                    {selectedWarning.documents.map((doc, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded flex items-start justify-between">
                        <div className="flex-1">
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-teal-600 hover:underline font-medium"
                          >
                            {doc.name}
                          </a>
                          {doc.notes && <p className="text-sm text-slate-600 mt-1">{doc.notes}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {selectedWarning.follow_up_date && (
                <div>
                  <p className="text-sm text-slate-500">Seguimiento</p>
                  <p className="font-medium">
                    {format(new Date(selectedWarning.follow_up_date), 'd MMM yyyy', { locale: es })}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-slate-500">Estado</p>
                <Badge className={statusConfig[selectedWarning.status]?.color}>
                  {statusConfig[selectedWarning.status]?.label}
                </Badge>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}