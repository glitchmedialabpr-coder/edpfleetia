import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import DocumentManager from '../components/documents/DocumentManager';
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
  User,
  Loader2,
  Calendar,
  Phone,
  Mail,
  CreditCard,
  AlertTriangle,
  Pencil,
  Users,
  Badge as BadgeIcon,
  FileSpreadsheet
} from 'lucide-react';
import EmptyState from '../components/common/EmptyState';
import { format, differenceInDays, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const statusConfig = {
  active: { label: 'Activo', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  inactive: { label: 'Inactivo', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  on_leave: { label: 'De Licencia', color: 'bg-amber-100 text-amber-700 border-amber-200' }
};

export default function Drivers() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    driver_id: '',
    full_name: '',
    email: '',
    phone: '',
    license_number: '',
    license_category: 'B',
    license_expiry: '',
    hire_date: format(new Date(), 'yyyy-MM-dd'),
    status: 'active',
    photo_url: '',
    address: '',
    emergency_contact: '',
    emergency_phone: '',
    notes: ''
  });

  const { data: drivers = [], refetch } = useQuery({
    queryKey: ['drivers'],
    queryFn: async () => {
      const res = await base44.functions.invoke('getSecureDrivers');
      return res.data.drivers || [];
    },
    staleTime: 1000 * 60 * 5
  });

  const { data: allAccidents = [] } = useQuery({
    queryKey: ['accidents'],
    queryFn: () => base44.entities.VehicleAccident.list()
  });

  const filteredDrivers = drivers.filter(d => 
    d.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    d.email?.toLowerCase().includes(search.toLowerCase()) ||
    d.license_number?.toLowerCase().includes(search.toLowerCase())
  );

  // Count drivers with expiring licenses
  const expiringLicenses = drivers.filter(d => {
    if (!d.license_expiry) return false;
    const daysUntil = differenceInDays(parseISO(d.license_expiry), new Date());
    return daysUntil <= 30 && daysUntil >= 0;
  }).length;

  const openCreateModal = () => {
    setEditingDriver(null);
    setFormData({
      driver_id: '',
      full_name: '',
      email: '',
      phone: '',
      license_number: '',
      license_category: 'B',
      license_expiry: '',
      hire_date: format(new Date(), 'yyyy-MM-dd'),
      status: 'active',
      photo_url: '',
      address: '',
      emergency_contact: '',
      emergency_phone: '',
      notes: ''
    });
    setModalOpen(true);
  };

  const openEditModal = (driver) => {
    setEditingDriver(driver);
    setFormData({
      driver_id: driver.driver_id || '',
      full_name: driver.full_name || '',
      email: driver.email || '',
      phone: driver.phone || '',
      license_number: driver.license_number || '',
      license_category: driver.license_category || 'B',
      license_expiry: driver.license_expiry || '',
      hire_date: driver.hire_date || format(new Date(), 'yyyy-MM-dd'),
      status: driver.status || 'active',
      photo_url: driver.photo_url || '',
      address: driver.address || '',
      emergency_contact: driver.emergency_contact || '',
      emergency_phone: driver.emergency_phone || '',
      notes: driver.notes || ''
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (editingDriver) {
      await base44.entities.Driver.update(editingDriver.id, formData);
    } else {
      await base44.entities.Driver.create(formData);
    }

    setModalOpen(false);
    refetch();
    setLoading(false);
  };

  const getLicenseAlert = (driver) => {
    if (!driver.license_expiry) return null;
    const daysUntil = differenceInDays(parseISO(driver.license_expiry), new Date());
    
    if (daysUntil < 0) {
      return { type: 'danger', message: 'Licencia vencida' };
    } else if (daysUntil <= 30) {
      return { type: 'warning', message: `Vence en ${daysUntil} días` };
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">Choferes</h1>
          <p className="text-slate-500 mt-1">Gestiona la información de los choferes</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={openCreateModal}
            className="bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-600/20"
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar Chofer
          </Button>
          <Button 
            variant="outline"
            className="border-teal-600 text-teal-600 hover:bg-teal-50"
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Añadir Choferes Via .csv
          </Button>
        </div>
      </div>

      {/* Alert Banner */}
      {expiringLicenses > 0 && (
        <Card className="p-4 bg-amber-50 border-amber-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <div>
              <p className="font-semibold text-amber-800">
                {expiringLicenses} licencia{expiringLicenses > 1 ? 's' : ''} por vencer
              </p>
              <p className="text-sm text-amber-600">Revisa los vencimientos próximos</p>
            </div>
          </div>
        </Card>
      )}

      {/* Search & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card className="lg:col-span-3 p-4 border-0 shadow-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Buscar por nombre, email o licencia..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </Card>
        
        <Card className="p-4 border-0 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Choferes</p>
              <p className="text-2xl font-bold text-slate-800">{drivers.length}</p>
            </div>
            <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-teal-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Status Filters */}
      <div className="flex gap-2 flex-wrap">
        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
          Activos: {drivers.filter(d => d.status === 'active').length}
        </Badge>
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
          De Licencia: {drivers.filter(d => d.status === 'on_leave').length}
        </Badge>
        <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">
          Inactivos: {drivers.filter(d => d.status === 'inactive').length}
        </Badge>
      </div>

      {/* Drivers Table */}
      <Card className="border-0 shadow-sm overflow-hidden">
        {filteredDrivers.length === 0 ? (
          <EmptyState
            icon={User}
            title={search ? "No se encontraron choferes" : "No hay choferes registrados"}
            description={search ? "Intenta con otra búsqueda" : "Agrega el primer chofer para comenzar"}
            action={!search ? openCreateModal : undefined}
            actionLabel="Agregar Chofer"
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Chofer</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Licencia</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Vencimiento</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDrivers.map(driver => {
                  const alert = getLicenseAlert(driver);
                  const status = statusConfig[driver.status] || statusConfig.active;
                  
                  return (
                    <TableRow key={driver.id} className="hover:bg-slate-50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                            {driver.photo_url ? (
                              <img src={driver.photo_url} alt={driver.full_name} className="w-full h-full rounded-full object-cover" />
                            ) : (
                              <User className="w-5 h-5 text-teal-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">{driver.full_name}</p>
                            {driver.hire_date && (
                              <p className="text-xs text-slate-500">
                                Desde {format(parseISO(driver.hire_date), 'd MMM yyyy', { locale: es })}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200 font-mono">
                          {driver.driver_id || '-'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {driver.email && (
                            <div className="flex items-center gap-1 text-sm text-slate-600">
                              <Mail className="w-3 h-3" />
                              <span>{driver.email}</span>
                            </div>
                          )}
                          {driver.phone && (
                            <div className="flex items-center gap-1 text-sm text-slate-600">
                              <Phone className="w-3 h-3" />
                              <span>{driver.phone}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-slate-400" />
                          <span className="font-mono text-slate-700">{driver.license_number}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          Categoría {driver.license_category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {driver.license_expiry ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm text-slate-700">
                              <Calendar className="w-3 h-3" />
                              {format(parseISO(driver.license_expiry), 'd MMM yyyy', { locale: es })}
                            </div>
                            {alert && (
                              <div className={cn(
                                "flex items-center gap-1 text-xs font-medium",
                                alert.type === 'danger' ? 'text-red-600' : 'text-amber-600'
                              )}>
                                <AlertTriangle className="w-3 h-3" />
                                {alert.message}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("font-medium border", status.color)}>
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditModal(driver)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          {allAccidents.filter(a => a.driver_id === driver.id).length > 0 && (
                            <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 text-xs">
                              {allAccidents.filter(a => a.driver_id === driver.id).length} accidente{allAccidents.filter(a => a.driver_id === driver.id).length > 1 ? 's' : ''}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Driver Form Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {editingDriver ? 'Editar Chofer' : 'Agregar Chofer'}
            </DialogTitle>
          </DialogHeader>

          {editingDriver ? (
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="info">Información</TabsTrigger>
                <TabsTrigger value="documents">Documentos</TabsTrigger>
              </TabsList>
              <TabsContent value="info">
                <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div>
              <h3 className="font-semibold text-slate-800 mb-3">Información Personal</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>ID de Conductor (3 dígitos) *</Label>
                  <Input
                    value={formData.driver_id}
                    onChange={(e) => setFormData({ ...formData, driver_id: e.target.value.replace(/\D/g, '').slice(0, 3) })}
                    placeholder="123"
                    maxLength="3"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Nombre Completo *</Label>
                  <Input
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="Juan Pérez"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="chofer@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Teléfono</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(787) 123-4567"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Fecha de Contratación</Label>
                  <Input
                    type="date"
                    value={formData.hire_date}
                    onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Dirección</Label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Calle, Ciudad, PR"
                  />
                </div>
              </div>
            </div>

            {/* License Info */}
            <div className="border-t pt-4">
              <h3 className="font-semibold text-slate-800 mb-3">Información de Licencia</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Número de Licencia *</Label>
                  <Input
                    value={formData.license_number}
                    onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                    placeholder="123456789"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Categoría *</Label>
                  <Select 
                    value={formData.license_category} 
                    onValueChange={(val) => setFormData({ ...formData, license_category: val })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">Categoría A</SelectItem>
                      <SelectItem value="B">Categoría B</SelectItem>
                      <SelectItem value="C">Categoría C</SelectItem>
                      <SelectItem value="D">Categoría D</SelectItem>
                      <SelectItem value="E">Categoría E</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Fecha de Vencimiento</Label>
                  <Input
                    type="date"
                    value={formData.license_expiry}
                    onChange={(e) => setFormData({ ...formData, license_expiry: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="border-t pt-4">
              <h3 className="font-semibold text-slate-800 mb-3">Contacto de Emergencia</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nombre del Contacto</Label>
                  <Input
                    value={formData.emergency_contact}
                    onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                    placeholder="Nombre completo"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Teléfono de Emergencia</Label>
                  <Input
                    value={formData.emergency_phone}
                    onChange={(e) => setFormData({ ...formData, emergency_phone: e.target.value })}
                    placeholder="(787) 123-4567"
                  />
                </div>
              </div>
            </div>

            {/* Status & Notes */}
            <div className="border-t pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <SelectItem value="active">Activo</SelectItem>
                      <SelectItem value="on_leave">De Licencia</SelectItem>
                      <SelectItem value="inactive">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2 mt-4">
                <Label>Notas Adicionales</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Notas sobre el chofer..."
                  rows={3}
                />
              </div>
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
                  'Guardar Cambios'
                )}
              </Button>
            </div>
          </form>
              </TabsContent>
              <TabsContent value="documents">
                <DocumentManager
                  entityType="driver"
                  entity={editingDriver}
                  onUpdate={refetch}
                  documentTypes={['license', 'certificate', 'medical', 'insurance', 'identification', 'contract', 'training', 'other']}
                />
              </TabsContent>
            </Tabs>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h3 className="font-semibold text-slate-800 mb-3">Información Personal</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>ID de Conductor (3 dígitos) *</Label>
                    <Input
                      value={formData.driver_id}
                      onChange={(e) => setFormData({ ...formData, driver_id: e.target.value.replace(/\D/g, '').slice(0, 3) })}
                      placeholder="123"
                      maxLength="3"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Nombre Completo *</Label>
                    <Input
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      placeholder="Juan Pérez"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="chofer@example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Teléfono</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="(787) 123-4567"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Fecha de Contratación</Label>
                    <Input
                      type="date"
                      value={formData.hire_date}
                      onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label>Dirección</Label>
                    <Input
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Calle, Ciudad, PR"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold text-slate-800 mb-3">Información de Licencia</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Número de Licencia *</Label>
                    <Input
                      value={formData.license_number}
                      onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                      placeholder="123456789"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Categoría *</Label>
                    <Select 
                      value={formData.license_category} 
                      onValueChange={(val) => setFormData({ ...formData, license_category: val })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">Categoría A</SelectItem>
                        <SelectItem value="B">Categoría B</SelectItem>
                        <SelectItem value="C">Categoría C</SelectItem>
                        <SelectItem value="D">Categoría D</SelectItem>
                        <SelectItem value="E">Categoría E</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Fecha de Vencimiento</Label>
                    <Input
                      type="date"
                      value={formData.license_expiry}
                      onChange={(e) => setFormData({ ...formData, license_expiry: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold text-slate-800 mb-3">Contacto de Emergencia</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nombre del Contacto</Label>
                    <Input
                      value={formData.emergency_contact}
                      onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                      placeholder="Nombre completo"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Teléfono de Emergencia</Label>
                    <Input
                      value={formData.emergency_phone}
                      onChange={(e) => setFormData({ ...formData, emergency_phone: e.target.value })}
                      placeholder="(787) 123-4567"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <SelectItem value="active">Activo</SelectItem>
                        <SelectItem value="on_leave">De Licencia</SelectItem>
                        <SelectItem value="inactive">Inactivo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2 mt-4">
                  <Label>Notas Adicionales</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Notas sobre el chofer..."
                    rows={3}
                  />
                </div>
              </div>

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
                    'Agregar Chofer'
                  )}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}