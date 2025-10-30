import React from "react";
import { Checkbox, Tooltip } from "antd";
import styles from "./users.module.css";
import ArrowUP from "../../../../../assets/img/arrow-up-dark.png";
import ArrowDown from "../../../../../assets/img/arrow-down-dark.png";
import DefaultColumArrow from "../../../../../assets/img/default-colum-arrow.png";
import { formatApiDateTime } from "../../../../../common/funtions/rejex";

export const buildApiRequest = (searchState = {}) => ({
  EmployeeName: searchState.employeeName || "",
  EmailAddress: searchState.emailAddress || "",
  Designation: searchState.designation || "",
  DepartmentName: searchState.departmentName || "",
  EmployeeID: searchState.email || 0,
  PageNumber: Number(searchState.pageNumber) || 0,
  Length: Number(searchState.pageSize) || 10,
});

// ===== Custom Sort Icons =====
export const getSortIcon = (columnKey, sortedInfo) => {
  if (sortedInfo?.columnKey === columnKey) {
    return sortedInfo.order === "ascend" ? (
      <img
        draggable={false}
        src={ArrowDown}
        alt="Asc"
        className={styles["custom-sort-icon"]}
      />
    ) : (
      <img
        draggable={false}
        src={ArrowUP}
        alt="Desc"
        className={styles["custom-sort-icon"]}
      />
    );
  }
  return (
    <img
      draggable={false}
      src={DefaultColumArrow}
      alt="Default"
      className={styles["custom-sort-icon"]}
    />
  );
};

// ===== Header Helper =====
export const withSortIcon = (label, columnKey, sortedInfo) => (
  <div className={styles["table-header-wrapper"]}>
    <span className={styles["table-header-text"]}>{label}</span>
    <span className={styles["table-header-icon"]}>
      {getSortIcon(columnKey, sortedInfo)}
    </span>
  </div>
);

/**
 * 🔹 Returns column configuration for Users Table (used in Assign Policy / Group Policy)
 * @param {Object} params
 * @param {Object} params.sortedInfo - current sorting state
 * @param {Function} params.handleSelectChange - checkbox handler
 * @param {Array} params.tabesFormDataofAdminGropusAndPolicy - selected employee IDs
 * @param {Array} params.disabledEmployees - employees who already have a policy
 */
/**
 * @param {Object} params
 * @param {Object} params.sortedInfo - current sorting state
 * @param {Function} params.handleSelectChange - checkbox selection handler
 * @param {Array} params.tabesFormDataofAdminGropusAndPolicy - selected employee IDs
 */
export const getUserColumns = ({
  sortedInfo = {},
  handleSelectChange,
  tabesFormDataofAdminGropusAndPolicy = [],
  currentPolicyID = -1,
}) => [
  {
    title: "",
    dataIndex: "employeeID",
    key: "employeeID",
    width: "8%",
    render: (_, record) => {
      const isDisabled =
        currentPolicyID !== -1
          ? record?.isDisable
            ? currentPolicyID === record?.groupPolicyID
              ? false
              : true
            : false
          : record?.isDisable;
      const tooltipTitle = isDisabled
        ? record?.groupPolicyTitle
          ? `"${record.groupPolicyTitle} "Already assigned to this user `
          : "Already assigned to a group policy"
        : "";
      return (
        <Tooltip title={tooltipTitle} placement="topLeft">
          <Checkbox
            checked={tabesFormDataofAdminGropusAndPolicy?.users.includes(
              record.employeeID
            )}
            disabled={isDisabled}
            onChange={(e) => handleSelectChange(e, record)}
            className="custom-broker-option-group-policies"
          />
        </Tooltip>
      );
    },
  },
  {
    title: withSortIcon("Employee ID", "employeeID", sortedInfo),
    dataIndex: "employeeID",
    key: "employeeID",
    sorter: (a, b) => a.employeeID - b.employeeID,
    sortOrder: sortedInfo?.columnKey === "employeeID" ? sortedInfo.order : null,
    sortDirections: ["ascend", "descend"],
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text, record) => {
      const isDisabled =
        currentPolicyID !== -1
          ? record?.isDisable
            ? currentPolicyID === record?.groupPolicyID
              ? false
              : true
            : false
          : record?.isDisable;

      const tooltipTitle = isDisabled
        ? record?.groupPolicyTitle
          ? `"${record.groupPolicyTitle} "Already assigned to this user `
          : "Already assigned to a group policy"
        : "";

      return (
        <Tooltip
          title={tooltipTitle}
          placement="topLeft"
          mouseEnterDelay={0.3}
          overlayStyle={{ whiteSpace: "pre-line" }}
        >
          <span
            style={{
              opacity: isDisabled ? 0.6 : 1,
              cursor: isDisabled ? "not-allowed" : "default",
            }}
          >
            {text}
          </span>
        </Tooltip>
      );
    },
  },
  {
    title: withSortIcon("Employee Name", "employeeName", sortedInfo),
    dataIndex: "employeeName",
    key: "employeeName",
    sorter: (a, b) => a.employeeName.localeCompare(b.employeeName),
    sortOrder:
      sortedInfo?.columnKey === "employeeName" ? sortedInfo.order : null,
    sortDirections: ["ascend", "descend"],
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text, record) => {
      const isDisabled =
        currentPolicyID !== -1
          ? record?.isDisable
            ? currentPolicyID === record?.groupPolicyID
              ? false
              : true
            : false
          : record?.isDisable;
      const tooltipTitle = isDisabled
        ? record?.groupPolicyTitle
          ? `"${record.groupPolicyTitle} "Already assigned to this user `
          : "Already assigned to a group policy"
        : "";

      return (
        <Tooltip title={tooltipTitle} placement="topLeft" mouseEnterDelay={0.3}>
          <span
            style={{
              opacity: isDisabled ? 0.6 : 1,
              cursor: isDisabled ? "not-allowed" : "default",
            }}
          >
            {text}
          </span>
        </Tooltip>
      );
    },
  },
  {
    title: withSortIcon("Designation", "designation", sortedInfo),
    dataIndex: "designation",
    key: "designation",
    sorter: (a, b) => a.designation.localeCompare(b.designation),
    sortOrder:
      sortedInfo?.columnKey === "designation" ? sortedInfo.order : null,
    sortDirections: ["ascend", "descend"],
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text, record) => {
      const isDisabled =
        currentPolicyID !== -1
          ? record?.isDisable
            ? currentPolicyID === record?.groupPolicyID
              ? false
              : true
            : false
          : record?.isDisable;

      const tooltipTitle = isDisabled
        ? record?.groupPolicyTitle
          ? `"${record.groupPolicyTitle} "Already assigned to this user `
          : "Already assigned to a group policy"
        : "";

      return (
        <Tooltip title={tooltipTitle} placement="topLeft" mouseEnterDelay={0.3}>
          <span
            style={{
              opacity: isDisabled ? 0.6 : 1,
              cursor: isDisabled ? "not-allowed" : "default",
            }}
          >
            {text}
          </span>
        </Tooltip>
      );
    },
  },
  {
    title: withSortIcon("Email Address", "emailAddress", sortedInfo),
    dataIndex: "emailAddress",
    key: "emailAddress",
    sorter: (a, b) => a.emailAddress.localeCompare(b.emailAddress),
    sortOrder:
      sortedInfo?.columnKey === "emailAddress" ? sortedInfo.order : null,
    sortDirections: ["ascend", "descend"],
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text, record) => {
      const isDisabled =
        currentPolicyID !== -1
          ? record?.isDisable
            ? currentPolicyID === record?.groupPolicyID
              ? false
              : true
            : false
          : record?.isDisable;

      const tooltipTitle = isDisabled
        ? record?.groupPolicyTitle
          ? `"${record.groupPolicyTitle} "Already assigned to this user `
          : "Already assigned to a group policy"
        : "";

      return (
        <Tooltip title={tooltipTitle} placement="topLeft" mouseEnterDelay={0.3}>
          <span
            style={{
              opacity: isDisabled ? 0.6 : 1,
              cursor: isDisabled ? "not-allowed" : "default",
            }}
          >
            {text}
          </span>
        </Tooltip>
      );
    },
  },
  {
    title: "Policy Assigned Date",
    dataIndex: "policyAssignedDate",
    key: "policyAssignedDate",
    render: (date, record) => {
      const isDisabled =
        currentPolicyID !== -1
          ? record?.isDisable
            ? currentPolicyID === record?.groupPolicyID
              ? false
              : true
            : false
          : record?.isDisable;

      const tooltipTitle = isDisabled
        ? record?.groupPolicyTitle
          ? `"${record.groupPolicyTitle} "Already assigned to this user `
          : "Already assigned to a group policy"
        : "";
      const dateandtime =
        [record?.policyAssignedDate, record?.policyAssignedTime]
          .filter(Boolean)
          .join(" ") || "—";
      return (
        <Tooltip title={tooltipTitle} placement="topLeft" mouseEnterDelay={0.3}>
          <span
            style={{
              opacity: isDisabled ? 0.6 : 1,
              cursor: isDisabled ? "not-allowed" : "default",
            }}
          >
            {formatApiDateTime(dateandtime)}
          </span>
        </Tooltip>
      );
    },
  },
];
