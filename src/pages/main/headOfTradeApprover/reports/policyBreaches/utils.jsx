import ArrowUP from "../../../../../assets/img/arrow-up-dark.png";
import ArrowDown from "../../../../../assets/img/arrow-down-dark.png";
import DefaultColumArrow from "../../../../../assets/img/default-colum-arrow.png";
import style from "./HTAPolicyBreaches.module.css";

import {
  formatApiDateTime,
  toYYMMDD,
} from "../../../../../common/funtions/rejex";
import { getTradeTypeById } from "../../../../../common/funtions/type";
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
  myTradeApprovalLineManagerData = []
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
    type: getTradeTypeById(assetTypeData, item?.tradeType) || "-",
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
  setSelectedEmployee,
  setPolicyModalVisible,
}) => [
  {
    title: withSortIcon("Employee ID", "employeeID", sortedInfo),
    dataIndex: "employeeID",
    key: "employeeID",
    align: "left",
    width: "140px",
    ellipsis: true,
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
    ellipsis: true,
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
    ellipsis: true,
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
      "center"
    ),
    dataIndex: "requestDateTime",
    key: "requestDateTime",
    align: "center",
    width: "140px",
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
    render: (date, record) => (
      <span id={`cell-${record.key}-requestDateTime`} className="text-gray-600">
        {formatApiDateTime(date)}
      </span>
    ),
  },
  {
    title: withSortIcon("Quantity", "quantity", sortedInfo, "center"),
    dataIndex: "quantity",
    key: "quantity",
    align: "center",
    width: "140px",
    ellipsis: true,
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
    align: "center",
    dataIndex: "type",
    key: "type",
    ellipsis: true,
    width: "140px",
    filteredValue: htaPolicyBreachesReportSearch.type?.length
      ? htaPolicyBreachesReportSearch?.type
      : null,
    onFilter: () => true,
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
    title: withSortIcon("Policy Count", "policyCount", sortedInfo, "center"),
    dataIndex: "policyCount",
    key: "policyCount",
    align: "center",
    width: "140px",
    ellipsis: true,
    sorter: (a, b) => a.policyCount - b.policyCount,
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "policyCount" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text, record) => (
      <span
        className={`${style["cell-text"]} font-medium cursor-pointer text-primary`}
        onClick={() => {
          setSelectedEmployee(record);
          setPolicyModalVisible(true);
        }}
      >
        {text}
      </span>
    ),
  },
];
