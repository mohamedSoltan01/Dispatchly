import React, { useState, useCallback } from "react";
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
  Button,
  Typography,
  Box,
  Chip,
  Card,
  TablePagination,
  Grid,
  MenuItem,
  IconButton,
  Divider,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import "../styles/Locations.css";

// Mock data for locations
const mockLocations = [
  {
    id: "LOC001",
    name: "New York Warehouse",
    city: "New York",
    address: "123 Warehouse Ave, NY 10001",
    category: "warehouse",
  },
  {
    id: "LOC002",
    name: "Boston Market",
    city: "Boston",
    address: "456 Market St, MA 02108",
    category: "market",
  },
  {
    id: "LOC003",
    name: "Chicago Distribution Center",
    city: "Chicago",
    address: "789 Distribution Blvd, IL 60601",
    category: "warehouse",
  },
];

// Add mock coordinates mapping
const mockCoordinates = {
  "New York": { lat: 40.7128, lng: -74.006 },
  Boston: { lat: 42.3601, lng: -71.0589 },
  Chicago: { lat: 41.8781, lng: -87.6298 },
  "Los Angeles": { lat: 34.0522, lng: -118.2437 },
  Miami: { lat: 25.7617, lng: -80.1918 },
  Houston: { lat: 29.7604, lng: -95.3698 },
  Seattle: { lat: 47.6062, lng: -122.3321 },
  Denver: { lat: 39.7392, lng: -104.9903 },
  Atlanta: { lat: 33.749, lng: -84.388 },
  Phoenix: { lat: 33.4484, lng: -112.074 },
};

// Helper function to get mock coordinates
const getMockCoordinates = (city) => {
  const cityKey = Object.keys(mockCoordinates).find(
    (key) => key.toLowerCase() === city.toLowerCase()
  );
  if (cityKey) {
    return mockCoordinates[cityKey];
  }
  // Default coordinates if city not found
  return { lat: 37.7749, lng: -122.4194 }; // San Francisco as default
};

// Helper function to get locations from localStorage or use initial data
const getStoredLocations = () => {
  try {
    const saved = localStorage.getItem("locations");
    if (saved) {
      return JSON.parse(saved);
    }
    // Only set initial mock data if no locations exist in localStorage
    localStorage.setItem("locations", JSON.stringify(mockLocations));
    return mockLocations;
  } catch (error) {
    console.error("Error loading locations from localStorage:", error);
    return mockLocations;
  }
};

// New LocationDetails component
const LocationDetails = ({ location, onClose }) => {
  const coordinates = getMockCoordinates(location.city);

  return (
    <div className="location-form-container">
      <div className="form-header">
        <Typography variant="h6">Location Details</Typography>
        <IconButton onClick={onClose} size="small" color="success">
          <CloseIcon />
        </IconButton>
      </div>
      <div className="location-details">
        <div className="detail-group">
          <Typography variant="subtitle2" color="textSecondary">
            Location ID
          </Typography>
          <Typography variant="body1" className="detail-value">
            {location.id}
          </Typography>
        </div>
        <Divider />
        <div className="detail-group">
          <Typography variant="subtitle2" color="textSecondary">
            Location Name
          </Typography>
          <Typography variant="body1" className="detail-value">
            {location.name}
          </Typography>
        </div>
        <Divider />
        <div className="detail-group">
          <Typography variant="subtitle2" color="textSecondary">
            City
          </Typography>
          <Typography variant="body1" className="detail-value">
            {location.city}
          </Typography>
        </div>
        <Divider />
        <div className="detail-group">
          <Typography variant="subtitle2" color="textSecondary">
            Address
          </Typography>
          <Typography variant="body1" className="detail-value">
            {location.address}
          </Typography>
        </div>
        <Divider />
        <div className="detail-group">
          <Typography variant="subtitle2" color="textSecondary">
            Coordinates
          </Typography>
          <Typography variant="body1" className="detail-value">
            {`${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)}`}
          </Typography>
          <Typography
            variant="caption"
            color="textSecondary"
            className="mock-coordinates-note"
          >
            * Mock coordinates based on city location
          </Typography>
        </div>
        <Divider />
        <div className="detail-group">
          <Typography variant="subtitle2" color="textSecondary">
            Category
          </Typography>
          <Chip
            label={location.category}
            className={`category-chip ${
              location.category === "warehouse" ? "warehouse" : "market"
            }`}
          />
        </div>
      </div>
    </div>
  );
};

// New LocationForm component
const LocationForm = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    address: "",
    latitude: "",
    longitude: "",
    category: "warehouse",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const newLocation = {
      id: `LOC${Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0")}`,
      ...formData,
    };
    onSave(newLocation);
  };

  return (
    <div className="location-form-container">
      <div className="form-header">
        <Typography variant="h6">Add New Location</Typography>
        <IconButton onClick={onClose} size="small" color="success">
          <CloseIcon />
        </IconButton>
      </div>
      <form onSubmit={handleSubmit} className="location-form">
        <TextField
          fullWidth
          label="Location Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          margin="normal"
        />
        <TextField
          fullWidth
          label="City"
          name="city"
          value={formData.city}
          onChange={handleChange}
          required
          margin="normal"
        />
        <TextField
          fullWidth
          label="Address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          required
          margin="normal"
          multiline
          rows={2}
        />
        <Grid container spacing={2} margin="normal">
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Latitude"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
              required
              type="number"
              inputProps={{ step: "any" }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Longitude"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
              required
              type="number"
              inputProps={{ step: "any" }}
            />
          </Grid>
        </Grid>
        <TextField
          fullWidth
          select
          label="Category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
          margin="normal"
        >
          <MenuItem value="warehouse">Warehouse</MenuItem>
          <MenuItem value="market">Market</MenuItem>
        </TextField>
        <div className="form-actions">
          <Button variant="outlined" onClick={onClose} color="success">
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="success">
            Save Location
          </Button>
        </div>
      </form>
    </div>
  );
};

export default function Locations() {
  // State management
  const [locations, setLocations] = useState(() => getStoredLocations());
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showNewLocationForm, setShowNewLocationForm] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Handlers
  const handleSearchChange = useCallback((event) => {
    setSearchQuery(event.target.value);
    setPage(0);
  }, []);

  const handlePageChange = useCallback((event, newPage) => {
    setPage(newPage);
  }, []);

  const handleRowsPerPageChange = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  const handleAddNewLocation = useCallback(() => {
    setShowNewLocationForm(true);
  }, []);

  const handleSaveLocation = useCallback((newLocation) => {
    setLocations((prev) => {
      const updated = [...prev, newLocation];
      localStorage.setItem("locations", JSON.stringify(updated));
      return updated;
    });
    setShowNewLocationForm(false);
  }, []);

  const handleLocationClick = useCallback((location) => {
    setSelectedLocation(location);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setSelectedLocation(null);
  }, []);

  // Filter locations based on search query
  const filteredLocations = locations.filter(
    (location) =>
      location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination
  const paginatedLocations = filteredLocations.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <div className="locations-container">
      {!showNewLocationForm && !selectedLocation ? (
        <>
          {/* Header Section */}
          <div className="locations-header">
            <div className="header-left">
              <Typography variant="h4" className="page-title">
                All Locations
              </Typography>
            </div>
            <Button
              variant="outlined"
              color="success"
              startIcon={<AddIcon />}
              className="add-location-button"
              onClick={handleAddNewLocation}
            >
              Add New Location
            </Button>
          </div>

          {/* Search Section */}
          <div className="locations-toolbar">
            <TextField
              placeholder="Search locations..."
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={handleSearchChange}
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

          {/* Map Section */}
          <Card className="map-card">
            <div className="map-placeholder">
              <Typography variant="h6" className="map-placeholder-text">
                Map View Coming Soon
              </Typography>
            </div>
          </Card>

          {/* Locations Table */}
          <TableContainer component={Paper} className="locations-table">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Location Name</TableCell>
                  <TableCell>City</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell>Category</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedLocations.map((location) => (
                  <TableRow key={location.id}>
                    <TableCell>
                      <Button
                        color="success"
                        onClick={() => handleLocationClick(location)}
                        className="location-id-button"
                      >
                        {location.id}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Box className="location-name-cell">
                        <Typography variant="body1">{location.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{location.city}</TableCell>
                    <TableCell>{location.address}</TableCell>
                    <TableCell>
                      <Chip
                        label={location.category}
                        className={`category-chip ${
                          location.category === "warehouse"
                            ? "warehouse"
                            : "market"
                        }`}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <div className="pagination-container">
            <TablePagination
              component="div"
              count={filteredLocations.length}
              page={page}
              onPageChange={handlePageChange}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleRowsPerPageChange}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          </div>
        </>
      ) : (
        <div className="new-location-layout">
          <div className="map-section">
            <Card className="map-card">
              <div className="map-placeholder">
                <Typography variant="h6" className="map-placeholder-text">
                  Map View Coming Soon
                </Typography>
              </div>
            </Card>
          </div>
          {showNewLocationForm ? (
            <LocationForm
              onClose={() => setShowNewLocationForm(false)}
              onSave={handleSaveLocation}
            />
          ) : (
            <LocationDetails
              location={selectedLocation}
              onClose={handleCloseDetails}
            />
          )}
        </div>
      )}
    </div>
  );
}
