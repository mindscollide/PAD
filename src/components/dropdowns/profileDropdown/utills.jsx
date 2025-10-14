import React from "react";
import { Link } from "react-router-dom";
import {
  UserOutlined,
  TeamOutlined,
  SettingOutlined,
  SwapOutlined,
  LoginOutlined,
} from "@ant-design/icons";

export const getMenuItems = (
  hasAdmin,
  hasEmployee,
  style,
  handleLogout,
  navigate
) => {
  const baseItems = [
    {
      key: "1",
      label: (
        <Link to="/profile" className={style["dropdown-menu-item"]}>
          <UserOutlined className={style["dropdown-menu-icon"]} />
          <span className={style["dropdown-menu-options-title"]}>
            My Profile
          </span>
        </Link>
      ),
    },
    hasEmployee && {
      key: "2",
      label: (
        <Link to="/brokers" className={style["dropdown-menu-item"]}>
          <TeamOutlined className={style["dropdown-menu-icon"]} />
          <span className={style["dropdown-menu-options-title"]}>
            Manage Brokers
          </span>
        </Link>
      ),
    },
    {
      key: "3",
      label: (
        <Link to="/notifications" className={style["dropdown-menu-item"]}>
          <SettingOutlined className={style["dropdown-menu-icon"]} />
          <span className={style["dropdown-menu-options-title"]}>
            Notification Settings
          </span>
        </Link>
      ),
    },
    {
      key: "4",
      label: (
        // <Link to="/" className={style["dropdown-menu-item"]}>
        <div
          className={style["dropdown-menu-item"]}
          onClick={handleLogout}
          style={{ cursor: "pointer" }}
        >
          <LoginOutlined className={style["dropdown-menu-icon"]} />
          <span className={style["dropdown-menu-options-title"]}>Logout</span>
        </div>

        // </Link>
      ),
    },
  ].filter(Boolean); // remove false values when hasEmployee is false

  if (hasAdmin) {
    baseItems.push({
      key: "5",
      label: (
        // <Link to="/Admin" className={style["dropdown-menu-item"]}>
        //   <SwapOutlined className={style["dropdown-menu-icon"]} />
        //   <span className={style["dropdown-menu-options-title"]}>
        //     Switch to Admin
        //   </span>
        // </Link>
        <div
          className={style["dropdown-menu-item"]}
          onClick={() => {
            // 🧠 You can add custom logic here before navigation
            console.log("Switching to Admin...");
            sessionStorage.setItem("activeRole", "admin");
            navigate("/Admin");
          }}
          style={{ cursor: "pointer" }}
        >
          <SwapOutlined className={style["dropdown-menu-icon"]} />
          <span className={style["dropdown-menu-options-title"]}>
            Switch to Admin
          </span>
        </div>
      ),
    });
  }

  // Insert dividers between items
  const itemsWithDividers = [];
  baseItems.forEach((item, index) => {
    itemsWithDividers.push(item);
    if (index !== baseItems.length - 1) {
      itemsWithDividers.push({ key: `divider-${index}`, type: "divider" });
    }
  });

  return itemsWithDividers;
};
