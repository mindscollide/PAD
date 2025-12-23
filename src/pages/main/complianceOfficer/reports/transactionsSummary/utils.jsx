import { Button } from "../../../../../components";

import ArrowUP from "../../../../../assets/img/arrow-up-dark.png";
import ArrowDown from "../../../../../assets/img/arrow-down-dark.png";
import DefaultColumArrow from "../../../../../assets/img/default-colum-arrow.png";
import TypeColumnTitle from "../../../../../components/dropdowns/filters/typeColumnTitle";
import StatusColumnTitle from "../../../../../components/dropdowns/filters/statusColumnTitle";
import { Tag, Tooltip } from "antd";
import style from "./transactionsSummary.module.css";

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
  InstrumentName: searchState.instrumentName || "",
  DepartmentName: searchState.departmentName || "",
  Quantity: Number(searchState.quantity) || 0,

  PageNumber: Number(searchState.pageNumber) || 0,
  Length: Number(searchState.pageSize) || 10,

  StatusIds: mapStatusToIds(searchState.status),
  TypeIds: mapBuySellToIds(searchState.type, assetTypeListingData?.Equities),

  RequesterName: searchState.employeeName || "",

  StartDate: searchState.startDate ? toYYMMDD(searchState.startDate) : "",
  EndDate: searchState.endDate ? toYYMMDD(searchState.endDate) : "",
});

/**
 * Maps employee transaction data into a UI-friendly format
 *
 * @param {Object} getEmployeeTransactionReport - API response containing transactions
 * @returns {Array} Mapped transaction list
 */
export const mappingDateWiseTransactionReport = (
  assetTypeData,
  myTradeApprovalLineManagerData = []
) => {
  const records = Array.isArray(myTradeApprovalLineManagerData)
    ? myTradeApprovalLineManagerData
    : myTradeApprovalLineManagerData?.records || [];

  if (!records.length) return [];

  return records.map((item) => ({
    key: item.tradeApprovalID,
    approvalID: item.approvalID,
    tradeApprovalID: item.tradeApprovalID || "",
    instrumentCode: item?.instrument?.instrumentCode || "—",
    instrumentName: item?.instrument?.instrumentName || "—",
    assetTypeShortCode: item?.assetType?.assetTypeShortCode || "—",
    transactionDate:
      `${item?.requestDate || ""} ${item?.requestTime || ""}`.trim() || "—",
    department: item.departmentName,
    type: getTradeTypeById(assetTypeData, item?.tradeType) || "-",
    status: item.approvalStatus?.approvalStatusName || "",
    quantity: item.quantity || 0,
    timeRemainingToTrade: item.timeRemainingToTrade || "",
    assetType: item.assetType?.assetTypeName || "",
    assetTypeID: item.assetType?.assetTypeID || 0,
    employeeName: item.requesterName || "",
    employeeID: item.employeeID || "",
    approvalComment: item.approvalComment || "",
    rejectionComment: item.rejectionComment || "",
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
const withFilterHeader = (FilterComponent) => (
  <div
    className={style["table-header-wrapper"]}
    style={{
      display: "flex",
      alignItems: "center",
      minHeight: "32px",
      width: "100%",
    }}
  >
    <FilterComponent />
  </div>
);

export const getBorderlessTableColumns = ({
  approvalStatusMap,
  sortedInfo,
  coDatewiseTransactionReportSearch,
  setCODatewiseTransactionReportSearch,
  handelViewDetails,
}) => [
  {
    title: withSortIcon("Transaction Date", "transactionDate", sortedInfo),
    dataIndex: "transactionDate",
    key: "transactionDate",
    width: "280px",
    align: "left",
    ellipsis: true,
    sorter: (a, b) => {
      const dateA = new Date(`${a.transactionDate}`).getTime();
      const dateB = new Date(`${b.transactionDate}`).getTime();
      return dateA - dateB;
    },
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "transactionDate" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (_, record) => (
      <span className="text-gray-600">
        {formatApiDateTime(`${record.transactionDate}`)}
      </span>
    ),
  },
  {
    title: withSortIcon("Total Employees", "totalEmployees", sortedInfo),
    dataIndex: "totalEmployees",
    key: "totalEmployees",
    width: "10%",
    ellipsis: true,
    sorter: (a, b) =>
      parseInt(a.totalEmployees.replace(/[^\d]/g, ""), 10) -
      parseInt(b.totalEmployees.replace(/[^\d]/g, ""), 10),
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "totalEmployees" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (totalEmployees) => {
      return (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span className="font-medium">{totalEmployees}</span>
        </div>
      );
    },
  },
  {
    title: withSortIcon("Total Transactions", "totalTransactions", sortedInfo),
    dataIndex: "totalTransactions",
    key: "totalTransactions",
    width: "10%",
    ellipsis: true,
    sorter: (a, b) =>
      parseInt(a.totalTransactions.replace(/[^\d]/g, ""), 10) -
      parseInt(b.totalTransactions.replace(/[^\d]/g, ""), 10),
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "totalTransactions" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (totalTransactions) => {
      return (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span className="font-medium">{totalTransactions}</span>
        </div>
      );
    },
  },
  {
    title: withSortIcon(
      "Compliant Transactions",
      "compliantTransactions",
      sortedInfo
    ),
    dataIndex: "compliantTransactions",
    key: "compliantTransactions",
    width: "10%",
    ellipsis: true,
    sorter: (a, b) =>
      parseInt(a.compliantTransactions.replace(/[^\d]/g, ""), 10) -
      parseInt(b.compliantTransactions.replace(/[^\d]/g, ""), 10),
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "compliantTransactions"
        ? sortedInfo.order
        : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (compliantTransactions) => {
      return (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span className="font-medium">{compliantTransactions}</span>
        </div>
      );
    },
  },
  {
    title: withSortIcon(
      "Non-Compliant Transactions",
      "nonCompliantTransactions",
      sortedInfo
    ),
    dataIndex: "nonCompliantTransactions",
    key: "nonCompliantTransactions",
    width: "10%",
    ellipsis: true,
    sorter: (a, b) =>
      parseInt(a.nonCompliantTransactions.replace(/[^\d]/g, ""), 10) -
      parseInt(b.nonCompliantTransactions.replace(/[^\d]/g, ""), 10),
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "nonCompliantTransactions"
        ? sortedInfo.order
        : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (nonCompliantTransactions) => {
      return (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span className="font-medium">{nonCompliantTransactions}</span>
        </div>
      );
    },
  },

  {
    title: "",
    key: "action",
    align: "right", // 🔷 Align content to the right
    render: (_, record) => (
      <div className={style.viewEditClass}>
        <Button
          className="small-light-button"
          text={"View Details"}
          onClick={() => {
            console.log(record, "tradeApprovalID");
            handelViewDetails(record.approvalID);
          }}
        />
      </div>
    ),
  },
];
