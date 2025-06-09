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
  Visibility as ViewIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import "../styles/Products.css";
import { addNotification } from "../utils/notifications";

// Move mock data outside component but keep it as a constant
const initialMockProducts = [
  {
    id: "PRD001",
    skuName: "SKU-ELEC-001",
    dimensions: "10x20x30",
    weight: "2.5",
    temperature: "15-25°C",
    numberOfBoxes: 5,
    boxType: "Standard",
    currentLocation: "Warehouse 1",
    category: "Electronics",
  },
  {
    id: "PRD002",
    skuName: "SKU-CLOTH-002",
    dimensions: "15x25x35",
    weight: "1.8",
    temperature: "N/A",
    numberOfBoxes: 3,
    boxType: "Custom",
    currentLocation: "Warehouse 2",
    category: "Clothing",
  },
];

// Helper function to get products from localStorage or use initial data
const getStoredProducts = () => {
  try {
    const saved = localStorage.getItem("products");
    if (saved) {
      return JSON.parse(saved);
    }
    // Only set initial mock data if no products exist in localStorage
    localStorage.setItem("products", JSON.stringify(initialMockProducts));
    return initialMockProducts;
  } catch (error) {
    console.error("Error loading products from localStorage:", error);
    return initialMockProducts;
  }
};

// Add this helper function at the top level
const formatDimensions = (dimensions) => {
  if (!dimensions) return "";
  if (typeof dimensions === "string") return dimensions;
  if (typeof dimensions === "object") {
    return `${dimensions.length}x${dimensions.width}x${dimensions.height}`;
  }
  return "";
};

function Products({ onProductSelect, isSelectionMode = false }) {
  // State management
  const [products, setProducts] = useState(() => getStoredProducts());
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [actionMenuAnchorEl, setActionMenuAnchorEl] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showNewProductForm, setShowNewProductForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [filters, setFilters] = useState({
    category: "All",
    location: "All",
    boxType: "All",
  });

  const filterConfig = [
    {
      id: "category",
      label: "Category",
      options: ["All", "Electronics", "Clothing", "Food", "Other"],
    },
    {
      id: "location",
      label: "Current Location",
      options: ["All", "Warehouse 1", "Warehouse 2", "Store"],
    },
    {
      id: "boxType",
      label: "Box Type",
      options: ["All", "Standard", "Custom", "Special"],
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

  const handleActionMenuOpen = (event, product) => {
    setSelectedProduct(product);
    setActionMenuAnchorEl(event.currentTarget);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchorEl(null);
    setSelectedProduct(null);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleAddNewProduct = () => {
    setShowNewProductForm(true);
  };

  const handleProductAdded = (newProduct) => {
    const productToAdd = {
      id: `PRD${Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0")}`,
      skuName: newProduct.sku,
      dimensions: `${newProduct.length}x${newProduct.width}x${newProduct.height}`,
      weight: newProduct.weight,
      numberOfBoxes: Number(newProduct.numberOfBoxes),
      temperature: newProduct.minMaxTemp
        ? `${newProduct.minTemp}°C - ${newProduct.maxTemp}°C`
        : "N/A",
      boxType: newProduct.boxType,
      currentLocation: newProduct.location,
      category: newProduct.category,
      createdAt: new Date().toISOString(),
    };

    const updatedProducts = [...products, productToAdd];
    setProducts(updatedProducts);
    localStorage.setItem("products", JSON.stringify(updatedProducts));
    setShowNewProductForm(false);

    // Add notification for new product
    addNotification({
      type: "new_product",
      productName: newProduct.sku,
      category: newProduct.category,
      location: newProduct.location,
    });
  };

  const handleDeleteProduct = (productId) => {
    try {
      const updatedProducts = products.filter(
        (product) => product.id !== productId
      );
      setProducts(updatedProducts);
      localStorage.setItem("products", JSON.stringify(updatedProducts));
      handleActionMenuClose();
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleEditClick = (product) => {
    if (!product) return; // Guard against null/undefined product

    setSelectedProduct(product);

    // Handle dimensions based on their format
    let length = "",
      width = "",
      height = "";
    if (product.dimensions) {
      if (typeof product.dimensions === "string") {
        // Handle string format (e.g., "10x20x30")
        const dims = product.dimensions.split("x");
        if (dims.length === 3) {
          [length, width, height] = dims;
        }
      } else if (typeof product.dimensions === "object") {
        // Handle object format (e.g., { length: "10", width: "20", height: "30" })
        length = product.dimensions.length || "";
        width = product.dimensions.width || "";
        height = product.dimensions.height || "";
      }
    }

    // Safely handle temperature parsing
    let minTemp = "",
      maxTemp = "";
    const hasTemperature = product.temperature && product.temperature !== "N/A";
    if (hasTemperature) {
      try {
        const tempParts = product.temperature.split("-");
        if (tempParts.length === 2) {
          minTemp = tempParts[0].replace("°C", "").trim();
          maxTemp = tempParts[1].replace("°C", "").trim();
        }
      } catch (error) {
        console.error("Error parsing temperature:", error);
      }
    }

    setEditingProduct({
      id: product.id || "",
      sku: product.skuName || product.sku || "",
      length,
      width,
      height,
      weight: product.weight || "",
      minMaxTemp: hasTemperature,
      minTemp,
      maxTemp,
      boxType: product.boxType || "",
      location: product.currentLocation || product.location || "",
      category: product.category || "",
      numberOfBoxes: product.numberOfBoxes || 1,
    });
    setIsEditing(true);
    handleActionMenuClose();
  };

  const handleEditSubmit = (editedProduct) => {
    try {
      const updatedProduct = {
        id: editedProduct.id,
        skuName: editedProduct.sku,
        dimensions: `${editedProduct.length}x${editedProduct.width}x${editedProduct.height}`,
        weight: editedProduct.weight,
        temperature: editedProduct.minMaxTemp
          ? `${editedProduct.minTemp}-${editedProduct.maxTemp}°C`
          : "N/A",
        numberOfBoxes: editedProduct.numberOfBoxes,
        boxType: editedProduct.boxType,
        currentLocation: editedProduct.location,
        category: editedProduct.category,
      };

      const updatedProducts = products.map((product) =>
        product.id === editedProduct.id ? updatedProduct : product
      );

      setProducts(updatedProducts);
      localStorage.setItem("products", JSON.stringify(updatedProducts));
      setIsEditing(false);
      setEditingProduct(null);
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingProduct(null);
  };

  const handleProductClick = (product, event) => {
    if (isSelectionMode && onProductSelect) {
      // Stop event propagation to prevent menu from opening
      if (event) {
        event.stopPropagation();
      }
      // Call the selection handler
      onProductSelect(product);
    }
  };

  // Filter and search logic
  const filteredProducts = products.filter((product) => {
    const matchesSearch = Object.values(product).some((value) =>
      value.toString().toLowerCase().includes(searchQuery.toLowerCase())
    );

    const matchesFilters =
      (filters.category === "All" || product.category === filters.category) &&
      (filters.location === "All" ||
        product.currentLocation === filters.location) &&
      (filters.boxType === "All" || product.boxType === filters.boxType);

    return matchesSearch && matchesFilters;
  });

  // Pagination
  const paginatedProducts = filteredProducts.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (isEditing) {
    return (
      <div className="products-container">
        <button className="back-button" onClick={handleCancelEdit}>
          <ArrowBackIcon />
          Back to Products
        </button>
        <EditProductCard
          product={editingProduct}
          onCancel={handleCancelEdit}
          onEditSubmit={handleEditSubmit}
        />
      </div>
    );
  }

  if (showNewProductForm) {
    return (
      <div className="products-container">
        <button
          className="back-button"
          onClick={() => setShowNewProductForm(false)}
        >
          <ArrowBackIcon />
          Back to Products
        </button>
        <NewProductCard
          onCancel={() => setShowNewProductForm(false)}
          onProductAdded={handleProductAdded}
        />
      </div>
    );
  }

  return (
    <div className="products-container">
      {/* Header Section */}
      <div className="products-header">
        <h1 className="products-title">All Products</h1>
        <Button
          variant="outlined"
          color="success"
          startIcon={<AddIcon />}
          className="add-product-button"
          onClick={handleAddNewProduct}
        >
          Add New Product
        </Button>
      </div>

      {/* Filters and Search Section */}
      <Card className="filters-card">
        <Grid container spacing={3} className="filters-grid">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search products..."
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

      {/* Products Table */}
      <Card className="products-table-card">
        <TableContainer>
          <Table className="products-table">
            <TableHead>
              <TableRow>
                <TableCell>Product ID</TableCell>
                <TableCell>SKU Name</TableCell>
                <TableCell>Dimensions</TableCell>
                <TableCell>Weight (kg)</TableCell>
                <TableCell>Min-Max Temperature</TableCell>
                <TableCell>Number of Boxes</TableCell>
                <TableCell>Box Type</TableCell>
                <TableCell>Current Location</TableCell>
                <TableCell>Category</TableCell>
                {!isSelectionMode && (
                  <TableCell align="right">Actions</TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedProducts.map((product) => (
                <TableRow
                  key={product.id}
                  onClick={(event) => handleProductClick(product, event)}
                  style={{
                    cursor: isSelectionMode ? "pointer" : "default",
                    backgroundColor: isSelectionMode
                      ? "rgba(0, 0, 0, 0.04)"
                      : "inherit",
                  }}
                  hover={isSelectionMode}
                  className={isSelectionMode ? "selectable-row" : ""}
                >
                  <TableCell>{product.id}</TableCell>
                  <TableCell>{product.skuName}</TableCell>
                  <TableCell>{formatDimensions(product.dimensions)}</TableCell>
                  <TableCell>{product.weight}</TableCell>
                  <TableCell>{product.temperature}</TableCell>
                  <TableCell>{product.numberOfBoxes}</TableCell>
                  <TableCell>{product.boxType}</TableCell>
                  <TableCell>{product.currentLocation}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  {!isSelectionMode && (
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        className="action-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleActionMenuOpen(e, product);
                        }}
                      >
                        <MoreIcon />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <div className="pagination-container">
          <TablePagination
            component="div"
            count={filteredProducts.length}
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
          onClick={() => selectedProduct && handleEditClick(selectedProduct)}
          className="action-menu-item"
        >
          <EditIcon fontSize="small" /> Edit
        </MenuItem>
        <MenuItem
          onClick={() =>
            selectedProduct && handleDeleteProduct(selectedProduct.id)
          }
          className="action-menu-item delete"
        >
          <DeleteIcon fontSize="small" /> Delete
        </MenuItem>
      </Menu>
    </div>
  );
}

// NewProductCard Component
function NewProductCard({ onCancel, onProductAdded }) {
  const [formData, setFormData] = useState({
    sku: "",
    length: "",
    width: "",
    height: "",
    weight: "",
    numberOfBoxes: "1",
    minMaxTemp: false,
    minTemp: "",
    maxTemp: "",
    boxType: "",
    location: "",
    category: "",
  });
  const [tempError, setTempError] = useState("");
  const [boxesError, setBoxesError] = useState("");

  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target;

    if (id === "numberOfBoxes") {
      const numValue = value === "" ? "" : Number(value);
      if (numValue === "" || numValue >= 1) {
        setFormData((prev) => ({
          ...prev,
          [id]: value,
        }));
        setBoxesError("");
      } else {
        setBoxesError("Number of boxes must be at least 1");
      }
      return;
    }

    if (id === "minTemp" || id === "maxTemp") {
      const newValue = value === "" ? "" : Number(value);
      const otherTemp = id === "minTemp" ? "maxTemp" : "minTemp";
      const otherValue =
        formData[otherTemp] === "" ? "" : Number(formData[otherTemp]);

      setFormData((prev) => ({
        ...prev,
        [id]: newValue,
      }));

      // Validate temperature range
      if (
        id === "minTemp" &&
        otherValue !== "" &&
        newValue !== "" &&
        newValue > otherValue
      ) {
        setTempError(
          "Minimum temperature cannot be greater than maximum temperature"
        );
      } else if (
        id === "maxTemp" &&
        otherValue !== "" &&
        newValue !== "" &&
        newValue < otherValue
      ) {
        setTempError(
          "Maximum temperature cannot be less than minimum temperature"
        );
      } else {
        setTempError("");
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [id]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleDimensionChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate number of boxes
    const numBoxes = Number(formData.numberOfBoxes);
    if (!numBoxes || numBoxes < 1) {
      setBoxesError("Number of boxes must be at least 1");
      return;
    }

    // Final validation before submit
    if (formData.minMaxTemp) {
      const minTemp = Number(formData.minTemp);
      const maxTemp = Number(formData.maxTemp);

      if (minTemp > maxTemp) {
        setTempError(
          "Minimum temperature cannot be greater than maximum temperature"
        );
        return;
      }
    }

    if (tempError || boxesError) {
      return;
    }

    // Format temperature based on whether min/max temp is enabled
    const temperature = formData.minMaxTemp
      ? `${formData.minTemp}°C - ${formData.maxTemp}°C`
      : "N/A";

    onProductAdded({
      ...formData,
      temperature,
      numberOfBoxes: Number(formData.numberOfBoxes),
    });
  };

  const handleCancel = () => {
    setFormData({
      sku: "",
      length: "",
      width: "",
      height: "",
      weight: "",
      numberOfBoxes: "1",
      minMaxTemp: false,
      minTemp: "",
      maxTemp: "",
      boxType: "",
      location: "",
      category: "",
    });
    setBoxesError("");
    onCancel();
  };

  return (
    <div className="product-container">
      <form className="new-product-card" onSubmit={handleSubmit}>
        <h1 className="product-title">Add new product</h1>

        <div className="add-new-product-form-group">
          <label htmlFor="sku" className="product-label">
            SKU Name
          </label>
          <input
            id="sku"
            className="product-input-field"
            value={formData.sku}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="add-new-product-form-group">
          <label className="product-label">Dimensions</label>
          <div className="product-dimensions-container">
            <input
              id="length"
              type="number"
              className="product-dimension-box"
              placeholder="LENGTH"
              value={formData.length}
              onChange={handleDimensionChange}
              required
            />
            <span className="product-dimension-separator">X</span>
            <input
              id="width"
              type="number"
              className="product-dimension-box"
              placeholder="WIDTH"
              value={formData.width}
              onChange={handleDimensionChange}
              required
            />
            <span className="product-dimension-separator">X</span>
            <input
              id="height"
              type="number"
              className="product-dimension-box"
              placeholder="HEIGHT"
              value={formData.height}
              onChange={handleDimensionChange}
              required
            />
          </div>
        </div>

        <div className="add-new-product-form-group">
          <label htmlFor="weight" className="product-label">
            Weight
          </label>
          <input
            id="weight"
            type="number"
            className="product-input-field"
            value={formData.weight}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="add-new-product-form-group">
          <label htmlFor="numberOfBoxes" className="product-label">
            Number of Boxes
          </label>
          <input
            id="numberOfBoxes"
            type="number"
            className={`product-input-field ${boxesError ? "error" : ""}`}
            value={formData.numberOfBoxes}
            onChange={handleInputChange}
            required
            min="1"
            step="1"
            placeholder="Enter number of boxes"
          />
          {boxesError && <div className="error-message">{boxesError}</div>}
        </div>

        <div className="add-new-product-form-group">
          <div className="product-checkbox-container">
            <input
              type="checkbox"
              id="minMaxTemp"
              checked={formData.minMaxTemp}
              onChange={handleInputChange}
              className="product-checkbox"
            />
            <label htmlFor="minMaxTemp" className="product-checkbox-label">
              MIN/MAX Temp.
            </label>
          </div>
        </div>

        {formData.minMaxTemp && (
          <div className="product-temp-range">
            <div className="add-new-product-form-group">
              <label className="product-label">FROM</label>
              <input
                id="minTemp"
                type="number"
                className={`product-input-field product-temp-input ${
                  tempError ? "error" : ""
                }`}
                value={formData.minTemp}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="add-new-product-form-group">
              <label className="product-label">TO</label>
              <input
                id="maxTemp"
                type="number"
                className={`product-input-field product-temp-input ${
                  tempError ? "error" : ""
                }`}
                value={formData.maxTemp}
                onChange={handleInputChange}
                required
              />
            </div>
            {tempError && (
              <div
                className="error-message"
                style={{ gridColumn: "1 / -1", marginTop: "8px" }}
              >
                {tempError}
              </div>
            )}
          </div>
        )}

        <div className="add-new-product-form-group">
          <label htmlFor="boxType" className="product-label">
            Box Type
          </label>
          <div className="product-select-wrapper">
            <select
              id="boxType"
              className="product-select-field"
              value={formData.boxType}
              onChange={handleInputChange}
              required
            >
              <option value="" disabled>
                Select box type
              </option>
              <option value="Standard">Standard</option>
              <option value="Custom">Custom</option>
              <option value="Special">Special</option>
            </select>
          </div>
        </div>

        <div className="add-new-product-form-group">
          <label htmlFor="location" className="product-label">
            Current Location
          </label>
          <div className="product-select-wrapper">
            <select
              id="location"
              className="product-select-field"
              value={formData.location}
              onChange={handleInputChange}
              required
            >
              <option value="" disabled>
                Select location
              </option>
              <option value="Warehouse 1">Warehouse 1</option>
              <option value="Warehouse 2">Warehouse 2</option>
              <option value="Store">Store</option>
            </select>
          </div>
        </div>

        <div className="add-new-product-form-group">
          <label htmlFor="category" className="product-label">
            Category
          </label>
          <div className="product-select-wrapper">
            <select
              id="category"
              className="product-select-field"
              value={formData.category}
              onChange={handleInputChange}
              required
            >
              <option value="" disabled>
                Select category
              </option>
              <option value="Electronics">Electronics</option>
              <option value="Clothing">Clothing</option>
              <option value="Food">Food</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="product-actions">
          <button
            type="submit"
            className="new-product-button product-add-button"
          >
            Add Product
          </button>
          <button
            type="button"
            className="product-cancel-link"
            onClick={handleCancel}
          >
            cancel
          </button>
        </div>
      </form>
    </div>
  );
}

// EditProductCard Component
function EditProductCard({ product, onCancel, onEditSubmit }) {
  const [formData, setFormData] = useState(product);
  const [tempError, setTempError] = useState("");

  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target;

    if (id === "minTemp" || id === "maxTemp") {
      const newValue = value === "" ? "" : Number(value);
      const otherTemp = id === "minTemp" ? "maxTemp" : "minTemp";
      const otherValue =
        formData[otherTemp] === "" ? "" : Number(formData[otherTemp]);

      setFormData((prev) => ({
        ...prev,
        [id]: newValue,
      }));

      // Validate temperature range
      if (
        id === "minTemp" &&
        otherValue !== "" &&
        newValue !== "" &&
        newValue > otherValue
      ) {
        setTempError(
          "Minimum temperature cannot be greater than maximum temperature"
        );
      } else if (
        id === "maxTemp" &&
        otherValue !== "" &&
        newValue !== "" &&
        newValue < otherValue
      ) {
        setTempError(
          "Maximum temperature cannot be less than minimum temperature"
        );
      } else {
        setTempError("");
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [id]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleDimensionChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Final validation before submit
    if (formData.minMaxTemp) {
      const minTemp = Number(formData.minTemp);
      const maxTemp = Number(formData.maxTemp);

      if (minTemp > maxTemp) {
        setTempError(
          "Minimum temperature cannot be greater than maximum temperature"
        );
        return;
      }
    }

    if (tempError) {
      return;
    }

    onEditSubmit(formData);
  };

  return (
    <div className="product-container">
      <form className="new-product-card" onSubmit={handleSubmit}>
        <h1 className="product-title">Edit Product</h1>

        <div className="add-new-product-form-group">
          <label htmlFor="sku" className="product-label">
            SKU Name
          </label>
          <input
            id="sku"
            className="product-input-field"
            value={formData.sku}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="add-new-product-form-group">
          <label className="product-label">Dimensions</label>
          <div className="product-dimensions-container">
            <input
              id="length"
              type="number"
              className="product-dimension-box"
              placeholder="LENGTH"
              value={formData.length}
              onChange={handleDimensionChange}
              required
            />
            <span className="product-dimension-separator">X</span>
            <input
              id="width"
              type="number"
              className="product-dimension-box"
              placeholder="WIDTH"
              value={formData.width}
              onChange={handleDimensionChange}
              required
            />
            <span className="product-dimension-separator">X</span>
            <input
              id="height"
              type="number"
              className="product-dimension-box"
              placeholder="HEIGHT"
              value={formData.height}
              onChange={handleDimensionChange}
              required
            />
          </div>
        </div>

        <div className="add-new-product-form-group">
          <label htmlFor="weight" className="product-label">
            Weight
          </label>
          <input
            id="weight"
            type="number"
            className="product-input-field"
            value={formData.weight}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="add-new-product-form-group">
          <label htmlFor="numberOfBoxes" className="product-label">
            Number of Boxes
          </label>
          <input
            id="numberOfBoxes"
            type="number"
            className="product-input-field"
            value={formData.numberOfBoxes}
            onChange={handleInputChange}
            required
            min="1"
          />
        </div>

        <div className="add-new-product-form-group">
          <div className="product-checkbox-container">
            <input
              type="checkbox"
              id="minMaxTemp"
              checked={formData.minMaxTemp}
              onChange={handleInputChange}
              className="product-checkbox"
            />
            <label htmlFor="minMaxTemp" className="product-checkbox-label">
              MIN/MAX Temp.
            </label>
          </div>
        </div>

        {formData.minMaxTemp && (
          <div className="product-temp-range">
            <div className="add-new-product-form-group">
              <label className="product-label">FROM</label>
              <input
                id="minTemp"
                type="number"
                className={`product-input-field product-temp-input ${
                  tempError ? "error" : ""
                }`}
                value={formData.minTemp}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="add-new-product-form-group">
              <label className="product-label">TO</label>
              <input
                id="maxTemp"
                type="number"
                className={`product-input-field product-temp-input ${
                  tempError ? "error" : ""
                }`}
                value={formData.maxTemp}
                onChange={handleInputChange}
                required
              />
            </div>
            {tempError && (
              <div
                className="error-message"
                style={{ gridColumn: "1 / -1", marginTop: "8px" }}
              >
                {tempError}
              </div>
            )}
          </div>
        )}

        <div className="add-new-product-form-group">
          <label htmlFor="boxType" className="product-label">
            Box Type
          </label>
          <div className="product-select-wrapper">
            <select
              id="boxType"
              className="product-select-field"
              value={formData.boxType}
              onChange={handleInputChange}
              required
            >
              <option value="" disabled>
                Select box type
              </option>
              <option value="Standard">Standard</option>
              <option value="Custom">Custom</option>
              <option value="Special">Special</option>
            </select>
          </div>
        </div>

        <div className="add-new-product-form-group">
          <label htmlFor="location" className="product-label">
            Current Location
          </label>
          <div className="product-select-wrapper">
            <select
              id="location"
              className="product-select-field"
              value={formData.location}
              onChange={handleInputChange}
              required
            >
              <option value="" disabled>
                Select location
              </option>
              <option value="Warehouse 1">Warehouse 1</option>
              <option value="Warehouse 2">Warehouse 2</option>
              <option value="Store">Store</option>
            </select>
          </div>
        </div>

        <div className="add-new-product-form-group">
          <label htmlFor="category" className="product-label">
            Category
          </label>
          <div className="product-select-wrapper">
            <select
              id="category"
              className="product-select-field"
              value={formData.category}
              onChange={handleInputChange}
              required
            >
              <option value="" disabled>
                Select category
              </option>
              <option value="Electronics">Electronics</option>
              <option value="Clothing">Clothing</option>
              <option value="Food">Food</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="product-actions">
          <button
            type="submit"
            className="new-product-button product-add-button"
          >
            Save Changes
          </button>
          <button
            type="button"
            className="product-cancel-link"
            onClick={onCancel}
          >
            cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default Products;
