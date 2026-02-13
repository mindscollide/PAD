// utils.jsx (Reconcile Portfolio)
import React from "react";
import { Tag, Tooltip } from "antd";
import { Button } from "../../../../../components";

import EscalatedIcon from "../../../../../assets/img/escalated.png";

// Helpers
import {
  formatApiDateTime,
  toYYMMDD,
} from "../../../../../common/funtions/rejex";
import TypeColumnTitle from "../../../../../components/dropdowns/filters/typeColumnTitle";
import StatusColumnTitle from "../../../../../components/dropdowns/filters/statusColumnTitle";
import { useReconcileContext } from "../../../../../context/reconsileContax";

import { getTradeTypeById } from "../../../../../common/funtions/type";
import {
  mapBuySellToIds,
  mapStatusToIds,
} from "../../../../../components/dropdowns/filters/utils";
import { withSortIcon } from "../../../../../common/funtions/tableIcon";

/**
 * Builds API request payload from search/filter state
 *
 * @param {Object} searchState - Current search and filter state
 * @param {Object} assetTypeListingData - Asset type listing data (optional)
 * @returns {Object} Formatted request payload for API
 */
export function buildApiRequest(searchState = {}, assetTypeListingData) {
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
}

/* ------------------------------------------------------------------ */
/* 🔹 Data Mapper */
/* ------------------------------------------------------------------ */
/**
 * Maps reconcile portfolio API response into a table-friendly format.
 *
 * @param {Object} assetTypeData - Asset type API response (for resolving trade type).
 * @param {Array<Object>} list - API response data array.
 * @returns {Array<Object>} Transformed rows for AntD Table.
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
/* 🔹 Column Definitions */
/* ------------------------------------------------------------------ */
/**
 * Builds column definitions for the "Reconcile Portfolio" borderless table.
 *
 * @param {Object} approvalStatusMap - Mapping of status keys → {label, backgroundColor, textColor}.
 * @param {Object} sortedInfo - AntD sorter state (columnKey, order).
 * @param {Object} headOfComplianceApprovalEscalatedVerificationsSearch - Current filter state for the table.
 * @param {Function} setHeadOfComplianceApprovalEscalatedVerificationsSearch - Setter to update filter state.
 * @returns {Array<Object>} Column configurations for AntD Table.
 */
export const getBorderlessTableColumns = ({
  approvalStatusMap = {},
  sortedInfo = {},
  headOfComplianceApprovalEscalatedVerificationsSearch = {},
  setHeadOfComplianceApprovalEscalatedVerificationsSearch = () => {},
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

  /* --------------------- Compliance Officer Name --------------------- */
  {
    title: withSortIcon(
      "Compliance Officer",
      "complianceOfficerName",
      sortedInfo
    ),
    align: "left",
    dataIndex: "complianceOfficerName",
    key: "complianceOfficerName",
    ellipsis: true,
    width: 160,
    sorter: (a, b) =>
      (a?.complianceOfficerName || "").localeCompare(
        b?.complianceOfficerName || ""
      ),
    sortOrder:
      sortedInfo?.columnKey === "complianceOfficerName"
        ? sortedInfo.order
        : null,
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
    },
  },

  /* --------------------- Date & Time --------------------- */
  {
    title: withSortIcon("Date & Time", "transactionDate", sortedInfo, "center"),
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
      <span className="text-gray-600" title={date || "—"}>
        {formatApiDateTime(date) || "—"}
      </span>
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
        state={headOfComplianceApprovalEscalatedVerificationsSearch}
        setState={setHeadOfComplianceApprovalEscalatedVerificationsSearch}
      />
    ),
    align: "center",
    dataIndex: "type",
    key: "type",
    ellipsis: true,
    width: 100,
    filteredValue: headOfComplianceApprovalEscalatedVerificationsSearch?.type
      ?.length
      ? headOfComplianceApprovalEscalatedVerificationsSearch.type
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
      <span className="text-gray-600" title={formatApiDateTime(date) || "—"}>
        {formatApiDateTime(date) || "—"}
      </span>
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
      console.log(record, "checkReconsicle najsva sas");
      const { setSelectedEscalatedHeadOfComplianceData } =
        useReconcileContext();
      // Note: Using hook inside render might cause issues, consider moving this logic
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
            setSelectedEscalatedHeadOfComplianceData(record);
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
