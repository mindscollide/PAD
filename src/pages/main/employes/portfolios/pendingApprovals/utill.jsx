// utils.jsx
import React from "react";
import { Tag, Typography } from "antd";
import { BrokerColumnTitle, Button } from "../../../../../components";
import DefaultColumArrow from "../../../../../assets/img/default-colum-arrow.png";
import ArrowUP from "../../../../../assets/img/arrow-up-dark.png";
import ArrowDown from "../../../../../assets/img/arrow-down-dark.png";
import TypeColumnTitle from "../../../../../components/dropdowns/filters/typeColumnTitle";
import StatusColumnTitle from "../../../../../components/dropdowns/filters/statusColumnTitle";
import { formatApiDateTime, formatCode } from "../../../../../commen/funtions/rejex";

const { Text } = Typography;

/**
 * Get sorting icon for column
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

/**
 * Returns column definitions for the borderless table
 * @param {Object} approvalStatusMap - Map of status configs for tags
 * @param {Object} sortedInfo - Current sorting state from table
 * @param {Object} employeePendingApprovalSearch - Search/filter state
 * @param {Function} setEmployeePendingApprovalSearch - Setter for search state
 */
export const getBorderlessTableColumns = (
  approvalStatusMap,
  sortedInfo,
  employeePendingApprovalSearch,
  setEmployeePendingApprovalSearch
) => [
  {
    title: (
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        Instrument {getSortIcon("instrumentShortCode", sortedInfo)}
      </div>
    ),
    dataIndex: "instrumentShortCode",
    key: "instrumentShortCode",
    ellipsis: true,
    sorter: (a, b) =>
      (a.instrumentShortCode || "").localeCompare(b.instrumentShortCode || ""),
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "instrumentShortCode" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text) => <span className="font-medium">{text}</span>,
  },
  {
    title: (
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        Transaction ID {getSortIcon("tradeApprovalID", sortedInfo)}
      </div>
    ),
    dataIndex: "tradeApprovalID",
    key: "tradeApprovalID",
    width:"10%",
    ellipsis: true,
    sorter: (a, b) =>
      (a.tradeApprovalID || "").localeCompare(b.tradeApprovalID || ""),
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "tradeApprovalID" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text) => <span className="font-medium">{formatCode(text)}</span>,

  },
  {
    title: (
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        Approval Request Date & Time{" "}
        {getSortIcon("approvalRequestDateime", sortedInfo)}
      </div>
    ),
    dataIndex: "approvalRequestDateime",
    key: "approvalRequestDateime",
    width:"20%",
    ellipsis: true,
    sorter: (a, b) =>
      (a.approvalRequestDateime || "").localeCompare(
        b.approvalRequestDateime || ""
      ),
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "approvalRequestDateime"
        ? sortedInfo.order
        : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (date) => (
      <span className="text-gray-600">{formatApiDateTime(date)}</span>
    ),
  },
  {
    title: (
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        Quantity {getSortIcon("quantity", sortedInfo)}
      </div>
    ),
    dataIndex: "quantity",
    key: "quantity",
    ellipsis: true,
    sorter: (a, b) => (a.quantity || 0) - (b.quantity || 0),
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "quantity" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (value, record) => (
      <Text
        style={{ color: record.tradeType === "Buy" ? "#00640A" : "#A50000" }}
      >
        <span className="font-medium">{value?.toLocaleString()}</span>
      </Text>
    ),
  },
  {
    title: (
      <TypeColumnTitle
        state={employeePendingApprovalSearch}
        setState={setEmployeePendingApprovalSearch}
      />
    ),
    dataIndex: "tradeType",
    key: "tradeType",
    ellipsis: true,
    filteredValue: employeePendingApprovalSearch?.type?.length
      ? employeePendingApprovalSearch?.type
      : null,
    onFilter: () => true,
    render: (type) => <span>{type}</span>,
    onHeaderCell: () => ({
      style: {
        minWidth: "80px", // 👈 custom min width
        maxWidth: "100px", // 👈 custom max width
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      },
    }),
    onCell: () => ({
      style: {
        minWidth: "80px",
        maxWidth: "100px",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      },
    }),
  },
  {
    title: (
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        Broker {getSortIcon("broker", sortedInfo)}
      </div>
    ),
    dataIndex: "broker",
    key: "broker",
    width: "12%",
    ellipsis: true,
    sorter: (a, b) => (a.broker || "").localeCompare(b.broker || ""),
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "broker" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text) => <span className="font-medium">{text}</span>,
  },
  {
    title: (
      <StatusColumnTitle
        state={employeePendingApprovalSearch}
        setState={setEmployeePendingApprovalSearch}
      />
    ),
    dataIndex: "status",
    key: "status",
    ellipsis: true,
    filteredValue: employeePendingApprovalSearch.status?.length
      ? employeePendingApprovalSearch.status
      : null,
    onFilter: () => true,
    render: (status) => {
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
    onHeaderCell: () => ({
      style: {
        minWidth: "110px", // 👈 adjust as needed
        maxWidth: "240px",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      },
    }),
    onCell: () => ({
      style: {
        minWidth: "110px",
        maxWidth: "240px",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      },
    }),
  },
  {
    title: "",
    key: "actions",
    width: "15%",
    render: (record) =>
      record.status === "Non Compliant" ? (
        <Button className="big-white-button" text="Comments" />
      ) : null,
  },
];
