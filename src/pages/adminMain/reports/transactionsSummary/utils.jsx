import { Button } from "../../../../components";

import { Tag, Tooltip } from "antd";
import style from "./transactionsSummary.module.css";

import { formatApiDateTime, toYYMMDD } from "../../../../common/funtions/rejex";
import { withSortIcon } from "../../../../common/funtions/tableIcon";

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

export const buildApiRequestViewDetails = (searchState = {}) => ({
  // (pageNumber - 1) * length on the backend - 0 (the search state's
  // initial value) resolves to page 1 the same as 1 would.
  PageNumber: Number(searchState.pageNumber) || 1,
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
});

/**
 * ExportAdminTransactionSummaryViewDetails request payload - same filters
 * as buildApiRequestViewDetails above, minus PageNumber/Length, per
 * API_Changes/2026-08-28_admin_transaction_summary_export.md (2).
 */
export const buildExportRequestViewDetails = (searchState = {}) => ({
  TransactionDate: searchState.transactionDate,
  QuantitySearch: searchState.quantitySearch
    ? Number(searchState.quantitySearch)
    : null,
  InstrumentNameSearch: searchState.instrumentNameSearch || "",
  RequesterNameSearch: searchState.requesterNameSearch || "",
});

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
    const actionByList = Array.isArray(item.actionBy) ? item.actionBy : [];
    const actionBy =
      actionByList.map((a) => a?.fullName).filter(Boolean).join(", ") || "—";

    return {
      key: item.requestID,
      requestID: item.requestID,
      approvalID: item.requestID,
      instrumentName: item.instrumentName || "—",
      instrumentShortCode: item.instrumentShortCode || "",
      employeeName: item.requesterName || "",
      employeeID: item.requesterID || "",
      type: item.tradeType || "-",
      status: item.status || "",
      statusID: item.statusID,
      quantity: item.quantity || 0,
      approvalComment: item.approvalComment || [],
      rejectionComment: item.rejectionComment || [],
      actionBy,
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
const renderStatusTag = (status, approvalStatusMap) => {
  const tagConfig = approvalStatusMap[status] || {};

  return (
    <Tag
      style={{
        backgroundColor: tagConfig.backgroundColor,
        color: tagConfig.textColor,
        whiteSpace: "nowrap",
        display: "inline-flex",
        alignItems: "center",
        border: "none",
        borderRadius: 4,
        padding: "2px 8px",
        fontSize: 14,
      }}
    >
      {tagConfig.label || status}
    </Tag>
  );
};
const numberSorter = (key) => (a, b) =>
  Number(String(a[key] || 0).replace(/[^\d]/g, "")) -
  Number(String(b[key] || 0).replace(/[^\d]/g, ""));

export const getBorderlessTableColumnsViewDetails = ({
  approvalStatusMap,
  sortedInfoView,
  setIsViewComments,
  // ADDED (2026-08-28_admin_transaction_summary_view_details_fix.md):
  // "View Comments" never actually told the modal which row it was for -
  // onClick only flipped isViewComments to true, so ViewComment.jsx had
  // no per-row data to read at all. Same pattern CO/HOC's own version of
  // this report already uses.
  setSelectedWorkFlowViewDetaild,
}) => [
  {
    title: withSortIcon("Employee ID", "employeeID", sortedInfoView),
    dataIndex: "employeeID",
    key: "employeeID",
    align: "left",
    width: 150,
    ellipsis: true,
    sorter: numberSorter("employeeID"),
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfoView?.columnKey === "employeeID" ? sortedInfoView.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (employeeID) => {
      return (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span className="font-medium">{employeeID}</span>
        </div>
      );
    },
  },
  {
    title: withSortIcon("Employee Name", "employeeName", sortedInfoView),
    dataIndex: "employeeName",
    key: "employeeName",
    width: 200,
    align: "left",
    ellipsis: true,
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
    width: 150,
    ellipsis: true,
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
    ellipsis: true,
    sorter: (a, b) => (a.actionBy || "").localeCompare(b.actionBy || ""),
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfoView?.columnKey === "actionBy" ? sortedInfoView.order : null,
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
            maxWidth: "200px",
            display: "inline-block",
          }}
        >
          {text}
        </span>
      </Tooltip>
    ),
  },
  {
    title: withSortIcon("Action Date", "actionDate", sortedInfoView, "center"),
    dataIndex: "actionDate",
    key: "actionDate",
    align: "center",
    width: 180,
    ellipsis: true,
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
        <span className="text-gray-600" title={combined || "—"}>
          {formatApiDateTime(combined) || "—"}
        </span>
      );
    },
  },
  {
    // NOTE: Type is not server-filterable for Admin's View Details -
    // GetAdminTransactionSummaryViewDetailsAPI's request has no TypeIds
    // param (unlike CO/HOC's own equivalent) - plain column, no filter.
    title: "Type",
    dataIndex: "type",
    width: 100,
    key: "type",
    ellipsis: true,
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
    width: 100,
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
    // NOTE: Status is not server-filterable for Admin's View Details -
    // GetAdminTransactionSummaryViewDetailsAPI's request has no StatusIds
    // param (unlike CO/HOC's own equivalent) - plain column, no filter.
    title: "Status",
    width: 200,
    dataIndex: "status",
    key: "status",
    ellipsis: true,
    render: (status, record) => (
      <div id={`cell-${record.key}-status`}>
        {renderStatusTag(status, approvalStatusMap)}
      </div>
    ),
  },
  {
    title: "",
    key: "action",
    width: 150,
    align: "right", // 🔷 Align content to the right
    render: (_, record) => (
      <div className={style.viewEditClass}>
        <Button
          className="small-light-button"
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
