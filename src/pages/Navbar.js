import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Navbar.css";
import { colors, typography, spacing } from "../styles/designSystem";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import MenuIcon from "@mui/icons-material/Menu";
import { IconButton, Badge, Menu, MenuItem, Avatar } from "@mui/material";
import { useNotificationCount } from "../hooks/useNotificationCount";
import { AuthContext } from "../App";
import { authService } from "../services/auth";

export default function Navbar({ toggleSidebar }) {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const unreadCount = useNotificationCount();

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    handleMenuClose();
    navigate("/account");
  };

  const handleLogout = () => {
    authService.logout();
    logout();
    navigate("/signin");
  };

  const handleNotificationsClick = () => {
    navigate("/notifications");
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
          onClick={handleNotificationsClick}
          sx={{
            color: colors.text.secondary,
            "&:hover": {
              backgroundColor: colors.background.hover,
            },
          }}
        >
          <Badge
            badgeContent={unreadCount}
            color="error"
            sx={{
              "& .MuiBadge-badge": {
                backgroundColor: unreadCount > 0 ? colors.error : "transparent",
                color: unreadCount > 0 ? colors.text.white : "transparent",
                boxShadow: unreadCount > 0 ? "0 0 0 2px white" : "none",
              },
            }}
          >
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
            {user?.name?.charAt(0) || <AccountCircleIcon />}
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
            onClick={handleLogout}
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
      </div>
    </header>
  );
}
