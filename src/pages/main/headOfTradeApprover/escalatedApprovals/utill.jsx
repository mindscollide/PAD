// utils.jsx (Head of Trade Approval - Escalated Approvals)
import React from "react";
import { Tag, Tooltip } from "antd";
import { Button } from "../../../../components";

// Assets (sort icons)
import DefaultColumnArrow from "../../../../assets/img/default-colum-arrow.png";
import ArrowUp from "../../../../assets/img/arrow-up-dark.png";
import ArrowDown from "../../../../assets/img/arrow-down-dark.png";
import EscalatedIcon from "../../../../assets/img/escalated.png";

// Helpers
import { formatApiDateTime } from "../../../../common/funtions/rejex";
import TypeColumnTitle from "../../../../components/dropdowns/filters/typeColumnTitle";
import StatusColumnTitle from "../../../../components/dropdowns/filters/statusColumnTitle";
import { useGlobalModal } from "../../../../context/GlobalModalContext";
import { getTradeTypeById } from "../../../../common/funtions/type";

// ===========================================================================
// 🎯 CONSTANTS & CONFIGURATION
// ===========================================================================

const COLUMN_CONFIG = {
  REQUISITION: { minWidth: 120, maxWidth: 160 },
  INSTRUMENT: { minWidth: 130, maxWidth: 170 },
  DATE: { minWidth: 120, maxWidth: 160 },
  QUANTITY: { minWidth: 80, maxWidth: 120 },
  TYPE: { minWidth: 90, maxWidth: 110 },
  STATUS: { minWidth: 120, maxWidth: 160 },
  ESCALATED: { minWidth: 120, maxWidth: 160 },
  ACTIONS: { minWidth: 110, maxWidth: 130 },
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
  if (sortedInfo?.columnKey !== columnKey) {
    return (
      <img
        draggable={false}
        src={DefaultColumnArrow}
        alt="Default"
        className="custom-sort-icon"
      />
    );
  }
  const isAsc = sortedInfo.order === "ascend";
  return (
    <img
      draggable={false}
      src={isAsc ? ArrowDown : ArrowUp}
      alt={isAsc ? "Asc" : "Desc"}
      className="custom-sort-icon"
    />
  );
};

/* ------------------------------------------------------------------ */
/* 🔹 Style Helpers */
/* ------------------------------------------------------------------ */
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
 * Renders status tag with appropriate colors
 * @param {string} status - Approval status
 * @param {Object} approvalStatusMap - Status color mapping
 * @returns {JSX.Element} Status tag component
 */
const renderStatusCell = (status, approvalStatusMap) => {
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
        maxWidth: "120px",
        border: "none",
        borderRadius: "4px",
        padding: "2px 8px",
        fontSize: "12px",
        fontWeight: "500",
      }}
      className="border-less-table-orange-status"
    >
      {tag.label || status || "—"}
    </Tag>
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
    title: (
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        Requester Name {getSortIcon("requesterName", sortedInfo)}
      </div>
    ),
    dataIndex: "requesterName",
    key: "requesterName",
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
    onHeaderCell: () =>
      nowrapCell(
        COLUMN_CONFIG.REQUISITION.minWidth,
        COLUMN_CONFIG.REQUISITION.maxWidth
      ),
    onCell: () =>
      nowrapCell(
        COLUMN_CONFIG.REQUISITION.minWidth,
        COLUMN_CONFIG.REQUISITION.maxWidth
      ),
  },

  /* --------------------- Line Manager Name --------------------- */
  {
    title: (
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        Line Manager {getSortIcon("lineManagerName", sortedInfo)}
      </div>
    ),
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
    onHeaderCell: () =>
      nowrapCell(
        COLUMN_CONFIG.REQUISITION.minWidth,
        COLUMN_CONFIG.REQUISITION.maxWidth
      ),
    onCell: () =>
      nowrapCell(
        COLUMN_CONFIG.REQUISITION.minWidth,
        COLUMN_CONFIG.REQUISITION.maxWidth
      ),
  },

  /* --------------------- Instrument --------------------- */
  {
    title: (
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        Instrument {getSortIcon("instrumentCode", sortedInfo)}
      </div>
    ),
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
    onHeaderCell: () =>
      nowrapCell(
        COLUMN_CONFIG.INSTRUMENT.minWidth,
        COLUMN_CONFIG.INSTRUMENT.maxWidth
      ),
    onCell: () =>
      nowrapCell(
        COLUMN_CONFIG.INSTRUMENT.minWidth,
        COLUMN_CONFIG.INSTRUMENT.maxWidth
      ),
  },

  /* --------------------- Date & Time --------------------- */
  {
    title: (
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        Date & Time {getSortIcon("requestDateTime", sortedInfo)}
      </div>
    ),
    dataIndex: "requestDateTime",
    key: "requestDateTime",
    ellipsis: true,
    width: 140,
    sorter: (a, b) =>
      (a?.requestDateTime || "").localeCompare(b?.requestDateTime || ""),
    sortOrder:
      sortedInfo?.columnKey === "requestDateTime" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (date) => (
      <span className="text-gray-600" title={date || "—"}>
        {formatApiDateTime(date) || "—"}
      </span>
    ),
    onHeaderCell: () =>
      nowrapCell(COLUMN_CONFIG.DATE.minWidth, COLUMN_CONFIG.DATE.maxWidth),
    onCell: () =>
      nowrapCell(COLUMN_CONFIG.DATE.minWidth, COLUMN_CONFIG.DATE.maxWidth),
  },

  /* --------------------- Trade Type --------------------- */
  {
    title: (
      <TypeColumnTitle
        state={headOfTradeEscalatedApprovalsSearch}
        setState={setHeadOfTradeEscalatedApprovalsSearch}
      />
    ),
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
    onHeaderCell: () =>
      nowrapCell(COLUMN_CONFIG.TYPE.minWidth, COLUMN_CONFIG.TYPE.maxWidth),
    onCell: () =>
      nowrapCell(COLUMN_CONFIG.TYPE.minWidth, COLUMN_CONFIG.TYPE.maxWidth),
  },

  /* --------------------- Status --------------------- */
  {
    title: (
      <StatusColumnTitle
        state={headOfTradeEscalatedApprovalsSearch}
        setState={setHeadOfTradeEscalatedApprovalsSearch}
      />
    ),
    dataIndex: "status",
    key: "status",
    ellipsis: true,
    width: 140,
    filteredValue: headOfTradeEscalatedApprovalsSearch?.status?.length
      ? headOfTradeEscalatedApprovalsSearch.status
      : null,
    onFilter: () => true,
    render: (status) => renderStatusCell(status, approvalStatusMap),
    onHeaderCell: () =>
      nowrapCell(COLUMN_CONFIG.STATUS.minWidth, COLUMN_CONFIG.STATUS.maxWidth),
    onCell: () =>
      nowrapCell(COLUMN_CONFIG.STATUS.minWidth, COLUMN_CONFIG.STATUS.maxWidth),
  },

  /* --------------------- Escalated On --------------------- */
  {
    title: (
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        Escalated On {getSortIcon("escalatedDateTime", sortedInfo)}
      </div>
    ),
    dataIndex: "escalatedDateTime",
    key: "escalatedDateTime",
    ellipsis: true,
    width: 140,
    sorter: (a, b) =>
      (a?.escalatedDateTime || "").localeCompare(b?.escalatedDateTime || ""),
    sortOrder:
      sortedInfo?.columnKey === "escalatedDateTime" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (date) => (
      <span className="text-gray-600" title={date || "—"}>
        {formatApiDateTime(date) || "—"}
      </span>
    ),
    onHeaderCell: () =>
      nowrapCell(
        COLUMN_CONFIG.ESCALATED.minWidth,
        COLUMN_CONFIG.ESCALATED.maxWidth
      ),
    onCell: () =>
      nowrapCell(
        COLUMN_CONFIG.ESCALATED.minWidth,
        COLUMN_CONFIG.ESCALATED.maxWidth
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
    onHeaderCell: () =>
      nowrapCell(
        COLUMN_CONFIG.ACTIONS.minWidth,
        COLUMN_CONFIG.ACTIONS.maxWidth
      ),
    onCell: () =>
      nowrapCell(
        COLUMN_CONFIG.ACTIONS.minWidth,
        COLUMN_CONFIG.ACTIONS.maxWidth
      ),
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


