import React, { useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/SignIn.css";
import { AuthContext } from "../App";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { IconButton } from "@mui/material";
import { authService } from "../services/auth";

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
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await authService.login(formData);
      
      // Store the token
      authService.setToken(response.token);
      
      // Get user data from the response
      const user = {
        id: response.user_id,
        email: formData.username, // Use the email as username
        organization_id: response.organization_id,
        role: response.role, // Add the user's role from backend
        name: formData.username, // fallback for components expecting name
        jobTitle: "", // fallback for components expecting jobTitle
        // Add any other user data you need
      };
      
      // Store user data
      authService.setUser(user);
      
      // Update auth context
      login(user);

      // Redirect to the page they tried to visit or dashboard
      const from = location.state?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.error || "Invalid username or password");
    } finally {
      setIsLoading(false);
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

            <button type="submit" className="signin-button" disabled={isLoading}>
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
