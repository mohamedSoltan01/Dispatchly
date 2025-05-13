import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./pages/Navbar";
import Dashboard from "./pages/Dashboard";
import NewOrder from "./pages/NewOrder";
import TripHistory from "./pages/TripHistory";
import DispatchOrder from "./pages/DispatchOrder";
import TodaysTrips from "./pages/TodaysTrips";
import Users from "./pages/Users";
import Organizations from "./pages/Organizations";
import Locations from "./pages/Locations";
import Products from "./pages/Products";
import Cars from "./pages/Cars";

export default function App() {
  return (
    <Router>
      <div className="App">
        <Sidebar />
        <div className="container">
          <Navbar />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/trip-history" element={<TripHistory />} />
            <Route path="/new-order" element={<NewOrder />} />
            <Route path="/dispatch-order" element={<DispatchOrder />} />
            <Route path="/todays-trips" element={<TodaysTrips />} />
            <Route path="/users" element={<Users />} />
            <Route path="/organizations" element={<Organizations />} />
            <Route path="/locations" element={<Locations />} />
            <Route path="/products" element={<Products />} />
            <Route path="/cars" element={<Cars />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}
