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
import FilterListIcon from "@mui/icons-material/FilterList";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import "../styles/Users.css";
import { addNotification } from "../utils/notifications";

// Mock data for users
const mockUsers = [
  {
    id: "USR001",
    name: "John Doe",
    email: "john.doe@example.com",
    role: "Planning",
    lastLogin: "2024-03-20 14:30",
    createdAt: "2024-01-15 09:00",
  },
  {
    id: "USR002",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    role: "Dispatch",
    lastLogin: "2024-03-20 15:45",
    createdAt: "2024-02-01 10:30",
  },
];

// Helper function to get users from localStorage or use initial data
const getStoredUsers = () => {
  try {
    const saved = localStorage.getItem("users");
    if (saved) {
      return JSON.parse(saved);
    }
    // Only set initial mock data if no users exist in localStorage
    localStorage.setItem("users", JSON.stringify(mockUsers));
    return mockUsers;
  } catch (error) {
    console.error("Error loading users from localStorage:", error);
    return mockUsers;
  }
};

export default function Users() {
  const [users, setUsers] = useState(() => getStoredUsers());
  const [searchQuery, setSearchQuery] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [showNewUserForm, setShowNewUserForm] = useState(false);

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
    (newUser) => {
      try {
        const userToAdd = {
          id: `USR${String(users.length + 1).padStart(3, "0")}`,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          lastLogin: "Never",
          createdAt: new Date().toLocaleString(),
        };

        const updatedUsers = [...users, userToAdd];
        setUsers(updatedUsers);
        localStorage.setItem("users", JSON.stringify(updatedUsers));

        // Add notification for new user
        addNotification("new_user", {
          userName: newUser.name,
          role: newUser.role,
          email: newUser.email,
        });

        setShowNewUserForm(false);
      } catch (error) {
        console.error("Error adding new user:", error);
      }
    },
    [users]
  );

  // Filter users based on search query
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Update filterConfig for roles
  const filterConfig = [
    {
      id: "role",
      label: "Role",
      options: ["All", "Planning", "Dispatch"],
    },
  ];

  // Implement handleDeleteUser function
  const handleDeleteUser = useCallback(
    (userId) => {
      const updatedUsers = users.filter((user) => user.id !== userId);
      setUsers(updatedUsers);
      localStorage.setItem("users", JSON.stringify(updatedUsers));
    },
    [users]
  );

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
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.lastLogin}</TableCell>
                <TableCell>{user.createdAt}</TableCell>
                <TableCell>
                  <Chip
                    label={user.role}
                    size="small"
                    className={`role-chip ${user.role.toLowerCase()}`}
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
    email: "",
    password: "",
    organization: "",
    role: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (passwordError) {
      return;
    }
    onUserAdded(formData);
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
            className="user-input-field"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="add-new-user-form-group">
          <label htmlFor="email" className="user-label">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            className="user-input-field"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="add-new-user-form-group">
          <label htmlFor="password" className="user-label">
            Password
          </label>
          <div className="password-input-wrapper">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              className={`user-input-field ${passwordError ? "error" : ""}`}
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
          {passwordError && (
            <div className="error-message">{passwordError}</div>
          )}
        </div>

        <div className="add-new-user-form-group">
          <label htmlFor="organization" className="user-label">
            Organization
          </label>
          <div className="user-select-wrapper">
            <select
              id="organization"
              className="user-select-field"
              value={formData.organization}
              onChange={handleInputChange}
              required
            >
              <option value="" disabled>
                Select organization
              </option>
              <option value="Dispatchly">Dispatchly</option>
              <option value="Dispatchly Partner">Dispatchly Partner</option>
              <option value="Dispatchly Customer">Dispatchly Customer</option>
            </select>
          </div>
        </div>

        <div className="add-new-user-form-group">
          <label htmlFor="role" className="user-label">
            Role
          </label>
          <div className="user-select-wrapper">
            <select
              id="role"
              className="user-select-field"
              value={formData.role}
              onChange={handleInputChange}
              required
            >
              <option value="" disabled>
                Select role
              </option>
              <option value="Planning">Planning</option>
              <option value="Dispatch">Dispatch</option>
            </select>
          </div>
        </div>

        <div className="user-actions">
          <button
            type="submit"
            className="new-user-button user-add-button"
            disabled={!!passwordError}
          >
            Add User
          </button>
          <button type="button" className="user-cancel-link" onClick={onCancel}>
            cancel
          </button>
        </div>
      </form>
    </div>
  );
}
