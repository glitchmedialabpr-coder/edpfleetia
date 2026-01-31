import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  Wrench,
  MapPin,
  Calendar,
  User,
  CheckCircle,
  Clock,
  XCircle,
  Edit,
  Trash2,
  Image as ImageIcon,
  DollarSign,
  AlertCircle,
  ShoppingCart,
  Store,
  Package,
  FileText,
  Download,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import EmptyState from '@/components/common/EmptyState';

const jobTypeConfig = {
  construccion: { label: 'Construcción', icon: Wrench, color: 'bg-orange-100 text-orange-700' },
  pintura: { label: 'Pintura', icon: Wrench, color: 'bg-purple-100 text-purple-700' },
  limpieza: { label: 'Limpieza', icon: Wrench, color: 'bg-blue-100 text-blue-700' },
  electricidad: { label: 'Electricidad', icon: Wrench, color: 'bg-yellow-100 text-yellow-700' },
  fontaneria: { label: 'Fontanería', icon: Wrench, color: 'bg-cyan-100 text-cyan-700' },
  jardineria: { label: 'Jardinería', icon: Wrench, color: 'bg-green-100 text-green-700' },
  reparacion: { label: 'Reparación', icon: Wrench, color: 'bg-red-100 text-red-700' },
  otro: { label: 'Otro', icon: Wrench, color: 'bg-gray-100 text-gray-700' }
};

const statusConfig = {
  pendiente: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700' },
  en_progreso: { label: 'En Progreso', color: 'bg-blue-100 text-blue-700' },
  completado: { label: 'Completado', color: 'bg-green-100 text-green-700' },
  cancelado: { label: 'Cancelado', color: 'bg-red-100 text-red-700' }
};

const priorityConfig = {
  baja: { label: 'Baja', color: 'bg-slate-100 text-slate-700' },
  media: { label: 'Media', color: 'bg-blue-100 text-blue-700' },
  alta: { label: 'Alta', color: 'bg-orange-100 text-orange-700' },
  urgente: { label: 'Urgente', color: 'bg-red-100 text-red-700' }
};

const categoryConfig = {
  materiales_construccion: { label: 'Materiales de Construcción', color: 'bg-orange-100 text-orange-700' },
  herramientas: { label: 'Herramientas', color: 'bg-blue-100 text-blue-700' },
  pintura: { label: 'Pintura', color: 'bg-purple-100 text-purple-700' },
  limpieza: { label: 'Limpieza', color: 'bg-green-100 text-green-700' },
  electricidad: { label: 'Electricidad', color: 'bg-yellow-100 text-yellow-700' },
  fontaneria: { label: 'Fontanería', color: 'bg-cyan-100 text-cyan-700' },
  ferreteria: { label: 'Ferretería', color: 'bg-red-100 text-red-700' },
  otros: { label: 'Otros', color: 'bg-gray-100 text-gray-700' }
};

export default function GeneralServiceJobs() {
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [activeTab, setActiveTab] = useState('pendiente');
  const [mainTab, setMainTab] = useState('jobs');
  const [purchaseModal, setPurchaseModal] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterJob, setFilterJob] = useState('all');
  const [purchasedByType, setPurchasedByType] = useState('driver');
  const [purchaseFormData, setPurchaseFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    store: '',
    items: [{ item: '', category: 'otros', quantity: 1, unit_cost: '', total_amount: '' }],
    job_id: '',
    job_title: '',
    purchased_by: '',
    receipt_url: '',
    notes: ''
  });
  const [formData, setFormData] = useState({
    job_type: 'limpieza',
    title: '',
    description: '',
    location: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    assigned_driver_id: '',
    assigned_driver_name: '',
    status: 'pendiente',
    priority: 'media',
    materials_needed: '',
    estimated_cost: '',
    notes: ''
  });

  const queryClient = useQueryClient();

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['general-service-jobs'],
    queryFn: () => base44.entities.GeneralServiceJob.list('-created_date', 200),
    staleTime: 1000 * 60 * 5
  });

  const { data: drivers = [] } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => base44.entities.Driver.list(),
    staleTime: 1000 * 60 * 5
  });

  const { data: purchases = [] } = useQuery({
    queryKey: ['general-service-purchases'],
    queryFn: () => base44.entities.GeneralServicePurchase.list('-date', 200),
    staleTime: 1000 * 60 * 5
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => base44.entities.Supplier.list('-created_date', 200),
    staleTime: 1000 * 60 * 5
  });

  const createJobMutation = useMutation({
    mutationFn: (data) => base44.entities.GeneralServiceJob.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['general-service-jobs']);
      setShowModal(false);
      resetForm();
      toast.success('Trabajo creado exitosamente');
    },
    onError: (error) => {
      console.error('Error:', error);
      toast.error('Error al crear trabajo');
    }
  });

  const updateJobMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.GeneralServiceJob.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['general-service-jobs']);
      setShowModal(false);
      resetForm();
      toast.success('Trabajo actualizado');
    },
    onError: (error) => {
      console.error('Error:', error);
      toast.error('Error al actualizar trabajo');
    }
  });

  const deleteJobMutation = useMutation({
    mutationFn: (id) => base44.entities.GeneralServiceJob.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['general-service-jobs']);
      toast.success('Trabajo eliminado');
    },
    onError: (error) => {
      console.error('Error:', error);
      toast.error('Error al eliminar trabajo');
    }
  });

  const startJobMutation = useMutation({
    mutationFn: (id) => base44.entities.GeneralServiceJob.update(id, {
      status: 'en_progreso',
      actual_start_date: new Date().toISOString()
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['general-service-jobs']);
      toast.success('Trabajo iniciado');
    },
    onError: (error) => {
      console.error('Error:', error);
      toast.error('Error al iniciar trabajo');
    }
  });

  const completeJobMutation = useMutation({
    mutationFn: ({ id, completion_notes, actual_cost }) => 
      base44.entities.GeneralServiceJob.update(id, {
        status: 'completado',
        actual_end_date: new Date().toISOString(),
        completion_notes,
        actual_cost
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['general-service-jobs']);
      toast.success('Trabajo completado');
    },
    onError: (error) => {
      console.error('Error:', error);
      toast.error('Error al completar trabajo');
    }
  });

  const createPurchaseMutation = useMutation({
    mutationFn: (data) => base44.entities.GeneralServicePurchase.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['general-service-purchases']);
      setPurchaseModal(false);
      resetPurchaseForm();
      toast.success('Compra registrada exitosamente');
    },
    onError: (error) => {
      console.error('Error:', error);
      toast.error('Error al registrar compra');
    }
  });

  const updatePurchaseMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.GeneralServicePurchase.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['general-service-purchases']);
      setPurchaseModal(false);
      resetPurchaseForm();
      toast.success('Compra actualizada');
    },
    onError: (error) => {
      console.error('Error:', error);
      toast.error('Error al actualizar compra');
    }
  });

  const deletePurchaseMutation = useMutation({
    mutationFn: (id) => base44.entities.GeneralServicePurchase.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['general-service-purchases']);
      toast.success('Compra eliminada');
    },
    onError: (error) => {
      console.error('Error:', error);
      toast.error('Error al eliminar compra');
    }
  });

  const resetForm = () => {
    setFormData({
      job_type: 'limpieza',
      title: '',
      description: '',
      location: '',
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      assigned_driver_id: '',
      assigned_driver_name: '',
      status: 'pendiente',
      priority: 'media',
      materials_needed: '',
      estimated_cost: '',
      notes: ''
    });
    setEditingJob(null);
  };

  const resetPurchaseForm = () => {
    setPurchaseFormData({
      date: new Date().toISOString().split('T')[0],
      store: '',
      items: [{ item: '', category: 'otros', quantity: 1, unit_cost: '', total_amount: '' }],
      job_id: '',
      job_title: '',
      purchased_by: '',
      receipt_url: '',
      notes: ''
    });
    setEditingPurchase(null);
    setPurchasedByType('driver');
  };

  const handlePurchaseSubmit = (e) => {
    e.preventDefault();
    
    if (!purchaseFormData.store || !purchaseFormData.items.length || !purchaseFormData.items.some(it => it.item)) {
      toast.error('Complete los campos requeridos');
      return;
    }

    const selectedJob = jobs.find(j => j.id === purchaseFormData.job_id);
    
    const purchasesToCreate = purchaseFormData.items
      .filter(it => it.item)
      .map(it => ({
        date: purchaseFormData.date,
        store: purchaseFormData.store,
        item: it.item,
        category: it.category,
        quantity: parseFloat(it.quantity) || 1,
        unit_cost: it.unit_cost ? parseFloat(it.unit_cost) : 0,
        total_amount: parseFloat(it.total_amount) || 0,
        job_id: purchaseFormData.job_id,
        job_title: selectedJob?.title || '',
        purchased_by: purchaseFormData.purchased_by,
        receipt_url: purchaseFormData.receipt_url,
        notes: purchaseFormData.notes
      }));

    if (editingPurchase) {
      updatePurchaseMutation.mutate({ id: editingPurchase.id, data: purchasesToCreate[0] });
    } else {
      purchasesToCreate.forEach(purchase => createPurchaseMutation.mutate(purchase));
    }
  };

  const handleEditPurchase = (purchase) => {
    setEditingPurchase(purchase);
    const driver = drivers.find(d => d.full_name === purchase.purchased_by);
    setPurchaseFormData({
      date: purchase.date,
      store: purchase.store,
      items: [{ 
        item: purchase.item,
        category: purchase.category,
        quantity: purchase.quantity || 1,
        unit_cost: purchase.unit_cost || '',
        total_amount: purchase.total_amount
      }],
      job_id: purchase.job_id || '',
      job_title: purchase.job_title || '',
      purchased_by: purchase.purchased_by || '',
      receipt_url: purchase.receipt_url || '',
      notes: purchase.notes || ''
    });
    setPurchasedByType(driver ? 'driver' : 'custom');
    setPurchaseModal(true);
  };

  const handleDeletePurchase = (id) => {
    if (confirm('¿Está seguro de eliminar esta compra?')) {
      deletePurchaseMutation.mutate(id);
    }
  };

  const handleFileUploadPurchase = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setPurchaseFormData({...purchaseFormData, receipt_url: file_url});
      toast.success('Recibo cargado');
    } catch (error) {
      toast.error('Error al cargar el archivo');
    }
  };

  const addPurchaseProduct = () => {
    setPurchaseFormData({
      ...purchaseFormData,
      items: [...purchaseFormData.items, { item: '', category: 'otros', quantity: 1, unit_cost: '', total_amount: '' }]
    });
  };

  const removePurchaseProduct = (index) => {
    const updatedItems = purchaseFormData.items.filter((_, i) => i !== index);
    setPurchaseFormData({ ...purchaseFormData, items: updatedItems });
  };

  const updatePurchaseProduct = (index, field, value) => {
    const updatedItems = [...purchaseFormData.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    if (field === 'quantity' || field === 'unit_cost') {
      const qty = parseFloat(updatedItems[index].quantity) || 0;
      const unit = parseFloat(updatedItems[index].unit_cost) || 0;
      if (qty > 0 && unit > 0) {
        updatedItems[index].total_amount = (qty * unit).toFixed(2);
      }
    }
    
    setPurchaseFormData({ ...purchaseFormData, items: updatedItems });
  };

  const filteredPurchases = purchases.filter(purchase => {
    const matchesCategory = filterCategory === 'all' || purchase.category === filterCategory;
    const matchesJob = filterJob === 'all' || purchase.job_id === filterJob;
    return matchesCategory && matchesJob;
  });

  const totalSpent = filteredPurchases.reduce((sum, p) => sum + (p.total_amount || 0), 0);
  const totalItems = filteredPurchases.length;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.location) {
      toast.error('Complete los campos requeridos');
      return;
    }

    const selectedDriver = drivers.find(d => d.id === formData.assigned_driver_id);
    const dataToSave = {
      ...formData,
      assigned_driver_name: selectedDriver?.full_name || '',
      estimated_cost: formData.estimated_cost ? parseFloat(formData.estimated_cost) : 0
    };

    if (editingJob) {
      updateJobMutation.mutate({ id: editingJob.id, data: dataToSave });
    } else {
      createJobMutation.mutate(dataToSave);
    }
  };

  const handleEdit = (job) => {
    setEditingJob(job);
    setFormData({
      job_type: job.job_type,
      title: job.title,
      description: job.description || '',
      location: job.location,
      start_date: job.start_date,
      end_date: job.end_date || '',
      assigned_driver_id: job.assigned_driver_id || '',
      assigned_driver_name: job.assigned_driver_name || '',
      status: job.status,
      priority: job.priority,
      materials_needed: job.materials_needed || '',
      estimated_cost: job.estimated_cost || '',
      notes: job.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (confirm('¿Está seguro de eliminar este trabajo?')) {
      deleteJobMutation.mutate(id);
    }
  };

  const handleStartJob = (id) => {
    startJobMutation.mutate(id);
  };

  const handleCompleteJob = (id) => {
    const completion_notes = prompt('Notas de finalización (opcional):');
    const actual_cost = prompt('Costo real del trabajo:');
    completeJobMutation.mutate({ 
      id, 
      completion_notes: completion_notes || '', 
      actual_cost: actual_cost ? parseFloat(actual_cost) : 0 
    });
  };

  const filteredJobs = activeTab === 'todos' 
    ? jobs 
    : jobs.filter(job => job.status === activeTab);

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">Trabajos de Servicio General</h1>
          <p className="text-slate-500 mt-1">Gestiona trabajos de construcción, pintura, limpieza y más</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="bg-teal-600 hover:bg-teal-700">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Trabajo
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="todos">Todos ({jobs.length})</TabsTrigger>
          <TabsTrigger value="pendiente">
            Pendientes ({jobs.filter(j => j.status === 'pendiente').length})
          </TabsTrigger>
          <TabsTrigger value="en_progreso">
            En Progreso ({jobs.filter(j => j.status === 'en_progreso').length})
          </TabsTrigger>
          <TabsTrigger value="completado">
            Completados ({jobs.filter(j => j.status === 'completado').length})
          </TabsTrigger>
          <TabsTrigger value="cancelado">
            Cancelados ({jobs.filter(j => j.status === 'cancelado').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredJobs.length === 0 ? (
            <EmptyState
              icon={Wrench}
              title="No hay trabajos"
              description={`No hay trabajos ${activeTab === 'todos' ? '' : 'con estado: ' + statusConfig[activeTab]?.label}`}
            />
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredJobs.map(job => (
                <Card key={job.id} className="p-5 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <Badge className={jobTypeConfig[job.job_type]?.color}>
                        {jobTypeConfig[job.job_type]?.label}
                      </Badge>
                      <Badge className={priorityConfig[job.priority]?.color}>
                        {priorityConfig[job.priority]?.label}
                      </Badge>
                    </div>
                    <Badge className={statusConfig[job.status]?.color}>
                      {statusConfig[job.status]?.label}
                    </Badge>
                  </div>

                  <h3 className="font-semibold text-slate-800 mb-2">{job.title}</h3>
                  {job.description && (
                    <p className="text-sm text-slate-600 mb-3 line-clamp-2">{job.description}</p>
                  )}

                  <div className="space-y-2 text-sm text-slate-600 mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span>{job.start_date}</span>
                      {job.end_date && <span>→ {job.end_date}</span>}
                    </div>
                    {job.assigned_driver_name && (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-400" />
                        <span>{job.assigned_driver_name}</span>
                      </div>
                    )}
                    {job.estimated_cost > 0 && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-slate-400" />
                        <span>${job.estimated_cost.toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {job.status === 'pendiente' && (
                      <Button
                        size="sm"
                        onClick={() => handleStartJob(job.id)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                      >
                        <Clock className="w-4 h-4 mr-1" />
                        Iniciar
                      </Button>
                    )}
                    {job.status === 'en_progreso' && (
                      <Button
                        size="sm"
                        onClick={() => handleCompleteJob(job.id)}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Completar
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(job)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(job.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingJob ? 'Editar Trabajo' : 'Nuevo Trabajo de Servicio General'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">
                  Tipo de Servicio *
                </label>
                <Select value={formData.job_type} onValueChange={(val) => setFormData({...formData, job_type: val})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(jobTypeConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>{config.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">
                  Prioridad
                </label>
                <Select value={formData.priority} onValueChange={(val) => setFormData({...formData, priority: val})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(priorityConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>{config.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">
                Título del Trabajo *
              </label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="ej. Pintar edificio principal"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">
                Descripción
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Descripción detallada del trabajo..."
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">
                Ubicación/Edificio *
              </label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                placeholder="ej. Edificio A, Segundo Piso"
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">
                  Fecha de Inicio *
                </label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">
                  Fecha de Fin Estimada
                </label>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">
                Empleado Asignado
              </label>
              <Select 
                value={formData.assigned_driver_id} 
                onValueChange={(val) => setFormData({...formData, assigned_driver_id: val})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar empleado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>Sin asignar</SelectItem>
                  {drivers.map(driver => (
                    <SelectItem key={driver.id} value={driver.id}>
                      {driver.full_name} ({driver.driver_id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">
                Materiales Necesarios
              </label>
              <Textarea
                value={formData.materials_needed}
                onChange={(e) => setFormData({...formData, materials_needed: e.target.value})}
                placeholder="Lista de materiales..."
                rows={2}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">
                Costo Estimado
              </label>
              <Input
                type="number"
                step="0.01"
                value={formData.estimated_cost}
                onChange={(e) => setFormData({...formData, estimated_cost: e.target.value})}
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">
                Notas Adicionales
              </label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Notas..."
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => {
                setShowModal(false);
                resetForm();
              }}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-teal-600 hover:bg-teal-700">
                {editingJob ? 'Actualizar' : 'Crear'} Trabajo
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}