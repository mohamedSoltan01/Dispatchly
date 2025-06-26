import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Grid,
  InputAdornment,
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import "../styles/Orders.css";
import { ordersService } from "../services/orders";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [actionMenuAnchorEl, setActionMenuAnchorEl] = useState(null);
  const [showNewOrderForm, setShowNewOrderForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [formData, setFormData] = useState({
    customerName: "",
    pickupLocation: "",
    deliveryLocation: "",
    status: "pending",
    priority: "normal",
    notes: ""
  });

  // Fetch orders on component mount
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await ordersService.getOrders();
      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddOrder = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      const newOrder = await ordersService.createOrder(formData);
      setOrders(prev => [...prev, newOrder]);
      setIsModalOpen(false);
      setFormData({
        customerName: "",
        pickupLocation: "",
        deliveryLocation: "",
        status: "pending",
        priority: "normal",
        notes: ""
      });
    } catch (err) {
      console.error('Error adding order:', err);
      setError('Failed to add order. Please try again.');
    }
  };

  const handleUpdateOrder = async (id, updatedData) => {
    try {
      setError(null);
      const updatedOrder = await ordersService.updateOrder(id, updatedData);
      setOrders(prev => 
        prev.map(order => 
          order.id === id ? updatedOrder : order
        )
      );
      setSelectedOrder(null);
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating order:', err);
      setError('Failed to update order. Please try again.');
    }
  };

  const handleDeleteOrder = async (id) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        setError(null);
        await ordersService.deleteOrder(id);
        setOrders(prev => prev.filter(order => order.id !== id));
        handleActionMenuClose();
      } catch (err) {
        console.error('Error deleting order:', err);
        setError('Failed to delete order. Please try again.');
      }
    }
  };

  const handleActionMenuOpen = (event, order) => {
    setSelectedOrder(order);
    setActionMenuAnchorEl(event.currentTarget);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchorEl(null);
    setSelectedOrder(null);
  };

  const handleEditClick = (order) => {
    setSelectedOrder(order);
    setEditingOrder({
      id: order.id,
      customerName: order.customerName,
      pickupLocation: order.pickupLocation,
      deliveryLocation: order.deliveryLocation,
      status: order.status,
      priority: order.priority,
      notes: order.notes
    });
    setIsEditing(true);
    handleActionMenuClose();
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
    handleActionMenuClose();
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };

  // Filter and search logic
  const filteredOrders = orders.filter((order) => {
    const matchesSearch = Object.values(order).some((value) =>
      value.toString().toLowerCase().includes(searchQuery.toLowerCase())
    );
    return matchesSearch;
  });

  const paginatedOrders = filteredOrders.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button 
          className="retry-button"
          onClick={fetchOrders}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <Box className="orders-container">
      <Box className="orders-header">
        <Typography variant="h4" component="h1">
          Orders Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setShowNewOrderForm(true)}
        >
          Add New Order
        </Button>
      </Box>

      <Paper className="search-container">
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search orders..."
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
      </Paper>

      <TableContainer component={Paper} className="orders-table">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Pickup Location</TableCell>
              <TableCell>Delivery Location</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.id}</TableCell>
                <TableCell>{order.customerName}</TableCell>
                <TableCell>{order.pickupLocation}</TableCell>
                <TableCell>{order.deliveryLocation}</TableCell>
                <TableCell>
                  <span className={`status-badge status-${order.status}`}>
                    {order.status}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`priority-badge priority-${order.priority}`}>
                    {order.priority}
                  </span>
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={(e) => handleActionMenuOpen(e, order)}
                    size="small"
                  >
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredOrders.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Action Menu */}
      <Menu
        anchorEl={actionMenuAnchorEl}
        open={Boolean(actionMenuAnchorEl)}
        onClose={handleActionMenuClose}
      >
        <MenuItem
          onClick={() => selectedOrder && handleViewDetails(selectedOrder)}
          className="action-menu-item"
        >
          <VisibilityIcon fontSize="small" /> View Details
        </MenuItem>
        <MenuItem
          onClick={() => selectedOrder && handleEditClick(selectedOrder)}
          className="action-menu-item"
        >
          <EditIcon fontSize="small" /> Edit
        </MenuItem>
        <MenuItem
          onClick={() => selectedOrder && handleDeleteOrder(selectedOrder.id)}
          className="action-menu-item delete"
        >
          <DeleteIcon fontSize="small" /> Delete
        </MenuItem>
      </Menu>

      {/* View/Edit Order Dialog */}
      <Dialog
        open={isModalOpen || isEditing}
        onClose={() => {
          setIsModalOpen(false);
          setIsEditing(false);
          setSelectedOrder(null);
          setEditingOrder(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {isEditing ? "Edit Order" : "Order Details"}
        </DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Grid container spacing={2} className="order-details">
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1">Customer Name</Typography>
                <Typography variant="body1">{selectedOrder.customerName}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1">Status</Typography>
                <Typography variant="body1">
                  <span className={`status-badge status-${selectedOrder.status}`}>
                    {selectedOrder.status}
                  </span>
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1">Pickup Location</Typography>
                <Typography variant="body1">{selectedOrder.pickupLocation}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1">Delivery Location</Typography>
                <Typography variant="body1">{selectedOrder.deliveryLocation}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1">Priority</Typography>
                <Typography variant="body1">
                  <span className={`priority-badge priority-${selectedOrder.priority}`}>
                    {selectedOrder.priority}
                  </span>
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1">Notes</Typography>
                <Typography variant="body1">{selectedOrder.notes || "No notes"}</Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setIsModalOpen(false);
              setIsEditing(false);
              setSelectedOrder(null);
              setEditingOrder(null);
            }}
          >
            Close
          </Button>
          {isEditing && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleUpdateOrder(editingOrder.id, editingOrder)}
            >
              Save Changes
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* New Order Form Dialog */}
      <Dialog
        open={showNewOrderForm}
        onClose={() => setShowNewOrderForm(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add New Order</DialogTitle>
        <DialogContent>
          <form onSubmit={handleAddOrder}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Customer Name"
                  value={formData.customerName}
                  onChange={(e) =>
                    setFormData({ ...formData, customerName: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    label="Status"
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="in_progress">In Progress</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Pickup Location"
                  value={formData.pickupLocation}
                  onChange={(e) =>
                    setFormData({ ...formData, pickupLocation: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Delivery Location"
                  value={formData.deliveryLocation}
                  onChange={(e) =>
                    setFormData({ ...formData, deliveryLocation: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: e.target.value })
                    }
                    label="Priority"
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="normal">Normal</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="urgent">Urgent</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  multiline
                  rows={4}
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                />
              </Grid>
            </Grid>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNewOrderForm(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddOrder}
          >
            Add Order
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Orders; 