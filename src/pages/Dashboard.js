"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";
import { ordersService } from "../services/orders";
import { tripsService } from "../services/trips";
import { productsService } from "../services/products";
import { vehiclesService } from "../services/vehicles";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import CircularProgress from '@mui/material/CircularProgress';

// Section Header Component
const SectionHeader = ({ title, hasViewAll = true, onViewAll, children }) => (
  <div className="section-header">
    <h2>{title}</h2>
    {hasViewAll && onViewAll && (
      <button className="link-button" onClick={onViewAll}>
        View All
      </button>
    )}
    {children}
  </div>
);

// More Options Icon Component
const MoreOptionsIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="1"></circle>
    <circle cx="19" cy="12" r="1"></circle>
    <circle cx="5" cy="12" r="1"></circle>
  </svg>
);

// Helper function to get products from localStorage
const getStoredProducts = () => {
  try {
    const saved = localStorage.getItem("products");
    if (saved) {
      return JSON.parse(saved);
    }
    return [];
  } catch (error) {
    console.error("Error loading products from localStorage:", error);
    return [];
  }
};

// Cargo Item Component
const CargoItem = ({ product }) => (
  <div className="card cargo-item fade-in">
    <div className="cargo-header">
      <span className="cargo-id">{product.sku}</span>
    </div>
    <div className="cargo-details">
      <div className="cargo-info">
        <div className="cargo-metric">
          <span className="metric-label">Number of Boxes</span>
          <span className="metric-value">{product.number_of_boxes || 1}</span>
        </div>
      </div>
    </div>
  </div>
);

// Available Cargo Component (uses real API)
const AvailableCargo = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await productsService.getProducts();
        setProducts(Array.isArray(response.products) ? response.products.slice(0, 5) : []);
      } catch (err) {
        setError("Failed to load cargo products.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) return <div className="grid-item">Loading...</div>;
  if (error) return <div className="grid-item">{error}</div>;

  return (
    <div className="grid-item">
      <SectionHeader
        title="Available Cargo"
        onViewAll={() => navigate("/products")}
      />
      <div className="cargo-list" style={{ maxHeight: 200, overflowY: 'auto', paddingRight: 4 }}>
        {products.map((product) => (
          <CargoItem key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

// Helper function to describe an arc
const describeArc = (cx, cy, r, startAngle, endAngle) => {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return [
    "M", cx, cy,
    "L", start.x, start.y,
    "A", r, r, 0, largeArcFlag, 0, end.x, end.y,
    "Z"
  ].join(" ");
};

function polarToCartesian(cx, cy, r, angleInDegrees) {
  var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;
  return {
    x: cx + (r * Math.cos(angleInRadians)),
    y: cy + (r * Math.sin(angleInRadians))
  };
}

// Truck Statistics Chart Component (fetches real API data)
const TruckStatsChart = ({ vehicles }) => {
  // Count vehicles by status
  const active = vehicles.filter(v => (v.status || '').toLowerCase() === 'active').length;
  const inactive = vehicles.filter(v => (v.status || '').toLowerCase() === 'inactive').length;
  const maintenance = vehicles.filter(v => (v.status || '').toLowerCase() === 'maintenance').length;
  const total = active + inactive + maintenance;

  // Calculate angles for each status
  const activeAngle = total ? (active / total) * 360 : 0;
  const inactiveAngle = total ? (inactive / total) * 360 : 0;
  const maintenanceAngle = total ? (maintenance / total) * 360 : 0;

  // Pie chart sectors
  let startAngle = 0;
  const sectors = [
    { label: 'Active', value: active, color: '#059669', angle: activeAngle },
    { label: 'Inactive', value: inactive, color: '#9ca3af', angle: inactiveAngle },
    { label: 'Maintenance', value: maintenance, color: '#f59e42', angle: maintenanceAngle },
  ].map((sector) => {
    const endAngle = startAngle + sector.angle;
    const path = describeArc(45, 45, 40, startAngle, endAngle);
    const result = { ...sector, path, startAngle, endAngle };
    startAngle = endAngle;
    return result;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ position: 'relative', height: 90, width: 90, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width={90} height={90} viewBox="0 0 90 90">
          {sectors.map((sector, idx) => (
            sector.value > 0 && (
              <path
                key={sector.label}
                d={sector.path}
                fill={sector.color}
                stroke="#fff"
                strokeWidth={1}
            />
            )
          ))}
        </svg>
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, color: '#001d66', marginTop: 8 }}>
        {vehicles.length}
      </div>
      <div className="chart-label" style={{ fontSize: 14, color: '#6b7280', textAlign: 'center', marginTop: 4 }}>Total Trucks</div>
    </div>
  );
};

const LoadingTrucks = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await vehiclesService.getVehicles();
        setVehicles(Array.isArray(data) ? data : []);
      } catch (err) {
        setError("Failed to load trucks.");
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, []);

  if (loading) return <div className="grid-item">Loading...</div>;
  if (error) return <div className="grid-item">{error}</div>;

  return (
    <div className="grid-item" style={{ height: 'auto', alignSelf: 'flex-start' }}>
      <div className="card truck-stats" style={{ padding: '36px 36px 0 36px', background: '#f8fafc', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginBottom: 24, height: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ fontWeight: 600, fontSize: 22, color: '#111827', marginBottom: 24, textAlign: 'center' }}>Loading Trucks</div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          <div style={{ marginBottom: 24, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <TruckStatsChart vehicles={vehicles} />
          </div>
          <div className="stats-grid" style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            width: '100%', 
            fontSize: 15, 
            marginBottom: 0,
            padding: '0 8px'
          }}>
            {[
              { label: "Active", value: vehicles.filter(v => (v.status || '').toLowerCase() === 'active').length, color: "#059669" },
              { label: "Inactive", value: vehicles.filter(v => (v.status || '').toLowerCase() === 'inactive').length, color: "#9ca3af" },
              { label: "Maintenance", value: vehicles.filter(v => (v.status || '').toLowerCase() === 'maintenance').length, color: "#f59e42" },
            ].map((stat, idx) => (
              <div key={idx} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 8,
                flex: 1,
                justifyContent: 'center'
              }}>
                <span style={{ 
                  display: 'inline-block', 
                  width: 12, 
                  height: 12, 
                  borderRadius: '50%', 
                  background: stat.color,
                  flexShrink: 0
                }}></span>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <span style={{ fontSize: 13, color: '#6b7280' }}>{stat.label}</span>
                  <span style={{ fontWeight: 700, fontSize: 16, color: '#111827' }}>{stat.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Trip Item Component
const TripItem = ({ trip, onViewDetails }) => (
  <div className="card trip-item fade-in">
    <div className="trip-header">
      <div className="trip-id-container">
        <div className="trip-icon">🚛</div>
        <span className="trip-id">Trip {trip.id}</span>
      </div>
      <span className={`status-badge status-${trip.statusColor || trip.status?.toLowerCase()}`}>{trip.status}</span>
    </div>
    <div className="trip-details">
      {(trip.locations || []).map((location, idx) => (
        <div key={idx} className="location-item">
          <div className="location-header">
            <div className={`location-dot ${location.type?.toLowerCase?.()}`}></div>
            <span>{location.type}</span>
          </div>
          <p className="location-address">{location.address}</p>
          <p className="location-time">{location.time}</p>
        </div>
      ))}
    </div>
    <div className="trip-footer">
      <button
        className="link-button"
        onClick={(e) => {
          e.stopPropagation();
          onViewDetails(trip.id);
        }}
      >
        View Details
      </button>
    </div>
  </div>
);

// Today's Trips Component (uses real API)
const TodaysTrips = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        setLoading(true);
        setError(null);
        const today = new Date().toISOString().split("T")[0];
        const allTripsResponse = await tripsService.getTrips({ date: today });
        setTrips(Array.isArray(allTripsResponse?.trips) ? allTripsResponse.trips : []);
      } catch (err) {
        setError("Failed to load today's trips.");
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

  const handleViewDetails = (tripId) => {
    navigate(`/todays-trips?order=${tripId}`);
  };

  if (loading) return <div className="grid-item">Loading...</div>;
  if (error) return <div className="grid-item">{error}</div>;

  return (
    <div className="grid-item">
      <SectionHeader
        title="Today's Trips"
        onViewAll={() => navigate("/todays-trips")}
      />
      <div className="trips-list">
        {trips.map((trip) => (
          <TripItem
            key={trip.id}
            trip={trip}
            onViewDetails={handleViewDetails}
          />
        ))}
      </div>
    </div>
  );
};

// Status Badge Component
const StatusBadge = ({ status }) => {
  const getStatusClass = (status) => {
    switch (status) {
      case "Delivered":
        return "status-delivered";
      case "Active":
        return "status-active";
      case "Canceled":
        return "status-canceled";
      default:
        return "";
    }
  };
  return (
    <span className={`status-badge ${getStatusClass(status)}`}>{status}</span>
  );
};

// Helper function to map trip data for the table (copied from TripHistory.js)
function mapTripData(trip) {
  const orders = trip.orders || [];
  const firstOrder = orders[0] || {};
  return {
    id: trip.id,
    status: trip.status || '-',
    departureDate: firstOrder.delivery_deadline ? firstOrder.delivery_deadline.slice(0, 10) : '-',
    weight: orders.reduce((sum, o) => sum + (parseFloat(o.total_weight) || 0), 0),
    assignedCar: trip.vehicle?.plate_number || '-',
    raw: trip
  };
}

// Trip's History Component (uses real API)
const TripsHistory = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        setLoading(true);
        setError(null);
        const allTripsResponse = await tripsService.getTrips();
        setTrips(Array.isArray(allTripsResponse?.trips) ? allTripsResponse.trips.slice(0, 5) : []);
      } catch (err) {
        setError("Failed to load trip history.");
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

  if (loading) return <div className="grid-item full-width">Loading...</div>;
  if (error) return <div className="grid-item full-width">{error}</div>;

  return (
    <div className="grid-item full-width">
      <SectionHeader
        title="Trip's History"
        onViewAll={() => navigate("/trip-history")}
      />
      <div className="card">
        <div className="table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>TRIP ID</th>
                <th>STATUS</th>
                <th>DEPARTURE DATE</th>
                <th>WEIGHT</th>
                <th>ASSIGNED CAR</th>
              </tr>
            </thead>
            <tbody>
              {trips.map(mapTripData).map((trip) => (
                <tr key={trip.id} className="fade-in">
                  <td className="order-id">{trip.id}</td>
                  <td><StatusBadge status={trip.status} /></td>
                  <td>{trip.departureDate}</td>
                  <td>{trip.weight}</td>
                  <td>{trip.assignedCar}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Utilization Rate Card with Bar Chart
const UtilizationRateCard = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        setLoading(true);
        setError(null);
        const allTripsResponse = await tripsService.getTrips();
        setTrips(Array.isArray(allTripsResponse?.trips) ? allTripsResponse.trips : []);
      } catch (err) {
        setError("Failed to load trips.");
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

  if (loading) return <div className="grid-item">Loading...</div>;
  if (error) return <div className="grid-item">{error}</div>;

  const totalTrips = trips.length;
  const totalOrders = trips.reduce((sum, t) => sum + (t.orders?.length || 0), 0);
  const utilizationRate = totalTrips > 0 ? (totalOrders / totalTrips) : 0;
  const chartData = trips.map(t => ({ name: `Trip ${t.id}`, orders: t.orders?.length || 0 }));

  return (
    <div className="card utilization-rate-card fade-in" style={{ padding: 24, background: '#f8fafc', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginBottom: 16, minHeight: 280, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
      <div style={{ marginBottom: 16, fontWeight: 600, fontSize: 18, color: '#111827' }}>Utilization Rate</div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 24, color: '#2563eb' }}>{utilizationRate.toFixed(2)} <span style={{ fontWeight: 400, fontSize: 14, color: '#6b7280' }}>orders/trip</span></div>
        <div style={{ color: '#9ca3af', fontSize: 12, marginBottom: 8 }}>Total Orders: {totalOrders} / Total Trips: {totalTrips}</div>
        <div style={{ width: '100%', height: 120, minHeight: 120 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
              <XAxis dataKey="name" fontSize={12} tick={{ fill: '#6b7280' }} interval={0} angle={-15} height={50} />
              <YAxis allowDecimals={false} fontSize={12} tick={{ fill: '#6b7280' }} />
              <Tooltip />
              <Bar dataKey="orders" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// Fulfillment Rate Card with Donut Chart
const FulfillmentRateCard = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        setLoading(true);
        setError(null);
        const allTripsResponse = await tripsService.getTrips();
        setTrips(Array.isArray(allTripsResponse?.trips) ? allTripsResponse.trips : []);
      } catch (err) {
        setError("Failed to load trips.");
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

  if (loading) return <div className="grid-item">Loading...</div>;
  if (error) return <div className="grid-item">{error}</div>;

  const totalTrips = trips.length;
  const completedTrips = trips.filter(t => (t.status || '').toLowerCase() === 'completed').length;
  const fulfillmentRate = totalTrips > 0 ? (completedTrips / totalTrips) * 100 : 0;

  return (
    <div className="card fulfillment-rate-card fade-in" style={{ padding: 36, background: '#f8fafc', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginBottom: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: 260 }}>
      <div style={{ marginBottom: 24, fontWeight: 600, fontSize: 22, color: '#111827' }}>Fulfillment Rate</div>
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 12 }}>
        <CircularProgress variant="determinate" value={fulfillmentRate} size={150} thickness={8} style={{ color: '#059669', background: '#e5e7eb', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', top: '50%', left: 0, width: 150, textAlign: 'center', fontWeight: 700, fontSize: 28, color: '#059669', lineHeight: 1, transform: 'translateY(-50%)' }}>{fulfillmentRate.toFixed(1)}%</div>
      </div>
      <div style={{ color: '#9ca3af', fontSize: 14 }}>({completedTrips}/{totalTrips}) trips completed</div>
    </div>
  );
};

// Main Dashboard Component
export default function Dashboard() {
  const handleLinkButtonClick = (e) => {
    console.log("View All clicked for:", e.target.textContent);
  };

  const handleMoreOptionsClick = () => {
    console.log("More options clicked");
  };

  useEffect(() => {
    // Add event listeners for interactive features
    const linkButtons = document.querySelectorAll(".link-button");
    const ghostButtons = document.querySelectorAll(".ghost-button");

    linkButtons.forEach((button) => {
      button.addEventListener("click", handleLinkButtonClick);
    });

    ghostButtons.forEach((button) => {
      button.addEventListener("click", handleMoreOptionsClick);
    });

    // Cleanup event listeners
    return () => {
      linkButtons.forEach((button) => {
        button.removeEventListener("click", handleLinkButtonClick);
      });
      ghostButtons.forEach((button) => {
        button.removeEventListener("click", handleMoreOptionsClick);
      });
    };
  }, []);

  return (
    <div className="dashboard">
      <div className="dashboard-grid">
        {/* Left Column - Top Section */}
        <div className="left-column">
          <div className="top-section">
            <AvailableCargo />
            <UtilizationRateCard />
            <FulfillmentRateCard />
            <LoadingTrucks />
          </div>
          <div className="bottom-section" style={{ marginTop: '100px' }}>
            <TripsHistory />
          </div>
        </div>
        {/* Right Column - Today's Trips */}
        <div className="right-column">
          <TodaysTrips />
        </div>
      </div>
    </div>
  );
}
