import React, { useState, useCallback } from "react";
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
  IconButton,
  Menu,
  MenuItem,
  Button,
  Typography,
  Box,
  Chip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import "../styles/Organizations.css";

// Mock data for organizations
const mockOrganizations = [
  {
    id: "ORG001",
    name: "Dispatchly",
    creatorEmail: "admin@dispatchly.com",
    serviceRenewalDate: "2024-12-31",
    status: "Active",
    users: 15,
    createdAt: "2024-01-01 09:00",
    lastActive: "2024-03-20 14:30",
  },
  {
    id: "ORG002",
    name: "Dispatchly Partner",
    creatorEmail: "partner@dispatchly.com",
    serviceRenewalDate: "2024-12-31",
    status: "Active",
    users: 8,
    createdAt: "2024-01-15 10:30",
    lastActive: "2024-03-20 15:45",
  },
  {
    id: "ORG003",
    name: "Dispatchly Customer",
    creatorEmail: "customer@dispatchly.com",
    serviceRenewalDate: "2024-12-31",
    status: "Active",
    users: 12,
    createdAt: "2024-02-01 11:00",
    lastActive: "2024-03-20 16:20",
  },
];

// Helper function to get organizations from localStorage or use initial data
const getStoredOrganizations = () => {
  try {
    const saved = localStorage.getItem("organizations");
    if (saved) {
      return JSON.parse(saved);
    }
    // Only set initial mock data if no organizations exist in localStorage
    localStorage.setItem("organizations", JSON.stringify(mockOrganizations));
    return mockOrganizations;
  } catch (error) {
    console.error("Error loading organizations from localStorage:", error);
    return mockOrganizations;
  }
};

export default function Organizations() {
  const [organizations, setOrganizations] = useState(() =>
    getStoredOrganizations()
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [showNewOrgForm, setShowNewOrgForm] = useState(false);

  // Handle search
  const handleSearch = useCallback((event) => {
    setSearchQuery(event.target.value);
  }, []);

  // Handle menu open
  const handleMenuOpen = useCallback((event, org) => {
    setAnchorEl(event.currentTarget);
    setSelectedOrg(org);
  }, []);

  // Handle menu close
  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
    setSelectedOrg(null);
  }, []);

  // Handle add new organization
  const handleAddNewOrg = useCallback(() => {
    setShowNewOrgForm(true);
  }, []);

  // Handle organization added
  const handleOrgAdded = useCallback(
    (newOrg) => {
      try {
        const orgToAdd = {
          id: `ORG${String(organizations.length + 1).padStart(3, "0")}`,
          name: newOrg.name,
          creatorEmail: newOrg.adminEmail,
          serviceRenewalDate: new Date(
            new Date().setFullYear(new Date().getFullYear() + 1)
          )
            .toISOString()
            .split("T")[0],
          status: "Active",
          users: 0,
          createdAt: new Date().toLocaleString(),
          lastActive: "Never",
        };

        const updatedOrgs = [...organizations, orgToAdd];
        setOrganizations(updatedOrgs);
        localStorage.setItem("organizations", JSON.stringify(updatedOrgs));
        setShowNewOrgForm(false);
      } catch (error) {
        console.error("Error adding new organization:", error);
      }
    },
    [organizations]
  );

  // Filter organizations based on search query
  const filteredOrganizations = organizations.filter(
    (org) =>
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.creatorEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (showNewOrgForm) {
    return (
      <div className="organizations-container">
        <button
          className="back-button"
          onClick={() => setShowNewOrgForm(false)}
        >
          <ArrowBackIcon />
          Back to Organizations
        </button>
        <NewOrgCard
          onCancel={() => setShowNewOrgForm(false)}
          onOrgAdded={handleOrgAdded}
        />
      </div>
    );
  }

  return (
    <div className="organizations-container">
      <div className="organizations-header">
        <div className="header-left">
          <Typography variant="h4" className="page-title">
            All Organizations
          </Typography>
        </div>
        <Button
          variant="outlined"
          color="success"
          startIcon={<AddIcon />}
          className="add-org-button"
          onClick={handleAddNewOrg}
        >
          Add Organization
        </Button>
      </div>

      <div className="organizations-toolbar">
        <TextField
          placeholder="Search organizations..."
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={handleSearch}
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

      <TableContainer component={Paper} className="organizations-table">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Organization ID</TableCell>
              <TableCell>Organization Name</TableCell>
              <TableCell>Service Renewal Date</TableCell>
              <TableCell>Creator Email</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredOrganizations.map((org) => (
              <TableRow key={org.id}>
                <TableCell>{org.id}</TableCell>
                <TableCell>
                  <Box className="org-name-cell">
                    <Typography variant="body1">{org.name}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  {new Date(org.serviceRenewalDate).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </TableCell>
                <TableCell>{org.creatorEmail}</TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, org)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Organization Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        className="org-menu"
      >
        <MenuItem onClick={handleMenuClose}>View Details</MenuItem>
        <MenuItem onClick={handleMenuClose}>Edit Organization</MenuItem>
        <MenuItem onClick={handleMenuClose} className="delete-option">
          Delete Organization
        </MenuItem>
      </Menu>
    </div>
  );
}

// New Organization Card Component
function NewOrgCard({ onCancel, onOrgAdded }) {
  const [formData, setFormData] = useState({
    name: "",
    adminEmail: "",
    password: "",
    phone: "",
    ceo: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const validatePassword = (password) => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/[a-z]/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/[0-9]/.test(password)) {
      return "Password must contain at least one number";
    }
    return "";
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));

    if (id === "password") {
      const error = validatePassword(value);
      setPasswordError(error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (passwordError) {
      return;
    }
    onOrgAdded(formData);
  };

  return (
    <div className="org-container">
      <form className="new-org-card" onSubmit={handleSubmit}>
        <h1 className="org-title">Add New Organization</h1>

        <div className="add-new-org-form-group">
          <label htmlFor="name" className="org-label">
            Organization Name
          </label>
          <input
            id="name"
            className="org-input-field"
            value={formData.name}
            onChange={handleInputChange}
            required
            placeholder="Enter organization name"
          />
        </div>

        <div className="add-new-org-form-group">
          <label htmlFor="adminEmail" className="org-label">
            Admin Email
          </label>
          <input
            id="adminEmail"
            type="email"
            className="org-input-field"
            value={formData.adminEmail}
            onChange={handleInputChange}
            required
            placeholder="Enter admin email address"
          />
        </div>

        <div className="add-new-org-form-group">
          <label htmlFor="password" className="org-label">
            Password
          </label>
          <div className="password-input-wrapper">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              className={`org-input-field ${passwordError ? "error" : ""}`}
              value={formData.password}
              onChange={handleInputChange}
              required
              placeholder="Enter password"
            />
            <button
              type="button"
              className="password-toggle-button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          {passwordError && (
            <div className="error-message">{passwordError}</div>
          )}
        </div>

        <div className="add-new-org-form-group">
          <label htmlFor="phone" className="org-label">
            Phone Number
          </label>
          <input
            id="phone"
            type="tel"
            className="org-input-field"
            value={formData.phone}
            onChange={handleInputChange}
            required
            placeholder="Enter phone number"
          />
        </div>

        <div className="add-new-org-form-group">
          <label htmlFor="ceo" className="org-label">
            CEO Name
          </label>
          <input
            id="ceo"
            className="org-input-field"
            value={formData.ceo}
            onChange={handleInputChange}
            required
            placeholder="Enter CEO name"
          />
        </div>

        <div className="org-actions">
          <button
            type="submit"
            className="new-org-button org-add-button"
            disabled={!!passwordError}
          >
            Add Organization
          </button>
          <button type="button" className="org-cancel-link" onClick={onCancel}>
            cancel
          </button>
        </div>
      </form>
    </div>
  );
}
