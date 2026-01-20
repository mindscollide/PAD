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
    quantity = 0,
    startDate = null,
    endDate = null,
    status = [],
    type = [],
    pageNumber = 0,
    pageSize = 10,
  } = searchState;

  return {
    InstrumentName: instrumentName.trim(),
    RequesterName: requesterName.trim(),
    Quantity: quantity ? (Number(quantity) === 0 ? "" : Number(quantity)) : "",
    StartDate: startDate ? toYYMMDD(startDate) : "",
    EndDate: endDate ? toYYMMDD(endDate) : "",
    // StatusIds: mapStatusToIds?.(status) || [],
    TypeIds: mapBuySellToIds?.(type, assetTypeListingData?.Equities) || [],
    PageNumber: Number(pageNumber) || 0,
    Length: Number(pageSize) || 10,
  };
};

export const mapApiResopse = (assetTypeData, pendingApprovals = []) =>
  (Array.isArray(pendingApprovals) ? pendingApprovals : []).map(
    (item = {}) => ({
      key: item.workFlowID,
      tradeApprovalID: item?.tradeApprovalID ?? "—",
      requesterName: item.requesterName,
      assetTypeShortCode: item?.assetType?.assetTypeShortCode ?? "—",
      instrument: item?.instrument?.instrumentCode ?? "—",
      instrumentName: item?.instrument?.instrumentName ?? "—",
      requestDateTime: `${item.requestDate || ""} ${item.requestTime || ""}`,
      isEscalated: item.isEscalated,
      type: getTradeTypeById(assetTypeData, item?.tradeType),
      status: item?.approvalStatus?.approvalStatusName ?? "—",

      quantity: item.quantity || 0,
    })
  );

export const getBorderlessLineManagerTableColumns = ({
  approvalStatusMap,
  sortedInfo,
  lMPendingApprovalReportsSearch,
  setLMPendingApprovalReportsSearch,
  setViewDetailLineManagerModal,
  setIsSelectedViewDetailLineManager,
  handleViewDetailsForLineManager,
}) => [
  {
    title: withSortIcon("Approval ID", "tradeApprovalID", sortedInfo),
    align: "left",
    dataIndex: "tradeApprovalID",
    key: "tradeApprovalID",
    width: "10%",
    ellipsis: true,
    sorter: (a, b) =>
      parseInt(a.tradeApprovalID.replace(/[^\d]/g, ""), 10) -
      parseInt(b.tradeApprovalID.replace(/[^\d]/g, ""), 10),
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "tradeApprovalID" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (tradeApprovalID, record) => {
      return (
        <div
          id={`cell-${record.key}-tradeApprovalID`}
          style={{ display: "flex", alignItems: "center", gap: "12px" }}
        >
          <span className="font-medium">
            {dashBetweenApprovalAssets(tradeApprovalID)}
          </span>
        </div>
      );
    },
  },
  {
    title: withSortIcon("Requester Name", "requesterName", sortedInfo),
    align: "left",
    dataIndex: "requesterName",
    key: "requesterName",
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
        <div id={`cell-${record.key}-requesterName`}>
          <span className="font-medium">{text}</span>
        </div>
      );
    },
  },
  {
    title: withSortIcon("Instrument Name", "instrumentCode", sortedInfo),
    align: "left",
    dataIndex: "instrumentCode",
    key: "instrumentCode",
    width: 200,
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
  },
  {
    title: withSortIcon(
      "Request Date & Time",
      "requestDateTime",
      sortedInfo,
      "center"
    ),
    dataIndex: "requestDateTime",
    key: "requestDateTime",
    align: "center",
    ellipsis: true,
    sorter: (a, b) =>
      formatApiDateTime(a.requestDateTime).localeCompare(
        formatApiDateTime(b.requestDateTime)
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
        state={lMPendingApprovalReportsSearch}
        setState={setLMPendingApprovalReportsSearch}
      />
    ),
    dataIndex: "type",
    key: "type",
    width: "8%",
    ellipsis: true,
    filteredValue: lMPendingApprovalReportsSearch.type?.length
      ? lMPendingApprovalReportsSearch.type
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
    align: "center",
    dataIndex: "quantity",
    key: "quantity",
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
                handleViewDetailsForLineManager(record?.key);
                setIsSelectedViewDetailLineManager(record);
                setViewDetailLineManagerModal(true);
              }}
            />
          </div>
        </>
      );
    },
  },
];
