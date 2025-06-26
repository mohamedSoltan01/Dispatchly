import React from "react";
import DashboardIcon from "@mui/icons-material/Dashboard";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import ExploreOutlinedIcon from "@mui/icons-material/ExploreOutlined";
import DriveFileMoveIcon from "@mui/icons-material/DriveFileMove";
import WarehouseOutlinedIcon from "@mui/icons-material/WarehouseOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import FmdGoodOutlinedIcon from "@mui/icons-material/FmdGoodOutlined";
// import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import GarageOutlinedIcon from "@mui/icons-material/GarageOutlined";
import NotificationsIcon from "@mui/icons-material/Notifications";

// Define role-based access control
const roleAccess = {
  super_admin: [
    "dashboard",
    "trip-history",
    "new-order",
    "dispatch-order",
    "todays-trips",
    "users",
    "organizations",
    "locations",
    "products",
    "cars",
    "notifications",
  ],
  org_admin: [
    "dashboard",
    "trip-history",
    "new-order",
    "dispatch-order",
    "todays-trips",
    "users",
    "locations",
    "products",
    "cars",
    "notifications",
  ],
  planner: [
    "dashboard",
    "trip-history",
    "new-order",
    "dispatch-order",
    "todays-trips",
    "locations",
    "products",
    "cars",
    "notifications",
  ],
  dispatcher: [
    "dashboard",
    "trip-history",
    "dispatch-order",
    "todays-trips",
    "locations",
    "cars",
    "notifications",
  ],
};

export const SidebarData = [
  {
    title: "Dashboard",
    icon: <DashboardIcon />,
    path: "/dashboard",
    roles: ["super_admin", "org_admin", "planner", "dispatcher"],
  },
  {
    title: "Trip's History",
    icon: <FormatListBulletedIcon />,
    path: "/trip-history",
    roles: ["super_admin", "org_admin", "planner", "dispatcher"],
  },
  {
    title: "Orders History",
    icon: <FormatListBulletedIcon />,
    path: "/orders-history",
    roles: ["super_admin", "org_admin", "planner", "dispatcher"],
  },
  {
    title: "New Order",
    icon: <LocalShippingIcon />,
    path: "/new-order",
    roles: ["super_admin", "org_admin", "planner"],
  },
  {
    title: "Dispatch Order",
    icon: <DriveFileMoveIcon />,
    path: "/dispatch-order",
    roles: ["super_admin", "org_admin", "dispatcher"],
  },
  {
    title: "Today's Trips",
    icon: <ExploreOutlinedIcon />,
    path: "/todays-trips",
    roles: ["super_admin", "org_admin", "planner", "dispatcher"],
  },
  {
    title: "Users",
    icon: <AccountCircleOutlinedIcon />,
    path: "/users",
    roles: ["super_admin", "org_admin"],
  },
  {
    title: "Organizations",
    icon: <WarehouseOutlinedIcon />,
    path: "/organizations",
    roles: ["super_admin"],
  },
  {
    title: "Locations",
    icon: <FmdGoodOutlinedIcon />,
    path: "/locations",
    roles: ["super_admin", "org_admin", "planner", "dispatcher"],
  },
  {
    title: "Products",
    icon: <Inventory2OutlinedIcon />,
    path: "/products",
    roles: ["super_admin", "org_admin", "planner"],
  },
  {
    title: "Cars",
    icon: <GarageOutlinedIcon />,
    path: "/cars",
    roles: ["super_admin", "org_admin", "dispatcher"],
  },
];

// Helper function to check if a user has access to a route
export const hasAccess = (userRole, path) => {
  if (!userRole) return false;
  const menuItem = SidebarData.find((item) => item.path === path);
  if (!menuItem) return false;
  return menuItem.roles.includes(userRole.toLowerCase());
};
