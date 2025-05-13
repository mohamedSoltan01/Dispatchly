import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Sidebar.css";
import { SidebarData } from "./SidebarData";

export default function Sidebar() {
  const location = useLocation();

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
        {SidebarData.map((item) => {
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
