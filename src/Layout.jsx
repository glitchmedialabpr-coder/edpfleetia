import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
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
        Shield,
        Clock,
        Settings
      } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import NotificationCenter from './components/notifications/NotificationCenter';

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
    
    // Check session expiry for all users every 30 seconds
    const interval = setInterval(async () => {
      const pinUser = localStorage.getItem('pin_user');
      if (pinUser) {
        try {
          const user = JSON.parse(pinUser);
          
          // Check if session has session_expiry
          if (user.session_expiry) {
            if (Date.now() > user.session_expiry) {
              localStorage.removeItem('pin_user');
              const loginPage = user.role === 'admin' ? 'AdminLogin' 
                : user.user_type === 'driver' ? 'DriverLogin' 
                : 'PassengerLogin';
              window.location.href = createPageUrl(loginPage);
              return;
            }
          }
          
          // Legacy check for old sessions without token
          if (user.user_type === 'passenger' && user.login_time && !user.session_expiry) {
            const elapsed = Date.now() - user.login_time;
            const fiveMinutes = 5 * 60 * 1000;
            
            if (elapsed >= fiveMinutes) {
              localStorage.removeItem('pin_user');
              window.location.href = createPageUrl('PassengerLogin');
            }
          }
        } catch (e) {
          localStorage.removeItem('pin_user');
        }
      }
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const loadUser = () => {
    // Check if user logged in with PIN
    const pinUser = localStorage.getItem('pin_user');
    if (pinUser) {
      try {
        setUser(JSON.parse(pinUser));
      } catch (e) {
        localStorage.removeItem('pin_user');
      }
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('pin_user');
    setUser(null);
  };

  const handlePinLogin = async (e) => {
    e.preventDefault();
    setPinLoading(true);
    setPinError('');

    try {
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
        // Buscar estudiante por student_id (PIN)
        const { base44 } = await import('./api/base44Client');
        const students = await base44.entities.Student.filter({ student_id: pin });
        
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
          setUser(studentUser);
          setPin('');
        } else {
          setPinError('ID de estudiante no encontrado');
          setPin('');
        }
      }
      setPinLoading(false);
    } catch (error) {
      setPinError('Error al verificar ID');
      setPin('');
      setPinLoading(false);
    }
  };

  const isAdmin = user?.role === 'admin';
  const isDriver = user?.user_type === 'driver';
  const isPassenger = !isAdmin && !isDriver;

  const adminNavItems = [
    { name: 'Dashboard', page: 'Dashboard', icon: LayoutDashboard },
    { name: 'Viajes', page: 'Trips', icon: Bus },
    { name: 'Viajes en Vivo', page: 'LiveTrips', icon: Bus },
    { name: 'Vehículos', page: 'VehicleManagement', icon: Car },
    { name: 'Choferes', page: 'Drivers', icon: Users },
    { name: 'Servicio General', page: 'GeneralServiceJobs', icon: Wrench },
    { name: 'Estudiantes', page: 'Students', icon: GraduationCap },
    { name: 'Reportes', page: 'ConsolidatedReports', icon: ClipboardList },
    { name: 'Respuestas y Notificaciones', page: 'ResponseHistory', icon: AlertTriangle },
    { name: 'Historial', page: 'History', icon: History },
    { name: 'Configuración', page: 'Settings', icon: Shield },
  ];

  const driverNavItems = [
        { name: 'Dashboard', page: 'DriverDashboard', icon: LayoutDashboard },
        { name: 'Solicitudes', page: 'DriverRequests', icon: Bus },
        { name: 'Estudiantes Aceptados', page: 'DriverAcceptedStudents', icon: Users },
        { name: 'Mis Viajes', page: 'DriverTrips', icon: Bus },
        { name: 'Historial', page: 'DriverHistory', icon: History },
        { name: 'Notificaciones', page: 'NotificationSettings', icon: Settings },
      ];

  const adminScheduleItems = [
      { name: 'Horarios', page: 'DriverSchedule', icon: Bus },
    ];

  const passengerNavItems = [
    { name: 'Mis Viajes', page: 'PassengerTrips', icon: Bus },
  ];
  
  const navItems = isAdmin ? adminNavItems : isDriver ? driverNavItems : passengerNavItems;

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
    // Redirect to appropriate login page
    const loginPages = ['Home', 'AdminLogin', 'DriverLogin', 'PassengerLogin'];
    if (!loginPages.includes(currentPageName)) {
      // Default redirect to home
      window.location.href = createPageUrl('Home');
      return null;
    }

    // Allow login pages to render
    return children;
  }

  // Route guard: Protect admin pages
  const adminPages = ['Drivers', 'Students', 'VehicleManagement', 'Vehicles', 'Dashboard', 'Trips', 'Maintenance', 'Accidents', 'Reports', 'DailyReports', 'GeneralServiceJobs', 'PurchaseReports', 'Housing', 'History', 'ResponseHistory', 'Settings', 'FuelRecords', 'Purchases', 'Maintenance', 'LiveTrips', 'ConsolidatedReports'];
  if (adminPages.includes(currentPageName) && user.role !== 'admin') {
    window.location.href = createPageUrl('Dashboard');
    return null;
  }

  // Route guard: Protect driver pages
  const driverPages = ['DriverDashboard', 'DriverRequests', 'DriverAcceptedStudents', 'DriverTrips', 'DriverHistory'];
  if (driverPages.includes(currentPageName) && user.user_type !== 'driver') {
    window.location.href = createPageUrl('Home');
    return null;
  }

  // Route guard: Protect passenger pages
  const passengerPages = ['PassengerTrips'];
  if (passengerPages.includes(currentPageName) && user.user_type !== 'passenger') {
    window.location.href = createPageUrl('Dashboard');
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Desktop Header */}
      <header className="hidden lg:block fixed top-0 left-72 right-0 h-16 bg-white border-b border-slate-200 z-30 px-8">
        <div className="flex items-center justify-end h-full gap-4">
          {isDriver && <NotificationCenter user={user} />}
          <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-50">
            <div className="w-9 h-9 bg-slate-200 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-slate-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-800 truncate text-sm">{user.full_name || user.email}</p>
              <p className="text-xs text-slate-500 capitalize">
                {isAdmin ? 'Administrador' : isDriver ? 'Conductor' : 'Pasajero'}
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            className="text-slate-600 hover:text-red-600 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

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
        <div className="flex items-center gap-2">
          {isDriver && <NotificationCenter user={user} />}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
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
        "fixed top-16 left-0 bottom-0 w-72 bg-white border-r border-slate-200 z-50 transform transition-transform duration-300 lg:top-0 lg:translate-x-0 flex flex-col",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="hidden lg:block p-6 border-b border-slate-100 flex-shrink-0">
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

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
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
                  "w-5 h-5 transition-colors flex-shrink-0",
                  isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"
                )} />
                <span className="font-medium">{item.name}</span>
                {isActive && <ChevronRight className="w-4 h-4 ml-auto flex-shrink-0" />}
              </Link>
            );
          })}
        </nav>

        <div className="lg:hidden p-4 border-t border-slate-100 bg-white">
          <div className="flex items-center gap-3 px-3 py-2 mb-3 bg-slate-50 rounded-lg">
            <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-slate-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-800 truncate text-sm">{user.full_name || user.email}</p>
              <p className="text-xs text-slate-500 capitalize">
                {isAdmin ? 'Administrador' : isDriver ? 'Conductor' : 'Pasajero'}
              </p>
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
      <main className="lg:pl-72 pt-16 lg:pt-16 min-h-screen">
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}