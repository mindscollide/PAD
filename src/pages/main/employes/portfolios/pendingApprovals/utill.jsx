// utils.jsx

import React from "react";
import { Tag, Typography } from "antd";
import { Button } from "../../../../../components";
import DefaultColumArrow from "../../../../../assets/img/default-colum-arrow.png";
import ArrowUP from "../../../../../assets/img/arrow-up-dark.png";
import ArrowDown from "../../../../../assets/img/arrow-down-dark.png";
import TypeColumnTitle from "../../../../../components/dropdowns/filters/typeColumnTitle";
import StatusColumnTitle from "../../../../../components/dropdowns/filters/statusColumnTitle";
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
const { Text } = Typography;

/**
 * Returns column definitions for the borderless table
 * @param {Object} pendingApprovalstatusMap - Status tag color & label config
 * @returns {Array} Ant Design column config
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
        Instrument {getSortIcon("instrument", sortedInfo)}
      </div>
    ),
    dataIndex: "instrument",
    key: "instrument",
    width: "12%",
    ellipsis: true,
    sorter: (a, b) => a.instrument.localeCompare(b.instrument),
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "instrument" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text) => (
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span className="font-medium">{text}</span>
      </div>
    ),
  },
  {
    title: (
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        Transaction ID {getSortIcon("transactionid", sortedInfo)}
      </div>
    ),
    dataIndex: "transactionid",
    key: "transactionid",
    width: "12%",
    ellipsis: true,
    sorter: (a, b) => a.transactionid.localeCompare(b.transactionid),
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "transactionid" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text) => (
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span className="font-medium">{text}</span>
      </div>
    ),
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
    ellipsis: true,
    width: "20%",
    sorter: (a, b) =>
      a.approvalRequestDateime.localeCompare(b.approvalRequestDateime),
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "approvalRequestDateime"
        ? sortedInfo.order
        : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (date) => <span className="text-gray-600">{date}</span>,
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
    width: "10%",
    sorter: (a, b) => a.quantity - b.quantity,
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "quantity" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (value, record) => (
      <Text style={{ color: record.type === "Buy" ? "#00640A" : "#A50000" }}>
        <span className="font-medium">{value.toLocaleString()}</span>,
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
    dataIndex: "type",
    key: "type",
    ellipsis: true,
    width: "10%",
    filteredValue: employeePendingApprovalSearch?.type?.length
      ? employeePendingApprovalSearch?.type
      : null,
    onFilter: () => true,
    render: (type) => <span>{type}</span>,
  },
  {
    title: "Broker",
    dataIndex: "Broker",
    key: "Broker",
    width: "10%",
    ellipsis: true,
    filters: [
      { text: "JS Global", value: "JS Global" },
      { text: "AKD Securities", value: "AKD Securities" },
      { text: "Arif Habib", value: "Arif Habib" },
      { text: "BMA Capital", value: "BMA Capital" },
    ],
    onFilter: (value, record) => record.Broker === value,
    render: (broker) => <span>{broker}</span>,
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
    width: "10%",
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
          }}
          className="border-less-table-orange-status"
        >
          {tag.label}
        </Tag>
      );
    },
  },
  {
    title: "",
    key: "actions",
    width: "15%",
    render: (record) => {
      if (record.status === "Non Compliant") {
        return <Button className="big-white-button" text="Comments" />;
      }
      return null;
    },
  },
];
