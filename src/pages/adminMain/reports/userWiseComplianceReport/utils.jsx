import ArrowUP from "../../../../assets/img/arrow-up-dark.png";
import ArrowDown from "../../../../assets/img/arrow-down-dark.png";
import DefaultColumArrow from "../../../../assets/img/default-colum-arrow.png";
import style from "./UserWiseComplianceReport.module.css";
import { Button } from "../../../../components";

/**
 * Utility: Build API request payload for GetAdminUserWiseComplianceReportAPI
 * per API_Changes/2026-08-11_admin_reports_all_apis.md.
 *
 * @param {Object} searchState - Current search/filter state
 * @returns {Object} API-ready payload
 */
export const buildApiRequest = (searchState = {}) => ({
  EmployeeName: searchState.employeeName || "",
  DepartmentName: searchState.departmentName || "",
  // (pageNumber - 1) * length on the backend - 0 (the search state's
  // initial value) resolves to page 1 the same as 1 would, since the SP
  // floors a negative offset to 0.
  PageNumber: Number(searchState.pageNumber) || 1,
  Length: Number(searchState.pageSize) || 10,
});

/**
 * Maps GetAdminUserWiseComplianceReportAPI records into a UI-friendly
 * format. approvalScore/complianceScore can be null (employee has zero
 * Trade Requests / Transactions respectively) - rendered as "—".
 *
 * @param {Object|Array} res - API response ({records, totalRecords}) or a bare array
 * @returns {Array} Mapped list
 */
export const mapListData = (res = []) => {
  const records = Array.isArray(res) ? res : res?.records || [];

  if (!records.length) return [];

  return records.map((item) => ({
    key: item.employeeID,
    employeeID: item.employeeID,
    employeeName: item.employeeName || "",
    departmentName: item.departmentName || "",
    approvalScore: item.approvalScore,
    complianceScore: item.complianceScore,
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
  sortedInfo,
  setShowViewDetailOfUserwiseComplianceReportAdmin,
}) => [
  {
    title: withSortIcon("Employee ID", "employeeID", sortedInfo),
    dataIndex: "employeeID",
    key: "employeeID",
    width: "140px",
    ellipsis: true,
    sorter: (a, b) => Number(a.employeeID) - Number(b.employeeID),
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
    sorter: (a, b) => (a.employeeName || "").localeCompare(b.employeeName || ""),
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "employeeName" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text) => <span className="text-gray-600">{text}</span>,
  },
  {
    title: withSortIcon("Department", "departmentName", sortedInfo),
    dataIndex: "departmentName",
    key: "departmentName",
    width: "180px",
    ellipsis: true,
    sorter: (a, b) =>
      (a.departmentName || "").localeCompare(b.departmentName || ""),
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "departmentName" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text) => <span className="text-gray-600">{text}</span>,
  },
  {
    title: withSortIcon("Approval Score", "approvalScore", sortedInfo),
    dataIndex: "approvalScore",
    key: "approvalScore",
    ellipsis: true,
    width: "140px",
    sorter: (a, b) => (a.approvalScore ?? -1) - (b.approvalScore ?? -1),
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "approvalScore" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (score) => (
      <span className="text-gray-600">
        {score === null || score === undefined ? "—" : `${score}%`}
      </span>
    ),
  },
  {
    title: withSortIcon("Compliance Score", "complianceScore", sortedInfo),
    dataIndex: "complianceScore",
    key: "complianceScore",
    ellipsis: true,
    width: "140px",
    sorter: (a, b) => (a.complianceScore ?? -1) - (b.complianceScore ?? -1),
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "complianceScore" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (score) => (
      <span className="text-gray-600">
        {score === null || score === undefined ? "—" : `${score}%`}
      </span>
    ),
  },
  {
    title: "",
    key: "action",
    width: 150,
    align: "right", // 🔷 Align content to the right
    render: () => (
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
