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
import {
  formatApiDateTime,
  toYYMMDD,
} from "../../../../../common/funtions/rejex";
import TypeColumnTitle from "../../../../../components/dropdowns/filters/typeColumnTitle";
import StatusColumnTitle from "../../../../../components/dropdowns/filters/statusColumnTitle";
import { useGlobalModal } from "../../../../../context/GlobalModalContext";
import { useReconcileContext } from "../../../../../context/reconsileContax";
import { getTradeTypeById } from "../../../../../common/funtions/type";
import {
  mapBuySellToIds,
  mapStatusToIds,
} from "../../../../../components/dropdowns/filters/utils";
import { withSortIcon } from "../../../../../common/funtions/tableIcon";

/**
 * Build API request payload from search/filter state.
 *
 * @param {Object} searchState - Current filter/search state
 * @param {Object} assetTypeListingData - Asset type data (from API)
 * @param {string} assetType - Asset type key (e.g., "Equities")
 * @returns {Object} API request payload
 */
export const buildApiRequest = (searchState = {}, assetTypeListingData) => {
  const startDate = searchState.startDate
    ? toYYMMDD(searchState.startDate)
    : "";
  const endDate = searchState.endDate ? toYYMMDD(searchState.endDate) : "";

  return {
    RequesterName: searchState.requesterName || "",
    InstrumentName: searchState.instrumentName || "",
    Quantity: searchState.quantity ? Number(searchState.quantity) : 0,
    StartDate: startDate,
    EndDate: endDate,
    StatusIds: mapStatusToIds(searchState.status,2),
    TypeIds: mapBuySellToIds(searchState.type, assetTypeListingData?.Equities),
    PageNumber: Number(searchState.pageNumber) || 0,
    Length: Number(searchState.pageSize) || 10,
  };
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
    title: withSortIcon("Requester Name", "requesterName", sortedInfo),
    dataIndex: "requesterName",
    key: "requesterName",
    ellipsis: true,
    width: 150,
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
          <Tooltip title={`${name} - ${code}`} placement="topLeft">
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
    title: withSortIcon("Date & Time", "transactionDate", sortedInfo, "center"),
    dataIndex: "transactionDate",
    key: "transactionDate",
    align: "center",
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
    title: withSortIcon("Quantity", "quantity", sortedInfo, "center"),
    dataIndex: "quantity",
    key: "quantity",
    align: "center",
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
    align: "center",
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
    align: "center",
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
