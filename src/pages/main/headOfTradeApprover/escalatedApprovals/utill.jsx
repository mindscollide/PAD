// components/pages/employee/approval/tableColumns.js

import React, { useEffect, useRef, useState } from "react";
import { Tag, Tooltip } from "antd";
import { Button, StatusFilterDropdown } from "../../../../components";
import style from "./escalatedApprovals.module.css";
import EscalatedIcon from "../../../../assets/img/escalated.png";
import ArrowUP from "../../../../assets/img/arrow-up-dark.png";
import ArrowDown from "../../../../assets/img/arrow-down-dark.png";
import DefaultColumArrow from "../../../../assets/img/default-colum-arrow.png";
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

  return (
    <img
      draggable={false}
      src={DefaultColumArrow}
      alt="Default"
      className="custom-sort-icon"
    />
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
/**
 * Generates column definitions for the borderless approval table
 *
 * @param {object} approvalStatusMap - Mapping of status to label, colors, etc.
 * @param {object} sortedInfo - Sorting state from Ant Design table
 * @param {object} HeadOfTradeEscalatedApprovalsSearch - Current filter/search context
 * @param {function} setHeadOfTradeEscalatedApprovalsSearch - Setter to update context filter state
 * @returns {Array} Array of column definitions
 */

export const getBorderlessTableColumns = ({
  approvalStatusMap,
  sortedInfo,
  HeadOfTradeEscalatedApprovalsSearch,
  setHeadOfTradeEscalatedApprovalsSearch,
  setViewDetailsHeadOfApprovalModal,
  onViewDetail,
}) => [
  //   {
  //     title: withSortIcon("Approval ID", "tradeApprovalID", sortedInfo),
  //     dataIndex: "tradeApprovalID",
  //     key: "tradeApprovalID",
  //     ellipsis: true,
  //     sorter: (a, b) =>
  //       parseInt(a.tradeApprovalID.replace(/[^\d]/g, ""), 10) -
  //       parseInt(b.tradeApprovalID.replace(/[^\d]/g, ""), 10),
  //     sortDirections: ["ascend", "descend"],
  //     sortOrder:
  //       sortedInfo?.columnKey === "tradeApprovalID" ? sortedInfo.order : null,
  //     showSorterTooltip: false,
  //     sortIcon: () => null,
  //     render: (tradeApprovalID) => {
  //       return (
  //         <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
  //           <span className="font-medium">
  //             {dashBetweenApprovalAssets(tradeApprovalID)}
  //             {/* {dashBetweenApprovalAssets("REQ888888")} */}
  //           </span>
  //         </div>
  //       );
  //     },
  //     onHeaderCell: () => ({
  //       style: {
  //         minWidth: "100px", // ✅ minimum width
  //         maxWidth: "150px", // 👈 custom max width
  //         whiteSpace: "nowrap",
  //         overflow: "hidden",
  //         textOverflow: "ellipsis",
  //       },
  //     }),
  //     onCell: () => ({
  //       style: {
  //         minWidth: "100px", // ✅ minimum width
  //         maxWidth: "150px", // 👈 custom max width
  //         whiteSpace: "nowrap",
  //         overflow: "hidden",
  //         textOverflow: "ellipsis",
  //       },
  //     }),
  //   },
  {
    title: withSortIcon("Requester Name", "requesterName", sortedInfo),
    dataIndex: "requesterName",
    key: "Requester Name",
    ellipsis: true,
    sorter: (a, b) => {
      const nameA = a.requesterName || "";
      const nameB = b.requesterName || "";
      return nameA.localeCompare(nameB);
    },
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "requesterName" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,

    // Simple render function for requesterName
    render: (text) => (
      <Tooltip title={text} placement="topLeft">
        <span
          className="font-medium"
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: "250px",
            display: "inline-block",
            cursor: "pointer",
          }}
        >
          {text}
        </span>
      </Tooltip>
    ),

    // Column width and overflow handling
    onHeaderCell: () => ({
      style: {
        minWidth: "120px",
        maxWidth: "250px",
        whiteSpace: "nowrap",
      },
    }),
    onCell: () => ({
      style: {
        minWidth: "120px",
        maxWidth: "250px",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      },
    }),
  },
  {
    title: withSortIcon("line Manager Name", "lineManager", sortedInfo),
    dataIndex: "lineManager",
    key: "lineManager",
    ellipsis: true,
    sorter: (a, b) => {
      const nameA = a.lineManager || "";
      const nameB = b.lineManager || "";
      return nameA.localeCompare(nameB);
    },
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "lineManager" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text) => (
      <Tooltip title={text} placement="topLeft">
        <span
          className="font-medium"
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: "250px",
            display: "inline-block",
            cursor: "pointer",
          }}
        >
          {text}
        </span>
      </Tooltip>
    ),
    onHeaderCell: () => ({
      style: {
        minWidth: "120px",
        maxWidth: "250px",
        whiteSpace: "nowrap",
      },
    }),
    onCell: () => ({
      style: {
        minWidth: "120px",
        maxWidth: "250px",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      },
    }),
  },
  {
    title: withSortIcon("Instrument", "instrumentName", sortedInfo),
    dataIndex: "instrument",
    key: "instrumentName",
    ellipsis: true,
    sorter: (a, b) => {
      const nameA = a.instrument?.instrumentName || "";
      const nameB = b.instrument?.instrumentName || "";
      return nameA.localeCompare(nameB);
    },
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "instrumentName" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (instrument, record) => {
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
            >
              {code}
            </span>
          </Tooltip>
        </div>
      );
    },
    onHeaderCell: () => ({
      style: {
        minWidth: "40px", // ✅ minimum width
        maxWidth: "150px", // 👈 custom max width
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      },
    }),
    onCell: () => ({
      style: {
        minWidth: "40px", // ✅ minimum width
        maxWidth: "150px", // 👈 custom max width
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      },
    }),
  },
  {
    title: withSortIcon("Date & Time", "requestDateTime", sortedInfo),
    dataIndex: "requestDateTime",
    key: "requestDateTime",
    width: "13%",
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
      <>
        {/* <span className={style["table-header-text"]}> */}
        <TypeColumnTitle
          state={HeadOfTradeEscalatedApprovalsSearch}
          setState={setHeadOfTradeEscalatedApprovalsSearch}
        />
        {/* </span> */}
      </>
    ),
    dataIndex: "type",
    key: "type",
    ellipsis: true,
    // filteredValue: HeadOfTradeEscalatedApprovalsSearch.type?.length
    //   ? HeadOfTradeEscalatedApprovalsSearch.type
    //   : null,
    onFilter: () => true,
    render: (type) => (
      <span className={type === "Buy" ? "text-green-600" : "text-red-600"}>
        {type}
      </span>
    ),
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
      <StatusColumnTitle
        state={HeadOfTradeEscalatedApprovalsSearch}
        setState={setHeadOfTradeEscalatedApprovalsSearch}
      />
    ),
    dataIndex: "status",
    key: "status",
    ellipsis: true,
    // filteredValue: HeadOfTradeEscalatedApprovalsSearch.status?.length
    //   ? HeadOfTradeEscalatedApprovalsSearch.status
    //   : null,
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
    title: withSortIcon("Escalated On", "escalatedDateTime", sortedInfo),
    dataIndex: "escalatedDateTime",
    key: "escalatedDateTime",
    ellipsis: true,
    width: "13%",
    sorter: (a, b) =>
      formatApiDateTime(a.escalatedDateTime).localeCompare(
        formatApiDateTime(b.escalatedDateTime)
      ),
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "escalatedDateTime" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (date) => (
      <span className="text-gray-600">{formatApiDateTime(date)}</span>
    ),
    onHeaderCell: () => ({
      style: {
        minWidth: "120px",
        maxWidth: "220px",
        whiteSpace: "nowrap",
      },
    }),
    onCell: () => ({
      style: {
        minWidth: "120px",
        maxWidth: "220px",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      },
    }),
  },

  {
    title: "",
    key: "actions",
    align: "center",
    render: (text, record) => {
      //Global State to selected data to show in ViewDetailModal
      const { setIsSelectedViewDetailHeadOfApproval } = useGlobalModal();
      return (
        <Button
          className="big-orange-button"
          text="View Details"
          onClick={() => {
            console.log(record, "CheckRecordData");
            onViewDetail(record?.approvalID);
            setIsSelectedViewDetailHeadOfApproval(record);
            setViewDetailsHeadOfApprovalModal(true);
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
