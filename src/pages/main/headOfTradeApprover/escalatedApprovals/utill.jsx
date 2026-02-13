// utils.jsx (Head of Trade Approval - Escalated Approvals)
import React from "react";
import { Tag, Tooltip } from "antd";
import { Button } from "../../../../components";

// Assets (sort icons)
import DefaultColumArrow from "../../../../assets/img/default-colum-arrow.png";
import ArrowUP from "../../../../assets/img/arrow-up-dark.png";
import ArrowDown from "../../../../assets/img/arrow-down-dark.png";
import EscalatedIcon from "../../../../assets/img/escalated.png";
import style from "./escalatedApprovals.module.css";

// Helpers
import { formatApiDateTime, toYYMMDD } from "../../../../common/funtions/rejex";
import TypeColumnTitle from "../../../../components/dropdowns/filters/typeColumnTitle";
import StatusColumnTitle from "../../../../components/dropdowns/filters/statusColumnTitle";
import { useGlobalModal } from "../../../../context/GlobalModalContext";
import { getTradeTypeById } from "../../../../common/funtions/type";
import {
  mapBuySellToIds,
  mapStatusToIds,
} from "../../../../components/dropdowns/filters/utils";

// ===========================================================================
// 🎯 CONSTANTS & CONFIGURATION
// ===========================================================================

/**
 * Build API request payload for Escalated Trade Approval.
 *
 * @param {Object} searchState - Current filter/search state
 * @param {Object} assetTypeListingData - Asset type listing data (from API)
 * @returns {Object} API request payload
 */
export const buildApiRequest = (searchState = {}, assetTypeListingData) => {
  const formatDate = (date) => (date ? toYYMMDD(date) : "");

  return {
    RequesterName: searchState.requesterName || "",
    LineManagerName: searchState.lineManagerName || "",
    InstrumentName: searchState.instrumentName || "",
    RequestDateFrom: formatDate(searchState.requestDateFrom),
    RequestDateTo: formatDate(searchState.requestDateTo),
    EscalatedDateFrom: formatDate(searchState.escalatedDateFrom),
    EscalatedDateTo: formatDate(searchState.escalatedDateTo),
    StatusIds: mapStatusToIds(searchState.status) || [],
    TypeIds:
      mapBuySellToIds(searchState.type, assetTypeListingData?.Equities) || [],
    PageNumber: Number(searchState.pageNumber) || 0,
    Length: Number(searchState.pageSize) || 10,
  };
};

/* ------------------------------------------------------------------ */
/* 🔹 Sort Icon Helper */
/* ------------------------------------------------------------------ */
/**
 * Returns the appropriate sort icon based on column key and sorting info.
 *
 * @param {string} columnKey - The column key being sorted.
 * @param {Object} sortedInfo - AntD sorting info (columnKey, order).
 * @returns {JSX.Element} The corresponding sort icon (default, asc, desc).
 */
const getSortIcon = (columnKey, sortedInfo) => {
  if (sortedInfo?.columnKey === columnKey) {
    return sortedInfo.order === "ascend" ? (
      <img src={ArrowDown} alt="Asc" className="custom-sort-icon" />
    ) : (
      <img src={ArrowUP} alt="Desc" className="custom-sort-icon" />
    );
  }
  return (
    <img
      draggable={false}
      src={DefaultColumArrow}
      alt="Not sorted"
      className="custom-sort-icon"
      data-testid={`sort-icon-${columnKey}-default`}
    />
  );
};
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


// ===========================================================================
// 🗺️ DATA MAPPING FUNCTIONS
// ===========================================================================

/* ------------------------------------------------------------------ */
/* 🔹 Data Mapper */
/* ------------------------------------------------------------------ */
/**
 * Maps escalated approvals API response into a table-friendly format.
 *
 * @param {Object} assetTypeData - Asset type API response (for resolving trade type).
 * @param {Array<Object>} approvals - API response data array.
 * @returns {Array<Object>} Transformed rows for AntD Table.
 */
export const mapEscalatedApprovalsToTableRows = (
  assetTypeData,
  approvals = []
) =>
  (Array.isArray(approvals) ? approvals : []).map((item = {}) => ({
    key: item?.approvalID ?? `approval-${Math.random()}`,
    approvalID: item?.approvalID,
    requesterName: item?.requesterName || "—",
    lineManagerName: item?.lineManager || "—",
    instrumentCode: item?.instrument?.instrumentCode || "—",
    instrumentName: item?.instrument?.instrumentName || "—",
    assetTypeShortCode: item?.assetType?.assetTypeShortCode || "—",
    requestDateTime:
      `${item?.requestDate || ""} ${item?.requestTime || ""}`.trim() || "—",
    escalatedDateTime: item?.escalatedOnDate
      ? `${item.escalatedOnDate} ${item.escalatedOnTime || ""}`.trim()
      : "—",
    quantity: item?.quantity || 0,
    type: getTradeTypeById(assetTypeData, item?.tradeType),
    status: item?.approvalStatus?.approvalStatusName || "—",
    timeRemainingToTrade: item?.timeRemainingToTrade || "—",
    assetType: item?.assetType?.assetTypeName || "—",
    tradeApprovalID: item?.tradeApprovalID || "—",
    isEscalated: Boolean(item?.isEscalationOpen),
  }));

// ===========================================================================
// 🎨 COLUMN RENDERERS
// ===========================================================================

/**
 * Renders instrument cell with asset type badge
 * @param {Object} record - Table row data
 * @returns {JSX.Element} Instrument cell content
 */
const renderInstrumentCell = (record) => {
  const code = record?.instrumentCode || "—";
  const name = record?.instrumentName || "—";
  const assetCode = record?.assetTypeShortCode || "";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <span
        className="custom-shortCode-asset"
        style={{
          minWidth: 32,
          flexShrink: 0,
        }}
      >
        {assetCode?.substring(0, 2).toUpperCase()}
      </span>
      <Tooltip title={`${code} - ${name}`} placement="topLeft">
        <span
          className="font-medium"
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: "100px",
            display: "inline-block",
            cursor: "pointer",
            flex: 1,
          }}
        >
          {code}
        </span>
      </Tooltip>
    </div>
  );
};

/**
 * Renders action buttons for table rows
 * @param {Object} record - Table row data
 * @param {Function} onViewDetail - View detail handler
 * @param {Function} setViewDetailsHeadOfApprovalModal - Modal state setter
 * @returns {JSX.Element} Action buttons
 */
const renderActionCell = (
  record,
  onViewDetail,
  setViewDetailsHeadOfApprovalModal
) => {
  const { setIsSelectedViewDetailHeadOfApproval } = useGlobalModal();

  const handleViewDetails = () => {
    if (record?.approvalID) {
      onViewDetail(record.approvalID);
      setIsSelectedViewDetailHeadOfApproval(record);
      setViewDetailsHeadOfApprovalModal(true);
    }
  };

  return (
    <Button
      className="big-orange-button"
      text="View Details"
      style={{
        padding: "4px 12px",
        fontSize: "12px",
        height: "28px",
        whiteSpace: "nowrap",
      }}
      onClick={handleViewDetails}
      disabled={!record?.approvalID}
    />
  );
};

// ===========================================================================
// 📊 COLUMN DEFINITIONS
// ===========================================================================

/* ------------------------------------------------------------------ */
/* 🔹 Column Definitions */
/* ------------------------------------------------------------------ */
/**
 * Builds column definitions for the "Escalated Approvals" borderless table.
 *
 * @param {Object} approvalStatusMap - Mapping of status keys → {label, backgroundColor, textColor}.
 * @param {Object} sortedInfo - AntD sorter state (columnKey, order).
 * @param {Object} headOfTradeEscalatedApprovalsSearch - Current filter state for the table.
 * @param {Function} setHeadOfTradeEscalatedApprovalsSearch - Setter to update filter state.
 * @param {Function} setViewDetailsHeadOfApprovalModal - Setter for view details modal.
 * @param {Function} onViewDetail - Callback for view details action.
 * @returns {Array<Object>} Column configurations for AntD Table.
 */
export const getBorderlessTableColumns = ({
  approvalStatusMap = {},
  sortedInfo = {},
  headOfTradeEscalatedApprovalsSearch = {},
  setHeadOfTradeEscalatedApprovalsSearch = () => {},
  setViewDetailsHeadOfApprovalModal = () => {},
  onViewDetail = () => {},
}) => [
  /* --------------------- Requester Name --------------------- */
  {
    title: withSortIcon("Requester Name", "requesterName", sortedInfo),
    dataIndex: "requesterName",
    key: "requesterName",
    align:"left",
    ellipsis: true,
    width: 140,
    sorter: (a, b) =>
      (a?.requesterName || "").localeCompare(b?.requesterName || ""),
    sortOrder:
      sortedInfo?.columnKey === "requesterName" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text) => (
      <span className="font-medium" title={text || "—"}>
        {text || "—"}
      </span>
    ),
  },

  /* --------------------- Line Manager Name --------------------- */
  {
    title: withSortIcon("Line Manager", "lineManagerName", sortedInfo),
    dataIndex: "lineManagerName",
    key: "lineManagerName",
    ellipsis: true,
    width: 160,
    sorter: (a, b) =>
      (a?.lineManagerName || "").localeCompare(b?.lineManagerName || ""),
    sortOrder:
      sortedInfo?.columnKey === "lineManagerName" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text) => (
      <span className="font-medium" title={text || "—"}>
        {text || "—"}
      </span>
    ),
  },

  /* --------------------- Instrument --------------------- */
  {
    title: withSortIcon("Instrument", "instrumentCode", sortedInfo),
    dataIndex: "instrumentCode",
    key: "instrumentCode",
    ellipsis: true,
    width: 150,
    sorter: (a, b) =>
      (a?.instrumentCode || "").localeCompare(b?.instrumentCode || ""),
    sortOrder:
      sortedInfo?.columnKey === "instrumentCode" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (_, record) => renderInstrumentCell(record),
  },

  /* --------------------- Date & Time --------------------- */
  {
    title: withSortIcon("Date & Time", "requestDateTime", sortedInfo, "center"),
    dataIndex: "requestDateTime",
    key: "requestDateTime",
    ellipsis: true,
    align: "center",
    width: 140,
    sorter: (a, b) =>
      (a?.requestDateTime || "").localeCompare(b?.requestDateTime || ""),
    sortOrder:
      sortedInfo?.columnKey === "requestDateTime" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (date) => (
      <Tooltip title={formatApiDateTime(date) || "—"}>
        <span className="text-gray-600" title={date || "—"}>
          {formatApiDateTime(date) || "—"}
        </span>
      </Tooltip>
    ),
  },

  /* --------------------- Trade Type --------------------- */
  {
    title: (
      <TypeColumnTitle
        state={headOfTradeEscalatedApprovalsSearch}
        setState={setHeadOfTradeEscalatedApprovalsSearch}
      />
    ),
    align: "center",
    dataIndex: "type",
    key: "type",
    ellipsis: true,
    width: 100,
    filteredValue: headOfTradeEscalatedApprovalsSearch?.type?.length
      ? headOfTradeEscalatedApprovalsSearch.type
      : null,
    onFilter: () => true,
    render: (type) => (
      <span
        className={type === "Buy" ? "text-green-600" : "text-red-600"}
        title={type || "—"}
      >
        {type || "—"}
      </span>
    ),
  },

  /* --------------------- Status --------------------- */
  // {
  //   title: (
  //     <StatusColumnTitle
  //       state={headOfTradeEscalatedApprovalsSearch}
  //       setState={setHeadOfTradeEscalatedApprovalsSearch}
  //     />
  //   ),
  //   dataIndex: "status",
  //   key: "status",
  //   ellipsis: true,
  //   width: 140,
  //   filteredValue: headOfTradeEscalatedApprovalsSearch?.status?.length
  //     ? headOfTradeEscalatedApprovalsSearch.status
  //     : null,
  //   onFilter: () => true,
  //   render: (status) => renderStatusCell(status, approvalStatusMap),
  // },

  /* --------------------- Status --------------------- */
  {
    title: withSortIcon("Quantity", "quantity", sortedInfo, "center"),
    dataIndex: "quantity",
    key: "quantity",
    align: "center",
    width: 100,
    ellipsis: true,
    sortIcon: () => null,
    showSorterTooltip: false,
    sorter: (a, b) => Number(a.quantity) - Number(b.quantity),
    sortOrder: sortedInfo?.columnKey === "quantity" ? sortedInfo.order : null,
    render: (text) => (
      <span className="font-medium">
        {Number(text).toLocaleString("en-US")}
      </span>
    ),
  },
  /* --------------------- Escalated On --------------------- */
  {
    title: withSortIcon(
      "Escalated On",
      "escalatedDateTime",
      sortedInfo,
      "center"
    ),
    dataIndex: "escalatedDateTime",
    key: "escalatedDateTime",
    ellipsis: true,
    width: 140,
    align: "center",
    sorter: (a, b) =>
      (a?.escalatedDateTime || "").localeCompare(b?.escalatedDateTime || ""),
    sortOrder:
      sortedInfo?.columnKey === "escalatedDateTime" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (date) => (
      <Tooltip title={formatApiDateTime(date) || "—"}>
        <span className="text-gray-600" title={date || "—"}>
          {formatApiDateTime(date) || "—"}
        </span>
      </Tooltip>
    ),
  },

  /* --------------------- Actions --------------------- */
  {
    title: "",
    key: "actions",
    align: "center",
    width: 120,
    fixed: "right",
    render: (text, record) =>
      renderActionCell(record, onViewDetail, setViewDetailsHeadOfApprovalModal),
  },
];

// ===========================================================================
// 📏 TABLE WIDTH CALCULATION
// ===========================================================================

/**
 * Calculates total table width for proper scroll configuration
 * @returns {number} Total width of all columns in pixels
 */
export const getTotalTableWidth = () => {
  const columns = [
    140, // Requester Name
    160, // Line Manager
    150, // Instrument
    140, // Date & Time
    100, // Trade Type
    140, // Status
    140, // Escalated On
    120, // Actions
  ];
  return columns.reduce((total, width) => total + width, 0);
};
