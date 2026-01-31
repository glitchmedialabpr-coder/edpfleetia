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
import {
  Plus,
  ShoppingCart,
  DollarSign,
  Calendar,
  Store,
  Package,
  FileText,
  Edit,
  Trash2,
  Download,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import EmptyState from '@/components/common/EmptyState';

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

export default function GeneralServicePurchases() {
  const [showModal, setShowModal] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterJob, setFilterJob] = useState('all');
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    store: '',
    items: [{ item: '', category: 'otros', quantity: 1, unit_cost: '', total_amount: '' }],
    job_id: '',
    job_title: '',
    purchased_by: '',
    receipt_url: '',
    notes: ''
  });
  const [totalPurchaseAmount, setTotalPurchaseAmount] = useState('');

  const queryClient = useQueryClient();

  const { data: purchases = [], isLoading } = useQuery({
    queryKey: ['general-service-purchases'],
    queryFn: () => base44.entities.GeneralServicePurchase.list('-date', 200),
    staleTime: 1000 * 60 * 5
  });

  const { data: jobs = [] } = useQuery({
    queryKey: ['general-service-jobs'],
    queryFn: () => base44.entities.GeneralServiceJob.list('-created_date', 200),
    staleTime: 1000 * 60 * 5
  });

  const createPurchaseMutation = useMutation({
    mutationFn: (data) => base44.entities.GeneralServicePurchase.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['general-service-purchases']);
      setShowModal(false);
      resetForm();
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
      setShowModal(false);
      resetForm();
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
      date: new Date().toISOString().split('T')[0],
      store: '',
      items: [{ item: '', category: 'otros', quantity: 1, unit_cost: '', total_amount: '' }],
      job_id: '',
      job_title: '',
      purchased_by: '',
      receipt_url: '',
      notes: ''
    });
    setTotalPurchaseAmount('');
    setEditingPurchase(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.store || !formData.items.length || !formData.items.some(it => it.item) || !totalPurchaseAmount) {
      toast.error('Complete los campos requeridos');
      return;
    }

    const selectedJob = jobs.find(j => j.id === formData.job_id);
    
    // Crear un registro por cada producto
    const purchasesToCreate = formData.items
      .filter(it => it.item)
      .map(it => ({
        date: formData.date,
        store: formData.store,
        item: it.item,
        category: it.category,
        quantity: parseFloat(it.quantity) || 1,
        unit_cost: it.unit_cost ? parseFloat(it.unit_cost) : 0,
        total_amount: parseFloat(it.total_amount) || 0,
        job_id: formData.job_id,
        job_title: selectedJob?.title || '',
        purchased_by: formData.purchased_by,
        receipt_url: formData.receipt_url,
        notes: formData.notes
      }));

    if (editingPurchase) {
      updatePurchaseMutation.mutate({ id: editingPurchase.id, data: purchasesToCreate[0] });
    } else {
      purchasesToCreate.forEach(purchase => createPurchaseMutation.mutate(purchase));
    }
  };

  const handleEdit = (purchase) => {
    setEditingPurchase(purchase);
    setFormData({
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
    setTotalPurchaseAmount(purchase.total_amount || '');
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (confirm('¿Está seguro de eliminar esta compra?')) {
      deletePurchaseMutation.mutate(id);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({...formData, receipt_url: file_url});
      toast.success('Recibo cargado');
    } catch (error) {
      toast.error('Error al cargar el archivo');
    }
  };

  const addProduct = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { item: '', category: 'otros', quantity: 1, unit_cost: '', total_amount: '' }]
    });
  };

  const removeProduct = (index) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: updatedItems });
  };

  const updateProduct = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Auto-calculate total if quantity and unit_cost are provided
    if (field === 'quantity' || field === 'unit_cost') {
      const qty = parseFloat(updatedItems[index].quantity) || 0;
      const unit = parseFloat(updatedItems[index].unit_cost) || 0;
      if (qty > 0 && unit > 0) {
        updatedItems[index].total_amount = (qty * unit).toFixed(2);
      }
    }
    
    setFormData({ ...formData, items: updatedItems });
  };

  const calculateTotalPurchase = () => {
    const total = formData.items.reduce((sum, it) => sum + (parseFloat(it.total_amount) || 0), 0);
    setTotalPurchaseAmount(total.toFixed(2));
  };

  const filteredPurchases = purchases.filter(purchase => {
    const matchesCategory = filterCategory === 'all' || purchase.category === filterCategory;
    const matchesJob = filterJob === 'all' || purchase.job_id === filterJob;
    return matchesCategory && matchesJob;
  });

  const totalSpent = filteredPurchases.reduce((sum, p) => sum + (p.total_amount || 0), 0);
  const totalItems = filteredPurchases.length;

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">Compras de Servicio General</h1>
          <p className="text-slate-500 mt-1">Registra y gestiona compras de materiales y herramientas</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="bg-teal-600 hover:bg-teal-700">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Compra
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 border-l-4 border-teal-500">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-teal-100 rounded-lg">
              <ShoppingCart className="w-5 h-5 text-teal-600" />
            </div>
            <div className="text-2xl font-bold text-teal-600">{totalItems}</div>
          </div>
          <div className="text-sm text-slate-500">Total Compras</div>
        </Card>

        <Card className="p-5 border-l-4 border-green-500">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-600">${totalSpent.toFixed(2)}</div>
          </div>
          <div className="text-sm text-slate-500">Total Gastado</div>
        </Card>

        <Card className="p-5 border-l-4 border-blue-500">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-600">
              ${totalItems > 0 ? (totalSpent / totalItems).toFixed(2) : '0.00'}
            </div>
          </div>
          <div className="text-sm text-slate-500">Promedio por Compra</div>
        </Card>

        <Card className="p-5 border-l-4 border-purple-500">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Package className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-600">
              {Object.keys(categoryConfig).length}
            </div>
          </div>
          <div className="text-sm text-slate-500">Categorías</div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Categoría</label>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las Categorías</SelectItem>
                {Object.entries(categoryConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs text-slate-500 mb-1 block">Trabajo Asociado</label>
            <Select value={filterJob} onValueChange={setFilterJob}>
              <SelectTrigger>
                <SelectValue placeholder="Trabajo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Trabajos</SelectItem>
                {jobs.map(job => (
                  <SelectItem key={job.id} value={job.id}>{job.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Purchases List */}
      {filteredPurchases.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="No hay compras registradas"
          description="Comienza a registrar compras para tus trabajos de servicio general"
        />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPurchases.map(purchase => (
            <Card key={purchase.id} className="p-5 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <Badge className={categoryConfig[purchase.category]?.color}>
                  {categoryConfig[purchase.category]?.label}
                </Badge>
                <div className="text-sm text-slate-500">{purchase.date}</div>
              </div>

              <h3 className="font-semibold text-slate-800 mb-1">{purchase.item}</h3>
              <div className="text-sm text-slate-500 mb-3">{purchase.store}</div>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-slate-600">Cantidad:</span>
                  <span className="font-medium">{purchase.quantity}</span>
                </div>
                {purchase.unit_cost > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Precio Unitario:</span>
                    <span className="font-medium">${purchase.unit_cost.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-2">
                  <span className="text-slate-600 font-medium">Total:</span>
                  <span className="font-bold text-green-600">${purchase.total_amount.toFixed(2)}</span>
                </div>
              </div>

              {purchase.job_title && (
                <div className="text-xs text-slate-500 mb-3 p-2 bg-slate-50 rounded">
                  <strong>Trabajo:</strong> {purchase.job_title}
                </div>
              )}

              {purchase.receipt_url && (
                <a
                  href={purchase.receipt_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-blue-600 hover:underline mb-3"
                >
                  <FileText className="w-3 h-3" />
                  Ver Recibo
                </a>
              )}

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(purchase)}
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(purchase.id)}
                  className="text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPurchase ? 'Editar Compra' : 'Nueva Compra de Servicio General'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">
                  Fecha *
                </label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">
                  Categoría
                </label>
                <Select value={formData.category} onValueChange={(val) => setFormData({...formData, category: val})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>{config.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">
                Tienda/Proveedor *
              </label>
              <Input
                value={formData.store}
                onChange={(e) => setFormData({...formData, store: e.target.value})}
                placeholder="ej. Home Depot"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Productos *
              </label>
              <div className="space-y-3 mb-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
                {formData.items.map((product, idx) => (
                  <div key={idx} className="space-y-3 pb-3 border-b last:border-b-0">
                    <div className="grid md:grid-cols-2 gap-3">
                      <Input
                        placeholder="Nombre del producto"
                        value={product.item}
                        onChange={(e) => updateProduct(idx, 'item', e.target.value)}
                        required
                      />
                      <Select 
                        value={product.category} 
                        onValueChange={(val) => updateProduct(idx, 'category', val)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(categoryConfig).map(([key, config]) => (
                            <SelectItem key={key} value={key}>{config.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid md:grid-cols-3 gap-3">
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Cantidad"
                        value={product.quantity}
                        onChange={(e) => updateProduct(idx, 'quantity', e.target.value)}
                      />
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Costo unitario"
                        value={product.unit_cost}
                        onChange={(e) => updateProduct(idx, 'unit_cost', e.target.value)}
                      />
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Total"
                        value={product.total_amount}
                        onChange={(e) => updateProduct(idx, 'total_amount', e.target.value)}
                        readOnly
                        className="bg-slate-100"
                      />
                    </div>

                    {formData.items.length > 1 && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => removeProduct(idx)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-3 h-3 mr-1" /> Quitar
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={addProduct}
                className="w-full"
              >
                <Plus className="w-3 h-3 mr-1" /> Agregar Producto
              </Button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="text-sm text-blue-700">
                <strong>Total de la compra:</strong>
                <div className="text-2xl font-bold text-blue-600 mt-1">
                  ${formData.items.reduce((sum, it) => sum + (parseFloat(it.total_amount) || 0), 0).toFixed(2)}
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">
                Trabajo Asociado
              </label>
              <Select 
                value={formData.job_id} 
                onValueChange={(val) => setFormData({...formData, job_id: val})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar trabajo (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>Sin trabajo asociado</SelectItem>
                  {jobs.map(job => (
                    <SelectItem key={job.id} value={job.id}>{job.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">
                Comprado por
              </label>
              <Input
                value={formData.purchased_by}
                onChange={(e) => setFormData({...formData, purchased_by: e.target.value})}
                placeholder="Nombre de quien compró"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">
                Recibo
              </label>
              <Input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileUpload}
              />
              {formData.receipt_url && (
                <a
                  href={formData.receipt_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline mt-1 flex items-center gap-1"
                >
                  <FileText className="w-4 h-4" />
                  Ver recibo cargado
                </a>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">
                Notas
              </label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Notas adicionales..."
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
                {editingPurchase ? 'Actualizar' : 'Registrar'} Compra
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}