import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from './utils';
import { useAuth, AuthProvider } from './components/auth/AuthContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import { AnimatePresence, motion } from 'framer-motion';
import TabContainer from './components/mobile/TabContainer';
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
                      AlertCircle,
                      ClipboardList,
                      ShoppingCart,
                      Shield,
                      Clock,
                      Settings as SettingsIcon,
                      Bell,
                      ArrowLeft,
                      ListTodo
                    } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import NotificationCenter from './components/notifications/NotificationCenter';
import ThemeToggle from './components/common/ThemeToggle';

const ADMIN_PIN = '0573';

function LayoutContent({ children, currentPageName }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const noLayoutPages = ['Home', 'AdminLogin', 'DriverLogin', 'PassengerLogin', 'EmployeeLogin', 'EmployeeComplaintForm', 'EmployeeComplaintHistory'];
  
  const shouldShowLayout = !noLayoutPages.includes(currentPageName);
  const isAdmin = user?.role === 'admin';
  const isDriver = user?.user_type === 'driver';
  const isPassenger = !isAdmin && !isDriver;

  const getHomePage = () => {
    if (isDriver) return 'DriverDashboard';
    if (isPassenger) return 'PassengerTrips';
    if (isAdmin) return 'Dashboard';
    return 'Home';
  };

  const navItems = useMemo(() => {
    if (isAdmin) {
          return [
            { name: 'Dashboard', page: 'Dashboard', icon: LayoutDashboard },
            { name: 'Viajes', page: 'Trips', icon: Bus },
            { name: 'Viajes en Vivo', page: 'LiveTrips', icon: Bus },
            { name: 'Vehículos', page: 'VehicleManagement', icon: Car },
            { name: 'Choferes', page: 'Drivers', icon: Users },
            { name: 'Horarios', page: 'DriverSchedule', icon: Clock },
            { name: 'Servicio General', page: 'GeneralServiceJobs', icon: Wrench },
            { name: 'Estudiantes', page: 'Students', icon: GraduationCap },
            { name: 'Solicitudes', page: 'EmployeeComplaints', icon: AlertCircle },
            { name: 'Reportes', page: 'ConsolidatedReports', icon: ClipboardList },
            { name: 'Respuestas y Notificaciones', page: 'ResponseHistory', icon: AlertTriangle },
            { name: 'Historial', page: 'History', icon: History },
            { name: 'Centro de Notificaciones', page: 'NotificationSettings', icon: Bell },
            { name: 'Configuración', page: 'Settings', icon: Shield },
          ];
        }
    if (isDriver) {
      return [
        { name: 'Dashboard', page: 'DriverDashboard', icon: LayoutDashboard },
        { name: 'Solicitudes', page: 'DriverRequests', icon: Bus },
        { name: 'Mis Viajes', page: 'DriverTrips', icon: Bus },
        { name: 'Historial', page: 'DriverHistory', icon: History },
        { name: 'Notificaciones', page: 'NotificationSettings', icon: SettingsIcon },
      ];
    }
    if (isPassenger) {
      return [
        { name: 'Mis Viajes', page: 'PassengerTrips', icon: Bus },
      ];
    }
    return [];
  }, [isAdmin, isDriver, isPassenger]);

  useEffect(() => {
    if (loading) return;
    if (noLayoutPages.includes(currentPageName)) return;

    if (!user) {
      navigate(createPageUrl('Home'), { replace: true });
      return;
    }

    const adminPages = ['Drivers', 'Students', 'VehicleManagement', 'Vehicles', 'Dashboard', 'Trips', 'Maintenance', 'Accidents', 'Reports', 'DailyReports', 'GeneralServiceJobs', 'PurchaseReports', 'Housing', 'History', 'ResponseHistory', 'Settings', 'FuelRecords', 'Purchases', 'LiveTrips', 'ConsolidatedReports', 'EmployeeComplaints', 'DriverSchedule'];
    const driverPages = ['DriverDashboard', 'DriverRequests', 'DriverTrips', 'DriverHistory', 'NotificationSettings'];
    const passengerPages = ['PassengerTrips'];

    if (adminPages.includes(currentPageName) && user?.role !== 'admin') {
      navigate(createPageUrl(user?.user_type === 'driver' ? 'DriverDashboard' : 'PassengerTrips'), { replace: true });
    } else if (driverPages.includes(currentPageName) && user?.user_type !== 'driver' && user?.role !== 'admin') {
      navigate(createPageUrl(user?.role === 'admin' ? 'Dashboard' : 'PassengerTrips'), { replace: true });
    } else if (passengerPages.includes(currentPageName) && user?.user_type === 'driver') {
      navigate(createPageUrl('DriverDashboard'), { replace: true });
    }
  }, [user, loading, currentPageName, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate(createPageUrl('Home'));
  };

  if (noLayoutPages.includes(currentPageName)) {
    return (
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
    );
  }

  // Block rendering until session validation completes
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
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
      <ErrorBoundary>
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
          <div className="text-center">
            <p className="text-slate-600 dark:text-slate-300">Redirigiendo...</p>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 overscroll-none" style={{ 
      paddingTop: 'env(safe-area-inset-top)',
      paddingBottom: 'env(safe-area-inset-bottom)',
      overscrollBehaviorY: 'none'
    }}>
      {/* Desktop Header */}
      <header className="hidden lg:block fixed top-0 left-72 right-0 h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 z-30 px-8">
        <div className="flex items-center justify-end h-full gap-4">
          <ThemeToggle />
          {isDriver && <NotificationCenter user={user} />}
          <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-700 select-none">
              <div className="w-9 h-9 bg-slate-200 dark:bg-slate-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-slate-500 dark:text-slate-300" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-800 dark:text-slate-100 truncate text-sm">{user.full_name || user.email}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                  {isAdmin ? 'Administrador' : isDriver ? 'Conductor' : 'Pasajero'}
                </p>
              </div>
            </div>
          <Button 
            variant="ghost" 
            size="icon"
            className="text-slate-600 dark:text-slate-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 select-none"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 z-40 px-3 flex items-center justify-between select-none">
        <span className="font-semibold text-slate-800 dark:text-slate-100 select-none">Fleetia</span>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {isDriver && <NotificationCenter user={user} />}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="text-slate-600 dark:text-slate-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 select-none"
          >
            <LogOut className="w-5 h-5" />
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
        "fixed top-14 left-0 bottom-0 w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 z-50 flex flex-col transform transition-transform duration-300",
        "lg:top-0 lg:w-72 lg:translate-x-0 lg:block",
        sidebarOpen ? "translate-x-0" : "-translate-x-full",
        !sidebarOpen && "lg:translate-x-0"
      )}>
        <div className="hidden lg:block p-6 border-b border-slate-100 dark:border-slate-700 flex-shrink-0 select-none">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl overflow-hidden">
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6962e1b8eae90299f24a170a/a12aa5730_Addaheading.jpg" 
                  alt="EDP Fleetia"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="font-bold text-slate-800 dark:text-slate-100 text-lg">Fleetia</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">by Glitch Media Lab</p>
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
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group select-none",
                  isActive 
                    ? "bg-teal-600 text-white shadow-lg shadow-teal-600/20" 
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5 transition-colors flex-shrink-0",
                  isActive ? "text-white" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                )} />
                <span className="font-medium">{item.name}</span>
                {isActive && <ChevronRight className="w-4 h-4 ml-auto flex-shrink-0" />}
              </Link>
            );
          })}
        </nav>


      </aside>

      {/* Main Content */}
      <main className={cn(
        "pt-14 lg:pt-16 min-h-screen flex flex-col",
        "lg:pl-72",
        "pb-16 lg:pb-0"
      )}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="p-3 lg:p-8 flex-1"
          >
            {children}
          </motion.div>
        </AnimatePresence>
        <footer className="py-4 px-8 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <div>Design by <span className="font-medium text-slate-700 dark:text-slate-300 select-none">Glitch Media Lab</span></div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate(createPageUrl(isAdmin ? 'Dashboard' : isDriver ? 'DriverDashboard' : 'PassengerTrips'))}
            className="text-slate-600 dark:text-slate-300 hover:text-teal-600 select-none"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </footer>
      </main>

      {/* Bottom Navigation Bar - Mobile Only */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 z-50 select-none lg:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="flex justify-between items-center h-14 px-4">
          {/* Left: Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-12 h-12 select-none"
          >
            <Menu className="w-6 h-6" />
          </Button>

          {/* Center: Home Button */}
          <Button
            variant="default"
            size="icon"
            onClick={() => navigate(createPageUrl(getHomePage()))}
            className="w-14 h-14 rounded-full bg-teal-600 hover:bg-teal-700 shadow-lg select-none"
          >
            <LayoutDashboard className="w-7 h-7" />
          </Button>

          {/* Right: Back Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="w-12 h-12 select-none"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
        </div>
      </nav>
    </div>
    </ErrorBoundary>
  );
}

export default function Layout({ children, currentPageName }) {
  return (
    <AuthProvider>
      <LayoutContent children={children} currentPageName={currentPageName} />
    </AuthProvider>
  );
}