/**
 * @file utils.js
 * @description Utility functions and column definitions for the Rejected Requests tab
 * in the Admin "Manage Users" module.
 */

import { Button, Tooltip } from "antd";
import moment from "moment";

// 🔹 Assets (sort icons)
import ArrowDown from "../../../../assets/img/arrow-down-dark.png";
import ArrowUp from "../../../../assets/img/arrow-up-dark.png";
import DefaultColumnArrow from "../../../../assets/img/default-colum-arrow.png";

/* -------------------------------------------------------------------------------------------------
 * 🔹 buildApiRequest
 * -------------------------------------------------------------------------------------------------
 */

/**
 * Builds the API request payload for fetching rejected user registration requests.
 *
 * @function buildApiRequest
 * @param {Object} [searchState={}] - Search state from context or component.
 * @param {string} [searchState.employeeName] - Filter by employee name.
 * @param {string} [searchState.emailAddress] - Filter by email address.
 * @param {string} [searchState.departmentName] - Filter by department.
 * @param {number|string} [searchState.pageNumber] - Current page offset.
 * @param {number|string} [searchState.pageSize] - Page size (number of records to fetch).
 * @returns {Object} Formatted API payload object.
 *
 * @example
 * const payload = buildApiRequest({ employeeName: "Ali", pageNumber: 1 });
 */
export const buildApiRequest = (searchState = {}) => ({
  EmployeeName: searchState.employeeName,
  EmailAddress: searchState.emailAddress,
  DepartmentName: searchState.departmentName,
  PageNumber: Number(searchState.pageNumber) || 0,
  Length: Number(searchState.pageSize) || 10,
});

/* -------------------------------------------------------------------------------------------------
 * 🔹 getSortIcon
 * -------------------------------------------------------------------------------------------------
 */

/**
 * Renders the appropriate sort icon based on column sorting state.
 *
 * @function getSortIcon
 * @param {string} columnKey - The key of the column being sorted.
 * @param {Object} sortedInfo - The current sorter information from Ant Design Table.
 * @returns {JSX.Element} Sort icon image element.
 */
const getSortIcon = (columnKey, sortedInfo) => {
  if (sortedInfo?.columnKey === columnKey) {
    // 🔸 Active sorted column
    return sortedInfo.order === "ascend" ? (
      <img
        draggable={false}
        src={ArrowDown}
        alt="Ascending"
        className="custom-sort-icon"
      />
    ) : (
      <img
        draggable={false}
        src={ArrowUp}
        alt="Descending"
        className="custom-sort-icon"
      />
    );
  }

  // 🔸 Default (unsorted) column
  return (
    <img
      draggable={false}
      src={DefaultColumnArrow}
      alt="Default Sort"
      className="custom-sort-icon"
    />
  );
};

/* -------------------------------------------------------------------------------------------------
 * 🔹 getPendingUserColumns
 * -------------------------------------------------------------------------------------------------
 */

/**
 * Defines column configuration for the "Rejected Requests" Ant Design table.
 *
 * @function getPendingUserColumns
 * @param {Object} params
 * @param {Object} [params.sortedInfo={}] - Current sorter info to control UI icons and order.
 * @param {Function} params.setViewModal - Function to open the "View Details" modal with record data.
 * @returns {Array<Object>} Column configuration array for Ant Design Table.
 */
export const getPendingUserColumns = ({
  sortedInfo = {},
  setViewModal,
  setViewDetailRejectedModal,
}) => [
  /**
   * 🧱 Employee ID Column
   */
  {
    title: (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        Employee ID {getSortIcon("userRegistrationRequestID", sortedInfo)}
      </div>
    ),
    dataIndex: "userRegistrationRequestID",
    key: "userRegistrationRequestID",
    width: 120,
    ellipsis: true,
    sorter: (a, b) => a.userRegistrationRequestID - b.userRegistrationRequestID,
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo.columnKey === "userRegistrationRequestID"
        ? sortedInfo.order
        : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text) => (
      <Tooltip title={text}>
        <span>{text || "—"}</span>
      </Tooltip>
    ),
  },

  /**
   * 🧱 Employee Name Column
   */
  {
    title: (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        Employee Name {getSortIcon("fullName", sortedInfo)}
      </div>
    ),
    dataIndex: "fullName",
    key: "fullName",
    width: 180,
    ellipsis: true,
    defaultSortOrder: "ascend",
    sorter: (a, b) => a.fullName.localeCompare(b.fullName),
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo.columnKey === "fullName" ? sortedInfo.order : "ascend",
    showSorterTooltip: false,
    sortIcon: () => null,
  },

  /**
   * 🧱 Email Address Column
   */
  {
    title: (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        Email Address {getSortIcon("email", sortedInfo)}
      </div>
    ),
    dataIndex: "email",
    key: "email",
    width: 220,
    ellipsis: true,
    sorter: (a, b) => a.email.localeCompare(b.email),
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo.columnKey === "email" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
  },

  /**
   * 🧱 Department Column
   */
  {
    title: (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        Department {getSortIcon("departmentName", sortedInfo)}
      </div>
    ),
    dataIndex: "departmentName",
    key: "departmentName",
    width: 160,
    ellipsis: true,
    sorter: (a, b) => a.departmentName.localeCompare(b.departmentName),
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo.columnKey === "departmentName" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
  },

  /**
   * 🧱 Last Request Date Column
   */
  {
    title: (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        Last Request Date {getSortIcon("lastRequestDate", sortedInfo)}
      </div>
    ),
    dataIndex: "lastRequestDate",
    key: "lastRequestDate",
    width: 150,
    ellipsis: true,
    render: (date) => (date ? moment(date).format("YYYY-MM-DD") : "—"),
    sorter: (a, b) => new Date(a.lastRequestDate) - new Date(b.lastRequestDate),
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo.columnKey === "lastRequestDate" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
  },

  /**
   * 🧱 Last Rejection Date Column
   */
  {
    title: (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        Last Rejection Date {getSortIcon("lastRejectionDate", sortedInfo)}
      </div>
    ),
    dataIndex: "lastRejectionDate",
    key: "lastRejectionDate",
    width: 160,
    ellipsis: true,
    render: (date) => (date ? moment(date).format("YYYY-MM-DD") : "—"),
    sorter: (a, b) =>
      new Date(a.lastRejectionDate) - new Date(b.lastRejectionDate),
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo.columnKey === "lastRejectionDate" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
  },

  /**
   * 🧱 Rejection Count Column
   */
  {
    title: (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        Rejection Count {getSortIcon("rejectedCount", sortedInfo)}
      </div>
    ),
    dataIndex: "rejectedCount",
    key: "rejectedCount",
    width: 150,
    ellipsis: true,
    sorter: (a, b) => a.rejectedCount - b.rejectedCount,
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo.columnKey === "rejectedCount" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
  },

  /**
   * 🧱 Action Column
   */
  {
    title: "Action",
    key: "action",
    width: 120,
    fixed: "right",
    render: (_, record) => (
      <Button
        type="link"
        onClick={() => {
          setViewModal(record);
          setViewDetailRejectedModal(true);
        }}
        style={{ padding: 0 }}
      >
        View Details
      </Button>
    ),
  },
];
