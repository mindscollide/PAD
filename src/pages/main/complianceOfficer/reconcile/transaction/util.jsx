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
import { formatApiDateTime } from "../../../../../commen/funtions/rejex";
import TypeColumnTitle from "../../../../../components/dropdowns/filters/typeColumnTitle";
import StatusColumnTitle from "../../../../../components/dropdowns/filters/statusColumnTitle";
import { useGlobalModal } from "../../../../../context/GlobalModalContext";
import { useReconcileContext } from "../../../../../context/reconsileContax";

/* ------------------------------------------------------------------ */
/* 🔹 Trade Type Resolver */
/* ------------------------------------------------------------------ */
/**
 * Resolves trade type label by matching the given `tradeType` ID
 * with the API-provided `assetTypeData`.
 *
 * @param {Object} assetTypeData - Asset type API response object.
 * @param {Array<Object>} assetTypeData.items - Array of trade approval types.
 * @param {Object} tradeType - Trade type object (with typeID).
 * @param {string|number} tradeType.typeID - Trade type ID.
 * @returns {string} The trade type label (e.g., "Buy", "Sell") or "—".
 */
export const getTradeTypeById = (assetTypeData, tradeType) => {
  if (!Array.isArray(assetTypeData?.items)) return "—";
  return (
    assetTypeData.items.find((i) => i.tradeApprovalTypeID === tradeType.typeID)
      ?.type || "—"
  );
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
    approvalID: item?.approvalID,
    instrumentCode: item?.instrument?.instrumentCode || "—",
    instrumentName: item?.instrument?.instrumentName || "—",
    assetTypeShortCode: item?.assetType?.assetTypeShortCode || "—",
    transactionDate:
      [item?.requestDate, item?.requestTime].filter(Boolean).join(" ") || "—",
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
 * @param {Object} complianceOfficerReconcileTransactionsSearch - Current filter state for the table.
 * @param {Function} setComplianceOfficerReconcileTransactionsSearch - Setter to update filter state.
 * @returns {Array<Object>} Column configurations for AntD Table.
 */
export const getBorderlessTableColumns = ({
  approvalStatusMap = {},
  sortedInfo = {},
  complianceOfficerReconcileTransactionsSearch = {},
  setComplianceOfficerReconcileTransactionsSearch = () => {},
  handleViewDetailsForReconcileTransaction,
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
    title: (
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        Instrument {getSortIcon("instrumentCode", sortedInfo)}
      </div>
    ),
    dataIndex: "instrumentCode",
    key: "instrumentCode",
    ellipsis: true,
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
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span className="custom-shortCode-asset" style={{ minWidth: 30 }}>
            {assetCode?.substring(0, 2).toUpperCase()}
          </span>
          <Tooltip title={name} placement="topLeft">
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
    onHeaderCell: () => nowrapCell(40, 150),
    onCell: () => nowrapCell(40, 150),
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
    title: (
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        Quantity {getSortIcon("quantity", sortedInfo)}
      </div>
    ),
    dataIndex: "quantity",
    key: "quantity",
    align: "left",
    sorter: (a, b) => (a?.quantity ?? 0) - (b?.quantity ?? 0),
    sortOrder: sortedInfo?.columnKey === "quantity" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (q) => <span className="font-medium">{q.toLocaleString()}</span>,
    onHeaderCell: () => nowrapCell(80, 120),
    onCell: () => nowrapCell(80, 120),
  },

  /* --------------------- Trade Type --------------------- */
  {
    title: (
      <TypeColumnTitle
        state={complianceOfficerReconcileTransactionsSearch}
        setState={setComplianceOfficerReconcileTransactionsSearch}
      />
    ),
    dataIndex: "type",
    key: "type",
    ellipsis: true,
    filteredValue: complianceOfficerReconcileTransactionsSearch?.type?.length
      ? complianceOfficerReconcileTransactionsSearch.type
      : null,
    onFilter: () => true,
    render: (type) => <span title={type || "—"}>{type || "—"}</span>,
    onHeaderCell: () => nowrapCell(100, 100),
    onCell: () => nowrapCell(100, 100),
  },

  /* --------------------- Status --------------------- */
  {
    title: (
      <StatusColumnTitle
        state={complianceOfficerReconcileTransactionsSearch}
        setState={setComplianceOfficerReconcileTransactionsSearch}
      />
    ),
    dataIndex: "status",
    key: "status",
    ellipsis: true,
    filteredValue: complianceOfficerReconcileTransactionsSearch?.status?.length
      ? complianceOfficerReconcileTransactionsSearch.status
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

  /* --------------------- Escalated Icon --------------------- */
  {
    title: "",
    dataIndex: "isEscalated",
    key: "isEscalated",
    ellipsis: true,
    render: (date) =>
      date && (
        <img
          draggable={false}
          src={EscalatedIcon}
          alt="escalated"
          className={style["escalated-icon"]}
        />
      ),
  },

  /* --------------------- Actions --------------------- */
  {
    title: "",
    key: "actions",
    align: "center",
    render: (text, record) => {
      console.log(record, "Checekcneceucyv");
      const { setViewDetailReconcileTransaction } = useGlobalModal();
      const { setSelectedReconcileTransactionData } = useReconcileContext();
      return (
        <Button
          className="big-blue-button"
          text="View Details"
          onClick={() => {
            setSelectedReconcileTransactionData(record);
            handleViewDetailsForReconcileTransaction(record?.approvalID);
            setViewDetailReconcileTransaction(true);
          }}
        />
      );
    },
  },
];
