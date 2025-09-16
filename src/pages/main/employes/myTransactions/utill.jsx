import { Button } from "../../../../components";

import ArrowUP from "../../../../assets/img/arrow-up-dark.png";
import ArrowDown from "../../../../assets/img/arrow-down-dark.png";
import DefaultColumArrow from "../../../../assets/img/default-colum-arrow.png";
import TypeColumnTitle from "../../../../components/dropdowns/filters/typeColumnTitle";
import StatusColumnTitle from "../../../../components/dropdowns/filters/statusColumnTitle";
import { Tag } from "antd";
import style from "./myTransaction.module.css";

import {
  dashBetweenApprovalAssets,
  formatApiDateTime,
} from "../../../../commen/funtions/rejex";
import { useGlobalModal } from "../../../../context/GlobalModalContext";
import { useEffect, useRef, useState } from "react";

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
      <img src={ArrowDown} alt="Asc" className="custom-sort-icon" />
    ) : (
      <img src={ArrowUP} alt="Desc" className="custom-sort-icon" />
    );
  }
  return (
    <img src={DefaultColumArrow} alt="Default" className="custom-sort-icon" />
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

export const getBorderlessTableColumns = (
  approvalStatusMap,
  sortedInfo,
  employeeMyTransactionSearch,
  setViewDetailTransactionModal,
  setEmployeeMyTransactionSearch
) => [
  {
    title: withSortIcon("Transaction ID", "tradeApprovalID", sortedInfo),
    dataIndex: "tradeApprovalID",
    key: "tradeApprovalID",
    width: "12%",
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
    title: withSortIcon("Instrument", "instrumentName", sortedInfo),
    dataIndex: "Instrument",
    key: "instrumentName",
    width: "15%",
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
      console.log(record, "Checkerrrrr");
      const assetCode = record?.assetShortCode;
      const code = record?.instrumentShortCode || "";
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
        </div>
      );
    },
  },
  {
    title: (
      <TypeColumnTitle
        state={employeeMyTransactionSearch}
        setState={setEmployeeMyTransactionSearch}
      />
    ),
    dataIndex: "tradeType",
    key: "tradeType",
    ellipsis: true,
    width: "10%",
    filteredValue: employeeMyTransactionSearch.type?.length
      ? employeeMyTransactionSearch?.type
      : null,
    onFilter: () => true,
    render: (value, record) => {
      console.log("check what type", value, record);
      return value || "-";
    },
  },
  {
    title: withSortIcon(
      "Transaction Date & Time",
      "transactionDateTime",
      sortedInfo
    ),
    dataIndex: "transactionDateTime",
    key: "transactionDateTime",
    ellipsis: true,
    width: "17%",
    sorter: (a, b) => {
      const dateA = new Date(
        `${a.transactionConductedDate} ${a.transactionConductedTime}`
      ).getTime();
      const dateB = new Date(
        `${b.transactionConductedDate} ${b.transactionConductedTime}`
      ).getTime();
      return dateA - dateB;
    },
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "transactionDateTime" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (_, record) => (
      <span className="text-gray-600">
        {formatApiDateTime(
          `${record.transactionConductedDate} ${record.transactionConductedTime}`
        )}
      </span>
    ),
  },
  {
    title: (
      <StatusColumnTitle
        state={employeeMyTransactionSearch}
        setState={setEmployeeMyTransactionSearch}
      />
    ),
    dataIndex: "workFlowStatus",
    key: "workFlowStatus",
    ellipsis: true,
    width: "12%",
    filteredValue: employeeMyTransactionSearch.status?.length
      ? employeeMyTransactionSearch.status
      : null,
    onFilter: () => true,
    render: (status) => {
      console.log(status, "statusstatusstatus");
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
  {
    title: withSortIcon("Quantity", "quantity", sortedInfo),
    dataIndex: "quantity",
    key: "quantity",
    ellipsis: true,
    width: "8%",
    sorter: (a, b) => a.quantity - b.quantity,
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "quantity" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (q) => <span className="font-medium">{q.toLocaleString()}</span>,
  },
  {
    title: withSortIcon("Broker", "broker", sortedInfo),
    dataIndex: "broker",
    width: "17%",
    key: "broker",
    sorter: (a, b) => a.broker - b.broker,
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "broker" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
  },
  {
    title: "",
    key: "action",
    render: (_, record) => {
      //Global State to selected data to show in ViewDetailModal
      const { setSelectedViewDetailOfTransaction } = useGlobalModal();
      return (
        <Button
          className="small-dark-button"
          text={"View Details"}
          onClick={() => {
            setSelectedViewDetailOfTransaction(record);
            setViewDetailTransactionModal(true);
          }}
        />
      );
    },
  },
];
