import React from "react";
import styles from "./notificationDropdown.module.css";

/**
 * Maps the raw `notificationActionName` (the backend's
 * WebNotificationActions enum name, e.g. "Trade_Approval_Escalated_HTA")
 * to the human-readable title this bell item should show. Wording sourced
 * from the SRS's "Notification Settings" section (SRS - PAD - Version
 * 3.0.md, per-role default notification type lists) wherever a direct
 * match exists; the rest follow the same phrasing convention for
 * consistency. Two notification types share an identical title across two
 * different recipients by design (e.g. both the Employee and the HTA see
 * "Trade Approval Request escalated") - the description text underneath
 * is what actually differs per recipient, matching how the SRS itself
 * lists these.
 */
const NOTIFICATION_TITLES = {
  Trade_Approva_Request: "Trade Approval Request sent for approval",
  Conducted_Transaction: "Transaction sent for verification",
  Upload_Portfolio: "Portfolio sent for verification",
  Portfolio_Recieved: "Portfolio received for verification",
  Trade_Approval_Recieved: "Trade Approval Request received for approval",
  Transaction_Recieved: "Transaction received for verification",
  Trade_Approval_Request_Approved: "Trade Approval Request approved",
  Trade_Approval_Request_Declined: "Trade Approval Request declined",
  Transaction_Marked_Compliant: "Transaction marked Compliant",
  Portfolio_Marked_Compliant: "Portfolio marked Compliant",
  Portfolio_Marked_NonCompliant: "Portfolio marked Non-Compliant",
  Transaction_Marked_NonCompliant: "Transaction marked Non-Compliant",
  Trade_Approval_Escalated_Employee: "Trade Approval Request escalated",
  Trade_Approval_Escalated_ApprovalAuthority:
    "Trade Approval Request escalated to HTA",
  Trade_Approval_Escalated_HTA: "Trade Approval Request escalated",
  Transaction_Escalated_Employee: "Transaction escalated",
  Transaction_Escalated_ComplianceOfficer: "Transaction escalated to HCA",
  Transaction_Escalated_HCA: "Transaction escalated",
  Portfolio_Escalated_Employee: "Portfolio escalated",
  Portfolio_Escalated_ComplianceOfficer: "Portfolio escalated to HCA",
  Portfolio_Escalated_HCA: "Portfolio escalated",
  New_Signup_Request: "New Signup Request",
};

/**
 * Fallback for any notificationActionName not in the map above (a future
 * type, or one added before this map is updated) - splits snake_case and
 * camelCase boundaries into a plain sentence instead of showing the raw
 * enum verbatim (e.g. "Trade_Approval_Escalated_ApprovalAuthority" ->
 * "Trade Approval Escalated Approval Authority"). Deliberately not used
 * for the 22 known types above, since this generic split can't reproduce
 * SRS-specific phrasing like "escalated to HTA" or fix the backend enum's
 * own typos ("Recieved", "Approva").
 */
const humanizeActionName = (actionName) =>
  (actionName || "")
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .trim();

const getNotificationTitle = (notificationActionName) =>
  NOTIFICATION_TITLES[notificationActionName] ||
  humanizeActionName(notificationActionName) ||
  "Notification";

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
            {getNotificationTitle(notification.title)}
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
