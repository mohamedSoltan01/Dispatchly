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
  Alert,
  Snackbar,
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
  Autocomplete,
} from "@react-google-maps/api";
import locationService from '../services/locationService';

// Map component
const Map = ({
  locations,
  selectedLocation,
  onLocationSelect,
  onMapClick,
  height = "300px",
  isFormMap = false,
  onMapLoad: handleMapLoad,
  selectedMapLocation,
}) => {
  const [map, setMap] = useState(null);
  const [infoWindow, setInfoWindow] = useState(null);
  const [activeMarker, setActiveMarker] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [bounds, setBounds] = useState(null);

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
          bounds.extend({
            lat: parseFloat(location.latitude),
            lng: parseFloat(location.longitude)
          });
        });
        map.fitBounds(bounds);
        setBounds(bounds);
      }

      // Call the parent's onMapLoad handler if provided
      if (handleMapLoad) {
        handleMapLoad(map);
      }
    },
    [locations, handleMapLoad]
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

  const getMarkerIcon = (locationType) => {
    if (!isLoaded || !window.google) return null;

    return {
      url:
        locationType === "warehouse"
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
      libraries={["places"]}
    >
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={10}
        center={selectedMapLocation || defaultCenter}
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
                {locations.map((location) => (
                  <Marker
                    key={location.id}
                    position={{
                      lat: parseFloat(location.latitude),
                      lng: parseFloat(location.longitude)
                    }}
                    onClick={() => onLocationSelect && onLocationSelect(location)}
                    icon={getMarkerIcon(location.location_type)}
                    clusterer={clusterer}
                  >
                    {activeMarker === location.id && (
                      <InfoWindow
                        onLoad={onInfoWindowLoad}
                        position={{
                          lat: parseFloat(location.latitude),
                          lng: parseFloat(location.longitude)
                        }}
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
                            {location.location_type.charAt(0).toUpperCase() +
                              location.location_type.slice(1)}
                          </p>
                        </div>
                      </InfoWindow>
                    )}
                  </Marker>
                ))}
              </>
            )}
          </MarkerClusterer>
        )}
        {isFormMap && selectedMapLocation && (
          <Marker
            position={selectedMapLocation}
            icon={{
              url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
              scaledSize: new window.google.maps.Size(32, 32),
            }}
          />
        )}
      </GoogleMap>
    </LoadScript>
  );
};

// LocationDetails component
const LocationDetails = ({ location, onClose }) => {
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
            {`${location.latitude}, ${location.longitude}`}
          </Typography>
        </div>
        <Divider />
        <div className="detail-group">
          <Typography variant="subtitle2" color="textSecondary">
            Type
          </Typography>
          <Chip
            label={location.location_type || 'warehouse'}
            className={`category-chip ${
              (location.location_type || 'warehouse') === 'warehouse'
                ? 'warehouse'
                : 'market'
            }`}
          />
        </div>
      </div>
    </div>
  );
};

// LocationForm component
const LocationForm = ({ onClose, onSave, existingLocations = [] }) => {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    latitude: "",
    longitude: "",
    location_type: "warehouse",
  });
  const [selectedMapLocation, setSelectedMapLocation] = useState(null);
  const [geocoder, setGeocoder] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchError, setSearchError] = useState("");
  const [autocomplete, setAutocomplete] = useState(null);
  const [map, setMap] = useState(null);

  // Initialize geocoder when map loads
  useEffect(() => {
    if (window.google && window.google.maps) {
      setGeocoder(new window.google.maps.Geocoder());
    }
  }, []);

  // Helper: Parse Google Maps URL
  const parseGoogleMapsUrl = async (url) => {
    const regex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
    const match = url.match(regex);
    if (match) {
      const lat = parseFloat(match[1]);
      const lng = parseFloat(match[2]);
      if (geocoder) {
        try {
          const response = await geocoder.geocode({ location: { lat, lng } });
          if (response.results && response.results[0]) {
            const result = response.results[0];
            let address = result.formatted_address;
            // Extract city from address components
            let city = "";
            for (const component of result.address_components) {
              if (component.types.includes("locality")) {
                city = component.long_name;
                break;
              }
            }
            setFormData((prev) => ({
              ...prev,
              latitude: lat.toString(),
              longitude: lng.toString(),
              address: address || prev.address,
              city: city || prev.city,
            }));
            setSelectedMapLocation({ lat, lng });
            if (map) {
              map.panTo({ lat, lng });
              map.setZoom(15);
            }
            setSearchError("");
            return true;
          }
        } catch (e) {
          setSearchError("Failed to get address from coordinates.");
        }
      }
      setSearchError("Could not extract address from coordinates.");
      return false;
    }
    setSearchError("Could not extract coordinates from URL.");
    return false;
  };

  // Modified search input handler
  const handleSearchInputChange = (e) => {
    setSearchInput(e.target.value);
    setSearchError("");
  };

  // Handle blur or enter: if input is a Google Maps URL, try to parse
  const handleSearchBlurOrEnter = async () => {
    if (searchInput.match(/^https?:\/\/(www\.)?google\.[^\s]+\/maps/)) {
      await parseGoogleMapsUrl(searchInput);
    } else if (autocomplete && searchInput) {
      setSearchError("Please select a valid location from the dropdown");
    }
  };

  const onPlaceSelected = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      if (place.geometry) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        let address = place.formatted_address;
        
        // Extract city from address components
        let city = "";
        for (const component of place.address_components) {
          if (component.types.includes("locality")) {
            city = component.long_name;
            break;
          }
        }

        // If city is not found in locality, try administrative_area_level_1
        if (!city) {
          for (const component of place.address_components) {
            if (component.types.includes("administrative_area_level_1")) {
              city = component.long_name;
              break;
            }
          }
        }

        // If still no city found, try to extract from formatted_address
        if (!city && address) {
          const addressParts = address.split(',');
          if (addressParts.length > 1) {
            city = addressParts[1].trim();
          }
        }

        setFormData((prev) => ({
          ...prev,
          latitude: lat.toString(),
          longitude: lng.toString(),
          address: address || prev.address,
          city: city || prev.city,
        }));
        setSelectedMapLocation({ lat, lng });
        if (map) {
          map.panTo({ lat, lng });
          map.setZoom(15);
        }
        setSearchError("");
      } else {
        setSearchError("Please select a valid location from the dropdown");
      }
    }
  };

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
        const response = await geocoder.geocode({ location: { lat, lng } });
        if (response.results && response.results[0]) {
          const result = response.results[0];
          let address = result.formatted_address;

          // Extract city from address components
          let city = "";
          for (const component of result.address_components) {
            if (component.types.includes("locality")) {
              city = component.long_name;
              break;
            }
          }

          // If city is not found in locality, try administrative_area_level_1
          if (!city) {
            for (const component of result.address_components) {
              if (component.types.includes("administrative_area_level_1")) {
                city = component.long_name;
                break;
              }
            }
          }

          // If still no city found, try to extract from formatted_address
          if (!city && address) {
            const addressParts = address.split(',');
            if (addressParts.length > 1) {
              city = addressParts[1].trim();
            }
          }

          setFormData((prev) => ({
            ...prev,
            latitude: lat.toString(),
            longitude: lng.toString(),
            address: address || prev.address,
            city: city || prev.city,
          }));

          setSelectedMapLocation({ lat, lng });
          
          // Pan and zoom the map to the selected location
          if (map) {
            map.panTo({ lat, lng });
            map.setZoom(15);
          }
        }
      } catch (error) {
        console.error("Error getting address details:", error);
      }
    },
    [geocoder, map]
  );

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave(formData);
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
            selectedLocation={selectedMapLocation}
            isFormMap={true}
            onMapLoad={(map) => setMap(map)}
            selectedMapLocation={selectedMapLocation}
          />
        </div>
        <div className="location-form-fields">
          <LoadScript
            googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
            libraries={["places"]}
          >
            <Autocomplete
              onLoad={setAutocomplete}
              onPlaceChanged={onPlaceSelected}
              restrictions={{ country: "eg" }}
            >
              <TextField
                fullWidth
                label="Search for a location"
                value={searchInput}
                onChange={handleSearchInputChange}
                onBlur={handleSearchBlurOrEnter}
                onKeyDown={async (e) => {
                  if (e.key === "Enter") {
                    await handleSearchBlurOrEnter();
                  }
                }}
                margin="normal"
                error={!!searchError}
                helperText={searchError}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                autoComplete="off"
              />
            </Autocomplete>
          </LoadScript>
          <form onSubmit={handleSubmit} className="location-form">
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  id="location-name"
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
                  id="location-type"
                  fullWidth
                  select
                  label="Location Type"
                  name="location_type"
                  value={formData.location_type}
                  onChange={handleChange}
                  required
                  margin="normal"
                >
                  <MenuItem value="warehouse">Warehouse</MenuItem>
                  <MenuItem value="market">Market</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  id="location-address"
                  fullWidth
                  label="Address"
                  name="address"
                  value={formData.address}
                  required
                  margin="normal"
                  multiline
                  rows={2}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  id="location-city"
                  fullWidth
                  label="City"
                  name="city"
                  value={formData.city}
                  required
                  margin="normal"
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  id="location-latitude"
                  fullWidth
                  label="Latitude"
                  name="latitude"
                  value={formData.latitude}
                  required
                  type="number"
                  inputProps={{ step: "any", readOnly: true }}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  id="location-longitude"
                  fullWidth
                  label="Longitude"
                  name="longitude"
                  value={formData.longitude}
                  required
                  type="number"
                  inputProps={{ step: "any", readOnly: true }}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="success"
                  fullWidth
                  size="large"
                >
                  Save Location
                </Button>
              </Grid>
            </Grid>
          </form>
        </div>
      </div>
    </div>
  );
};

export default function Locations() {
  // State management
  const [locations, setLocations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showNewLocationForm, setShowNewLocationForm] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Fetch locations on component mount
  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const data = await locationService.getAllLocations();
      setLocations(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch locations. Please try again later.');
      console.error('Error fetching locations:', err);
    } finally {
      setLoading(false);
    }
  };

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

  const handleSaveLocation = async (newLocation) => {
    try {
      const savedLocation = await locationService.createLocation(newLocation);
      setLocations(prev => [...prev, savedLocation]);
    setShowNewLocationForm(false);
      setSnackbar({
        open: true,
        message: 'Location created successfully',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to create location. Please try again.',
        severity: 'error'
      });
      console.error('Error creating location:', err);
    }
  };

  const handleLocationClick = useCallback((location) => {
    setSelectedLocation(location);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setSelectedLocation(null);
  }, []);

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Filter locations based on search query
  const filteredLocations = locations.filter(
    (location) =>
      location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination
  const paginatedLocations = filteredLocations.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading) {
    return (
      <div className="locations-container">
        <Typography>Loading locations...</Typography>
      </div>
    );
  }

  if (error) {
    return (
      <div className="locations-container">
        <Alert severity="error">{error}</Alert>
      </div>
    );
  }

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
                selectedMapLocation={selectedLocation}
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
                        label={location.location_type || 'warehouse'}
                        className={`category-chip ${
                          (location.location_type || 'warehouse') === 'warehouse'
                            ? 'warehouse'
                            : 'market'
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

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
