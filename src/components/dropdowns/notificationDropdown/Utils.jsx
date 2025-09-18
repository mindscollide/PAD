import React from "react";
import styles from "./notificationDropdown.module.css";

const NotificationItem = ({ notification, getNotificationIcon }) => {
  return (
    <div key={notification.id} className={styles["notification-item"]}>
      {/* Notification Icon */}
      <div className={styles["notification-icon-div"]}>
        <img
          draggable={false}
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
        <div className={styles["notification-time"]}>{notification.time}</div>
      </div>
    </div>
  );
};

export default NotificationItem;
