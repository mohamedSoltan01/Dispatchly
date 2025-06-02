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
  Checkbox,
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
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import "../styles/DispatchOrder.css";
import {
  colors,
  typography,
  spacing,
  shadows,
  borderRadius,
} from "../styles/designSystem";

// Mock data for initial state
const initialMockOrders = [
  {
    id: "ORD001",
    customer: "John Smith",
    departureLocation: "New York Warehouse",
    type: "Inbound",
    weight: "500 kg",
    arrivalLocation: "Boston Distribution Center",
    arrivalDate: "2024-03-15",
    status: "pending",
    dispatchedAt: null,
  },
  {
    id: "ORD002",
    customer: "Sarah Johnson",
    departureLocation: "Chicago Hub",
    type: "Outbound",
    weight: "750 kg",
    arrivalLocation: "Detroit Facility",
    arrivalDate: "2024-03-16",
    status: "pending",
    dispatchedAt: null,
  },
];

// Helper function to get orders from localStorage or use initial data
const getStoredOrders = () => {
  try {
    const saved = localStorage.getItem("dispatchOrders");
    if (saved) {
      const parsedOrders = JSON.parse(saved);
      // Ensure each order has a unique ID and status
      return parsedOrders.map((order) => ({
        ...order,
        status: order.status || "pending",
        dispatchedAt: order.dispatchedAt || null,
      }));
    }
    // Initialize mock data with status
    const mockOrdersWithStatus = initialMockOrders.map((order) => ({
      ...order,
      status: "pending",
      dispatchedAt: null,
    }));
    localStorage.setItem(
      "dispatchOrders",
      JSON.stringify(mockOrdersWithStatus)
    );
    return mockOrdersWithStatus;
  } catch (error) {
    console.error("Error loading orders from localStorage:", error);
    return initialMockOrders.map((order) => ({
      ...order,
      status: "pending",
      dispatchedAt: null,
    }));
  }
};

function DispatchOrder() {
  // State management
  const [orders, setOrders] = useState(() => getStoredOrders());
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [actionMenuAnchorEl, setActionMenuAnchorEl] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [showThankYou, setShowThankYou] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filters, setFilters] = useState({
    type: "All",
    location: "All",
  });

  const filterConfig = [
    {
      id: "type",
      label: "Type",
      options: ["All", "Inbound", "Outbound"],
    },
    {
      id: "location",
      label: "Location",
      options: [
        "All",
        "New York Warehouse",
        "Chicago Hub",
        "Boston Distribution Center",
        "Detroit Facility",
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

  const handleActionMenuOpen = (event, order) => {
    setSelectedOrder(order);
    setActionMenuAnchorEl(event.currentTarget);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchorEl(null);
    setSelectedOrder(null);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSelectClick = (orderId) => {
    setSelectedOrders((prevSelected) => {
      // If the order is already selected, remove it
      if (prevSelected.includes(orderId)) {
        return prevSelected.filter((id) => id !== orderId);
      }
      // Otherwise, add it to the selection
      return [...prevSelected, orderId];
    });
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      // Select all orders on the current page
      const newSelected = paginatedOrders.map((order) => order.id);
      setSelectedOrders(newSelected);
    } else {
      setSelectedOrders([]);
    }
  };

  const isSelected = (orderId) => selectedOrders.includes(orderId);

  // Filter and search logic
  const filteredOrders = orders.filter((order) => {
    const matchesSearch = Object.values(order).some((value) =>
      value?.toString().toLowerCase().includes(searchQuery.toLowerCase())
    );

    const matchesFilters =
      (filters.type === "All" || order.type === filters.type) &&
      (filters.location === "All" ||
        order.departureLocation === filters.location ||
        order.arrivalLocation === filters.location);

    // Only show non-dispatched orders in the table
    const isNotDispatched = order.status !== "dispatched";

    return matchesSearch && matchesFilters && isNotDispatched;
  });

  // Pagination
  const paginatedOrders = filteredOrders.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleDispatch = async () => {
    if (selectedOrders.length === 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Get all orders from localStorage
      const allOrders = JSON.parse(
        localStorage.getItem("dispatchOrders") || "[]"
      );

      // Update the status of selected orders
      const updatedOrders = allOrders.map((order) => {
        if (selectedOrders.includes(order.id)) {
          return {
            ...order,
            status: "dispatched",
            dispatchedAt: new Date().toISOString(),
          };
        }
        return order;
      });

      // Save updated orders back to localStorage
      localStorage.setItem("dispatchOrders", JSON.stringify(updatedOrders));

      // Update the orders state to reflect changes
      setOrders(updatedOrders);

      // Show thank you screen
      setShowThankYou(true);

      // Clear selection after successful dispatch
      setSelectedOrders([]);
    } catch (error) {
      console.error("Error dispatching orders:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showThankYou) {
    return (
      <div className="dispatch-order-container">
        <div
          className="thank-you-screen"
          style={{
            textAlign: "center",
            padding: "48px 24px",
            backgroundColor: colors.background.paper,
            borderRadius: borderRadius.lg,
            boxShadow: shadows.md,
            maxWidth: "600px",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              backgroundColor: `${colors.success}15`,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
            }}
          >
            <CheckCircleIcon
              style={{
                fontSize: 32,
                color: colors.success,
              }}
            />
          </div>
          <Typography
            variant="h4"
            sx={{
              ...typography.h3,
              marginBottom: spacing.md,
              color: colors.text.primary,
            }}
          >
            Orders Dispatched Successfully!
          </Typography>
          <Typography
            variant="body1"
            sx={{
              ...typography.body1,
              color: colors.text.secondary,
              marginBottom: spacing.xl,
              maxWidth: "400px",
              margin: "0 auto 32px",
            }}
          >
            The selected orders have been dispatched and are being processed.
            You can track their status in the Orders section.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setShowThankYou(false)}
            sx={{
              padding: "12px 24px",
              borderRadius: borderRadius.md,
              textTransform: "none",
              ...typography.button,
            }}
          >
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="dispatch-order-container">
      {/* Header Section */}
      <div className="dispatch-order-header">
        <h1 className="dispatch-order-title">Dispatch Orders</h1>
        <Button
          variant="contained"
          color="success"
          startIcon={<AddIcon />}
          className="add-order-button"
          onClick={handleDispatch}
          disabled={selectedOrders.length === 0 || isSubmitting}
          sx={{
            opacity: isSubmitting ? 0.7 : 1,
            cursor: isSubmitting ? "not-allowed" : "pointer",
            position: "relative",
          }}
        >
          {isSubmitting ? (
            <>
              <span style={{ visibility: "hidden" }}>Dispatch</span>
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: 20,
                  height: 20,
                  border: "2px solid white",
                  borderTopColor: "transparent",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                }}
              />
            </>
          ) : (
            "Dispatch"
          )}
        </Button>
      </div>

      {/* Filters and Search Section */}
      <Card className="filters-card">
        <Grid container spacing={3} className="filters-grid">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search orders..."
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

      {/* Orders Table */}
      <Card className="dispatch-order-table-card">
        <TableContainer>
          <Table className="dispatch-order-table">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={
                      selectedOrders.length > 0 &&
                      selectedOrders.length < paginatedOrders.length
                    }
                    checked={
                      paginatedOrders.length > 0 &&
                      selectedOrders.length === paginatedOrders.length
                    }
                    onChange={handleSelectAllClick}
                  />
                </TableCell>
                <TableCell>Order ID</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Departure Location</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Weight</TableCell>
                <TableCell>Arrival Location</TableCell>
                <TableCell>Arrival Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedOrders.map((order) => {
                const isItemSelected = isSelected(order.id);
                return (
                  <TableRow
                    key={order.id}
                    hover
                    role="checkbox"
                    aria-checked={isItemSelected}
                    selected={isItemSelected}
                    onClick={() => handleSelectClick(order.id)}
                    sx={{ cursor: "pointer" }}
                  >
                    <TableCell
                      padding="checkbox"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        checked={isItemSelected}
                        onChange={() => handleSelectClick(order.id)}
                      />
                    </TableCell>
                    <TableCell>{order.id}</TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell>{order.departureLocation}</TableCell>
                    <TableCell>
                      <span
                        className={`order-type ${
                          order.type.toLowerCase() === "inbound"
                            ? "inbound"
                            : "outbound"
                        }`}
                      >
                        {order.type}
                      </span>
                    </TableCell>
                    <TableCell>{order.weight}</TableCell>
                    <TableCell>{order.arrivalLocation}</TableCell>
                    <TableCell>{order.arrivalDate}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        <div className="pagination-container">
          <TablePagination
            component="div"
            count={filteredOrders.length}
            page={page}
            onPageChange={handlePageChange}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleRowsPerPageChange}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </div>
      </Card>

      <style jsx>{`
        @keyframes spin {
          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

export default DispatchOrder;
