import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  InputAdornment,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Box,
  Chip,
  Button,
  Grid,
  Divider,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import PersonIcon from "@mui/icons-material/Person";
import ScaleIcon from "@mui/icons-material/Scale";
import CategoryIcon from "@mui/icons-material/Category";
import "../styles/TripHistory.css";
import { tripsService } from "../services/trips";
import api from "../services/api";

// Helper function for status colors
const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case "completed":
      return "success";
    case "cancelled":
      return "error";
    case "in progress":
      return "warning";
    default:
      return "default";
  }
};

// Trip Details Card Component
function TripDetailsCard({ trip, onClose }) {
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [ordersError, setOrdersError] = useState(null);
  const [editStatus, setEditStatus] = useState(trip.status);
  const [savingStatus, setSavingStatus] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  useEffect(() => {
    setEditStatus(trip.status);
  }, [trip.status]);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoadingOrders(true);
      setOrdersError(null);
      try {
        const response = await api.get("/orders", { params: { trip_id: trip.id } });
        setOrders(Array.isArray(response.data.orders) ? response.data.orders : []);
      } catch (err) {
        setOrdersError("Failed to load orders for this trip.");
      } finally {
        setLoadingOrders(false);
      }
    };
    fetchOrders();
  }, [trip.id]);

  // Compute summary fields
  const firstOrder = orders[0] || {};
  const departureDate = firstOrder.delivery_deadline ? firstOrder.delivery_deadline.slice(0, 10) : '-';
  const weight = orders.reduce((sum, o) => sum + (parseFloat(o.total_weight) || 0), 0);
  const assignedCar = trip.vehicle?.plate_number || '-';

  const handleStatusSave = async () => {
    setSavingStatus(true);
    setStatusMsg("");
    try {
      // Fetch full trip details
      const response = await api.get(`/trips/${trip.id}`);
      const fullTrip = response.data.trip || response.data;
      await api.patch(`/trips/${trip.id}`, {
        trip: {
          name: fullTrip.name,
          start_time: fullTrip.start_time,
          end_time: fullTrip.end_time,
          scheduled_date: fullTrip.scheduled_date,
          status: editStatus
        }
      });
      setStatusMsg("Status updated successfully.");
    } catch (err) {
      setStatusMsg("Failed to update status.");
    } finally {
      setSavingStatus(false);
    }
  };

  return (
    <div className="trip-details-container">
      <div className="trip-details-header">
        <button className="back-button" onClick={onClose}>
          <ArrowBackIcon />
          Back to Trip History
        </button>
        <Typography variant="h4" className="trip-details-title">
          Trip Details
        </Typography>
      </div>
      <div className="trip-details-card">
        <Grid container spacing={3} className="trip-details-content">
          <Grid item xs={12} md={6}>
            <div className="trip-details-section">
              <div className="trip-info-grid">
                <div className="info-item">
                  <Typography variant="body2">Trip ID</Typography>
                  <Typography variant="body1" className="info-value">{trip.id}</Typography>
                </div>
                <div className="info-item">
                  <Typography variant="body2">Departure Date</Typography>
                  <Typography variant="body1" className="info-value">
                    {departureDate}
                  </Typography>
                </div>
                <div className="info-item">
                  <Typography variant="body2">Weight</Typography>
                  <Typography variant="body1" className="info-value">{weight}</Typography>
                </div>
                <div className="info-item">
                  <Typography variant="body2">Assigned Car</Typography>
                  <Typography variant="body1" className="info-value">{assignedCar}</Typography>
                </div>
                <div className="info-item">
                  <Typography variant="body2">Status</Typography>
                  <select
                    value={editStatus}
                    onChange={e => setEditStatus(e.target.value)}
                    style={{ marginLeft: 8, padding: 4, borderRadius: 4 }}
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <Button
                    size="small"
                    variant="contained"
                    color="primary"
                    onClick={handleStatusSave}
                    disabled={savingStatus || editStatus === trip.status}
                    style={{ marginLeft: 8 }}
                  >
                    {savingStatus ? "Saving..." : "Save"}
                  </Button>
                  {statusMsg && (
                    <span style={{ marginLeft: 8, color: statusMsg.includes("success") ? 'green' : 'red' }}>{statusMsg}</span>
                  )}
                </div>
              </div>
            </div>
          </Grid>
        </Grid>
      </div>
        <div className="orders-floating-card">
        <Typography variant="h6">Orders in this Trip</Typography>
        {loadingOrders ? (
          <div>Loading orders...</div>
        ) : ordersError ? (
          <div style={{ color: 'red' }}>{ordersError}</div>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Order ID</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Pickup Location</TableCell>
                  <TableCell>Dropoff Location</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Weight</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.id}</TableCell>
                    <TableCell>{order.customer_name || '-'}</TableCell>
                    <TableCell>{order.pickup_location?.name || '-'}</TableCell>
                    <TableCell>{order.delivery_location?.name || '-'}</TableCell>
                    <TableCell>{order.status}</TableCell>
                    <TableCell>{order.total_weight}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        </div>
    </div>
  );
}

// Add this mapping function before the TripHistory component
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

export default function TripHistory() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [showTripDetails, setShowTripDetails] = useState(false);
  const [tripHistory, setTripHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        setLoading(true);
        setError(null);
        const tripsResponse = await tripsService.getTrips();
        setTripHistory(Array.isArray(tripsResponse?.trips) ? tripsResponse.trips : []);
      } catch (err) {
        setError("Failed to load trip history.");
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleMenuOpen = (event, trip) => {
    setAnchorEl(event.currentTarget);
    setSelectedTrip(trip);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTrip(null);
  };

  // Filter trips based on search query
  const filteredTrips = tripHistory.filter(
    (trip) =>
      (trip.id?.toString().toLowerCase().includes(searchQuery.toLowerCase()) || "") ||
      (trip.customer?.toLowerCase().includes(searchQuery.toLowerCase()) || "") ||
      (trip.departure?.toLowerCase().includes(searchQuery.toLowerCase()) || "") ||
      (trip.arrivalLocation?.toLowerCase().includes(searchQuery.toLowerCase()) || "") ||
      (trip.type?.toLowerCase().includes(searchQuery.toLowerCase()) || "")
  );

  const handleViewDetails = (trip) => {
    setSelectedTrip(trip);
    setShowTripDetails(true);
  };

  const handleDeleteTrip = async (tripId) => {
    try {
      await api.delete(`/trips/${tripId}`);
      // Refetch trips from backend after deletion
      const tripsResponse = await tripsService.getTrips();
      setTripHistory(Array.isArray(tripsResponse?.trips) ? tripsResponse.trips : []);
    } catch (err) {
      alert("Failed to delete trip. Please try again.");
    }
  };

  if (loading) {
    return <div className="trip-history-container">Loading...</div>;
  }
  if (error) {
    return <div className="trip-history-container">{error}</div>;
  }

  if (showTripDetails && selectedTrip) {
    return (
      <TripDetailsCard
        trip={selectedTrip}
        onClose={() => setShowTripDetails(false)}
      />
    );
  }

  return (
    <div className="trip-history-container">
      <div className="trip-history-header">
        <div className="header-left">
          <Typography variant="h4" className="page-title">
            Trip History
          </Typography>
        </div>
      </div>

      <div className="trip-history-toolbar">
        <TextField
          placeholder="Search trips..."
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={handleSearch}
          className="search-field"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </div>

      <TableContainer component={Paper} className="trip-history-table">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Trip ID</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Departure Date</TableCell>
              <TableCell>Weight</TableCell>
              <TableCell>Assigned Car</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTrips
              .map(mapTripData)
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((trip) => (
                <TableRow key={trip.id}>
                  <TableCell>
                    <Button onClick={() => handleViewDetails(trip.raw)}>
                      {trip.id}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <span className={`status-badge status-${trip.status}`}>{trip.status}</span>
                  </TableCell>
                  <TableCell>
                    {trip.departureDate}
                  </TableCell>
                  <TableCell>{trip.weight}</TableCell>
                  <TableCell>{trip.assignedCar}</TableCell>
                  <TableCell align="right">
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleDeleteTrip(trip.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Trip Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        className="trip-menu"
      >
        <MenuItem
          onClick={() => selectedTrip && handleViewDetails(selectedTrip)}
        >
          <VisibilityIcon fontSize="small" style={{ marginRight: 8 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={handleMenuClose} className="delete-option">
          Cancel Trip
        </MenuItem>
      </Menu>
    </div>
  );
}
