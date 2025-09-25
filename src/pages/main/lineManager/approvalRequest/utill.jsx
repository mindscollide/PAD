// components/pages/employee/approval/tableColumns.js

import React from "react";
import { Tag, Tooltip } from "antd";
import { Button, StatusFilterDropdown } from "../../../../components";
import style from "./approvalRequest.module.css";
import EscalatedIcon from "../../../../assets/img/escalated.png";
import ArrowUP from "../../../../assets/img/arrow-up-dark.png";
import ArrowDown from "../../../../assets/img/arrow-down-dark.png";
import { ArrowsAltOutlined } from "@ant-design/icons";
import TypeColumnTitle from "../../../../components/dropdowns/filters/typeColumnTitle";
import StatusColumnTitle from "../../../../components/dropdowns/filters/statusColumnTitle";
import { useGlobalModal } from "../../../../context/GlobalModalContext";
import {
  dashBetweenApprovalAssets,
  formatApiDateTime,
} from "../../../../commen/funtions/rejex";
// import TypeColumnTitle from "./typeFilter";

/**
 * Returns the appropriate sort icon based on current sort state
 *
 * @param {string} columnKey - The column's key
 * @param {object} sortedInfo - Current sort state from the table
 * @returns {JSX.Element} The sort icon
 */
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
  return <ArrowsAltOutlined className="custom-sort-icon" />;
};

const withSortIcon = (label, columnKey, sortedInfo) => (
  <div className={style["table-header-wrapper"]}>
    <span className={style["table-header-text"]}>{label}</span>
    <span className={style["table-header-icon"]}>
      {getSortIcon(columnKey, sortedInfo)}
    </span>
  </div>
);

export const getBorderlessLineManagerTableColumns = (
  approvalStatusMap,
  sortedInfo,
  lineManagerApprovalSearch,
  setLineManagerApprovalSearch,
  setViewDetailLineManagerModal,
  setIsSelectedViewDetailLineManager
) => [
  {
    title: withSortIcon("Approval ID", "tradeApprovalID", sortedInfo),
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
    render: (tradeApprovalID) => {
      return (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span className="font-medium">
            {dashBetweenApprovalAssets(tradeApprovalID)}
            {/* {dashBetweenApprovalAssets("REQ888888")} */}
          </span>
        </div>
      );
    },
  },
  {
    title: <div>Requester Name {getSortIcon("requesterName", sortedInfo)}</div>,
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
    render: (text) => (
      <div>
        <span className="font-medium">{text}</span>
      </div>
    ),
  },
  {
    title: withSortIcon("Instrument", "instrumentName", sortedInfo),
    dataIndex: "instrument",
    key: "instrumentName",
    ellipsis: true,
    sorter: (a, b) => {
      const nameA = a.instrument?.instrumentCode || "";
      const nameB = b.instrument?.instrumentCode || "";
      return nameA.localeCompare(nameB);
    },
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "instrumentName" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (instrument, record) => {
      console.log(record, "Checkerrrrr");
      const assetCode = record?.assetType?.assetTypeShortCode;
      const code = instrument?.instrumentCode || "";
      const instrumentName = instrument?.instrumentName || "";

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
    title: withSortIcon("Date & Time", "requestDateTime", sortedInfo),
    dataIndex: "requestDateTime",
    key: "requestDateTime",

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
    render: (date) => (
      <span className="text-gray-600">{formatApiDateTime(date)}</span>
    ),
  },
  {
    title: (
      <TypeColumnTitle
        state={lineManagerApprovalSearch}
        setState={setLineManagerApprovalSearch}
      />
    ),
    dataIndex: "type",
    key: "type",
    width: "8%",
    ellipsis: true,
    filteredValue: lineManagerApprovalSearch.type?.length
      ? lineManagerApprovalSearch.type
      : null,
    onFilter: () => true,
    render: (type) => (
      <span className={type === "Buy" ? "text-green-600" : "text-red-600"}>
        {type}
      </span>
    ),
  },
  {
    title: (
      <StatusColumnTitle
        state={lineManagerApprovalSearch}
        setState={setLineManagerApprovalSearch}
      />
    ),
    dataIndex: "status",
    key: "status",
    ellipsis: true,
    align: "center",
    filteredValue: lineManagerApprovalSearch.status?.length
      ? lineManagerApprovalSearch.status
      : null,
    onFilter: () => true,
    render: (status) => {
      console.log(status, "checkerStateus");
      const tag = approvalStatusMap[status] || {};
      return (
        <Tag
          style={{
            backgroundColor: tag.backgroundColor,
            color: tag.textColor,
            whiteSpace: "nowrap", // prevent wrapping
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "inline-block",
            // maxWidth: "100%", // tag respects parent cell width
          }}
          className="border-less-table-orange-status"
        >
          {tag.label}
        </Tag>
      );
    },
  },
  {
    title: withSortIcon("Quantity", "quantity", sortedInfo),
    dataIndex: "quantity",
    key: "quantity",
    width: "8%",
    ellipsis: true,
    sorter: (a, b) => a.quantity - b.quantity,
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "quantity" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (q) => <span className="font-medium">{q.toLocaleString()}</span>,
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
