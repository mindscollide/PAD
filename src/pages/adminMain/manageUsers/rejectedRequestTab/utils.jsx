/**
 * @file utils.js
 * @description Utility functions and column definitions for the Rejected Requests tab
 * in the Admin "Manage Users" module.
 */

import { Tooltip } from "antd";
import moment from "moment";

// 🔹 Assets (sort icons)
import ArrowDown from "../../../../assets/img/arrow-down-dark.png";
import ArrowUp from "../../../../assets/img/arrow-up-dark.png";
import DefaultColumnArrow from "../../../../assets/img/default-colum-arrow.png";
import { formatApiDateTime } from "../../../../common/funtions/rejex";
import { Button } from "../../../../components";

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
 */
const getSortIcon = (columnKey, sortedInfo) => {
  if (sortedInfo?.columnKey === columnKey) {
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
  return (
    <img
      draggable={false}
      src={DefaultColumnArrow}
      alt="Default Sort"
      className="custom-sort-icon"
    />
  );
};

/**
 * Defines columns for the "Rejected Requests" table.
 */
export const getPendingUserColumns = ({
  sortedInfo = {},
  handleViewNoteDetail,
}) => [
  // 🧱 Employee ID
  {
    title: (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        Employee ID {getSortIcon("userRegistrationRequestID", sortedInfo)}
      </div>
    ),
    dataIndex: "userRegistrationRequestID",
    key: "userRegistrationRequestID",
    width: 100,
    ellipsis: true,
    sorter: (a, b) =>
      (a.userRegistrationRequestID || 0) - (b.userRegistrationRequestID || 0),
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo.columnKey === "userRegistrationRequestID"
        ? sortedInfo.order
        : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text) => <Tooltip title={text || "—"}>{text || "—"}</Tooltip>,
  },

  // 🧱 Employee Name
  {
    title: (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        Employee Name {getSortIcon("fullName", sortedInfo)}
      </div>
    ),
    dataIndex: "fullName",
    key: "fullName",
    width: 120,
    ellipsis: true,
    sorter: (a, b) => (a.fullName || "").localeCompare(b.fullName || ""),
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo.columnKey === "fullName" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text) => <Tooltip title={text || "—"}>{text || "—"}</Tooltip>,
  },

  // 🧱 Email Address
  {
    title: (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        Email Address {getSortIcon("email", sortedInfo)}
      </div>
    ),
    dataIndex: "email",
    key: "email",
    width: 120,
    ellipsis: true,
    sorter: (a, b) => (a.email || "").localeCompare(b.email || ""),
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo.columnKey === "email" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text) => <Tooltip title={text || "—"}>{text || "—"}</Tooltip>,
  },

  // 🧱 Department
  {
    title: (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        Department Name{getSortIcon("departmentName", sortedInfo)}
      </div>
    ),
    dataIndex: "departmentName",
    key: "departmentName",
    width: 160,
    ellipsis: true,
    sorter: (a, b) =>
      (a.departmentName || "").localeCompare(b.departmentName || ""),
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo.columnKey === "departmentName" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text) => <Tooltip title={text || "—"}>{text || "—"}</Tooltip>,
  },

  // 🧱 Last Request Date
  {
    title: (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}
      >
        Last Request Date {getSortIcon("lastReqeustedDateandtime", sortedInfo)}
      </div>
    ),
    dataIndex: "lastReqeustedDateandtime",
    key: "lastReqeustedDateandtime",
    width: 160,
    align: "center",
    ellipsis: true,
    sorter: (a, b) => {
      const parseToDate = (val) => {
        if (!val) return new Date(0);
        const datePart = val.slice(0, 8);
        const timePart = val.slice(9).replace(/\s/g, "");
        if (datePart.length !== 8 || timePart.length !== 6) return new Date(0);

        const isoString = `${datePart.slice(0, 4)}-${datePart.slice(
          4,
          6
        )}-${datePart.slice(6, 8)}T${timePart.slice(0, 2)}:${timePart.slice(
          2,
          4
        )}:${timePart.slice(4, 6)}`;
        return new Date(isoString);
      };
      return (
        parseToDate(a.lastReqeustedDateandtime) -
        parseToDate(b.lastReqeustedDateandtime)
      );
    },
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo.columnKey === "lastReqeustedDateandtime"
        ? sortedInfo.order
        : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (_, record) => {
      const formatted = formatApiDateTime(record.lastReqeustedDateandtime);
      return (
        <Tooltip title={formatted}>
          <div style={{ textAlign: "center" }}>{formatted || "—"}</div>
        </Tooltip>
      );
    },
  },

  // 🧱 Last Rejection Date
  {
    title: (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}
      >
        Last Rejection Date{" "}
        {getSortIcon("lastRejectionDateandtime", sortedInfo)}
      </div>
    ),
    dataIndex: "lastRejectionDateandtime",
    key: "lastRejectionDateandtime",
    width: 160,
    align: "center",
    ellipsis: true,
    sorter: (a, b) => {
      const parseToDate = (val) => {
        if (!val) return new Date(0);
        const datePart = val.slice(0, 8);
        const timePart = val.slice(9).replace(/\s/g, "");
        if (datePart.length !== 8 || timePart.length !== 6) return new Date(0);

        const isoString = `${datePart.slice(0, 4)}-${datePart.slice(
          4,
          6
        )}-${datePart.slice(6, 8)}T${timePart.slice(0, 2)}:${timePart.slice(
          2,
          4
        )}:${timePart.slice(4, 6)}`;
        return new Date(isoString);
      };
      return (
        parseToDate(a.lastRejectionDateandtime) -
        parseToDate(b.lastRejectionDateandtime)
      );
    },
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo.columnKey === "lastRejectionDateandtime"
        ? sortedInfo.order
        : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (_, record) => {
      const formatted = formatApiDateTime(record.lastRejectionDateandtime);
      return (
        <Tooltip title={formatted}>
          <div style={{ textAlign: "center" }}>{formatted || "—"}</div>
        </Tooltip>
      );
    },
  },

  // 🧱 Rejection Count
  {
    title: (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}
      >
        Rejection Count {getSortIcon("rejectedCount", sortedInfo)}
      </div>
    ),
    dataIndex: "rejectedCount",
    key: "rejectedCount",
    width: 120,
    align: "center",
    ellipsis: true,
    sorter: (a, b) => (a.rejectedCount || 0) - (b.rejectedCount || 0),
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo.columnKey === "rejectedCount" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text) => {
      const value =
        typeof text === "number" ? String(text).padStart(2, "0") : text ?? "—";
      return (
        <Tooltip title={value}>
          <div style={{ textAlign: "center" }}>{value}</div>
        </Tooltip>
      );
    },
  },

  // 🧱 Action
  {
    title: (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Rejection Notes
      </div>
    ),
    key: "action",
    dataIndex: "action",
    width: 150,
    align: "center", // ✅ centers the cell content
    fixed: "right",
    render: (_, record) => (
      <div style={{ textAlign: "center" }}>
        <Button
          className="small-light-button"
          text="View Notes"
          onClick={() => handleViewNoteDetail(record)}
        />
      </div>
    ),
  },
];
