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

export const SidebarData = [
  {
    title: "Dashboard",
    icon: <DashboardIcon />,
    path: "/dashboard",
  },
  {
    title: "Trip's History",
    icon: <FormatListBulletedIcon />,
    path: "/trip-history",
  },
  {
    title: "New Order",
    icon: <LocalShippingIcon />,
    path: "/new-order",
  },
  {
    title: "Dispatch Order",
    icon: <DriveFileMoveIcon />,
    path: "/dispatch-order",
  },
  {
    title: "Today's Trips",
    icon: <ExploreOutlinedIcon />,
    path: "/todays-trips",
  },
  {
    title: "Users",
    icon: <AccountCircleOutlinedIcon />,
    path: "/users",
  },
  {
    title: "Organizations",
    icon: <WarehouseOutlinedIcon />,
    path: "/organizations",
  },
  {
    title: "Locations",
    icon: <FmdGoodOutlinedIcon />,
    path: "/locations",
  },
  {
    title: "Products",
    icon: <Inventory2OutlinedIcon />,
    path: "/products",
  },
  {
    title: "Cars",
    icon: <GarageOutlinedIcon />,
    path: "/cars",
  },
];
