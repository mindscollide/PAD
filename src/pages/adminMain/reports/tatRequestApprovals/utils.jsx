import ArrowUP from "../../../../assets/img/arrow-up-dark.png";
import ArrowDown from "../../../../assets/img/arrow-down-dark.png";
import DefaultColumArrow from "../../../../assets/img/default-colum-arrow.png";
import style from "./AdminTATRequestApprovals.module.css";
import { Button } from "../../../../components";

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
  StartDate: searchState.startDate || "",
  EndDate: searchState.endDate || "",
  // (pageNumber - 1) * length on the backend - 0 (the search state's
  // initial value) resolves to page 1 the same as 1 would.
  PageNumber: Number(searchState.pageNumber) || 1,
  Length: Number(searchState.pageSize) || 10,
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
    title: withSortIcon("Avg TAT", "avgHours", sortedInfo, "center"),
    key: "avgTat",
    align: "center",
    width: "160px",
    ellipsis: true,
    sorter: (a, b) =>
      (Number(a.avgHours || 0) * 60 + Number(a.avgMinutes || 0)) -
      (Number(b.avgHours || 0) * 60 + Number(b.avgMinutes || 0)),
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "avgHours" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (_, record) => (
      <span className="font-medium">
        {record.avgHours}H, {record.avgMinutes}M
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
