// columns.js
import ArrowUP from "../../../../assets/img/arrow-up-dark.png";
import ArrowDown from "../../../../assets/img/arrow-down-dark.png";
import { ArrowsAltOutlined } from "@ant-design/icons";
import React from "react";
import TypeColumnTitle from "../../../../components/dropdowns/filters/typeColumnTitle";
import StatusColumnTitle from "../../../../components/dropdowns/filters/statusColumnTitle";
import { Tag } from "antd";
import style from "./myHistory.module.css"
const getSortIcon = (columnKey, sortedInfo) => {
  if (sortedInfo?.columnKey === columnKey) {
    return sortedInfo.order === "ascend" ? (
      <img src={ArrowDown} alt="Asc" className="custom-sort-icon" />
    ) : (
      <img src={ArrowUP} alt="Desc" className="custom-sort-icon" />
    );
  }
  return <ArrowsAltOutlined className="custom-sort-icon" />;
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

export const getColumns = (
  approvalStatusMap,
  sortedInfo,
  employeeMyHistorySearch,
  setEmployeeMyHistorySearch
) => [
  {
    title: withSortIcon("Request / Transaction ID", "id", sortedInfo),
    dataIndex: "id",
    key: "id",
    width: 200,
    ellipsis: true,
    sorter: (a, b) => a.id.localeCompare(b.id),
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "id" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text) => <span className="font-medium">{text}</span>,
  },
  {
    title: withSortIcon("Instrument", "instrument", sortedInfo),
    dataIndex: "instrument",
    key: "instrument",
    width: 160,
    ellipsis: true,
    sorter: (a, b) => a.instrument.localeCompare(b.instrument),
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "instrument" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text) => (
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span
          className="border-less-table-orange-instrumentBadge"
          style={{ minWidth: 30 }}
        >
          {text.split("-")[0].substring(0, 2).toUpperCase()}
        </span>
        <span className="font-medium">{text}</span>
      </div>
    ),
  },
  {
    title: withSortIcon("Date & Time of Approval Request", "date", sortedInfo),
    dataIndex: "date",
    key: "date",
    width: "25%",
    ellipsis: true,
    sorter: (a, b) => new Date(a.date) - new Date(b.date),
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "date" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (date) => <span className="text-gray-600">{date}</span>,
  },
  {
    title: withSortIcon("Nature", "nature", sortedInfo),
    dataIndex: "nature",
    key: "nature",
    width: 140,
    ellipsis: true,
    sorter: (a, b) => a.nature.localeCompare(b.nature),
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "nature" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text) => <span className="font-medium">{text}</span>,
  },
  {
    title: (
      <TypeColumnTitle
        state={employeeMyHistorySearch}
        setState={setEmployeeMyHistorySearch}
      />
    ),
    dataIndex: "type",
    key: "type",
    ellipsis: true,
    width: "10%",
    filteredValue: employeeMyHistorySearch?.type?.length
      ? employeeMyHistorySearch?.type
      : null,
    onFilter: () => true,
    render: (type) => <span>{type}</span>,
  },
  {
    title: (
      <StatusColumnTitle
        state={employeeMyHistorySearch}
        setState={setEmployeeMyHistorySearch}
      />
    ),
    dataIndex: "status",
    key: "status",
    ellipsis: true,
    width: "10%",
    filteredValue: employeeMyHistorySearch?.status?.length
      ? employeeMyHistorySearch?.status
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
    title: withSortIcon("Quantity", "quantity", sortedInfo),
    dataIndex: "quantity",
    key: "quantity",
    width: 120,
    ellipsis: true,
    sorter: (a, b) => a.quantity - b.quantity,
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "quantity" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (q) => <span className="font-medium">{q.toLocaleString()}</span>,
  },
];
