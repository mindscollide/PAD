import ArrowUP from "../../../../../assets/img/arrow-up-dark.png";
import ArrowDown from "../../../../../assets/img/arrow-down-dark.png";
import DefaultColumArrow from "../../../../../assets/img/default-colum-arrow.png";
import { Tag, Tooltip } from "antd";
import style from "./TradeApprovalRequest.module.css";

import { toYYMMDD } from "../../../../../common/funtions/rejex";

/**
 * Utility: Build API request payload for approval listing
 *
 * @param {Object} searchState - Current search/filter state
 * @param {Object} assetTypeListingData - Extra request metadata (optional)
 * @returns {Object} API-ready payload
 */
export const buildApiRequest = (searchState = {}) => ({
  StartDate: searchState.startDate ? toYYMMDD(searchState.startDate) : null,
  EndDate: searchState.endDate ? toYYMMDD(searchState.endDate) : null,
  EmployeeName: searchState.employeeName || "",
  DepartmentName: searchState.departmentName || "",
  PageNumber: Number(searchState.pageNumber) || 0,
  Length: Number(searchState.pageSize) || 10,
});

/**
 * Maps employee transaction data into a UI-friendly format
 *
 * @param {Object} getEmployeeTransactionReport - API response containing transactions
 * @returns {Array} Mapped transaction list
 */
export const mapEmployeeTransactionsReport = (
  myTradeApprovalLineManagerData = []
) => {
  const records = Array.isArray(myTradeApprovalLineManagerData)
    ? myTradeApprovalLineManagerData
    : myTradeApprovalLineManagerData?.records || [];

  if (!records.length) return [];

  return records.map((item) => ({
    key: item.employeeID,
    employeeID: item.employeeID,
    employeeName: item.employeeName || "",
    department: item.department || "",
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
      <img
        draggable={false}
        src={ArrowDown}
        alt="Asc"
        className="custom-sort-icon"
      />
    ) : (
      <img
        draggable={false}
        src={ArrowUP}
        alt="Desc"
        className="custom-sort-icon"
      />
    );
  }
  return (
    <img
      draggable={false}
      src={DefaultColumArrow}
      alt="Default"
      className="custom-sort-icon"
    />
  );
};

// Helper for consistent column titles
const withSortIcon = (label, columnKey, sortedInfo, align = "left") => (
  <div
    className={style["table-header-wrapper"]}
    style={{
      justifyContent:
        align === "center"
          ? "center"
          : align === "right"
          ? "flex-end"
          : "flex-start",
      textAlign: align,
    }}
  >
    <span className={style["table-header-text"]}>{label}</span>
    <span className={style["table-header-icon"]}>
      {getSortIcon(columnKey, sortedInfo)}
    </span>
  </div>
);

export const getBorderlessTableColumns = ({ sortedInfo }) => [
  {
    title: withSortIcon("Employee ID", "employeeID", sortedInfo),
    dataIndex: "employeeID",
    key: "employeeID",
    align: "left",
    width: "10%",
    ellipsis: true,
    sorter: (a, b) =>
      parseInt(a.employeeID.replace(/[^\d]/g, ""), 10) -
      parseInt(b.employeeID.replace(/[^\d]/g, ""), 10),
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "employeeID" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (employeeID) => {
      return <span className="font-medium">{employeeID}</span>;
    },
  },
  {
    title: withSortIcon("Employee Name", "employeeName", sortedInfo, "center"),
    dataIndex: "employeeName",
    key: "employeeName",
    align: "center",
    ellipsis: true,
    width: "12%",
    sorter: (a, b) => a.employeeName - b.employeeName,
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "employeeName" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (q) => <span className="font-medium">{q.toLocaleString()}</span>,
  },
  {
    title: withSortIcon("Department", "department", sortedInfo),
    dataIndex: "department",
    key: "department",
    align: "center",
    ellipsis: true,
    width: "12%",
    sorter: (a, b) => a.department - b.department,
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "department" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (q) => <span className="font-medium">{q.toLocaleString()}</span>,
  },
  {
    title: withSortIcon(
      "Total Requests",
      "totalRequests",
      sortedInfo,
      "center"
    ),
    dataIndex: "totalRequests",
    key: "totalRequests",
    align: "center",
    width: "10%",
    ellipsis: true,
    sorter: (a, b) =>
      parseInt(a.totalRequests.replace(/[^\d]/g, ""), 10) -
      parseInt(b.totalRequests.replace(/[^\d]/g, ""), 10),
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "totalRequests" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (totalRequests) => {
      return (
        <span className="font-medium">{totalRequests.toLocaleString()}</span>
      );
    },
  },
  {
    title: withSortIcon("Pending", "pending", sortedInfo, "center"),
    dataIndex: "pending",
    key: "pending",
    align: "center",
    width: "8%",
    ellipsis: true,
    sorter: (a, b) =>
      parseInt(a.pending.replace(/[^\d]/g, ""), 10) -
      parseInt(b.pending.replace(/[^\d]/g, ""), 10),
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "pending" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (pending) => {
      return <span className="font-medium">{pending.toLocaleString()}</span>;
    },
  },
  {
    title: withSortIcon("Approved", "approved", sortedInfo, "center"),
    dataIndex: "approved",
    key: "approved",
    align: "center",
    width: "8%",
    ellipsis: true,
    sorter: (a, b) =>
      parseInt(a.approved.replace(/[^\d]/g, ""), 10) -
      parseInt(b.approved.replace(/[^\d]/g, ""), 10),
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "approved" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (approved) => {
      return <span className="font-medium">{approved.toLocaleString()}</span>;
    },
  },
  {
    title: withSortIcon("Declined", "declined", sortedInfo, "center"),
    dataIndex: "declined",
    key: "declined",
    align: "center",
    width: "8%",
    ellipsis: true,
    sorter: (a, b) =>
      parseInt(a.declined.replace(/[^\d]/g, ""), 10) -
      parseInt(b.declined.replace(/[^\d]/g, ""), 10),
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "declined" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (declined) => {
      return <span className="font-medium">{declined.toLocaleString()}</span>;
    },
  },
  {
    title: withSortIcon("Traded", "traded", sortedInfo, "center"),
    dataIndex: "traded",
    key: "traded",
    align: "center",
    width: "8%",
    ellipsis: true,
    sorter: (a, b) =>
      parseInt(a.traded.replace(/[^\d]/g, ""), 10) -
      parseInt(b.traded.replace(/[^\d]/g, ""), 10),
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "traded" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (traded) => {
      return <span className="font-medium">{traded.toLocaleString()}</span>;
    },
  },
  {
    title: withSortIcon("Not Traded", "notTraded", sortedInfo, "center"),
    dataIndex: "notTraded",
    key: "notTraded",
    align: "center",
    width: "8%",
    ellipsis: true,
    sorter: (a, b) =>
      parseInt(a.notTraded.replace(/[^\d]/g, ""), 10) -
      parseInt(b.notTraded.replace(/[^\d]/g, ""), 10),
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "notTraded" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (notTraded) => {
      return <span className="font-medium">{notTraded.toLocaleString()}</span>;
    },
  },
  {
    title: withSortIcon("Resubmitted", "resubmitted", sortedInfo, "center"),
    dataIndex: "resubmitted",
    key: "resubmitted",
    align: "center",
    width: "10%",
    ellipsis: true,
    sorter: (a, b) =>
      parseInt(a.resubmitted.replace(/[^\d]/g, ""), 10) -
      parseInt(b.resubmitted.replace(/[^\d]/g, ""), 10),
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "resubmitted" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (resubmitted) => {
      return (
        <span className="font-medium">{resubmitted.toLocaleString()}</span>
      );
    },
  },
];
