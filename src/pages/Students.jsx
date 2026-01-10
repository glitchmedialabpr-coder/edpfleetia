import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
  GraduationCap,
  Building2,
  Pencil,
  Trash2,
  Loader2
} from 'lucide-react';
import EmptyState from '../components/common/EmptyState';

export default function Students() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    student_id: '',
    phone: '',
    email: '',
    housing_id: '',
    housing_name: '',
    status: 'active'
  });

  const { data: students = [], refetch } = useQuery({
    queryKey: ['students'],
    queryFn: () => base44.entities.Student.list('-created_date')
  });

  const { data: housings = [] } = useQuery({
    queryKey: ['housings'],
    queryFn: () => base44.entities.Housing.list()
  });

  const filteredStudents = students.filter(s => 
    s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.student_id?.toLowerCase().includes(search.toLowerCase())
  );

  const openCreateModal = () => {
    setEditingStudent(null);
    setFormData({
      full_name: '',
      student_id: '',
      phone: '',
      email: '',
      housing_id: '',
      housing_name: '',
      status: 'active'
    });
    setModalOpen(true);
  };

  const openEditModal = (student) => {
    setEditingStudent(student);
    setFormData({
      full_name: student.full_name || '',
      student_id: student.student_id || '',
      phone: student.phone || '',
      email: student.email || '',
      housing_id: student.housing_id || '',
      housing_name: student.housing_name || '',
      status: student.status || 'active'
    });
    setModalOpen(true);
  };

  const handleHousingChange = (housingId) => {
    const housing = housings.find(h => h.id === housingId);
    setFormData({
      ...formData,
      housing_id: housingId,
      housing_name: housing?.name || ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (editingStudent) {
      await base44.entities.Student.update(editingStudent.id, formData);
    } else {
      await base44.entities.Student.create(formData);
    }

    setModalOpen(false);
    refetch();
    setLoading(false);
  };

  const handleDelete = async (student) => {
    if (confirm(`¿Eliminar a ${student.full_name}?`)) {
      await base44.entities.Student.delete(student.id);
      refetch();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">Estudiantes</h1>
          <p className="text-slate-500 mt-1">Gestiona la información de los estudiantes</p>
        </div>
        <Button 
          onClick={openCreateModal}
          className="bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-600/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          Agregar Estudiante
        </Button>
      </div>

      {/* Search */}
      <Card className="p-4 border-0 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Buscar por nombre o ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Table */}
      <Card className="border-0 shadow-sm overflow-hidden">
        {filteredStudents.length === 0 ? (
          <EmptyState
            icon={GraduationCap}
            title={search ? "No se encontraron estudiantes" : "No hay estudiantes registrados"}
            description={search ? "Intenta con otra búsqueda" : "Agrega el primer estudiante para comenzar"}
            action={!search ? openCreateModal : undefined}
            actionLabel="Agregar Estudiante"
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Estudiante</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Hospedaje</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map(student => (
                  <TableRow key={student.id} className="hover:bg-slate-50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="font-semibold text-purple-600">
                            {student.full_name?.charAt(0) || '?'}
                          </span>
                        </div>
                        <span className="font-medium text-slate-800">{student.full_name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600">{student.student_id}</TableCell>
                    <TableCell>
                      {student.housing_name ? (
                        <div className="flex items-center gap-1 text-slate-600">
                          <Building2 className="w-4 h-4 text-slate-400" />
                          {student.housing_name}
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {student.phone && <p className="text-slate-600">{student.phone}</p>}
                        {student.email && <p className="text-slate-400 text-xs">{student.email}</p>}
                        {!student.phone && !student.email && <span className="text-slate-400">-</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={student.status === 'active' ? 'default' : 'secondary'}
                        className={student.status === 'active' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : ''}
                      >
                        {student.status === 'active' ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => openEditModal(student)}
                        >
                          <Pencil className="w-4 h-4 text-slate-400" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDelete(student)}
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingStudent ? 'Editar Estudiante' : 'Agregar Estudiante'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label>Nombre Completo *</Label>
                <Input
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>ID Estudiante *</Label>
                <Input
                  value={formData.student_id}
                  onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="col-span-2 space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Hospedaje</Label>
                <Select value={formData.housing_id} onValueChange={handleHousingChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {housings.map(housing => (
                      <SelectItem key={housing.id} value={housing.id}>
                        {housing.name}
                      </SelectItem>
                    ))}
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
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="inactive">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" disabled={loading} className="flex-1 bg-teal-600 hover:bg-teal-700">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingStudent ? 'Guardar' : 'Agregar')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}