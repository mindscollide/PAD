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

const { Text } = Typography;

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
  Underdevelopment:HistoryRecordIcon,
};

const EmptyState = ({
  type = "default",
  message,
  description,
  actionText,
  onAction,
  style,
}) => {
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
    Underdevelopment:"currently under development",
  };

  const displayMessage =
    message || defaultMessages[type] || "No data available";
  const IconSrc = iconComponents[type];
  const isImage = typeof IconSrc === "string" || IconSrc instanceof String;

  return (
    <Empty
      image={
        isImage ? (
          <img
            src={IconSrc}
            alt={displayMessage}
            className={styles.emptyIcon}
          />
        ) : (
          <FileSearchOutlined className={styles.emptyIcon} />
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
