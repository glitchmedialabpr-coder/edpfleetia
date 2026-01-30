import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, GraduationCap, User, Shield, Home } from 'lucide-react';
import { toast } from 'sonner';

export default function ShareLinks() {
  const baseUrl = window.location.origin;

  const links = [
    {
      title: 'Página Principal',
      description: 'Acceso con opciones para todos los usuarios',
      path: '/Home',
      icon: Home,
      color: 'bg-blue-500'
    },
    {
      title: 'Login Estudiantes',
      description: 'Acceso directo para estudiantes',
      path: '/PassengerLogin',
      icon: GraduationCap,
      color: 'bg-purple-500'
    },
    {
      title: 'Login Conductores',
      description: 'Acceso directo para conductores',
      path: '/DriverLogin',
      icon: User,
      color: 'bg-teal-500'
    },
    {
      title: 'Login Administradores',
      description: 'Acceso directo para administradores',
      path: '/AdminLogin',
      icon: Shield,
      color: 'bg-orange-500'
    }
  ];

  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url);
    toast.success('URL copiado al portapapeles');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Enlaces de Acceso</h1>
        <p className="text-slate-500 mt-2">Copia estos enlaces para compartir con estudiantes y conductores</p>
      </div>

      <div className="grid gap-4">
        {links.map((link) => {
          const fullUrl = baseUrl + link.path;
          const Icon = link.icon;
          
          return (
            <Card key={link.path} className="p-6">
              <div className="flex items-start gap-4">
                <div className={`${link.color} w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-800 mb-1">{link.title}</h3>
                  <p className="text-sm text-slate-500 mb-3">{link.description}</p>
                  
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                    <code className="text-sm text-slate-700 break-all">{fullUrl}</code>
                  </div>
                </div>

                <Button
                  onClick={() => copyToClipboard(fullUrl)}
                  variant="outline"
                  size="icon"
                  className="flex-shrink-0"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">💡 Recomendaciones</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Comparte el enlace de <strong>Login Estudiantes</strong> con los estudiantes</li>
          <li>• Comparte el enlace de <strong>Login Conductores</strong> con los conductores</li>
          <li>• Usa <strong>Página Principal</strong> si quieres dar acceso a todos desde un solo lugar</li>
        </ul>
      </Card>
    </div>
  );
}