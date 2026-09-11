// columns.js
import React from "react";
import { Tag, Tooltip } from "antd";
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
  // FIXED: the search field/active-filter chip show the user-facing
  // dashed form ("TRX-000014", same as the table's own Transaction ID
  // column), but the API expects it undashed ("TRX000014") - strip the
  // dash only here, at request-build time, so the stored search state
  // (and its chip) keeps showing the dash.
  RequestID: (searchState.requestID || "").replace(/-/g, ""),
  InstrumentName: searchState.instrumentName || "",
  RequesterName: searchState.requesterName || "",
  StartDate: searchState.startDate ? toYYMMDD(searchState.startDate) : null,
  EndDate: searchState.endDate ? toYYMMDD(searchState.endDate) : null,
  Type: searchState.type || [],
  Status: searchState.status || [],
  Quantity: searchState.quantity ? Number(searchState.quantity) : 0,
  // ADDED (2026-08-17): GetHOCMyActionsWorkflowDetail's new optional Nature
  // filter (API_Changes/2026-08-04_hta_hoc_my_actions_timeline.md) -
  // display-facing strings ("Transaction"/"Portfolio"), narrows HOC's
  // otherwise-combined list. Omitting/empty keeps existing combined
  // behavior - safe default.
  Nature: searchState.nature || [],
  PageNumber: Number(searchState.pageNumber) || 0,
  Length: Number(searchState.pageSize) || 10,
});

export const getMyActionsColumn = (approvalStatusMap, sortedInfo) => [
  {
    title: withSortIcon("Transaction ID", "approvalID", sortedInfo),
    dataIndex: "approvalID",
    key: "approvalID",
    width: 150,
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
    width: 140,
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
              title={code}
            >
              {code}
            </span>
          </Tooltip>
        </div>
      );
    },
  },
  {
    title: withSortIcon("Requester Name", "requesterName", sortedInfo),
    dataIndex: "requesterName",
    key: "requesterName",
    width: 165,
    align: "left",
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
      "creationTimeAndTime",
      sortedInfo
    ),
    dataIndex: "creationTimeAndTime",
    key: "creationTimeAndTime",
    width: 265,
    align: "center",
    sorter: (a, b) =>
      (a?.creationTimeAndTime || "").localeCompare(
        b?.creationTimeAndTime || ""
      ),
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "creationTimeAndTime" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (date) => (
      <span className="text-gray-600">{formatApiDateTime(date) || "—"}</span>
    ),
  },
  {
    title: withSortIcon("Nature", "nature", sortedInfo),
    dataIndex: "nature",
    key: "nature",
    width: 140,
    align: "left",
    sorter: (a, b) => a.nature.localeCompare(b.nature),
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "nature" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text) => <span className="font-medium">{text || "-"}</span>,
  },
  {
    title: withSortIcon("Type", "type", sortedInfo),
    dataIndex: "type",
    key: "type",
    width: 90,
    align: "left",
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
    width: 120,
    align: "center",
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
    width: 160,
    align: "left",
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
