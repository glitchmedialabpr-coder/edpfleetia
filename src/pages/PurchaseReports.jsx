import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Download, Filter } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const CATEGORY_COLORS = {
  'materiales_construccion': '#3b82f6',
  'herramientas': '#10b981',
  'pintura': '#f59e0b',
  'limpieza': '#6366f1',
  'electricidad': '#ec4899',
  'fontaneria': '#14b8a6',
  'ferreteria': '#8b5cf6',
  'otros': '#6b7280'
};

const CATEGORY_LABELS = {
  'materiales_construccion': 'Materiales de Construcción',
  'herramientas': 'Herramientas',
  'pintura': 'Pintura',
  'limpieza': 'Limpieza',
  'electricidad': 'Electricidad',
  'fontaneria': 'Fontanería',
  'ferreteria': 'Ferretería',
  'otros': 'Otros'
};

export default function PurchaseReports() {
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    category: 'all',
    store: 'all',
    jobId: 'all'
  });

  const { data: purchases = [] } = useQuery({
    queryKey: ['purchases'],
    queryFn: () => base44.entities.GeneralServicePurchase.list()
  });

  const { data: jobs = [] } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => base44.entities.GeneralServiceJob.list()
  });

  const stores = useMemo(() => [...new Set(purchases.map(p => p.store))].filter(Boolean), [purchases]);

  const filteredPurchases = useMemo(() => {
    return purchases.filter(p => {
      if (filters.startDate && new Date(p.date) < new Date(filters.startDate)) return false;
      if (filters.endDate && new Date(p.date) > new Date(filters.endDate)) return false;
      if (filters.category !== 'all' && p.category !== filters.category) return false;
      if (filters.store !== 'all' && p.store !== filters.store) return false;
      if (filters.jobId !== 'all' && p.job_id !== filters.jobId) return false;
      return true;
    });
  }, [purchases, filters]);

  const totalAmount = useMemo(() => filteredPurchases.reduce((sum, p) => sum + (p.total_amount || 0), 0), [filteredPurchases]);

  const categoryData = useMemo(() => {
    const grouped = {};
    filteredPurchases.forEach(p => {
      grouped[p.category] = (grouped[p.category] || 0) + (p.total_amount || 0);
    });
    return Object.entries(grouped).map(([category, amount]) => ({
      name: CATEGORY_LABELS[category] || category,
      value: amount,
      category: category
    }));
  }, [filteredPurchases]);

  const storeData = useMemo(() => {
    const grouped = {};
    filteredPurchases.forEach(p => {
      grouped[p.store] = (grouped[p.store] || 0) + (p.total_amount || 0);
    });
    return Object.entries(grouped)
      .map(([store, amount]) => ({ name: store, value: amount }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [filteredPurchases]);

  const timelineData = useMemo(() => {
    const grouped = {};
    filteredPurchases.forEach(p => {
      const date = p.date.substring(0, 7); // YYYY-MM
      grouped[date] = (grouped[date] || 0) + (p.total_amount || 0);
    });
    return Object.entries(grouped)
      .sort()
      .map(([date, amount]) => ({ date, amount }));
  }, [filteredPurchases]);

  const exportPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    doc.setFontSize(20);
    doc.text('Reporte de Compras y Gastos', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    doc.setFontSize(10);
    doc.text(`Fecha del reporte: ${new Date().toLocaleDateString('es-ES')}`, 20, yPosition);
    yPosition += 10;

    // Summary stats
    doc.setFontSize(12);
    doc.text('Resumen General', 20, yPosition);
    yPosition += 8;
    doc.setFontSize(10);
    doc.text(`Total de compras: $${totalAmount.toFixed(2)}`, 25, yPosition);
    yPosition += 6;
    doc.text(`Número de compras: ${filteredPurchases.length}`, 25, yPosition);
    yPosition += 12;

    // Table
    const tableData = filteredPurchases.map(p => [
      p.date,
      p.store,
      p.item,
      CATEGORY_LABELS[p.category] || p.category,
      p.quantity || 1,
      `$${(p.total_amount || 0).toFixed(2)}`
    ]);

    doc.autoTable({
      startY: yPosition,
      head: [['Fecha', 'Tienda', 'Artículo', 'Categoría', 'Cantidad', 'Monto']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 9 },
      columnStyles: {
        5: { halign: 'right' }
      }
    });

    doc.save('reporte-compras.pdf');
  };

  const exportCSV = () => {
    const headers = ['Fecha', 'Tienda', 'Artículo', 'Categoría', 'Cantidad', 'Monto Unitario', 'Monto Total', 'Trabajo', 'Comprado por'];
    const rows = filteredPurchases.map(p => [
      p.date,
      p.store,
      p.item,
      CATEGORY_LABELS[p.category] || p.category,
      p.quantity || 1,
      p.unit_cost || 0,
      p.total_amount || 0,
      p.job_title || '',
      p.purchased_by || ''
    ]);

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reporte-compras.csv';
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800">Reportes de Compras</h1>
        <div className="flex gap-2">
          <Button onClick={exportPDF} className="gap-2 bg-red-600 hover:bg-red-700">
            <Download className="w-4 h-4" /> PDF
          </Button>
          <Button onClick={exportCSV} className="gap-2 bg-green-600 hover:bg-green-700">
            <Download className="w-4 h-4" /> CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" /> Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Fecha Inicio</label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Fecha Fin</label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Categoría</label>
              <Select value={filters.category} onValueChange={(val) => setFilters({ ...filters, category: val })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Proveedor</label>
              <Select value={filters.store} onValueChange={(val) => setFilters({ ...filters, store: val })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {stores.map(store => (
                    <SelectItem key={store} value={store}>{store}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Trabajo</label>
              <Select value={filters.jobId} onValueChange={(val) => setFilters({ ...filters, jobId: val })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {jobs.map(job => (
                    <SelectItem key={job.id} value={job.id}>{job.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <p className="text-sm text-blue-600 font-medium">Total Gastado</p>
            <p className="text-3xl font-bold text-blue-900 mt-2">${totalAmount.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <p className="text-sm text-green-600 font-medium">Número de Compras</p>
            <p className="text-3xl font-bold text-green-900 mt-2">{filteredPurchases.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <p className="text-sm text-orange-600 font-medium">Promedio por Compra</p>
            <p className="text-3xl font-bold text-orange-900 mt-2">${(totalAmount / (filteredPurchases.length || 1)).toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Pie Chart - Categories */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Gastos por Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.category] || '#8b5cf6'} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bar Chart - Top Stores */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Top 10 Proveedores</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={storeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} interval={0} tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Timeline Chart */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Gastos por Mes</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
              <Legend />
              <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} name="Monto" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Table */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Detalle de Compras</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left p-3 font-semibold text-slate-700">Fecha</th>
                  <th className="text-left p-3 font-semibold text-slate-700">Tienda</th>
                  <th className="text-left p-3 font-semibold text-slate-700">Artículo</th>
                  <th className="text-left p-3 font-semibold text-slate-700">Categoría</th>
                  <th className="text-right p-3 font-semibold text-slate-700">Cantidad</th>
                  <th className="text-right p-3 font-semibold text-slate-700">Monto</th>
                </tr>
              </thead>
              <tbody>
                {filteredPurchases.map((purchase) => (
                  <tr key={purchase.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-3 text-slate-600">{purchase.date}</td>
                    <td className="p-3 text-slate-600">{purchase.store}</td>
                    <td className="p-3 text-slate-600">{purchase.item}</td>
                    <td className="p-3">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        {CATEGORY_LABELS[purchase.category] || purchase.category}
                      </span>
                    </td>
                    <td className="p-3 text-right text-slate-600">{purchase.quantity || 1}</td>
                    <td className="p-3 text-right font-semibold text-slate-800">${(purchase.total_amount || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}