import Accidents from './pages/Accidents';
import Dashboard from './pages/Dashboard';
import DriverHistory from './pages/DriverHistory';
import DriverTrips from './pages/DriverTrips';
import Drivers from './pages/Drivers';
import History from './pages/History';
import Housing from './pages/Housing';
import Maintenance from './pages/Maintenance';
import Students from './pages/Students';
import Trips from './pages/Trips';
import Vehicles from './pages/Vehicles';
import DailyReports from './pages/DailyReports';
import Warnings from './pages/Warnings';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Accidents": Accidents,
    "Dashboard": Dashboard,
    "DriverHistory": DriverHistory,
    "DriverTrips": DriverTrips,
    "Drivers": Drivers,
    "History": History,
    "Housing": Housing,
    "Maintenance": Maintenance,
    "Students": Students,
    "Trips": Trips,
    "Vehicles": Vehicles,
    "DailyReports": DailyReports,
    "Warnings": Warnings,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};