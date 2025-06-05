"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import "../styles/TodaysTrips.css";

const orders = [
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
    expanded: true,
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
      {
        name: "Alexandria Center",
        address: "10 El Dokki Bldgs., MOSTAFA KAMEL",
        type: "Dropoff",
        weight: "5Kg",
        time: "01:15 PM",
      },
      {
        name: "Port Said Facility",
        address: "60 Housing Bank Bldg., El-Dawahi",
        type: "Dropoff",
        weight: "6.5Kg",
        time: "03:45 PM",
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
  {
    id: 4,
    status: "Pending",
    statusColor: "pending",
    date: new Date().toISOString().split("T")[0],
    locations: [
      {
        name: "Cairo Warehouse",
        address: "17 Assem St., HELIOPOLIS",
        type: "Pickup",
        weight: "12Kg",
        time: "11:00 AM",
      },
      {
        name: "6th of October City",
        address: "15 Industrial Zone, 6th of October",
        type: "Dropoff",
        weight: "12Kg",
        time: "01:00 PM",
      },
    ],
  },
];

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
  const [orders, setOrders] = useState([
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
      expanded: true,
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
        {
          name: "Alexandria Center",
          address: "10 El Dokki Bldgs., MOSTAFA KAMEL",
          type: "Dropoff",
          weight: "5Kg",
          time: "01:15 PM",
        },
        {
          name: "Port Said Facility",
          address: "60 Housing Bank Bldg., El-Dawahi",
          type: "Dropoff",
          weight: "6.5Kg",
          time: "03:45 PM",
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
    {
      id: 4,
      status: "Pending",
      statusColor: "pending",
      date: new Date().toISOString().split("T")[0],
      locations: [
        {
          name: "Cairo Warehouse",
          address: "17 Assem St., HELIOPOLIS",
          type: "Pickup",
          weight: "12Kg",
          time: "11:00 AM",
        },
        {
          name: "6th of October City",
          address: "15 Industrial Zone, 6th of October",
          type: "Dropoff",
          weight: "12Kg",
          time: "01:00 PM",
        },
      ],
    },
  ]);

  const today = new Date().toISOString().split("T")[0];
  const todaysOrders = orders.filter((order) => order.date === today);

  // Get the selected order details for the bottom panel
  const selectedOrder = expandedOrder
    ? todaysOrders.find((order) => order.id === expandedOrder)
    : null;

  // Calculate total weight and distance for the selected order
  const calculateOrderStats = (order) => {
    if (!order) return { totalWeight: 0, totalLocations: 0, totalDistance: 0 };

    const totalWeight = order.locations.reduce((sum, loc) => {
      return sum + parseFloat(loc.weight.replace("Kg", ""));
    }, 0);

    const totalLocations = order.locations.length;
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

  const handleStatusChange = (orderId, newStatus) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: newStatus,
              statusColor: newStatus.toLowerCase(),
            }
          : order
      )
    );
    setOpenDropdown(null);
  };

  const handleOrderClick = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
    setOpenDropdown(null);
  };

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  const showConfirmation = (title, message, onConfirm) => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmDialog({
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

  const handleFinishOrder = (orderId, event) => {
    event.stopPropagation();
    showConfirmation(
      "Complete Order",
      "Are you sure you want to mark this order as completed?",
      () => {
        handleStatusChange(orderId, "Completed");
        setExpandedOrder(null);
      }
    );
  };

  const handleCancelOrder = (orderId, event) => {
    event.stopPropagation();
    showConfirmation(
      "Cancel Order",
      "Are you sure you want to cancel this order? This action cannot be undone.",
      () => {
        handleStatusChange(orderId, "Cancelled");
        setExpandedOrder(null);
      }
    );
  };

  const handleStartOrder = (orderId, event) => {
    event.stopPropagation();
    showConfirmation(
      "Start Order",
      "Are you sure you want to start this order?",
      () => {
        handleStatusChange(orderId, "Ongoing");
      }
    );
  };

  const renderActionButtons = (order) => {
    switch (order.status) {
      case "Completed":
        return (
          <button
            className="action-button delete-button"
            onClick={(e) => handleDeleteOrder(order.id, e)}
          >
            Delete Order
          </button>
        );
      case "Ongoing":
        return (
          <div className="action-buttons">
            <button
              className="action-button finish-button"
              onClick={(e) => handleFinishOrder(order.id, e)}
            >
              Finish Order
            </button>
            <button
              className="action-button cancel-button"
              onClick={(e) => handleCancelOrder(order.id, e)}
            >
              Cancel Order
            </button>
          </div>
        );
      case "Pending":
        return (
          <div className="action-buttons">
            <button
              className="action-button start-button"
              onClick={(e) => handleStartOrder(order.id, e)}
            >
              Start Order
            </button>
            <button
              className="action-button cancel-button"
              onClick={(e) => handleCancelOrder(order.id, e)}
            >
              Cancel Order
            </button>
          </div>
        );
      default:
        return null;
    }
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

  return (
    <div className="dashboard-container">
      {/* Add ConfirmationDialog component */}
      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() =>
          setConfirmDialog({
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
                  <span className="order-title">Order {order.id}</span>
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

                {expandedOrder === order.id && order.locations && (
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
                    {renderActionButtons(order)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel - Map Placeholder and Details */}
      <div className="map-panel">
        {/* Map Placeholder */}
        <div
          className="map-container"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#f3f4f6",
            color: "#6b7280",
            fontSize: "1.2rem",
            fontWeight: 500,
          }}
        >
          Map Placeholder
          <br />
          (Google Maps Integration Coming Soon)
        </div>

        {/* Bottom Panel - Only show when an order is selected */}
        {selectedOrder && (
          <div className="bottom-panel">
            {/* Order Details */}
            <div className="order-details">
              <div className="order-details-header">
                <h3 className="order-details-title">
                  ORDER {selectedOrder.id}
                </h3>
                <ExternalLinkIcon className="external-link-icon" />
              </div>

              <div className="order-stats">
                <div className="stat-item">
                  <div className="stat-label">Total Items</div>
                  <div className="stat-value">
                    {calculateOrderStats(selectedOrder).totalLocations}{" "}
                    Locations
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Total Weight</div>
                  <div className="stat-value">
                    {calculateOrderStats(selectedOrder).totalWeight}
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">From</div>
                  <div className="stat-value">
                    {selectedOrder.locations[0].name}
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Total Distance</div>
                  <div className="stat-value">
                    {calculateOrderStats(selectedOrder).totalDistance}
                  </div>
                </div>
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
                    #TRK-{selectedOrder.id.toString().padStart(3, "0")}
                  </span>
                </div>

                <div className="vehicle-info-row">
                  <span className="vehicle-info-label">Max Capacity</span>
                  <span className="vehicle-info-value">15 ton / 60 m³</span>
                </div>

                <div className="vehicle-info-row">
                  <span className="vehicle-info-label">Current Load</span>
                  <span className="vehicle-info-value">
                    {calculateOrderStats(selectedOrder).totalWeight}
                  </span>
                </div>

                <div className="vehicle-status">
                  Vehicle Status:{" "}
                  {selectedOrder.status === "Ongoing"
                    ? "In Transit"
                    : selectedOrder.status === "Completed"
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
