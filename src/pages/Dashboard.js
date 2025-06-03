"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";
import { mockTripHistory } from "./TripHistory";

// Dashboard data
const dashboardData = {
  cargoOrders: [
    { id: "ORDERID01", progress: 20, from: "Alex", to: "Cairo" },
    { id: "ORDERID02", progress: 40, from: "Luxor", to: "Tanta" },
    { id: "ORDERID03", progress: 40, from: "Cairo", to: "Alex" },
    { id: "ORDERID04", progress: 90, from: "Tanta", to: "Cairo" },
    { id: "ORDERID05", progress: 40, from: "Alex", to: "Cairo" },
  ],

  ordersHistory: [
    {
      id: "ORDERID05",
      status: "Delivered",
      customer: "Juhayna",
      departure: "Egypt",
      weight: "250 KG",
      arrival: "Cairo",
      date: "17 Dec 2024",
    },
    {
      id: "ORDERID06",
      status: "Canceled",
      customer: "Arab Dairy",
      departure: "Egypt",
      weight: "250 KG",
      arrival: "Tanta",
      date: "17 Dec 2024",
    },
    {
      id: "ORDERID07",
      status: "Active",
      customer: "Nestle Egypt",
      departure: "Egypt",
      weight: "250 KG",
      arrival: "Alexandria",
      date: "17 Dec 2024",
    },
    {
      id: "ORDERID08",
      status: "Delivered",
      customer: "Edita",
      departure: "Egypt",
      weight: "250 KG",
      arrival: "Cairo",
      date: "16 Dec 2024",
    },
    {
      id: "ORDERID09",
      status: "Delivered",
      customer: "Almarai Egypt",
      departure: "Egypt",
      weight: "250 KG",
      arrival: "Cairo",
      date: "16 Dec 2024",
    },
    {
      id: "ORDERID10",
      status: "Active",
      customer: "Coca-Cola Egypt",
      departure: "Egypt",
      weight: "250 KG",
      arrival: "Luxor",
      date: "16 Dec 2024",
    },
    {
      id: "ORDERID11",
      status: "Active",
      customer: "Americana Group",
      departure: "Egypt",
      weight: "250 KG",
      arrival: "Aswan",
      date: "16 Dec 2024",
    },
    {
      id: "ORDERID12",
      status: "Delivered",
      customer: "Bisco Misr",
      departure: "Egypt",
      weight: "250 KG",
      arrival: "Alexandria",
      date: "15 Dec 2024",
    },
  ],

  todaysTrips: [
    {
      id: 1,
      status: "Completed",
      statusColor: "completed",
      date: new Date().toISOString().split("T")[0],
      locations: [
        {
          name: "Cairo Warehouse",
          address: "17 Assem St., HELIOPOLIS",
          type: "Pickup",
          weight: "14Kg",
          time: "08:00 AM",
        },
        {
          name: "Alexandria Hub",
          address: "36 Khalid Basha St. Victoria",
          type: "Dropoff",
          weight: "14Kg",
          time: "11:30 AM",
        },
      ],
    },
    {
      id: 2,
      status: "Ongoing",
      statusColor: "ongoing",
      date: new Date().toISOString().split("T")[0],
      locations: [
        {
          name: "Cairo Warehouse",
          address: "17 Assem St., HELIOPOLIS",
          type: "Pickup",
          weight: "14Kg",
          time: "09:00 AM",
        },
        {
          name: "Alexandria Hub",
          address: "36 Khalid Basha St. Victoria",
          type: "Dropoff",
          weight: "3Kg",
          time: "12:30 PM",
        },
      ],
    },
    {
      id: 3,
      status: "Pending",
      statusColor: "pending",
      date: new Date().toISOString().split("T")[0],
      locations: [
        {
          name: "Cairo Warehouse",
          address: "17 Assem St., HELIOPOLIS",
          type: "Pickup",
          weight: "8Kg",
          time: "10:00 AM",
        },
        {
          name: "Giza Hub",
          address: "25 Nile St., Giza",
          type: "Dropoff",
          weight: "8Kg",
          time: "11:30 AM",
        },
      ],
    },
  ],
};

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
      <span className="cargo-id">{product.id}</span>
      <span className="cargo-sku">{product.skuName}</span>
    </div>
    <div className="cargo-details">
      <div className="cargo-info">
        <div className="cargo-metric">
          <span className="metric-label">Weight</span>
          <span className="metric-value">{product.weight} kg</span>
        </div>
        <div className="cargo-metric">
          <span className="metric-label">Location</span>
          <span className="metric-value">{product.currentLocation}</span>
        </div>
      </div>
      <div className="cargo-category">
        <span className="category-badge">{product.category}</span>
      </div>
    </div>
  </div>
);

// Available Cargo Component
const AvailableCargo = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState(() => getStoredProducts());

  useEffect(() => {
    // Update products when localStorage changes
    const handleStorageChange = () => {
      setProducts(getStoredProducts());
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Show only the first 4 products
  const displayedProducts = products.slice(0, 4);

  return (
    <div className="grid-item">
      <SectionHeader
        title="Available Cargo"
        onViewAll={() => navigate("/products")}
      />
      <div className="cargo-list">
        {displayedProducts.map((product) => (
          <CargoItem key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

// Truck Statistics Chart Component
const TruckStatsChart = () => {
  const stats = [
    { label: "Active", value: 40, indicator: "active" },
    { label: "Loading Delayed", value: 23, indicator: "loading-delayed" },
    { label: "Ready to Load", value: 12, indicator: "ready-load" },
    { label: "Unloading Delayed", value: 12, indicator: "unloading-delayed" },
    { label: "Ready to Un-load", value: 3, indicator: "ready-unload" },
    { label: "Canceled", value: 3, indicator: "canceled" },
  ];

  return (
    <div className="card truck-stats">
      <div className="chart-container">
        <div className="chart-wrapper">
          <svg className="chart" viewBox="0 0 36 36">
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#e6f4ff"
              strokeWidth="3"
            />
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#001d66"
              strokeWidth="3"
              strokeDasharray="60, 40"
            />
          </svg>
          <div className="chart-content">
            <span className="chart-value">120</span>
            <span className="chart-label">Total Trucks</span>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-item">
            <div className="stat-header">
              <div className={`stat-indicator ${stat.indicator}`}></div>
              <span>{stat.label}</span>
            </div>
            <span className="stat-value">{stat.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Loading Trucks Component
const LoadingTrucks = () => (
  <div className="grid-item">
    <SectionHeader title="Loading Trucks" hasViewAll={false} />
    <TruckStatsChart />
  </div>
);

// Trip Item Component
const TripItem = ({ trip, onViewDetails }) => (
  <div className="card trip-item fade-in">
    <div className="trip-header">
      <div className="trip-id-container">
        <div className="trip-icon">🚛</div>
        <span className="trip-id">Order {trip.id}</span>
      </div>
      <span className={`status-badge status-${trip.statusColor}`}>
        {trip.status}
      </span>
    </div>

    <div className="trip-details">
      {trip.locations.map((location, idx) => (
        <div key={idx} className="location-item">
          <div className="location-header">
            <div
              className={`location-dot ${location.type.toLowerCase()}`}
            ></div>
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

// Today's Trips Component
const TodaysTrips = () => {
  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];
  const todaysOrders = dashboardData.todaysTrips.filter(
    (trip) => trip.date === today
  );

  const handleViewDetails = (orderId) => {
    navigate(`/todays-trips?order=${orderId}`);
  };

  return (
    <div className="grid-item">
      <SectionHeader
        title="Today's Trips"
        onViewAll={() => navigate("/todays-trips")}
      />
      <div className="trips-list">
        {todaysOrders.map((trip) => (
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

// Trip's History Component
const TripsHistory = () => {
  const navigate = useNavigate();
  const [tripHistory] = useState(mockTripHistory);

  // Show only the first 5 trips
  const displayedTrips = tripHistory.slice(0, 5);

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
                <th>CUSTOMER</th>
                <th>DEPARTURE</th>
                <th>TYPE</th>
                <th>WEIGHT</th>
                <th>ARRIVAL LOCATION</th>
                <th>ARRIVAL DATE</th>
              </tr>
            </thead>
            <tbody>
              {displayedTrips.map((trip) => (
                <tr key={trip.id} className="fade-in">
                  <td className="order-id">{trip.id}</td>
                  <td>
                    <StatusBadge status={trip.status} />
                  </td>
                  <td>{trip.customer}</td>
                  <td>{trip.departure}</td>
                  <td>{trip.type}</td>
                  <td>{trip.weight}</td>
                  <td>{trip.arrivalLocation}</td>
                  <td>
                    {new Date(trip.arrivalDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
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
            <LoadingTrucks />
          </div>
          <div className="bottom-section">
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
