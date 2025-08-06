// components/pages/employee/approval/tableColumns.js

import React from "react";
import { Tag } from "antd";
import { Button, StatusFilterDropdown } from "../../../../components";
import style from "./approval.module.css";
import EscalatedIcon from "../../../../assets/img/escalated.png";
import ArrowUP from "../../../../assets/img/arrow-up-dark.png";
import ArrowDown from "../../../../assets/img/arrow-down-dark.png";
import { ArrowsAltOutlined } from "@ant-design/icons";
import TypeColumnTitle from "../../../../components/dropdowns/filters/typeColumnTitle";
import StatusColumnTitle from "../../../../components/dropdowns/filters/statusColumnTitle";
import { useGlobalModal } from "../../../../context/GlobalModalContext";
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
  return <ArrowsAltOutlined className="custom-sort-icon" />;
};

/**
 * Generates column definitions for the borderless approval table
 *
 * @param {object} approvalStatusMap - Mapping of status to label, colors, etc.
 * @param {object} sortedInfo - Sorting state from Ant Design table
 * @param {object} employeeMyApprovalSearch - Current filter/search context
 * @param {function} setEmployeeMyApprovalSearch - Setter to update context filter state
 * @returns {Array} Array of column definitions
 */
export const getBorderlessTableColumns = (
  approvalStatusMap,
  sortedInfo,
  employeeMyApprovalSearch,
  setEmployeeMyApprovalSearch,
  setIsViewDetail
) => [
  {
    title: (
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        Instrument {getSortIcon("instrument", sortedInfo)}
      </div>
    ),
    dataIndex: "instrument",
    key: "instrument",
    width: "20%",
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
    title: (
      <TypeColumnTitle
        state={employeeMyApprovalSearch}
        setState={setEmployeeMyApprovalSearch}
      />
    ),
    dataIndex: "type",
    key: "type",
    ellipsis: true,
    width: "15%",
    filteredValue: employeeMyApprovalSearch.type?.length
      ? employeeMyApprovalSearch.type
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
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        Request Date & Time {getSortIcon("requestDateTime", sortedInfo)}
      </div>
    ),
    dataIndex: "requestDateTime",
    key: "requestDateTime",
    ellipsis: true,
    width: "15%",
    sorter: (a, b) => a.requestDateTime.localeCompare(b.requestDateTime),
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "requestDateTime" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (date) => <span className="text-gray-600">{date}</span>,
  },
  {
    title: "",
    dataIndex: "isEscalated",
    key: "isEscalated",
    ellipsis: true,
    width: "5%",
    render: (date) =>
      date && (
        <img
          src={EscalatedIcon}
          alt="escalated"
          className={style["escalated-icon"]}
        />
      ),
  },
  {
    title: (
      <StatusColumnTitle
        state={employeeMyApprovalSearch}
        setState={setEmployeeMyApprovalSearch}
      />
    ),
    dataIndex: "status",
    key: "status",
    ellipsis: true,
    width: "10%",
    filteredValue: employeeMyApprovalSearch.status?.length
      ? employeeMyApprovalSearch.status
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
    render: (q) => <span className="font-medium">{q.toLocaleString()}</span>,
  },
  {
    title: "Time Remaining to Trade",
    dataIndex: "timeRemaining",
    key: "timeRemaining",
    ellipsis: true,
    width: "15%",
    render: (text, record) =>
      record.status === "Not Traded" ? (
        <Button
          className="large-transparent-button"
          text="Resubmit for Approval"
        />
      ) : text ? (
        <span className="font-medium text-gray-700">{text}</span>
      ) : (
        <span className="text-gray-400">-</span>
      ),
  },
  {
    title: "",
    key: "actions",
    width: "10%",
    render: (text, record) => {
      //Global State to selected data to show in ViewDetailModal
      const { setSelectedViewDetail } = useGlobalModal();
      console.log(record, "Actions render fired:");
      return (
        <Button
          className="big-orange-button"
          text="View Details"
          onClick={() => {
            console.log(record, "Clicked record");
            setSelectedViewDetail(record);
            setIsViewDetail(true);
          }}
        />
      );
    },
    //   (
    //   <Button
    //     className="big-orange-button"
    //     text="View Details"
    //     onClick={() => {
    //       console.log(record, "CHeckerCheckrrecord");
    //       setSelectedViewDetail(record);
    //       setIsViewDetail(true);
    //     }}
    //   />
    // ),
  },
];


