import React, { useState, useEffect } from "react";
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
  Typography,
  Chip,
  Button,
  TablePagination,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import "../styles/TripHistory.css";
import { ordersService } from "../services/orders";

const statusColor = (status) => {
  switch ((status || '').toLowerCase()) {
    case "dispatched":
      return "success";
    case "pending":
      return "warning";
    case "cancelled":
      return "error";
    default:
      return "default";
  }
};

export default function OrdersHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await ordersService.getOrders();
        // Only show dispatched and pending
        setOrders(Array.isArray(data.orders) ? data.orders.filter(o => ["dispatched", "pending"].includes((o.status || '').toLowerCase())) : []);
      } catch (err) {
        setError("Failed to load orders history.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setPage(0);
  };

  const filteredOrders = orders.filter((order) => {
    return (
      order.id?.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.pickup_location?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.delivery_location?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const paginatedOrders = filteredOrders.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading) return <div className="trip-history-container">Loading...</div>;
  if (error) return <div className="trip-history-container">{error}</div>;

  return (
    <div className="trip-history-container">
      <div className="trip-history-header">
        <div className="header-left">
          <Typography className="page-title">Orders History</Typography>
        </div>
      </div>
      <div className="trip-history-toolbar">
        <TextField
          className="search-field"
          placeholder="Search orders..."
          value={searchQuery}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          variant="outlined"
          size="small"
        />
      </div>
      <TableContainer component={Paper} className="trip-history-table">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Pickup Location</TableCell>
              <TableCell>Delivery Location</TableCell>
              <TableCell>Weight</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.id}</TableCell>
                <TableCell>
                  <Chip
                    label={order.status}
                    className="status-chip"
                    color={statusColor(order.status)}
                  />
                </TableCell>
                <TableCell>{order.pickup_location?.name || '-'}</TableCell>
                <TableCell>{order.delivery_location?.name || '-'}</TableCell>
                <TableCell>{order.total_weight || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={filteredOrders.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          className="table-pagination"
        />
      </TableContainer>
    </div>
  );
} 