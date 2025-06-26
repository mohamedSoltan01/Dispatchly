"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import "../styles/TodaysTrips.css";
import api from "../services/api";
import { Button } from "@mui/material";
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

// Simple dropdown component
function Dropdown({ trigger, children, isOpen, onToggle }) {
  return (
    <div style={{ position: "relative" }}>
      <div onClick={onToggle}>{trigger}</div>
      {isOpen && (
        <div
          className="dropdown-menu"
          style={{ top: "100%", left: 0, marginTop: "4px" }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

// External link icon component
function ExternalLinkIcon({ className }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
      />
    </svg>
  );
}

// Chevron down icon component
function ChevronDownIcon({ className }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  );
}

// Add ConfirmationDialog component
function ConfirmationDialog({ isOpen, title, message, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <dialog className="confirm-dialog" open={isOpen}>
      <h3 className="confirm-dialog-title">{title}</h3>
      <p className="confirm-dialog-message">{message}</p>
      <div className="confirm-dialog-buttons">
        <button className="confirm-dialog-button cancel" onClick={onCancel}>
          Cancel
        </button>
        <button className="confirm-dialog-button confirm" onClick={onConfirm}>
          Confirm
        </button>
      </div>
    </dialog>
  );
}

export default function TodaysTrips() {
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order");
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmationDialog, setConfirmationDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
  });
  const [selectedTripOrders, setSelectedTripOrders] = useState([]);
  const [loadingTripOrders, setLoadingTripOrders] = useState(false);

  // Google Maps setup
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  });

  // Fetch today's trips
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await api.get('/trips', {
          params: {
            date: new Date().toISOString().split('T')[0],
            status: 'all'
          }
        });
        setOrders(Array.isArray(response.data.trips) ? response.data.trips : []);
      } catch (err) {
        console.error('Error fetching trips:', err);
        setError('Failed to load trips. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrips();
  }, []);

  // Fetch orders for selected trip
  useEffect(() => {
    if (expandedOrder) {
      setLoadingTripOrders(true);
      api.get('/orders', { params: { trip_id: expandedOrder } })
        .then(response => {
          setSelectedTripOrders(Array.isArray(response.data.orders) ? response.data.orders : []);
        })
        .catch(() => setSelectedTripOrders([]))
        .finally(() => setLoadingTripOrders(false));
    } else {
      setSelectedTripOrders([]);
    }
  }, [expandedOrder]);

  // Extract all pickup and dropoff locations for the selected trip
  const tripLocations = (selectedTripOrders || []).flatMap(order => [
    order.pickup_location,
    order.delivery_location
  ].filter(loc => loc && loc.latitude && loc.longitude));

  // Center map on first location or default
  const defaultCenter = tripLocations.length > 0
    ? { lat: parseFloat(tripLocations[0].latitude), lng: parseFloat(tripLocations[0].longitude) }
    : { lat: 24.7136, lng: 46.6753 }; // Default to Riyadh

  // Handle status changes
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setError(null);
      let trip = orders.find(order => order.id === orderId);
      // If any required field is missing, fetch the trip from the backend
      if (!trip || !trip.name || !trip.start_time) {
        const response = await api.get(`/trips/${orderId}`);
        trip = response.data.trip || response.data;
      }
      const payload = {
        trip: {
          name: trip.name || `Trip #${orderId}`,
          start_time: trip.start_time || new Date().toISOString(),
          end_time: trip.end_time || null,
          scheduled_date: trip.scheduled_date,
        status: newStatus
        }
      };
      const response = await api.patch(`/trips/${orderId}`, payload);
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, ...response.data } : order
        )
      );
    } catch (err) {
      console.error('Error updating trip status:', err);
      setError('Failed to update trip status. Please try again.');
    }
  };

  // Handle order completion
  const handleFinishOrder = async (orderId, event) => {
    event.stopPropagation();
    try {
      setError(null);
      const response = await api.post(`/trips/${orderId}/complete`);
      
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, ...response.data } : order
        )
      );
    } catch (err) {
      console.error('Error completing trip:', err);
      setError('Failed to complete trip. Please try again.');
    }
  };

  // Handle order cancellation
  const handleCancelOrder = async (orderId, event) => {
    event.stopPropagation();
    showConfirmation(
      "Cancel Trip",
      "Are you sure you want to cancel this trip? This action cannot be undone.",
      async () => {
        try {
          setError(null);
          await api.delete(`/trips/${orderId}`);
          setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
        } catch (err) {
          console.error('Error cancelling trip:', err);
          setError('Failed to cancel trip. Please try again.');
        }
      }
    );
  };

  // Handle order start
  const handleStartOrder = async (orderId, event) => {
    event.stopPropagation();
    try {
      setError(null);
      const response = await api.post(`/trips/${orderId}/start`);
      
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, ...response.data } : order
        )
      );
    } catch (err) {
      console.error('Error starting trip:', err);
      setError('Failed to start trip. Please try again.');
    }
  };

  const today = new Date().toISOString().split("T")[0];
  const todaysOrders = orders.filter((order) => 
    order.scheduled_date && order.scheduled_date.slice(0, 10) === today
  );

  // Get the selected order details for the bottom panel
  const selectedOrder = expandedOrder
    ? todaysOrders.find((order) => order.id === expandedOrder)
    : null;

  // Trip summary and details using backend data
  const totalItems = selectedTripOrders.length;
  const totalWeight = selectedTripOrders.reduce((sum, o) => sum + (parseFloat(o.total_weight) || 0), 0);
  const firstPickup = (selectedTripOrders[0]?.pickup_location?.name) || "-";
  // Optionally, calculate total distance if you have coordinates

  // Assigned vehicle info from the selected trip with default values
  const selectedTrip = todaysOrders.find((trip) => trip.id === expandedOrder);
  const assignedVehicle = selectedTrip?.vehicle || {
    plate_number: '-',
    capacity_weight: '-',
    capacity_volume: '-'
  };

  // Calculate total weight and distance for the selected order
  const calculateOrderStats = (order) => {
    if (!order) return { totalWeight: 0, totalLocations: 0, totalDistance: 0 };

    const locations = Array.isArray(order.locations) ? order.locations : [];
    const totalWeight = locations.reduce((sum, loc) => {
      return sum + parseFloat((loc.weight || "0").replace("Kg", ""));
    }, 0);

    const totalLocations = locations.length;
    // Mock distance calculation based on number of locations
    const totalDistance = totalLocations * 100; // 100km per location as mock data

    return {
      totalWeight: `${totalWeight} Kg`,
      totalLocations,
      totalDistance: `${totalDistance} km`,
    };
  };

  const handleDropdownToggle = (orderId, event) => {
    event.stopPropagation();
    setOpenDropdown(openDropdown === orderId ? null : orderId);
  };

  const handleOrderClick = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
    setOpenDropdown(null);
  };

  const showConfirmation = (title, message, onConfirm) => {
    setConfirmationDialog({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmationDialog({
          isOpen: false,
          title: "",
          message: "",
          onConfirm: null,
        });
      },
    });
  };

  const handleDeleteOrder = (orderId, event) => {
    event.stopPropagation();
    showConfirmation(
      "Delete Order",
      "Are you sure you want to delete this order? This action cannot be undone.",
      () => {
        setOrders(orders.filter((order) => order.id !== orderId));
        setExpandedOrder(null);
      }
    );
  };

  useEffect(() => {
    // If there's an order ID in the URL, expand that order
    if (orderId) {
      const orderIdNum = parseInt(orderId);
      if (!isNaN(orderIdNum)) {
        setExpandedOrder(orderIdNum);
      }
    }
  }, [orderId]);

  const renderActionButtons = (trip) => {
    return (
      <div className="trip-actions">
        {trip.status === 'pending' && (
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={() => handleStartOrder(trip.id, null)}
            className="action-button start"
          >
            Start Trip
          </Button>
        )}
        {trip.status === 'in_progress' && (
          <>
            <Button
              variant="contained"
              color="success"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleFinishOrder(trip.id, e);
              }}
              className="action-button complete"
            >
              Complete
            </Button>
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleCancelOrder(trip.id, e);
              }}
              className="action-button cancel"
            >
              Cancel
            </Button>
          </>
        )}
        {trip.status === 'completed' && (
          <Button
            variant="outlined"
            color="primary"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleOrderClick(trip.id);
            }}
            className="action-button view"
          >
            View Details
          </Button>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading trips...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button 
          className="retry-button"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Add ConfirmationDialog component */}
      <ConfirmationDialog
        isOpen={confirmationDialog.isOpen}
        title={confirmationDialog.title}
        message={confirmationDialog.message}
        onConfirm={confirmationDialog.onConfirm}
        onCancel={() =>
          setConfirmationDialog({
            isOpen: false,
            title: "",
            message: "",
            onConfirm: null,
          })
        }
      />

      {/* Left Panel - Orders */}
      <div className="orders-panel">
        {/* Total Orders Header */}
        <div className="orders-header">
          <div className="orders-header-title">
            <h2 className="orders-title">Today's Trips</h2>
            <ExternalLinkIcon className="external-link-icon" />
          </div>
          <div className="orders-summary">
            <span>Total Trips ({todaysOrders.length})</span>
            <span>
              {new Date().toLocaleDateString("en-US", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* Orders List */}
        <div className="orders-list">
          {todaysOrders.map((order) => (
            <div
              key={order.id}
              className={`order-card ${
                expandedOrder === order.id ? "expanded" : ""
              }`}
              onClick={() => handleOrderClick(order.id)}
            >
              <div className="order-header">
                <div className="order-title-row">
                  <span className="order-title">Trip {order.id}</span>
                  <Dropdown
                    isOpen={openDropdown === order.id}
                    onToggle={(e) => handleDropdownToggle(order.id, e)}
                    trigger={
                      <button
                        className="status-dropdown"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span
                          className={`status-badge status-${order.statusColor}`}
                        >
                          {order.status}
                        </span>
                        <ChevronDownIcon
                          className={`chevron-icon ${
                            expandedOrder === order.id ? "rotated" : ""
                          }`}
                        />
                      </button>
                    }
                  >
                    <button
                      className="dropdown-item"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(order.id, "Completed");
                      }}
                    >
                      Completed
                    </button>
                    <button
                      className="dropdown-item"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(order.id, "Ongoing");
                      }}
                    >
                      Ongoing
                    </button>
                    <button
                      className="dropdown-item"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(order.id, "Pending");
                      }}
                    >
                      Pending
                    </button>
                  </Dropdown>
                </div>

                {expandedOrder === order.id && (
                  <>
                    {/* Existing locations UI (if any) */}
                    {order.locations && (
                  <div className="order-locations">
                    {order.locations.map((location, idx) => (
                      <div key={idx} className="location-item">
                        <div className="location-dot"></div>
                        <div className="location-details">
                          <div className="location-row">
                            <div className="location-info">
                              <div className="location-name">
                                {location.name}
                              </div>
                              <div className="location-address">
                                {location.address}
                              </div>
                              <div className="location-time">
                                {location.time}
                              </div>
                            </div>
                            <div className="location-meta">
                              <div className="location-type">
                                {location.type}
                              </div>
                              <div className="location-weight">
                                {location.weight}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                      </div>
                    )}
                    {/* Drop-off locations as bullet points */}
                    <div style={{ marginTop: 12 }}>
                      <strong>Drop-off Locations:</strong>
                      <ul>
                        {selectedTripOrders.map((o) =>
                          o.delivery_location ? (
                            <li key={o.id}>
                              {o.delivery_location.address || o.delivery_location.name || `Location #${o.delivery_location.id}`}
                            </li>
                          ) : null
                        )}
                      </ul>
                    </div>
                    {/* Trip status and status change */}
                    <div style={{ marginTop: 8 }}>
                      <strong>Status:</strong> {order.status}
                      <select
                        value={order.status}
                        onChange={e => {
                          e.stopPropagation();
                          handleStatusChange(order.id, e.target.value);
                        }}
                        style={{ marginLeft: 8 }}
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">Ongoing</option>
                        <option value="completed">Ended</option>
                      </select>
                  </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel - Map and Details */}
      <div className="map-panel">
        {/* Google Map with markers */}
        <div className="map-container" style={{ height: 400, width: '100%' }}>
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={{ height: '100%', width: '100%' }}
              center={defaultCenter}
              zoom={10}
            >
              {tripLocations.map((loc, idx) => (
                <Marker
                  key={idx}
                  position={{ lat: parseFloat(loc.latitude), lng: parseFloat(loc.longitude) }}
                  label={idx % 2 === 0 ? 'P' : 'D'}
                />
              ))}
            </GoogleMap>
          ) : (
            <div>Loading map...</div>
          )}
        </div>

        {/* Bottom Panel - Only show when a trip is selected */}
        {selectedOrder && (
          <div className="bottom-panel">
            {/* Trip Details */}
            <div className="order-details">
              <div className="order-details-header">
                <h3 className="order-details-title">
                  TRIP {selectedOrder.id}
                </h3>
                <ExternalLinkIcon className="external-link-icon" />
              </div>

              <div className="order-stats">
                <div className="stat-item">
                  <div className="stat-label">Total Items</div>
                  <div className="stat-value">
                    {totalItems} Locations
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Total Weight</div>
                  <div className="stat-value">
                    {totalWeight} Kg
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">From</div>
                  <div className="stat-value">
                    {firstPickup}
                  </div>
                </div>
                {/* Optionally add total distance here */}
              </div>

              <div className="priority-section">
                <div className="priority-label">Status</div>
                <span
                  className={`priority-badge status-${selectedOrder.statusColor}`}
                >
                  {selectedOrder.status}
                </span>
              </div>
            </div>

            {/* Assigned Vehicle */}
            <div className="vehicle-panel">
              <div className="vehicle-header">
                <h3 className="vehicle-title">ASSIGNED VEHICLE</h3>
                <div className="vehicle-count">
                  <span className="vehicle-count-text">(1)</span>
                  <ExternalLinkIcon className="external-link-icon" />
                </div>
              </div>

              <div className="vehicle-details">
                <div className="vehicle-info-row">
                  <span className="vehicle-info-label">Truck</span>
                  <span className="vehicle-info-value">
                    {assignedVehicle?.plate_number ? `#${assignedVehicle.plate_number}` : '-'}
                  </span>
                </div>

                <div className="vehicle-info-row">
                  <span className="vehicle-info-label">Max Capacity</span>
                  <span className="vehicle-info-value">
                    {assignedVehicle?.capacity_weight ? `${assignedVehicle.capacity_weight} ton` : '-'} / {assignedVehicle?.capacity_volume ? `${assignedVehicle.capacity_volume} m³` : '-'}
                  </span>
                </div>

                <div className="vehicle-info-row">
                  <span className="vehicle-info-label">Current Load</span>
                  <span className="vehicle-info-value">
                    {totalWeight} Kg
                  </span>
                </div>

                <div className="vehicle-status">
                  Vehicle Status: {selectedOrder?.status === "Ongoing"
                    ? "In Transit"
                    : selectedOrder?.status === "Completed"
                    ? "Available"
                    : "Standby"}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
