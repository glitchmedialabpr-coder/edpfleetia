/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import Accidents from './pages/Accidents';
import AdminLogin from './pages/AdminLogin';
import ConsolidatedReports from './pages/ConsolidatedReports';
import DailyReports from './pages/DailyReports';
import Dashboard from './pages/Dashboard';
import DriverDashboard from './pages/DriverDashboard';
import DriverHistory from './pages/DriverHistory';
import DriverLogin from './pages/DriverLogin';
import DriverNotificationSettings from './pages/DriverNotificationSettings';
import DriverRequests from './pages/DriverRequests';
import DriverSchedule from './pages/DriverSchedule';
import DriverTrips from './pages/DriverTrips';
import Drivers from './pages/Drivers';
import EmployeeComplaintForm from './pages/EmployeeComplaintForm';
import EmployeeComplaintHistory from './pages/EmployeeComplaintHistory';
import EmployeeComplaints from './pages/EmployeeComplaints';
import EmployeeLogin from './pages/EmployeeLogin';
import FuelRecords from './pages/FuelRecords';
import GeneralServiceJobs from './pages/GeneralServiceJobs';
import GeneralServicePurchases from './pages/GeneralServicePurchases';
import History from './pages/History';
import Home from './pages/Home';
import Housing from './pages/Housing';
import Index from './pages/Index';
import LiveTrips from './pages/LiveTrips';
import Maintenance from './pages/Maintenance';
import NotificationSettings from './pages/NotificationSettings';
import PassengerLogin from './pages/PassengerLogin';
import PassengerTrips from './pages/PassengerTrips';
import Presentation from './pages/Presentation';
import PurchaseReports from './pages/PurchaseReports';
import Purchases from './pages/Purchases';
import Reports from './pages/Reports';
import ResponseHistory from './pages/ResponseHistory';
import Settings from './pages/Settings';
import ShareLinks from './pages/ShareLinks';
import Students from './pages/Students';
import Trips from './pages/Trips';
import VehicleManagement from './pages/VehicleManagement';
import Vehicles from './pages/Vehicles';
import Warnings from './pages/Warnings';
import DriverVehicleSelection from './pages/DriverVehicleSelection';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Accidents": Accidents,
    "AdminLogin": AdminLogin,
    "ConsolidatedReports": ConsolidatedReports,
    "DailyReports": DailyReports,
    "Dashboard": Dashboard,
    "DriverDashboard": DriverDashboard,
    "DriverHistory": DriverHistory,
    "DriverLogin": DriverLogin,
    "DriverNotificationSettings": DriverNotificationSettings,
    "DriverRequests": DriverRequests,
    "DriverSchedule": DriverSchedule,
    "DriverTrips": DriverTrips,
    "Drivers": Drivers,
    "EmployeeComplaintForm": EmployeeComplaintForm,
    "EmployeeComplaintHistory": EmployeeComplaintHistory,
    "EmployeeComplaints": EmployeeComplaints,
    "EmployeeLogin": EmployeeLogin,
    "FuelRecords": FuelRecords,
    "GeneralServiceJobs": GeneralServiceJobs,
    "GeneralServicePurchases": GeneralServicePurchases,
    "History": History,
    "Home": Home,
    "Housing": Housing,
    "Index": Index,
    "LiveTrips": LiveTrips,
    "Maintenance": Maintenance,
    "NotificationSettings": NotificationSettings,
    "PassengerLogin": PassengerLogin,
    "PassengerTrips": PassengerTrips,
    "Presentation": Presentation,
    "PurchaseReports": PurchaseReports,
    "Purchases": Purchases,
    "Reports": Reports,
    "ResponseHistory": ResponseHistory,
    "Settings": Settings,
    "ShareLinks": ShareLinks,
    "Students": Students,
    "Trips": Trips,
    "VehicleManagement": VehicleManagement,
    "Vehicles": Vehicles,
    "Warnings": Warnings,
    "DriverVehicleSelection": DriverVehicleSelection,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};