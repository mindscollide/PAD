// columns.js
import React from "react";
import { Tag, Tooltip } from "antd";
import {
  dashBetweenApprovalAssets,
  formatApiDateTime,
  toYYMMDD,
} from "../../../../common/funtions/rejex";
import {
  mapBuySellToIds,
  mapStatusToIds,
} from "../../../../components/dropdowns/filters/utils";
import { withSortIcon } from "../../../../common/funtions/tableIcon";
import repeat from "../../../../assets/img/repeat.png";

/**
 * Utility: Build API request payload for approval listing
 *
 * @param {Object} searchState - Current search/filter state
 * @param {Object} assetTypeListingData - Extra request metadata (optional)
 * @returns {Object} API-ready payload
 */

export const buildMyHistoryApiRequest = (
  searchState = {},
  assetTypeListingData
) => ({
  RequestID: searchState.requestID || "",
  InstrumentName: searchState.instrumentName || "",
  Quantity: searchState.quantity ? Number(searchState.quantity) : 0,
  StartDate: searchState.startDate ? toYYMMDD(searchState.startDate) : null,
  EndDate: searchState.endDate ? toYYMMDD(searchState.endDate) : null,
  Nature: searchState.nature || "",
  StatusIDs: mapStatusToIds?.(searchState.status, 2) || [],
  TradeApprovalTypeIDs:
    mapBuySellToIds?.(searchState.type, assetTypeListingData?.Equities) || [],
  // GetEmployeeHistoryWorkFlowDetails's PageNumber is now a real
  // 1-indexed page number (backend fix 2026-08-05).
  PageNumber: Number(searchState.pageNumber) || 1,
  Length: Number(searchState.pageSize) || 10,
});

export const getMyHistoryColumn = (approvalStatusMap, sortedInfo) => [
  {
    title: withSortIcon(
      "Request/Transaction ID",
      "tradeApprovalID",
      sortedInfo
    ),
    align: "left",
    dataIndex: "tradeApprovalID",
    key: "tradeApprovalID",
    ellipsis: true,
    width: 250,
    sorter: (a, b) => {
      const parse = (id = "") => {
        const match = id.match(/^([A-Za-z]+)-?(\d+)$/);
        return {
          prefix: match?.[1] || "",
          number: match ? parseInt(match[2], 10) : 0,
        };
      };

      const idA = parse(a?.tradeApprovalID);
      const idB = parse(b?.tradeApprovalID);

      // Sort by prefix first (TRX vs REQ), then by number within that prefix
      const prefixCompare = idA.prefix.localeCompare(idB.prefix);
      if (prefixCompare !== 0) return prefixCompare;

      return idA.number - idB.number;
    },
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "tradeApprovalID" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (tradeApprovalID, record) => {
      return (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span className="font-medium">
            {dashBetweenApprovalAssets(tradeApprovalID)}
          </span>
          {record?.status !== "Resubmit" && record?.isResubmitLinked && (
            <Tooltip title="Part of a resubmit chain">
              <img
                draggable={false}
                src={repeat}
                alt="Resubmit"
                width={16}
                height={16}
              />
            </Tooltip>
          )}
        </div>
      );
    },
  },
  {
    title: withSortIcon("Instrument", "instrumentName", sortedInfo),
    align: "left",
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
      "creationDate",
      sortedInfo,
      "center"
    ),
    dataIndex: "creationDate",
    key: "creationDate",
    width: "280px",
    align: "center",
    sorter: (a, b) =>
      `${a.creationDate} ${a.creationTime}`.localeCompare(
        `${b.creationDate} ${b.creationTime}`
      ),
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "creationDate" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (_, record) => (
      <span className="text-gray-600">
        {formatApiDateTime(`${record.creationDate} ${record.creationTime}`)}
      </span>
    ),
  },
  {
    title: withSortIcon("Nature", "nature", sortedInfo, "center"),
    align: "center",
    dataIndex: "nature",
    key: "nature",
    width: "160px",
    sorter: (a, b) => a.nature.localeCompare(b.nature),
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "nature" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text) => <span className="font-medium">{text}</span>,
  },
  {
    // CHANGED (2026-08-20): was an inline table-header dropdown
    // (TypeColumnTitle) doing its own client-side filtering - filtering
    // now lives in the search bar (EmployeeHistoryFilter) as a proper
    // server-side filter alongside the rest, so this column is just a
    // plain sortable header now, same pattern as every other column here.
    title: withSortIcon("Type", "type", sortedInfo, "center"),
    align: "center",
    dataIndex: "type",
    key: "type",
    width: 130,
    sorter: (a, b) => (a?.type || "").localeCompare(b?.type || ""),
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "type" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (type) => <span>{type || "—"}</span>,
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
    // CHANGED (2026-08-20): same as the Type column above - was an inline
    // table-header dropdown (StatusColumnTitle), moved to the search bar
    // as a proper filter; this is now just a plain sortable header.
    title: withSortIcon("Status", "status", sortedInfo, "center"),
    align: "center",
    dataIndex: "status",
    key: "status",
    width: 220,
    sorter: (a, b) => (a?.status || "").localeCompare(b?.status || ""),
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "status" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
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
  },
];
