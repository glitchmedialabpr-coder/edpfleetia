import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Edit2, Search } from 'lucide-react';
import { toast } from 'sonner';
import StudentForm from './StudentForm';

export default function StudentsManagement() {
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  const { data: students = [], isLoading } = useQuery({
    queryKey: ['students'],
    queryFn: () => base44.entities.Student.list(),
  });

  const deleteStudentMutation = useMutation({
    mutationFn: (id) => base44.entities.Student.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Estudiante eliminado');
    },
    onError: () => toast.error('Error al eliminar estudiante'),
  });

  const filteredStudents = students.filter(s =>
    s.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.student_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Buscar por nombre, ID o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => { setEditingStudent(null); setShowForm(!showForm); }} className="gap-2">
          <Plus className="w-4 h-4" />
          Nuevo Estudiante
        </Button>
      </div>

      {showForm && (
        <StudentForm
          student={editingStudent}
          onClose={() => { setShowForm(false); setEditingStudent(null); }}
        />
      )}

      {isLoading ? (
        <div className="text-center py-8">Cargando...</div>
      ) : (
        <div className="grid gap-4">
          {filteredStudents.map((student) => (
            <Card key={student.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 dark:text-white">{student.full_name}</h3>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-sm text-slate-600 dark:text-slate-400">
                      <p>ID: {student.student_id}</p>
                      <p>Teléfono: {student.phone || '-'}</p>
                      <p>Email: {student.email || '-'}</p>
                      <p>Hospedaje: {student.housing_name || '-'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => { setEditingStudent(student); setShowForm(true); }}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      onClick={() => deleteStudentMutation.mutate(student.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {filteredStudents.length === 0 && (
            <div className="text-center py-8 text-slate-500">No hay estudiantes</div>
          )}
        </div>
      )}
    </div>
  );
}