import React, { useEffect, useRef, useState } from "react";
import { Dropdown, Badge, Spin } from "antd";
import styles from "./notificationDropdown.module.css";

// Notification Bell Icons
import NotificationBellLightIcon from "../../../assets/img/bell-light.png";
import NotificationBellDarkIcon from "../../../assets/img/bell-dark.png";

// Notification Type Icons
import SuccessIcon from "../../../assets/img/sucess-dark.png";
import ErrorIcon from "../../../assets/img/error-dark.png";
import InfoIcon from "../../../assets/img/message-dark.png";
import WarningIcon from "../../../assets/img/error-dark.png";
import NotificationItem from "./Utils";
import { useNotification } from "../../NotificationProvider/NotificationProvider";
import { useGlobalLoader } from "../../../context/LoaderContext";
import { useApi } from "../../../context/ApiContext";
import { useNavigate } from "react-router-dom";
import { useWebNotification } from "../../../context/notificationContext";
import {
  GetUserWebNotificationRequest,
  MarkNotificationAsReadRequest,
} from "../../../api/notification";
import {
  formatApiDateTime,
  getCurrentDateTimeMarkAsReadNotification,
  toYYMMDD,
} from "../../../commen/funtions/rejex";

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
  const navigate = useNavigate();
  const containerRef = useRef(null);
  console.log(containerRef, "Reached bottom");
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();
  const {
    setWebNotificationData,
    webNotificationData,
    markAsReadNotificationState,
    setMarkAsReadNotificationState,
  } = useWebNotification();
  const { callApi } = useApi();
  // Component State
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hovered, setHovered] = useState(false);

  const [hasFetched, setHasFetched] = useState(false); // prevent duplicate fetch
  const [hasMore, setHasMore] = useState(true); // stop when no more data
  const [loadingMore, setLoadingMore] = useState(false); // 👈 to control Spin

  /**
   * Calculate the number of unread notifications
   * @type {number}
   */

  // 🔹 Extract notifications safely
  const notifications = webNotificationData?.notifications || [];

  // 🔹 Calculate unread count directly from API data
  const unreadCount = webNotificationData?.unReadCount || 0;

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

  const buildNotificationObject = (notification) => {
    const {
      notificationID,
      notificationActionName,
      description,
      sentDate,
      sentTime,
      isRead,
    } = notification || {};

    const formatNotificationTime = () => {
      // 🧠 If sentDate and sentTime exist separately, combine them
      if (sentDate && sentTime) {
        const formattedDateTime = `${sentDate} ${sentTime}`;
        return formatApiDateTime(formattedDateTime);
      }

      // 🧠 Fallback (no date info)
      return "";
    };

    return {
      id: notificationID,
      title: notificationActionName,
      description,
      time: formatNotificationTime(),
      type: "success",
      read: isRead,
    };
  };

  // 🔹 Mark all notifications as read when dropdown closes or user clicks anywhere
  const markAllAsRead = async () => {
    if (!unreadCount) return;

    try {
      const currentDateTime = getCurrentDateTimeMarkAsReadNotification();
      const requestdata = {
        ReadOnDateTime: currentDateTime,
      };

      console.log(requestdata, "CHeckecnecnecln");

      await MarkNotificationAsReadRequest({
        callApi,
        showNotification,
        showLoader,
        requestdata,
        navigate,
      });

      // Update local data
      setWebNotificationData((prev = {}) => ({
        ...prev,
        unReadCount: 0,
        notifications: (prev.notifications || []).map((n) => ({
          ...n,
          isRead: true,
        })),
      }));

      // Update context state
      setMarkAsReadNotificationState(true);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  // 🔹 React when the context triggers mark-as-read
  useEffect(() => {
    if (markAsReadNotificationState) {
      markAllAsRead();
      setMarkAsReadNotificationState(false); // reset state
    }
  }, [markAsReadNotificationState]);

  // 🔹 Scroll handler
  const handleScroll = async () => {
    if (!containerRef.current || hasFetched || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;

    // 🔹 Detect if user scrolled to bottom
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      console.log("Reached bottom of dropdown");

      setHasFetched(true);
      setLoadingMore(true); // 👈 show loader

      try {
        const currentLength = webNotificationData?.notifications?.length || 0;

        // 🔹 Call your pagination API
        const response = await GetUserWebNotificationRequest({
          callApi,
          showNotification,
          showLoader,
          requestdata: {
            sRow: currentLength,
            eRow: 10, // next 10 records
          },
          navigate,
        });

        const newData = response?.notifications || [];

        // 🔹 Merge new data with old data
        if (newData.length > 0) {
          setWebNotificationData((prev) => ({
            ...prev,
            notifications: [...(prev?.notifications || []), ...newData],
          }));
        } else {
          setHasMore(false); // 👈 no more records
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setHasFetched(false);
        setLoadingMore(false); // 👈 hide loader
      }
    }
  };

  // ✅ attach/detach scroll listener instantly
  useEffect(() => {
    if (dropdownOpen && containerRef.current) {
      containerRef.current.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.removeEventListener("scroll", handleScroll);
      }
    };
  }, [dropdownOpen, hasFetched, hasMore]);

  return (
    <Dropdown
      trigger={["click"]}
      placement="bottomRight"
      onOpenChange={(open) => {
        setDropdownOpen(open);
        // When it closes, mark all as read (optional)
        if (!open) setMarkAsReadNotificationState(true);
      }}
      getPopupContainer={(trigger) => trigger.parentElement}
      overlayClassName={styles["dropdown-overlay"]}
      popupRender={(menu) => (
        <>
          <div className={styles["dropdown-header"]}>Notifications</div>

          {/* ✅ only ONE ref and correct scrollable div */}
          <div
            ref={containerRef}
            className={
              notifications.length === 0
                ? `${styles["no-notifications-dropdown"]}`
                : `${styles["custom-dropdown-wrapper"]}`
            }
          >
            {notifications.length > 0 ? (
              <>
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.notificationID}
                    notification={buildNotificationObject(notification)}
                    getNotificationIcon={getNotificationIcon}
                  />
                ))}

                {loadingMore && (
                  <div style={{ textAlign: "center", padding: "10px" }}>
                    <Spin size="small" />
                  </div>
                )}

                {!hasMore && (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "8px",
                      color: "#888",
                    }}
                  >
                    No more notifications
                  </div>
                )}
              </>
            ) : (
              <>
                <img src={NotificationBellDarkIcon} width={45} height={45}/>
                <div className={styles["no-notification-text"]}>
                  No Notification Available
                </div>
              </>
            )}
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
            draggable={false}
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
