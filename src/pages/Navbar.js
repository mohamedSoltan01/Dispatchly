import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Navbar.css";
import { colors, typography, spacing } from "../styles/designSystem";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import MenuIcon from "@mui/icons-material/Menu";
import { IconButton, Badge, Menu, MenuItem, Avatar } from "@mui/material";

export default function Navbar({ toggleSidebar }) {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationsAnchor, setNotificationsAnchor] = useState(null);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationsOpen = (event) => {
    setNotificationsAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setNotificationsAnchor(null);
  };

  const handleProfileClick = () => {
    handleMenuClose();
    navigate("/account");
  };

  const handleSignOut = () => {
    handleMenuClose();
    // Add sign out logic here
    console.log("Signing out...");
  };

  return (
    <header
      className="header"
      style={{
        backgroundColor: colors.background.paper,
        borderBottom: `1px solid ${colors.border.light}`,
        padding: `${spacing.sm} ${spacing.lg}`,
      }}
    >
      <div className="header-left">
        <IconButton
          onClick={toggleSidebar}
          sx={{
            display: { sm: "none" },
            color: colors.text.primary,
          }}
        >
          <MenuIcon />
        </IconButton>
      </div>

      <div className="header-right" style={{ gap: spacing.md }}>
        <IconButton
          onClick={handleNotificationsOpen}
          sx={{ color: colors.text.secondary }}
        >
          <Badge badgeContent={3} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>

        <IconButton
          onClick={handleProfileMenuOpen}
          sx={{
            padding: 0,
            "&:hover": { opacity: 0.8 },
          }}
        >
          <Avatar
            sx={{
              width: 32,
              height: 32,
              backgroundColor: colors.primary.main,
            }}
          >
            <AccountCircleIcon />
          </Avatar>
        </IconButton>

        {/* Profile Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            style: {
              marginTop: spacing.sm,
              minWidth: "200px",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            },
          }}
        >
          <MenuItem onClick={handleProfileClick}>Profile</MenuItem>
          <MenuItem
            onClick={handleSignOut}
            sx={{
              color: colors.error,
              borderTop: `1px solid ${colors.border.light}`,
              marginTop: spacing.xs,
              paddingTop: spacing.sm,
            }}
          >
            Sign Out
          </MenuItem>
        </Menu>

        {/* Notifications Menu */}
        <Menu
          anchorEl={notificationsAnchor}
          open={Boolean(notificationsAnchor)}
          onClose={handleMenuClose}
          PaperProps={{
            style: {
              marginTop: spacing.sm,
              minWidth: "300px",
              maxHeight: "400px",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            },
          }}
        >
          <MenuItem onClick={handleMenuClose}>
            <div style={{ padding: spacing.sm }}>
              <div
                style={{
                  ...typography.body2,
                  color: colors.text.primary,
                  marginBottom: spacing.xs,
                }}
              >
                New order #1234 has been assigned
              </div>
              <div
                style={{
                  ...typography.caption,
                  color: colors.text.secondary,
                }}
              >
                5 minutes ago
              </div>
            </div>
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <div style={{ padding: spacing.sm }}>
              <div
                style={{
                  ...typography.body2,
                  color: colors.text.primary,
                  marginBottom: spacing.xs,
                }}
              >
                Trip #5678 has been completed
              </div>
              <div
                style={{
                  ...typography.caption,
                  color: colors.text.secondary,
                }}
              >
                1 hour ago
              </div>
            </div>
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <div style={{ padding: spacing.sm }}>
              <div
                style={{
                  ...typography.body2,
                  color: colors.text.primary,
                  marginBottom: spacing.xs,
                }}
              >
                New driver has been added
              </div>
              <div
                style={{
                  ...typography.caption,
                  color: colors.text.secondary,
                }}
              >
                2 hours ago
              </div>
            </div>
          </MenuItem>
        </Menu>
      </div>
    </header>
  );
}
