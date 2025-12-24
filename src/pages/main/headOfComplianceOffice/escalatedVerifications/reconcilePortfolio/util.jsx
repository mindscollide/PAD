// utils.jsx
import React from "react";
import { Tag, Tooltip, Typography } from "antd";
import { Button } from "../../../../../components";

// Assets (sort icons)
import DefaultColumnArrow from "../../../../../assets/img/default-colum-arrow.png";
import ArrowUp from "../../../../../assets/img/arrow-up-dark.png";
import ArrowDown from "../../../../../assets/img/arrow-down-dark.png";

// Filter dropdowns
import TypeColumnTitle from "../../../../../components/dropdowns/filters/typeColumnTitle";
import StatusColumnTitle from "../../../../../components/dropdowns/filters/statusColumnTitle";

// Helpers
import {
  formatApiDateTime,
  toYYMMDD,
} from "../../../../../common/funtions/rejex";
import { useGlobalModal } from "../../../../../context/GlobalModalContext";
import { usePortfolioContext } from "../../../../../context/portfolioContax";
import { getTradeTypeById } from "../../../../../common/funtions/type";
import {
  mapBuySellToIds,
  mapStatusToIds,
} from "../../../../../components/dropdowns/filters/utils";

const { Text } = Typography;

/**
 * Builds API request payload from search/filter state
 *
 * @param {Object} searchState - Current search and filter state
 * @param {Object} assetTypeListingData - Asset type listing data (from API)
 * @returns {Object} Formatted request payload for API
 */
export const buildApiRequest = (searchState = {}, assetTypeListingData) => {
  const formatDate = (date) => (date ? toYYMMDD(date) : "");

  return {
    RequesterName: searchState.requesterName || "",
    InstrumentName:
      searchState.mainInstrumentName || searchState.instrumentName || "",
    Quantity: searchState.quantity ? Number(searchState.quantity) : 0,
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
/* 🔹 Utility Functions */
/* ------------------------------------------------------------------ */

/**
 * Returns the correct sorting icon for a given column.
 *
 * @param {string} columnKey - Column key being sorted.
 * @param {Object} sortedInfo - Ant Design `Table` sort state.
 * @returns {JSX.Element} Sorting icon (img).
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

/**
 * Maps API data list into AntD table rows.
 *
 * @param {Object} assetTypeData - Asset type lookup data.
 * @param {Array<Object>} list - API response data array.
 * @returns {Array<Object>} Transformed table rows.
 */
export const mapToTableRows = (assetTypeData, list = []) =>
  (Array.isArray(list) ? list : []).map((item = {}) => ({
    requesterName: item?.requesterName,
    complianceOfficerName: item?.complianceOfficerName,
    workflowID: item?.workflowID,
    instrumentCode: item?.instrument?.instrumentCode || "—",
    instrumentName: item?.instrument?.instrumentName || "—",
    assetTypeShortCode: item?.assetType?.assetTypeShortCode || "—",
    transactionDate:
      [item?.requestDate, item?.requestTime].filter(Boolean).join(" ") || "—",
    escalatedDate:
      [item?.escalatedOnDate, item?.escalatedOnTime]
        .filter(Boolean)
        .join(" ") || "—",
    quantity: item?.quantity,
    type: getTradeTypeById(assetTypeData, item?.tradeType),
    status: item?.approvalStatus?.approvalStatusName || "—",
  }));

/* ------------------------------------------------------------------ */
/* 🔹 Reusable Style Helpers */
/* ------------------------------------------------------------------ */

const nowrapCell = (minWidth, maxWidth) => ({
  style: {
    minWidth,
    maxWidth,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
});

/* ------------------------------------------------------------------ */
/* 🔹 Column Definitions */
/* ------------------------------------------------------------------ */
/**
 * Builds column definitions for the "Reconcile Portfolio" borderless table.
 *
 * @param {Object} approvalStatusMap - Mapping of status keys → {label, backgroundColor, textColor}.
 * @param {Object} sortedInfo - AntD sorter state (columnKey, order).
 * @param {Object} headOfComplianceApprovalPortfolioSearch - Current filter state for the table.
 * @param {Function} setHeadOfComplianceApprovalPortfolioSearch - Setter to update filter state.
 * @returns {Array<Object>} Column configurations for AntD Table.
 */
export const getBorderlessTableColumns = ({
  approvalStatusMap = {},
  sortedInfo = {},
  headOfComplianceApprovalPortfolioSearch = {},
  setHeadOfComplianceApprovalPortfolioSearch = () => {},
  onViewDetail,
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
    onHeaderCell: () => nowrapCell(120, 160),
    onCell: () => nowrapCell(120, 160),
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
    render: (_, record) => {
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
                maxWidth: "100%",
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
    },
    onHeaderCell: () => nowrapCell(130, 170),
    onCell: () => nowrapCell(130, 170),
  },

  /* --------------------- Date & Time --------------------- */
  {
    title: (
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        Upload Date & Time {getSortIcon("transactionDate", sortedInfo)}
      </div>
    ),
    dataIndex: "transactionDate",
    key: "transactionDate",
    ellipsis: true,
    width: 140,
    sorter: (a, b) =>
      (a?.transactionDate || "").localeCompare(b?.transactionDate || ""),
    sortOrder:
      sortedInfo?.columnKey === "transactionDate" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (date) => (
      <Tooltip title={formatApiDateTime(date) || "—"}>
        <span className="text-gray-600" title={date || "—"}>
          {formatApiDateTime(date) || "—"}
        </span>
      </Tooltip>
    ),
    onHeaderCell: () => nowrapCell(120, 160),
    onCell: () => nowrapCell(120, 160),
  },

  /* --------------------- Quantity --------------------- */
  {
    title: (
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        Quantity {getSortIcon("quantity", sortedInfo)}
      </div>
    ),
    dataIndex: "quantity",
    key: "quantity",
    align: "left",
    width: 100,
    sorter: (a, b) => (a?.quantity ?? 0) - (b?.quantity ?? 0),
    sortOrder: sortedInfo?.columnKey === "quantity" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (q) => (
      <span className="font-medium">{q?.toLocaleString() || "—"}</span>
    ),
    onHeaderCell: () => nowrapCell(80, 120),
    onCell: () => nowrapCell(80, 120),
  },

  /* --------------------- Trade Type --------------------- */
  {
    title: (
      <TypeColumnTitle
        state={headOfComplianceApprovalPortfolioSearch}
        setState={setHeadOfComplianceApprovalPortfolioSearch}
      />
    ),
    dataIndex: "type",
    key: "type",
    ellipsis: true,
    width: 100,
    filteredValue: headOfComplianceApprovalPortfolioSearch?.type?.length
      ? headOfComplianceApprovalPortfolioSearch.type
      : null,
    onFilter: () => true,
    render: (type) => <span title={type || "—"}>{type || "—"}</span>,
    onHeaderCell: () => nowrapCell(90, 110),
    onCell: () => nowrapCell(90, 110),
  },

  /* --------------------- Status --------------------- */
  {
    title: (
      <StatusColumnTitle
        state={headOfComplianceApprovalPortfolioSearch}
        setState={setHeadOfComplianceApprovalPortfolioSearch}
      />
    ),
    dataIndex: "status",
    key: "status",
    ellipsis: true,
    width: 140,
    filteredValue: headOfComplianceApprovalPortfolioSearch?.status?.length
      ? headOfComplianceApprovalPortfolioSearch.status
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
            maxWidth: "120px",
            border: "none",
            borderRadius: "4px",
            padding: "2px 8px",
            fontSize: "16px",
            fontWeight: "500",
          }}
          className="border-less-table-orange-status"
        >
          {tag.label || status || "—"}
        </Tag>
      );
    },
    onHeaderCell: () => nowrapCell(120, 160),
    onCell: () => nowrapCell(120, 160),
  },

  /* --------------------- Escalated Date & Time --------------------- */
  {
    title: (
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        Escalated on {getSortIcon("escalatedDate", sortedInfo)}
      </div>
    ),
    dataIndex: "escalatedDate",
    key: "escalatedDate",
    ellipsis: true,
    width: 140,
    sorter: (a, b) =>
      (a?.escalatedDate || "").localeCompare(b?.escalatedDate || ""),
    sortOrder:
      sortedInfo?.columnKey === "escalatedDate" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (date) => (
      <Tooltip title={formatApiDateTime(date) || "—"}>
        <span className="text-gray-600" title={date || "—"}>
          {formatApiDateTime(date) || "—"}
        </span>
      </Tooltip>
    ),
    onHeaderCell: () => nowrapCell(120, 160),
    onCell: () => nowrapCell(120, 160),
  },

  /* --------------------- Actions --------------------- */
  {
    title: "",
    key: "actions",
    align: "center",
    width: 120,
    fixed: "right",
    render: (text, record) => {
      console.log(record, "Checksjakhdbahsdash");
      // Note: Using hook inside render might cause issues, consider moving this logic
      const { setSelectedEscalatedPortfolioHeadOfComplianceData } =
        usePortfolioContext();
      return (
        <Button
          className="big-blue-button"
          text="View Details"
          style={{
            padding: "4px 12px",
            fontSize: "12px",
            height: "28px",
            whiteSpace: "nowrap",
          }}
          onClick={() => {
            onViewDetail(record?.workflowID);
            setSelectedEscalatedPortfolioHeadOfComplianceData(record);
          }}
        />
      );
    },
    onHeaderCell: () => nowrapCell(110, 130),
    onCell: () => nowrapCell(110, 130),
  },
];

// Optional: Add a helper function to calculate total width
export const getTotalTableWidth = () => {
  const columns = [
    140, // Requester Name
    160, // Compliance Officer
    150, // Instrument
    140, // Date & Time
    100, // Quantity
    100, // Trade Type
    140, // Status
    140, // Escalated Date
    120, // Actions
  ];
  return columns.reduce((total, width) => total + width, 0);
};
