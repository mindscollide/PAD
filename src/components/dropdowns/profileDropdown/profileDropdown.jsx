import React, { useMemo, useState } from "react";
import { Avatar, Dropdown } from "antd";
import {
  DownOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import ProfileImg from "../../../assets/img/profile.png";
import style from "./profileDropdown.module.css";
import { getMenuItems } from "./utills";  // make sure this path is correct

const ProfileDropdown = () => {
  // Get user roles from sessionStorage
  let roles = JSON.parse(sessionStorage.getItem("user_assigned_roles"));
  const hasAdmin = roles?.length > 0 && roles.some(role => role.roleID === 1);

  // Get user profile data safely
  const profile = useMemo(() => {
    try {
      const stored = sessionStorage.getItem("user_profile_data");
      return stored ? JSON.parse(stored) : null;
    } catch (err) {
      console.error("Invalid JSON in user_profile_data:", err);
      return null;
    }
  }, []);

  // Prepare display name fallback
  const name = useMemo(() => {
    if (!profile) return "Guest";
    return [profile.firstName, profile.lastName].filter(Boolean).join(" ");
  }, [profile]);

  const [isOpen, setIsOpen] = useState(false);

  // Get menu items passing correct styles object
  const menuItems = getMenuItems(hasAdmin, style);

  return (
    <Dropdown
      menu={{ items: menuItems }} // pass items property here
      trigger={["click"]}
      placement="bottomRight"
      overlayClassName={style["profile-dropdown-overlay"]}
      overlayStyle={{ background: "transparent" }}
      onOpenChange={(open) => setIsOpen(open)}
    >
      <div className={style["profile-dropdown-trigger"]}>
        {profile?.profilePictureURL ? (
          <img
            src={ProfileImg}
            alt="Profile"
            className={style["profile-img"]}
          />
        ) : (
          <Avatar icon={<UserOutlined />} />
        )}
        <span className={style["profile-name"]}>{name}</span>
        <DownOutlined
          className={`${style["dropdown-arrow"]} ${isOpen ? style["open"] : ""}`}
        />
      </div>
    </Dropdown>
  );
};

export default ProfileDropdown;
