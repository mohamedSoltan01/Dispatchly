import React, { useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/SignIn.css";
import { AuthContext } from "../App";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { IconButton } from "@mui/material";

const mockUsers = [
  {
    id: "USR001",
    name: "Sarah Johnson",
    jobTitle: "System Administrator",
    username: "sarah.johnson",
    password: "Admin@123", // In a real application, this would be hashed
    role: "admin",
    email: "sarah.johnson@dispatchly.com",
    lastLogin: "2024-03-20 14:30",
    createdAt: "2024-01-15 09:00",
    status: "active",
  },
  {
    id: "USR002",
    name: "Michael Chen",
    jobTitle: "Organization Manager",
    username: "michael.chen",
    password: "Org@123", // In a real application, this would be hashed
    role: "organization",
    email: "michael.chen@dispatchly.com",
    lastLogin: "2024-03-20 15:45",
    createdAt: "2024-02-01 10:30",
    status: "active",
  },
  {
    id: "USR003",
    name: "Emily Rodriguez",
    jobTitle: "Route Planning Specialist",
    username: "emily.rodriguez",
    password: "Plan@123", // In a real application, this would be hashed
    role: "planning",
    email: "emily.rodriguez@dispatchly.com",
    lastLogin: "2024-03-20 16:20",
    createdAt: "2024-02-15 11:45",
    status: "active",
  },
  {
    id: "USR004",
    name: "David Kim",
    jobTitle: "Dispatch Coordinator",
    username: "david.kim",
    password: "Dispatch@123", // In a real application, this would be hashed
    role: "dispatching",
    email: "david.kim@dispatchly.com",
    lastLogin: "2024-03-20 13:15",
    createdAt: "2024-03-01 08:30",
    status: "active",
  },
];

export default function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(""); // Clear error when user types
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const user = mockUsers.find(
      (u) =>
        u.username === formData.username && u.password === formData.password
    );

    if (user) {
      // Remove password from user object before storing
      const { password, ...userWithoutPassword } = user;
      login(userWithoutPassword);

      // Redirect to the page they tried to visit or dashboard
      const from = location.state?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    } else {
      setError("Invalid username or password");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="signin-container">
      {/* Left side - Image */}
      <div className="signin-image-container">
        <img src="/truck.jpeg" alt="Truck" className="signin-image" />
      </div>

      {/* Right side - Login Form */}
      <div className="signin-form-container">
        <div className="signin-form-content">
          {/* Logo */}
          <div className="signin-logo-container">
            <img
              src="/Dispatchly-logo-2.png"
              alt="Dispatchly Logo"
              className="signin-logo"
            />
          </div>

          {/* Welcome Message */}
          <div className="signin-welcome">
            <h1>Welcome Back!</h1>
            <p>Please sign in to your account</p>
          </div>

          {/* Login Form */}
          <form className="signin-form" onSubmit={handleSubmit}>
            {error && <div className="signin-error">{error}</div>}

            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Enter your username"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  required
                />
                <IconButton
                  className="password-toggle-button"
                  onClick={togglePasswordVisibility}
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <VisibilityOffIcon className="password-icon" />
                  ) : (
                    <VisibilityIcon className="password-icon" />
                  )}
                </IconButton>
              </div>
            </div>

            <button type="submit" className="signin-button">
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
