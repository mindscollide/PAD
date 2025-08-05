import React, { useMemo, useState } from "react";
import { Avatar, Dropdown } from "antd";
import {
  DownOutlined,
  SwapOutlined,
  UserOutlined,
  SettingOutlined,
  TeamOutlined,
  LoginOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import ProfileImg from "../../../assets/img/profile.png";
import style from "./profileDropdown.module.css";
const ProfileDropdown = () => {
  const profile = useMemo(() => {
    try {
      const stored = sessionStorage.getItem("user_profile_data");
      return stored ? JSON.parse(stored) : null;
    } catch (err) {
      console.error("Invalid JSON in user_profile_data:", err);
      return null;
    }
  }, []);

  const name = useMemo(() => {
    if (!profile) return "Guest"; // fallback display name
    return [profile.firstName, profile.lastName].filter(Boolean).join(" ");
  }, [profile]);

  const [isOpen, setIsOpen] = useState(false);

  const items = [
    {
      key: "1",
      label: (
        <Link to="/profile" className={style["dropdown-menu-item"]}>
          <UserOutlined className={style["dropdown-menu-icon"]} />
          <span>My Profile</span>
        </Link>
      ),
    },
    {
      key: "2",
      label: (
        <Link to="/brokers" className={style["dropdown-menu-item"]}>
          <TeamOutlined className={style["dropdown-menu-icon"]} />
          <span>Manage Brokers</span>
        </Link>
      ),
    },
    {
      key: "3",
      label: (
        <Link to="/notifications" className={style["dropdown-menu-item"]}>
          <SettingOutlined className={style["dropdown-menu-icon"]} />
          <span>Notification Settings</span>
        </Link>
      ),
    },
    {
      key: "4",
      label: (
        <Link to="/" className={style["dropdown-menu-item"]}>
          <LoginOutlined className={style["dropdown-menu-icon"]} />
          <span>Logout</span>
        </Link>
      ),
    },
    {
      key: "5",
      label: (
        <Link to="/Admin" className={style["dropdown-menu-item"]}>
          <SwapOutlined className={style["dropdown-menu-icon"]} />
          <span>Switch to Admin</span>
        </Link>
      ),
    },
  ];

  return (
    <Dropdown
      menu={{ items }}
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
          className={`${style["dropdown-arrow"]} ${
            isOpen ? style["open"] : ""
          }`}
        />
      </div>
    </Dropdown>
  );
};

export default ProfileDropdown;
