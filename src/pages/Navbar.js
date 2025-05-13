import React from "react";
import "../styles/Navbar.css";
import NotificationsIcon from "@mui/icons-material/Notifications";
export default function Navbar() {
  return (
    <header className="header">
      <div></div>
      <div className="header-right">
        <NotificationsIcon />
        <a href="#" className="sign-out">
          Sign Out
        </a>
      </div>
    </header>
  );
}
