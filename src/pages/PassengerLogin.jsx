import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { GraduationCap, Hash } from 'lucide-react';
import { toast } from 'sonner';

export default function PassengerLogin() {
  const navigate = useNavigate();
  const [studentId, setStudentId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if already logged in
    const pinUser = localStorage.getItem('pin_user');
    if (pinUser) {
      try {
        const user = JSON.parse(pinUser);
        if (user.user_type === 'passenger') {
          navigate(createPageUrl('PassengerTrips'));
        }
      } catch (e) {
        localStorage.removeItem('pin_user');
      }
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const students = await base44.entities.Student.filter({ student_id: studentId.trim() });
      
      if (students && students.length > 0) {
        const student = students[0];
        const studentUser = {
          id: student.id,
          email: student.email || `student_${student.student_id}@edp.edu`,
          full_name: student.full_name,
          phone: student.phone,
          role: 'user',
          user_type: 'passenger',
          student_id: student.student_id,
          housing_name: student.housing_name
        };
        localStorage.setItem('pin_user', JSON.stringify(studentUser));
        toast.success(`¡Bienvenido ${student.full_name}!`);
        navigate(createPageUrl('PassengerTrips'));
      } else {
        toast.error('ID de estudiante no encontrado');
        setStudentId('');
      }
    } catch (error) {
      toast.error('Error al verificar estudiante');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-32 h-32 mx-auto mb-6">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6962e1b8eae90299f24a170a/303d16ba3_471231367_1006775134815986_8615529326532786364_n.jpg" 
              alt="EDP University"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-600/20 rounded-full mb-4">
            <GraduationCap className="w-10 h-10 text-purple-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Portal Estudiantil</h1>
          <p className="text-purple-200">EDP Transport - Acceso para Estudiantes</p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/10 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-purple-100 mb-2">
                ID de Estudiante
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-300" />
                <Input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="Ingresa tu ID"
                  className="pl-12 bg-white/10 border-white/20 text-white placeholder:text-purple-300/50 h-12 text-center text-lg"
                  autoFocus
                />
              </div>
            </div>

            <Button 
              type="submit"
              disabled={loading || !studentId}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white h-12 text-lg rounded-xl shadow-lg"
            >
              {loading ? 'Verificando...' : 'Acceder'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="flex gap-2 text-sm text-purple-200">
              <span>¿Acceso diferente?</span>
            </div>
            <div className="flex gap-2 mt-2">
              <Button 
                variant="ghost" 
                className="flex-1 text-purple-200 hover:bg-white/10"
                onClick={() => navigate(createPageUrl('AdminLogin'))}
              >
                Admin
              </Button>
              <Button 
                variant="ghost" 
                className="flex-1 text-purple-200 hover:bg-white/10"
                onClick={() => navigate(createPageUrl('DriverLogin'))}
              >
                Conductor
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}