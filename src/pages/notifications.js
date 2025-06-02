import React, { useState, useEffect } from "react";
import {
  Card,
  Typography,
  Divider,
  IconButton,
  Box,
  Tooltip,
  Fade,
  Button,
  Checkbox,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CircleIcon from "@mui/icons-material/Circle";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import { colors, typography, spacing } from "../styles/designSystem";

// Helper function to get time ago
const getTimeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return "just now";
};

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(() => {
    // Initialize from localStorage or use default notifications
    const saved = localStorage.getItem("notifications");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing notifications:", e);
        return getDefaultNotifications();
      }
    }
    return getDefaultNotifications();
  });
  const [selectedNotifications, setSelectedNotifications] = useState(new Set());

  // Save to localStorage whenever notifications change
  useEffect(() => {
    localStorage.setItem("notifications", JSON.stringify(notifications));
  }, [notifications]);

  // Get default notifications with timestamps
  function getDefaultNotifications() {
    const now = new Date();
    return [
      {
        id: 1,
        title: "New order #1234 has been assigned",
        timestamp: new Date(now - 5 * 60000).toISOString(), // 5 minutes ago
        type: "order",
        read: false,
      },
      {
        id: 2,
        title: "Trip #5678 has been completed",
        timestamp: new Date(now - 3600000).toISOString(), // 1 hour ago
        type: "trip",
        read: false,
      },
      {
        id: 3,
        title: "New driver has been added",
        timestamp: new Date(now - 7200000).toISOString(), // 2 hours ago
        type: "user",
        read: false,
      },
    ];
  }

  const handleDelete = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleMarkAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );
  };

  const handleSelectAll = () => {
    if (selectedNotifications.size === notifications.length) {
      setSelectedNotifications(new Set());
    } else {
      setSelectedNotifications(new Set(notifications.map((n) => n.id)));
    }
  };

  const handleSelectNotification = (id) => {
    setSelectedNotifications((prev) => {
      const newSelected = new Set(prev);
      if (newSelected.has(id)) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
      }
      return newSelected;
    });
  };

  const handleDeleteSelected = () => {
    setNotifications((prev) =>
      prev.filter((n) => !selectedNotifications.has(n.id))
    );
    setSelectedNotifications(new Set());
  };

  const getUnreadCount = () => notifications.filter((n) => !n.read).length;

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <IconButton
          onClick={() => navigate(-1)}
          sx={{
            color: colors.text.secondary,
            "&:hover": { backgroundColor: colors.background.hover },
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography
          variant="h5"
          sx={{
            ...typography.h5,
            color: colors.text.primary,
            marginLeft: spacing.md,
            flex: 1,
          }}
        >
          Notifications
          {getUnreadCount() > 0 && (
            <Typography
              component="span"
              sx={{
                ...typography.caption,
                color: colors.primary.main,
                marginLeft: spacing.sm,
                backgroundColor: colors.primary.light + "20",
                padding: "2px 8px",
                borderRadius: "12px",
              }}
            >
              {getUnreadCount()} unread
            </Typography>
          )}
        </Typography>
        <Box sx={{ display: "flex", gap: spacing.sm }}>
          {getUnreadCount() > 0 && (
            <Button
              startIcon={<DoneAllIcon />}
              onClick={handleMarkAllAsRead}
              sx={{
                color: colors.primary.main,
                "&:hover": {
                  backgroundColor: colors.primary.light + "20",
                },
              }}
            >
              Mark all as read
            </Button>
          )}
          <Button
            startIcon={
              <Checkbox
                checked={selectedNotifications.size === notifications.length}
                indeterminate={
                  selectedNotifications.size > 0 &&
                  selectedNotifications.size < notifications.length
                }
                onChange={handleSelectAll}
                sx={{
                  color: colors.primary.main,
                  padding: 0,
                  marginRight: -1,
                }}
              />
            }
            onClick={handleSelectAll}
            sx={{
              color: colors.text.secondary,
              "&:hover": {
                backgroundColor: colors.background.hover,
              },
            }}
          >
            Select All
          </Button>
          {selectedNotifications.size > 0 && (
            <Button
              startIcon={<DeleteIcon />}
              onClick={handleDeleteSelected}
              sx={{
                color: colors.error,
                "&:hover": {
                  backgroundColor: colors.error + "10",
                },
              }}
            >
              Delete Selected ({selectedNotifications.size})
            </Button>
          )}
        </Box>
      </div>

      <Card
        sx={{
          marginTop: spacing.lg,
          padding: spacing.lg,
          backgroundColor: colors.background.paper,
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        }}
      >
        {notifications.length === 0 ? (
          <Box
            sx={{
              py: spacing.xl,
              textAlign: "center",
              color: colors.text.secondary,
            }}
          >
            <Typography variant="body1">No notifications</Typography>
          </Box>
        ) : (
          notifications.map((notification, index) => (
            <React.Fragment key={notification.id}>
              {index > 0 && <Divider sx={{ my: spacing.md }} />}
              <Box
                sx={{
                  py: spacing.md,
                  px: spacing.sm,
                  display: "flex",
                  alignItems: "flex-start",
                  gap: spacing.md,
                  transition: "background-color 0.2s ease",
                  "&:hover": {
                    backgroundColor: colors.background.hover,
                  },
                  cursor: "pointer",
                }}
                onClick={() => handleMarkAsRead(notification.id)}
              >
                <Checkbox
                  checked={selectedNotifications.has(notification.id)}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleSelectNotification(notification.id);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  sx={{
                    color: colors.primary.main,
                    "&.Mui-checked": {
                      color: colors.primary.main,
                    },
                  }}
                />
                <Box sx={{ flex: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: spacing.sm,
                    }}
                  >
                    {!notification.read && (
                      <CircleIcon
                        sx={{
                          fontSize: 8,
                          color: colors.primary.main,
                        }}
                      />
                    )}
                    <Typography
                      variant="body1"
                      sx={{
                        ...typography.body1,
                        color: notification.read
                          ? colors.text.secondary
                          : colors.text.primary,
                        fontWeight: notification.read ? 400 : 500,
                      }}
                    >
                      {notification.title}
                    </Typography>
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      ...typography.caption,
                      color: colors.text.secondary,
                      display: "block",
                      mt: spacing.xs,
                    }}
                  >
                    {getTimeAgo(notification.timestamp)}
                  </Typography>
                </Box>
                <Tooltip title="Delete notification" TransitionComponent={Fade}>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(notification.id);
                    }}
                    sx={{
                      color: colors.text.secondary,
                      "&:hover": {
                        color: colors.error,
                        backgroundColor: colors.error + "10",
                      },
                    }}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </React.Fragment>
          ))
        )}
      </Card>
    </div>
  );
}
