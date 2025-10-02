// components/pages/employee/approval/tableColumns.js

import React, { useEffect, useRef, useState } from "react";
import { Tag, Tooltip } from "antd";
import { Button, StatusFilterDropdown } from "../../../../components";
import style from "./approval.module.css";
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
import { getTradeTypeById } from "../../headOfComplianceOffice/escalatedVerifications/escalatedVerification/util";

// 🔹 Constants
const COLUMN_WIDTHS = {
  APPROVAL_ID: { min: 100, max: 150 },
  INSTRUMENT: { min: 130, max: 170 },
  TYPE: { min: 80, max: 100 },
  STATUS: { min: 110, max: 240 },
  QUANTITY: { min: 100, max: 150 },
  TIME_REMAINING: { min: 120 },
};

/**
 * Maps raw employee approval API data to table-ready format
 * @param {Object} assetTypeData - Asset type configuration data
 * @param {Array|Object} employeeMyApproval - Raw API response data
 * @returns {Array} Normalized and mapped approval data
 */
export const mapEmployeeMyApprovalData = (
  assetTypeData,
  employeeMyApproval = []
) => {
  // Normalize input to always work with an array
  const approvals = Array.isArray(employeeMyApproval)
    ? employeeMyApproval
    : employeeMyApproval?.approvals || [];

  if (!approvals.length) return [];

  return approvals.map((item) => ({
    key: item.approvalID, // Unique key for React
    approvalID: item.approvalID,
    tradeApprovalID: item.tradeApprovalID || "",
    instrumentCode: item?.instrument?.instrumentCode || "—",
    instrumentName: item?.instrument?.instrumentName || "—",
    assetTypeShortCode: item?.assetType?.assetTypeShortCode || "—",
    requestDateTime:
      [item?.requestDate, item?.requestTime].filter(Boolean).join(" ") || "—",
    isEscalated: false, // Default value, can be updated if needed
    type: getTradeTypeById(assetTypeData, item?.tradeType) || "-",
    status: item.approvalStatus?.approvalStatusName || "",
    quantity: item.quantity || 0,
    timeRemainingToTrade: item.timeRemainingToTrade || "",
    assetType: item.assetType?.assetTypeName || "",
  }));
};

/**
 * Returns the appropriate sort icon based on current sort state
 * @param {string} columnKey - The column's unique key
 * @param {Object} sortedInfo - Current table sorting information
 * @returns {JSX.Element} Sort icon component
 */
const getSortIcon = (columnKey, sortedInfo) => {
  if (sortedInfo?.columnKey === columnKey) {
    return sortedInfo.order === "ascend" ? (
      <img
        draggable={false}
        src={ArrowDown}
        alt="Sorted ascending"
        className="custom-sort-icon"
        data-testid={`sort-icon-${columnKey}-asc`}
      />
    ) : (
      <img
        draggable={false}
        src={ArrowUP}
        alt="Sorted descending"
        className="custom-sort-icon"
        data-testid={`sort-icon-${columnKey}-desc`}
      />
    );
  }

  return (
    <img
      draggable={false}
      src={DefaultColumArrow}
      alt="Not sorted"
      className="custom-sort-icon"
      data-testid={`sort-icon-${columnKey}-default`}
    />
  );
};

/**
 * Creates a table header with sort icon
 * @param {string} label - Column display label
 * @param {string} columnKey - Column unique key
 * @param {Object} sortedInfo - Current sorting state
 * @returns {JSX.Element} Header component with sort icon
 */
const withSortIcon = (label, columnKey, sortedInfo) => (
  <div
    className={style["table-header-wrapper"]}
    data-testid={`header-${columnKey}`}
  >
    <span className={style["table-header-text"]}>{label}</span>
    <span className={style["table-header-icon"]}>
      {getSortIcon(columnKey, sortedInfo)}
    </span>
  </div>
);

/**
 * Generates table cell style configuration for consistent text handling
 * @param {number} minWidth - Minimum cell width in pixels
 * @param {number} maxWidth - Maximum cell width in pixels
 * @returns {Object} Style configuration object
 */
const createCellStyle = (minWidth, maxWidth = null) => {
  const style = {
    minWidth: `${minWidth}px`,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  };

  if (maxWidth) {
    style.maxWidth = `${maxWidth}px`;
  }

  return { style };
};

/**
 * Renders instrument cell with asset code and tooltip
 * @param {Object} record - Table row data
 * @returns {JSX.Element} Instrument cell component
 */
const renderInstrumentCell = (record) => {
  const code = record?.instrumentCode || "—";
  const name = record?.instrumentName || "—";
  const assetCode = record?.assetTypeShortCode || "";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <span
        className="custom-shortCode-asset"
        style={{ minWidth: 32, flexShrink: 0 }}
        data-testid="asset-code"
      >
        {assetCode?.substring(0, 2).toUpperCase()}
      </span>
      <Tooltip title={`${code} - ${name}`} placement="topLeft">
        <span
          className="font-medium"
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: "100%",
            display: "inline-block",
            cursor: "pointer",
            flex: 1,
          }}
          data-testid="instrument-code"
        >
          {code}
        </span>
      </Tooltip>
    </div>
  );
};

/**
 * Renders status tag with appropriate styling
 * @param {string} status - Approval status
 * @param {Object} approvalStatusMap - Status to style mapping
 * @returns {JSX.Element} Status tag component
 */
const renderStatusTag = (status, approvalStatusMap) => {
  const tagConfig = approvalStatusMap[status] || {};

  return (
    <Tag
      style={{
        backgroundColor: tagConfig.backgroundColor,
        color: tagConfig.textColor,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        display: "inline-block",
      }}
      className="border-less-table-orange-status"
      data-testid={`status-tag-${status}`}
    >
      {tagConfig.label || status}
    </Tag>
  );
};

/**
 * Renders time remaining cell with conditional logic
 * @param {Object} record - Table row data
 * @param {Function} setIsResubmitted - Resubmit modal setter
 * @returns {JSX.Element} Time remaining cell component
 */
const renderTimeRemainingCell = (record, setIsResubmitted) => {
  const { setSelectedViewDetail } = useGlobalModal();

  // Show nothing for pending status
  if (record.status === "Pending") {
    return <span className="text-gray-400">-</span>;
  }

  // Show resubmit button for not-traded status
  if (record.status === "Not-Traded") {
    return (
      <Button
        className="large-transparent-button"
        text="Resubmit for Approval"
        onClick={() => {
          setIsResubmitted?.(true);
          setSelectedViewDetail(record);
        }}
        data-testid="resubmit-button"
      />
    );
  }

  // Show time remaining if available
  if (record.timeRemainingToTrade) {
    return (
      <span className="font-medium text-gray-700" data-testid="time-remaining">
        {record.timeRemainingToTrade}
      </span>
    );
  }

  return <span className="text-gray-400">-</span>;
};

/**
 * Generates column definitions for the borderless approval table
 * @param {Object} params - Configuration parameters
 * @param {Object} params.approvalStatusMap - Status styling configuration
 * @param {Object} params.sortedInfo - Current table sorting state
 * @param {Object} params.employeeMyApprovalSearch - Current search/filter state
 * @param {Function} params.setEmployeeMyApprovalSearch - Search state setter
 * @param {Function} params.setIsViewDetail - View detail modal setter
 * @param {Function} params.onViewDetail - View detail handler
 * @param {Function} params.setIsResubmitted - Resubmit modal setter
 * @returns {Array} Array of Ant Design column configurations
 */
export const getBorderlessTableColumns = ({
  approvalStatusMap,
  sortedInfo,
  employeeMyApprovalSearch,
  setEmployeeMyApprovalSearch,
  setIsViewDetail,
  onViewDetail,
  setIsResubmitted,
}) => [
  {
    title: withSortIcon("Approval ID", "tradeApprovalID", sortedInfo),
    dataIndex: "tradeApprovalID",
    key: "tradeApprovalID",
    ellipsis: true,
    sorter: (a, b) => {
      const extractId = (id) => parseInt(id.replace(/[^\d]/g, ""), 10) || 0;
      return extractId(a.tradeApprovalID) - extractId(b.tradeApprovalID);
    },
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "tradeApprovalID" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (tradeApprovalID) => (
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span className="font-medium" data-testid="formatted-approval-id">
          {dashBetweenApprovalAssets(tradeApprovalID)}
        </span>
      </div>
    ),
    onHeaderCell: () =>
      createCellStyle(
        COLUMN_WIDTHS.APPROVAL_ID.min,
        COLUMN_WIDTHS.APPROVAL_ID.max
      ),
    onCell: () =>
      createCellStyle(
        COLUMN_WIDTHS.APPROVAL_ID.min,
        COLUMN_WIDTHS.APPROVAL_ID.max
      ),
  },
  {
    title: withSortIcon("Instrument", "instrumentCode", sortedInfo),
    dataIndex: "instrumentCode",
    key: "instrumentCode",
    ellipsis: true,
    sorter: (a, b) =>
      (a?.instrumentCode || "").localeCompare(b?.instrumentCode || ""),
    sortOrder:
      sortedInfo?.columnKey === "instrumentCode" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (_, record) => renderInstrumentCell(record),
    onHeaderCell: () =>
      createCellStyle(
        COLUMN_WIDTHS.INSTRUMENT.min,
        COLUMN_WIDTHS.INSTRUMENT.max
      ),
    onCell: () =>
      createCellStyle(
        COLUMN_WIDTHS.INSTRUMENT.min,
        COLUMN_WIDTHS.INSTRUMENT.max
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
    filteredValue: employeeMyApprovalSearch.type?.length
      ? employeeMyApprovalSearch.type
      : null,
    onFilter: () => true, // Actual filtering handled by API
    render: (type) => (
      <span
        className={type === "Buy" ? "text-green-600" : "text-red-600"}
        data-testid={`trade-type-${type}`}
      >
        {type}
      </span>
    ),
    onHeaderCell: () =>
      createCellStyle(COLUMN_WIDTHS.TYPE.min, COLUMN_WIDTHS.TYPE.max),
    onCell: () =>
      createCellStyle(COLUMN_WIDTHS.TYPE.min, COLUMN_WIDTHS.TYPE.max),
  },
  {
    title: withSortIcon("Request Date & Time", "requestDateTime", sortedInfo),
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
      <span className="text-gray-600" data-testid="formatted-date">
        {formatApiDateTime(date)}
      </span>
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
    filteredValue: employeeMyApprovalSearch.status?.length
      ? employeeMyApprovalSearch.status
      : null,
    onFilter: () => true,
    render: (status) => renderStatusTag(status, approvalStatusMap),
    onHeaderCell: () =>
      createCellStyle(COLUMN_WIDTHS.STATUS.min, COLUMN_WIDTHS.STATUS.max),
    onCell: () =>
      createCellStyle(COLUMN_WIDTHS.STATUS.min, COLUMN_WIDTHS.STATUS.max),
  },
  {
    title: "",
    dataIndex: "isEscalated",
    key: "isEscalated",
    ellipsis: true,
    render: (isEscalated) =>
      isEscalated && (
        <img
          draggable={false}
          src={EscalatedIcon}
          alt="Escalated"
          className={style["escalated-icon"]}
          data-testid="escalated-icon"
        />
      ),
  },
  {
    title: withSortIcon("Quantity", "quantity", sortedInfo),
    dataIndex: "quantity",
    key: "quantity",
    ellipsis: true,
    sorter: (a, b) => a.quantity - b.quantity,
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "quantity" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (quantity) => (
      <span className="font-medium" data-testid="formatted-quantity">
        {quantity.toLocaleString()}
      </span>
    ),
    onHeaderCell: () =>
      createCellStyle(COLUMN_WIDTHS.QUANTITY.min, COLUMN_WIDTHS.QUANTITY.max),
    onCell: () =>
      createCellStyle(COLUMN_WIDTHS.QUANTITY.min, COLUMN_WIDTHS.QUANTITY.max),
  },
  {
    title: "Time Remaining to Trade",
    dataIndex: "timeRemainingToTrade",
    key: "timeRemainingToTrade",
    ellipsis: true,
    align: "center",
    render: (text, record) => renderTimeRemainingCell(record, setIsResubmitted),
    onHeaderCell: () => createCellStyle(COLUMN_WIDTHS.TIME_REMAINING.min),
    onCell: () => createCellStyle(COLUMN_WIDTHS.TIME_REMAINING.min),
  },
  {
    title: "",
    key: "actions",
    align: "center",
    render: (text, record) => {
      const { setSelectedViewDetail } = useGlobalModal();

      return (
        <Button
          className="big-orange-button"
          text="View Details"
          onClick={() => {
            onViewDetail(record?.approvalID);
            setSelectedViewDetail(record);
            setIsViewDetail(true);
          }}
          data-testid="view-details-button"
        />
      );
    },
  },
];

/**
 * Custom hook for infinite scroll detection on table
 * @param {Function} onBottomReach - Callback when bottom is reached
 * @param {number} threshold - Pixel threshold from bottom
 * @param {string} prefixCls - CSS class prefix for table
 * @returns {Object} Scroll state and container ref
 */
export const useTableScrollBottom = (
  onBottomReach,
  threshold = 0,
  prefixCls = "ant-table"
) => {
  const [hasReachedBottom, setHasReachedBottom] = useState(false);
  const containerRef = useRef(null);
  const previousScrollTopRef = useRef(0);

  useEffect(() => {
    const selector = `.${prefixCls}-body`;
    const scrollContainer = document.querySelector(selector);

    if (!scrollContainer) {
      console.warn(`Scroll container not found for selector: ${selector}`);
      return;
    }

    containerRef.current = scrollContainer;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;

      // Detect vertical scroll only
      const scrolledVertically = scrollTop !== previousScrollTopRef.current;
      previousScrollTopRef.current = scrollTop;

      if (!scrolledVertically) return;

      const isScrollable = scrollHeight > clientHeight;
      const isBottom = scrollTop + clientHeight >= scrollHeight - threshold;

      if (isScrollable && isBottom && !hasReachedBottom) {
        setHasReachedBottom(true);
        onBottomReach?.();

        // Reset after delay to prevent multiple triggers
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
