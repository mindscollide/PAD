import { Tooltip } from "antd";
import ArrowUP from "../../../../../assets/img/arrow-up-dark.png";
import ArrowDown from "../../../../../assets/img/arrow-down-dark.png";
import DefaultColumArrow from "../../../../../assets/img/default-colum-arrow.png";
import style from "./HTAPolicyBreaches.module.css";

import {
  formatApiDateTime,
  toYYMMDD,
} from "../../../../../common/funtions/rejex";
import { mapBuySellToIds } from "../../../../../components/dropdowns/filters/utils";
import TypeColumnTitle from "../../../../../components/dropdowns/filters/typeColumnTitle";

/**
 * Utility: Build API request payload for approval listing
 *
 * @param {Object} searchState - Current search/filter state
 * @param {Object} assetTypeListingData - Extra request metadata (optional)
 * @returns {Object} API-ready payload
 */
export const buildApiRequest = (searchState = {}, assetTypeListingData) => ({
  FromDate: searchState.startDate ? toYYMMDD(searchState.startDate) : "",
  ToDate: searchState.endDate ? toYYMMDD(searchState.endDate) : "",
  Quantity: searchState.quantity || 0,
  EmployeeName: searchState.employeeName || "",
  InstrumentName: searchState.instrumentName || "",
  TypeIds:
    mapBuySellToIds?.(searchState.type, assetTypeListingData?.Equities) || [],
  DepartmentName: searchState.departmentName || "",
  PageNumber: Number(searchState.pageNumber) || 0,
  Length: Number(searchState.pageSize) || 10,
});

/**
 * Maps employee transaction data into a UI-friendly format
 *
 * @param {Object} getEmployeeTransactionReport - API response containing transactions
 * @returns {Array} Mapped transaction list
 */
export const mapListData = (
  assetTypeData,
  myTradeApprovalLineManagerData = [],
) => {
  const records = Array.isArray(myTradeApprovalLineManagerData)
    ? myTradeApprovalLineManagerData
    : myTradeApprovalLineManagerData?.records || [];

  if (!records.length) return [];

  return records.map((item) => ({
    key: item.userID,
    employeeID: item.userID,
    employeeName: item.fullName || "",
    departmentName: item.departmentName || "",
    quantity: item.quantity || 0,
    policyCount: item.totalBreachedPolicies || 0,
    breachedPolicies: item.breachedPolicies || 0,
    requestDateTime:
      `${item?.requestDate || ""} ${item?.requestTime || ""}`.trim() || "—",
    // ADDED (2026-08-18): the drill-down/export APIs need requestDate+
    // requestTime concatenated with no separator ("20260812104117"), not
    // the space-joined display format above - see
    // API_Changes/2026-08-18_hta_policy_breach_details_and_export_apis.md.
    requestedDateTime: `${item?.requestDate || ""}${item?.requestTime || ""}`,
    // FIXED (2026-08-18): this API already returns instrumentName on
    // every record, there was just nowhere for it to go - added a column
    // for it below, and it's also required by the drill-down/export
    // request payload. Also this API's tradeType is already a resolved
    // string ("Buy"/"Sell"), not the {typeID} object
    // getTradeTypeById expects - it always fell back to "—". Both per
    // API_Changes/2026-08-18_hta_policy_breaches_type_and_instrument_columns.md.
    instrumentName: item.instrumentName || "",
    tradeType: item?.tradeType || "-",
    resubmitted: item.resubmitted || 0,
  }));
};

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

const withSortIcon = (label, columnKey, sortedInfo, align = "left") => (
  <div
    className={style["table-header-wrapper"]}
    style={{
      justifyContent:
        align === "center"
          ? "center"
          : align === "right"
            ? "flex-end"
            : "flex-start",
      textAlign: align,
    }}
  >
    <span className={style["table-header-text"]}>{label}</span>
    <span className={style["table-header-icon"]}>
      {getSortIcon(columnKey, sortedInfo)}
    </span>
  </div>
);

export const getBorderlessTableColumns = ({
  approvalStatusMap,
  sortedInfo,
  htaPolicyBreachesReportSearch,
  setHTAPolicyBreachesReportSearch,
  // ADDED (2026-08-18): fetches the drill-down details AND opens the
  // modal - API_Changes/2026-08-18_hta_policy_breach_details_and_export_apis.md.
  onViewPolicyBreachDetails,
}) => [
  {
    title: withSortIcon("Employee ID", "employeeID", sortedInfo),
    dataIndex: "employeeID",
    key: "employeeID",
    align: "left",
    width: "140px",
    sorter: (a, b) =>
      parseInt(a.employeeID.replace(/[^\d]/g, ""), 10) -
      parseInt(b.employeeID.replace(/[^\d]/g, ""), 10),
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "employeeID" ? sortedInfo.order : null,
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
    title: withSortIcon("Employee Name", "employeeName", sortedInfo),
    dataIndex: "employeeName",
    key: "employeeName",
    align: "left",
    width: "140px",
    sorter: (a, b) => a.employeeName - b.employeeName,
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "employeeName" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (q) => <span className="font-medium">{q.toLocaleString()}</span>,
  },
  {
    title: withSortIcon("Department", "departmentName", sortedInfo),
    dataIndex: "departmentName",
    key: "departmentName",
    align: "left",
    width: "140px",
    sorter: (a, b) => a.departmentName - b.departmentName,
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "departmentName" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (q) => <span className="font-medium">{q.toLocaleString()}</span>,
  },
  {
    title: withSortIcon(
      "Request Date & Time",
      "requestDateTime",
      sortedInfo,
      "center",
    ),
    dataIndex: "requestDateTime",
    key: "requestDateTime",
    align: "center",
    width: "140px",
    sorter: (a, b) =>
      formatApiDateTime(a.requestDateTime).localeCompare(
        formatApiDateTime(b.requestDateTime),
      ),
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "requestDateTime" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (date, record) => (
      <span id={`cell-${record.key}-requestDateTime`} className="text-gray-600">
        {formatApiDateTime(date)}
      </span>
    ),
  },
  {
    // ADDED (2026-08-18): API_Changes/2026-08-18_hta_policy_breaches_type_and_instrument_columns.md -
    // instrumentName was already in every response, this screen just never
    // had a column for it (same shape as Admin's own Instrument column,
    // adminMain/reports/policyBreaches/utils.jsx).
    title: withSortIcon("Instrument", "instrumentName", sortedInfo),
    dataIndex: "instrumentName",
    key: "instrumentName",
    width: "180px",
    ellipsis: true,
    sorter: (a, b) =>
      (a.instrumentName || "").localeCompare(b.instrumentName || ""),
    sortOrder:
      sortedInfo?.columnKey === "instrumentName" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (name) => (
      <Tooltip title={name} placement="topLeft">
        <span
          className="font-medium"
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: "180px",
            display: "inline-block",
          }}
        >
          {name || "—"}
        </span>
      </Tooltip>
    ),
  },
  {
    title: withSortIcon("Quantity", "quantity", sortedInfo, "center"),
    dataIndex: "quantity",
    key: "quantity",
    align: "center",
    width: "140px",
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
    title: (
      <TypeColumnTitle
        state={htaPolicyBreachesReportSearch}
        setState={setHTAPolicyBreachesReportSearch}
      />
    ),
    dataIndex: "tradeType",
    key: "tradeType",
    width: "140px",
    filteredValue: htaPolicyBreachesReportSearch.type?.length
      ? htaPolicyBreachesReportSearch?.type
      : null,
    onFilter: () => true,
    render: (type) => <span>{type || "—"}</span>,
    onHeaderCell: () => ({
      style: {
        minWidth: "100px",
        maxWidth: "100px",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      },
    }),
    onCell: () => ({
      style: {
        minWidth: "100px",
        maxWidth: "100px",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      },
    }),
  },
  {
    title: withSortIcon("Policy Count", "policyCount", sortedInfo, "center"),
    dataIndex: "policyCount",
    key: "policyCount",
    align: "center",
    width: "140px",
    sorter: (a, b) => a.policyCount - b.policyCount,
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "policyCount" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text, record) => (
      <span
        className={`${style["cell-text"]} font-medium text-primary cursor-pointer`}
        onClick={() => onViewPolicyBreachDetails?.(record)}
      >
        {text}
      </span>
    ),
  },
];
