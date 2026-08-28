// components/pages/employee/approval/tableColumns.js

import React from "react";
import { Tag, Tooltip } from "antd";
import { Button } from "../../../../components";
import style from "./approval.module.css";
import EscalatedIcon from "../../../../assets/img/escalated.png";
import TypeColumnTitle from "../../../../components/dropdowns/filters/typeColumnTitle";
import StatusColumnTitle from "../../../../components/dropdowns/filters/statusColumnTitle";
import { useGlobalModal } from "../../../../context/GlobalModalContext";
import {
  dashBetweenApprovalAssets,
  formatApiDateTime,
  toYYMMDD,
} from "../../../../common/funtions/rejex";
import {
  mapBuySellToIds,
  mapStatusToIds,
} from "../../../../components/dropdowns/filters/utils";
import { getTradeTypeById } from "../../../../common/funtions/type";
import { withSortIcon } from "../../../../common/funtions/tableIcon";
import {
  parseDeadlineToUtcMs,
  formatTimeRemaining,
  estimateDeadlineFromLabel,
} from "../../../../common/funtions/timeRemaining";

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
 * @param {Object} assetTypeListingData - Extra request metadata (optional)
 * @returns {Object} API-ready payload
 */
export const buildApiRequest = (searchState = {}, assetTypeListingData) => ({
  InstrumentName: searchState.instrumentName || "",
  Quantity: searchState.quantity ? Number(searchState.quantity) : 0,
  StartDate: searchState.startDate ? toYYMMDD(searchState.startDate) : "",
  // Plain UTC date conversion - the same-day padding workaround
  // (toYYMMDDWithSameDayPadding) was removed 2026-08-25 now that BE's fix
  // (API_Changes/2026-08-24_same_day_date_search_now_works.md) is
  // confirmed live; the backend now correctly covers the full selected
  // day on its own, so padding on top of that would double-count a day.
  EndDate: searchState.endDate ? toYYMMDD(searchState.endDate) : "",
  StatusIds: mapStatusToIds?.(searchState.status, 2) || [],
  TypeIds:
    mapBuySellToIds?.(searchState.type, assetTypeListingData?.Equities) || [],
  // SearchTradeApprovals's PageNumber is now a real 1-indexed page
  // number (backend fix 2026-08-05).
  PageNumber: Number(searchState.pageNumber) || 1,
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
    isEscalated: item.isEscalated,
    type: getTradeTypeById(assetTypeData, item?.tradeType) || "-",
    status: item.approvalStatus?.approvalStatusName || "",
    quantity: item.quantity || 0,
    timeRemainingToTrade: item.timeRemainingToTrade || "",
    // Not sent yet (API_Changes/2026-08-27_time_remaining_needs_raw_
    // deadline.md) - harmless passthrough now, lets renderTimeRemainingCell
    // prefer a precise live countdown automatically once the backend adds
    // these.
    deadlineDate: item.deadlineDate || "",
    deadlineTime: item.deadlineTime || "",
    // FE-only estimate (no BE change needed) - anchors an absolute
    // deadline off the backend's own "Xd Yh Zm" label AT THIS MOMENT (the
    // row's data just arrived), so renderTimeRemainingCell can tick it
    // down live on every render instead of showing this frozen string.
    // Deliberately computed here (mapping time), not in the cell's render -
    // recomputing "now + label" on every render would never actually
    // count down, it'd just re-anchor to a fresh "now" each time.
    approxDeadlineUtcMs: estimateDeadlineFromLabel(item.timeRemainingToTrade),
    assetType: item.assetType?.assetTypeName || "",
    assetTypeID: item.assetType?.assetTypeID || 0,
  }));
};

/**
 * Creates a filter header without sort icon
 * @param {React.Component} FilterComponent - Filter component (TypeColumnTitle, StatusColumnTitle)
 * @returns {JSX.Element} Header component with filter
 */
const withFilterHeader = (filterElement) => (
  <div
    className={style["table-header-wrapper"]}
    style={{
      display: "flex",
      alignItems: "center",
      minHeight: "32px",
      width: "100%",
    }}
  >
    {filterElement}
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
        fontSize: "16px",
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

  const resubmitButton = (
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

  if (record.status === COLUMN_CONFIG.STATUS.NOT_TRADED) {
    return resubmitButton;
  }

  // Live client-side countdown: prefers a real raw deadline
  // (deadlineDate/deadlineTime - not sent by any screen yet, see
  // API_Changes/2026-08-27_time_remaining_needs_raw_deadline.md), else
  // falls back to the FE-only estimate anchored at fetch time
  // (mapEmployeeMyApprovalData's approxDeadlineUtcMs). Either way,
  // formatTimeRemaining recomputes from Date.now() on every render - the
  // parent page calling useTimeRemainingTick() every second is what
  // actually drives those re-renders.
  const deadlineUtcMs =
    parseDeadlineToUtcMs(record.deadlineDate, record.deadlineTime) ??
    record.approxDeadlineUtcMs ??
    null;
  const liveTimeRemaining = formatTimeRemaining(deadlineUtcMs);

  // FE-only fallback: the deadline has passed by our local clock, but no
  // MQTT/refetch has told us the workflow is actually Not-Traded yet (BE
  // may still be mid-flight, or never fires for some reason) - show the
  // same Resubmit UX a real Not-Traded status gets rather than leaving
  // "Expired" up indefinitely. approval.jsx's own per-second sweep effect
  // is what actually flips record.status to "Not-Traded" for real (so the
  // Status column agrees, not just this cell) - that update lands one
  // render after the countdown reaches zero, so this branch only ever
  // covers that single in-between render, avoiding a one-tick flicker
  // back to a plain "Expired" text before the real status catches up.
  if (record.status === "Approved" && liveTimeRemaining === "Expired") {
    return resubmitButton;
  }

  const timeRemainingText = liveTimeRemaining ?? record.timeRemainingToTrade;

  if (timeRemainingText) {
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
        {timeRemainingText}
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
    // ellipsis: true,
    sorter: (a, b) => {
      const extractId = (id) => parseInt(id.replace(/[^\d]/g, ""), 10) || 0;
      return extractId(a.tradeApprovalID) - extractId(b.tradeApprovalID);
    },
    sortOrder:
      sortedInfo?.columnKey === "tradeApprovalID" ? sortedInfo.order : null,
    showSorterTooltip: false,
    width: 150,
    align: "left",
    sortIcon: () => null,
    render: (tradeApprovalID) => (
      <span className="font-medium" data-testid="formatted-approval-id">
        {dashBetweenApprovalAssets(tradeApprovalID)}
      </span>
    ),
  },
  {
    title: withSortIcon("Instrument", "instrumentCode", sortedInfo),
    dataIndex: "instrumentCode",
    key: "instrumentCode",
    ellipsis: true,
    width: 150,
    align: "left",
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
    title: withFilterHeader(
      <TypeColumnTitle
        state={employeeMyApprovalSearch}
        setState={setEmployeeMyApprovalSearch}
      />
    ),
    dataIndex: "type",
    key: "type",
    width: 120,
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
  },
  {
    title: withSortIcon(
      "Request Date & Time",
      "requestDateTime",
      sortedInfo,
      "center"
    ),
    dataIndex: "requestDateTime",
    key: "requestDateTime",
    width: 200,
    align: "center",
    sorter: (a, b) =>
      formatApiDateTime(a.requestDateTime).localeCompare(
        formatApiDateTime(b.requestDateTime)
      ),
    sortOrder:
      sortedInfo?.columnKey === "requestDateTime" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (date, record) => <span>{formatApiDateTime(date)}</span>,
  },
  {
    title: withFilterHeader(
      <StatusColumnTitle
        state={employeeMyApprovalSearch}
        setState={setEmployeeMyApprovalSearch}
      />
    ),
    dataIndex: "status",
    key: "status",
    width: 150,
    // ellipsis: true,
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
    width: 50,
    align: "center",
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
  },
  {
    title: withSortIcon("Quantity", "quantity", sortedInfo, "center"),
    dataIndex: "quantity",
    align: "center",
    key: "quantity",
    // ellipsis: true,
    width: 100,
    sorter: (a, b) => a.quantity - b.quantity,
    sortOrder: sortedInfo?.columnKey === "quantity" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (quantity, record) => (
      <span id={`cell-${record.key}-quantity`} className="font-medium">
        {quantity.toLocaleString()}
      </span>
    ),
  },
  {
    title: "Time Remaining to Trade",
    dataIndex: "timeRemainingToTrade",
    key: "timeRemainingToTrade",
    ellipsis: true,
    width: 200,
    align: "center",
    render: (text, record) => (
      <div id={`cell-${record.key}-timeRemainingToTrade`}>
        {renderTimeRemainingCell(record)}
      </div>
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
