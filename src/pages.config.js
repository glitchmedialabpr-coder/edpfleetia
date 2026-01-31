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
import DailyReports from './pages/DailyReports';
import Dashboard from './pages/Dashboard';
import DriverAcceptedStudents from './pages/DriverAcceptedStudents';
import DriverDashboard from './pages/DriverDashboard';
import DriverHistory from './pages/DriverHistory';
import DriverLogin from './pages/DriverLogin';
import DriverNotificationSettings from './pages/DriverNotificationSettings';
import DriverRequests from './pages/DriverRequests';
import DriverSchedule from './pages/DriverSchedule';
import DriverTrips from './pages/DriverTrips';
import DriverVehicleSelection from './pages/DriverVehicleSelection';
import Drivers from './pages/Drivers';
import FuelRecords from './pages/FuelRecords';
import GeneralServiceJobs from './pages/GeneralServiceJobs';
import GeneralServicePurchases from './pages/GeneralServicePurchases';
import History from './pages/History';
import Home from './pages/Home';
import Housing from './pages/Housing';
import LiveTrips from './pages/LiveTrips';
import Maintenance from './pages/Maintenance';
import Notifications from './pages/Notifications';
import PassengerLogin from './pages/PassengerLogin';
import PassengerTrips from './pages/PassengerTrips';
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
import VideoSplash from './pages/VideoSplash';
import Warnings from './pages/Warnings';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Accidents": Accidents,
    "AdminLogin": AdminLogin,
    "DailyReports": DailyReports,
    "Dashboard": Dashboard,
    "DriverAcceptedStudents": DriverAcceptedStudents,
    "DriverDashboard": DriverDashboard,
    "DriverHistory": DriverHistory,
    "DriverLogin": DriverLogin,
    "DriverNotificationSettings": DriverNotificationSettings,
    "DriverRequests": DriverRequests,
    "DriverSchedule": DriverSchedule,
    "DriverTrips": DriverTrips,
    "DriverVehicleSelection": DriverVehicleSelection,
    "Drivers": Drivers,
    "FuelRecords": FuelRecords,
    "GeneralServiceJobs": GeneralServiceJobs,
    "GeneralServicePurchases": GeneralServicePurchases,
    "History": History,
    "Home": Home,
    "Housing": Housing,
    "LiveTrips": LiveTrips,
    "Maintenance": Maintenance,
    "Notifications": Notifications,
    "PassengerLogin": PassengerLogin,
    "PassengerTrips": PassengerTrips,
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
    "VideoSplash": VideoSplash,
    "Warnings": Warnings,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};