import React, { useState } from "react";
import { Dropdown, Badge } from "antd";
import styles from "./notificationDropdown.module.css";

// Notification Bell Icons
import NotificationBellLightIcon from "../../../assets/img/bell-light.png";
import NotificationBellDarkIcon from "../../../assets/img/bell-dark.png";

// Notification Type Icons
import SuccessIcon from "../../../assets/img/sucess-dark.png";
import ErrorIcon from "../../../assets/img/error-dark.png";
import InfoIcon from "../../../assets/img/message-dark.png";
import WarningIcon from "../../../assets/img/error-dark.png";

/**
 * NotificationDropdown Component
 *
 * A customizable notification dropdown that:
 * - Displays a bell icon with unread count badge
 * - Shows a dropdown list of notifications when clicked
 * - Supports different notification types (success, error, info, warning)
 * - Toggles between light/dark bell icons based on state
 * - Provides hover and active states for better UX
 *
 * Features:
 * - Dynamic icon switching
 * - Unread notification count
 * - Mark all as read functionality
 * - Responsive design
 * - Accessibility considerations
 */
const NotificationDropdown = () => {
  // Component State
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hovered, setHovered] = useState(false);

  // Notification Data
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Trade Approved",
      description:
        "Your approval for the trade of 100 bonds of ABC Ltd. has been processed.",
      time: "30 minutes ago",
      type: "success",
      read: false,
    },
    {
      id: 2,
      title: "New Message",
      description:
        "Your approval for the trade of 100 bonds of ABC Ltd. has been processed.",
      time: "30 minutes ago",
      type: "success",
      read: false,
    },
    {
      id: 3,
      title: "Request Approved",
      description:
        "Your approval for the trade of 100 bonds of ABC Ltd. has been processed.",
      time: "30 minutes ago",
      type: "success", // success | info | error | warning
      read: false,
    },
    {
      id: 4,
      title: "Request Approved",
      description:
        "Your approval for the trade of 100 bonds of ABC Ltd. has been processed.",
      time: "30 minutes ago",
      type: "success", // success | info | error | warning
      read: false,
    },
    {
      id: 5,
      title: "Request Approved",
      description:
        "Your approval for the trade of 100 bonds of ABC Ltd. has been processed.",
      time: "30 minutes ago",
      type: "success", // success | info | error | warning
      read: false,
    },
    {
      id: 6,
      title: "Request Approved",
      description:
        "Your approval for the trade of 100 bonds of ABC Ltd. has been processed.",
      time: "30 minutes ago",
      type: "success", // success | info | error | warning
      read: false,
    },
    {
      id: 7,
      title: "Request Approved",
      description:
        "Your approval for the trade of 100 bonds of ABC Ltd. has been processed.",
      time: "30 minutes ago",
      type: "error", // success | info | error | warning
      read: false,
    },
    {
      id: 8,
      title: "Request Approved",
      description:
        "Your approval for the trade of 100 bonds of ABC Ltd. has been processed.",
      time: "30 minutes ago",
      type: "success", // success | info | error | warning
      read: false,
    },
    {
      id: 9,
      title: "Request Approved",
      description:
        "Your approval for the trade of 100 bonds of ABC Ltd. has been processed.",
      time: "30 minutes ago",
      type: "success", // success | info | error | warning
      read: false,
    },
    {
      id: 10,
      title: "Request Approved",
      description:
        "Your approval for the trade of 100 bonds of ABC Ltd. has been processed.",
      time: "30 minutes ago",
      type: "success", // success | info | error | warning
      read: false,
    },
    {
      id: 11,
      title: "Request Approved",
      description:
        "Your approval for the trade of 100 bonds of ABC Ltd. has been processed.",
      time: "30 minutes ago",
      type: "success", // success | info | error | warning
      read: false,
    },
    {
      id: 12,
      title: "Request Approved",
      description:
        "Your approval for the trade of 100 bonds of ABC Ltd. has been processed.",
      time: "30 minutes ago",
      type: "success", // success | info | error | warning
      read: false,
    },
    {
      id: 14,
      title: "Request Approved",
      description:
        "Your approval for the trade of 100 bonds of ABC Ltd. has been processed.",
      time: "30 minutes ago",
      type: "success", // success | info | error | warning
      read: false,
    },
    {
      id: 15,
      title: "Request Approved",
      description:
        "Your approval for the trade of 100 bonds of ABC Ltd. has been processed.",
      time: "30 minutes ago",
      type: "success", // success | info | error | warning
      read: false,
    },
    {
      id: 16,
      title: "Request Approved",
      description:
        "Your approval for the trade of 100 bonds of ABC Ltd. has been processed.",
      time: "30 minutes ago",
      type: "success", // success | info | error | warning
      read: false,
    },
    {
      id: 17,
      title: "Request Approved",
      description:
        "Your approval for the trade of 100 bonds of ABC Ltd. has been processed.",
      time: "30 minutes ago",
      type: "success", // success | info | error | warning
      read: false,
    },
    {
      id: 18,
      title: "Request Approved",
      description:
        "Your approval for the trade of 100 bonds of ABC Ltd. has been processed.",
      time: "30 minutes ago",
      type: "success", // success | info | error | warning
      read: false,
    },
    {
      id: 19,
      title: "Request Approved",
      description:
        "Your approval for the trade of 100 bonds of ABC Ltd. has been processed.",
      time: "30 minutes ago",
      type: "success", // success | info | error | warning
      read: false,
    },
    {
      id: 20,
      title: "Request Approved",
      description:
        "Your approval for the trade of 100 bonds of ABC Ltd. has been processed.",
      time: "30 minutes ago",
      type: "success", // success | info | error | warning
      read: false,
    },
    {
      id: 21,
      title: "Request Approved",
      description:
        "Your approval for the trade of 100 bonds of ABC Ltd. has been processed.",
      time: "30 minutes ago",
      type: "success", // success | info | error | warning
      read: false,
    },
  ]);

  /**
   * Calculate the number of unread notifications
   * @type {number}
   */
  const unreadCount = notifications.filter((n) => !n.read).length;

  /**
   * Get the appropriate bell icon based on component state
   * @returns {string} Path to the icon image
   */
  const getIcon = () => {
    if (dropdownOpen) return NotificationBellLightIcon;
    if (hovered) return NotificationBellDarkIcon;
    return NotificationBellDarkIcon;
  };

  /**
   * Get the appropriate notification type icon
   * @param {string} type - Notification type (success|error|info|warning)
   * @returns {string} Path to the notification type icon
   */
  const getNotificationIcon = (type) => {
    switch (type) {
      case "success":
        return SuccessIcon;
      case "error":
        return ErrorIcon;
      case "info":
        return InfoIcon;
      case "warning":
        return WarningIcon;
      default:
        return InfoIcon;
    }
  };

  return (
    <Dropdown
      trigger={["click"]}
      placement="bottomRight"
      onOpenChange={(open) => setDropdownOpen(open)}
      getPopupContainer={(trigger) => trigger.parentElement}
      overlayClassName={styles["dropdown-overlay"]}
      popupRender={(menu) => (
        <>
          {" "}
          <div className={styles["dropdown-header"]}>Notifications</div>
          <div className={styles["custom-dropdown-wrapper"]}>
            {/* Dropdown Header */}

            {/* Notification List */}
            <div className={styles["notification-list"]}>
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={styles["notification-item"]}
                >
                  {/* Notification Icon */}
                  <div className={styles["notification-icon-div"]}>
                    <img
                      src={getNotificationIcon(notification.type)}
                      alt={`${notification.type} notification`}
                      className={styles["notification-icon"]}
                    />
                  </div>

                  {/* Notification Content */}
                  <div className={styles["notification-content"]}>
                    <div className={styles["notification-header"]}>
                      <div className={styles["notification-title"]}>
                        {notification.title}
                        {!notification.read && (
                          <span className={styles["unread-indicator"]} />
                        )}
                      </div>
                    </div>
                    <div className={styles["notification-message"]}>
                      {notification.description}
                    </div>
                    <div className={styles["notification-time"]}>
                      {notification.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    >
      {/* Notification Trigger */}
      <Badge
        count={unreadCount}
        size="small"
        offset={[-5, 35]}
        className={styles["notification-badge"]}
      >
        <div
          className={`${styles["dropdown-trigger-container"]} ${
            dropdownOpen ? styles["dropdown-open"] : ""
          }`}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          aria-label="Notifications"
          role="button"
        >
          <img
            src={getIcon()}
            alt="Notification Bell"
            className={styles["dropdown-icon"]}
          />
        </div>
      </Badge>
    </Dropdown>
  );
};

export default NotificationDropdown;
