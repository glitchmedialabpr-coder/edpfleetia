import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Plus, Search, DollarSign, Calendar, Store, Package, Loader2, FileText, Upload, X, TrendingUp } from 'lucide-react';
import EmptyState from '../components/common/EmptyState';
import { format, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';

const categoryLabels = {
  repuestos: 'Repuestos',
  herramientas: 'Herramientas',
  limpieza: 'Limpieza',
  oficina: 'Oficina',
  uniformes: 'Uniformes',
  equipamiento: 'Equipamiento',
  otros: 'Otros'
};

const categoryColors = {
  repuestos: 'bg-red-100 text-red-700 border-red-200',
  herramientas: 'bg-blue-100 text-blue-700 border-blue-200',
  limpieza: 'bg-green-100 text-green-700 border-green-200',
  oficina: 'bg-purple-100 text-purple-700 border-purple-200',
  uniformes: 'bg-amber-100 text-amber-700 border-amber-200',
  equipamiento: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  otros: 'bg-slate-100 text-slate-700 border-slate-200'
};

export default function Purchases() {
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    store: '',
    item: '',
    category: 'otros',
    purpose: '',
    amount: '',
    quantity: 1,
    vehicle_id: '',
    receipt_url: '',
    notes: ''
  });

  const { data: purchases = [], refetch } = useQuery({
    queryKey: ['purchases'],
    queryFn: () => base44.entities.Purchase.list('-date'),
    staleTime: 1000 * 60 * 5
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => base44.entities.Vehicle.list(),
    staleTime: 1000 * 60 * 5
  });

  // Filter purchases
  const filteredPurchases = purchases.filter(purchase => {
    const matchesSearch = purchase.store?.toLowerCase().includes(search.toLowerCase()) ||
                         purchase.item?.toLowerCase().includes(search.toLowerCase()) ||
                         purchase.purpose?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || purchase.category === selectedCategory;
    
    if (selectedMonth) {
      const purchaseDate = parseISO(purchase.date);
      const monthStart = parseISO(selectedMonth + '-01');
      const monthEnd = endOfMonth(monthStart);
      const matchesMonth = purchaseDate >= monthStart && purchaseDate <= monthEnd;
      return matchesSearch && matchesCategory && matchesMonth;
    }
    
    return matchesSearch && matchesCategory;
  });

  // Calculate statistics
  const stats = {
    total: filteredPurchases.reduce((sum, p) => sum + (p.amount || 0), 0),
    count: filteredPurchases.length,
    avgPerPurchase: filteredPurchases.length > 0 
      ? filteredPurchases.reduce((sum, p) => sum + (p.amount || 0), 0) / filteredPurchases.length 
      : 0
  };

  // Stats by category
  const categoryStats = Object.keys(categoryLabels).map(cat => {
    const categoryPurchases = filteredPurchases.filter(p => p.category === cat);
    const total = categoryPurchases.reduce((sum, p) => sum + (p.amount || 0), 0);
    return {
      category: cat,
      label: categoryLabels[cat],
      total,
      count: categoryPurchases.length
    };
  }).filter(s => s.count > 0).sort((a, b) => b.total - a.total);

  const openCreateModal = () => {
    setFormData({
      date: format(new Date(), 'yyyy-MM-dd'),
      store: '',
      item: '',
      category: 'otros',
      purpose: '',
      amount: '',
      quantity: 1,
      vehicle_id: '',
      receipt_url: '',
      notes: ''
    });
    setModalOpen(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, receipt_url: file_url });
    } catch (error) {
      console.error('Error uploading file:', error);
    }
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const vehicle = formData.vehicle_id ? vehicles.find(v => v.id === formData.vehicle_id) : null;
      
      await base44.entities.Purchase.create({
        ...formData,
        vehicle_plate: vehicle?.plate || null,
        amount: parseFloat(formData.amount),
        quantity: parseInt(formData.quantity) || 1
      });

      setModalOpen(false);
      refetch();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">Compras</h1>
          <p className="text-slate-500 mt-1">Registro de todas las compras realizadas</p>
        </div>
        <Button 
          onClick={openCreateModal}
          className="bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-600/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          Registrar Compra
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border-0 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Gastado</p>
              <p className="text-2xl font-bold text-slate-800">${stats.total.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-teal-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4 border-0 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Compras</p>
              <p className="text-2xl font-bold text-slate-800">{stats.count}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4 border-0 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Promedio/Compra</p>
              <p className="text-2xl font-bold text-slate-800">${stats.avgPerPurchase.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 border-0 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Buscar por tienda, artículo o propósito..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Todas las categorías" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {Object.keys(categoryLabels).map(cat => (
                <SelectItem key={cat} value={cat}>
                  {categoryLabels[cat]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          />
        </div>
      </Card>

      {/* Category Stats */}
      {categoryStats.length > 0 && (
        <Card className="p-6 border-0 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-teal-600" />
            Gastos por Categoría
          </h3>
          <div className="space-y-3">
            {categoryStats.map(stat => (
              <div key={stat.category} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{stat.label}</p>
                    <p className="text-sm text-slate-500">{stat.count} compras</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-slate-800">${stat.total.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Purchases Table */}
      <Card className="border-0 shadow-sm overflow-hidden">
        {filteredPurchases.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title={search || selectedCategory !== 'all' ? "No se encontraron compras" : "No hay compras registradas"}
            description={search || selectedCategory !== 'all' ? "Intenta con otros filtros" : "Registra la primera compra"}
            action={!search && selectedCategory === 'all' ? openCreateModal : undefined}
            actionLabel="Registrar Compra"
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tienda</TableHead>
                  <TableHead>Artículo</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Propósito</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Recibo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPurchases.map(purchase => (
                  <TableRow key={purchase.id} className="hover:bg-slate-50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-700">
                          {format(parseISO(purchase.date), 'd MMM yyyy', { locale: es })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Store className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-700">{purchase.store}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-800">{purchase.item}</p>
                        {purchase.vehicle_plate && (
                          <p className="text-xs text-slate-500">Para: {purchase.vehicle_plate}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={categoryColors[purchase.category]}>
                        {categoryLabels[purchase.category]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-slate-700">{purchase.purpose || '-'}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {purchase.quantity} {purchase.quantity === 1 ? 'unidad' : 'unidades'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-teal-700">${purchase.amount.toFixed(2)}</span>
                    </TableCell>
                    <TableCell>
                      {purchase.receipt_url ? (
                        <a
                          href={purchase.receipt_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-teal-600 hover:text-teal-700"
                        >
                          <FileText className="w-4 h-4" />
                        </a>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Create Purchase Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Registrar Compra</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Fecha *</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Tienda / Lugar *</Label>
              <Input
                value={formData.store}
                onChange={(e) => setFormData({ ...formData, store: e.target.value })}
                placeholder="Ej: AutoZone, Home Depot, etc."
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Artículo / Producto *</Label>
              <Input
                value={formData.item}
                onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                placeholder="Ej: Filtro de aceite, Llantas, etc."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categoría *</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(val) => setFormData({ ...formData, category: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(categoryLabels).map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {categoryLabels[cat]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Cantidad</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Monto ($) *</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Para qué se compró / Propósito</Label>
              <Textarea
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                placeholder="Describe para qué se necesitaba esta compra..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Vehículo Relacionado (opcional)</Label>
              <Select 
                value={formData.vehicle_id} 
                onValueChange={(val) => setFormData({ ...formData, vehicle_id: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Ninguno" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>Ninguno</SelectItem>
                  {vehicles.map(v => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.plate} - {v.brand} {v.model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Recibo (opcional)</Label>
              {formData.receipt_url ? (
                <div className="flex items-center gap-2 p-3 border rounded-lg bg-slate-50">
                  <FileText className="w-5 h-5 text-teal-600" />
                  <span className="flex-1 text-sm truncate">Recibo cargado</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setFormData({ ...formData, receipt_url: '' })}
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
                    accept="image/*,application/pdf"
                  />
                </label>
              )}
            </div>

            <div className="space-y-2">
              <Label>Notas Adicionales</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Notas adicionales..."
                rows={2}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setModalOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-teal-600 hover:bg-teal-700"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Registrar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}