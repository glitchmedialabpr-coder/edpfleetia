import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Shield, Home } from 'lucide-react';
import { toast } from 'sonner';

const ACCESS_CODES = ['edpuniversity', 'admin0573'];

export default function EmployeeLogin() {
  const navigate = useNavigate();
  const [accessCode, setAccessCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (ACCESS_CODES.includes(accessCode.toLowerCase())) {
      const user = {
        role: 'employee',
        user_type: 'employee',
        access_code: accessCode,
        session_expiry: Date.now() + (24 * 60 * 60 * 1000) // 24 horas
      };
      localStorage.setItem('pin_user', JSON.stringify(user));
      toast.success('¡Acceso concedido!');
      navigate(createPageUrl('EmployeeComplaintForm'));
    } else {
      toast.error('Código de acceso inválido');
      setAccessCode('');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center p-4">
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
          <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-600/20 rounded-full mb-4">
            <Shield className="w-10 h-10 text-purple-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Portal de Empleados</h1>
          <p className="text-purple-200">Sistema de Quejas - Fleetia</p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/10 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-purple-100 mb-2">
                Código de Acceso
              </label>
              <Input
                type="text"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                placeholder="Ingrese su código de acceso"
                className="bg-white/10 border-white/20 text-white placeholder:text-purple-300/50 h-12"
                autoFocus
              />
            </div>

            <Button 
              type="submit"
              disabled={loading || !accessCode}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white h-12 text-lg rounded-xl shadow-lg"
            >
              {loading ? 'Verificando...' : 'Acceder'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="flex gap-2 text-sm text-purple-200">
              <span>¿Acceso diferente?</span>
            </div>
            <div className="flex flex-col gap-2 mt-2">
              <Button 
                variant="ghost" 
                className="w-full text-purple-200 hover:bg-white/10 h-12"
                onClick={() => navigate(createPageUrl('AdminLogin'))}
              >
                Admin
              </Button>
              <Button 
                variant="ghost" 
                className="w-full text-purple-200 hover:bg-white/10 h-12"
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