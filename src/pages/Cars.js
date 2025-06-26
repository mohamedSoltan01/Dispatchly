import React, { useState, useEffect } from "react";
import "../styles/Cars.css";
import { addNotification } from "../utils/notifications";
import { vehiclesService } from "../services/vehicles";
import {
  Box,
  Card,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Menu,
  MenuItem,
  Button,
  Select,
  FormControl,
  InputLabel,
  Grid,
} from "@mui/material";
import {
  Search as SearchIcon,
  MoreVert as MoreIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";

// Filter configuration for the vehicles table
const filterConfig = [
  {
    id: 'box_type',
    label: 'Box Type',
    options: ['All', 'closed', 'open']
  },
  {
    id: 'status',
    label: 'Status',
    options: ['All', 'active', 'maintenance', 'inactive']
  }
];

// Initial mock data for vehicles
const initialMockCars = [
  {
    id: "ABC-123",
    plate_number: "ABC-123",
    model: "Hiace",
    year: "2022",
    box_type: "closed",
    capacity_volume: "1.5",
    capacity_weight: "1000",
    status: "active",
    current_location: "Warehouse 1",
    last_maintenance_date: "2024-02-15",
    freezing_available: false,
  },
  {
    id: "XYZ-789",
    plate_number: "XYZ-789",
    model: "Transit",
    year: "2023",
    box_type: "open",
    capacity_volume: "3.0",
    capacity_weight: "2000",
    status: "maintenance",
    current_location: "Service Center",
    last_maintenance_date: "2024-03-01",
    freezing_available: false,
  },
];

// Helper function to get cars from localStorage or use initial data
const getStoredCars = () => {
  const storedCars = localStorage.getItem("cars");
  if (storedCars) {
    return JSON.parse(storedCars);
  }
  localStorage.setItem("cars", JSON.stringify(initialMockCars));
  return initialMockCars;
};

function Cars() {
  // State declarations
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [actionMenuAnchorEl, setActionMenuAnchorEl] = useState(null);
  const [showNewVehicleForm, setShowNewVehicleForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [filters, setFilters] = useState({
    box_type: "All",
    status: "All",
  });
  const [formData, setFormData] = useState({
    plate_number: "",
    capacity_volume: "",
    capacity_weight: "",
    status: "active",
    model: "",
    year: "",
    box_type: "closed",
    last_maintenance_date: "",
    freezing_available: false
  });

  // Get current user role from localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  const currentUserRole = user?.role;

  // Fetch vehicles on component mount
  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await vehiclesService.getVehicles();
      setVehicles(data);
    } catch (err) {
      console.error('Error fetching vehicles:', err);
      setError('Failed to load vehicles. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddVehicle = async (vehicleData) => {
    try {
      setError(null);
      // Ensure we're sending the exact status from the form
      const vehicleToCreate = {
        ...vehicleData,
        status: vehicleData.status // Explicitly include the status from form data
      };
      const newVehicle = await vehiclesService.createVehicle({ vehicle: vehicleToCreate });
      setVehicles(prev => [...prev, newVehicle]);
      setShowNewVehicleForm(false);
      setFormData({
        plate_number: "",
        capacity_volume: "",
        capacity_weight: "",
        status: "active", // Reset to default for next form
        model: "",
        year: "",
        box_type: "closed",
        last_maintenance_date: "",
        freezing_available: false
      });
    } catch (err) {
      console.error('Error adding vehicle:', err);
      setError('Failed to add vehicle. Please try again.');
    }
  };

  const handleUpdateVehicle = async (id, updatedData) => {
    try {
      setError(null);
      const updatedVehicle = await vehiclesService.updateVehicle(id, { vehicle: updatedData });
      setVehicles(prev => 
        prev.map(vehicle => 
          vehicle.id === id ? updatedVehicle : vehicle
        )
      );
      setSelectedVehicle(null);
    } catch (err) {
      console.error('Error updating vehicle:', err);
      setError('Failed to update vehicle. Please try again.');
    }
  };

  const handleDeleteVehicle = async (id) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        setError(null);
        await vehiclesService.deleteVehicle(id);
        setVehicles(prev => prev.filter(vehicle => vehicle.id !== id));
      } catch (err) {
        console.error('Error deleting vehicle:', err);
        setError('Failed to delete vehicle. Please try again.');
      }
    }
  };

  const handleUpdateLocation = async (id, locationData) => {
    try {
      setError(null);
      await vehiclesService.updateVehicleLocation(id, locationData);
      // Refresh vehicle data to get updated location
      await fetchVehicles();
    } catch (err) {
      console.error('Error updating vehicle location:', err);
      setError('Failed to update vehicle location. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading vehicles...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button 
          className="retry-button"
          onClick={fetchVehicles}
        >
          Retry
        </button>
      </div>
    );
  }

  // Handlers
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };

  const handleFilterChange = (filterId, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterId]: value,
    }));
    setPage(0);
  };

  const handleActionMenuOpen = (event, car) => {
    setSelectedVehicle(car);
    setActionMenuAnchorEl(event.currentTarget);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchorEl(null);
    setSelectedVehicle(null);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEditClick = (car) => {
    setSelectedVehicle(car);
    setEditingVehicle({
      id: car.id,
      plate_number: car.plate_number,
      model: car.model,
      year: car.year,
      box_type: car.box_type,
      capacity_volume: car.capacity_volume,
      capacity_weight: car.capacity_weight,
      status: car.status,
      last_maintenance_date: car.last_maintenance_date,
      freezing_available: car.freezing_available,
    });
    setIsEditing(true);
    handleActionMenuClose();
  };

  // Filter and search logic
  const filteredCars = vehicles.filter((car) => {
    const matchesSearch = Object.values(car).some((value) =>
      value.toString().toLowerCase().includes(searchQuery.toLowerCase())
    );

    const matchesFilters =
      (filters.box_type === "All" || car.box_type === filters.box_type) &&
      (filters.status === "All" || car.status === filters.status);

    return matchesSearch && matchesFilters;
  });

  // Pagination
  const paginatedCars = filteredCars.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (isEditing) {
    return (
      <div className="cars-container">
        <button className="back-button" onClick={() => setIsEditing(false)}>
          <ArrowBackIcon />
          Back to Vehicles
        </button>
        <EditCarCard
          vehicle={editingVehicle}
          formData={formData}
          setFormData={setFormData}
          handleUpdateVehicle={handleUpdateVehicle}
          handleEditClick={handleEditClick}
          handleDeleteVehicle={handleDeleteVehicle}
        />
      </div>
    );
  }

  if (showNewVehicleForm) {
    return (
      <div className="cars-container">
        <NewCarCard
          onCancel={() => setShowNewVehicleForm(false)}
          onCarAdded={handleAddVehicle}
        />
      </div>
    );
  }

  return (
    <Box className="cars-container">
      <div className="cars-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 className="cars-title">Vehicles</h1>
        <Button
          variant="outlined"
          color="success"
          startIcon={<AddIcon />}
          className="add-product-button"
          onClick={() => setShowNewVehicleForm(true)}
        >
          Add Vehicle
        </Button>
      </div>

      <Card className="filters-card">
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search vehicles..."
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={8}>
            <div className="filters-container">
              {filterConfig.map(({ id, label, options }) => (
                <FormControl key={id} className="filter-select">
                  <InputLabel id={`${id}-label`}>{label}</InputLabel>
                  <Select
                    labelId={`${id}-label`}
                    id={id}
                    value={filters[id]}
                    label={label}
                    onChange={(e) => handleFilterChange(id, e.target.value)}
                    size="small"
                  >
                    {options.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ))}
            </div>
          </Grid>
        </Grid>
      </Card>

      <TableContainer component={Card}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Vehicle ID</TableCell>
              <TableCell>Plate Number</TableCell>
              <TableCell>Model</TableCell>
              <TableCell>Year</TableCell>
              <TableCell>Box Type</TableCell>
              <TableCell>Capacity Volume</TableCell>
              <TableCell>Capacity Weight</TableCell>
              {currentUserRole === "super_admin" && <TableCell>Organization</TableCell>}
              <TableCell>Status</TableCell>
              <TableCell>Last Maintenance</TableCell>
              <TableCell>Freezing Available</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedCars.map((vehicle) => (
              <TableRow key={vehicle.id}>
                <TableCell>{vehicle.id}</TableCell>
                <TableCell>{vehicle.plate_number}</TableCell>
                <TableCell>{vehicle.model}</TableCell>
                <TableCell>{vehicle.year}</TableCell>
                <TableCell>{vehicle.box_type}</TableCell>
                <TableCell>{vehicle.capacity_volume}</TableCell>
                <TableCell>{vehicle.capacity_weight}</TableCell>
                {currentUserRole === "super_admin" && (
                  <TableCell>{vehicle.organization?.name || ""}</TableCell>
                )}
                <TableCell>
                  <Chip
                    label={vehicle.status}
                    color={
                      vehicle.status === 'active'
                        ? 'success'
                        : vehicle.status === 'maintenance'
                        ? 'warning'
                        : 'error'
                    }
                  />
                </TableCell>
                <TableCell>{vehicle.last_maintenance_date}</TableCell>
                <TableCell>{vehicle.freezing_available ? "Yes" : "No"}</TableCell>
                <TableCell>
                  <IconButton
                    onClick={(e) => handleActionMenuOpen(e, vehicle)}
                    size="small"
                  >
                    <MoreIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={filteredCars.length}
          page={page}
          onPageChange={handlePageChange}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </TableContainer>

      {/* Action Menu */}
      <Menu
        anchorEl={actionMenuAnchorEl}
        open={Boolean(actionMenuAnchorEl)}
        onClose={handleActionMenuClose}
      >
        <MenuItem onClick={() => handleEditClick(selectedVehicle)}>
          <EditIcon fontSize="small" /> Edit
        </MenuItem>
        <MenuItem onClick={() => handleDeleteVehicle(selectedVehicle?.id)}>
          <DeleteIcon fontSize="small" /> Delete
        </MenuItem>
      </Menu>
    </Box>
  );
}

// NewCarCard Component
function NewCarCard({ onCancel, onCarAdded }) {
  const [formData, setFormData] = useState({
    plate_number: "",
    model: "",
    year: "",
    box_type: "closed",
    capacity_volume: "",
    capacity_weight: "",
    status: "active",
    last_maintenance_date: "",
    freezing_available: false
  });

  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onCarAdded(formData);
  };

  return (
    <div className="car-container">
      <button className="back-button" onClick={onCancel}>
        <ArrowBackIcon />
        Back to Vehicles
      </button>
      <form className="new-car-card" onSubmit={handleSubmit}>
        <h1 className="car-title">Add New Vehicle</h1>

        <div className="add-new-car-form-group">
          <label htmlFor="plate_number" className="car-label">
            Plate Number
          </label>
          <input
            id="plate_number"
            className="car-input-field"
            value={formData.plate_number}
            onChange={handleInputChange}
            required
            placeholder="Enter plate number"
          />
        </div>

        <div className="add-new-car-form-group">
          <label htmlFor="model" className="car-label">
            Model
          </label>
          <input
            id="model"
            className="car-input-field"
            value={formData.model}
            onChange={handleInputChange}
            required
            placeholder="Enter vehicle model"
          />
        </div>

        <div className="add-new-car-form-group">
          <label htmlFor="year" className="car-label">
            Year
          </label>
          <input
            id="year"
            type="number"
            className="car-input-field"
            value={formData.year}
            onChange={handleInputChange}
            required
            min="1900"
            max={new Date().getFullYear()}
            placeholder="Enter vehicle year"
          />
        </div>

        <div className="add-new-car-form-group">
          <label htmlFor="box_type" className="car-label">
            Box Type
          </label>
          <div className="car-select-wrapper">
            <select
              id="box_type"
              className="car-select-field"
              value={formData.box_type}
              onChange={handleInputChange}
              required
            >
              <option value="" disabled>
                Select box type
              </option>
              <option value="closed">Closed</option>
              <option value="open">Open</option>
            </select>
          </div>
        </div>

        <div className="add-new-car-form-group">
          <label htmlFor="capacity_volume" className="car-label">
            Capacity (Volume)
          </label>
          <input
            id="capacity_volume"
            type="number"
            step="0.1"
            min="0.1"
            className="car-input-field"
            value={formData.capacity_volume}
            onChange={handleInputChange}
            required
            placeholder="e.g., 1.5"
          />
        </div>

        <div className="add-new-car-form-group">
          <label htmlFor="capacity_weight" className="car-label">
            Capacity (Weight)
          </label>
          <input
            id="capacity_weight"
            type="number"
            step="100"
            min="100"
            className="car-input-field"
            value={formData.capacity_weight}
            onChange={handleInputChange}
            required
            placeholder="e.g., 1000"
          />
        </div>

        <div className="add-new-car-form-group">
          <label htmlFor="status" className="car-label">
            Status
          </label>
          <div className="car-select-wrapper">
            <select
              id="status"
              className="car-select-field"
              value={formData.status}
              onChange={handleInputChange}
              required
            >
              <option value="active">Active</option>
              <option value="maintenance">Maintenance</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="add-new-car-form-group">
          <label htmlFor="last_maintenance_date" className="car-label">
            Last Maintenance Date
          </label>
          <input
            id="last_maintenance_date"
            type="date"
            className="car-input-field"
            value={formData.last_maintenance_date}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="add-new-car-form-group">
          <label htmlFor="freezing_available" className="car-label">
            Freezing Available
          </label>
          <input
            id="freezing_available"
            type="checkbox"
            className="car-checkbox"
            checked={formData.freezing_available}
            onChange={handleInputChange}
            disabled={formData.box_type === "open"}
          />
        </div>

        <div className="car-actions">
          <button type="submit" className="new-car-button car-add-button">
            Add Vehicle
          </button>
          <button type="button" className="car-cancel-link" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

// EditCarCard Component
function EditCarCard({ car, onCancel, onEditSubmit }) {
  const [formData, setFormData] = useState({
    plate_number: car?.plate_number || '',
    model: car?.model || '',
    year: car?.year || '',
    box_type: car?.box_type || 'closed',
    capacity_volume: car?.capacity_volume || '',
    capacity_weight: car?.capacity_weight || '',
    status: car?.status || 'active',
    last_maintenance_date: car?.last_maintenance_date || '',
    freezing_available: car?.freezing_available || false
  });

  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onEditSubmit(formData);
  };

  return (
    <div className="car-container">
      <form className="new-car-card" onSubmit={handleSubmit}>
        <h1 className="car-title">Edit Vehicle</h1>

        <div className="add-new-car-form-group">
          <label htmlFor="plate_number" className="car-label">
            Plate Number
          </label>
          <input
            id="plate_number"
            className="car-input-field"
            value={formData.plate_number}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="add-new-car-form-group">
          <label htmlFor="model" className="car-label">
            Model
          </label>
          <input
            id="model"
            className="car-input-field"
            value={formData.model}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="add-new-car-form-group">
          <label htmlFor="year" className="car-label">
            Year
          </label>
          <input
            id="year"
            type="number"
            className="car-input-field"
            value={formData.year}
            onChange={handleInputChange}
            required
            min="1900"
            max={new Date().getFullYear()}
          />
        </div>

        <div className="add-new-car-form-group">
          <label htmlFor="box_type" className="car-label">
            Box Type
          </label>
          <div className="car-select-wrapper">
            <select
              id="box_type"
              className="car-select-field"
              value={formData.box_type}
              onChange={handleInputChange}
              required
            >
              <option value="closed">Closed</option>
              <option value="open">Open</option>
            </select>
          </div>
        </div>

        <div className="add-new-car-form-group">
          <label htmlFor="capacity_volume" className="car-label">
            Capacity (Volume)
          </label>
          <input
            id="capacity_volume"
            type="number"
            step="0.1"
            min="0.1"
            className="car-input-field"
            value={formData.capacity_volume}
            onChange={handleInputChange}
            required
            placeholder="e.g., 1.5"
          />
        </div>

        <div className="add-new-car-form-group">
          <label htmlFor="capacity_weight" className="car-label">
            Capacity (Weight)
          </label>
          <input
            id="capacity_weight"
            type="number"
            step="100"
            min="100"
            className="car-input-field"
            value={formData.capacity_weight}
            onChange={handleInputChange}
            required
            placeholder="e.g., 1000"
          />
        </div>

        <div className="add-new-car-form-group">
          <label htmlFor="status" className="car-label">
            Status
          </label>
          <div className="car-select-wrapper">
            <select
              id="status"
              className="car-select-field"
              value={formData.status}
              onChange={handleInputChange}
              required
            >
              <option value="active">Active</option>
              <option value="maintenance">Maintenance</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="add-new-car-form-group">
          <label htmlFor="last_maintenance_date" className="car-label">
            Last Maintenance Date
          </label>
          <input
            id="last_maintenance_date"
            type="date"
            className="car-input-field"
            value={formData.last_maintenance_date}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="add-new-car-form-group">
          <label htmlFor="freezing_available" className="car-label">
            Freezing Available
          </label>
          <input
            id="freezing_available"
            type="checkbox"
            className="car-checkbox"
            checked={formData.freezing_available}
            onChange={handleInputChange}
            disabled={formData.box_type === "open"}
          />
        </div>

        <div className="car-actions">
          <button type="submit" className="new-car-button car-add-button">
            Save Changes
          </button>
          <button type="button" className="car-cancel-link" onClick={onCancel}>
            cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default Cars;
