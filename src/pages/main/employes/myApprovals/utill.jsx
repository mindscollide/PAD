// components/pages/employee/approval/tableColumns.js

import React, { useEffect, useRef, useState } from "react";
import { debounce } from "lodash";
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
  setIsViewDetail,
  setIsResubmitted
) => [
  {
    title: withSortIcon("Approval ID", "tradeApprovalID", sortedInfo),
    dataIndex: "tradeApprovalID",
    key: "tradeApprovalID",
    width: "15%",
    // width: 200,
    ellipsis: true,
    sorter: (a, b) => a.tradeApprovalID - b.tradeApprovalID,
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "tradeApprovalID" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (tradeApprovalID) => {
      console.log(tradeApprovalID, "jhvjhvajdvadvasjdvj");
      // Format: insert dash before numbers
      const formattedID = tradeApprovalID?.replace(/(\D+)(\d+)/, "$1-$2");
      return (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span className="font-medium">
            {dashBetweenApprovalAssets(tradeApprovalID)}
          </span>
        </div>
      );
    },
  },
  {
    title: withSortIcon("Instrument", "appinstrumentrovalID", sortedInfo),
    dataIndex: "instrument",
    key: "instrument",
    width: "15%",
    ellipsis: true,
    sorter: (a, b) => {
      const nameA = a.instrument?.instrumentName || "";
      const nameB = b.instrument?.instrumentName || "";
      return nameA.localeCompare(nameB);
    },
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "instrument" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (instrument, record) => {
      console.log(
        record.assetType.assetTypeShortCode,
        "checbwechechejhassetType"
      );

      // To show an assetType Code
      const assetCode = record?.assetType?.assetTypeShortCode;
      const name = instrument?.instrumentName || "";
      const code = instrument?.instrumentCode || "";
      return (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span
            className="border-less-table-orange-instrumentBadge"
            style={{ minWidth: 30 }}
          >
            {assetCode.substring(0, 2).toUpperCase()}
          </span>
          <span className="font-medium">{`${name} - ${code}`}</span>
        </div>
      );
    },
  },
  {
    title: (
      <>
        <span className={style["table-header-text"]}>
          <TypeColumnTitle
            state={employeeMyApprovalSearch}
            setState={setEmployeeMyApprovalSearch}
          />
        </span>
      </>
    ),
    dataIndex: "type",
    key: "type",
    ellipsis: true,
    width: "10%",
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
    title: withSortIcon("Request Date & Time", "requestDateTime", sortedInfo),
    dataIndex: "requestDateTime",
    key: "requestDateTime",
    ellipsis: true,
    width: "15%",
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
      console.log(tag, "TagssTagsTagsTags");
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
    width: "12%",
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
    width: "18%",
    align: "center",
    render: (text, record) => {
      console.log(record, "Checkecnekjcb record");
      // ✅ Show nothing if pending
      if (record.status === "Pending")
        return <span className="text-gray-400">-</span>;

      if (record.status === "Not-Traded") {
        return (
          <Button
            className="large-transparent-button"
            text="Resubmit for Approval"
            onClick={() => setIsResubmitted(true)}
          />
        );
      }

      if (text) {
        return <span className="font-medium text-gray-700">{text}</span>;
      }

      return <span className="text-gray-400">-</span>;
    },
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
  },
];

export const useTableScrollBottom = (
  onBottomReach,
  threshold = 0,
  prefixCls = "ant-table"
) => {
  const [hasReachedBottom, setHasReachedBottom] = useState(false);
  const containerRef = useRef(null);
  const previousScrollTopRef = useRef(0); // for detecting vertical scroll only

  useEffect(() => {
    const selector = `.${prefixCls}-body`;
    const scrollContainer = document.querySelector(selector);

    if (!scrollContainer) {
      console.warn(`📛 Scroll container not found for selector: ${selector}`);
      return;
    }

    containerRef.current = scrollContainer;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;

      // Check if vertical scroll happened
      const scrolledVertically = scrollTop !== previousScrollTopRef.current;
      previousScrollTopRef.current = scrollTop;

      if (!scrolledVertically) return; // ignore horizontal-only scroll

      const isScrollable = scrollHeight > clientHeight;
      const isBottom = scrollTop + clientHeight >= scrollHeight - threshold;

      if (isScrollable && isBottom && !hasReachedBottom) {
        setHasReachedBottom(true);
        onBottomReach?.();

        setTimeout(() => setHasReachedBottom(false), 1000);
      }
    };

    scrollContainer.addEventListener("scroll", handleScroll);
    return () => scrollContainer.removeEventListener("scroll", handleScroll);
  }, [hasReachedBottom, onBottomReach, threshold, prefixCls]);

  return {
    hasReachedBottom,
    containerRef,
    setHasReachedBottom,
  };
};
