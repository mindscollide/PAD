import React from "react";
import { Link } from "react-router-dom";
import {
  UserOutlined,
  TeamOutlined,
  SettingOutlined,
  SwapOutlined,
  LoginOutlined,
} from "@ant-design/icons";

export const getProfileMenuItems = (
  currentRole,
  switchRole,
  userRoles = []
) => {
  const items = [
    {
      key: "profile",
      label: (
        <Link to="/profile" className="dropdown-menu-item">
          <UserOutlined className="dropdown-menu-icon" />
          <span>My Profile</span>
        </Link>
      ),
    },
    {
      key: "brokers",
      label: (
        <Link to="/brokers" className="dropdown-menu-item">
          <TeamOutlined className="dropdown-menu-icon" />
          <span>Manage Brokers</span>
        </Link>
      ),
    },
    {
      key: "notifications",
      label: (
        <Link to="/notifications" className="dropdown-menu-item">
          <SettingOutlined className="dropdown-menu-icon" />
          <span>Notification Settings</span>
        </Link>
      ),
    },
    {
      key: "Logout",
      label: (
        <Link to="/" className="dropdown-menu-item">
          <LoginOutlined  className="dropdown-menu-icon" />
          <span>Logout</span>
        </Link>
      ),
    },
  ];

  if (userRoles.length > 1) {
    items.push({
      key: "switch-role",
      label: (
        <div className="dropdown-menu-item">
          <SwapOutlined className="dropdown-menu-icon" />
          <span>
            Switch to {currentRole === "admin" ? "Employee" : "Admin"}
          </span>
        </div>
      ),
      onClick: () => switchRole(currentRole === "admin" ? "employee" : "admin"),
    });
  }

  return items;
};
