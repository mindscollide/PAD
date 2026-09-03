import React from "react";
import {
  UserOutlined,
  TeamOutlined,
  SettingOutlined,
  SwapOutlined,
  LoginOutlined,
} from "@ant-design/icons";

export const getMenuItems = (
  setRoleChanegFlag,
  showSwitchOption,
  hasEmployee,
  style,
  handleLogout,
  setCurrentRoleIsAdmin,
  setManageBrokersModalOpen,
  setMyProfileModalOpen,
  setNotificationSettingsModalOpen,
  hasOnlyAdminRole
) => {
  const baseItems = [
    {
      key: "1",
      label: (
        <span
          className={style["dropdown-menu-item"]}
          onClick={() => setMyProfileModalOpen(true)}
        >
          <UserOutlined className={style["dropdown-menu-icon"]} />
          <span className={style["dropdown-menu-options-title"]}>
            My Profile
          </span>
        </span>
      ),
    },
    hasEmployee && {
      key: "2",
      label: (
        <span
          className={style["dropdown-menu-item"]}
          onClick={() => setManageBrokersModalOpen(true)}
        >
          <TeamOutlined className={style["dropdown-menu-icon"]} />
          <span className={style["dropdown-menu-options-title"]}>
            Manage Brokers
          </span>
        </span>
      ),
    },
    !hasOnlyAdminRole && {
      key: "3",
      label: (
        <span
          className={style["dropdown-menu-item"]}
          onClick={() => setNotificationSettingsModalOpen(true)}
        >
          <SettingOutlined className={style["dropdown-menu-icon"]} />
          <span className={style["dropdown-menu-options-title"]}>
            Notification Settings
          </span>
        </span>
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

  if (showSwitchOption) {
    const currentRoleIsAdmin = JSON.parse(
      sessionStorage.getItem("current_role_is_admin")
    );

    baseItems.push({
      key: "5",
      label: (
        <div
          className={style["dropdown-menu-item"]}
          onClick={() => {
            const newRoleIsAdmin = !currentRoleIsAdmin;
            console.log("newRoleIsAdmin", newRoleIsAdmin);
            // 🧠 Store updated role
            sessionStorage.setItem("current_role_is_admin", newRoleIsAdmin);
            setCurrentRoleIsAdmin(newRoleIsAdmin);
            setRoleChanegFlag(true);
            // Optional: show quick feedback
            console.log(
              `Switched to ${newRoleIsAdmin ? "Admin" : "User"} mode`
            );

            // 🚀 Navigate based on new role
            // navigate(newRoleIsAdmin ? "/PAD/" : "/PAD");
          }}
          style={{ cursor: "pointer" }}
        >
          <SwapOutlined className={style["dropdown-menu-icon"]} />
          <span className={style["dropdown-menu-options-title"]}>
            Switch to {currentRoleIsAdmin ? "User" : "Admin"}
          </span>
        </div>
      ),
    });

    // ⬆️ Move "Switch" above "Logout"
    const logoutIndex = baseItems.findIndex((item) => item.key === "4");
    const switchIndex = baseItems.findIndex((item) => item.key === "5");

    if (logoutIndex > -1 && switchIndex > -1 && switchIndex > logoutIndex) {
      const [switchItem] = baseItems.splice(switchIndex, 1);
      baseItems.splice(logoutIndex, 0, switchItem);
    }
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
