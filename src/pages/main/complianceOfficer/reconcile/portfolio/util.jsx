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
import { formatApiDateTime, toYYMMDD } from "../../../../../common/funtions/rejex";
import { useGlobalModal } from "../../../../../context/GlobalModalContext";
import { usePortfolioContext } from "../../../../../context/portfolioContax";
import { getTradeTypeById } from "../../../../../common/funtions/type";
import { mapBuySellToIds, mapStatusToIds } from "../../../../../components/dropdowns/filters/utils";

const { Text } = Typography;


/**
 * Build API request payload from search/filter state.
 *
 * @param {Object} searchState - The current filter/search state
 * @param {Object} assetTypeListingData - Asset type data for mapping buy/sell
 * @returns {Object} - API request payload
 */
export const buildApiRequest = (searchState = {}, assetTypeListingData) => {
  const startDate = searchState.startDate ? toYYMMDD(searchState.startDate) : "";
  const endDate = searchState.endDate ? toYYMMDD(searchState.endDate) : "";

  const typeIds = mapBuySellToIds(searchState.type, assetTypeListingData?.Equities);
  const statusIds = mapStatusToIds(searchState.status);

  return {
    RequesterName: searchState.requesterName || "",
    InstrumentName:
      searchState.mainInstrumentName || searchState.instrumentName || "",
    Quantity: searchState.quantity ? Number(searchState.quantity) : 0,
    StartDate: startDate,
    EndDate: endDate,
    StatusIds: statusIds || [],
    TypeIds: typeIds || [],
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
    approvalID: item?.approvalID ?? "—",
    requesterName: item?.requesterName ?? "—",
    assetTypeShortCode: item?.assetType?.assetTypeShortCode ?? "—",
    instrument: item?.instrument?.instrumentCode ?? "—",
    instrumentName: item?.instrument?.instrumentName ?? "—",
    tradeApprovalID: item?.tradeApprovalID ?? "—",
    transactionRequestDateime:
      [item?.requestDate, item?.requestTime].filter(Boolean).join(" ") || "—",
    quantity: item?.quantity ?? "—",
    type: getTradeTypeById(assetTypeData, item?.tradeType) ?? "—",
    status: item?.approvalStatus?.approvalStatusName ?? "—",
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
 * Generates column definitions for the Reconcile (Pending Approval) table.
 *
 * Features:
 * - Sorting with custom icons
 * - Ellipsis handling
 * - Fallback values for missing data
 * - External filter dropdowns for trade type & status
 *
 * @param {Object} approvalStatusMap - Map of statuses (`status -> { label, backgroundColor, textColor }`).
 * @param {Object} sortedInfo - Ant Design Table sort state.
 * @param {Object} complianceOfficerReconcilePortfolioSearch - Current filter/search state.
 * @param {Function} setComplianceOfficerReconcilePortfolioSearch - Setter to update filter/search state.
 * @returns {Array<Object>} AntD `Table` column configs.
 */
export const getBorderlessTableColumns = ({
  approvalStatusMap = {},
  sortedInfo = {},
  complianceOfficerReconcilePortfolioSearch = {},
  setComplianceOfficerReconcilePortfolioSearch = () => {},
  setIsViewDetail,
  handleViewDetailsForReconcileTransaction,
}) => [
  // 🔹 Requester Name
  {
    title: (
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        Requester Name{getSortIcon("requesterName", sortedInfo)}
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
    onHeaderCell: () => nowrapCell(70, 150),
    onCell: () => nowrapCell(70, 150),
  },

  // 🔹 Instrument
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
      const code = record?.instrument || "—";
      const name = record?.instrumentName || "—";
      const assetCode = record?.assetTypeShortCode || "";

      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
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

  // 🔹 Date & Time
  {
    title: (
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        Upload date & time{" "}
        {getSortIcon("transactionRequestDateime", sortedInfo)}
      </div>
    ),
    dataIndex: "transactionRequestDateime",
    key: "transactionRequestDateime",
    ellipsis: true,
    sorter: (a, b) =>
      (a?.transactionRequestDateime || "").localeCompare(
        b?.transactionRequestDateime || ""
      ),
    sortOrder:
      sortedInfo?.columnKey === "transactionRequestDateime"
        ? sortedInfo.order
        : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (date) => (
      <span className="text-gray-600" title={date || "—"}>
        {formatApiDateTime(date) || "—"}
      </span>
    ),
  },

  // 🔹 Quantity
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

  // 🔹 Trade Type
  {
    title: (
      <TypeColumnTitle
        state={complianceOfficerReconcilePortfolioSearch}
        setState={setComplianceOfficerReconcilePortfolioSearch}
      />
    ),
    dataIndex: "type",
    key: "type",
    ellipsis: true,
    filteredValue: complianceOfficerReconcilePortfolioSearch?.type?.length
      ? complianceOfficerReconcilePortfolioSearch.type
      : null,
    onFilter: () => true,
    render: (type) => <span title={type || "—"}>{type || "—"}</span>,
    onHeaderCell: () => nowrapCell(100, 100),
    onCell: () => nowrapCell(100, 100),
  },

  // 🔹 Status
  {
    title: (
      <StatusColumnTitle
        state={complianceOfficerReconcilePortfolioSearch}
        setState={setComplianceOfficerReconcilePortfolioSearch}
      />
    ),
    dataIndex: "status",
    key: "status",
    ellipsis: true,
    filteredValue: complianceOfficerReconcilePortfolioSearch?.status?.length
      ? complianceOfficerReconcilePortfolioSearch.status
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

  // 🔹 Actions
  {
    title: "",
    key: "actions",
    align: "center",
    render: (text, record) => {
      //Global State to selected data to show in ViewDetailModal
      const { setViewDetailPortfolioTransaction } = useGlobalModal();
      const { setSelectedPortfolioTransactionData } = usePortfolioContext();

      return (
        <Button
          className="big-blue-button"
          text="View Details"
          onClick={() => {
            setSelectedPortfolioTransactionData(record);
            handleViewDetailsForReconcileTransaction(record?.approvalID);
            setViewDetailPortfolioTransaction(true);
          }}
        />
      );
    },
  },
];
