import ArrowUP from "../../../../assets/img/arrow-up-dark.png";
import ArrowDown from "../../../../assets/img/arrow-down-dark.png";
import DefaultColumArrow from "../../../../assets/img/default-colum-arrow.png";
import style from "./tradeApprovalRequest.module.css";

import { toYYMMDD } from "../../../../common/funtions/rejex";

/**
 * Utility: Build API request payload for GetAdminTradeApprovalRequestSummaryAPI
 * per API_Changes/2026-08-11_admin_reports_all_apis.md (dates default to
 * last 6 months on the backend if omitted).
 *
 * @param {Object} searchState - Current search/filter state
 * @returns {Object} API-ready payload
 */
export const buildApiRequest = (searchState = {}) => ({
  EmployeeName: searchState.employeeName || "",
  DepartmentName: searchState.departmentName || "",
  StartDate: searchState.startDate ? toYYMMDD(searchState.startDate) : "",
  EndDate: searchState.endDate ? toYYMMDD(searchState.endDate) : "",
  // (pageNumber - 1) * length on the backend - 0 (the search state's
  // initial value) resolves to page 1 the same as 1 would.
  PageNumber: Number(searchState.pageNumber) || 1,
  Length: Number(searchState.pageSize) || 10,
});

/**
 * ExportAdminTradeApprovalRequestSummary request payload - same filters
 * as buildApiRequest above, minus PageNumber/Length (an export always
 * returns the full matching set in one file, no pagination).
 */
export const buildExportRequest = (searchState = {}) => ({
  EmployeeName: searchState.employeeName || "",
  DepartmentName: searchState.departmentName || "",
  StartDate: searchState.startDate ? toYYMMDD(searchState.startDate) : "",
  EndDate: searchState.endDate ? toYYMMDD(searchState.endDate) : "",
});

/**
 * Maps GetAdminTradeApprovalRequestSummaryAPI records into a UI-friendly
 * format. Per-status columns always sum exactly to totalRequests.
 *
 * @param {Object|Array} res - API response ({records, totalRecords}) or a bare array
 * @returns {Array} Mapped list
 */
export const mapListData = (res = []) => {
  const records = Array.isArray(res) ? res : res?.records || [];

  if (!records.length) return [];

  return records.map((item) => ({
    key: item.employeeID,
    employeeID: item.employeeID,
    employeeName: item.employeeName || "",
    departmentName: item.departmentName || "",
    totalRequests: item.totalRequests || 0,
    pending: item.pending || 0,
    approved: item.approved || 0,
    declined: item.declined || 0,
    traded: item.traded || 0,
    notTraded: item.notTraded || 0,
    resubmitted: item.resubmitted || 0,
  }));
};

/**
 * Returns the appropriate sort icon based on current sort state
 *
 * @param {string} columnKey - The column's key
 * @param {object} sortedInfo - Current sort state from the table
 * @returns {JSX.Element} The sort icon
 */
const getSortIcon = (columnKey, sortedInfo) => {
  if (sortedInfo?.columnKey === columnKey) {
    return sortedInfo.order === "ascend" ? (
      <img draggable={false} src={ArrowDown} alt="Asc" className="custom-sort-icon" />
    ) : (
      <img draggable={false} src={ArrowUP} alt="Desc" className="custom-sort-icon" />
    );
  }
  return (
    <img draggable={false} src={DefaultColumArrow} alt="Default" className="custom-sort-icon" />
  );
};

// Helper for consistent column titles
const withSortIcon = (label, columnKey, sortedInfo, align = "left") => (
  <div
    className={style["table-header-wrapper"]}
    style={{
      justifyContent:
        align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start",
      textAlign: align,
    }}
  >
    <span className={style["table-header-text"]}>{label}</span>
    <span className={style["table-header-icon"]}>{getSortIcon(columnKey, sortedInfo)}</span>
  </div>
);

const numericSorter = (field) => (a, b) => Number(a[field] || 0) - Number(b[field] || 0);

export const getBorderlessTableColumns = ({ sortedInfo }) => [
  {
    title: withSortIcon("Employee ID", "employeeID", sortedInfo),
    dataIndex: "employeeID",
    key: "employeeID",
    align: "left",
    width: "10%",
    ellipsis: true,
    sorter: numericSorter("employeeID"),
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "employeeID" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (employeeID) => <span className="font-medium">{employeeID}</span>,
  },
  {
    title: withSortIcon("Employee Name", "employeeName", sortedInfo),
    dataIndex: "employeeName",
    key: "employeeName",
    align: "left",
    ellipsis: true,
    width: "14%",
    sorter: (a, b) => (a.employeeName || "").localeCompare(b.employeeName || ""),
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "employeeName" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text) => <span className="font-medium">{text}</span>,
  },
  {
    title: withSortIcon("Department", "departmentName", sortedInfo),
    dataIndex: "departmentName",
    key: "departmentName",
    align: "left",
    ellipsis: true,
    width: "14%",
    sorter: (a, b) => (a.departmentName || "").localeCompare(b.departmentName || ""),
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "departmentName" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text) => <span className="font-medium">{text}</span>,
  },
  {
    title: withSortIcon("Total Requests", "totalRequests", sortedInfo, "center"),
    dataIndex: "totalRequests",
    key: "totalRequests",
    align: "center",
    width: "10%",
    ellipsis: true,
    sorter: numericSorter("totalRequests"),
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "totalRequests" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (v) => <span className="font-medium">{v.toLocaleString()}</span>,
  },
  {
    title: withSortIcon("Pending", "pending", sortedInfo, "center"),
    dataIndex: "pending",
    key: "pending",
    align: "center",
    width: "8%",
    ellipsis: true,
    sorter: numericSorter("pending"),
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "pending" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (v) => <span className="font-medium">{v.toLocaleString()}</span>,
  },
  {
    title: withSortIcon("Approved", "approved", sortedInfo, "center"),
    dataIndex: "approved",
    key: "approved",
    align: "center",
    width: "8%",
    ellipsis: true,
    sorter: numericSorter("approved"),
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "approved" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (v) => <span className="font-medium">{v.toLocaleString()}</span>,
  },
  {
    title: withSortIcon("Declined", "declined", sortedInfo, "center"),
    dataIndex: "declined",
    key: "declined",
    align: "center",
    width: "8%",
    ellipsis: true,
    sorter: numericSorter("declined"),
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "declined" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (v) => <span className="font-medium">{v.toLocaleString()}</span>,
  },
  {
    title: withSortIcon("Traded", "traded", sortedInfo, "center"),
    dataIndex: "traded",
    key: "traded",
    align: "center",
    width: "8%",
    ellipsis: true,
    sorter: numericSorter("traded"),
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "traded" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (v) => <span className="font-medium">{v.toLocaleString()}</span>,
  },
  {
    title: withSortIcon("Not Traded", "notTraded", sortedInfo, "center"),
    dataIndex: "notTraded",
    key: "notTraded",
    align: "center",
    width: "8%",
    ellipsis: true,
    sorter: numericSorter("notTraded"),
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "notTraded" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (v) => <span className="font-medium">{v.toLocaleString()}</span>,
  },
  {
    title: withSortIcon("Resubmitted", "resubmitted", sortedInfo, "center"),
    dataIndex: "resubmitted",
    key: "resubmitted",
    align: "center",
    width: "10%",
    ellipsis: true,
    sorter: numericSorter("resubmitted"),
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "resubmitted" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (v) => <span className="font-medium">{v.toLocaleString()}</span>,
  },
];
