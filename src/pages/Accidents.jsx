import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Plus, 
  Search, 
  AlertTriangle,
  Loader2,
  Calendar,
  MapPin,
  User,
  Car,
  FileText,
  Upload,
  X,
  DollarSign
} from 'lucide-react';
import EmptyState from '../components/common/EmptyState';
import StatsCard from '../components/common/StatsCard';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const severityConfig = {
  minor: { label: 'Menor', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  moderate: { label: 'Moderado', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  severe: { label: 'Severo', color: 'bg-red-100 text-red-700 border-red-200' }
};

const statusConfig = {
  reported: { label: 'Reportado', color: 'bg-blue-100 text-blue-700' },
  under_investigation: { label: 'En Investigación', color: 'bg-purple-100 text-purple-700' },
  resolved: { label: 'Resuelto', color: 'bg-emerald-100 text-emerald-700' },
  closed: { label: 'Cerrado', color: 'bg-slate-100 text-slate-700' }
};

export default function Accidents() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAccident, setEditingAccident] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [uploadingDocs, setUploadingDocs] = useState(false);
  const [formData, setFormData] = useState({
    driver_id: '',
    driver_name: '',
    vehicle_id: '',
    vehicle_info: '',
    accident_date: format(new Date(), 'yyyy-MM-dd'),
    accident_time: '',
    location: '',
    description: '',
    severity: 'minor',
    injuries_reported: false,
    police_report_number: '',
    insurance_claim_number: '',
    estimated_cost: 0,
    photos_urls: [],
    documents_urls: [],
    status: 'reported',
    notes: ''
  });

  const { data: accidents = [], refetch } = useQuery({
    queryKey: ['vehicle-accidents'],
    queryFn: () => base44.entities.VehicleAccident.list('-accident_date')
  });

  const { data: drivers = [] } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => base44.entities.Driver.list()
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => base44.entities.Vehicle.list()
  });

  const filteredAccidents = accidents.filter(a => 
    a.driver_name?.toLowerCase().includes(search.toLowerCase()) ||
    a.location?.toLowerCase().includes(search.toLowerCase()) ||
    a.police_report_number?.toLowerCase().includes(search.toLowerCase())
  );

  // Calculate stats
  const totalCost = accidents.reduce((sum, a) => sum + (a.estimated_cost || 0), 0);
  const severeCount = accidents.filter(a => a.severity === 'severe').length;
  const activeCount = accidents.filter(a => a.status === 'reported' || a.status === 'under_investigation').length;

  const openCreateModal = () => {
    setEditingAccident(null);
    setFormData({
      driver_id: '',
      driver_name: '',
      vehicle_id: '',
      vehicle_info: '',
      accident_date: format(new Date(), 'yyyy-MM-dd'),
      accident_time: '',
      location: '',
      description: '',
      severity: 'minor',
      injuries_reported: false,
      police_report_number: '',
      insurance_claim_number: '',
      estimated_cost: 0,
      photos_urls: [],
      documents_urls: [],
      status: 'reported',
      notes: ''
    });
    setModalOpen(true);
  };

  const openEditModal = (accident) => {
    setEditingAccident(accident);
    setFormData({
      driver_id: accident.driver_id || '',
      driver_name: accident.driver_name || '',
      vehicle_id: accident.vehicle_id || '',
      vehicle_info: accident.vehicle_info || '',
      accident_date: accident.accident_date || format(new Date(), 'yyyy-MM-dd'),
      accident_time: accident.accident_time || '',
      location: accident.location || '',
      description: accident.description || '',
      severity: accident.severity || 'minor',
      injuries_reported: accident.injuries_reported || false,
      police_report_number: accident.police_report_number || '',
      insurance_claim_number: accident.insurance_claim_number || '',
      estimated_cost: accident.estimated_cost || 0,
      photos_urls: accident.photos_urls || [],
      documents_urls: accident.documents_urls || [],
      status: accident.status || 'reported',
      notes: accident.notes || ''
    });
    setModalOpen(true);
  };

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadingPhotos(true);
    try {
      const uploadPromises = files.map(file => 
        base44.integrations.Core.UploadFile({ file })
      );
      const results = await Promise.all(uploadPromises);
      const newUrls = results.map(r => r.file_url);
      setFormData({ 
        ...formData, 
        photos_urls: [...(formData.photos_urls || []), ...newUrls] 
      });
    } catch (error) {
      console.error('Error uploading photos:', error);
    }
    setUploadingPhotos(false);
  };

  const removePhoto = (index) => {
    const newPhotos = [...(formData.photos_urls || [])];
    newPhotos.splice(index, 1);
    setFormData({ ...formData, photos_urls: newPhotos });
  };

  const handleDocumentUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadingDocs(true);
    try {
      const uploadPromises = files.map(file => 
        base44.integrations.Core.UploadFile({ file }).then(result => ({
          name: file.name,
          url: result.file_url
        }))
      );
      const newDocs = await Promise.all(uploadPromises);
      setFormData({ 
        ...formData, 
        documents_urls: [...(formData.documents_urls || []), ...newDocs] 
      });
    } catch (error) {
      console.error('Error uploading documents:', error);
    }
    setUploadingDocs(false);
  };

  const removeDocument = (index) => {
    const newDocs = [...(formData.documents_urls || [])];
    newDocs.splice(index, 1);
    setFormData({ ...formData, documents_urls: newDocs });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (editingAccident) {
      await base44.entities.VehicleAccident.update(editingAccident.id, formData);
    } else {
      await base44.entities.VehicleAccident.create(formData);
    }

    setModalOpen(false);
    refetch();
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">Accidentes Vehiculares</h1>
          <p className="text-slate-500 mt-1">Registro de incidentes y accidentes</p>
        </div>
        <Button 
          onClick={openCreateModal}
          className="bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-600/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          Reportar Accidente
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Accidentes"
          value={accidents.length}
          icon={AlertTriangle}
          color="red"
        />
        <StatsCard
          title="Casos Activos"
          value={activeCount}
          icon={FileText}
          color="blue"
        />
        <StatsCard
          title="Severos"
          value={severeCount}
          icon={AlertTriangle}
          color="orange"
        />
        <StatsCard
          title="Costo Total"
          value={`$${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          icon={DollarSign}
          color="emerald"
        />
      </div>

      {/* Search */}
      <Card className="p-4 border-0 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Buscar por chofer, ubicación o reporte policial..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Accidents Table */}
      <Card className="border-0 shadow-sm overflow-hidden">
        {filteredAccidents.length === 0 ? (
          <EmptyState
            icon={AlertTriangle}
            title={search ? "No se encontraron accidentes" : "No hay accidentes registrados"}
            description={search ? "Intenta con otra búsqueda" : "Los accidentes reportados aparecerán aquí"}
            action={!search ? openCreateModal : undefined}
            actionLabel="Reportar Accidente"
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Fecha</TableHead>
                  <TableHead>Chofer</TableHead>
                  <TableHead>Vehículo</TableHead>
                  <TableHead>Ubicación</TableHead>
                  <TableHead>Severidad</TableHead>
                  <TableHead>Costo</TableHead>
                  <TableHead>Docs</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAccidents.map(accident => {
                  const severity = accident.severity && severityConfig[accident.severity] ? severityConfig[accident.severity] : severityConfig.minor;
                  const status = accident.status && statusConfig[accident.status] ? statusConfig[accident.status] : statusConfig.reported;
                  
                  return (
                    <TableRow key={accident.id} className="hover:bg-slate-50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <div>
                            <p className="font-medium text-slate-800">
                              {accident.accident_date ? format(new Date(accident.accident_date), 'd MMM yyyy', { locale: es }) : '-'}
                            </p>
                            {accident.accident_time && (
                              <p className="text-xs text-slate-500">{accident.accident_time}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-slate-400" />
                          <span className="font-medium text-slate-700">{accident.driver_name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600 text-sm">
                        {accident.vehicle_info || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-slate-600">
                          <MapPin className="w-3 h-3" />
                          <span>{accident.location || '-'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("font-medium border", severity.color)}>
                          {severity.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-red-600">
                          ${accident.estimated_cost?.toFixed(2) || '0.00'}
                        </span>
                      </TableCell>
                      <TableCell>
                        {accident.documents_urls && accident.documents_urls.length > 0 ? (
                          <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">
                            {accident.documents_urls.length} doc{accident.documents_urls.length > 1 ? 's' : ''}
                          </Badge>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={status.color}>
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(accident)}
                        >
                          Ver Detalles
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Accident Form Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {editingAccident ? 'Detalles del Accidente' : 'Reportar Accidente'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div>
              <h3 className="font-semibold text-slate-800 mb-3">Información del Incidente</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Fecha del Accidente *</Label>
                  <Input
                    type="date"
                    value={formData.accident_date}
                    onChange={(e) => setFormData({ ...formData, accident_date: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Hora</Label>
                  <Input
                    type="time"
                    value={formData.accident_time}
                    onChange={(e) => setFormData({ ...formData, accident_time: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Chofer Involucrado *</Label>
                  <Select 
                    value={formData.driver_id} 
                    onValueChange={(value) => {
                      const driver = drivers.find(d => d.id === value);
                      setFormData({ 
                        ...formData, 
                        driver_id: value,
                        driver_name: driver?.full_name || ''
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar chofer" />
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

                <div className="space-y-2">
                  <Label>Vehículo</Label>
                  <Select 
                    value={formData.vehicle_id} 
                    onValueChange={(value) => {
                      const vehicle = vehicles.find(v => v.id === value);
                      setFormData({ 
                        ...formData, 
                        vehicle_id: value,
                        vehicle_info: vehicle ? `${vehicle.brand} ${vehicle.model} - ${vehicle.plate}` : ''
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar vehículo" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles.map(vehicle => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.brand} {vehicle.model} - {vehicle.plate}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Ubicación *</Label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Dirección o intersección donde ocurrió"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Descripción del Accidente *</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe lo que sucedió..."
                rows={4}
                required
              />
            </div>

            {/* Severity & Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Severidad</Label>
                <Select 
                  value={formData.severity} 
                  onValueChange={(val) => setFormData({ ...formData, severity: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minor">Menor</SelectItem>
                    <SelectItem value="moderate">Moderado</SelectItem>
                    <SelectItem value="severe">Severo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Estado</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(val) => setFormData({ ...formData, status: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reported">Reportado</SelectItem>
                    <SelectItem value="under_investigation">En Investigación</SelectItem>
                    <SelectItem value="resolved">Resuelto</SelectItem>
                    <SelectItem value="closed">Cerrado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Número de Reporte Policial</Label>
                <Input
                  value={formData.police_report_number}
                  onChange={(e) => setFormData({ ...formData, police_report_number: e.target.value })}
                  placeholder="Ej: 2024-12345"
                />
              </div>

              <div className="space-y-2">
                <Label>Número de Reclamo de Seguro</Label>
                <Input
                  value={formData.insurance_claim_number}
                  onChange={(e) => setFormData({ ...formData, insurance_claim_number: e.target.value })}
                  placeholder="Ej: CLM-98765"
                />
              </div>

              <div className="space-y-2">
                <Label>Costo Estimado ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.estimated_cost}
                  onChange={(e) => setFormData({ ...formData, estimated_cost: parseFloat(e.target.value) })}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 h-9">
                  <Checkbox
                    id="injuries"
                    checked={formData.injuries_reported}
                    onCheckedChange={(checked) => setFormData({ ...formData, injuries_reported: checked })}
                  />
                  <label
                    htmlFor="injuries"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Hubo personas heridas
                  </label>
                </div>
              </div>
            </div>

            {/* Photos */}
            <div className="space-y-2">
              <Label>Fotos del Accidente</Label>
              {formData.photos_urls && formData.photos_urls.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                  {formData.photos_urls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={url} 
                        alt={`Accidente ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                <div className="flex flex-col items-center justify-center">
                  {uploadingPhotos ? (
                    <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-slate-400 mb-1" />
                      <p className="text-xs text-slate-500">Click para agregar fotos</p>
                    </>
                  )}
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  onChange={handlePhotoUpload}
                  accept="image/*"
                  multiple
                  disabled={uploadingPhotos}
                />
              </label>
            </div>

            {/* Documents */}
            <div className="space-y-2">
              <Label>Documentos (Reporte Policial, Seguro, etc.)</Label>
              {formData.documents_urls && formData.documents_urls.length > 0 && (
                <div className="space-y-2 mb-3">
                  {formData.documents_urls.map((doc, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 border rounded-lg bg-slate-50 group">
                      <FileText className="w-5 h-5 text-teal-600" />
                      <a 
                        href={doc.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex-1 text-sm text-slate-700 hover:text-teal-600 truncate"
                      >
                        {doc.name}
                      </a>
                      <button
                        type="button"
                        onClick={() => removeDocument(index)}
                        className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                <div className="flex flex-col items-center justify-center">
                  {uploadingDocs ? (
                    <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-slate-400 mb-1" />
                      <p className="text-xs text-slate-500">Click para agregar documentos</p>
                      <p className="text-xs text-slate-400">PDF, imágenes, Word, etc.</p>
                    </>
                  )}
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  onChange={handleDocumentUpload}
                  accept=".pdf,.doc,.docx,image/*"
                  multiple
                  disabled={uploadingDocs}
                />
              </label>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>Notas Adicionales</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Información adicional relevante..."
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" disabled={loading} className="flex-1 bg-teal-600 hover:bg-teal-700">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  editingAccident ? 'Guardar Cambios' : 'Registrar Accidente'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}