import { Button } from "../../../../../components";

import ArrowUP from "../../../../../assets/img/arrow-up-dark.png";
import ArrowDown from "../../../../../assets/img/arrow-down-dark.png";
import EscaltedOn from "../../../../../assets/img/escalated.png";
import DefaultColumArrow from "../../../../../assets/img/default-colum-arrow.png";
import TypeColumnTitle from "../../../../../components/dropdowns/filters/typeColumnTitle";
import { Tag, Tooltip } from "antd";
import style from "./PortfolioHistoryReports.module.css";

import {
  formatApiDateTime,
  toYYMMDD,
} from "../../../../../common/funtions/rejex";
import {
  mapBuySellToIds,
  mapStatusToIds,
} from "../../../../../components/dropdowns/filters/utils";
import { getTradeTypeById } from "../../../../../common/funtions/type";
import StatusColumnTitle from "../../../../../components/dropdowns/filters/statusColumnTitle";

/**
 * Utility: Build API request payload for approval listing
 *
 * @param {Object} searchState - Current search/filter state
 * @param {Object} assetTypeListingData - Extra request metadata (optional)
 * @returns {Object} API-ready payload
 */
export const buildApiRequest = (searchState = {}, assetTypeListingData) => ({
  InstrumentName: searchState.instrumentName || "",
  RequesterName: searchState.requesterName || "",
  DepartmentName: searchState.departmentName || "",
  Quantity: Number(searchState.quantity) || 0,
  StatusIds: mapStatusToIds(searchState.status,2),
  TypeIds: mapBuySellToIds(searchState.type, assetTypeListingData?.Equities),
  PageNumber: Number(searchState.pageNumber) || 0,
  Length: Number(searchState.pageSize) || 10,
});

/**
 * Generates AntD table cell styles for nowrap text handling.
 *
 * @param {number} minWidth - Minimum cell width.
 * @param {number} maxWidth - Maximum cell width.
 * @returns {Object} Style object for AntD `onCell`/`onHeaderCell`.
 */
const nowrapCell = (minWidth, maxWidth) => ({
  style: {
    minWidth,
    maxWidth,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
});

/**
 * Maps employee transaction data into a UI-friendly format
 *
 * @param {Object} getEmployeeTransactionReport - API response containing transactions
 * @returns {Array} Mapped transaction list
 */
export const mappingDateWiseTransactionReport = (
  assetTypeData,
  coPortfolioHistoryListData = []
) => {
  const complianceOfficerPortfolioHistory = Array.isArray(
    coPortfolioHistoryListData
  )
    ? coPortfolioHistoryListData
    : coPortfolioHistoryListData?.complianceOfficerPortfolioHistory || [];
  console.log(complianceOfficerPortfolioHistory, "overdueVerifications");
  if (!complianceOfficerPortfolioHistory.length) return [];

  return complianceOfficerPortfolioHistory.map((item) => ({
    key: item.approvalID,
    approvalID: item.approvalID,
    requesterName: item.requesterName || "—",
    departmentName: item.departmentName || "—",
    employeeCode: item.employeeCode || "—",
    employeeID: item.employeeID || "",
    tradeApprovalID: item.tradeApprovalID || "",
    title: item.title || "",
    instrumentCode: item?.instrument?.instrumentCode || "—",
    instrumentName: item?.instrument?.instrumentName || "—",
    assetTypeShortCode: item?.assetType?.assetTypeShortCode || "—",
    requestDate:
      `${item?.requestDate || ""} ${item?.requestTime || ""}`.trim() || "—",
    type: getTradeTypeById(assetTypeData, item?.tradeType) || [],
    timeRemainingToTrade: item.timeRemainingToTrade || "",
    assetType: item?.assetType?.assetTypeName || "",
    quantity: item?.quantity || 0,
    status: item?.approvalStatus?.approvalStatusName || "—",
    assetTypeID: item.assetType?.assetTypeID || 0,
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
const withSortIcon = (label, columnKey, sortedInfo) => (
  <div className={style["table-header-wrapper"]}>
    <span className={style["table-header-text"]}>{label}</span>
    <span className={style["table-header-icon"]}>
      {getSortIcon(columnKey, sortedInfo)}
    </span>
  </div>
);

export const getBorderlessTableColumns = ({
  approvalStatusMap = {},
  sortedInfo,
  coPortfolioHistoryReportSearch,
  setCoPortfolioHistoryReportSearch,
}) => [
  {
    title: (
      <div style={{ marginLeft: "8px" }}>
        {withSortIcon("ID", "employeeID", sortedInfo)}
      </div>
    ),
    dataIndex: "employeeID",
    key: "employeeID",
    align: "left",
    width: "80px",
    ellipsis: true,
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "employeeID" ? sortedInfo.order : null,
    sorter: (a, b) => a.employeeID - b.employeeID,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text) => (
      <span className={`${style["cell-text"]} font-medium`}>{text}</span>
    ),
  },
  {
    title: (
      <div>{withSortIcon("Employee Name", "requesterName", sortedInfo)}</div>
    ),
    dataIndex: "requesterName",
    key: "requesterName",
    width: 150,
    align: "left",
    ellipsis: true,
    sorter: (a, b) =>
      a.requesterName.localeCompare(b.requesterName, undefined, {
        sensitivity: "base",
      }),
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "requesterName" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text) => (
      <span className={`${style["cell-text"]} font-medium`}>{text ?? "—"}</span>
    ),
  },
  {
    title: (
      <div>{withSortIcon("Department Name", "departmentName", sortedInfo)}</div>
    ),
    dataIndex: "departmentName",
    key: "departmentName",
    width: 200,
    align: "left",
    ellipsis: true,
    sorter: (a, b) =>
      a.departmentName.localeCompare(b.departmentName, undefined, {
        sensitivity: "base",
      }),
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "departmentName" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text) => (
      <span className={`${style["cell-text"]} font-medium`}>{text}</span>
    ),
  },
  {
    title: (
      <div>{withSortIcon("Tracking ID", "tradeApprovalID", sortedInfo)}</div>
    ),
    dataIndex: "tradeApprovalID",
    key: "tradeApprovalID",
    width: "120px",
    align: "left",
    ellipsis: true,
    sorter: (a, b) => a.tradeApprovalID.localeCompare(b.tradeApprovalID),
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "tradeApprovalID" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text) => (
      <span className={`${style["cell-text"]} font-medium`}>{text}</span>
    ),
  },
  {
    title: withSortIcon("Instrument", "instrumentName", sortedInfo),
    dataIndex: "instrumentName",
    key: "instrumentName",
    width: "150px",
    ellipsis: true,
    sorter: (a, b) =>
      a.instrumentName.localeCompare(b.instrumentName, undefined, {
        sensitivity: "base",
      }),
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "instrumentName" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (instrument, record) => {
      console.log(record, "recordRecordInstrument");
      const assetCode = record?.assetTypeShortCode;
      const code = record?.instrumentCode || "";
      const instrumentName = record?.instrumentName || "";

      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <span className="custom-shortCode-asset" style={{ minWidth: 30 }}>
            {assetCode?.substring(0, 2).toUpperCase()}
          </span>
          <Tooltip title={instrumentName} placement="topLeft">
            <span
              className="font-medium"
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: "200px",
                display: "inline-block",
                cursor: "pointer",
              }}
            >
              {code}
            </span>
          </Tooltip>
        </div>
      );
    },
  },
  {
    title: (
      <TypeColumnTitle
        state={coPortfolioHistoryReportSearch}
        setState={setCoPortfolioHistoryReportSearch}
      />
    ),
    dataIndex: "type",
    key: "type",
    ellipsis: true,
    filteredValue: coPortfolioHistoryReportSearch?.type?.length
      ? coPortfolioHistoryReportSearch.type
      : null,
    onFilter: () => true,
    render: (type) => <span title={type || "—"}>{type || "—"}</span>,
    onHeaderCell: () => nowrapCell(100, 100),
    onCell: () => nowrapCell(100, 100),
  },

  {
    title: withSortIcon("Quantity", "quantity", sortedInfo),
    dataIndex: "quantity",
    width: "140px",
    key: "quantity",
    ellipsis: true,
    sorter: (a, b) => a.quantity - b.quantity,
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "quantity" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text) => (
      <span className={`${style["cell-text"]} font-medium`}>
        {text.toLocaleString()}
      </span>
    ),
  },
  {
    title: withSortIcon("Date & Time", "requestDate", sortedInfo),
    dataIndex: "requestDate",
    key: "requestDate",
    width: "140px",
    align: "left",
    ellipsis: true,
    sorter: (a, b) =>
      formatApiDateTime(a.requestDate).localeCompare(
        formatApiDateTime(b.requestDate)
      ),
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "requestDate" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (_, record) => (
      <span className="text-gray-600">
        {formatApiDateTime(`${record.requestDate}`)}
      </span>
    ),
  },
  /* --------------------- Status --------------------- */
  {
    title: (
      <StatusColumnTitle
        state={coPortfolioHistoryReportSearch}
        setState={setCoPortfolioHistoryReportSearch}
      />
    ),
    dataIndex: "status",
    key: "status",
    ellipsis: true,
    filteredValue: coPortfolioHistoryReportSearch?.status?.length
      ? coPortfolioHistoryReportSearch.status
      : null,
    onFilter: () => true,
    render: (status) => {
      const tag = approvalStatusMap?.[status] || {};
      return (
        <Tag
          style={{
            backgroundColor: tag.backgroundColor,
            color: tag.textColor,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "inline-block",
          }}
          className="border-less-table-orange-status"
        >
          {tag.label || status || "—"}
        </Tag>
      );
    },
    onHeaderCell: () => nowrapCell(150, 240),
    onCell: () => nowrapCell(150, 240),
  },
];
