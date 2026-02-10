// src/components/EmptyState/EmptyState.jsx

import React from "react";
import { Empty, Typography, Button } from "antd";
import { FileSearchOutlined } from "@ant-design/icons";
import styles from "./emptyState.module.css";

// Image Imports
import UsersIcon from "../../assets/img/users-icon.png";
import ActionsTakenIcon from "../../assets/img/action-taken-icon.png";
import ApprovalsIcon from "../../assets/img/approval-icon.png";
import AuditIcon from "../../assets/img/audit-icon.png";
import HistoryRecordIcon from "../../assets/img/history-record-icon.png";
import PendingApprovalIcon from "../../assets/img/pending-approval-icon.png";
import PolicyIcon from "../../assets/img/policy-icon.png";
import PortfolioIcon from "../../assets/img/portfolio-icon.png";
import ReconcileIcon from "../../assets/img/reconcile-icon.png";
import ReportsIcon from "../../assets/img/reports-icon.png";
import RequestPendingIcon from "../../assets/img/request-pendinding-icon.png";
import TransactionsIcon from "../../assets/img/transactions-icon.png";
import PoliciesTabIcon from "../../assets/img/Group-creation-cancle.png";
import EmptyBroker from "../../assets/img/EmptyBroker-icon.png";
import Instrument from "../../assets/img/big_Instrument_icon.png";
import Broker from "../../assets/img/big_Broker_icon.png";
import Group from "../../assets/img/Group-created.png";

const { Text } = Typography;

/**
 * Mapping between empty state types and their corresponding icons.
 */
const iconComponents = {
  approvals: ApprovalsIcon,
  transactions: TransactionsIcon,
  portfolio: PortfolioIcon,
  pending: PendingApprovalIcon,
  action: ActionsTakenIcon,
  history: HistoryRecordIcon,
  request: RequestPendingIcon,
  reconcile: ReconcileIcon,
  reports: ReportsIcon,
  breaches: PolicyIcon,
  audit: AuditIcon,
  users: UsersIcon,
  underdevelopment: HistoryRecordIcon,
  policiestab: PoliciesTabIcon,
  closingupcoming: HistoryRecordIcon,
  employeebroker: EmptyBroker,
  "co-portfolio-history": PortfolioIcon,
  "co-date-wise-transaction-report": TransactionsIcon,
  "co-overdue-verifications": ReportsIcon,
  "co-transactions-summary-report": PendingApprovalIcon,
  "hta-policy-breaches-reports": PortfolioIcon,
  "hta-trade-approval-requests": TransactionsIcon,
  "hta-tat-reports": AuditIcon,
  "hta-pending-requests": PendingApprovalIcon,
  instruments: Instrument,
  brokers: Broker,
  grouppolicies: Group,
};

/**
 * Default display messages for each empty state type.
 */
const defaultMessages = {
  approvals: "No Approvals Yet",
  transactions: "No Transactions Found",
  portfolio: "Portfolio is Empty",
  pending: "No Pending Approvals",
  action: "No Actions Taken",
  history: "No History Recorded",
  request: "No Requests Pending",
  reconcile: "Nothing to Reconcile",
  reports: "No Reports Available",
  breaches: "No Policy Breaches",
  audit: "No Audit Records",
  users: "No Users Found",
  underdevelopment: "Currently under development",
  policiestab: "No Policies Found",
  policies: "No Policy Assign",
  closingUpcoming: "Upcoming Instrument",
  employeebroker: "No Brokers Added Yet",
  "co-portfolio-history": "No Portfolio History Reports",
  "co-date-wise-transaction-report": "No Date Wise Transaction History Reports",
  "co-overdue-verifications": "No Overdue Verifications Reports",
  "co-transactions-summary-report": "No Transactions summary Reports",
  "hta-policy-breaches-reports": "No Policy Breaches Reports",
  "hta-trade-approval-requests": "No Trade Approval Requests Reports",
  "hta-tat-reports": "No TAT Approval Request Reports",
  "hta-pending-requests": "No Pending Requests Reports",
  instruments: "No Instruments",
  brokers: "No Brokers",
  grouppolicies: "No Group Policies Created",
};

/**
 * 🔹 EmptyState Component
 *
 * A reusable component that displays an empty state with an icon, a message,
 * an optional description, and an optional action button.
 *
 * @component
 *
 * @param {Object} props - Component props
 * @param {string} [props.type="default"] - Type of empty state (used to determine icon & message)
 * @param {string} [props.message] - Custom message (overrides default)
 * @param {string} [props.description] - Optional secondary description text
 * @param {string} [props.actionText] - Text for the action button
 * @param {Function} [props.onAction] - Click handler for the action button
 * @param {Object} [props.style] - Custom inline styles for the container
 *
 * @example
 * <EmptyState type="portfolio" />
 * <EmptyState type="users" description="Invite users to get started" />
 * <EmptyState
 *   type="reports"
 *   actionText="Generate Report"
 *   onAction={() => console.log("Generate clicked")}
 * />
 */
const EmptyState = ({
  type = "default",
  message,
  description,
  actionText,
  onAction,
  style,
}) => {
  // Normalize type to match keys in the maps
  console.log("empty img", style);
  const normalizedType = type?.toLowerCase();
  console.log("empty img", normalizedType);
  // Pick default or provided message
  const displayMessage =
    message || defaultMessages[normalizedType] || "No data available";
  console.log("empty img", displayMessage);

  // Pick icon based on type
  const IconSrc = iconComponents[normalizedType];
  console.log("empty IconSrc", displayMessage);
  const isImage = typeof IconSrc === "string" || IconSrc instanceof String;
  console.log("empty IconSrc", displayMessage);

  return (
    <Empty
      image={
        isImage ? (
          <img
            draggable={false}
            src={IconSrc}
            alt={displayMessage}
            className={styles.emptyIcon}
          />
        ) : (
          <FileSearchOutlined
            className={
              displayMessage !== "No Policy Assign"
                ? styles.emptyIcon
                : styles.emptyPolicyIcon
            }
          />
        )
      }
      description={
        <>
          <Text className={styles.messageText}>{displayMessage}</Text>
          {description && (
            <Text type="secondary" className={styles.descriptionText}>
              {description}
            </Text>
          )}
        </>
      }
      className={styles.emptyContainer}
      style={style}
    >
      {actionText && onAction && (
        <Button onClick={onAction} className={"small-dark-button"}>
          {actionText}
        </Button>
      )}
    </Empty>
  );
};

export default EmptyState;
