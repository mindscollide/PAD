// utils.jsx
import React from "react";
import { Tag, Tooltip, Typography } from "antd";
import { Button } from "../../../../../components";

// Filter dropdowns
import TypeColumnTitle from "../../../../../components/dropdowns/filters/typeColumnTitle";
import StatusColumnTitle from "../../../../../components/dropdowns/filters/statusColumnTitle";

// Helpers
import {
  formatApiDateTime,
  toYYMMDD,
} from "../../../../../common/funtions/rejex";
import { usePortfolioContext } from "../../../../../context/portfolioContax";
import { getTradeTypeById } from "../../../../../common/funtions/type";
import {
  mapBuySellToIds,
  mapStatusToIds,
} from "../../../../../components/dropdowns/filters/utils";
import { withSortIcon } from "../../../../../common/funtions/tableIcon";

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
    title: withSortIcon("Requester Name", "requesterName", sortedInfo),
    align: "left",
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
  },

  /* --------------------- Instrument --------------------- */
  {
    title: withSortIcon("Instrument", "instrumentCode", sortedInfo),
    align: "left",
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
  },

  /* --------------------- Date & Time --------------------- */
  {
    title: withSortIcon(
      "Upload Date & Time",
      "transactionDate",
      sortedInfo,
      "center"
    ),
    align: "center",
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
  },

  /* --------------------- Quantity --------------------- */
  {
    title: withSortIcon("Quantity", "quantity", sortedInfo, "center"),
    align: "center",
    dataIndex: "quantity",
    key: "quantity",
    width: 100,
    sorter: (a, b) => (a?.quantity ?? 0) - (b?.quantity ?? 0),
    sortOrder: sortedInfo?.columnKey === "quantity" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (q) => (
      <span className="font-medium">{q?.toLocaleString() || "—"}</span>
    ),
  },

  /* --------------------- Trade Type --------------------- */
  {
    title: (
      <TypeColumnTitle
        state={headOfComplianceApprovalPortfolioSearch}
        setState={setHeadOfComplianceApprovalPortfolioSearch}
      />
    ),
    align: "center",
    dataIndex: "type",
    key: "type",
    ellipsis: true,
    width: 100,
    filteredValue: headOfComplianceApprovalPortfolioSearch?.type?.length
      ? headOfComplianceApprovalPortfolioSearch.type
      : null,
    onFilter: () => true,
    render: (type) => <span title={type || "—"}>{type || "—"}</span>,
  },

  /* --------------------- Escalated Date & Time --------------------- */
  {
    title: withSortIcon("Escalated on", "escalatedDate", sortedInfo, "center"),
    align: "center",
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
