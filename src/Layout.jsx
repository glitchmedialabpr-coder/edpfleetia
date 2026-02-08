import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from './utils';
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

export default function Layout({ children, currentPageName }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  // No automatic redirects - Home is always accessible
  // Users stay where they are regardless of login status

  const loadUser = () => {
    try {
      const pinUser = localStorage.getItem('pin_user');
      if (pinUser) {
        setUser(JSON.parse(pinUser));
      }
    } catch (e) {
      localStorage.removeItem('pin_user');
    }
    setLoading(false);
  };



  const handleLogout = () => {
    localStorage.removeItem('pin_user');
    // Limpiar datos de vehículos temporales
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('driver_vehicle_')) {
        localStorage.removeItem(key);
      }
    });
    setUser(null);
    window.location.href = createPageUrl('Home');
  };

  const isAdmin = user?.role === 'admin';
  const isDriver = user?.user_type === 'driver';
  const isPassenger = !isAdmin && !isDriver;

  // Mobile navigation items for bottom tab bar
  const mobileNavItems = useMemo(() => {
    if (isDriver) {
      return [
        { name: 'Dashboard', page: 'DriverDashboard', icon: LayoutDashboard },
        { name: 'Solicitudes', page: 'DriverRequests', icon: ListTodo },
        { name: 'Viajes', page: 'DriverTrips', icon: Bus },
        { name: 'Ajustes', page: 'NotificationSettings', icon: SettingsIcon },
      ];
    }
    if (isPassenger) {
      return [
        { name: 'Viajes', page: 'PassengerTrips', icon: Bus },
      ];
    }
    if (isAdmin) {
      return [
        { name: 'Dashboard', page: 'Dashboard', icon: LayoutDashboard },
        { name: 'Vehículos', page: 'VehicleManagement', icon: Car },
        { name: 'Choferes', page: 'Drivers', icon: Users },
        { name: 'Ajustes', page: 'Settings', icon: SettingsIcon },
      ];
    }
    return [];
  }, [isDriver, isPassenger, isAdmin]);

  // Check if current page is a main tab
  const isMainTab = useMemo(() => {
    return mobileNavItems.some(item => item.page === currentPageName);
  }, [mobileNavItems, currentPageName]);

  // Handle mobile tab navigation with state preservation
  const handleMobileTabClick = (e, page) => {
    if (window.innerWidth >= 1024) return; // Only for mobile
    
    e.preventDefault();
    navigate(createPageUrl(page), { replace: false });
  };

  // Check if current page needs back button
  const needsBackButton = () => {
    if (isDriver && isMainTab) return false; // Main tabs don't need back button
    const mainPages = ['DriverDashboard', 'Dashboard', 'PassengerTrips'];
    return !mainPages.includes(currentPageName);
  };

  // Intercept browser back button on mobile for proper tab navigation
  useEffect(() => {
    if (!isDriver || window.innerWidth >= 1024) return;

    const handlePopState = (e) => {
      const path = location.pathname;
      const isTabPage = mobileNavItems.some(item => 
        path.includes(item.page) || path === createPageUrl(item.page)
      );
      
      if (isTabPage) {
        // Allow normal navigation for tab pages
        return;
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isDriver, location, mobileNavItems]);

  const navItems = useMemo(() => {
    if (isAdmin) {
        return [
          { name: 'Dashboard', page: 'Dashboard', icon: LayoutDashboard },
          { name: 'Viajes', page: 'Trips', icon: Bus },
          { name: 'Viajes en Vivo', page: 'LiveTrips', icon: Bus },
          { name: 'Vehículos', page: 'VehicleManagement', icon: Car },
          { name: 'Choferes', page: 'Drivers', icon: Users },
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

  // Public pages without layout (Home is always shown as-is regardless of user state)
  const noLayoutPages = ['Home', 'AdminLogin', 'DriverLogin', 'PassengerLogin', 'EmployeeLogin', 'EmployeeComplaintForm', 'EmployeeComplaintHistory'];
  if (currentPageName === 'Home' || noLayoutPages.includes(currentPageName)) {
    return (
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
    );
  }

  // If no user on protected pages, show error boundary
  if (!user) {
   return <ErrorBoundary>{children}</ErrorBoundary>;
  }

  // Route guard: Protect admin pages
  const adminPages = ['Drivers', 'Students', 'VehicleManagement', 'Vehicles', 'Dashboard', 'Trips', 'Maintenance', 'Accidents', 'Reports', 'DailyReports', 'GeneralServiceJobs', 'PurchaseReports', 'Housing', 'History', 'ResponseHistory', 'Settings', 'FuelRecords', 'Purchases', 'Maintenance', 'LiveTrips', 'ConsolidatedReports', 'EmployeeComplaints'];
  if (adminPages.includes(currentPageName) && user?.role !== 'admin') {
    return <ErrorBoundary>{children}</ErrorBoundary>;
  }

  // Route guard: Protect NotificationSettings (admin + drivers only)
  if (currentPageName === 'NotificationSettings' && user?.role !== 'admin' && user?.user_type !== 'driver') {
    return <ErrorBoundary>{children}</ErrorBoundary>;
  }

  // Route guard: Protect driver pages (but NotificationSettings is allowed for admins too)
  const driverPages = ['DriverDashboard', 'DriverRequests', 'DriverTrips', 'DriverHistory'];
  if (driverPages.includes(currentPageName) && user?.user_type !== 'driver') {
    return <ErrorBoundary>{children}</ErrorBoundary>;
  }

  // Driver vehicle selection is skipped - go straight to Home
  // Home page handles redirects based on user state

  // Route guard: Protect passenger pages
  const passengerPages = ['PassengerTrips'];
  if (passengerPages.includes(currentPageName) && user?.user_type !== 'passenger') {
    return <ErrorBoundary>{children}</ErrorBoundary>;
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
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 z-40 px-4 flex items-center justify-between select-none">
        <div className="flex items-center gap-3">
          {needsBackButton() ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="select-none"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          ) : (
            <>
              <div className="w-9 h-9 rounded-lg overflow-hidden">
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6962e1b8eae90299f24a170a/a12aa5730_Addaheading.jpg" 
                  alt="EDP Fleetia"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-semibold text-slate-800 dark:text-slate-100">Fleetia</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {isDriver && <NotificationCenter user={user} />}
          {!isDriver && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="select-none"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          )}
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
        "fixed top-16 left-0 bottom-0 w-72 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 z-50 transform transition-transform duration-300 lg:top-0 lg:translate-x-0 flex flex-col",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
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

        <div className="lg:hidden p-4 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800">
          <div className="flex items-center gap-3 px-3 py-2 mb-3 bg-slate-50 dark:bg-slate-700 rounded-lg select-none">
            <div className="w-10 h-10 bg-slate-200 dark:bg-slate-600 rounded-full flex items-center justify-center flex-shrink-0">
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
            className="w-full justify-start text-slate-600 dark:text-slate-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 select-none"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn(
        "lg:pl-72 pt-16 lg:pt-16 min-h-screen flex flex-col",
        mobileNavItems.length > 0 && "pb-20 lg:pb-0"
      )}>
        {isMainTab && window.innerWidth < 1024 ? (
          <div className="p-4 lg:p-8 flex-1">
            <TabContainer
              tabs={mobileNavItems.map(item => ({
                id: item.page,
                content: currentPageName === item.page ? children : null
              }))}
              currentTab={currentPageName}
            />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: isMainTab ? 0 : 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: isMainTab ? 0 : -10 }}
              transition={{ duration: isMainTab ? 0.15 : 0.2 }}
              className="p-4 lg:p-8 flex-1"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        )}
        <footer className="py-4 px-8 text-center text-sm text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 select-none">
          Design by <span className="font-medium text-slate-700 dark:text-slate-300">Glitch Media Lab</span>
        </footer>
      </main>

      {/* Bottom Tab Bar - Mobile Only */}
      {mobileNavItems.length > 0 && (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 z-50 select-none" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
          <div className="flex justify-around items-center h-16 px-2">
            {mobileNavItems.map((item) => {
              const isActive = currentPageName === item.page;
              return (
                <button
                  key={item.page}
                  onClick={(e) => handleMobileTabClick(e, item.page)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 flex-1 py-2 rounded-lg transition-all duration-200 select-none active:scale-95",
                    isActive 
                      ? "text-teal-600 dark:text-teal-400" 
                      : "text-slate-500 dark:text-slate-400"
                  )}
                >
                  <item.icon className={cn(
                    "w-6 h-6 transition-transform",
                    isActive && "text-teal-600 dark:text-teal-400 scale-110"
                  )} />
                  <span className="text-xs font-medium">{item.name}</span>
                  {isActive && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-teal-600 dark:bg-teal-400 rounded-t-full" />
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      )}
      </div>
      </ErrorBoundary>
      );
      }