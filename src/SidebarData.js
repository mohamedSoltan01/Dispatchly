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

// Define role-based access control
const roleAccess = {
  admin: [
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
  ],
  organization: [
    "dashboard",
    "trip-history",
    "new-order",
    "dispatch-order",
    "todays-trips",
    "users",
    "locations",
    "products",
    "cars",
  ],
  planning: [
    "dashboard",
    "trip-history",
    "new-order",
    "dispatch-order",
    "todays-trips",
    "locations",
    "products",
    "cars",
  ],
  dispatching: [
    "dashboard",
    "trip-history",
    "dispatch-order",
    "todays-trips",
    "locations",
    "cars",
  ],
};

export const SidebarData = [
  {
    title: "Dashboard",
    icon: <DashboardIcon />,
    path: "/dashboard",
    roles: ["admin", "organization"],
  },
  {
    title: "Trip's History",
    icon: <FormatListBulletedIcon />,
    path: "/trip-history",
    roles: ["admin", "organization", "planning"],
  },
  {
    title: "New Order",
    icon: <LocalShippingIcon />,
    path: "/new-order",
    roles: ["admin", "organization", "planning"],
  },
  {
    title: "Dispatch Order",
    icon: <DriveFileMoveIcon />,
    path: "/dispatch-order",
    roles: ["admin", "organization", "dispatching"],
  },
  {
    title: "Today's Trips",
    icon: <ExploreOutlinedIcon />,
    path: "/todays-trips",
    roles: ["admin", "organization"],
  },
  {
    title: "Users",
    icon: <AccountCircleOutlinedIcon />,
    path: "/users",
    roles: ["admin", "organization"],
  },
  {
    title: "Organizations",
    icon: <WarehouseOutlinedIcon />,
    path: "/organizations",
    roles: ["admin"],
  },
  {
    title: "Locations",
    icon: <FmdGoodOutlinedIcon />,
    path: "/locations",
    roles: ["admin", "organization", "planning"],
  },
  {
    title: "Products",
    icon: <Inventory2OutlinedIcon />,
    path: "/products",
    roles: ["admin", "organization", "planning"],
  },
  {
    title: "Cars",
    icon: <GarageOutlinedIcon />,
    path: "/cars",
    roles: ["admin", "organization", "dispatching"],
  },
];

// Helper function to check if a user has access to a route
export const hasAccess = (userRole, path) => {
  if (!userRole) return false;
  const menuItem = SidebarData.find((item) => item.path === path);
  if (!menuItem) return false;
  return menuItem.roles.includes(userRole.toLowerCase());
};
