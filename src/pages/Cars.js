import React, { useState } from "react";
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
import "../styles/Cars.css";

// Initial mock data for vehicles
const initialMockCars = [
  {
    id: "ABC-123",
    plateNumber: "ABC-123",
    make: "Toyota",
    model: "Hiace",
    year: "2022",
    type: "Van",
    capacity: "1.5",
    status: "Active",
    currentLocation: "Warehouse 1",
    lastMaintenance: "2024-02-15",
  },
  {
    id: "XYZ-789",
    plateNumber: "XYZ-789",
    make: "Ford",
    model: "Transit",
    year: "2023",
    type: "Truck",
    capacity: "3.0",
    status: "Maintenance",
    currentLocation: "Service Center",
    lastMaintenance: "2024-03-01",
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
  // State management
  const [cars, setCars] = useState(getStoredCars());
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [actionMenuAnchorEl, setActionMenuAnchorEl] = useState(null);
  const [selectedCar, setSelectedCar] = useState(null);
  const [showNewCarForm, setShowNewCarForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [filters, setFilters] = useState({
    type: "All",
    status: "All",
    location: "All",
  });

  const filterConfig = [
    {
      id: "type",
      label: "Vehicle Type",
      options: ["All", "Van", "Truck", "Car", "Other"],
    },
    {
      id: "status",
      label: "Status",
      options: ["All", "Active", "Maintenance", "Inactive"],
    },
    {
      id: "location",
      label: "Current Location",
      options: [
        "All",
        "Warehouse 1",
        "Warehouse 2",
        "Service Center",
        "On Route",
      ],
    },
  ];

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
    setSelectedCar(car);
    setActionMenuAnchorEl(event.currentTarget);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchorEl(null);
    setSelectedCar(null);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleAddNewCar = () => {
    setShowNewCarForm(true);
  };

  const handleCarAdded = (newCar) => {
    const carToAdd = {
      id: newCar.plateNumber,
      plateNumber: newCar.plateNumber,
      make: newCar.make,
      model: newCar.model,
      year: newCar.year,
      type: newCar.type,
      capacity: newCar.capacity,
      status: newCar.status,
      currentLocation: newCar.location,
      lastMaintenance: newCar.lastMaintenance,
    };

    const updatedCars = [...cars, carToAdd];
    setCars(updatedCars);
    localStorage.setItem("cars", JSON.stringify(updatedCars));
    setShowNewCarForm(false);
  };

  const handleDeleteCar = (carId) => {
    const updatedCars = cars.filter((car) => car.id !== carId);
    setCars(updatedCars);
    localStorage.setItem("cars", JSON.stringify(updatedCars));
    handleActionMenuClose();
  };

  const handleEditClick = (car) => {
    setSelectedCar(car);
    setEditingCar({
      id: car.id,
      plateNumber: car.plateNumber,
      make: car.make,
      model: car.model,
      year: car.year,
      type: car.type,
      capacity: car.capacity,
      status: car.status,
      location: car.currentLocation,
      lastMaintenance: car.lastMaintenance,
    });
    setIsEditing(true);
    handleActionMenuClose();
  };

  const handleEditSubmit = (editedCar) => {
    const updatedCar = {
      id: editedCar.id,
      plateNumber: editedCar.plateNumber,
      make: editedCar.make,
      model: editedCar.model,
      year: editedCar.year,
      type: editedCar.type,
      capacity: editedCar.capacity,
      status: editedCar.status,
      currentLocation: editedCar.location,
      lastMaintenance: editedCar.lastMaintenance,
    };

    const updatedCars = cars.map((car) =>
      car.id === editedCar.id ? updatedCar : car
    );

    setCars(updatedCars);
    localStorage.setItem("cars", JSON.stringify(updatedCars));
    setIsEditing(false);
    setEditingCar(null);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingCar(null);
  };

  // Filter and search logic
  const filteredCars = cars.filter((car) => {
    const matchesSearch = Object.values(car).some((value) =>
      value.toString().toLowerCase().includes(searchQuery.toLowerCase())
    );

    const matchesFilters =
      (filters.type === "All" || car.type === filters.type) &&
      (filters.status === "All" || car.status === filters.status) &&
      (filters.location === "All" || car.currentLocation === filters.location);

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
        <button className="back-button" onClick={handleCancelEdit}>
          <ArrowBackIcon />
          Back to Vehicles
        </button>
        <EditCarCard
          car={editingCar}
          onCancel={handleCancelEdit}
          onEditSubmit={handleEditSubmit}
        />
      </div>
    );
  }

  if (showNewCarForm) {
    return (
      <div className="cars-container">
        <NewCarCard
          onCancel={() => setShowNewCarForm(false)}
          onCarAdded={handleCarAdded}
        />
      </div>
    );
  }

  return (
    <div className="cars-container">
      {/* Header Section */}
      <div className="cars-header">
        <h1 className="cars-title">Fleet Vehicles</h1>
        <Button
          variant="outlined"
          color="success"
          startIcon={<AddIcon />}
          className="add-car-button"
          onClick={handleAddNewCar}
        >
          Add New Vehicle
        </Button>
      </div>

      {/* Filters and Search Section */}
      <Card className="filters-card">
        <Grid container spacing={3} className="filters-grid">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search vehicles..."
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

      {/* Cars Table */}
      <Card className="cars-table-card">
        <TableContainer>
          <Table className="cars-table">
            <TableHead>
              <TableRow>
                <TableCell>Plate Number</TableCell>
                <TableCell>Make</TableCell>
                <TableCell>Model</TableCell>
                <TableCell>Year</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Capacity (Tons)</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Current Location</TableCell>
                <TableCell>Last Maintenance</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedCars.map((car) => (
                <TableRow key={car.id}>
                  <TableCell>{car.plateNumber}</TableCell>
                  <TableCell>{car.make}</TableCell>
                  <TableCell>{car.model}</TableCell>
                  <TableCell>{car.year}</TableCell>
                  <TableCell>{car.type}</TableCell>
                  <TableCell>{car.capacity} tons</TableCell>
                  <TableCell>
                    <Chip
                      label={car.status}
                      className={`status-chip status-${car.status.toLowerCase()}`}
                    />
                  </TableCell>
                  <TableCell>{car.currentLocation}</TableCell>
                  <TableCell>{car.lastMaintenance}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      className="action-button"
                      onClick={(e) => handleActionMenuOpen(e, car)}
                    >
                      <MoreIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <div className="pagination-container">
          <TablePagination
            component="div"
            count={filteredCars.length}
            page={page}
            onPageChange={handlePageChange}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleRowsPerPageChange}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </div>
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={actionMenuAnchorEl}
        open={Boolean(actionMenuAnchorEl)}
        onClose={handleActionMenuClose}
        className="action-menu"
      >
        <MenuItem
          onClick={() => selectedCar && handleEditClick(selectedCar)}
          className="action-menu-item"
        >
          <EditIcon fontSize="small" /> Edit
        </MenuItem>
        <MenuItem
          onClick={() => selectedCar && handleDeleteCar(selectedCar.id)}
          className="action-menu-item delete"
        >
          <DeleteIcon fontSize="small" /> Delete
        </MenuItem>
      </Menu>
    </div>
  );
}

// NewCarCard Component
function NewCarCard({ onCancel, onCarAdded }) {
  const [formData, setFormData] = useState({
    plateNumber: "",
    make: "",
    model: "",
    year: "",
    type: "",
    capacity: "",
    status: "Active",
    location: "",
    lastMaintenance: "",
  });

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
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
          <label htmlFor="plateNumber" className="car-label">
            Plate Number
          </label>
          <input
            id="plateNumber"
            className="car-input-field"
            value={formData.plateNumber}
            onChange={handleInputChange}
            required
            placeholder="Enter plate number"
          />
        </div>

        <div className="add-new-car-form-group">
          <label htmlFor="make" className="car-label">
            Make
          </label>
          <input
            id="make"
            className="car-input-field"
            value={formData.make}
            onChange={handleInputChange}
            required
            placeholder="Enter vehicle make"
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
          <label htmlFor="type" className="car-label">
            Vehicle Type
          </label>
          <div className="car-select-wrapper">
            <select
              id="type"
              className="car-select-field"
              value={formData.type}
              onChange={handleInputChange}
              required
            >
              <option value="" disabled>
                Select vehicle type
              </option>
              <option value="Van">Van</option>
              <option value="Truck">Truck</option>
              <option value="Car">Car</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="add-new-car-form-group">
          <label htmlFor="capacity" className="car-label">
            Capacity (Tons)
          </label>
          <input
            id="capacity"
            type="number"
            step="0.1"
            min="0.1"
            className="car-input-field"
            value={formData.capacity}
            onChange={handleInputChange}
            required
            placeholder="e.g., 1.5"
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
              <option value="Active">Active</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="add-new-car-form-group">
          <label htmlFor="location" className="car-label">
            Current Location
          </label>
          <div className="car-select-wrapper">
            <select
              id="location"
              className="car-select-field"
              value={formData.location}
              onChange={handleInputChange}
              required
            >
              <option value="" disabled>
                Select location
              </option>
              <option value="Warehouse 1">Warehouse 1</option>
              <option value="Warehouse 2">Warehouse 2</option>
              <option value="Service Center">Service Center</option>
              <option value="On Route">On Route</option>
            </select>
          </div>
        </div>

        <div className="add-new-car-form-group">
          <label htmlFor="lastMaintenance" className="car-label">
            Last Maintenance Date
          </label>
          <input
            id="lastMaintenance"
            type="date"
            className="car-input-field"
            value={formData.lastMaintenance}
            onChange={handleInputChange}
            required
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
  const [formData, setFormData] = useState(car);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
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
          <label htmlFor="plateNumber" className="car-label">
            Plate Number
          </label>
          <input
            id="plateNumber"
            className="car-input-field"
            value={formData.plateNumber}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="add-new-car-form-group">
          <label htmlFor="make" className="car-label">
            Make
          </label>
          <input
            id="make"
            className="car-input-field"
            value={formData.make}
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
          <label htmlFor="type" className="car-label">
            Vehicle Type
          </label>
          <div className="car-select-wrapper">
            <select
              id="type"
              className="car-select-field"
              value={formData.type}
              onChange={handleInputChange}
              required
            >
              <option value="Van">Van</option>
              <option value="Truck">Truck</option>
              <option value="Car">Car</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="add-new-car-form-group">
          <label htmlFor="capacity" className="car-label">
            Capacity (Tons)
          </label>
          <input
            id="capacity"
            type="number"
            step="0.1"
            min="0.1"
            className="car-input-field"
            value={formData.capacity}
            onChange={handleInputChange}
            required
            placeholder="e.g., 1.5"
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
              <option value="Active">Active</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="add-new-car-form-group">
          <label htmlFor="location" className="car-label">
            Current Location
          </label>
          <div className="car-select-wrapper">
            <select
              id="location"
              className="car-select-field"
              value={formData.location}
              onChange={handleInputChange}
              required
            >
              <option value="Warehouse 1">Warehouse 1</option>
              <option value="Warehouse 2">Warehouse 2</option>
              <option value="Service Center">Service Center</option>
              <option value="On Route">On Route</option>
            </select>
          </div>
        </div>

        <div className="add-new-car-form-group">
          <label htmlFor="lastMaintenance" className="car-label">
            Last Maintenance Date
          </label>
          <input
            id="lastMaintenance"
            type="date"
            className="car-input-field"
            value={formData.lastMaintenance}
            onChange={handleInputChange}
            required
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
