import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { useAuth } from '../components/auth/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Truck, Hash, Home } from 'lucide-react';
import { toast } from 'sonner';

export default function DriverLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [driverId, setDriverId] = useState('');
  const [loading, setLoading] = useState(false);
  const [csrfToken, setCsrfToken] = useState('');



  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const response = await base44.functions.invoke('generateCsrfToken');
        if (response?.data?.success) {
          setCsrfToken(response.data.csrf_token);
        }
      } catch (error) {
        console.error('Error obteniendo CSRF token:', error);
        toast.error('Error de seguridad: no se pudo generar token');
      }
    };
    fetchCsrfToken();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!csrfToken) {
      toast.error('Token de seguridad no disponible');
      return;
    }

    setLoading(true);

    try {
      if (driverId.length !== 3) {
        toast.error('El ID del conductor debe tener 3 dígitos');
        setLoading(false);
        return;
      }

      const response = await base44.functions.invoke('validateDriverLogin', { 
        driverId,
        csrf_token: csrfToken
      }, {
        headers: {
          'X-CSRF-Token': csrfToken
        }
      });
      
      if (response?.data?.success) {
        const user = response.data.user;
        user.user_type = 'driver';

        await login(user);
        toast.success(`¡Bienvenido ${user.full_name}!`);
        navigate(createPageUrl('DriverDashboard'));
      } else {
        toast.error(response?.data?.error || 'Conductor no encontrado');
        setLoading(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Error al verificar conductor');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-900 via-teal-800 to-emerald-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="absolute top-4 right-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(createPageUrl('Home'))}
            className="bg-white/20 border-white/30 hover:bg-white/30 text-white"
            title="Volver a Home"
          >
            <Home className="w-5 h-5" />
          </Button>
        </div>
        <div className="text-center mb-8">
          <div className="w-32 h-32 mx-auto mb-6">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6962e1b8eae90299f24a170a/303d16ba3_471231367_1006775134815986_8615529326532786364_n.jpg" 
              alt="EDP University"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="inline-flex items-center justify-center w-20 h-20 bg-teal-600/20 rounded-full mb-4">
            <Truck className="w-10 h-10 text-teal-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Portal de Conductores</h1>
          <p className="text-teal-200">EDP Transport - Acceso para Conductores</p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/10 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-teal-100 mb-2">
                ID de Conductor (3 dígitos)
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-teal-300" />
                <Input
                  type="text"
                  value={driverId}
                  onChange={(e) => setDriverId(e.target.value.replace(/\D/g, '').slice(0, 3))}
                  placeholder="123"
                  maxLength="3"
                  className="pl-12 bg-white/10 border-white/20 text-white placeholder:text-teal-300/50 h-12 text-center text-lg"
                  autoFocus
                />
              </div>
            </div>

            <Button 
              type="submit"
              disabled={loading || driverId.length !== 3}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white h-12 text-lg rounded-xl shadow-lg"
            >
              {loading ? 'Verificando...' : 'Iniciar Sesión'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="flex gap-2 text-sm text-teal-200">
              <span>¿Acceso diferente?</span>
            </div>
            <div className="flex flex-col gap-2 mt-2">
              <Button 
                variant="ghost" 
                className="w-full text-teal-200 hover:bg-white/10 h-12"
                onClick={() => navigate(createPageUrl('AdminLogin'))}
              >
                Admin
              </Button>
              <Button 
                variant="ghost" 
                className="w-full text-teal-200 hover:bg-white/10 h-12"
                onClick={() => navigate(createPageUrl('PassengerLogin'))}
              >
                Estudiante
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}