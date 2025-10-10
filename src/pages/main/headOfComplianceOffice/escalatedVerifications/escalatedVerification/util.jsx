// utils.jsx (Reconcile Portfolio)
import React from "react";
import { Tag, Tooltip } from "antd";
import { Button } from "../../../../../components";

// Assets (sort icons)
import DefaultColumnArrow from "../../../../../assets/img/default-colum-arrow.png";
import ArrowUp from "../../../../../assets/img/arrow-up-dark.png";
import ArrowDown from "../../../../../assets/img/arrow-down-dark.png";
import EscalatedIcon from "../../../../../assets/img/escalated.png";

// Helpers
import { formatApiDateTime } from "../../../../../common/funtions/rejex";
import TypeColumnTitle from "../../../../../components/dropdowns/filters/typeColumnTitle";
import StatusColumnTitle from "../../../../../components/dropdowns/filters/statusColumnTitle";
import { useGlobalModal } from "../../../../../context/GlobalModalContext";
import { useReconcileContext } from "../../../../../context/reconsileContax";

import { getTradeTypeById } from "../../../../../common/funtions/type";

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

  /* --------------------- Compliance Officer Name --------------------- */
  {
    title: (
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        Compliance Officer {getSortIcon("complianceOfficerName", sortedInfo)}
      </div>
    ),
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
    onHeaderCell: () => nowrapCell(140, 180),
    onCell: () => nowrapCell(140, 180),
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
    onHeaderCell: () => nowrapCell(130, 170),
    onCell: () => nowrapCell(130, 170),
  },

  /* --------------------- Date & Time --------------------- */
  {
    title: (
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        Date & Time {getSortIcon("transactionDate", sortedInfo)}
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
      <span className="text-gray-600" title={date || "—"}>
        {formatApiDateTime(date) || "—"}
      </span>
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
        state={headOfComplianceApprovalEscalatedVerificationsSearch}
        setState={setHeadOfComplianceApprovalEscalatedVerificationsSearch}
      />
    ),
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
    onHeaderCell: () => nowrapCell(90, 110),
    onCell: () => nowrapCell(90, 110),
  },

  /* --------------------- Status --------------------- */
  {
    title: (
      <StatusColumnTitle
        state={headOfComplianceApprovalEscalatedVerificationsSearch}
        setState={setHeadOfComplianceApprovalEscalatedVerificationsSearch}
      />
    ),
    dataIndex: "status",
    key: "status",
    ellipsis: true,
    width: 140,
    filteredValue: headOfComplianceApprovalEscalatedVerificationsSearch?.status
      ?.length
      ? headOfComplianceApprovalEscalatedVerificationsSearch.status
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
            fontSize: "12px",
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
      <span className="text-gray-600" title={date || "—"}>
        {formatApiDateTime(date) || "—"}
      </span>
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
