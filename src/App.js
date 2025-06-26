import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
  Navigate,
} from "react-router-dom";
import "./App.css";
import Sidebar from "./Sidebar";
import Navbar from "./pages/Navbar";
import SignIn from "./pages/SignIn";
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
import Notifications from "./pages/notifications";
import OrdersHistory from "./pages/OrdersHistory";
import {
  useState,
  useEffect,
  useCallback,
  useRef,
  createContext,
  useContext,
} from "react";
import { hasAccess } from "./SidebarData";

// Create Auth Context
export const AuthContext = createContext(null);

// Auth Provider Component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Protected Route Component
function ProtectedRoute({ children }) {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  // Debug log
  console.log('ProtectedRoute user:', user, 'location:', location.pathname);

  if (!user) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // Special case for account and notifications pages - all authenticated users should have access
  if (location.pathname === "/account" || location.pathname === "/notifications") {
    return children;
  }

  // Check if user has access to the current route
  if (!hasAccess(user.role?.toLowerCase?.(), location.pathname)) {
    // Redirect to first accessible route if user doesn't have access
    return <Navigate to={getFirstAccessibleRoute(user)} replace />;
  }

  return children;
}

// Helper function to get the first accessible route for a user
const getFirstAccessibleRoute = (user) => {
  if (!user || !user.role) return "/signin";

  // Define the order of routes to check
  const routeOrder = [
    "/dashboard",
    "/trip-history",
    "/new-order",
    "/locations",
    "/products",
    "/dispatch-order",
    "/todays-trips",
    "/users",
    "/organizations",
    "/cars",
    "/notifications",
  ];

  // Find the first route the user has access to
  for (const route of routeOrder) {
    if (hasAccess(user.role, route)) {
      return route;
    }
  }

  return "/signin"; // Fallback to signin if no accessible routes found
};

// New AppContent component that contains the routing logic
function AppContent() {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const isSelectionMode = location.search.includes("mode=select");
  const isNewOrderPath = location.pathname.includes("/new-order");
  const cleanupInProgress = useRef(false);

  // Debug log
  console.log('AppContent user:', user, 'location:', location.pathname);

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
      {user && <Sidebar />}
      <div className={`container ${!user ? "auth-container" : ""}`}>
        {user && <Navbar />}
        <Routes>
          <Route
            path="/signin"
            element={
              user ? (
                <Navigate to={getFirstAccessibleRoute(user)} replace />
              ) : (
                <SignIn />
              )
            }
          />

          <Route
            path="/"
            element={
              user ? (
                <Navigate to={getFirstAccessibleRoute(user)} replace />
              ) : (
                <Navigate to="/signin" replace />
              )
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/trip-history"
            element={
              <ProtectedRoute>
                <TripHistory />
              </ProtectedRoute>
            }
          />

          <Route
            path="/new-order"
            element={
              <ProtectedRoute>
                <NewOrder
                  key={location.pathname + location.search}
                  selectedProducts={selectedProducts}
                  onClearProducts={clearSelectedProducts}
                />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dispatch-order"
            element={
              <ProtectedRoute>
                <DispatchOrder />
              </ProtectedRoute>
            }
          />

          <Route
            path="/todays-trips"
            element={
              <ProtectedRoute>
                <TodaysTrips />
              </ProtectedRoute>
            }
          />

          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <Users />
              </ProtectedRoute>
            }
          />

          <Route
            path="/organizations"
            element={
              <ProtectedRoute>
                <Organizations />
              </ProtectedRoute>
            }
          />

          <Route
            path="/locations"
            element={
              <ProtectedRoute>
                <Locations />
              </ProtectedRoute>
            }
          />

          <Route
            path="/products"
            element={
              <ProtectedRoute>
                {isSelectionMode ? (
                  <Products
                    key="selection-mode"
                    isSelectionMode={true}
                    onProductSelect={handleProductSelect}
                  />
                ) : (
                  <Products key="normal-mode" />
                )}
              </ProtectedRoute>
            }
          />

          <Route
            path="/cars"
            element={
              <ProtectedRoute>
                <Cars />
              </ProtectedRoute>
            }
          />

          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            }
          />

          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders-history"
            element={
              <ProtectedRoute>
                <OrdersHistory />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </div>
  );
}

// Main App component that wraps AppContent with Router and AuthProvider
export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}
