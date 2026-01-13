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
import __Layout from './Layout.jsx';


export const PAGES = {
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
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};