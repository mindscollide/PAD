import { Button } from "../../../../components";

import { Tag, Tooltip } from "antd";
import style from "./transactionsSummary.module.css";

import { formatApiDateTime, toYYMMDD } from "../../../../common/funtions/rejex";
import { withSortIcon } from "../../../../common/funtions/tableIcon";

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
        {formatApiDateTime(date) || "—"}
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
            console.log(record, "tradeApprovalID");
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
  QuantitySearch: searchState.quantitySearch || "",
  InstrumentNameSearch: searchState.instrumentNameSearch || "",
  RequesterNameSearch: searchState.requesterNameSearch || "",
});

/**
 * Maps GetAdminTransactionSummaryViewDetailsAPI records into a UI-friendly
 * format. Per SRS, Admin's View Details has 2 extra columns vs CO/HOC -
 * Action By (parsed from actionByJson, a JSON string) and Action Date.
 *
 * @param {Object|Array} res - API response ({records, totalRecords}) or a bare array
 * @returns {Array} Mapped list
 */
export const mappingDateWiseTransactionviewDetailst = (res = []) => {
  const records = Array.isArray(res) ? res : res?.records || [];

  if (!records.length) return [];

  return records.map((item) => {
    let actionBy = "—";
    try {
      const actors = item.actionByJson ? JSON.parse(item.actionByJson) : [];
      if (Array.isArray(actors) && actors.length) {
        actionBy = actors.map((a) => a.fullName || a.FullName).join(", ");
      }
    } catch (error) {
      console.error("Failed to parse actionByJson", error);
    }

    return {
      key: item.requestID,
      requestID: item.requestID,
      approvalID: item.requestID,
      instrumentName: item.instrumentName || "—",
      employeeName: item.requesterName || "",
      employeeID: item.requesterID || "",
      type: item.tradeType || "-",
      status: item.status || "",
      statusID: item.statusID,
      quantity: item.quantity || 0,
      approvalComment: item.approvalComment || "",
      rejectionComment: item.rejectionComment || "",
      actionBy,
      actionDate: item.actionDate || "—",
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
    render: (instrumentName) => (
      <Tooltip title={instrumentName} placement="topLeft">
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
          {instrumentName || "—"}
        </span>
      </Tooltip>
    ),
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
    title: withSortIcon(
      "Action Date",
      "actionDate",
      sortedInfoView,
      "center"
    ),
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
    render: (date) => (
      <span className="text-gray-600" title={date || "—"}>
        {formatApiDateTime(date) || "—"}
      </span>
    ),
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
            console.log(record, "tradeApprovalID");
            // handelViewDetails(record.approvalID);
            setIsViewComments(true);
            // setCheckTradeApprovalID(record?.approvalID);
            // setEditBrokerModal(true);
            // setEditModalData(record);
          }}
        />
      </div>
    ),
  },
];
