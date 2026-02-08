import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { createPageUrl } from '@/utils';
import { Bus } from 'lucide-react';

export function AuthRouter({ children, currentPageName }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Show loading screen while validating session
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

  // Public pages - accessible without auth
  const publicPages = ['Home', 'AdminLogin', 'DriverLogin', 'PassengerLogin', 'EmployeeLogin', 'EmployeeComplaintForm', 'EmployeeComplaintHistory'];
  const isPublicPage = publicPages.includes(currentPageName);

  // No auth required - show public page
  if (isPublicPage) {
    return children;
  }

  // Auth required pages - redirect to Home if no session
  if (!user) {
    // Auto-redirect to Home if trying to access protected page without auth
    React.useEffect(() => {
      navigate(createPageUrl('Home'), { replace: true });
    }, []);
    return null;
  }

  // Enforce role-based routing
  const adminPages = [
    'Dashboard', 'Drivers', 'Students', 'VehicleManagement', 'Vehicles',
    'Trips', 'Maintenance', 'Accidents', 'Reports', 'DailyReports',
    'GeneralServiceJobs', 'PurchaseReports', 'Housing', 'History',
    'ResponseHistory', 'Settings', 'FuelRecords', 'Purchases', 'LiveTrips',
    'ConsolidatedReports', 'EmployeeComplaints'
  ];

  const driverPages = ['DriverDashboard', 'DriverRequests', 'DriverTrips', 'DriverHistory', 'NotificationSettings'];
  const studentPages = ['PassengerTrips'];

  // Admin trying to access driver/student pages
  if (adminPages.includes(currentPageName) && user?.role !== 'admin') {
    React.useEffect(() => {
      navigate(createPageUrl('Home'), { replace: true });
    }, []);
    return null;
  }

  // Driver trying to access admin/student pages
  if (driverPages.includes(currentPageName) && user?.user_type !== 'driver') {
    React.useEffect(() => {
      navigate(createPageUrl('Home'), { replace: true });
    }, []);
    return null;
  }

  // Student trying to access admin/driver pages
  if (studentPages.includes(currentPageName) && user?.user_type !== 'passenger') {
    React.useEffect(() => {
      navigate(createPageUrl('Home'), { replace: true });
    }, []);
    return null;
  }

  // All checks passed - render protected page
  return children;
}