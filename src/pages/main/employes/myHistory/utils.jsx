// columns.js
import ArrowUP from "../../../../assets/img/arrow-up-dark.png";
import ArrowDown from "../../../../assets/img/arrow-down-dark.png";
import DefaultColumArrow from "../../../../assets/img/default-colum-arrow.png";
import React from "react";
import TypeColumnTitle from "../../../../components/dropdowns/filters/typeColumnTitle";
import StatusColumnTitle from "../../../../components/dropdowns/filters/statusColumnTitle";
import { Tag, Tooltip } from "antd";
import style from "./myHistory.module.css";
import {
  dashBetweenApprovalAssets,
  formatApiDateTime,
  toYYMMDD,
} from "../../../../common/funtions/rejex";
const getSortIcon = (columnKey, sortedInfo) => {
  if (sortedInfo?.columnKey === columnKey) {
    return sortedInfo.order === "ascend" ? (
      <img
        draggable={false}
        src={ArrowDown}
        alt="Asc"
        className="custom-sort-icon"
      />
    ) : (
      <img
        draggable={false}
        src={ArrowUP}
        alt="Desc"
        className="custom-sort-icon"
      />
    );
  }
  return (
    <img
      draggable={false}
      src={DefaultColumArrow}
      alt="Default"
      className="custom-sort-icon"
    />
  );
};

// Helper for consistent column titles
const withSortIcon = (label, columnKey, sortedInfo) => (
  <div className={style["table-header-wrapper"]}>
    <span className={style["table-header-text"]}>{label}</span>
    <span className={style["table-header-icon"]}>
      {getSortIcon(columnKey, sortedInfo)}
    </span>
  </div>
);

/**
 * Utility: Build API request payload for approval listing
 *
 * @param {Object} searchState - Current search/filter state
 * @param {Object} assetTypeListingData - Extra request metadata (optional)
 * @returns {Object} API-ready payload
 */

export const buildMyHistoryApiRequest = (searchState = {}) => ({
  RequestID: searchState.requestID || "",
  InstrumentName: searchState.instrumentName || "",
  Quantity: searchState.quantity ? Number(searchState.quantity) : 0,
  StartDate: searchState.startDate ? toYYMMDD(searchState.startDate) : null,
  EndDate: searchState.endDate ? toYYMMDD(searchState.endDate) : null,
  Nature: searchState.nature || "",
  StatusIDs: searchState.status || [],
  TradeApprovalTypeIDs: searchState.type || [],
  PageNumber: Number(searchState.pageNumber) || 0,
  Length: Number(searchState.pageSize) || 10,
});

export const getMyHistoryColumn = (
  approvalStatusMap,
  sortedInfo,
) => [
  {
    title: withSortIcon(
      "Request/Transaction ID",
      "tradeApprovalID",
      sortedInfo
    ),
    dataIndex: "tradeApprovalID",
    key: "tradeApprovalID",
    ellipsis: true,
    width: "200px",
    sorter: (a, b) =>
      parseInt(a.tradeApprovalID.replace(/[^\d]/g, ""), 10) -
      parseInt(b.tradeApprovalID.replace(/[^\d]/g, ""), 10),
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "tradeApprovalID" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (tradeApprovalID) => {
      return (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span className="font-medium">
            {dashBetweenApprovalAssets(tradeApprovalID)}
          </span>
        </div>
      );
    },
  },
  {
    title: withSortIcon("Instrument", "instrumentName", sortedInfo),
    dataIndex: "instrumentName",
    key: "instrumentName",
    width: "140px",
    ellipsis: true,
    sorter: (a, b) => {
      const nameA = a?.instrumentShortCode || "";
      const nameB = b?.instrumentShortCode || "";
      return nameA.localeCompare(nameB);
    },
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "instrumentName" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (instrument, record) => {
      const assetCode = record?.assetShortCode;
      const code = record?.instrumentShortCode || "";
      const instrumentName = record?.instrumentName || "";

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
          <Tooltip title={`${instrumentName} - ${code}`} placement="topLeft">
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
  },
  {
    title: withSortIcon(
      "Date & Time of Approval Request",
      "approvalDateTime",
      sortedInfo
    ),
    dataIndex: "approvalDateTime",
    key: "approvalDateTime",
    width: "280px",
    align: "left",
    ellipsis: true,
    sorter: (a, b) => {
      const dateA = new Date(`${a.creationDate} ${a.creationTime}`).getTime();
      const dateB = new Date(`${b.creationDate} ${b.creationTime}`).getTime();
      return dateA - dateB;
    },
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "approvalDateTime" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (_, record) => (
      <span className="text-gray-600">
        {formatApiDateTime(`${record.creationDate} ${record.creationTime}`)}
      </span>
    ),
  },
  {
    title: withSortIcon("Nature", "nature", sortedInfo),
    dataIndex: "nature",
    key: "nature",
    width: "160px",
    align: "left",
    ellipsis: true,
    sorter: (a, b) => a.nature.localeCompare(b.nature),
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "nature" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text) => <span className="font-medium">{text}</span>,
  },
  {
    title: withSortIcon("Type", "type", sortedInfo),
    dataIndex: "type",
    key: "type",
    width: "100px",
    align: "left",
    ellipsis: true,
    sorter: (a, b) => a.type.localeCompare(b.type),
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "type" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text) => <span className="font-medium">{text}</span>,
  },
  {
    title: withSortIcon("Quantity", "quantity", sortedInfo),
    dataIndex: "quantity",
    key: "quantity",
    width: "180px",
    align: "center",
    ellipsis: true,
    sorter: (a, b) => a.quantity - b.quantity,
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "quantity" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (q) => <span className="font-medium">{q.toLocaleString()}</span>,
  },
  {
    title: withSortIcon("Status", "status", sortedInfo),
    dataIndex: "status",
    key: "status",
    width: "160px",
    align: "left",
    ellipsis: true,
    sorter: (a, b) => a.status.localeCompare(b.status),
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "status" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (status) => {
      const tag = approvalStatusMap[status] || {};
      return (
        <Tag
          style={{
            backgroundColor: tag.backgroundColor,
            color: tag.textColor,
          }}
          className="border-less-table-orange-status"
        >
          {tag.label}
        </Tag>
      );
    },
  },
];
