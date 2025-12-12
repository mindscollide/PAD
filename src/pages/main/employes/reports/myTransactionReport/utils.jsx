import { Button } from "../../../../../components";

import ArrowUP from "../../../../../assets/img/arrow-up-dark.png";
import ArrowDown from "../../../../../assets/img/arrow-down-dark.png";
import DefaultColumArrow from "../../../../../assets/img/default-colum-arrow.png";
import TypeColumnTitle from "../../../../../components/dropdowns/filters/typeColumnTitle";
import StatusColumnTitle from "../../../../../components/dropdowns/filters/statusColumnTitle";
import { Tag, Tooltip } from "antd";
import style from "./MyTransactionReport.module.css";

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
  Quantity: searchState.quantity ? Number(searchState.quantity) : 0,
  StartDate: searchState.startDate ? toYYMMDD(searchState.startDate) : null,
  EndDate: searchState.endDate ? toYYMMDD(searchState.endDate) : null,
  BrokerIDs: searchState.brokerIDs || [],
  StatusIds: mapStatusToIds?.(searchState.status) || [],
  TypeIds:
    mapBuySellToIds?.(searchState.type, assetTypeListingData?.Equities) || [],
  Broker: searchState.broker || "",
  ActionBy: searchState.actionBy || "",
  ActionStartDate: searchState.actionStartDate
    ? toYYMMDD(searchState.actionStartDate)
    : null,
  ActionEndDate: searchState.actionEndDate
    ? toYYMMDD(searchState.actionEndDate)
    : null,
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
  getEmployeeTransactionReport = []
) => {
  const transactions = Array.isArray(getEmployeeTransactionReport)
    ? getEmployeeTransactionReport
    : getEmployeeTransactionReport?.transactions || [];

  if (!transactions.length) return [];

  return transactions.map((item) => ({
    key: item.workFlowID,
    workFlowID: item.workFlowID,
    tradeApprovalID: item.tradeApprovalID || "",
    instrumentCode: item?.instrument?.instrumentCode || "—",
    instrumentName: item?.instrument?.instrumentName || "—",
    assetTypeShortCode: item?.assetType?.assetTypeShortCode || "—",
    requestDateTime:
      [item?.requestDate, item?.requestTime].filter(Boolean).join(" ") || "—",
    actionDateTime:
      [item?.actionDate, item?.actionTime].filter(Boolean).join(" ") || "—",
    isEscalated: item.isEscalated,
    status: item.approvalStatus?.approvalStatusName || "",
    type: getTradeTypeById(assetTypeData, item?.tradeType) || "-",
    quantity: item.quantity || 0,
    nature: item?.nature || "",
    brokerName: item?.brokerName || "",
    assetType: item.assetType?.assetTypeName || "",
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
  employeeMyTransactionReportSearch,
  setEmployeeMyTransactionReportSearch,
}) => [
  {
    title: withSortIcon("Transaction ID", "tradeApprovalID", sortedInfo),
    dataIndex: "tradeApprovalID",
    key: "tradeApprovalID",
    width: "10%",
    ellipsis: true,
    sorter: (a, b) =>
      parseInt(a.tradeApprovalID.replace(/[^\d]/g, ""), 10) -
      parseInt(b.tradeApprovalID.replace(/[^\d]/g, ""), 10),
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "tradeApprovalID" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (tradeApprovalID) => {
      return (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span className="font-medium">
            {dashBetweenApprovalAssets(tradeApprovalID)}
            {/* {dashBetweenApprovalAssets("REQ888888")} */}
          </span>
        </div>
      );
    },
  },
  {
    title: withSortIcon("Trade Request ID", "requestID", sortedInfo),
    dataIndex: "requestID",
    key: "requestID",
    width: "13%",
    ellipsis: true,
    sorter: (a, b) =>
      parseInt(a.requestID.replace(/[^\d]/g, ""), 10) -
      parseInt(b.requestID.replace(/[^\d]/g, ""), 10),
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "requestID" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (requestID) => {
      return (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span className="font-medium">
            {dashBetweenApprovalAssets(requestID)}
          </span>
        </div>
      );
    },
  },
  {
    title: withSortIcon("Date & Time", "requestDateTime", sortedInfo),
    dataIndex: "requestDateTime",
    key: "requestDateTime",
    ellipsis: true,
    width: "13%",
    sorter: (a, b) =>
      formatApiDateTime(a.requestDateTime).localeCompare(
        formatApiDateTime(b.requestDateTime)
      ),
    sortOrder:
      sortedInfo?.columnKey === "requestDateTime" ? sortedInfo.order : null,
    sortDirections: ["ascend", "descend"],
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (date, record) => (
      <span
        id={`cell-${record.key}-requestDateTime`}
        className="text-gray-600"
        data-testid="formatted-date"
        style={{
          display: "inline-block",
          width: "100%",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {formatApiDateTime(date)}
      </span>
    ),
  },
  {
    title: withSortIcon("Instrument Name", "instrumentCode", sortedInfo),
    dataIndex: "instrumentCode",
    key: "instrumentCode",
    width: "12%",
    ellipsis: true,
    sorter: (a, b) =>
      (a?.instrumentCode || "").localeCompare(b?.instrumentCode || ""),
    sortOrder:
      sortedInfo?.columnKey === "instrumentCode" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (_, record) => (
      <div id={`cell-${record.key}-instrumentCode`}>
        {renderInstrumentCell(record)}
      </div>
    ),
  },
  {
    title: (
      <TypeColumnTitle
        state={employeeMyTransactionReportSearch}
        setState={setEmployeeMyTransactionReportSearch}
      />
    ),
    dataIndex: "type",
    key: "type",
    ellipsis: true,
    width: "7%",
    filteredValue: employeeMyTransactionReportSearch.type?.length
      ? employeeMyTransactionReportSearch?.type
      : null,
    onFilter: () => true,
    render: (type, record) => (
      <span
        id={`cell-${record.key}-type`}
        className={type === "Buy" ? "text-green-600" : "text-red-600"}
        data-testid={`trade-type-${type}`}
        style={{
          display: "inline-block",
          width: "100%",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {type}
      </span>
    ),
  },
  {
    title: withSortIcon("Quantity", "quantity", sortedInfo),
    dataIndex: "quantity",
    key: "quantity",
    ellipsis: true,
    width: "8%",
    sorter: (a, b) => a.quantity - b.quantity,
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "quantity" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (q) => <span className="font-medium">{q.toLocaleString()}</span>,
  },
  {
    title: withSortIcon("Brokers", "brokerName", sortedInfo),
    dataIndex: "brokerName",
    key: "brokerName",
    ellipsis: true,
    width: "7%",
    sorter: (a, b) => a.brokerName - b.brokerName,
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "brokerName" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (q) => <span className="font-medium">{q.toLocaleString()}</span>,
  },
  {
    title: (
      <StatusColumnTitle
        state={employeeMyTransactionReportSearch}
        setState={setEmployeeMyTransactionReportSearch}
      />
    ),
    dataIndex: "status",
    key: "status",
    ellipsis: true,
    width: "7%",
    filteredValue: employeeMyTransactionReportSearch.status?.length
      ? employeeMyTransactionReportSearch.status
      : null,
    onFilter: () => true,
    render: (status) => {
      console.log(status, "statusstatusstatus");
      const tag = approvalStatusMap[status] || {};
      return (
        <Tag
          style={{
            backgroundColor: tag.backgroundColor,
            color: tag.textColor,
          }}
          className="border-less-table-orange-status"
        >
          {tag.label}
        </Tag>
      );
    },
  },
  {
    title: withSortIcon("Action Date", "actionDateTime", sortedInfo),
    dataIndex: "actionDateTime",
    key: "actionDateTime",
    ellipsis: true,
    width: "10%",
    sorter: (a, b) =>
      formatApiDateTime(a.actionDateTime).localeCompare(
        formatApiDateTime(b.actionDateTime)
      ),
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "actionDateTime" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (date, record) => (
      <span
        id={`cell-${record.key}-requestDateTime`}
        className="text-gray-600"
        data-testid="formatted-date"
        style={{
          display: "inline-block",
          width: "100%",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {formatApiDateTime(date)}
      </span>
    ),
  },
  {
    title: withSortIcon("Action by", "actionBy", sortedInfo),
    dataIndex: "actionBy",
    key: "actionBy",
    ellipsis: true,
    width: "8%",
    align: "center",
    // correct string sorting
    sorter: (a, b) => (a.actionBy || "").localeCompare(b.actionBy || ""),
    sortOrder: sortedInfo?.columnKey === "actionBy" ? sortedInfo.order : null,
    sortDirections: ["ascend", "descend"],
    showSorterTooltip: false,
    sortIcon: () => null,

    // correct render
    render: (text) => (
      <span className="font-medium">
        {text || "-"} {/* SHOW DASH IF EMPTY */}
      </span>
    ),
  },
];
