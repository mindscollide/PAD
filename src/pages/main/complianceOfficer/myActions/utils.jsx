// columns.js
import ArrowUP from "../../../../assets/img/arrow-up-dark.png";
import ArrowDown from "../../../../assets/img/arrow-down-dark.png";
import DefaultColumArrow from "../../../../assets/img/default-colum-arrow.png";
import React from "react";
import { Tag, Tooltip } from "antd";
import style from "./co-myActions.module.css";
import {
  dashBetweenApprovalAssets,
  formatApiDateTime,
  toYYMMDD,
} from "../../../../common/funtions/rejex";
import { withSortIcon } from "../../../../common/funtions/tableIcon";

/**
 * Utility: Build API request payload for approval listing
 *
 * @param {Object} searchState - Current search/filter state
 * @param {Object} assetTypeListingData - Extra request metadata (optional)
 * @returns {Object} API-ready payload
 */

export const buildMyActionApiRequest = (searchState = {}) => ({
  RequestID: searchState.requestID || "",
  InstrumentName: searchState.instrumentName || "",
  RequesterName: searchState.requesterName || "",
  StartDate: searchState.startDate ? toYYMMDD(searchState.startDate) : null,
  EndDate: searchState.endDate ? toYYMMDD(searchState.endDate) : null,
  Type: searchState.type || [],
  Status: searchState.status || [],
  Quantity: searchState.quantity ? Number(searchState.quantity) : 0,
  PageNumber: Number(searchState.pageNumber) || 0,
  Length: Number(searchState.pageSize) || 10,
});

export const getMyActionsColumn = (approvalStatusMap, sortedInfo) => [
  {
    title: withSortIcon("Transaction ID", "approvalID", sortedInfo),
    dataIndex: "approvalID",
    key: "approvalID",
    ellipsis: true,
    align: "left",
    width: 180,
    sorter: (a, b) =>
      parseInt(a.approvalID.replace(/[^\d]/g, ""), 10) -
      parseInt(b.approvalID.replace(/[^\d]/g, ""), 10),
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "approvalID" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (approvalID) => {
      return (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span className="font-medium">
            {dashBetweenApprovalAssets(approvalID)}
          </span>
        </div>
      );
    },
  },
  {
    title: withSortIcon("Instrument", "instrumentName", sortedInfo),
    dataIndex: "instrumentName",
    key: "instrumentName",
    align: "left",
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
          <Tooltip title={instrumentName} placement="topLeft">
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
    title: withSortIcon("Nature", "nature", sortedInfo),
    dataIndex: "nature",
    key: "nature",
    width: 120,
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
    title: withSortIcon("Requester Name", "requesterName", sortedInfo),
    dataIndex: "requesterName",
    key: "requesterName",
    width: 180,
    align: "left",
    ellipsis: true,
    sorter: (a, b) => a.requesterName.localeCompare(b.requesterName),
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "requesterName" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text) => <span className="font-medium">{text}</span>,
  },
  {
    title: withSortIcon(
      "Date & Time of Approval Request",
      "approvalDateTime",
      sortedInfo,
      "center"
    ),
    dataIndex: "approvalDateTime",
    key: "approvalDateTime",
    width: "280px",
    align: "center",
    ellipsis: true,
    sorter: (a, b) =>
      (a?.approvalDateTime || "").localeCompare(b?.approvalDateTime || ""),
    sortOrder:
      sortedInfo?.columnKey === "approvalDateTime" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (date, record) => (
      <span className="text-gray-600">{formatApiDateTime(date) || "—"}</span>
    ),
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
    title: withSortIcon("Quantity", "quantity", sortedInfo, "center"),
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
    width: 180,
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
