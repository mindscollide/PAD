// components/pages/employee/approval/tableColumns.js

import React from "react";
import { Tag, Tooltip } from "antd";
import { Button, StatusFilterDropdown } from "../../../../../components";
import style from "./pendingRequest.module.css";
import EscalatedIcon from "../../../../../assets/img/escalated.png";
import ArrowUP from "../../../../../assets/img/arrow-up-dark.png";
import ArrowDown from "../../../../../assets/img/arrow-down-dark.png";
import DefaultColumArrow from "../../../../../assets/img/default-colum-arrow.png";
import TypeColumnTitle from "../../../../../components/dropdowns/filters/typeColumnTitle";
import StatusColumnTitle from "../../../../../components/dropdowns/filters/statusColumnTitle";
import {
  dashBetweenApprovalAssets,
  formatApiDateTime,
  toYYMMDD,
} from "../../../../../common/funtions/rejex";
import {
  mapBuySellToIds,
  mapStatusToIds,
} from "../../../../../components/dropdowns/filters/utils";
import { getTradeTypeById } from "../../../../../common/funtions/type";
import { withSortIcon } from "../../../../../common/funtions/tableIcon";
// import TypeColumnTitle from "./typeFilter";

/**
 * Utility: Build API request payload for approval listing.
 *
 * @param {Object} searchState - Current search/filter state
 * @param {Object} assetTypeListingData - Extra request metadata (optional)
 *
 * @returns {Object} API-ready payload
 */
export const buildApiRequest = (searchState = {}, assetTypeListingData) => {
  const {
    instrumentName = "",
    requesterName = "",
    lineManagerName = "",
    quantity = 0,
    startDate = null,
    endDate = null,
    escalatedStartDate = null,
    escalatedEndDate = null,
    type = [],
    status = [],
    pageNumber = 0,
    pageSize = 10,
  } = searchState;

  return {
    InstrumentName: instrumentName.trim(),
    RequesterName: requesterName.trim(),
    LineManagerName: lineManagerName.trim(),
    Quantity: quantity ? Number(quantity) : 0,
    RequestDateFrom: startDate ? toYYMMDD(startDate) : "",
    RequestDateTo: endDate ? toYYMMDD(endDate) : "",
    EscalatedDateFrom: escalatedStartDate ? toYYMMDD(escalatedStartDate) : "",
    EscalatedDateTo: escalatedEndDate ? toYYMMDD(escalatedEndDate) : "",
    StatusIds: mapStatusToIds?.(status) || [],
    TradeApprovalTypeIds:
      mapBuySellToIds?.(type, assetTypeListingData?.Equities) || [],
    PageNumber: Number(pageNumber) || 0,
    Length: Number(pageSize) || 10,
  };
};

export const mapApiResopse = (assetTypeData, pendingTradeApprovals = []) =>
  (Array.isArray(pendingTradeApprovals) ? pendingTradeApprovals : []).map(
    (item = {}) => ({
      approvalID: item.approvalID,
      tradeApprovalID: item?.tradeApprovalID ?? "—",
      requesterName: item.requesterName,
      lineManagerName: item.lineManagerName,
      instrumentCode: item?.instrument?.instrumentCode || "—",
      instrumentName: item?.instrument?.instrumentName || "—",
      assetTypeShortCode: item?.assetType?.assetTypeShortCode || "—",
      requestDateTime: `${item.requestDate || ""} ${item.requestTime || ""}`,
      escalatedDateTime: `${item.escalatedOnDate || ""} ${item.escalatedOnTime || ""}`,
      isEscalated: item.isEscalated,
      type: getTradeTypeById(assetTypeData, item?.tradeType),
      status: item?.approvalStatus?.approvalStatusName ?? "—",
      quantity: item.quantity || 0,
    }),
  );

export const getBorderlessLineManagerTableColumns = ({
  approvalStatusMap,
  sortedInfo,
  hTAPendingApprovalReportsSearch,
  setHTAPendingApprovalReportsSearch,
  handleViewDetailsForHTA,
  setIsSelectedViewDetailLineManager,
}) => [
  {
    title: withSortIcon("Requester Name", "requesterName", sortedInfo),
    dataIndex: "requesterName",
    key: "requesterName",
    align: "left",
    ellipsis: true,
    width: "14%",
    sorter: (a, b) => a.requesterName.localeCompare(b.requesterName),
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "requesterName" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text, record) => {
      return (
        <div
          id={`cell-${record.key}-requesterName`}
          style={{ marginLeft: "8px" }}
        >
          <span className="font-medium">{text}</span>
        </div>
      );
    },
  },
  {
    title: withSortIcon("Line Manager", "lineManagerName", sortedInfo),
    dataIndex: "lineManagerName",
    key: "lineManagerName",
    ellipsis: true,
    align: "left",
    width: "14%",
    sorter: (a, b) => a.lineManagerName.localeCompare(b.lineManagerName),
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "lineManagerName" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text, record) => {
      return (
        <div id={`cell-${record.key}-lineManagerName`}>
          <span className="font-medium">{text}</span>
        </div>
      );
    },
  },
  {
    title: withSortIcon("Instrument", "instrumentName", sortedInfo),
    dataIndex: "instrumentName",
    key: "instrumentName",
    align: "left",
    width: 140,
    ellipsis: true,
    sorter: (a, b) => {
      const nameA = a?.instrumentName || "";
      const nameB = b?.instrumentName || "";
      return nameA.localeCompare(nameB);
    },
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "instrumentName" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (instrument, record) => {
      const assetCode = record?.assetTypeShortCode;
      const code = record?.instrumentCode || "";
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
    title: withSortIcon(
      "Request Date & Time",
      "requestDateTime",
      sortedInfo,
      "center",
    ),
    dataIndex: "requestDateTime",
    key: "requestDateTime",
    align: "center",
    ellipsis: true,
    sorter: (a, b) =>
      formatApiDateTime(a.requestDateTime).localeCompare(
        formatApiDateTime(b.requestDateTime),
      ),
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "requestDateTime" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (date, record) => (
      <span id={`cell-${record.key}-requestDateTime`} className="text-gray-600">
        {formatApiDateTime(date)}
      </span>
    ),
  },
  {
    title: (
      <TypeColumnTitle
        state={hTAPendingApprovalReportsSearch}
        setState={setHTAPendingApprovalReportsSearch}
      />
    ),
    align: "center",
    dataIndex: "type",
    key: "type",
    width: "8%",
    ellipsis: true,
    filteredValue: hTAPendingApprovalReportsSearch?.type?.length
      ? hTAPendingApprovalReportsSearch?.type
      : null,
    onFilter: () => true,
    render: (type, record) => (
      <span
        id={`cell-${record.key}-type`}
        className={type === "Buy" ? "text-green-600" : "text-red-600"}
      >
        {type}
      </span>
    ),
  },
  {
    title: withSortIcon("Quantity", "quantity", sortedInfo, "center"),
    dataIndex: "quantity",
    key: "quantity",
    align: "center",
    width: "8%",
    ellipsis: true,
    sorter: (a, b) => a.quantity - b.quantity,
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "quantity" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (q, record) => (
      <span id={`cell-${record.key}-quantity`} className="font-medium">
        {q.toLocaleString()}
      </span>
    ),
  },
  {
    title: "",
    dataIndex: "isEscalated",
    key: "isEscalated",
    width: "7%",
    ellipsis: true,
    render: (isEscalated, record) => {
      console.log(record, "CheckIsEsclated");
      return isEscalated ? (
        <img
          draggable={false}
          src={EscalatedIcon}
          alt="Escalated"
          title="Escalated"
        />
      ) : null;
    },
  },
  {
    title: withSortIcon(
      "Escalated date & time",
      "escalatedDateTime",
      sortedInfo,
      "center",
    ),
    dataIndex: "escalatedDateTime",
    key: "escalatedDateTime",
    align: "center",
    ellipsis: true,
    sorter: (a, b) =>
      formatApiDateTime(a.escalatedDateTime).localeCompare(
        formatApiDateTime(b.escalatedDateTime),
      ),
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "escalatedDateTime" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (date, record) => (
      <span
        id={`cell-${record.key}-escalatedDateTime`}
        className="text-gray-600"
      >
        {formatApiDateTime(date)}
      </span>
    ),
  },
  {
    title: "",
    key: "actions",
    align: "right",
    render: (record) => {
      //Global State to selected data to show in ViewDetailLineManagerModal Statuses
      return (
        <>
          <div
            id={`cell-${record.key}-actions`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginRight: "10px",
            }}
          >
            <Button
              className="big-orange-button"
              text="View Details"
              onClick={() => {
                console.log(record, "djasvdjavdajvasjvdj");
                handleViewDetailsForHTA(record?.approvalID);
                setIsSelectedViewDetailLineManager(record);
              }}
            />
          </div>
        </>
      );
    },
  },
];
