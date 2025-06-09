import React, { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Sidebar.css";
import { SidebarData } from "./SidebarData";
import { AuthContext } from "./App";

export default function Sidebar() {
  const location = useLocation();
  const { user } = useContext(AuthContext);

  // If no user or no role, show nothing
  if (!user || !user.role) {
    return null;
  }

  // Filter menu items based on user role
  const filteredMenuItems = SidebarData.filter((item) =>
    item.roles.includes(user.role.toLowerCase())
  );

  return (
    <div className="Sidebar">
      <div className="sidebar-logo">
        <img
          src="/Dispatchly-logo.png"
          alt="Dispatchly Logo"
          width={40}
          height={40}
          className="logo-image"
        />
      </div>
      <ul>
        {filteredMenuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <li
              className={`nav-item ${isActive ? "active" : ""}`}
              key={item.title}
            >
              <Link to={item.path} className="nav-link">
                <div className="nav-item-icon">{item.icon}</div>
                <div className="nav-item-title">{item.title}</div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
