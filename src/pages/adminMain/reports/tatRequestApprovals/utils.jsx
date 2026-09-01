import ArrowUP from "../../../../assets/img/arrow-up-dark.png";
import ArrowDown from "../../../../assets/img/arrow-down-dark.png";
import DefaultColumArrow from "../../../../assets/img/default-colum-arrow.png";
import style from "./AdminTATRequestApprovals.module.css";
import { Button } from "../../../../components";
import { toYYMMDD } from "../../../../common/funtions/rejex";

/**
 * Utility: Build API request payload for GetAdminTATRequestApprovalsAPI
 * per API_Changes/2026-08-11_admin_reports_all_apis.md (dates default to
 * last 6 months on the backend if omitted).
 *
 * @param {Object} searchState - Current search/filter state
 * @returns {Object} API-ready payload
 */
export const buildApiRequest = (searchState = {}) => ({
  EmployeeName: searchState.employeeName || "",
  DepartmentName: searchState.departmentName || "",
  // FIXED: was sending the picker's raw "YYYY-MM-DD" strings straight
  // through - every other Admin report converts to the undashed
  // "YYYYMMDD" digit format the API actually expects (toYYMMDD), so date
  // filtering here was never actually being applied server-side.
  StartDate: searchState.startDate ? toYYMMDD(searchState.startDate) : "",
  EndDate: searchState.endDate ? toYYMMDD(searchState.endDate) : "",
  // (pageNumber - 1) * length on the backend - 0 (the search state's
  // initial value) resolves to page 1 the same as 1 would.
  PageNumber: Number(searchState.pageNumber) || 1,
  Length: Number(searchState.pageSize) || 10,
});

/**
 * ExportAdminTATRequestApprovals request payload - same filters as
 * buildApiRequest above, minus PageNumber/Length (an export always
 * returns every matching row in one file), per
 * API_Changes/2026-08-28_admin_tat_request_approvals_export.md.
 */
export const buildExportRequest = (searchState = {}) => ({
  EmployeeName: searchState.employeeName || "",
  DepartmentName: searchState.departmentName || "",
  StartDate: searchState.startDate ? toYYMMDD(searchState.startDate) : "",
  EndDate: searchState.endDate ? toYYMMDD(searchState.endDate) : "",
});

/**
 * Maps GetAdminTATRequestApprovalsAPI records into a UI-friendly format.
 * avgHours/avgMinutes are returned as separate numbers, not a formatted
 * string.
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
    requestCount: item.requestCount || 0,
    avgHours: item.avgHours || 0,
    avgMinutes: item.avgMinutes || 0,
  }));
};

/**
 * Returns the appropriate sort icon based on current sort state
 */
const getSortIcon = (columnKey, sortedInfo) => {
  if (sortedInfo?.columnKey === columnKey) {
    return sortedInfo.order === "ascend" ? (
      <img draggable={false} src={ArrowDown} alt="Asc" className="custom-sort-icon" />
    ) : (
      <img draggable={false} src={ArrowUP} alt="Desc" className="custom-sort-icon" />
    );
  }
  return (
    <img draggable={false} src={DefaultColumArrow} alt="Default" className="custom-sort-icon" />
  );
};

// Helper for consistent column titles
const withSortIcon = (label, columnKey, sortedInfo, align = "left") => (
  <div
    className={style["table-header-wrapper"]}
    style={{
      justifyContent:
        align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start",
      textAlign: align,
    }}
  >
    <span className={style["table-header-text"]}>{label}</span>
    <span className={style["table-header-icon"]}>{getSortIcon(columnKey, sortedInfo)}</span>
  </div>
);

const numericSorter = (field) => (a, b) => Number(a[field] || 0) - Number(b[field] || 0);

export const getBorderlessTableColumns = ({
  sortedInfo,
  onViewDetails,
}) => [
  {
    title: withSortIcon("Employee ID", "employeeID", sortedInfo),
    dataIndex: "employeeID",
    key: "employeeID",
    width: "140px",
    ellipsis: true,
    sorter: numericSorter("employeeID"),
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
    ellipsis: true,
    width: "180px",
    sorter: (a, b) => (a.employeeName || "").localeCompare(b.employeeName || ""),
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "employeeName" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text) => <span className="font-medium">{text}</span>,
  },
  {
    title: withSortIcon("Department", "departmentName", sortedInfo),
    dataIndex: "departmentName",
    key: "departmentName",
    ellipsis: true,
    width: "180px",
    sorter: (a, b) => (a.departmentName || "").localeCompare(b.departmentName || ""),
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "departmentName" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text) => <span className="font-medium">{text}</span>,
  },
  {
    title: withSortIcon("Request Count", "requestCount", sortedInfo, "center"),
    dataIndex: "requestCount",
    key: "requestCount",
    align: "center",
    width: "160px",
    ellipsis: true,
    sorter: numericSorter("requestCount"),
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "requestCount" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (v) => <span className="font-medium">{v.toLocaleString()}</span>,
  },
  {
    // FIXED per SRS ("TAT Request Approvals" section): "Sorting on
    // Columns: Employee ID, Employee Name, Department Name, Request
    // Count" - Avg. Turnaround Time is deliberately not in that list, so
    // this column isn't sortable (was, before).
    title: "Avg. Turnaround Time",
    key: "avgTat",
    align: "center",
    width: "160px",
    ellipsis: true,
    render: (_, record) => (
      // FIXED: SRS format is "04 H, 32 M" (zero-padded, space before the
      // unit) - was rendering unpadded with no space (e.g. "4H, 5M").
      <span className="font-medium">
        {String(record.avgHours).padStart(2, "0")} H,{" "}
        {String(record.avgMinutes).padStart(2, "0")} M
      </span>
    ),
  },
  {
    title: "",
    key: "action",
    width: 150,
    align: "right",
    render: (_, record) => (
      <div
        className={style.viewEditClass}
        style={{ display: "flex", alignItems: "center", marginRight: "10px" }}
      >
        <Button
          className="view-large-transparent-button"
          text={"View Details"}
          onClick={() => onViewDetails?.(record)}
        />
      </div>
    ),
  },
];
