import ArrowUP from "../../../../assets/img/arrow-up-dark.png";
import ArrowDown from "../../../../assets/img/arrow-down-dark.png";
import DefaultColumArrow from "../../../../assets/img/default-colum-arrow.png";
import style from "./UserWiseComplianceReport.module.css";

import { formatApiDateTime, toYYMMDD } from "../../../../common/funtions/rejex";
import { getTradeTypeById } from "../../../../common/funtions/type";
import { mapBuySellToIds } from "../../../../components/dropdowns/filters/utils";
import TypeColumnTitle from "../../../../components/dropdowns/filters/typeColumnTitle";
import { Button } from "../../../../components";

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
      <img
        draggable={false}
        src={ArrowDown}
        alt="Asc"
        className="custom-sort-icon"
      />
    ) : (
      <img
        draggable={false}
        src={ArrowUP}
        alt="Desc"
        className="custom-sort-icon"
      />
    );
  }
  return (
    <img
      draggable={false}
      src={DefaultColumArrow}
      alt="Default"
      className="custom-sort-icon"
    />
  );
};

// Helper for consistent column titles
const withSortIcon = (label, columnKey, sortedInfo) => (
  <div className={style["table-header-wrapper"]}>
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
  setShowViewDetailOfUserwiseComplianceReportAdmin,
}) => [
  {
    title: withSortIcon("Employee ID", "employeeID", sortedInfo),
    dataIndex: "employeeID",
    key: "employeeID",
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
    ellipsis: true,
    width: "140px",
    sorter: (a, b) => a.employeeName - b.employeeName,
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "employeeName" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text) => (
      <span id={`cell-${text.key}-text`} className="text-gray-600">
        {text}
      </span>
    ),
  },
  {
    title: withSortIcon("Department", "department", sortedInfo),
    dataIndex: "department",
    key: "department",
    width: "180px",
    ellipsis: true,
    sorter: (a, b) =>
      formatApiDateTime(a.department).localeCompare(
        formatApiDateTime(b.department)
      ),
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "department" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text) => (
      <span id={`cell-${text.key}-text`} className="text-gray-600">
        {text}
      </span>
    ),
  },
  {
    title: withSortIcon("Approval Score", "approvalScore", sortedInfo),
    dataIndex: "approvalScore",
    key: "approvalScore",
    ellipsis: true,
    width: "140px",
    sorter: (a, b) => a.approvalScore - b.approvalScore,
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "approvalScore" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text) => (
      <span id={`cell-${text.key}-text`} className="text-gray-600">
        {text}
      </span>
    ),
  },
  {
    title: withSortIcon("Compliance Score", "complianceScore", sortedInfo),
    dataIndex: "complianceScore",
    key: "complianceScore",
    ellipsis: true,
    width: "140px",
    sorter: (a, b) => a.complianceScore - b.complianceScore,
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "complianceScore" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text) => (
      <span id={`cell-${text.key}-text`} className="text-gray-600">
        {text}
      </span>
    ),
  },
  {
    title: "",
    key: "action",
    width: 150,
    align: "right", // 🔷 Align content to the right
    render: (_, record) => (
      <div
        className={style.viewEditClass}
        style={{
          display: "flex",
          alignItems: "center",
          marginRight: "10px",
        }}
      >
        <Button
          className="view-large-transparent-button"
          text={"View Details"}
          onClick={() => setShowViewDetailOfUserwiseComplianceReportAdmin(true)}
        />
      </div>
    ),
  },
];
