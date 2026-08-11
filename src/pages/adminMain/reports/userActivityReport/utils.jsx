import ArrowUP from "../../../../assets/img/arrow-up-dark.png";
import ArrowDown from "../../../../assets/img/arrow-down-dark.png";
import DefaultColumArrow from "../../../../assets/img/default-colum-arrow.png";
import style from "./UserActivityReport.module.css";
import { Button } from "../../../../components";
import { formatApiDateTime } from "../../../../common/funtions/rejex";

/**
 * User Activity Report (Admin Reports) - item 1 of
 * API_Changes/2026-08-11_admin_reports_all_apis.md ("already existed, no
 * change"). GetUserSessionWiseActivity is hard-scoped to a single
 * EmployeeID (sp_GetUserSessionWiseActivity: WHERE FK_UserID = p_UserID) -
 * there is no system-wide session list. This report is therefore a
 * two-step flow: search/pick an employee (reusing the same employee list
 * already used by Manage Users), then view that employee's sessions
 * (reusing the same GetUserSessionWiseActivity/ViewUserSessionWiseActivity
 * + View Actions modal Manage Users already uses).
 */

// ---------------------------------------------------------------------
// Step 1: Employee search (reuses GetAllEmployeesWithAssignedManageUsersUserTabPolicies)
// ---------------------------------------------------------------------

export const buildEmployeeSearchRequest = (searchState = {}) => ({
  EmployeeID: 0,
  EmployeeName: searchState.employeeName || "",
  EmailAddress: "",
  DepartmentName: searchState.departmentName || "",
  PageNumber: Number(searchState.pageNumber) || 1,
  Length: Number(searchState.pageSize) || 10,
});

export const mapEmployeeListData = (res = []) => {
  const records = Array.isArray(res) ? res : res?.employees || [];

  if (!records.length) return [];

  return records.map((item) => ({
    key: item.employeeID,
    employeeID: item.employeeID,
    employeeName: item.employeeName || "",
    departmentName: item.departmentName || "",
    emailAddress: item.emailAddress || "",
  }));
};

// ---------------------------------------------------------------------
// Step 2: Session list for the selected employee (GetUserSessionWiseActivity)
// ---------------------------------------------------------------------

export const buildSessionsRequest = (searchState = {}, employeeID) => ({
  EmployeeID: Number(employeeID) || 0,
  IPAddress: searchState.ipAddress || "",
  StartDate: searchState.startDate || "",
  EndDate: searchState.endDate || "",
  // GetUserSessionWiseActivity's PageNumber is a real 1-indexed page
  // number (backend fix 2026-08-05) - 0 (the search state's initial
  // value) still resolves to page 1.
  PageNumber: Number(searchState.pageNumber) || 1,
  Length: Number(searchState.pageSize) || 10,
});

export const mapSessionListData = (res = []) => {
  const records = Array.isArray(res) ? res : res?.sessions || [];

  if (!records.length) return [];

  return records.map((item) => ({
    key: item.sessionID,
    sessionID: item.sessionID || "",
    ipAddress: item.ipAddress || "",
    loginDateTime: `${item.loginDate || ""} ${item.loginTime || ""}`.trim() || "—",
    logoutDateTime: `${item.logoutDate || ""} ${item.logoutTime || ""}`.trim() || "—",
    totalActions: item.totalActions || 0,
  }));
};

// ---------------------------------------------------------------------
// Shared sort-icon helpers
// ---------------------------------------------------------------------

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

export const getEmployeeListColumns = ({ sortedInfo, onViewSessions }) => [
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
    render: (employeeID) => <span className="font-medium">{employeeID}</span>,
  },
  {
    title: withSortIcon("Employee Name", "employeeName", sortedInfo),
    dataIndex: "employeeName",
    key: "employeeName",
    ellipsis: true,
    width: "200px",
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
    width: "200px",
    sorter: (a, b) => (a.departmentName || "").localeCompare(b.departmentName || ""),
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "departmentName" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text) => <span className="font-medium">{text}</span>,
  },
  {
    title: "",
    key: "action",
    width: 180,
    align: "right",
    render: (_, record) => (
      <div style={{ display: "flex", alignItems: "center", marginRight: 10 }}>
        <Button
          className="view-large-transparent-button"
          text="View Sessions"
          onClick={() => onViewSessions?.(record)}
        />
      </div>
    ),
  },
];

export const getSessionListColumns = ({ sortedInfo, onViewActions }) => [
  {
    title: withSortIcon("IP Address", "ipAddress", sortedInfo),
    dataIndex: "ipAddress",
    key: "ipAddress",
    width: 260,
    ellipsis: true,
    sorter: (a, b) => (a.ipAddress || "").localeCompare(b.ipAddress || ""),
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "ipAddress" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text) => <span className="font-medium">{text}</span>,
  },
  {
    title: withSortIcon("Login Date & Time", "loginDateTime", sortedInfo, "center"),
    dataIndex: "loginDateTime",
    key: "loginDateTime",
    align: "center",
    ellipsis: true,
    sorter: (a, b) => (a.loginDateTime || "").localeCompare(b.loginDateTime || ""),
    sortOrder: sortedInfo?.columnKey === "loginDateTime" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (date) => (
      <span className="text-gray-600" title={date}>
        {formatApiDateTime(date) || "—"}
      </span>
    ),
  },
  {
    title: withSortIcon("Total Actions", "totalActions", sortedInfo, "center"),
    dataIndex: "totalActions",
    key: "totalActions",
    align: "center",
    width: 260,
    ellipsis: true,
    sorter: (a, b) => Number(a.totalActions || 0) - Number(b.totalActions || 0),
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "totalActions" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (q) => <span className="font-medium">{q}</span>,
  },
  {
    title: withSortIcon("Logout Date & Time", "logoutDateTime", sortedInfo, "center"),
    dataIndex: "logoutDateTime",
    key: "logoutDateTime",
    align: "center",
    ellipsis: true,
    sorter: (a, b) => (a.logoutDateTime || "").localeCompare(b.logoutDateTime || ""),
    sortOrder: sortedInfo?.columnKey === "logoutDateTime" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (date) => (
      <span className="text-gray-600" title={date}>
        {formatApiDateTime(date) || "—"}
      </span>
    ),
  },
  {
    title: "",
    key: "action",
    align: "right",
    render: (_, record) => (
      <div>
        <Button
          className="small-light-button"
          text="View Actions"
          onClick={() => onViewActions?.(record)}
        />
      </div>
    ),
  },
];
