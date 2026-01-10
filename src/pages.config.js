import Dashboard from './pages/Dashboard';
import Trips from './pages/Trips';
import Students from './pages/Students';
import Housing from './pages/Housing';
import Drivers from './pages/Drivers';
import History from './pages/History';
import DriverTrips from './pages/DriverTrips';
import DriverHistory from './pages/DriverHistory';
import Vehicles from './pages/Vehicles';
import Maintenance from './pages/Maintenance';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Trips": Trips,
    "Students": Students,
    "Housing": Housing,
    "Drivers": Drivers,
    "History": History,
    "DriverTrips": DriverTrips,
    "DriverHistory": DriverHistory,
    "Vehicles": Vehicles,
    "Maintenance": Maintenance,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};