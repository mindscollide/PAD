import React from "react";
import { Link } from "react-router-dom";
import {
  UserOutlined,
  TeamOutlined,
  SettingOutlined,
  SwapOutlined,
  LoginOutlined,
} from "@ant-design/icons";

export const getMenuItems = (hasAdmin, style) => {
  const baseItems = [
    {
      key: "1",
      label: (
        <Link to="/profile" className={style["dropdown-menu-item"]}>
          <UserOutlined className={style["dropdown-menu-icon"]} />
          <span className={style["dropdown-menu-options-title"]}>My Profile</span>
        </Link>
      ),
    },
    {
      key: "2",
      label: (
        <Link to="/brokers" className={style["dropdown-menu-item"]}>
          <TeamOutlined className={style["dropdown-menu-icon"]} />
          <span className={style["dropdown-menu-options-title"]}>Manage Brokers</span>
        </Link>
      ),
    },
    {
      key: "3",
      label: (
        <Link to="/notifications" className={style["dropdown-menu-item"]}>
          <SettingOutlined className={style["dropdown-menu-icon"]} />
          <span className={style["dropdown-menu-options-title"]}>Notification Settings</span>
        </Link>
      ),
    },
    {
      key: "4",
      label: (
        <Link to="/" className={style["dropdown-menu-item"]}>
          <LoginOutlined className={style["dropdown-menu-icon"]} />
          <span className={style["dropdown-menu-options-title"]}>Logout</span>
        </Link>
      ),
    },
  ];

  if (hasAdmin) {
    baseItems.push({
      key: "5",
      label: (
        <Link to="/Admin" className={style["dropdown-menu-item"]}>
          <SwapOutlined className={style["dropdown-menu-icon"]} />
          <span className={style["dropdown-menu-options-title"]} >Switch to Admin</span>
        </Link>
      ),
    });
  }

  // Insert divider items between each item except after the last one
  const itemsWithDividers = [];
  baseItems.forEach((item, index) => {
    itemsWithDividers.push(item);
    if (index !== baseItems.length - 1) {
      itemsWithDividers.push({ key: `divider-${index}`, type: "divider" });
    }
  });

  return itemsWithDividers;
};
