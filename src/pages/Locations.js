import React, { useState, useCallback, useEffect } from "react";
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
import {
  GoogleMap,
  LoadScript,
  Marker,
  InfoWindow,
  MarkerClusterer,
} from "@react-google-maps/api";

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

// Update the LocationForm component layout
const LocationForm = ({ onClose, onSave, existingLocations = [] }) => {
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    address: "",
    latitude: "",
    longitude: "",
    category: "warehouse",
  });
  const [selectedMapLocation, setSelectedMapLocation] = useState(null);
  const [geocoder, setGeocoder] = useState(null);

  // Initialize geocoder when map loads
  useEffect(() => {
    if (window.google && window.google.maps) {
      setGeocoder(new window.google.maps.Geocoder());
    }
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMapClick = useCallback(
    async (event) => {
      if (!geocoder) return;

      const lat = event.latLng.lat();
      const lng = event.latLng.lng();

      try {
        // Get address details from coordinates
        const response = await geocoder.geocode({ location: { lat, lng } });
        if (response.results && response.results[0]) {
          const result = response.results[0];
          const addressComponents = result.address_components;

          // Extract city and address
          let city = "";
          let address = result.formatted_address;

          for (const component of addressComponents) {
            if (component.types.includes("locality")) {
              city = component.long_name;
            }
          }

          // Update form with new location data
          setFormData((prev) => ({
            ...prev,
            latitude: lat.toString(),
            longitude: lng.toString(),
            city: city || prev.city,
            address: address || prev.address,
          }));

          setSelectedMapLocation({ lat, lng });
        }
      } catch (error) {
        console.error("Error getting address details:", error);
      }
    },
    [geocoder]
  );

  const handleExistingLocationClick = useCallback((location) => {
    const coordinates = getMockCoordinates(location.city);
    setFormData({
      name: location.name,
      city: location.city,
      address: location.address,
      latitude: coordinates.lat.toString(),
      longitude: coordinates.lng.toString(),
      category: location.category,
    });
    setSelectedMapLocation(coordinates);
  }, []);

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
    <div className="location-form-full-container">
      <div className="form-header">
        <Typography variant="h6">Add New Location</Typography>
        <IconButton onClick={onClose} size="small" color="success">
          <CloseIcon />
        </IconButton>
      </div>
      <div className="location-form-content">
        <div className="location-form-map">
          <Map
            locations={existingLocations}
            height="100%"
            onMapClick={handleMapClick}
            onLocationClick={handleExistingLocationClick}
            selectedLocation={selectedMapLocation}
            isFormMap={true}
          />
        </div>
        <div className="location-form-fields">
          <form onSubmit={handleSubmit} className="location-form">
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Location Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
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
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Latitude"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  required
                  type="number"
                  inputProps={{ step: "any" }}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Longitude"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  required
                  type="number"
                  inputProps={{ step: "any" }}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
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
              </Grid>
            </Grid>
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
      </div>
    </div>
  );
};

// Map component
const Map = ({
  locations,
  selectedLocation,
  onLocationSelect,
  onMapClick,
  height = "300px",
  isFormMap = false,
}) => {
  const [map, setMap] = useState(null);
  const [infoWindow, setInfoWindow] = useState(null);
  const [activeMarker, setActiveMarker] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [bounds, setBounds] = useState(null);
  const [selectedMapLocation, setSelectedMapLocation] = useState(null);

  // Add debugging
  useEffect(() => {
    console.log("Locations to display:", locations);
  }, [locations]);

  const mapContainerStyle = {
    width: "100%",
    height: height,
    borderRadius: "8px",
  };

  const defaultCenter = {
    lat: 30.0444, // Cairo coordinates as default
    lng: 31.2357,
  };

  const onMapLoad = useCallback(
    (map) => {
      setMap(map);
      setIsLoaded(true);

      // Fit map to show all markers
      if (locations && locations.length > 0) {
        const bounds = new window.google.maps.LatLngBounds();
        locations.forEach((location) => {
          const coordinates = getMockCoordinates(location.city);
          bounds.extend(coordinates);
        });
        map.fitBounds(bounds);
        setBounds(bounds);
      }
    },
    [locations]
  );

  const onMarkerClick = useCallback(
    (location) => {
      if (infoWindow) {
        infoWindow.close();
      }
      setActiveMarker(location.id);
      if (onLocationSelect) {
        onLocationSelect(location);
      }
    },
    [infoWindow, onLocationSelect]
  );

  const onInfoWindowLoad = useCallback((infoWindow) => {
    setInfoWindow(infoWindow);
  }, []);

  const getMarkerIcon = (category) => {
    if (!isLoaded || !window.google) return null;

    return {
      url:
        category === "warehouse"
          ? "https://maps.google.com/mapfiles/ms/icons/blue-dot.png"
          : "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
      scaledSize: new window.google.maps.Size(32, 32),
    };
  };

  const createClusterCustomIcon = (cluster) => {
    return {
      url: `https://maps.google.com/mapfiles/ms/icons/red-dot.png`,
      text: cluster.getText(),
      textColor: "#FFFFFF",
      textSize: 12,
      width: 40,
      height: 40,
    };
  };

  const handleMapClick = useCallback(
    (event) => {
      if (onMapClick) {
        onMapClick(event);
      }
    },
    [onMapClick]
  );

  if (!process.env.REACT_APP_GOOGLE_MAPS_API_KEY) {
    console.error("Google Maps API key is missing from environment variables");
    return (
      <div style={mapContainerStyle} className="map-placeholder">
        <Typography variant="h6" className="map-placeholder-text">
          Google Maps API key is missing. Please check your .env file.
        </Typography>
      </div>
    );
  }

  return (
    <LoadScript
      googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
      onLoad={() => setIsLoaded(true)}
    >
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={10}
        center={defaultCenter}
        onLoad={onMapLoad}
        onClick={isFormMap ? handleMapClick : undefined}
        options={{
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }],
            },
          ],
          disableDefaultUI: true,
          zoomControl: true,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
        }}
      >
        {isLoaded && locations && locations.length > 0 && (
          <MarkerClusterer
            options={{
              imagePath:
                "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m",
              minimumClusterSize: 2,
              gridSize: 50,
              styles: [
                {
                  url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
                  height: 40,
                  width: 40,
                  textColor: "#FFFFFF",
                  textSize: 12,
                },
              ],
            }}
          >
            {(clusterer) => (
              <>
                {locations.map((location) => {
                  const coordinates = getMockCoordinates(location.city);
                  return (
                    <Marker
                      key={location.id}
                      position={coordinates}
                      onClick={() =>
                        onLocationSelect && onLocationSelect(location)
                      }
                      icon={getMarkerIcon(location.category)}
                      clusterer={clusterer}
                    >
                      {activeMarker === location.id && (
                        <InfoWindow
                          onLoad={onInfoWindowLoad}
                          position={coordinates}
                          onCloseClick={() => setActiveMarker(null)}
                        >
                          <div style={{ padding: "8px", maxWidth: "200px" }}>
                            <h3
                              style={{
                                margin: "0 0 8px 0",
                                fontSize: "16px",
                                color: "#1a1a1a",
                              }}
                            >
                              {location.name}
                            </h3>
                            <p
                              style={{
                                margin: "0",
                                fontSize: "14px",
                                color: "#4a4a4a",
                              }}
                            >
                              {location.address}
                            </p>
                            <p
                              style={{
                                margin: "4px 0 0 0",
                                fontSize: "12px",
                                color: "#666",
                              }}
                            >
                              {location.category.charAt(0).toUpperCase() +
                                location.category.slice(1)}
                            </p>
                            <p
                              style={{
                                margin: "4px 0 0 0",
                                fontSize: "12px",
                                color: "#666",
                              }}
                            >
                              {location.city}
                            </p>
                          </div>
                        </InfoWindow>
                      )}
                    </Marker>
                  );
                })}
              </>
            )}
          </MarkerClusterer>
        )}
        {selectedMapLocation && (
          <Marker
            position={selectedMapLocation}
            icon={{
              url: "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
              scaledSize: new window.google.maps.Size(32, 32),
            }}
          />
        )}
      </GoogleMap>
    </LoadScript>
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

          {/* Map Section - Only show when not in form mode */}
          {!showNewLocationForm && (
            <Card className="map-card">
              <Map
                locations={locations}
                selectedLocation={selectedLocation}
                onLocationSelect={handleLocationClick}
                height="400px"
              />
            </Card>
          )}

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
        <div className="full-width-container">
          {showNewLocationForm ? (
            <LocationForm
              onClose={() => setShowNewLocationForm(false)}
              onSave={handleSaveLocation}
              existingLocations={locations}
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
