import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { useAuth } from '../components/auth/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Shield, Lock, Home } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);



  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await base44.functions.invoke('validateAdminLogin', { pin });

      if (response?.data?.success) {
        const userData = response.data.user;
        const sessionToken = response.data.session_token;
        
        await login(userData);
        
        // Guardar el token de sesión en cookies con duración extendida (30 días)
        document.cookie = `session_token=${sessionToken}; path=/; max-age=${30*24*60*60}; secure; samesite=strict`;
        
        toast.success('Acceso autorizado');
        navigate(createPageUrl('Dashboard'));
      } else {
        toast.error(response?.data?.error || 'PIN incorrecto');
        setPin('');
        setLoading(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Error al iniciar sesión');
      setPin('');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 flex items-center justify-center p-4">
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
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600/20 rounded-full mb-4">
            <Shield className="w-10 h-10 text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Portal Administrativo</h1>
          <p className="text-slate-300">Fleetia - Acceso Restringido</p>
          <p className="text-slate-400 text-sm mt-2">Design by Glitch Media Lab</p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/10 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                PIN Administrativo
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Ingresa tu PIN"
                  maxLength="4"
                  className="pl-12 text-center text-2xl tracking-widest bg-white/10 border-white/20 text-white placeholder:text-slate-500 h-14"
                  autoFocus
                />
              </div>
            </div>

            <Button 
              type="submit"
              disabled={loading || pin.length !== 4}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-lg rounded-xl shadow-lg"
            >
              {loading ? 'Verificando...' : 'Acceder'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="flex gap-2 text-sm text-slate-400">
              <span>¿Eres conductor o estudiante?</span>
            </div>
            <div className="flex flex-col gap-2 mt-2">
              <Button 
                variant="ghost" 
                className="w-full text-slate-300 hover:bg-white/10 h-12"
                onClick={() => navigate(createPageUrl('DriverLogin'))}
              >
                Conductor
              </Button>
              <Button 
                variant="ghost" 
                className="w-full text-slate-300 hover:bg-white/10 h-12"
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