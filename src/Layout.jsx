import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { base44 } from '@/api/base44Client';
import { 
  Bus, 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  Building2, 
  History, 
  Menu, 
  X,
  LogOut,
  ChevronRight,
  User,
  Car,
  Wrench,
  AlertTriangle,
  ClipboardList,
  ShoppingCart,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const ADMIN_PIN = '0573';

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinLoading, setPinLoading] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    // Check if user logged in with PIN
    const pinUser = localStorage.getItem('pin_user');
    if (pinUser) {
      setUser(JSON.parse(pinUser));
      setLoading(false);
      return;
    }
    
    try {
      const userData = await base44.auth.me();
      setUser(userData);
    } catch (e) {
      console.log('User not logged in');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('pin_user');
    setUser(null);
  };

  const handlePinLogin = (e) => {
    e.preventDefault();
    setPinLoading(true);
    setPinError('');

    setTimeout(() => {
      if (pin === ADMIN_PIN) {
        const adminUser = {
          email: 'admin@edp.edu',
          full_name: 'Administrador',
          role: 'admin'
        };
        localStorage.setItem('pin_user', JSON.stringify(adminUser));
        setUser(adminUser);
        setPin('');
      } else {
        setPinError('PIN incorrecto');
        setPin('');
      }
      setPinLoading(false);
    }, 500);
  };

  const isAdmin = user?.role === 'admin';

  const adminNavItems = [
    { name: 'Dashboard', page: 'Dashboard', icon: LayoutDashboard },
    { name: 'Viajes', page: 'Trips', icon: Bus },
    { name: 'Vehículos', page: 'Vehicles', icon: Car },
    { name: 'Combustible', page: 'FuelRecords', icon: Wrench },
    { name: 'Compras', page: 'Purchases', icon: ShoppingCart },
    { name: 'Mantenimiento', page: 'Maintenance', icon: Wrench },
    { name: 'Accidentes', page: 'Accidents', icon: AlertTriangle },
    { name: 'Reportes Diarios', page: 'DailyReports', icon: ClipboardList },
    { name: 'Advertencias', page: 'Warnings', icon: AlertTriangle },
    { name: 'Choferes', page: 'Drivers', icon: Users },
    { name: 'Estudiantes', page: 'Students', icon: GraduationCap },
    { name: 'Hospedajes', page: 'Housing', icon: Building2 },
    { name: 'Historial', page: 'History', icon: History },
  ];

  const driverNavItems = [
    { name: 'Mis Viajes', page: 'DriverTrips', icon: Bus },
    { name: 'Historial', page: 'DriverHistory', icon: History },
  ];

  const navItems = isAdmin ? adminNavItems : driverNavItems;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center">
            <Bus className="w-8 h-8 text-white" />
          </div>
          <div className="h-2 w-24 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-32 h-32 mx-auto mb-6">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6962e1b8eae90299f24a170a/303d16ba3_471231367_1006775134815986_8615529326532786364_n.jpg" 
                alt="EDP University"
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">EDP Transport</h1>
            <p className="text-slate-400">Sistema de Gestión de Transporte Estudiantil</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
            <form onSubmit={handlePinLogin} className="space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-teal-600/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-8 h-8 text-teal-400" />
                </div>
                <p className="text-sm text-slate-300 mb-4">Ingresa tu PIN de administrador</p>
              </div>
              <Input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                className="text-center text-2xl tracking-widest bg-white/10 border-white/20 text-white placeholder:text-slate-500"
                autoFocus
              />
              {pinError && (
                <p className="text-sm text-red-400 text-center">{pinError}</p>
              )}
              <Button 
                type="submit"
                disabled={pinLoading || pin.length !== 4}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white h-12 rounded-xl"
              >
                {pinLoading ? 'Verificando...' : 'Entrar'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-40 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg overflow-hidden">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6962e1b8eae90299f24a170a/303d16ba3_471231367_1006775134815986_8615529326532786364_n.jpg" 
              alt="EDP"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="font-semibold text-slate-800">EDP Transport</span>
        </div>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 h-full w-72 bg-white border-r border-slate-200 z-50 transform transition-transform duration-300 lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl overflow-hidden">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6962e1b8eae90299f24a170a/303d16ba3_471231367_1006775134815986_8615529326532786364_n.jpg" 
                alt="EDP"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="font-bold text-slate-800 text-lg">EDP Transport</h1>
              <p className="text-xs text-slate-500">Sistema de Transporte</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = currentPageName === item.page;
            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                  isActive 
                    ? "bg-teal-600 text-white shadow-lg shadow-teal-600/20" 
                    : "text-slate-600 hover:bg-slate-100"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5 transition-colors",
                  isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"
                )} />
                <span className="font-medium">{item.name}</span>
                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 px-3 py-2 mb-3">
            <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-slate-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-800 truncate text-sm">{user.full_name || user.email}</p>
              <p className="text-xs text-slate-500 capitalize">{isAdmin ? 'Administrador' : 'Chofer'}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-slate-600 hover:text-red-600 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:pl-72 pt-16 lg:pt-0 min-h-screen">
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}