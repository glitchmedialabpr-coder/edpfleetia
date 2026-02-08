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
  DialogTrigger,
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
  FileSpreadsheet,
  Eye,
  FileText,
  Trash2,
  Upload,
  X,
  Edit2,
  Clock,
  CheckCircle
} from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import EmptyState from '../components/common/EmptyState';
import StatsCard from '../components/common/StatsCard';
import MobileCard, { MobileCardRow, MobileCardSection } from '../components/common/MobileCard';
import { format, differenceInDays, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';

const statusConfig = {
  active: { label: 'Activo', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  inactive: { label: 'Inactivo', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  on_leave: { label: 'De Licencia', color: 'bg-amber-100 text-amber-700 border-amber-200' }
};

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

const warningStatusConfig = {
  active: { label: 'Activa', color: 'bg-red-100 text-red-700' },
  resolved: { label: 'Resuelta', color: 'bg-green-100 text-green-700' },
  appealed: { label: 'Apelada', color: 'bg-purple-100 text-purple-700' },
  dismissed: { label: 'Desestimada', color: 'bg-slate-100 text-slate-700' }
};

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export default function Drivers() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('drivers');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [warningModalOpen, setWarningModalOpen] = useState(false);
  const [viewWarningModalOpen, setViewWarningModalOpen] = useState(false);
  const [selectedWarning, setSelectedWarning] = useState(null);
  const [warningSearch, setWarningSearch] = useState('');
  const [driverFilter, setDriverFilter] = useState('all');
  const [uploading, setUploading] = useState(false);
  const [scheduleSearchTerm, setScheduleSearchTerm] = useState('');
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

  const { data: warnings = [] } = useQuery({
    queryKey: ['warnings'],
    queryFn: () => base44.entities.DriverWarning.list('-warning_date', 200),
    staleTime: 1000 * 60 * 5
  });

  const [warningFormData, setWarningFormData] = useState({
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

  const createWarningMutation = useMutation({
    mutationFn: (data) => base44.entities.DriverWarning.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['warnings']);
      setWarningModalOpen(false);
      resetWarningForm();
    }
  });

  const resetWarningForm = () => {
    setWarningFormData({
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
      setWarningFormData({
        ...warningFormData,
        documents: [...warningFormData.documents, ...uploadedDocs]
      });
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveDocument = (index) => {
    setWarningFormData({
      ...warningFormData,
      documents: warningFormData.documents.filter((_, i) => i !== index)
    });
  };

  const handleDocumentNotes = (index, notes) => {
    const updated = [...warningFormData.documents];
    updated[index].notes = notes;
    setWarningFormData({ ...warningFormData, documents: updated });
  };

  const handleWarningSubmit = () => {
    const driver = drivers.find(d => d.id === warningFormData.driver_id);
    createWarningMutation.mutate({
      ...warningFormData,
      driver_name: driver?.full_name || ''
    });
  };

  const filteredWarnings = warnings.filter(warning => {
    const matchesSearch = 
      warning.driver_name?.toLowerCase().includes(warningSearch.toLowerCase()) ||
      warning.description?.toLowerCase().includes(warningSearch.toLowerCase());
    const matchesDriver = driverFilter === 'all' || warning.driver_id === driverFilter;
    return matchesSearch && matchesDriver;
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => base44.entities.Vehicle.filter({ status: 'available' }),
    staleTime: 1000 * 60 * 5
  });

  const [editingScheduleDriver, setEditingScheduleDriver] = useState(null);
  const [scheduleFormData, setScheduleFormData] = useState({
    shift_duration: 8,
    shift_start_time: '06:00',
    shift_days: [],
    assigned_vehicle_id: ''
  });

  const updateScheduleMutation = useMutation({
    mutationFn: async ({ driverId, data }) => {
      await base44.entities.Driver.update(driverId, data);
      await base44.entities.Notification.create({
        type: 'schedule_change',
        title: 'Horario de Conductor Actualizado',
        message: `Se actualizó el horario de ${editingScheduleDriver.full_name}`,
        driver_id: editingScheduleDriver.driver_id,
        driver_name: editingScheduleDriver.full_name,
        priority: 'medium',
        data: {
          shift_duration: data.shift_duration,
          shift_start_time: data.shift_start_time,
          shift_days: data.shift_days
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['drivers']);
      queryClient.invalidateQueries(['notifications']);
      handleCloseScheduleDialog();
    }
  });

  const handleOpenScheduleDialog = (driver) => {
    setEditingScheduleDriver(driver);
    setScheduleFormData({
      shift_duration: driver.shift_duration || 8,
      shift_start_time: driver.shift_start_time || '06:00',
      shift_days: driver.shift_days || [],
      assigned_vehicle_id: driver.assigned_vehicle_id || ''
    });
  };

  const handleCloseScheduleDialog = () => {
    setEditingScheduleDriver(null);
    setScheduleFormData({
      shift_duration: 8,
      shift_start_time: '06:00',
      shift_days: [],
      assigned_vehicle_id: ''
    });
  };

  const toggleDay = (dayIndex) => {
    setScheduleFormData(prev => ({
      ...prev,
      shift_days: prev.shift_days.includes(dayIndex)
        ? prev.shift_days.filter(d => d !== dayIndex)
        : [...prev.shift_days, dayIndex].sort((a, b) => a - b)
    }));
  };

  const handleScheduleSave = () => {
    if (!scheduleFormData.shift_start_time || scheduleFormData.shift_days.length === 0 || !scheduleFormData.assigned_vehicle_id) {
      return;
    }
    updateScheduleMutation.mutate({
      driverId: editingScheduleDriver.id,
      data: scheduleFormData
    });
  };

  const filteredScheduleDrivers = drivers.filter(driver =>
    driver.full_name.toLowerCase().includes(scheduleSearchTerm.toLowerCase()) ||
    driver.driver_id.includes(scheduleSearchTerm)
  );

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

    try {
      if (editingDriver) {
        await base44.entities.Driver.update(editingDriver.id, formData);
      } else {
        await base44.entities.Driver.create(formData);
      }
      setModalOpen(false);
      refetch();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
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
          <p className="text-slate-500 mt-1">Gestiona choferes y advertencias</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="drivers">
            <Users className="w-4 h-4 mr-2" />
            Choferes
          </TabsTrigger>
          <TabsTrigger value="warnings">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Advertencias
          </TabsTrigger>
          <TabsTrigger value="schedules">
            <Clock className="w-4 h-4 mr-2" />
            Horarios
          </TabsTrigger>
        </TabsList>

        {/* Choferes Tab */}
        <TabsContent value="drivers" className="space-y-4">
          <div className="flex justify-end">
            <Button 
              onClick={openCreateModal}
              className="bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-600/20"
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar Chofer
            </Button>
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
          <>
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
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
          
          {/* Mobile Card View */}
          <div className="lg:hidden divide-y">
            {filteredDrivers.map(driver => {
              const alert = getLicenseAlert(driver);
              const status = statusConfig[driver.status] || statusConfig.active;
              
              return (
                <MobileCard key={driver.id} className="border-0 rounded-none shadow-none">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center select-none">
                        {driver.photo_url ? (
                          <img src={driver.photo_url} alt={driver.full_name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <User className="w-5 h-5 text-teal-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{driver.full_name}</p>
                        <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200 font-mono text-xs mt-1">
                          {driver.driver_id || '-'}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditModal(driver)}
                      className="select-none"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </div>

                  <MobileCardSection>
                    <MobileCardRow 
                      icon={CreditCard}
                      label="Licencia"
                      value={driver.license_number}
                    />
                    <MobileCardRow 
                      icon={BadgeIcon}
                      label="Categoría"
                      value={`Categoría ${driver.license_category}`}
                    />
                    {driver.license_expiry && (
                      <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-2 text-sm text-slate-500 select-none">
                          <Calendar className="w-4 h-4" />
                          <span>Vencimiento</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-slate-800">
                            {format(parseISO(driver.license_expiry), 'd MMM yyyy', { locale: es })}
                          </p>
                          {alert && (
                            <p className={cn(
                              "text-xs font-medium mt-0.5",
                              alert.type === 'danger' ? 'text-red-600' : 'text-amber-600'
                            )}>
                              {alert.message}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </MobileCardSection>

                  <div className="flex items-center justify-between pt-3 mt-3 border-t">
                    <Badge variant="outline" className={cn("font-medium border select-none", status.color)}>
                      {status.label}
                    </Badge>
                    {allAccidents.filter(a => a.driver_id === driver.id).length > 0 && (
                      <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 text-xs select-none">
                        {allAccidents.filter(a => a.driver_id === driver.id).length} accidente{allAccidents.filter(a => a.driver_id === driver.id).length > 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                </MobileCard>
              );
            })}
          </div>
          </>
        )}
      </Card>
        </TabsContent>

        {/* Advertencias Tab */}
        <TabsContent value="warnings" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setWarningModalOpen(true)} className="bg-red-600 hover:bg-red-700">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Advertencia
            </Button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard title="Total" value={warnings.length} icon={AlertTriangle} color="red" />
            <StatsCard title="Activas" value={warnings.filter(w => w.status === 'active').length} icon={FileText} color="orange" />
            <StatsCard title="Verbales" value={warnings.filter(w => w.severity === 'verbal').length} icon={AlertTriangle} color="blue" />
            <StatsCard title="Escritas" value={warnings.filter(w => w.severity === 'written' || w.severity === 'final' || w.severity === 'suspension').length} icon={FileText} color="yellow" />
          </div>

          <Card className="p-4 border-0 shadow-sm">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Buscar advertencias..."
                  value={warningSearch}
                  onChange={(e) => setWarningSearch(e.target.value)}
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
                          <Badge className={warningStatusConfig[warning.status]?.color}>
                            {warningStatusConfig[warning.status]?.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedWarning(warning);
                              setViewWarningModalOpen(true);
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

          {/* Create Warning Modal */}
          <Dialog open={warningModalOpen} onOpenChange={setWarningModalOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Nueva Advertencia</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Chofer *</Label>
                    <Select value={warningFormData.driver_id} onValueChange={(val) => setWarningFormData({ ...warningFormData, driver_id: val })}>
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
                      value={warningFormData.warning_date}
                      onChange={(e) => setWarningFormData({ ...warningFormData, warning_date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Tipo de Advertencia *</Label>
                    <Select value={warningFormData.warning_type} onValueChange={(val) => setWarningFormData({ ...warningFormData, warning_type: val })}>
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
                    <Select value={warningFormData.severity} onValueChange={(val) => setWarningFormData({ ...warningFormData, severity: val })}>
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
                    value={warningFormData.description}
                    onChange={(e) => setWarningFormData({ ...warningFormData, description: e.target.value })}
                    placeholder="Descripción detallada de la falta..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Acción Tomada</Label>
                  <Textarea
                    value={warningFormData.action_taken}
                    onChange={(e) => setWarningFormData({ ...warningFormData, action_taken: e.target.value })}
                    placeholder="Descripción de la acción correctiva..."
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Emitida Por</Label>
                    <Input
                      value={warningFormData.issued_by}
                      onChange={(e) => setWarningFormData({ ...warningFormData, issued_by: e.target.value })}
                      placeholder="Nombre del supervisor"
                    />
                  </div>
                  <div>
                    <Label>Testigo</Label>
                    <Input
                      value={warningFormData.witness}
                      onChange={(e) => setWarningFormData({ ...warningFormData, witness: e.target.value })}
                      placeholder="Nombre del testigo"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={warningFormData.driver_acknowledgment}
                    onCheckedChange={(checked) => setWarningFormData({ ...warningFormData, driver_acknowledgment: checked })}
                  />
                  <Label>El chofer reconoce la advertencia</Label>
                </div>

                <div>
                  <Label>Comentarios del Chofer</Label>
                  <Textarea
                    value={warningFormData.driver_comments}
                    onChange={(e) => setWarningFormData({ ...warningFormData, driver_comments: e.target.value })}
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
                    {warningFormData.documents.length > 0 && (
                      <div className="space-y-2">
                        {warningFormData.documents.map((doc, idx) => (
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
                      value={warningFormData.follow_up_date}
                      onChange={(e) => setWarningFormData({ ...warningFormData, follow_up_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Estado</Label>
                    <Select value={warningFormData.status} onValueChange={(val) => setWarningFormData({ ...warningFormData, status: val })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(warningStatusConfig).map(([value, { label }]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Notas Adicionales</Label>
                  <Textarea
                    value={warningFormData.notes}
                    onChange={(e) => setWarningFormData({ ...warningFormData, notes: e.target.value })}
                    placeholder="Notas..."
                    rows={2}
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setWarningModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleWarningSubmit}
                    disabled={!warningFormData.driver_id || !warningFormData.description}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Guardar Advertencia
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* View Warning Modal */}
          <Dialog open={viewWarningModalOpen} onOpenChange={setViewWarningModalOpen}>
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
                    <Badge className={warningStatusConfig[selectedWarning.status]?.color}>
                      {warningStatusConfig[selectedWarning.status]?.label}
                    </Badge>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Horarios Tab */}
        <TabsContent value="schedules" className="space-y-4">
          <Input
            placeholder="Buscar por nombre o ID..."
            value={scheduleSearchTerm}
            onChange={(e) => setScheduleSearchTerm(e.target.value)}
            className="max-w-md"
          />

          <div className="grid gap-4">
            {filteredScheduleDrivers.length === 0 ? (
              <Card className="p-8">
                <EmptyState
                  icon={Clock}
                  title="No hay conductores"
                  description="No se encontraron conductores activos"
                />
              </Card>
            ) : (
              filteredScheduleDrivers.map(driver => {
                const vehicle = vehicles.find(v => v.id === driver.assigned_vehicle_id);

                return (
                  <Card key={driver.id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div>
                            <h3 className="font-semibold text-slate-800 text-lg">{driver.full_name}</h3>
                            <p className="text-sm text-slate-500">ID: {driver.driver_id}</p>
                          </div>
                        </div>

                        <div className="space-y-2 text-sm">
                          {driver.shift_start_time && (
                            <div className="flex items-center gap-2 text-slate-700">
                              <Clock className="w-4 h-4 text-teal-600" />
                              <span>
                                {driver.shift_start_time} - {driver.shift_duration} horas
                              </span>
                            </div>
                          )}

                          {driver.shift_days && driver.shift_days.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {driver.shift_days.map(dayIdx => (
                                <Badge key={dayIdx} variant="outline" className="bg-blue-50 text-blue-700">
                                  {DAYS[dayIdx]}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {vehicle && (
                            <div className="flex items-center gap-2 text-slate-700">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span>Vehículo: {vehicle.brand} {vehicle.model} - {vehicle.plate}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <Dialog open={editingScheduleDriver?.id === driver.id} onOpenChange={(open) => {
                        if (!open) handleCloseScheduleDialog();
                      }}>
                        <DialogTrigger asChild>
                          <Button
                            onClick={() => handleOpenScheduleDialog(driver)}
                            className="bg-teal-600 hover:bg-teal-700"
                          >
                            <Edit2 className="w-4 h-4 mr-2" />
                            Editar Horario
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Editar Horario - {driver.full_name}</DialogTitle>
                          </DialogHeader>

                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium text-slate-700">
                                Duración del Turno
                              </label>
                              <Select
                                value={String(scheduleFormData.shift_duration)}
                                onValueChange={(val) =>
                                  setScheduleFormData(prev => ({ ...prev, shift_duration: parseInt(val) }))
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="8">8 horas</SelectItem>
                                  <SelectItem value="12">12 horas</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <label className="text-sm font-medium text-slate-700">
                                Hora de Inicio
                              </label>
                              <Input
                                type="time"
                                value={scheduleFormData.shift_start_time}
                                onChange={(e) =>
                                  setScheduleFormData(prev => ({ ...prev, shift_start_time: e.target.value }))
                                }
                              />
                            </div>

                            <div>
                              <label className="text-sm font-medium text-slate-700 block mb-2">
                                Días de Trabajo
                              </label>
                              <div className="grid grid-cols-2 gap-2">
                                {DAYS.map((day, idx) => (
                                  <Button
                                    key={idx}
                                    variant={scheduleFormData.shift_days.includes(idx) ? 'default' : 'outline'}
                                    onClick={() => toggleDay(idx)}
                                    className={
                                      scheduleFormData.shift_days.includes(idx)
                                        ? 'bg-teal-600 hover:bg-teal-700'
                                        : ''
                                    }
                                    size="sm"
                                  >
                                    {day.substring(0, 3)}
                                  </Button>
                                ))}
                              </div>
                            </div>

                            <div>
                              <label className="text-sm font-medium text-slate-700">
                                Vehículo Asignado
                              </label>
                              <Select
                                value={scheduleFormData.assigned_vehicle_id}
                                onValueChange={(val) =>
                                  setScheduleFormData(prev => ({ ...prev, assigned_vehicle_id: val }))
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecciona vehículo" />
                                </SelectTrigger>
                                <SelectContent>
                                  {vehicles.map(v => (
                                    <SelectItem key={v.id} value={v.id}>
                                      {v.brand} {v.model} - {v.plate}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <Button
                              onClick={handleScheduleSave}
                              className="w-full bg-teal-600 hover:bg-teal-700"
                              disabled={updateScheduleMutation.isPending}
                            >
                              Guardar Cambios
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>
      </Tabs>

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