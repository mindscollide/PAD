import { Button } from "../../../../components";

import { Tag, Tooltip } from "antd";
import style from "./transactionsSummary.module.css";

import { formatApiDateTime, toYYMMDD } from "../../../../common/funtions/rejex";
import { withSortIcon } from "../../../../common/funtions/tableIcon";
import StatusColumnTitle from "../../../../components/dropdowns/filters/statusColumnTitle";
import TypeColumnTitle from "../../../../components/dropdowns/filters/typeColumnTitle";
import {
  mapBuySellToIds,
  mapStatusToIds,
} from "../../../../components/dropdowns/filters/utils";

/**
 * Formats a raw "YYYYMMDD" (date-only, no time component) string into a
 * display "YYYY-MM-DD". FIXED: this table's dates were previously run
 * through formatApiDateTime, which only formats a combined
 * "YYYYMMDD HHmm" string and silently returns the RAW unformatted input
 * whenever there's no time part to split on - which is always the case
 * here, so dates never actually got formatted.
 */
export const formatDateOnly = (yyyyMMdd) => {
  if (!yyyyMMdd || typeof yyyyMMdd !== "string" || yyyyMMdd.length < 8)
    return "—";
  return `${yyyyMMdd.slice(0, 4)}-${yyyyMMdd.slice(4, 6)}-${yyyyMMdd.slice(
    6,
    8
  )}`;
};

/**
 * Utility: Build API request payload for approval listing
 *
 * @param {Object} searchState - Current search/filter state
 * @returns {Object} API-ready payload
 */
export const buildApiRequest = (searchState = {}) => ({
  // (pageNumber - 1) * length on the backend - 0 (the search state's
  // initial value) resolves to page 1 the same as 1 would.
  PageNumber: Number(searchState.pageNumber) || 1,
  Length: Number(searchState.pageSize) || 10,
  EndDate: searchState.endDate ? toYYMMDD(searchState.endDate) : "",
  StartDate: searchState.startDate ? toYYMMDD(searchState.startDate) : "",
});

/**
 * ExportAdminTransactionSummaryReport request payload - same filters as
 * buildApiRequest above, minus PageNumber/Length (an export always
 * returns every matching row in one file, per
 * API_Changes/2026-08-28_admin_transaction_summary_export.md).
 */
export const buildExportRequest = (searchState = {}) => ({
  StartDate: searchState.startDate ? toYYMMDD(searchState.startDate) : "",
  EndDate: searchState.endDate ? toYYMMDD(searchState.endDate) : "",
});

/**
 * Maps GetAdminTransactionSummaryReportAPI records into a UI-friendly
 * format - one row per calendar date with activity, per
 * API_Changes/2026-08-11_admin_reports_all_apis.md. transactionDate is a
 * date only (no time component).
 *
 * @param {Object|Array} res - API response ({records, totalRecords}) or a bare array
 * @returns {Array} Mapped list
 */
export const mappingDateWiseTransactionReport = (res = []) => {
  const records = Array.isArray(res) ? res : res?.records || [];

  if (!records.length) return [];

  return records.map((item) => ({
    key: item.transactionDate,
    totalEmployees: item.totalEmployees || 0,
    totalTransactions: item.totalTransactions || 0,
    compliantTransactions: item.compliantTransactions || 0,
    nonCompliantTransactions: item.nonCompliantTransactions || 0,
    transactionDate: item.transactionDate || "—",
  }));
};

const withFilterHeader = (element) => (
  <div
    className={style["table-header-wrapper"]}
    style={{
      display: "flex",
      alignItems: "center",
      minHeight: "32px",
      width: "100%",
    }}
  >
    {element}
  </div>
);

export const getBorderlessTableColumns = ({
  sortedInfo,
  handelViewDetails,
}) => [
  {
    title: withSortIcon(
      "Transaction Date",
      "transactionDate",
      sortedInfo,
      "center"
    ),
    dataIndex: "transactionDate",
    key: "transactionDate",
    width: 140,
    align: "center",
    ellipsis: true,
    sorter: (a, b) =>
      (a?.transactionDate || "").localeCompare(b?.transactionDate || ""),
    sortOrder:
      sortedInfo?.columnKey === "transactionDate" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (date) => (
      <span className="text-gray-600" title={date || "—"}>
        {formatDateOnly(date)}
      </span>
    ),
  },
  {
    title: withSortIcon(
      "Total Employees",
      "totalEmployees",
      sortedInfo,
      "center"
    ),
    dataIndex: "totalEmployees",
    key: "totalEmployees",
    width: 140,
    align: "center",
    ellipsis: true,
    sorter: (a, b) => (a?.totalEmployees ?? 0) - (b?.totalEmployees ?? 0),
    sortOrder:
      sortedInfo?.columnKey === "totalEmployees" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (q) => <span>{q.toLocaleString()}</span>,
  },
  {
    title: withSortIcon(
      "Total Transactions",
      "totalTransactions",
      sortedInfo,
      "center"
    ),
    dataIndex: "totalTransactions",
    key: "totalTransactions",
    width: 140,
    align: "center",
    ellipsis: true,
    sorter: (a, b) => (a?.totalTransactions ?? 0) - (b?.totalTransactions ?? 0),
    sortOrder:
      sortedInfo?.columnKey === "totalTransactions" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (q) => <span>{q.toLocaleString()}</span>,
  },
  {
    title: withSortIcon(
      "Compliant Transactions",
      "compliantTransactions",
      sortedInfo,
      "center"
    ),
    dataIndex: "compliantTransactions",
    key: "compliantTransactions",
    width: 180,
    align: "center",
    ellipsis: true,
    sorter: (a, b) =>
      (a?.compliantTransactions ?? 0) - (b?.compliantTransactions ?? 0),
    sortOrder:
      sortedInfo?.columnKey === "compliantTransactions"
        ? sortedInfo.order
        : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (q) => <span>{q.toLocaleString()}</span>,
  },
  {
    title: withSortIcon(
      "Non-Compliant Transactions",
      "nonCompliantTransactions",
      sortedInfo,
      "center"
    ),
    dataIndex: "nonCompliantTransactions",
    key: "nonCompliantTransactions",
    width: 200,
    align: "center",
    ellipsis: true,
    sorter: (a, b) =>
      (a?.nonCompliantTransactions ?? 0) - (b?.nonCompliantTransactions ?? 0),
    sortOrder:
      sortedInfo?.columnKey === "nonCompliantTransactions"
        ? sortedInfo.order
        : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (q) => <span>{q.toLocaleString()}</span>,
  },
  {
    title: "",
    key: "action",
    width: 200,
    align: "right", // 🔷 Align content to the right
    render: (_, record) => (
      <div className={style.viewEditClass}>
        <Button
          className="small-light-button"
          text={"View Details"}
          onClick={() => {
            handelViewDetails(record.transactionDate);
          }}
        />
      </div>
    ),
  },
];

export const buildApiRequestViewDetails = (
  searchState = {},
  assetTypeListingData
) => ({
  // Row offset, not a 1-based page index: 0, then the number of rows loaded
  // so far (API_Changes/2026-09-24_admin_transaction_summary_view_details_statusids.md).
  PageNumber: Number(searchState.pageNumber) || 0,
  Length: Number(searchState.pageSize) || 10,
  TransactionDate: searchState.transactionDate,
  // FIXED (API_Changes/2026-08-28_admin_transaction_summary_view_details_
  // fix.md "Update"): QuantitySearch is now a nullable number
  // (`long?`) server-side, deserialized by strict System.Text.Json - an
  // empty string ("", the default/unset value here) fails to deserialize
  // into it exactly like the numeric-value crash the doc fixed, just for
  // the opposite (no filter typed) case, which is the default state of
  // this screen. Must send null, not "", when unset.
  QuantitySearch: searchState.quantitySearch
    ? Number(searchState.quantitySearch)
    : null,
  InstrumentNameSearch: searchState.instrumentNameSearch || "",
  RequesterNameSearch: searchState.requesterNameSearch || "",
  // ADDED (API_Changes/2026-09-23_admin_type_nested_and_typeids_filter.md):
  // both params are new - the Type/Status column filters already existed
  // in the UI (reusing CO's own coTransactionsSummarysReportsViewDetailsSearch
  // state/components) but were silently non-functional since this
  // endpoint's request had nowhere to receive them. Status uses the
  // workflow-level scheme (8=Compliant/9=Non-Compliant) - must pass type 2
  // explicitly: mapStatusToIds' default (type = 1) is the bundle-level map
  // (Compliant=2 / Non-Compliant=3), which never matches a Transaction and
  // returns 0 records (API_Changes/2026-09-24_fe_compliant_noncompliant_statusids.md).
  TypeIds: mapBuySellToIds(searchState.type, assetTypeListingData?.Equities),
  StatusIds: mapStatusToIds(searchState.status, 2),
});

/**
 * ExportAdminTransactionSummaryViewDetails request payload - same filters
 * as buildApiRequestViewDetails above, minus PageNumber/Length, per
 * API_Changes/2026-08-28_admin_transaction_summary_export.md (2).
 */
export const buildExportRequestViewDetails = (
  searchState = {},
  assetTypeListingData
) => {
  // Same object the screen sends (incl. TypeIds/StatusIds), so the export
  // matches the filtered screen; an export is never paged.
  const request = buildApiRequestViewDetails(searchState, assetTypeListingData);
  delete request.PageNumber;
  delete request.Length;
  return request;
};

/**
 * Maps GetAdminTransactionSummaryViewDetailsAPI records into a UI-friendly
 * format. Per SRS, Admin's View Details has 2 extra columns vs CO/HOC -
 * Action By and Action Date.
 *
 * FIXED (API_Changes/2026-08-28_admin_transaction_summary_view_details_
 * fix.md): actionBy used to be raw JSON text (actionByJson) parsed here by
 * hand; approvalComment/rejectionComment used to be a single opaque
 * string holding the raw un-parsed JSON array text, with unresolved
 * "CO<id>" actor-tagging codes still attached. All three are now real
 * shapes straight from the API - actionBy an array of
 * {userID, firstName, lastName, fullName}, the comments arrays of
 * {userID, name, comments}. actionDate/actionTime also come as two
 * separate fields now (were one combined datetime string with no
 * separate time), and instrumentShortCode is new.
 *
 * @param {Object|Array} res - API response ({records, totalRecords}) or a bare array
 * @returns {Array} Mapped list
 */
export const mappingDateWiseTransactionviewDetailst = (res = []) => {
  const records = Array.isArray(res) ? res : res?.records || [];

  if (!records.length) return [];

  return records.map((item) => {
    const actionByNames = Array.isArray(item.actionBy)
      ? item.actionBy.map((user) => user?.fullName).filter(Boolean)
      : [];
    return {
      key: item.requestID,
      requestID: item.requestID,
      approvalID: item.requestID,
      instrumentName: item.instrumentName || "—",
      instrumentShortCode: item.instrumentShortCode || "",
      employeeName: item.requesterName || "",
      employeeID: item.requesterID || "",
      // FIXED (API_Changes/2026-09-23_admin_type_nested_and_typeids_filter.md):
      // flat `tradeType` string replaced with a nested {typeID, typeName} object.
      type: item.tradeType?.typeName || "-",
      status: item.status || "",
      statusID: item.statusID,
      quantity: item.quantity || 0,
      approvalComment: item.approvalComment || [],
      rejectionComment: item.rejectionComment || [],
      actionBy:
        actionByNames.length > 1 ? "Multiple Users" : actionByNames[0] || "—",
      actionByFullNames: actionByNames.join(", "),
      actionDate: item.actionDate || "",
      actionTime: item.actionTime || "",
    };
  });
};
/**
 * Renders status tag with appropriate styling
 * @param {string} status - Approval status
 * @param {Object} approvalStatusMap - Status to style mapping
 * @returns {JSX.Element} Status tag component
 */

const numberSorter = (key) => (a, b) =>
  Number(String(a[key] || 0).replace(/[^\d]/g, "")) -
  Number(String(b[key] || 0).replace(/[^\d]/g, ""));
const nowrapCell = (minWidth, maxWidth) => ({
  style: {
    minWidth,
    maxWidth,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
});
export const getBorderlessTableColumnsViewDetails = ({
  approvalStatusMap,
  sortedInfoView,
  setIsViewComments,

  coTransactionsSummarysReportsViewDetailsSearch,
  setCOTransactionsSummarysReportsViewDetailSearch,
  // ADDED (2026-08-28_admin_transaction_summary_view_details_fix.md):
  // "View Comments" never actually told the modal which row it was for -
  // onClick only flipped isViewComments to true, so ViewComment.jsx had
  // no per-row data to read at all. Same pattern CO/HOC's own version of
  // this report already uses.
  setSelectedWorkFlowViewDetaild,
}) => [
  {
    title: withSortIcon("Employee ID", "employeeID", sortedInfoView, "center"),
    dataIndex: "employeeID",
    key: "employeeID",
    align: "center",
    width: 150,
    sorter: numberSorter("employeeID"),
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfoView?.columnKey === "employeeID" ? sortedInfoView.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (employeeID) => {
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
          }}
        >
          <span className="font-medium">{employeeID}</span>
        </div>
      );
    },
  },
  {
    title: withSortIcon("Employee Name", "employeeName", sortedInfoView),
    dataIndex: "employeeName",
    key: "employeeName",
    width: 150,
    align: "left",
    sorter: (a, b) => a.employeeName.localeCompare(b.employeeName),
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfoView?.columnKey === "employeeName"
        ? sortedInfoView.order
        : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text) => <span className="font-medium">{text}</span>,
  },
  {
    title: withSortIcon("Instrument", "instrumentName", sortedInfoView),
    dataIndex: "instrumentName",
    key: "instrumentName",
    align: "left",
    width: 220,
    sorter: (a, b) => {
      const nameA = a?.instrumentName || "";
      const nameB = b?.instrumentName || "";
      return nameA.localeCompare(nameB);
    },
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfoView?.columnKey === "instrumentName"
        ? sortedInfoView.order
        : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (instrumentName, record) => {
      // FIXED: same badge + short-code treatment as Date-wise Transaction
      // Report's own Instrument column - instrumentShortCode is new on
      // this response (2026-08-28_admin_transaction_summary_view_details_
      // fix.md). No per-row asset-type short code on this endpoint (unlike
      // Date-wise Transaction Report's assetTypeShortCode), so the badge
      // falls back to "EQ" - same fallback used elsewhere in the app when
      // a real asset-type value isn't available.
      const shortCode = record?.instrumentShortCode || "";
      return (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span className="custom-shortCode-asset" style={{ minWidth: 30 }}>
            EQ
          </span>
          <Tooltip title={instrumentName} placement="topLeft">
            <span
              className="font-medium"
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: "160px",
                display: "inline-block",
                cursor: "pointer",
              }}
              title={shortCode}
            >
              {shortCode || instrumentName || "—"}
            </span>
          </Tooltip>
        </div>
      );
    },
  },
  {
    // ADDED per SRS: Admin's View Details has 2 extra columns vs CO/HOC -
    // Action By and Action Date - so the Admin can see which Compliance
    // Officer took action.
    title: withSortIcon("Action By", "actionBy", sortedInfoView),
    dataIndex: "actionBy",
    key: "actionBy",
    align: "left",
    width: 200,
    sorter: (a, b) => (a.actionBy || "").localeCompare(b.actionBy || ""),
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfoView?.columnKey === "actionBy" ? sortedInfoView.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text, record) => (
      <Tooltip title={record?.actionByFullNames || text} placement="topLeft">
        <span className="font-medium">{text || "—"}</span>
      </Tooltip>
    ),
  },
  {
    title: withSortIcon("Action Date", "actionDate", sortedInfoView, "center"),
    dataIndex: "actionDate",
    key: "actionDate",
    align: "center",
    width: 180,
    sorter: (a, b) => (a?.actionDate || "").localeCompare(b?.actionDate || ""),
    sortOrder:
      sortedInfoView?.columnKey === "actionDate" ? sortedInfoView.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (date, record) => {
      // FIXED: actionDate/actionTime now come as two separate fields
      // (2026-08-28_admin_transaction_summary_view_details_fix.md) -
      // must be localized as one combined string, never independently.
      const combined = [date, record?.actionTime].filter(Boolean).join(" ");
      return (
        <span className="text-gray-600">
          {formatApiDateTime(combined) || "—"}
        </span>
      );
    },
  },
  {
    // FIXED (API_Changes/2026-09-23_admin_type_nested_and_typeids_filter.md):
    // was "not server-filterable" - GetAdminTransactionSummaryViewDetailsAPI's
    // request now accepts TypeIds (see buildApiRequestViewDetails above).
    title: withFilterHeader(
      <TypeColumnTitle
        state={coTransactionsSummarysReportsViewDetailsSearch}
        setState={setCOTransactionsSummarysReportsViewDetailSearch}
      />
    ),
    dataIndex: "type",
    width: 150,
    key: "type",
    filteredValue: coTransactionsSummarysReportsViewDetailsSearch.type?.length
      ? coTransactionsSummarysReportsViewDetailsSearch.type
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
    title: withSortIcon("Quantity", "quantity", sortedInfoView, "center"),
    dataIndex: "quantity",
    key: "quantity",
    align: "center",
    width: 150,
    sorter: (a, b) => (a?.quantity ?? 0) - (b?.quantity ?? 0),
    sortOrder:
      sortedInfoView?.columnKey === "quantity" ? sortedInfoView.order : null,
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
    // FIXED (API_Changes/2026-09-23_admin_type_nested_and_typeids_filter.md):
    // was "not server-filterable" - GetAdminTransactionSummaryViewDetailsAPI's
    // request now accepts StatusIds (see buildApiRequestViewDetails above).
    title: withFilterHeader(
      <StatusColumnTitle
        state={coTransactionsSummarysReportsViewDetailsSearch}
        setState={setCOTransactionsSummarysReportsViewDetailSearch}
      />
    ),
    width: 200,
    dataIndex: "status",
    key: "status",
    filteredValue: coTransactionsSummarysReportsViewDetailsSearch.status?.length
      ? coTransactionsSummarysReportsViewDetailsSearch.status
      : null,
    onFilter: () => true,
    render: (status) => {
      const tag = approvalStatusMap?.[status] || {};
      return (
        <Tag
          style={{
            backgroundColor: tag.backgroundColor,
            color: tag.textColor,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "inline-block",
          }}
          className="border-less-table-orange-status"
        >
          {tag.label || status || "—"}
        </Tag>
      );
    },
    onHeaderCell: () => nowrapCell(150, 240),
    onCell: () => nowrapCell(150, 240),
  },
  {
    title: "",
    key: "action",
    align: "center", // 🔷 Align content to the right
    width: "200",
    render: (_, record) => (
      <div className={style.viewEditClass}>
        <Button
          className="small-dark-button_lesser-padding"
          text={"View Comments"}
          onClick={() => {
            setSelectedWorkFlowViewDetaild(record);
            setIsViewComments(true);
          }}
        />
      </div>
    ),
  },
];
