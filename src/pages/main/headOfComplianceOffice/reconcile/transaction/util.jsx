// utils.jsx (Reconcile Portfolio)
import React from "react";
import { Tag, Tooltip } from "antd";
import { Button } from "../../../../../components";

// Assets (sort icons)
import DefaultColumnArrow from "../../../../../assets/img/default-colum-arrow.png";
import ArrowUp from "../../../../../assets/img/arrow-up-dark.png";
import ArrowDown from "../../../../../assets/img/arrow-down-dark.png";

// Helpers
import { formatApiDateTime } from "../../../../../commen/funtions/rejex";
import TypeColumnTitle from "../../../../../components/dropdowns/filters/typeColumnTitle";
import StatusColumnTitle from "../../../../../components/dropdowns/filters/statusColumnTitle";

/* ------------------------------------------------------------------ */
/* 🔹 Sort Icon Helper */
/* ------------------------------------------------------------------ */
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
 * Maps reconcile portfolio API data to AntD table rows.
 *
 * @param {Array<Object>} list - API response data array.
 * @returns {Array<Object>} Transformed table rows.
 */
export const mapToTableRows = (list = []) =>
  (Array.isArray(list) ? list : []).map((item = {}) => ({
    reconcileID: item?.reconcileID || `row-${Math.random()}`,
    portfolioName: item?.portfolioName || "—",
    instrumentCode: item?.instrument?.instrumentShortCode || "—",
    instrumentName: item?.instrument?.instrumentName || "—",
    assetTypeShortCode: item?.assetType?.assetTypeShortCode || "—",
    transactionDate:
      [item?.transactionDate, item?.transactionTime]
        .filter(Boolean)
        .join(" ") || "—",
    quantity: item?.quantity ?? 0,
    status: item?.status || "—",
  }));

/* ------------------------------------------------------------------ */
/* 🔹 Style Helpers */
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
export const getBorderlessTableColumns = (
  approvalStatusMap = {},
  sortedInfo = {},
  filterState = {},
  setFilterState = () => {}
) => [
  // 🔹 Requester Name
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
        <div className="flex items-center gap-3">
          <span className="custom-shortCode-asset min-w-[30px]">
            {assetCode.substring(0, 2).toUpperCase()}
          </span>
          <Tooltip title={name} placement="topLeft">
            <span
              className="font-medium truncate inline-block cursor-pointer"
              style={{ maxWidth: 200 }}
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
        Date & Time {getSortIcon("transactionRequestDateime", sortedInfo)}
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
    align: "right",
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
    title: <TypeColumnTitle state={filterState} setState={setFilterState} />,
    dataIndex: "type",
    key: "type",
    ellipsis: true,
    filteredValue: filterState?.type?.length ? filterState.type : null,
    onFilter: () => true,
    render: (type) => <span title={type || "—"}>{type || "—"}</span>,
    onHeaderCell: () => nowrapCell(100, 100),
    onCell: () => nowrapCell(100, 100),
  },

  // 🔹 Status
  {
    title: <StatusColumnTitle state={filterState} setState={setFilterState} />,
    dataIndex: "status",
    key: "status",
    ellipsis: true,
    filteredValue: filterState?.status?.length ? filterState.status : null,
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
    width: "15%",
    render: (record) =>
      record?.status === "Non Compliant" ? (
        <Button className="big-white-button" text="Comments" />
      ) : null,
  },
];
