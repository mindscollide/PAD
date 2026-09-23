import { Button } from "../../../../components";

import TypeColumnTitle from "../../../../components/dropdowns/filters/typeColumnTitle";
import StatusColumnTitle from "../../../../components/dropdowns/filters/statusColumnTitle";
import { Tag, Tooltip } from "antd";
import style from "./dataWiseTransactionsReports.module.css";

import { formatApiDateTime, toYYMMDD } from "../../../../common/funtions/rejex";
import {
  mapBuySellToIds,
  mapStatusToIds,
} from "../../../../components/dropdowns/filters/utils";
import { withSortIcon } from "../../../../common/funtions/tableIcon";

/**
 * Utility: Build API request payload for approval listing
 *
 * @param {Object} searchState - Current search/filter state
 * @param {Object} assetTypeListingData - Extra request metadata (optional)
 * @returns {Object} API-ready payload
 */
export const buildApiRequest = (searchState = {}, assetTypeListingData) => ({
  InstrumentName: searchState.instrumentName || "",
  DepartmentName: searchState.departmentName || "",
  Quantity: Number(searchState.quantity) || 0,

  PageNumber: Number(searchState.pageNumber) || 1,
  Length: Number(searchState.pageSize) || 10,

  StatusIds: mapStatusToIds(searchState.status, 2),
  TypeIds: mapBuySellToIds(searchState.type, assetTypeListingData?.Equities),

  RequesterName: searchState.employeeName || "",

  StartDate: searchState.startDate ? toYYMMDD(searchState.startDate) : "",
  EndDate: searchState.endDate ? toYYMMDD(searchState.endDate) : "",
});

export const buildExportRequest = (searchState = {}, assetTypeListingData) => ({
  InstrumentName: searchState.instrumentName || "",
  DepartmentName: searchState.departmentName || "",
  Quantity: searchState.quantity ? Number(searchState.quantity) : null,
  StatusIds: mapStatusToIds(searchState.status, 2),
  TypeIds: mapBuySellToIds(searchState.type, assetTypeListingData?.Equities),
  RequesterName: searchState.employeeName || "",
  StartDate: searchState.startDate ? toYYMMDD(searchState.startDate) : "",
  EndDate: searchState.endDate ? toYYMMDD(searchState.endDate) : "",
});

/**
 * ExportAdminDateWiseTransactionReport request payload - same filters as
 * buildApiRequest above, minus PageNumber/Length (an export always
 * returns the full matching set in one file, no pagination). Matches the
 * doc's own defaults exactly: Quantity null (not 0) when unset.
 */
// export const buildExportRequest = (searchState = {}, assetTypeListingData) => ({
//   InstrumentName: searchState.instrumentName || "",
//   DepartmentName: searchState.departmentName || "",
//   Quantity: searchState.quantity ? Number(searchState.quantity) : null,
//   StatusIds: mapStatusToIds(searchState.status, 2),
//   TypeIds: mapBuySellToIds(searchState.type, assetTypeListingData?.Equities),
//   RequesterName: searchState.employeeName || "",
//   StartDate: searchState.startDate ? toYYMMDD(searchState.startDate) : "",
//   EndDate: searchState.endDate ? toYYMMDD(searchState.endDate) : "",
// });

/**
 * Maps GetAdminDateWiseTransactionReportAPI records into a UI-friendly
 * format. Per API_Changes/2026-08-11_admin_reports_all_apis.md, this is a
 * flat row shape (unlike CO/HOC's own nested instrument/assetType/
 * approvalStatus DTOs) - system-wide, one row per Transaction workflow.
 *
 * @param {Object|Array} res - API response ({records, totalRecords}) or a bare array
 * @returns {Array} Mapped transaction list
 */
export const mappingDateWiseTransactionReport = (res = []) => {
  const records = Array.isArray(res) ? res : res?.records || [];

  if (!records.length) return [];

  return records.map((item) => ({
    key: item.requestID,
    approvalID: item.approvalID,
    requestID: item.requestID,
    instrumentCode: item.instrumentShortCode || "—",
    instrumentName: item.instrumentName || "—",
    assetTypeShortCode: item.assetShortCode || "—",
    transactionDate:
      `${item?.requestDate || ""} ${item?.requestTime || ""}`.trim() || "—",
    department: item.departmentName || "",
    // FIXED (API_Changes/2026-09-23_admin_date_wise_transaction_report_
    // type_nested.md): typeID/typeName moved from flat fields to a nested
    // `tradeType` object, matching the shape already used for the same
    // concept on most other reports.
    type: item.tradeType?.typeName || "-",
    status: item.status || "",
    quantity: item.quantity || 0,
    assetType: item.assetType || "",
    assetTypeID: item.assetTypeID || 0,
    employeeName: item.requesterName || "",
    employeeID: item.employeeID || "",
  }));
};

/**
 * ADDED: Default date range for Date Wise Transaction Report - present
 * date back 6 months to present date. Applied on initial load and
 * re-applied on "Clear" (instead of falling back to null), so the
 * report is never actually unfiltered by date - same pattern used
 * elsewhere for this report family.
 */
export const getDefaultDateRange = () => {
  const end = new Date();
  const start = new Date();
  start.setMonth(start.getMonth() - 6);
  return { startDate: start, endDate: end };
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
const withFilterHeader = (node) => (
  <div
    className={style["table-header-wrapper"]}
    style={{
      display: "flex",
      alignItems: "center",
      minHeight: "32px",
      width: "100%",
    }}
  >
    {node}
  </div>
);
export const getBorderlessTableColumns = ({
  approvalStatusMap,
  sortedInfo,
  coDatewiseTransactionReportSearch,
  setCODatewiseTransactionReportSearch,
  handelViewDetails,
}) => [
  {
    title: withSortIcon("Employee ID", "employeeID", sortedInfo, "center"),
    dataIndex: "employeeID",
    key: "employeeID",
    width: 120,
    align: "center",
    sorter: (a, b) => Number(a.employeeID) - Number(b.employeeID),
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "employeeID" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (employeeID) => <span className="font-medium">{employeeID}</span>,
  },
  {
    title: withSortIcon("Employee Name", "employeeName", sortedInfo),
    dataIndex: "employeeName",
    key: "employeeName",
    width: 160,
    sorter: (a, b) => a.employeeName.localeCompare(b.employeeName),
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "employeeName" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text) => <span className="font-medium">{text}</span>,
  },
  {
    title: withSortIcon("Department Name", "department", sortedInfo),
    dataIndex: "department",
    key: "department",
    width: 220,
    sorter: (a, b) => a.department.localeCompare(b.department),
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "department" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text) => <span className="font-medium">{text}</span>,
  },
  {
    title: withSortIcon("Instrument", "instrumentName", sortedInfo),
    dataIndex: "instrumentName",
    key: "instrumentName",
    width: 230,
    sorter: (a, b) => {
      const nameA = a?.instrumentName || "";
      const nameB = b?.instrumentName || "";
      return nameA.localeCompare(nameB);
    },
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "instrumentName" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (instrument, record) => {
      const assetCode = record?.assetTypeShortCode;
      const code = record?.instrumentCode || "";
      const instrumentName = record?.instrumentName || "";

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
  },
  {
    title: withSortIcon(
      "Transaction Date",
      "transactionDate",
      sortedInfo,
      "center"
    ),
    dataIndex: "transactionDate",
    key: "transactionDate",
    width: 180,
    align: "center",
    sorter: (a, b) =>
      (a?.transactionDate || "").localeCompare(b?.transactionDate || ""),
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "transactionDate" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (_, record) => (
      <span className="text-gray-600">
        {formatApiDateTime(`${record.transactionDate}`)}
      </span>
    ),
  },
  {
    title: withFilterHeader(
      <TypeColumnTitle
        state={coDatewiseTransactionReportSearch}
        setState={setCODatewiseTransactionReportSearch}
      />
    ),
    dataIndex: "type",
    width: 110,
    key: "type",
    align: "center",
    filteredValue: coDatewiseTransactionReportSearch.type?.length
      ? coDatewiseTransactionReportSearch.type
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
    title: withSortIcon("Quantity", "quantity", sortedInfo, "center"),
    dataIndex: "quantity",
    key: "quantity",
    width: 100,
    align: "center",
    sorter: (a, b) => a.quantity - b.quantity,
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "quantity" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (q) => <span className="font-medium">{q.toLocaleString()}</span>,
  },
  {
    title: withFilterHeader(
      <StatusColumnTitle
        state={coDatewiseTransactionReportSearch}
        setState={setCODatewiseTransactionReportSearch}
      />
    ),
    width: 160,
    dataIndex: "status",
    key: "status",
    filteredValue: coDatewiseTransactionReportSearch.status?.length
      ? coDatewiseTransactionReportSearch.status
      : null,
    onFilter: () => true,
    render: (status, record) => (
      <div id={`cell-${record.key}-status`}>
        {renderStatusTag(status, approvalStatusMap)}
      </div>
    ),
  },
  {
    title: "",
    key: "action",
    width: "120px",

    align: "center", // 🔷 Align content to the right
    render: (_, record) => (
      <div className={style.viewEditClass}>
        <Button
          className="small-dark-button_lesser-padding"
          text={"View Details"}
          onClick={() => {
            // FIXED (API_Changes/2026-08-28_admin_datewise_transaction_
            // view_details.md): the new endpoint is keyed by RequestID
            // (the workflow ID), not approvalID.
            handelViewDetails(record.requestID);
          }}
        />
      </div>
    ),
  },
];
