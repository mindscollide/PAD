import ArrowUP from "../../../../../assets/img/arrow-up-dark.png";
import ArrowDown from "../../../../../assets/img/arrow-down-dark.png";
import DefaultColumArrow from "../../../../../assets/img/default-colum-arrow.png";
import TypeColumnTitle from "../../../../../components/dropdowns/filters/typeColumnTitle";
import StatusColumnTitle from "../../../../../components/dropdowns/filters/statusColumnTitle";
import { Tag, Tooltip } from "antd";
import style from "./mytradeapprovals.module.css";

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
import { Button } from "../../../../../components";
import { useGlobalModal } from "../../../../../context/GlobalModalContext";

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
  BrokerIDs: searchState.brokerIDs || [],

  StartDate: searchState.startDate ? toYYMMDD(searchState.startDate) : "",
  EndDate: searchState.endDate ? toYYMMDD(searchState.endDate) : "",
  StatusIds: mapStatusToIds?.(searchState.status) || [],
  TypeIds:
    mapBuySellToIds?.(searchState.type, assetTypeListingData?.Equities) || [],
  PageNumber: Number(searchState.pageNumber) || 0,
  Length: Number(searchState.pageSize) || 10,
});

/**
 * Maps employee transaction data into a UI-friendly format
 *
 * @param {Object} employeeTransactionsData - API response containing transactions
 * @returns {Array} Mapped transaction list
 */
export const mapEmployeeTransactions = (
  assetTypeData,
  employeeTransactionsData = {}
) => {
  if (!employeeTransactionsData) return [];
  console.log("assetTypeListingData", employeeTransactionsData);

  return employeeTransactionsData.map((item) => ({
    key: item.approvalID,
    approvalID: item.approvalID || null,
    title: `ConductTransactionRequest-${item.approvalID || ""}-${
      item.requestDate || ""
    } ${item.requestTime || ""}`,
    description: item.description || "",
    instrumentCode: item?.instrument?.instrumentCode || "—",
    instrumentName: item?.instrument?.instrumentName || "—",
    quantity: item.quantity || 0,
    tradeApprovalID: item.tradeApprovalID || "",
    tradeApprovalTypeID: item.tradeApprovalTypeID || null,
    type: getTradeTypeById(assetTypeData, item?.tradeType) || "-",
    status: item.approvalStatus?.approvalStatusName || "",
    isEscalated: item.isEscalated,
    assetTypeID: item.assetType?.assetTypeID || 0,
    actionBy: item?.actionBy || "",
    assetType: item.assetType || "",
    assetTypeShortCode: item?.assetType?.assetTypeShortCode || "—",
    requestDateTime:
      [item?.requestDate, item?.requestTime].filter(Boolean).join(" ") || "—",
    actionDateTime:
      [item?.actionDate, item?.actionTime].filter(Boolean).join(" ") || "—",
    deadlineDate: item.deadlineDate || "",
    deadlineTime: item.deadlineTime || "",
    broker: item.broker || "Multiple Brokers",
  }));
};

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
  approvalStatusMap,
  sortedInfo,
  employeeMyTradeApprovalsSearch,
  setEmployeeMyTradeApprovalsSearch,
}) => [
  {
    title: withSortIcon("Trade Request ID", "tradeApprovalID", sortedInfo),
    dataIndex: "tradeApprovalID",
    key: "tradeApprovalID",
    width: "12%",
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
    title: withSortIcon("Instrument", "instrumentCode", sortedInfo),
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
        state={employeeMyTradeApprovalsSearch}
        setState={setEmployeeMyTradeApprovalsSearch}
      />
    ),
    dataIndex: "type",
    key: "type",
    ellipsis: true,
    width: "8%",
    filteredValue: employeeMyTradeApprovalsSearch.type?.length
      ? employeeMyTradeApprovalsSearch?.type
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
    title: withSortIcon("Broker", "broker", sortedInfo),
    dataIndex: "broker",
    width: "13%",
    key: "broker",
    sorter: (a, b) => a.broker - b.broker,
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "broker" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
  },
  {
    title: (
      <StatusColumnTitle
        state={employeeMyTradeApprovalsSearch}
        setState={setEmployeeMyTradeApprovalsSearch}
      />
    ),
    dataIndex: "status",
    key: "status",
    ellipsis: true,
    width: "10%",
    filteredValue: employeeMyTradeApprovalsSearch.status?.length
      ? employeeMyTradeApprovalsSearch.status
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
