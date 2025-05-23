import React, { useState } from "react";
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

export default function Account() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@dispatchly.com",
    phones: ["+1 (555) 123-4567"],
    country: "United States",
    state: "New York",
    city: "New York City",
    postalCode: "10001",
    streetAddress: "123 Main Street",
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data to original values
    setFormData({
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@dispatchly.com",
      phones: ["+1 (555) 123-4567"],
      country: "United States",
      state: "New York",
      city: "New York City",
      postalCode: "10001",
      streetAddress: "123 Main Street",
    });
  };

  const handleSave = () => {
    // Here you would typically make an API call to update the user's information
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
            onClick={handleEdit}
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
              onClick={handleCancel}
              className="cancel-button"
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={handleSave}
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
              {formData.firstName} {formData.lastName}
            </Typography>
            <Typography variant="h6" className="profile-title">
              Senior Operations Manager
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
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={formData.lastName}
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
            <Grid item xs={12}>
              <div className="phones-section">
                <Typography variant="subtitle1" className="phones-title">
                  Phone Numbers
                </Typography>
                <Grid container spacing={2} className="phones-grid">
                  {formData.phones.map((phone, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <div className="phone-input-group">
                        <TextField
                          fullWidth
                          label={`Phone Number ${index + 1}`}
                          value={phone}
                          onChange={(e) =>
                            handlePhoneChange(index, e.target.value)
                          }
                          disabled={!isEditing}
                          className="profile-field"
                        />
                        {isEditing && formData.phones.length > 1 && (
                          <IconButton
                            onClick={() => removePhoneNumber(index)}
                            className="remove-phone-button"
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </div>
                    </Grid>
                  ))}
                </Grid>
                {isEditing && (
                  <Button
                    startIcon={<AddIcon />}
                    onClick={addPhoneNumber}
                    className="add-phone-button"
                  >
                    Add Phone Number
                  </Button>
                )}
              </div>
            </Grid>
          </Grid>
        </div>
      </Paper>

      {/* Address Container */}
      <Paper className="account-section">
        <div className="section-header">
          <Typography variant="h6" className="section-title">
            Address Information
          </Typography>
        </div>
        <div className="section-content">
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Street Address"
                name="streetAddress"
                value={formData.streetAddress}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="profile-field"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Country"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="profile-field"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="State/Province"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="profile-field"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="City"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="profile-field"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Postal Code"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="profile-field"
              />
            </Grid>
          </Grid>
        </div>
      </Paper>
    </div>
  );
}
