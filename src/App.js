import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import "./App.css";
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
import Account from "./pages/Account";
import { useState, useEffect, useCallback, useRef } from "react";

// New AppContent component that contains the routing logic
function AppContent() {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const isSelectionMode = location.search.includes("mode=select");
  const isNewOrderPath = location.pathname.includes("/new-order");
  const cleanupInProgress = useRef(false);

  // Initialize selected products from localStorage only when needed
  useEffect(() => {
    // Only initialize if we're in the new order path and not in selection mode
    if (isNewOrderPath && !isSelectionMode && !cleanupInProgress.current) {
      const saved = localStorage.getItem("selectedProducts");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Only set if we're in the order form view (not in type/option selection)
          const orderType = localStorage.getItem("newOrderType");
          const orderOption = localStorage.getItem("newOrderOption");
          if (orderType && orderOption === "portal") {
            setSelectedProducts(parsed);
          } else {
            // Clear selected products if we're not in the order form view
            setSelectedProducts([]);
            localStorage.removeItem("selectedProducts");
          }
        } catch (e) {
          console.error("Error parsing selected products:", e);
          localStorage.removeItem("selectedProducts");
          setSelectedProducts([]);
        }
      }
    }
  }, [isNewOrderPath, isSelectionMode]);

  // Memoize the cleanup function to prevent unnecessary re-renders
  const cleanup = useCallback(() => {
    if (cleanupInProgress.current) return;

    cleanupInProgress.current = true;
    try {
      // Only cleanup when leaving the new order flow completely
      if (!isNewOrderPath && !isSelectionMode) {
        setSelectedProducts([]);
        const keysToRemove = [
          "selectedProducts",
          "orderProducts",
          "orderWarehouse",
          "orderDate",
          "orderPickupTime",
          "orderDestination",
          "newOrderType",
          "newOrderOption",
        ];
        keysToRemove.forEach((key) => localStorage.removeItem(key));
      }
    } finally {
      cleanupInProgress.current = false;
    }
  }, [isNewOrderPath, isSelectionMode]);

  // Handle navigation and cleanup
  useEffect(() => {
    // Only cleanup when actually leaving the new order flow
    if (!isNewOrderPath && !isSelectionMode) {
      cleanup();
    }
    return () => {
      if (!isNewOrderPath && !isSelectionMode) {
        cleanup();
      }
    };
  }, [cleanup, location.pathname, isNewOrderPath, isSelectionMode]);

  // Memoize the product selection handler
  const handleProductSelect = useCallback(
    (product) => {
      if (cleanupInProgress.current) return;

      // Prevent duplicate products
      if (selectedProducts.some((p) => p.id === product.id)) {
        return;
      }

      // Create new product with quantity
      const newProduct = { ...product, quantity: 1 };

      // Update state and localStorage atomically
      const updatedProducts = [...selectedProducts, newProduct];
      setSelectedProducts(updatedProducts);
      localStorage.setItem("selectedProducts", JSON.stringify(updatedProducts));

      // Navigate back to order form while preserving the form state
      const orderType = localStorage.getItem("newOrderType");
      const orderOption = localStorage.getItem("newOrderOption");
      if (orderType && orderOption === "portal") {
        // Use navigate with replace to prevent back button issues
        navigate("/new-order", { replace: true });
      }
    },
    [selectedProducts, navigate]
  );

  // Memoize the clear products handler
  const clearSelectedProducts = useCallback(() => {
    if (cleanupInProgress.current) return;

    cleanupInProgress.current = true;
    try {
      setSelectedProducts([]);
      localStorage.removeItem("selectedProducts");
    } finally {
      cleanupInProgress.current = false;
    }
  }, []);

  return (
    <div className="App">
      <Sidebar />
      <div className="container">
        <Navbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/trip-history" element={<TripHistory />} />
          <Route
            path="/new-order"
            element={
              <NewOrder
                key={location.pathname + location.search}
                selectedProducts={selectedProducts}
                onClearProducts={clearSelectedProducts}
              />
            }
          />
          <Route path="/dispatch-order" element={<DispatchOrder />} />
          <Route path="/todays-trips" element={<TodaysTrips />} />
          <Route path="/users" element={<Users />} />
          <Route path="/organizations" element={<Organizations />} />
          <Route path="/locations" element={<Locations />} />
          <Route
            path="/products"
            element={
              isSelectionMode ? (
                <Products
                  key="selection-mode"
                  isSelectionMode={true}
                  onProductSelect={handleProductSelect}
                />
              ) : (
                <Products key="normal-mode" />
              )
            }
          />
          <Route path="/cars" element={<Cars />} />
          <Route path="/account" element={<Account />} />
        </Routes>
      </div>
    </div>
  );
}

// Main App component that wraps AppContent with Router
export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
