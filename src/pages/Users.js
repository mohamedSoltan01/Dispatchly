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
  IconButton,
  Menu,
  MenuItem,
  Button,
  Typography,
  Box,
  Chip,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Alert,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AddIcon from "@mui/icons-material/Add";
import FilterListIcon from "@mui/icons-material/FilterList";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import "../styles/Users.css";
import { addNotification } from "../utils/notifications";
import { usersService } from "../services/users";
import { organizationsService } from "../services/organizations";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

export default function Users() {
  // Get current user role from localStorage at the top
  const user = JSON.parse(localStorage.getItem("user"));
  const currentUserRole = user?.role;

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [showNewUserForm, setShowNewUserForm] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await usersService.getUsers();
        setUsers(data);
      } catch (err) {
        setError("Failed to load users.");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Handle search
  const handleSearch = useCallback((event) => {
    setSearchQuery(event.target.value);
  }, []);

  // Handle menu open
  const handleMenuOpen = useCallback((event, user) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  }, []);

  // Handle menu close
  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
    setSelectedUser(null);
  }, []);

  // Handle filter menu open
  const handleFilterOpen = useCallback((event) => {
    setFilterAnchorEl(event.currentTarget);
  }, []);

  // Handle filter menu close
  const handleFilterClose = useCallback(() => {
    setFilterAnchorEl(null);
  }, []);

  // Handle add new user
  const handleAddNewUser = useCallback(() => {
    setShowNewUserForm(true);
  }, []);

  // Handle user added
  const handleUserAdded = useCallback(
    async (newUser) => {
      try {
        setLoading(true);
        setError(null);
        // Always send the payload as { user: { ...fields } }
        const payload = {
          user: {
            name: newUser.name,
            email_address: newUser.email_address,
            password: newUser.password,
            role: newUser.role,
            organization_id: newUser.organization_id
          }
        };
        const response = await usersService.createUser(payload);
        setUsers((prev) => [...prev, response]);
        setShowNewUserForm(false);
      } catch (err) {
        setError(err.message || "Failed to add user.");
        console.error("Error in handleUserAdded:", {
          message: err.message,
          error: err,
          stack: err.stack
        });
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Filter users based on search query
  const filteredUsers = users.filter(
    (user) =>
      (user.name?.toLowerCase().includes(searchQuery.toLowerCase()) || "") ||
      (user.email_address?.toLowerCase().includes(searchQuery.toLowerCase()) || "") ||
      (user.role?.toLowerCase().includes(searchQuery.toLowerCase()) || "")
  );

  // Update filterConfig for roles
  const filterConfig = [
    {
      id: "role",
      label: "Role",
      options: ["All", "Planning", "Dispatch"],
    },
  ];

  // Delete user via API
  const handleDeleteUser = useCallback(
    async (userId) => {
      try {
        setLoading(true);
        setError(null);
        await usersService.deleteUser(userId);
        setUsers((prev) => prev.filter((user) => user.id !== userId));
      } catch (err) {
        setError("Failed to delete user.");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  if (loading) {
    return <div className="users-container">Loading...</div>;
  }
  if (error) {
    return <div className="users-container error-message">{error}</div>;
  }

  if (showNewUserForm) {
    return (
      <div className="users-container">
        <button
          className="back-button"
          onClick={() => setShowNewUserForm(false)}
        >
          <ArrowBackIcon />
          Back to Users
        </button>
        <NewUserCard
          onCancel={() => setShowNewUserForm(false)}
          onUserAdded={handleUserAdded}
        />
      </div>
    );
  }

  return (
    <div className="users-container">
      <div className="users-header">
        <div className="header-left">
          <Typography variant="h4" className="page-title">
            All Users
          </Typography>
        </div>
        <Button
          variant="outlined"
          color="success"
          startIcon={<AddIcon />}
          className="add-user-button"
          onClick={handleAddNewUser}
        >
          Add User
        </Button>
      </div>

      <div className="users-toolbar">
        <TextField
          placeholder="Search users..."
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

      <TableContainer component={Paper} className="users-table">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              {currentUserRole === "super_admin" && <TableCell>Organization</TableCell>}
              <TableCell>Last Login</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Role</TableCell>
              <TableCell align="right">Delete</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>
                  <Box className="user-name-cell">
                    <Typography variant="body1">{user.name}</Typography>
                  </Box>
                </TableCell>
                <TableCell>{user.email_address}</TableCell>
                {currentUserRole === "super_admin" && (
                  <TableCell>{user.organization?.name || ""}</TableCell>
                )}
                <TableCell>{user.last_login_at ? new Date(user.last_login_at).toLocaleString() : ""}</TableCell>
                <TableCell>{user.created_at ? new Date(user.created_at).toLocaleString() : ""}</TableCell>
                <TableCell>
                  <Chip
                    label={user.role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    size="small"
                    className={`role-chip ${user.role}`}
                  />
                </TableCell>
                <TableCell align="right">
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

// New User Card Component
function NewUserCard({ onCancel, onUserAdded }) {
  const [formData, setFormData] = useState({
    name: "",
    email_address: "",
    password: "",
    role: "",
    organization_id: "",
    new_organization: null
  });

  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [organizations, setOrganizations] = useState([]);
  const [showNewOrgForm, setShowNewOrgForm] = useState(false);
  const navigate = useNavigate();

  // Get current user role from localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  const currentUserRole = user?.role;

  useEffect(() => {
    // Fetch organizations if user is super_admin
    if (currentUserRole === "super_admin") {
      const fetchOrganizations = async () => {
        try {
          const response = await organizationsService.getOrganizations();
          // The API might return { organizations: [...] } or just the array
          const orgs = Array.isArray(response) ? response : response.organizations || [];
          setOrganizations(orgs);
        } catch (error) {
          console.error("Failed to fetch organizations:", error);
          setFormErrors((prev) => ({
            ...prev,
            submit: "Failed to load organizations. Please try again.",
          }));
        }
      };
      fetchOrganizations();
    }
  }, [currentUserRole]);

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = "Name is required";
    }

    if (!formData.email_address.trim()) {
      errors.email_address = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email_address)) {
      errors.email_address = "Invalid email format";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (passwordError) {
      errors.password = passwordError;
    }

    if (!formData.role) {
      errors.role = "Role is required";
    }

    if (formData.role === "org_admin" && !showNewOrgForm && !formData.organization_id) {
      errors.organization_id = "Organization is required";
    }

    if (showNewOrgForm && !formData.new_organization?.name) {
      errors.new_organization = "Organization name is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    
    if (id === "new_organization_name") {
      setFormData(prev => ({
        ...prev,
        new_organization: { ...prev.new_organization, name: value }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [id]: value
      }));
    }

    // Clear error when user starts typing
    if (formErrors[id]) {
      setFormErrors(prev => ({
        ...prev,
        [id]: ""
      }));
    }

    // Password validation
    if (id === "password") {
      if (value.length < 8) {
        setPasswordError("Password must be at least 8 characters long");
      } else if (!/[A-Z]/.test(value)) {
        setPasswordError("Password must contain at least one uppercase letter");
      } else if (!/[a-z]/.test(value)) {
        setPasswordError("Password must contain at least one lowercase letter");
      } else if (!/[0-9]/.test(value)) {
        setPasswordError("Password must contain at least one number");
      } else {
        setPasswordError("");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onUserAdded(formData);
    } catch (error) {
      setFormErrors((prev) => ({
        ...prev,
        submit: error.message || "Failed to create user",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="user-container">
      <form className="new-user-card" onSubmit={handleSubmit}>
        <h1 className="user-title">Add New User</h1>

        <div className="add-new-user-form-group">
          <label htmlFor="name" className="user-label">
            Full Name
          </label>
          <input
            id="name"
            className={`user-input-field ${formErrors.name ? "error" : ""}`}
            value={formData.name}
            onChange={handleInputChange}
            required
          />
          {formErrors.name && (
            <div className="error-message">{formErrors.name}</div>
          )}
        </div>

        <div className="add-new-user-form-group">
          <label htmlFor="email_address" className="user-label">
            Email Address
          </label>
          <input
            id="email_address"
            type="email"
            className={`user-input-field ${formErrors.email_address ? "error" : ""}`}
            value={formData.email_address}
            onChange={handleInputChange}
            required
          />
          {formErrors.email_address && (
            <div className="error-message">{formErrors.email_address}</div>
          )}
        </div>

        <div className="add-new-user-form-group">
          <label htmlFor="password" className="user-label">
            Password
          </label>
          <div className="password-input-wrapper">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              className={`user-input-field ${formErrors.password ? "error" : ""}`}
              value={formData.password}
              onChange={handleInputChange}
              required
            />
            <button
              type="button"
              className="password-toggle-button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          {formErrors.password && (
            <div className="error-message">{formErrors.password}</div>
          )}
          {!formErrors.password && (
            <div className="helper-text">Must be at least 8 characters with uppercase, lowercase, and number</div>
          )}
        </div>

        <div className="add-new-user-form-group">
          <label htmlFor="role" className="user-label">
            Role
          </label>
          <div className="user-select-wrapper">
            <select
              id="role"
              className={`user-select-field ${formErrors.role ? "error" : ""}`}
              value={formData.role}
              onChange={handleInputChange}
              required
            >
              <option value="" disabled>
                Select role
              </option>
              <option value="planner">Planner</option>
              <option value="dispatcher">Dispatcher</option>
              <option value="org_admin">Organization Admin</option>
              {currentUserRole === "super_admin" && (
                <option value="super_admin">Super Admin</option>
              )}
            </select>
          </div>
          {formErrors.role && (
            <div className="error-message">{formErrors.role}</div>
          )}
        </div>

        {currentUserRole === "super_admin" && formData.role === "org_admin" && (
          <div className="add-new-user-form-group">
            <button
              type="button"
              className="add-org-button"
              style={{ marginBottom: 16 }}
              onClick={() => navigate("/organizations")}
            >
              + Create New Organization
            </button>
          </div>
        )}

        {currentUserRole === "super_admin" && formData.role !== "org_admin" && formData.role !== "super_admin" && (
          <div className="add-new-user-form-group">
            <label htmlFor="organization_id" className="user-label">
              Organization
            </label>
            <div className="user-select-wrapper">
              <select
                id="organization_id"
                className={`user-select-field ${formErrors.organization_id ? "error" : ""}`}
                value={formData.organization_id}
                onChange={handleInputChange}
                required
              >
                <option value="" disabled>
                  Select organization
                </option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
              {formErrors.organization_id && (
                <div className="error-message">{formErrors.organization_id}</div>
              )}
            </div>
          </div>
        )}

        {formErrors.submit && (
          <div className="error-message submit-error">{formErrors.submit}</div>
        )}

        <div className="user-actions">
          <button
            type="submit"
            className="new-user-button user-add-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Adding..." : "Add User"}
          </button>
          <button
            type="button"
            className="user-cancel-link"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
