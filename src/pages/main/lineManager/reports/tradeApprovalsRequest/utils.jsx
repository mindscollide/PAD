import { Button } from "../../../../../components";

import ArrowUP from "../../../../../assets/img/arrow-up-dark.png";
import ArrowDown from "../../../../../assets/img/arrow-down-dark.png";
import DefaultColumArrow from "../../../../../assets/img/default-colum-arrow.png";
import TypeColumnTitle from "../../../../../components/dropdowns/filters/typeColumnTitle";
import StatusColumnTitle from "../../../../../components/dropdowns/filters/statusColumnTitle";
import { Tag, Tooltip } from "antd";
import style from "./TradeApprovalRequest.module.css";

import {
  dashBetweenApprovalAssets,
  formatApiDateTime,
  toYYMMDD,
} from "../../../../../common/funtions/rejex";
import {
  mapBuySellToIds,
  mapStatusToIds,
} from "../../../../../components/dropdowns/filters/utils";
import { getTradeTypeById } from "../../../../../common/funtions/type";

/**
 * Utility: Build API request payload for approval listing
 *
 * @param {Object} searchState - Current search/filter state
 * @param {Object} assetTypeListingData - Extra request metadata (optional)
 * @returns {Object} API-ready payload
 */
export const buildApiRequest = (searchState = {}, assetTypeListingData) => ({
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
  assetTypeData,
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

/**
 * Renders instrument cell with asset code and tooltip
 * @param {Object} record - Table row data
 * @returns {JSX.Element} Instrument cell component
 */
const renderInstrumentCell = (record) => {
  const code = record?.instrumentCode || "—";
  const name = record?.instrumentName || "—";
  const assetCode = record?.assetTypeShortCode || "";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        minWidth: 0,
      }}
    >
      <span
        className="custom-shortCode-asset"
        style={{
          minWidth: 32,
          flexShrink: 0,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        data-testid="asset-code"
      >
        {assetCode?.substring(0, 2).toUpperCase()}
      </span>
      <Tooltip
        title={`${code} - ${name}`}
        placement="topLeft"
        overlayStyle={{ maxWidth: "300px" }}
      >
        <span
          className="font-medium"
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            minWidth: 0,
            flex: 1,
            cursor: "pointer",
          }}
          data-testid="instrument-code"
        >
          {code}
        </span>
      </Tooltip>
    </div>
  );
};

/**
 * Renders status tag with appropriate styling
 * @param {string} status - Approval status
 * @param {Object} approvalStatusMap - Status to style mapping
 * @returns {JSX.Element} Status tag component
 */
const renderStatusTag = (status, approvalStatusMap) => {
  const tagConfig = approvalStatusMap[status] || {};

  return (
    <Tag
      style={{
        backgroundColor: tagConfig.backgroundColor,
        color: tagConfig.textColor,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        display: "inline-flex",
        alignItems: "center",
        maxWidth: "100%",
        minWidth: 0,
        margin: 0,
        border: "none",
        borderRadius: "4px",
        padding: "2px 8px",
        fontSize: "16px",
        lineHeight: "1.4",
      }}
      className="border-less-table-orange-status"
      data-testid={`status-tag-${status}`}
    >
      <span
        style={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {tagConfig.label || status}
      </span>
    </Tag>
  );
};

// Helper for consistent column titles
const withSortIcon = (label, columnKey, sortedInfo) => (
  <div className={style["table-header-wrapper"]}>
    <span className={style["table-header-text"]}>{label}</span>
    <span className={style["table-header-icon"]}>
      {getSortIcon(columnKey, sortedInfo)}
    </span>
  </div>
);

export const getBorderlessTableColumns = ({
  approvalStatusMap,
  sortedInfo,
  myTradeApprovalReportLineManageSearch,
  setMyTradeApprovalReportLineManageSearch,
}) => [
  {
    title: withSortIcon("Employee ID", "employeeID", sortedInfo),
    dataIndex: "employeeID",
    key: "employeeID",
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
      return (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span className="font-medium">
            {employeeID}
            {/* {dashBetweenApprovalAssets("REQ888888")} */}
          </span>
        </div>
      );
    },
  },
  {
    title: withSortIcon("Employee Name", "employeeName", sortedInfo),
    dataIndex: "employeeName",
    key: "employeeName",
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
    title: withSortIcon("Total Requests", "totalRequests", sortedInfo),
    dataIndex: "totalRequests",
    key: "totalRequests",
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
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span className="font-medium">{totalRequests}</span>
        </div>
      );
    },
  },
  {
    title: withSortIcon("Pending", "pending", sortedInfo),
    dataIndex: "pending",
    key: "pending",
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
      return (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span className="font-medium">{pending}</span>
        </div>
      );
    },
  },
  {
    title: withSortIcon("Approved", "approved", sortedInfo),
    dataIndex: "approved",
    key: "approved",
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
      return (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span className="font-medium">{approved}</span>
        </div>
      );
    },
  },
  {
    title: withSortIcon("Declined", "declined", sortedInfo),
    dataIndex: "declined",
    key: "declined",
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
      return (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span className="font-medium">{declined}</span>
        </div>
      );
    },
  },
  {
    title: withSortIcon("Traded", "traded", sortedInfo),
    dataIndex: "traded",
    key: "traded",
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
      return (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span className="font-medium">{traded}</span>
        </div>
      );
    },
  },
  {
    title: withSortIcon("Not Traded", "notTraded", sortedInfo),
    dataIndex: "notTraded",
    key: "notTraded",
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
      return (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span className="font-medium">{notTraded}</span>
        </div>
      );
    },
  },
  {
    title: withSortIcon("Resubmitted", "resubmitted", sortedInfo),
    dataIndex: "resubmitted",
    key: "resubmitted",
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
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span className="font-medium">{resubmitted}</span>
        </div>
      );
    },
  },
];
