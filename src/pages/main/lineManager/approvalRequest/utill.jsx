// components/pages/employee/approval/tableColumns.js

import React from "react";
import { Tag } from "antd";
import { Button, StatusFilterDropdown } from "../../../../components";
import style from "./approvalRequest.module.css";
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

export const getBorderlessLineManagerTableColumns = (
  approvalStatusMap,
  sortedInfo,
  lineManagerApprovalSearch,
  setLineManagerApprovalSearch,
  setViewDetailLineManagerModal
) => [
  {
    title: (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginLeft: "15px",
        }}
      >
        Requester Name {getSortIcon("requesterName", sortedInfo)}
      </div>
    ),
    dataIndex: "requesterName",
    key: "requesterName",
    width: "20%",
    ellipsis: true,
    sorter: (a, b) => a.requesterName.localeCompare(b.requesterName),
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "requesterName" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text) => (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginLeft: "15px",
        }}
      >
        <span className="font-medium">{text}</span>
      </div>
    ),
  },
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
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        Date & Time {getSortIcon("requestDateTime", sortedInfo)}
      </div>
    ),
    dataIndex: "requestDateTime",
    key: "requestDateTime",
    ellipsis: true,
    width: "20%",
    sorter: (a, b) => a.requestDateTime.localeCompare(b.requestDateTime),
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "requestDateTime" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (date) => <span className="text-gray-600">{date}</span>,
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
    ellipsis: true,
    width: "15%",
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
    width: "15%",
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
    dataIndex: "isEscalated",
    key: "isEscalated",
    ellipsis: true,
    width: "8%",
    align: "left",
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
    title: "",
    key: "actions",
    width: "15%",
    render: (record) => {
      console.log(record.status, "checkerStateus");
      //Global State to selected data to show in ViewDetailLineManagerModal Statuses
      const { setRoughStateOfViewDetail } = useGlobalModal();
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
                setRoughStateOfViewDetail(record);
                setViewDetailLineManagerModal(true);
              }}
            />
          </div>
        </>
      );
    },
  },
];
