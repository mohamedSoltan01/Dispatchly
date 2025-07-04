import React, { useState, useContext, useEffect } from "react";
import {
  Avatar,
  Button,
  Divider,
  TextField,
  Typography,
  Paper,
  Grid,
  IconButton,
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import "../styles/Account.css";
import { AuthContext } from "../App";
import { organizationsService } from "../services/organizations";

export default function Account() {
  const { user } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [organization, setOrganization] = useState(null);
  const [organizationName, setOrganizationName] = useState("");
  const [formData, setFormData] = useState({
    firstName: user?.name?.split(" ")[0] || "",
    email: user?.email || "",
    role: user?.role || "",
    organization: "", // Will be fetched
  });

  useEffect(() => {
    // Always fetch organization by id from backend
    if (user?.organization_id) {
      const fetchOrg = async () => {
        try {
          const org = await organizationsService.getOrganization(user.organization_id);
          setOrganization(org?.organization || org);
          setOrganizationName(org?.organization?.name || org?.name || "");
        } catch (e) {
          setOrganization(null);
          setOrganizationName("");
        }
      };
      fetchOrg();
    } else {
      setOrganization(null);
      setOrganizationName("");
    }
  }, [user]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    // Reset form data to original user data
    setFormData({
      firstName: user?.name?.split(" ")[0] || "",
      email: user?.email || "",
      role: user?.role || "",
      organization: "",
    });
    setIsEditing(false);
  };

  const handleSaveClick = () => {
    // Here you would typically make an API call to update the user data
    setIsEditing(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhoneChange = (index, value) => {
    const newPhones = [...formData.phones];
    newPhones[index] = value;
    setFormData((prev) => ({
      ...prev,
      phones: newPhones,
    }));
  };

  const addPhoneNumber = () => {
    setFormData((prev) => ({
      ...prev,
      phones: [...prev.phones, ""],
    }));
  };

  const removePhoneNumber = (index) => {
    setFormData((prev) => ({
      ...prev,
      phones: prev.phones.filter((_, i) => i !== index),
    }));
  };

  // Format role for display
  const formatRole = (role) => {
    if (!role) return "";
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  return (
    <div className="account-container">
      <div className="account-header">
        <Typography variant="h4" className="account-title">
          Account Settings
        </Typography>
        {!isEditing ? (
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={handleEditClick}
            className="edit-button"
          >
            Edit Profile
          </Button>
        ) : (
          <div className="action-buttons">
            <Button
              variant="outlined"
              color="error"
              startIcon={<CancelIcon />}
              onClick={handleCancelClick}
              className="cancel-button"
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={handleSaveClick}
              className="save-button"
            >
              Save Changes
            </Button>
          </div>
        )}
      </div>

      {/* Profile Container */}
      <Paper className="account-section profile-section">
        <div className="section-header">
          <Typography variant="h6" className="section-title">
            Profile Information
          </Typography>
        </div>
        <div className="profile-content">
          <Avatar
            sx={{
              width: 120,
              height: 120,
              backgroundColor: "var(--primary)",
            }}
          >
            <AccountCircleIcon sx={{ fontSize: 80 }} />
          </Avatar>
          <div className="profile-info">
            <Typography variant="h4" className="profile-name">
              {user?.name || "User Name"}
            </Typography>
            <Typography variant="h6" className="profile-title">
              {user?.jobTitle || "Job Title"}
            </Typography>
            <Typography variant="body1" className="profile-role">
              {formatRole(user?.role)}
            </Typography>
          </div>
        </div>
      </Paper>

      {/* Contact Information Container */}
      <Paper className="account-section">
        <div className="section-header">
          <Typography variant="h6" className="section-title">
            Contact Information
          </Typography>
        </div>
        <div className="section-content">
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="profile-field"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="profile-field"
              />
            </Grid>
          </Grid>
        </div>
      </Paper>

      {/* Additional Information Container */}
      <Paper className="account-section">
        <div className="section-header">
          <Typography variant="h6" className="section-title">
            Additional Information
          </Typography>
        </div>
        <div className="section-content">
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Organization"
                name="organization"
                value={organizationName}
                disabled={true}
                className="profile-field"
                placeholder="Not provided"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Role"
                name="role"
                value={formatRole(formData.role)}
                disabled={true}
                className="profile-field"
              />
            </Grid>
          </Grid>
        </div>
      </Paper>
    </div>
  );
}
