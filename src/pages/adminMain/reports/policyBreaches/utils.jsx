import { Tooltip } from "antd";
import style from "./AdminPolicyBreachesReport.module.css";

import { toYYMMDD, formatApiDateTime } from "../../../../common/funtions/rejex";
import TypeColumnTitle from "../../../../components/dropdowns/filters/typeColumnTitle";
import { mapBuySellToIds } from "../../../../components/dropdowns/filters/utils";
import { withSortIcon } from "../../../../common/funtions/tableIcon";

/**
 * Utility: Build API request payload for GetAdminPolicyBreachesAPI per
 * API_Changes/2026-08-11_admin_reports_all_apis.md.
 *
 * @param {Object} searchState - Current search/filter state
 * @param {Object} assetTypeListingData - Extra request metadata (for TypeIds resolution)
 * @returns {Object} API-ready payload
 */
export const buildApiRequest = (searchState = {}, assetTypeListingData) => ({
  InstrumentName: searchState.instrumentName || "",
  EmployeeName: searchState.employeeName || "",
  DepartmentName: searchState.departmentName || "",
  StartDate: searchState.startDate ? toYYMMDD(searchState.startDate) : "",
  EndDate: searchState.endDate ? toYYMMDD(searchState.endDate) : "",
  Quantity: searchState.quantity || 0,
  // FIXED (API_Changes/2026-09-23_admin_type_nested_and_typeids_filter.md):
  // `Type` (array of "Buy"/"Sell" strings) renamed to `TypeIds` (array of
  // numeric IDs) - the Type filter dropdown itself still stores labels in
  // searchState.type (shared TypeColumnTitle/TypeFilterDropdown component),
  // so resolve to IDs here the same way every other report on this
  // convention already does.
  TypeIds: searchState.type?.length
    ? mapBuySellToIds(searchState.type, assetTypeListingData?.Equities)
    : [1, 2],
  // (pageNumber - 1) * length on the backend - 0 (the search state's
  // initial value) resolves to page 1 the same as 1 would.
  PageNumber: Number(searchState.pageNumber) || 1,
  Length: Number(searchState.pageSize) || 10,
});

/**
 * ExportAdminPolicyBreaches request payload - same filters as
 * buildApiRequest above, minus PageNumber/Length (an export always
 * returns the full matching set in one file, no pagination). Matches the
 * doc's own defaults exactly: Quantity null (not 0) and TypeIds [] (not
 * [1,2]) when unset - it's ExportAdminPolicyBreaches's own SP that decides
 * what "no filter" means for each, not necessarily the same as the live
 * list's.
 */
export const buildExportRequest = (searchState = {}, assetTypeListingData) => ({
  InstrumentName: searchState.instrumentName || "",
  EmployeeName: searchState.employeeName || "",
  DepartmentName: searchState.departmentName || "",
  StartDate: searchState.startDate ? toYYMMDD(searchState.startDate) : "",
  EndDate: searchState.endDate ? toYYMMDD(searchState.endDate) : "",
  Quantity: searchState.quantity || null,
  TypeIds: mapBuySellToIds(searchState.type, assetTypeListingData?.Equities),
});

/**
 * Maps GetAdminPolicyBreachesAPI records into a UI-friendly format.
 * requestDate+requestTime is also kept concatenated as-is
 * (requestedDateTime) - it's the natural key GetAdminPolicyBreachDetailsAPI
 * needs to look up a specific row's breach details.
 *
 * @param {Object|Array} res - API response ({records, totalRecords}) or a bare array
 * @returns {Array} Mapped list
 */
export const mapListData = (res = []) => {
  const records = Array.isArray(res) ? res : res?.records || [];

  if (!records.length) return [];

  return records.map((item, index) => ({
    key: `${item.employeeID}-${item.requestDate}-${item.requestTime}-${index}`,
    employeeID: item.employeeID,
    employeeName: item.employeeName || "",
    departmentName: item.departmentName || "",
    requestDateTime:
      `${item?.requestDate || ""} ${item?.requestTime || ""}`.trim() || "—",
    requestedDateTime: `${item?.requestDate || ""}${item?.requestTime || ""}`,
    instrumentName: item.instrumentName || "",
    // ADDED (API_Changes/2026-08-28_admin_policy_breaches_instrument_shortcode.md,
    // not deployed yet - "" until then, column falls back to the full
    // name only in that case, same as before): matches the instrument
    // shortcode + asset-type badge shape already used on HCA's Overdue
    // Verifications screen. instrumentShortCode can legitimately come
    // back null (no matching Instruments row for the stored name) - "" is
    // the safe fallback either way.
    instrumentShortCode: item.instrumentShortCode || "",
    assetTypeShortCode: item.assetTypeShortCode || "",
    // FIXED (API_Changes/2026-09-23_admin_type_nested_and_typeids_filter.md):
    // flat `type` string replaced with a nested `tradeType` object.
    type: item.tradeType?.typeName || "-",
    quantity: item.quantity || 0,
    policyCount: item.policyCount || 0,
  }));
};

export const getBorderlessTableColumns = ({
  sortedInfo,
  adminPolicyBreachesReportSearch,
  setAdminPolicyBreachesReportSearch,
  onViewPolicyBreachDetails,
}) => [
  {
    title: withSortIcon("Employee ID", "employeeID", sortedInfo, "center"),
    dataIndex: "employeeID",
    key: "employeeID",
    width: 90,
    align: "center",
    sorter: (a, b) => Number(a.employeeID) - Number(b.employeeID),
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "employeeID" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (employeeID) => <span className="font-medium">{employeeID}</span>,
  },
  {
    title: withSortIcon("Name", "employeeName", sortedInfo),
    dataIndex: "employeeName",
    key: "employeeName",
    width: "140px",
    sorter: (a, b) =>
      (a.employeeName || "").localeCompare(b.employeeName || ""),
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "employeeName" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text) => <span className="font-medium">{text}</span>,
  },
  {
    title: withSortIcon("Department", "departmentName", sortedInfo),
    dataIndex: "departmentName",
    key: "departmentName",
    width: 180,
    sorter: (a, b) =>
      (a.departmentName || "").localeCompare(b.departmentName || ""),
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "departmentName" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text) => <span className="font-medium">{text}</span>,
  },
  {
    title: withSortIcon("Request Date & Time", "requestDateTime", sortedInfo),
    dataIndex: "requestDateTime",
    key: "requestDateTime",
    width: "180px",
    // FIXED: was rendering the raw "yyyyMMdd HHmmss" UTC string as-is, no
    // localization - same fix already applied on HTA's own Policy
    // Breaches list (headOfTradeApprover/reports/policyBreaches/utils.jsx).
    // Sorts on the raw value still (correctly orderable as digits), only
    // the displayed text is formatted.
    sorter: (a, b) =>
      (a.requestDateTime || "").localeCompare(b.requestDateTime || ""),
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "requestDateTime" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text) => (
      <span className="text-gray-600">{formatApiDateTime(text) || "—"}</span>
    ),
  },
  {
    title: withSortIcon("Instrument", "instrumentName", sortedInfo),
    dataIndex: "instrumentName",
    key: "instrumentName",
    width: "180px",
    sorter: (a, b) =>
      (a.instrumentName || "").localeCompare(b.instrumentName || ""),
    sortOrder:
      sortedInfo?.columnKey === "instrumentName" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    // Shortcode + asset-type badge, same shape as HCA's Overdue
    // Verifications Instrument column, per API_Changes/2026-08-28_admin_
    // policy_breaches_instrument_shortcode.md. Falls back to "EQ" (this
    // report only ever covers Equities per the doc) and the full name
    // until that deploys (instrumentShortCode/assetTypeShortCode both "").
    render: (name, record) => (
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span className="custom-shortCode-asset" style={{ minWidth: 30 }}>
          {(record?.assetTypeShortCode || "EQ").substring(0, 2).toUpperCase()}
        </span>
        <Tooltip title={name} placement="topLeft">
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
            {record?.instrumentShortCode || name || "—"}
          </span>
        </Tooltip>
      </div>
    ),
  },
  {
    title: (
      <TypeColumnTitle
        state={adminPolicyBreachesReportSearch}
        setState={setAdminPolicyBreachesReportSearch}
      />
    ),
    dataIndex: "type",
    key: "type",
    width: "120px",
    align: "center",
    filteredValue: adminPolicyBreachesReportSearch?.type?.length
      ? adminPolicyBreachesReportSearch?.type
      : null,
    onFilter: () => true,
    render: (type, record) => (
      <span
        id={`cell-${record.key}-type`}
        className={type === "Buy" ? "text-green-600" : "text-red-600"}
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
    title: withSortIcon("Quantity", "quantity", sortedInfo),
    dataIndex: "quantity",
    key: "quantity",
    width: "120px",
    sorter: (a, b) => Number(a.quantity || 0) - Number(b.quantity || 0),
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "quantity" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text) => (
      <span className={`${style["cell-text"]} font-medium`}>
        {text !== null && text !== undefined
          ? Number(text).toLocaleString("en-US")
          : "-"}
      </span>
    ),
  },
  {
    title: withSortIcon("Policy Count", "policyCount", sortedInfo, "center"),
    dataIndex: "policyCount",
    key: "policyCount",
    width: "120px",
    align: "center",
    sorter: (a, b) => Number(a.policyCount || 0) - Number(b.policyCount || 0),
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "policyCount" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text, record) => (
      <span
        className={`${style["cell-text"]} font-medium cursor-pointer text-primary`}
        onClick={() => onViewPolicyBreachDetails?.(record)}
      >
        {text}
      </span>
    ),
  },
];
