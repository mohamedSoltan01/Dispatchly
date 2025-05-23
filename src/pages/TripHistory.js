import React, { useState } from "react";
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
  return (
    <div className="trip-details-container">
      <div className="trip-details-header">
        <button className="back-button" onClick={onClose}>
          <ArrowBackIcon />
          Back to Trip History
        </button>
        <Typography variant="h4" className="trip-details-title">
          Trip Data
        </Typography>
      </div>

      <div className="trip-details-card">
        <div className="trip-details-card-header">
          <div className="trip-details-card-title">
            <Typography variant="h6">Trip Information</Typography>
            <Chip
              label={trip.status}
              color={getStatusColor(trip.status)}
              size="small"
              className="status-chip"
            />
          </div>
          <Typography variant="subtitle2" className="trip-id">
            {trip.id}
          </Typography>
        </div>

        <Grid container spacing={3} className="trip-details-content">
          <Grid item xs={12} md={6}>
            <div className="trip-details-section">
              <div className="trip-info-grid">
                <div className="info-item">
                  <div className="info-label">
                    <PersonIcon fontSize="small" />
                    <Typography variant="body2">Customer</Typography>
                  </div>
                  <Typography variant="body1" className="info-value">
                    {trip.customer}
                  </Typography>
                </div>
                <div className="info-item">
                  <div className="info-label">
                    <CategoryIcon fontSize="small" />
                    <Typography variant="body2">Type</Typography>
                  </div>
                  <Typography variant="body1" className="info-value">
                    {trip.type}
                  </Typography>
                </div>
                <div className="info-item">
                  <div className="info-label">
                    <ScaleIcon fontSize="small" />
                    <Typography variant="body2">Weight</Typography>
                  </div>
                  <Typography variant="body1" className="info-value">
                    {trip.weight}
                  </Typography>
                </div>
              </div>
            </div>
          </Grid>

          <Grid item xs={12} md={6}>
            <div className="trip-details-section">
              <div className="location-info">
                <div className="location-item">
                  <div className="location-label">
                    <LocationOnIcon fontSize="small" />
                    <Typography variant="body2">Departure</Typography>
                  </div>
                  <Typography variant="body1" className="info-value">
                    {trip.departure}
                  </Typography>
                </div>
                <div className="location-item">
                  <div className="location-label">
                    <LocationOnIcon fontSize="small" />
                    <Typography variant="body2">Arrival Location</Typography>
                  </div>
                  <Typography variant="body1" className="info-value">
                    {trip.arrivalLocation}
                  </Typography>
                </div>
                <div className="location-item">
                  <div className="location-label">
                    <AccessTimeIcon fontSize="small" />
                    <Typography variant="body2">Arrival Date</Typography>
                  </div>
                  <Typography variant="body1" className="info-value">
                    {new Date(trip.arrivalDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </Typography>
                </div>
              </div>
            </div>
          </Grid>
        </Grid>
      </div>
    </div>
  );
}

export default function TripHistory() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [showTripDetails, setShowTripDetails] = useState(false);

  // Mock data for trip history
  const tripHistory = [
    {
      id: "TRIP001",
      status: "Completed",
      customer: "John Smith",
      departure: "New York Warehouse",
      type: "Express",
      weight: "500 kg",
      arrivalLocation: "Boston Distribution Center",
      arrivalDate: "2024-03-15",
    },
    {
      id: "TRIP002",
      status: "In Progress",
      customer: "Sarah Johnson",
      departure: "Chicago Hub",
      type: "Standard",
      weight: "750 kg",
      arrivalLocation: "Detroit Facility",
      arrivalDate: "2024-03-16",
    },
    {
      id: "TRIP003",
      status: "Cancelled",
      customer: "Mike Brown",
      departure: "Los Angeles Depot",
      type: "Express",
      weight: "300 kg",
      arrivalLocation: "San Francisco Center",
      arrivalDate: "2024-03-14",
    },
    // Add more mock data as needed
  ];

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
      trip.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.departure.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.arrivalLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewDetails = (trip) => {
    setSelectedTrip(trip);
    setShowTripDetails(true);
    handleMenuClose();
  };

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
              <TableCell>Customer</TableCell>
              <TableCell>Departure</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Weight</TableCell>
              <TableCell>Arrival Location</TableCell>
              <TableCell>Arrival Date</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTrips
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((trip) => (
                <TableRow key={trip.id}>
                  <TableCell>{trip.id}</TableCell>
                  <TableCell>
                    <Chip
                      label={trip.status}
                      color={getStatusColor(trip.status)}
                      size="small"
                      className="status-chip"
                    />
                  </TableCell>
                  <TableCell>
                    <Box className="trip-customer-cell">
                      <Typography variant="body1">{trip.customer}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{trip.departure}</TableCell>
                  <TableCell>{trip.type}</TableCell>
                  <TableCell>{trip.weight}</TableCell>
                  <TableCell>{trip.arrivalLocation}</TableCell>
                  <TableCell>
                    {new Date(trip.arrivalDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, trip)}
                    >
                      <MoreVertIcon />
                    </IconButton>
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
