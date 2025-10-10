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
  toYYMMDD,
} from "../../../../common/funtions/rejex";
import { mapBuySellToIds, mapStatusToIds } from "../../../../components/dropdowns/filters/utils";
import { getTradeTypeById } from "../../../../common/funtions/type";

// 🔹 CONSTANTS
const COLUMN_CONFIG = {
  WIDTHS: {
    APPROVAL_ID: { min: 100, max: 130 }, // Reduced
    INSTRUMENT: { min: 100, max: 150 }, // Reduced
    TYPE: { min: 70, max: 90 }, // Reduced
    DATE_TIME: { min: 100, max: 150 }, // Increased significantly for empty state
    STATUS: { min: 100, max: 130 }, // Reduced
    QUANTITY: { min: 150, max: 200 }, // Reduced
    TIME_REMAINING: { min: 200, max: 250 }, // Increased significantly for empty state
    ACTIONS: { min: 100, max: 120 }, // Reduced
    ESCALATED: { min: 0, max: 40 }, // Reduced
  },
  SORT_ORDER: {
    ASCEND: "ascend",
    DESCEND: "descend",
  },
  STATUS: {
    PENDING: "Pending",
    NOT_TRADED: "Not-Traded",
  },
};

/**
 * Utility: Build API request payload for approval listing
 *
 * @param {Object} searchState - Current search/filter state
 * @param {Object} addApprovalRequestData - Extra request metadata (optional)
 * @returns {Object} API-ready payload
 */
export const buildApiRequest = (searchState = {}, addApprovalRequestData) => ({
  InstrumentName: searchState.instrumentName || "",
  Quantity: searchState.quantity ? Number(searchState.quantity) : 0,
  StartDate: searchState.startDate ? toYYMMDD(searchState.startDate) : "",
  EndDate: searchState.endDate ? toYYMMDD(searchState.endDate) : "",
  StatusIds: mapStatusToIds?.(searchState.status) || [],
  TypeIds:
    mapBuySellToIds?.(searchState.type, addApprovalRequestData?.Equities) || [],
  PageNumber: Number(searchState.pageNumber) || 0,
  Length: Number(searchState.pageSize) || 10,
});

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
  const approvals = Array.isArray(employeeMyApproval)
    ? employeeMyApproval
    : employeeMyApproval?.approvals || [];

  if (!approvals.length) return [];

  return approvals.map((item) => ({
    key: item.approvalID,
    approvalID: item.approvalID,
    tradeApprovalID: item.tradeApprovalID || "",
    instrumentCode: item?.instrument?.instrumentCode || "—",
    instrumentName: item?.instrument?.instrumentName || "—",
    assetTypeShortCode: item?.assetType?.assetTypeShortCode || "—",
    requestDateTime:
      [item?.requestDate, item?.requestTime].filter(Boolean).join(" ") || "—",
    isEscalated: false,
    type: getTradeTypeById(assetTypeData, item?.tradeType) || "-",
    status: item.approvalStatus?.approvalStatusName || "",
    quantity: item.quantity || 0,
    timeRemainingToTrade: item.timeRemainingToTrade || "",
    assetType: item.assetType?.assetTypeName || "",
    assetTypeID: item.assetType?.assetTypeID || 0,
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
    return sortedInfo.order === COLUMN_CONFIG.SORT_ORDER.ASCEND ? (
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
 * Creates a table header with sort icon and proper alignment
 * @param {string} label - Column display label
 * @param {string} columnKey - Column unique key
 * @param {Object} sortedInfo - Current sorting state
 * @returns {JSX.Element} Header component with sort icon
 */

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
 * Creates a filter header without sort icon
 * @param {React.Component} FilterComponent - Filter component (TypeColumnTitle, StatusColumnTitle)
 * @returns {JSX.Element} Header component with filter
 */
const withFilterHeader = (FilterComponent) => (
  <div
    className={style["table-header-wrapper"]}
    style={{
      display: "flex",
      alignItems: "center",
      minHeight: "32px",
      width: "100%",
    }}
  >
    <FilterComponent />
  </div>
);

/**
 * Generates table cell style configuration for consistent text handling
 * @param {number} minWidth - Minimum cell width in pixels
 * @param {number} maxWidth - Maximum cell width in pixels
 * @returns {Object} Style configuration object
 */
const createCellStyle = (minWidth, maxWidth = null) => {
  const baseStyle = {
    minWidth: `${minWidth}px`,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    padding: "8px 12px",
    lineHeight: "1.4",
  };

  if (maxWidth) {
    return {
      style: {
        ...baseStyle,
        maxWidth: `${maxWidth}px`,
      },
    };
  }

  return { style: baseStyle };
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
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        minWidth: 0,
      }}
    >
      <span
        className="custom-shortCode-asset"
        style={{
          minWidth: 32,
          flexShrink: 0,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        data-testid="asset-code"
      >
        {assetCode?.substring(0, 2).toUpperCase()}
      </span>
      <Tooltip
        title={`${code} - ${name}`}
        placement="topLeft"
        overlayStyle={{ maxWidth: "300px" }}
      >
        <span
          className="font-medium"
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            minWidth: 0,
            flex: 1,
            cursor: "pointer",
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
        display: "inline-flex",
        alignItems: "center",
        maxWidth: "100%",
        minWidth: 0,
        margin: 0,
        border: "none",
        borderRadius: "4px",
        padding: "2px 8px",
        fontSize: "12px",
        lineHeight: "1.4",
      }}
      className="border-less-table-orange-status"
      data-testid={`status-tag-${status}`}
    >
      <span
        style={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {tagConfig.label || status}
      </span>
    </Tag>
  );
};

/**
 * Renders time remaining cell with conditional logic
 * @param {Object} record - Table row data
 * @returns {JSX.Element} Time remaining cell component
 */
const renderTimeRemainingCell = (record) => {
  const { setSelectedViewDetail, setIsResubmitted } = useGlobalModal();

  if (record.status === COLUMN_CONFIG.STATUS.PENDING) {
    return <span className="text-gray-400">-</span>;
  }

  if (record.status === COLUMN_CONFIG.STATUS.NOT_TRADED) {
    return (
      <Button
        className="large-transparent-button"
        text="Resubmit for Approval"
        onClick={() => {
          setIsResubmitted(true);
          setSelectedViewDetail(record);
        }}
        data-testid="resubmit-button"
        style={{
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: "100%",
        }}
      />
    );
  }

  if (record.timeRemainingToTrade) {
    return (
      <span
        className="font-medium text-gray-700"
        data-testid="time-remaining"
        style={{
          display: "inline-block",
          maxWidth: "100%",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
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
 * @returns {Array} Array of Ant Design column configurations
 */
export const getBorderlessTableColumns = ({
  approvalStatusMap,
  sortedInfo,
  employeeMyApprovalSearch,
  setEmployeeMyApprovalSearch,
  setIsViewDetail,
  onViewDetail,
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
    sortDirections: [
      COLUMN_CONFIG.SORT_ORDER.ASCEND,
      COLUMN_CONFIG.SORT_ORDER.DESCEND,
    ],
    sortOrder:
      sortedInfo?.columnKey === "tradeApprovalID" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (tradeApprovalID, record) => (
      <div
        id={`cell-${record.key}-tradeApprovalID`}
        style={{ display: "flex", alignItems: "center", gap: "12px" }}
      >
        <span className="font-medium" data-testid="formatted-approval-id">
          {dashBetweenApprovalAssets(tradeApprovalID)}
        </span>
      </div>
    ),
    onHeaderCell: () =>
      createCellStyle(
        COLUMN_CONFIG.WIDTHS.APPROVAL_ID.min,
        COLUMN_CONFIG.WIDTHS.APPROVAL_ID.max
      ),
    onCell: () =>
      createCellStyle(
        COLUMN_CONFIG.WIDTHS.APPROVAL_ID.min,
        COLUMN_CONFIG.WIDTHS.APPROVAL_ID.max
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
    render: (_, record) => (
      <div id={`cell-${record.key}-instrumentCode`}>
        {renderInstrumentCell(record)}
      </div>
    ),
    onHeaderCell: () =>
      createCellStyle(
        COLUMN_CONFIG.WIDTHS.INSTRUMENT.min,
        COLUMN_CONFIG.WIDTHS.INSTRUMENT.max
      ),
    onCell: () =>
      createCellStyle(
        COLUMN_CONFIG.WIDTHS.INSTRUMENT.min,
        COLUMN_CONFIG.WIDTHS.INSTRUMENT.max
      ),
  },
  {
    title: withFilterHeader(() => (
      <TypeColumnTitle
        state={employeeMyApprovalSearch}
        setState={setEmployeeMyApprovalSearch}
      />
    )),
    dataIndex: "type",
    key: "type",
    ellipsis: true,
    filteredValue: employeeMyApprovalSearch.type?.length
      ? employeeMyApprovalSearch.type
      : null,
    onFilter: () => true, // Actual filtering handled by API
    render: (type, record) => (
      <span
        id={`cell-${record.key}-type`}
        className={type === "Buy" ? "text-green-600" : "text-red-600"}
        data-testid={`trade-type-${type}`}
        style={{
          display: "inline-block",
          width: "100%",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {type}
      </span>
    ),
    onHeaderCell: () =>
      createCellStyle(
        COLUMN_CONFIG.WIDTHS.TYPE.min,
        COLUMN_CONFIG.WIDTHS.TYPE.max
      ),
    onCell: () =>
      createCellStyle(
        COLUMN_CONFIG.WIDTHS.TYPE.min,
        COLUMN_CONFIG.WIDTHS.TYPE.max
      ),
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
    sortDirections: [
      COLUMN_CONFIG.SORT_ORDER.ASCEND,
      COLUMN_CONFIG.SORT_ORDER.DESCEND,
    ],
    sortOrder:
      sortedInfo?.columnKey === "requestDateTime" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (date, record) => (
      <span
        id={`cell-${record.key}-requestDateTime`}
        className="text-gray-600"
        data-testid="formatted-date"
        style={{
          display: "inline-block",
          width: "100%",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {formatApiDateTime(date)}
      </span>
    ),
    onHeaderCell: () =>
      createCellStyle(
        COLUMN_CONFIG.WIDTHS.DATE_TIME.min,
        COLUMN_CONFIG.WIDTHS.DATE_TIME.max
      ),
    onCell: () =>
      createCellStyle(
        COLUMN_CONFIG.WIDTHS.DATE_TIME.min,
        COLUMN_CONFIG.WIDTHS.DATE_TIME.max
      ),
  },
  {
    title: withFilterHeader(() => (
      <StatusColumnTitle
        state={employeeMyApprovalSearch}
        setState={setEmployeeMyApprovalSearch}
      />
    )),
    dataIndex: "status",
    key: "status",
    ellipsis: true,
    filteredValue: employeeMyApprovalSearch.status?.length
      ? employeeMyApprovalSearch.status
      : null,
    onFilter: () => true,
    render: (status, record) => (
      <div id={`cell-${record.key}-status`}>
        {renderStatusTag(status, approvalStatusMap)}
      </div>
    ),
    onHeaderCell: () =>
      createCellStyle(
        COLUMN_CONFIG.WIDTHS.STATUS.min,
        COLUMN_CONFIG.WIDTHS.STATUS.max
      ),
    onCell: () =>
      createCellStyle(
        COLUMN_CONFIG.WIDTHS.STATUS.min,
        COLUMN_CONFIG.WIDTHS.STATUS.max
      ),
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
          style={{
            display: "block",
            margin: "0 auto",
          }}
        />
      ),
    onHeaderCell: () =>
      createCellStyle(
        COLUMN_CONFIG.WIDTHS.ESCALATED.min,
        COLUMN_CONFIG.WIDTHS.ESCALATED.max
      ),
    onCell: () =>
      createCellStyle(
        COLUMN_CONFIG.WIDTHS.ESCALATED.min,
        COLUMN_CONFIG.WIDTHS.ESCALATED.max
      ),
  },
  {
    title: withSortIcon("Quantity", "quantity", sortedInfo),
    dataIndex: "quantity",
    key: "quantity",
    ellipsis: true,
    sorter: (a, b) => a.quantity - b.quantity,
    sortDirections: [
      COLUMN_CONFIG.SORT_ORDER.ASCEND,
      COLUMN_CONFIG.SORT_ORDER.DESCEND,
    ],
    sortOrder: sortedInfo?.columnKey === "quantity" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (quantity, record) => (
      <span
        id={`cell-${record.key}-quantity`}
        className="font-medium"
        data-testid="formatted-quantity"
        style={{
          display: "inline-block",
          width: "100%",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          textAlign: "left",
        }}
      >
        {quantity.toLocaleString()}
      </span>
    ),
    onHeaderCell: () =>
      createCellStyle(
        COLUMN_CONFIG.WIDTHS.QUANTITY.min,
        COLUMN_CONFIG.WIDTHS.QUANTITY.max
      ),
    onCell: () =>
      createCellStyle(
        COLUMN_CONFIG.WIDTHS.QUANTITY.min,
        COLUMN_CONFIG.WIDTHS.QUANTITY.max
      ),
  },
  {
    title: "Time Remaining to Trade",
    dataIndex: "timeRemainingToTrade",
    key: "timeRemainingToTrade",
    ellipsis: true,
    align: "center",
    render: (text, record) => (
      <div id={`cell-${record.key}-timeRemainingToTrade`}>
        {renderTimeRemainingCell(record)}
      </div>
    ),
    onHeaderCell: () =>
      createCellStyle(
        COLUMN_CONFIG.WIDTHS.TIME_REMAINING.min,
        COLUMN_CONFIG.WIDTHS.TIME_REMAINING.max
      ),
    onCell: () =>
      createCellStyle(
        COLUMN_CONFIG.WIDTHS.TIME_REMAINING.min,
        COLUMN_CONFIG.WIDTHS.TIME_REMAINING.max
      ),
  },
  {
    title: "",
    key: "actions",
    align: "center",
    render: (text, record) => {
      const { setSelectedViewDetail } = useGlobalModal();

      return (
        <div id={`cell-${record.key}-actions`}>
          <Button
            className="big-orange-button"
            text="View Details"
            onClick={() => {
              onViewDetail(record?.approvalID);
              setSelectedViewDetail(record);
              setIsViewDetail(true);
            }}
            data-testid="view-details-button"
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: "100%",
            }}
          />
        </div>
      );
    },
    onHeaderCell: () =>
      createCellStyle(
        COLUMN_CONFIG.WIDTHS.ACTIONS.min,
        COLUMN_CONFIG.WIDTHS.ACTIONS.max
      ),
    onCell: () =>
      createCellStyle(
        COLUMN_CONFIG.WIDTHS.ACTIONS.min,
        COLUMN_CONFIG.WIDTHS.ACTIONS.max
      ),
  },
];