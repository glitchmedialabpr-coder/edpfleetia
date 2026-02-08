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
  Loader2,
  FileSpreadsheet,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import EmptyState from '../components/common/EmptyState';
import MobileCard, { MobileCardRow, MobileCardSection } from '../components/common/MobileCard';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

export default function Students() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('students');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingHousing, setEditingHousing] = useState(null);
  const [housingModalOpen, setHousingModalOpen] = useState(false);
  const [housingSearch, setHousingSearch] = useState('');
  const [formData, setFormData] = useState({
    full_name: '',
    student_id: '',
    phone: '',
    email: '',
    housing_id: '',
    housing_name: '',
    status: 'active'
  });
  const [housingFormData, setHousingFormData] = useState({
    name: '',
    address: '',
    zone: '',
    contact_phone: '',
    notes: ''
  });

  const { data: students = [], refetch } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const res = await base44.functions.invoke('getSecureStudents');
      return res.data.students || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    cacheTime: 1000 * 60 * 15 // 15 minutos en cache
  });

  const { data: housings = [] } = useQuery({
    queryKey: ['housings'],
    queryFn: () => base44.entities.Housing.list('-created_date', 200),
    staleTime: 1000 * 60 * 10, // 10 minutos
    cacheTime: 1000 * 60 * 30 // 30 minutos en cache
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

    try {
      if (editingStudent) {
        await base44.entities.Student.update(editingStudent.id, formData);
      } else {
        await base44.entities.Student.create(formData);
      }
      setModalOpen(false);
      refetch();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (student) => {
    if (confirm(`¿Eliminar a ${student.full_name}?`)) {
      try {
        await base44.entities.Student.delete(student.id);
        refetch();
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  const filteredHousings = housings.filter(h => 
    h.name?.toLowerCase().includes(housingSearch.toLowerCase()) ||
    h.address?.toLowerCase().includes(housingSearch.toLowerCase()) ||
    h.zone?.toLowerCase().includes(housingSearch.toLowerCase())
  );

  const openCreateHousingModal = () => {
    setEditingHousing(null);
    setHousingFormData({
      name: '',
      address: '',
      zone: '',
      contact_phone: '',
      notes: ''
    });
    setHousingModalOpen(true);
  };

  const openEditHousingModal = (housing) => {
    setEditingHousing(housing);
    setHousingFormData({
      name: housing.name || '',
      address: housing.address || '',
      zone: housing.zone || '',
      contact_phone: housing.contact_phone || '',
      notes: housing.notes || ''
    });
    setHousingModalOpen(true);
  };

  const handleHousingSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingHousing) {
        await base44.entities.Housing.update(editingHousing.id, housingFormData);
      } else {
        await base44.entities.Housing.create(housingFormData);
      }
      setHousingModalOpen(false);
      queryClient.invalidateQueries(['housings']);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleHousingDelete = async (housing) => {
    if (confirm(`¿Eliminar ${housing.name}?`)) {
      try {
        await base44.entities.Housing.delete(housing.id);
        queryClient.invalidateQueries(['housings']);
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">Estudiantes</h1>
          <p className="text-slate-500 mt-1">Gestiona estudiantes y hospedajes</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="students">
            <GraduationCap className="w-4 h-4 mr-2" />
            Estudiantes
          </TabsTrigger>
          <TabsTrigger value="housing">
            <Building2 className="w-4 h-4 mr-2" />
            Hospedajes
          </TabsTrigger>
        </TabsList>

        {/* Estudiantes Tab */}
        <TabsContent value="students" className="space-y-4">
          <div className="flex justify-end">
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
          <>
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
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
                    <TableCell>
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 font-mono">
                        {student.student_id}
                      </Badge>
                    </TableCell>
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

          {/* Mobile Card View */}
          <div className="lg:hidden divide-y">
            {filteredStudents.map(student => (
              <MobileCard key={student.id} className="border-0 rounded-none shadow-none">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center select-none">
                      <span className="font-semibold text-purple-600">
                        {student.full_name?.charAt(0) || '?'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{student.full_name}</p>
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 font-mono text-xs mt-1 select-none">
                        {student.student_id}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => openEditModal(student)}
                      className="select-none"
                    >
                      <Pencil className="w-4 h-4 text-slate-400" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDelete(student)}
                      className="select-none"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </Button>
                  </div>
                </div>

                <MobileCardSection>
                  {student.housing_name && (
                    <MobileCardRow 
                      icon={Building2}
                      label="Hospedaje"
                      value={student.housing_name}
                    />
                  )}
                  {student.phone && (
                    <MobileCardRow 
                      icon={Phone}
                      label="Teléfono"
                      value={student.phone}
                    />
                  )}
                  {student.email && (
                    <MobileCardRow 
                      icon={Mail}
                      label="Email"
                      value={<span className="text-xs truncate">{student.email}</span>}
                    />
                  )}
                </MobileCardSection>

                <div className="pt-3 mt-3 border-t">
                  <Badge variant={student.status === 'active' ? 'default' : 'secondary'}
                    className={cn("select-none", student.status === 'active' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : '')}
                  >
                    {student.status === 'active' ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
              </MobileCard>
            ))}
          </div>
          </>
        )}
      </Card>
        </TabsContent>

        {/* Hospedajes Tab */}
        <TabsContent value="housing" className="space-y-4">
          <div className="flex justify-end">
            <Button 
              onClick={openCreateHousingModal}
              className="bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-600/20"
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar Hospedaje
            </Button>
          </div>

          {/* Search */}
          <Card className="p-4 border-0 shadow-sm">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Buscar por nombre, dirección o zona..."
                value={housingSearch}
                onChange={(e) => setHousingSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </Card>

          {/* Housing Cards Grid */}
          {filteredHousings.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <EmptyState
                icon={Building2}
                title={housingSearch ? "No se encontraron hospedajes" : "No hay hospedajes registrados"}
                description={housingSearch ? "Intenta con otra búsqueda" : "Agrega el primer hospedaje para comenzar"}
                action={!housingSearch ? openCreateHousingModal : undefined}
                actionLabel="Agregar Hospedaje"
              />
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredHousings.map(housing => (
                <Card key={housing.id} className="p-5 border-0 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-teal-600" />
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => openEditHousingModal(housing)}
                      >
                        <Pencil className="w-4 h-4 text-slate-400" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleHousingDelete(housing)}
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </Button>
                    </div>
                  </div>

                  <h3 className="font-semibold text-slate-800 text-lg mb-2">{housing.name}</h3>
                  
                  <div className="space-y-2">
                    {housing.address && (
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                        <span className="text-slate-600">{housing.address}</span>
                      </div>
                    )}
                    {housing.zone && (
                      <div className="inline-block px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">
                        {housing.zone}
                      </div>
                    )}
                    {housing.contact_phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-600">{housing.contact_phone}</span>
                      </div>
                    )}
                  </div>

                  {housing.notes && (
                    <p className="text-sm text-slate-500 mt-3 pt-3 border-t">{housing.notes}</p>
                  )}
                </Card>
              ))}
            </div>
          )}

          {/* Housing Modal */}
          <Dialog open={housingModalOpen} onOpenChange={setHousingModalOpen}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingHousing ? 'Editar Hospedaje' : 'Agregar Hospedaje'}
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleHousingSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Nombre del Hospedaje *</Label>
                  <Input
                    value={housingFormData.name}
                    onChange={(e) => setHousingFormData({ ...housingFormData, name: e.target.value })}
                    placeholder="Ej: Residencia Universitaria Norte"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Dirección *</Label>
                  <Input
                    value={housingFormData.address}
                    onChange={(e) => setHousingFormData({ ...housingFormData, address: e.target.value })}
                    placeholder="Dirección completa"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Zona</Label>
                    <Input
                      value={housingFormData.zone}
                      onChange={(e) => setHousingFormData({ ...housingFormData, zone: e.target.value })}
                      placeholder="Ej: Zona Norte"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Teléfono de Contacto</Label>
                    <Input
                      value={housingFormData.contact_phone}
                      onChange={(e) => setHousingFormData({ ...housingFormData, contact_phone: e.target.value })}
                      placeholder="787-xxx-xxxx"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Notas</Label>
                  <Textarea
                    value={housingFormData.notes}
                    onChange={(e) => setHousingFormData({ ...housingFormData, notes: e.target.value })}
                    placeholder="Notas adicionales..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setHousingModalOpen(false)} className="flex-1">
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={loading} className="flex-1 bg-teal-600 hover:bg-teal-700">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingHousing ? 'Guardar' : 'Agregar')}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>

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
                <Label>ID Estudiante (4 dígitos) *</Label>
                <Input
                  value={formData.student_id}
                  onChange={(e) => setFormData({ ...formData, student_id: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                  placeholder="1234"
                  maxLength="4"
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