import React, { useState, useEffect, useContext } from "react";
import {
  Card,
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
import "../styles/Products.css";
import { addNotification } from "../utils/notifications";
import { productsService } from "../services/products";
import { organizationsService } from "../services/organizations";
import { AuthContext } from "../App";

// Helper to format dimensions for display
const formatDimensions = (dimensions) => {
  if (!dimensions) return "";
  if (typeof dimensions === "string") return dimensions;
  if (typeof dimensions === "object") {
    // If backend returns as object: { length, width, height }
    return `${dimensions.length}x${dimensions.width}x${dimensions.height}`;
  }
  return "";
};

function Products({ onProductSelect, isSelectionMode = false }) {
  // State management
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [actionMenuAnchorEl, setActionMenuAnchorEl] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showNewProductForm, setShowNewProductForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await productsService.getProducts();
        setProducts(Array.isArray(response.products) ? response.products : []);
      } catch (err) {
        setError("Failed to load products.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Handlers
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
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

  const handleProductAdded = async (newProduct) => {
    try {
      setLoading(true);
      setError(null);
      // Map newProduct to backend expected fields
      const productData = {
        product: {
          sku: newProduct.sku,
          weight: newProduct.weight,
          storage_temperature: newProduct.storageTemperature,
          required_temperature: newProduct.requiredTemperature,
          length: newProduct.length !== undefined && newProduct.length !== "" ? Number(newProduct.length) : null,
          width: newProduct.width !== undefined && newProduct.width !== "" ? Number(newProduct.width) : null,
          height: newProduct.height !== undefined && newProduct.height !== "" ? Number(newProduct.height) : null,
          number_of_boxes: newProduct.numberOfBoxes || 1,
          ...(user?.role === 'super_admin' && { organization_id: newProduct.organizationId })
        }
      };
      console.log('Submitting product data:', productData);
      await productsService.createProduct(productData);
      // Refetch products
      const response = await productsService.getProducts();
      setProducts(Array.isArray(response.products) ? response.products : []);
      setShowNewProductForm(false);
      addNotification({
        type: "new_product",
        productName: newProduct.sku,
        location: newProduct.location,
      });
    } catch (error) {
      console.error('Error creating product:', error);
      setError("Failed to add product.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      setLoading(true);
      setError(null);
      await productsService.deleteProduct(productId);
      setProducts(products.filter((product) => product.id !== productId));
      handleActionMenuClose();
    } catch (error) {
      setError("Failed to delete product.");
    } finally {
      setLoading(false);
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
    let requiredTemperature = "",
      storageTemperature = "";
    const hasTemperature = product.temperature && product.temperature !== "N/A";
    if (hasTemperature) {
      try {
        const tempParts = product.temperature.split("-");
        if (tempParts.length === 2) {
          requiredTemperature = tempParts[0].replace("°C", "").trim();
          storageTemperature = tempParts[1].replace("°C", "").trim();
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
      requiredTemperature: hasTemperature ? Number(requiredTemperature) : null,
      storageTemperature: hasTemperature ? Number(storageTemperature) : 0,
      location: product.currentLocation || product.location || "",
      category: product.category || "",
      numberOfBoxes: product.number_of_boxes || 1,
    });
    setIsEditing(true);
    handleActionMenuClose();
  };

  const handleEditSubmit = async (editedProduct) => {
    try {
      setLoading(true);
      setError(null);
      const productData = {
        product: {
          sku: editedProduct.sku,
          weight: editedProduct.weight,
          storage_temperature: editedProduct.storageTemperature,
          required_temperature: editedProduct.requiredTemperature,
          length: editedProduct.length !== undefined && editedProduct.length !== "" ? Number(editedProduct.length) : null,
          width: editedProduct.width !== undefined && editedProduct.width !== "" ? Number(editedProduct.width) : null,
          height: editedProduct.height !== undefined && editedProduct.height !== "" ? Number(editedProduct.height) : null,
          number_of_boxes: editedProduct.numberOfBoxes || 1
        }
      };
      await productsService.updateProduct(editedProduct.id, productData);
      // Refetch products
      const response = await productsService.getProducts();
      setProducts(Array.isArray(response.products) ? response.products : []);
      setIsEditing(false);
      setEditingProduct(null);
    } catch (error) {
      setError("Failed to update product.");
    } finally {
      setLoading(false);
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
    return Object.values(product).some((value) =>
      value.toString().toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Pagination
  const paginatedProducts = filteredProducts.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Get current user role from localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  const currentUserRole = user?.role;

  if (loading) {
    return <div className="products-container">Loading...</div>;
  }
  if (error) {
    return <div className="products-container">{error}</div>;
  }

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

      {/* Search Section */}
      <Card className="filters-card">
        <Grid container spacing={3}>
          <Grid item xs={12}>
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
        </Grid>
      </Card>

      {/* Products Table */}
      <Card className="products-table-card">
        <TableContainer>
          <Table className="products-table">
            <TableHead>
              <TableRow>
                <TableCell>Product ID</TableCell>
                <TableCell>SKU</TableCell>
                <TableCell>Weight</TableCell>
                <TableCell>Dimensions</TableCell>
                <TableCell>Number of Boxes</TableCell>
                {currentUserRole === "super_admin" && <TableCell>Organization</TableCell>}
                <TableCell>Storage Temp</TableCell>
                <TableCell>Required Temp</TableCell>
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
                  <TableCell>{product.sku}</TableCell>
                  <TableCell>{product.weight}</TableCell>
                  <TableCell>
                    {product.length && product.width && product.height
                      ? `${product.length}x${product.width}x${product.height}`
                      : "-"}
                  </TableCell>
                  <TableCell>{product.number_of_boxes || 1}</TableCell>
                  {currentUserRole === "super_admin" && (
                    <TableCell>{product.organization?.name || ""}</TableCell>
                  )}
                  <TableCell>
                    {product.storage_temperature
                      ? (typeof product.storage_temperature === "string"
                          ? product.storage_temperature.charAt(0).toUpperCase() + product.storage_temperature.slice(1)
                          : ["Ambient", "Chilled", "Frozen"][product.storage_temperature])
                      : "-"}
                    {product.required_temperature !== null && product.required_temperature !== undefined
                      ? ` / ${product.required_temperature}°C`
                      : ""}
                  </TableCell>
                  <TableCell>
                    {product.required_temperature
                      ? (typeof product.required_temperature === "string"
                          ? product.required_temperature.charAt(0).toUpperCase() + product.required_temperature.slice(1)
                          : ["Ambient", "Chilled", "Frozen"][product.required_temperature])
                      : "-"}
                  </TableCell>
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
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    sku: "",
    length: "",
    width: "",
    height: "",
    weight: "",
    numberOfBoxes: "1",
    storageTemperature: 0,
    requiredTemperature: null,
    ...(user?.role === 'super_admin' && { organizationId: "" })
  });
  const [organizations, setOrganizations] = useState([]);
  const [tempError, setTempError] = useState("");
  const [boxesError, setBoxesError] = useState("");

  useEffect(() => {
    if (user?.role === 'super_admin') {
      const fetchOrganizations = async () => {
        try {
          const response = await organizationsService.getOrganizations();
          setOrganizations(response.organizations || []);
        } catch (error) {
          console.error("Error fetching organizations:", error);
        }
      };
      fetchOrganizations();
    }
  }, [user]);

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

    if (id === "storageTemperature") {
      setFormData((prev) => ({
        ...prev,
        [id]: Number(value),
      }));
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

    if (tempError || boxesError) {
      return;
    }

    onProductAdded({
      ...formData,
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
      storageTemperature: 0,
      requiredTemperature: null,
      ...(user?.role === 'super_admin' && { organizationId: "" })
    });
    setBoxesError("");
    onCancel();
  };

  return (
    <div className="product-container">
      <form className="new-product-card" onSubmit={handleSubmit}>
        <h1 className="product-title">Add new product</h1>

        {user?.role === 'super_admin' && (
          <div className="add-new-product-form-group">
            <label htmlFor="organizationId" className="product-label">
              Organization
            </label>
            <select
              id="organizationId"
              className="product-select"
              value={formData.organizationId}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Organization</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
          </div>
        )}

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
          <label htmlFor="storageTemperature" className="product-label">
            Storage Temperature
          </label>
          <select
            id="storageTemperature"
            value={formData.storageTemperature}
            onChange={handleInputChange}
            className="product-select"
            required
          >
            <option value={0}>Ambient</option>
            <option value={1}>Chilled</option>
            <option value={2}>Frozen</option>
          </select>
        </div>

        <div className="add-new-product-form-group">
          <label htmlFor="requiredTemperature" className="product-label">
            Required Temperature
          </label>
          <input
            id="requiredTemperature"
            type="number"
            className="product-input-field"
            value={formData.requiredTemperature || ""}
            onChange={handleInputChange}
          />
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

    if (id === "storageTemperature") {
      setFormData((prev) => ({
        ...prev,
        [id]: Number(value),
      }));
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
          <label htmlFor="storageTemperature" className="product-label">
            Storage Temperature
          </label>
          <select
            id="storageTemperature"
            value={formData.storageTemperature}
            onChange={handleInputChange}
            className="product-select"
            required
          >
            <option value={0}>Ambient</option>
            <option value={1}>Chilled</option>
            <option value={2}>Frozen</option>
          </select>
        </div>

        <div className="add-new-product-form-group">
          <label htmlFor="requiredTemperature" className="product-label">
            Required Temperature
          </label>
          <input
            id="requiredTemperature"
            type="number"
            className="product-input-field"
            value={formData.requiredTemperature || ""}
            onChange={handleInputChange}
          />
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
