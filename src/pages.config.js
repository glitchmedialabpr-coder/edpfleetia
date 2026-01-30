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
import DriverHistory from './pages/DriverHistory';
import DriverLogin from './pages/DriverLogin';
import DriverRequests from './pages/DriverRequests';
import DriverTrips from './pages/DriverTrips';
import Drivers from './pages/Drivers';
import FuelRecords from './pages/FuelRecords';
import History from './pages/History';
import Home from './pages/Home';
import Housing from './pages/Housing';
import LiveTrips from './pages/LiveTrips';
import Maintenance from './pages/Maintenance';
import PassengerLogin from './pages/PassengerLogin';
import PassengerTrips from './pages/PassengerTrips';
import Purchases from './pages/Purchases';
import ResponseHistory from './pages/ResponseHistory';
import ShareLinks from './pages/ShareLinks';
import Students from './pages/Students';
import Trips from './pages/Trips';
import Vehicles from './pages/Vehicles';
import Warnings from './pages/Warnings';
import DriverSchedule from './pages/DriverSchedule';
import Notifications from './pages/Notifications';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Accidents": Accidents,
    "AdminLogin": AdminLogin,
    "DailyReports": DailyReports,
    "Dashboard": Dashboard,
    "DriverAcceptedStudents": DriverAcceptedStudents,
    "DriverHistory": DriverHistory,
    "DriverLogin": DriverLogin,
    "DriverRequests": DriverRequests,
    "DriverTrips": DriverTrips,
    "Drivers": Drivers,
    "FuelRecords": FuelRecords,
    "History": History,
    "Home": Home,
    "Housing": Housing,
    "LiveTrips": LiveTrips,
    "Maintenance": Maintenance,
    "PassengerLogin": PassengerLogin,
    "PassengerTrips": PassengerTrips,
    "Purchases": Purchases,
    "ResponseHistory": ResponseHistory,
    "ShareLinks": ShareLinks,
    "Students": Students,
    "Trips": Trips,
    "Vehicles": Vehicles,
    "Warnings": Warnings,
    "DriverSchedule": DriverSchedule,
    "Notifications": Notifications,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};