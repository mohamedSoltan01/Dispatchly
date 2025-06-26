import React, { useState, useEffect } from "react";
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
  CircularProgress,
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
import { addNotification } from "../utils/notifications";
import { ordersService } from "../services/orders";
import { productsService } from "../services/products";
import tripsService from "../services/tripsService";
import DispatchConfirmation from '../components/DispatchConfirmation';

function DispatchOrder() {
  // State management
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
  const [products, setProducts] = useState({}); // Store product data with available boxes
  const [proposedTrips, setProposedTrips] = useState(null);
  const [showProposal, setShowProposal] = useState(false);

  // Fetch orders and products on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch orders
        const ordersResponse = await ordersService.getOrders();
        console.log('Orders API Response:', ordersResponse);
        
        // Fetch products to get current box quantities
        const productsResponse = await productsService.getProducts();
        console.log('Products API Response:', productsResponse);

        // Create a map of product data with available boxes
        const productsMap = {};
        (Array.isArray(productsResponse) ? productsResponse : productsResponse.products || [])
          .forEach(product => {
            productsMap[product.id] = {
              ...product,
              available_boxes: product.number_of_boxes || 0
            };
          });

        // Transform and validate the orders data
        const validOrders = (Array.isArray(ordersResponse) ? ordersResponse : ordersResponse.orders || [])
          .map(order => {
            // Calculate used boxes for each product in the order
            if (order.order_items) {
              order.order_items.forEach(item => {
                if (productsMap[item.product_id]) {
                  productsMap[item.product_id].available_boxes -= item.quantity;
                }
              });
            }

            return {
              id: order.id || order.order_number || '',
              customer: order.customer_name || order.organization_name || '',
              departureLocation: order.pickup_location?.name || order.departure_location || '',
              type: order.order_type || 'Unknown',
              weight: order.total_weight ? `${order.total_weight} kg` : '0 kg',
              arrivalLocation: order.delivery_location?.name || order.arrival_location || '',
              arrivalDate: order.delivery_deadline || order.arrival_date || '',
              status: order.status || 'pending',
              order_items: order.order_items || []
            };
          });

        setOrders(validOrders);
        setProducts(productsMap);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
        setOrders([]);
        setProducts({});
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
        ...new Set(
          orders
            .map(order => [order.departureLocation, order.arrivalLocation])
            .flat()
            .filter(Boolean)
        ),
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
      if (prevSelected.includes(orderId)) {
        return prevSelected.filter((id) => id !== orderId);
      }
      return [...prevSelected, orderId];
    });
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = paginatedOrders.map((order) => order.id);
      setSelectedOrders(newSelected);
    } else {
      setSelectedOrders([]);
    }
  };

  const isSelected = (orderId) => selectedOrders.includes(orderId);

  // Filter and search logic
  const filteredOrders = (orders || [])
    .filter(order => order.status === 'pending') // Only show not yet dispatched
    .filter((order) => {
      if (!order) return false;

    const matchesSearch = Object.values(order).some((value) =>
      value?.toString().toLowerCase().includes(searchQuery.toLowerCase())
    );

      const matchesType = filters.type === "All" || 
        (order.type && order.type.toLowerCase() === filters.type.toLowerCase());
      
      const matchesLocation =
        filters.location === "All" ||
        (order.departureLocation && order.departureLocation === filters.location) ||
        (order.arrivalLocation && order.arrivalLocation === filters.location);

      return matchesSearch && matchesType && matchesLocation;
  });

  // Pagination
  const paginatedOrders = filteredOrders.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Handle dispatch (proposal/confirmation flow)
  const handleDispatch = async () => {
    if (selectedOrders.length === 0) return;
    try {
    setIsSubmitting(true);
      setShowThankYou(false);
      setShowProposal(false);
      setProposedTrips(null);

      // Propose trips for selected orders
      const response = await tripsService.proposeTrips(selectedOrders);
      if (response && response.proposed_trips && response.proposed_trips.length > 0) {
        setProposedTrips(response.proposed_trips);
        setShowProposal(true);
      } else {
        setError('No trips could be proposed for the selected orders.');
      }
    } catch (error) {
      setError(error.message || 'Failed to propose trips. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle confirmation from the proposal page
  const handleConfirmTrips = async (confirmedTrips) => {
    setShowProposal(false);
    setProposedTrips(null);
    setSelectedOrders([]);
    setShowThankYou(true);
    // Optionally, refresh orders/products here
    addNotification('trips_created', {
      count: confirmedTrips?.length || 0,
    });
  };

  // Handle rejection from the proposal page
  const handleRejectTrips = () => {
    setShowProposal(false);
    setProposedTrips(null);
  };

  // Add delete handler
  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order?')) {
      return;
    }

    try {
      await ordersService.deleteOrder(orderId);
      
      // Refresh orders list
      const response = await ordersService.getOrders();
      const validOrders = (Array.isArray(response) ? response : response.orders || [])
        .map(order => ({
          id: order.id || order.order_number || '',
          customer: order.customer_name || order.organization_name || '',
          departureLocation: order.pickup_location?.name || order.departure_location || '',
          type: order.order_type || 'Unknown',
          weight: order.total_weight ? `${order.total_weight} kg` : '0 kg',
          arrivalLocation: order.delivery_location?.name || order.arrival_location || '',
          arrivalDate: order.delivery_deadline || order.arrival_date || '',
          status: order.status || 'pending',
          order_items: order.order_items || []
        }));

      setOrders(validOrders);
      addNotification("order_deleted", { orderId });
    } catch (error) {
      console.error("Error deleting order:", error);
      setError("Failed to delete order. Please try again.");
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (showProposal && proposedTrips) {
    return (
      <DispatchConfirmation
        proposedTrips={proposedTrips}
        onConfirm={handleConfirmTrips}
        onReject={handleRejectTrips}
      />
    );
  }

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
          <Typography variant="h5" style={{ marginBottom: 16 }}>
            Orders Dispatched Successfully!
          </Typography>
          <Typography variant="body1" style={{ marginBottom: 24 }}>
            The selected orders have been dispatched and are being processed. You can track their status in the Orders section.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setShowThankYou(false)}
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
                <TableCell>Products</TableCell>
                <TableCell>Actions</TableCell>
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
                    <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isItemSelected}
                        onChange={() => handleSelectClick(order.id)}
                      />
                    </TableCell>
                    <TableCell>{order.id}</TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell>{order.departureLocation}</TableCell>
                    <TableCell>
                      <span className={`order-type ${order.type.toLowerCase() === "inbound" ? "inbound" : "outbound"}`}>
                        {order.type}
                      </span>
                    </TableCell>
                    <TableCell>{order.weight}</TableCell>
                    <TableCell>{order.arrivalLocation}</TableCell>
                    <TableCell>{order.arrivalDate}</TableCell>
                    <TableCell>
                      {order.order_items?.map(item => (
                        <div key={item.product_id}>
                          {products[item.product_id]?.sku || 'Unknown Product'}: {item.quantity} boxes
                          (Available: {products[item.product_id]?.available_boxes || 0})
                        </div>
                      ))}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteOrder(order.id);
                        }}
                        color="error"
                        size="small"
                        sx={{
                          '&:hover': {
                            backgroundColor: 'rgba(211, 47, 47, 0.04)'
                          }
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
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
