import ArrowUP from "../../../../assets/img/arrow-up-dark.png";
import ArrowDown from "../../../../assets/img/arrow-down-dark.png";
import DefaultColumArrow from "../../../../assets/img/default-colum-arrow.png";
import style from "./UserActivityReport.module.css";
import { Button } from "../../../../components";
import { formatApiDateTime, toYYMMDD } from "../../../../common/funtions/rejex";

/**
 * User Activity Report (Admin Reports).
 *
 * SRS: a single flat list of every employee's login sessions - Employee ID,
 * Employee Name, Login Date, IP Address, Login Time, Actions, Logout Time,
 * View Actions button - sorted Login Date descending, searchable by
 * Employee Name / IP Address / Login Date range.
 *
 * GetUserSessionWiseActivity (sp_GetUserSessionWiseActivity) is now
 * system-wide - see API_Changes/2026-08-25_user_activity_report_system_wide.md
 * (deployed). EmployeeID: 0 means "every employee"; EmployeeName is a
 * server-side LIKE search. Each row already carries its own
 * EmployeeID/EmployeeName, so this is one paginated call, same shape as
 * every other admin report list (GetAdminPolicyBreachesAPI etc.) - no more
 * client-side employee-search-then-fan-out merge.
 */

export const buildApiRequest = (searchState = {}) => ({
  EmployeeID: 0,
  EmployeeName: (searchState.employeeName || "").trim(),
  // context seeds ipAddress as 0, not "" - `|| ""` folds that back to "no filter"
  IPAddress: searchState.ipAddress || "",
  StartDate: searchState.startDate ? toYYMMDD(searchState.startDate) : "",
  EndDate: searchState.endDate ? toYYMMDD(searchState.endDate) : "",
  // (pageNumber - 1) * length on the backend - 0 (the search state's
  // initial value) resolves to page 1 the same as 1 would.
  PageNumber: Number(searchState.pageNumber) || 1,
  Length: Number(searchState.pageSize) || 10,
});

/**
 * ExportUserSessionWiseActivity request payload - same filters as
 * buildApiRequest above, minus PageNumber/Length (an export always returns
 * the full matching set in one file, no pagination).
 */
export const buildExportRequest = (searchState = {}) => ({
  EmployeeID: 0,
  EmployeeName: (searchState.employeeName || "").trim(),
  IPAddress: searchState.ipAddress || "",
  StartDate: searchState.startDate ? toYYMMDD(searchState.startDate) : "",
  EndDate: searchState.endDate ? toYYMMDD(searchState.endDate) : "",
});

/**
 * Splits a backend UTC date+time pair into separately-displayable local
 * date and time strings, plus a raw sortable key.
 *
 * The localisation must happen on the COMBINED value: formatApiDateTime
 * converts UTC -> the viewer's local timezone, and for a timestamp near
 * midnight that conversion can move the calendar date. Formatting the date
 * and the time independently would produce a mismatched pair (local time
 * from one day shown against the UTC date of another). So format once,
 * then split the already-localised "YYYY-MM-DD | hh:mm am" result.
 *
 * `sortKey` is deliberately the raw pre-localisation "yyyyMMddHHmmss"
 * string, not the localised display text - display text is 12-hour
 * "hh:mm am/pm", which does not sort correctly as a plain string (e.g.
 * "09:00 am" < "10:00 am" as digits, but "01:00 pm" < "09:00 am"
 * alphabetically). The raw digits sort correctly with a plain string
 * comparison and don't need re-parsing.
 *
 * @returns {{ date: string, time: string, sortKey: string }}
 */
const toLocalDateAndTime = (datePart, timePart) => {
  const combined = `${datePart || ""} ${timePart || ""}`.trim();
  const formatted = formatApiDateTime(combined);
  const sortKey = `${datePart || ""}${timePart || ""}`;

  if (!formatted || !formatted.includes(" | ")) {
    return { date: "—", time: "—", sortKey };
  }

  const [localDate, localTime] = formatted.split(" | ");
  return { date: localDate, time: localTime, sortKey };
};

/**
 * Maps GetUserSessionWiseActivity records into flat table rows. Each record
 * already carries its own EmployeeID/EmployeeName (the SRS list has these
 * as per-row columns, not a section header, since a system-wide query can
 * span many employees).
 */
export const mapListData = (res = []) => {
  const records = Array.isArray(res) ? res : res?.sessions || [];

  if (!records.length) return [];

  return records.map((item) => {
    const login = toLocalDateAndTime(item.loginDate, item.loginTime);
    const logout = toLocalDateAndTime(item.logoutDate, item.logoutTime);

    return {
      // Composite key: SessionID (PK_UserLoginHistoryID) should already be
      // globally unique, but namespacing by employee too costs nothing and
      // guards against a key collision silently dropping a row from the
      // table.
      key: `${item.employeeID}-${item.sessionID}`,
      sessionID: item.sessionID || "",
      employeeID: item.employeeID,
      employeeName: item.employeeName || "",
      ipAddress: item.ipAddress || "",
      loginDate: login.date,
      loginTime: login.time,
      loginSortKey: login.sortKey,
      logoutTime: logout.time,
      totalActions: item.totalActions || 0,
    };
  });
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

// ---------------------------------------------------------------------
// Columns - SRS list, exactly: Employee ID, Employee Name, Login Date,
// IP Address, Login Time, Actions, Logout Time, View Actions button.
// ---------------------------------------------------------------------

export const getSessionListColumns = ({ sortedInfo, onViewActions }) => [
  {
    title: withSortIcon("Employee ID", "employeeID", sortedInfo),
    dataIndex: "employeeID",
    key: "employeeID",
    width: 130,
    ellipsis: true,
    sorter: (a, b) => Number(a.employeeID) - Number(b.employeeID),
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "employeeID" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text) => <span className="font-medium">{text}</span>,
  },
  {
    title: withSortIcon("Employee Name", "employeeName", sortedInfo),
    dataIndex: "employeeName",
    key: "employeeName",
    width: 200,
    ellipsis: true,
    sorter: (a, b) => (a.employeeName || "").localeCompare(b.employeeName || ""),
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "employeeName" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text) => <span className="font-medium">{text}</span>,
  },
  {
    title: withSortIcon("Login Date", "loginDate", sortedInfo, "center"),
    dataIndex: "loginDate",
    key: "loginDate",
    align: "center",
    width: 150,
    ellipsis: true,
    sorter: (a, b) => (a.loginSortKey || "").localeCompare(b.loginSortKey || ""),
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "loginDate" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (date) => (
      <span className="text-gray-600" title={date}>
        {date}
      </span>
    ),
  },
  {
    title: withSortIcon("IP Address", "ipAddress", sortedInfo),
    dataIndex: "ipAddress",
    key: "ipAddress",
    width: 180,
    ellipsis: true,
    sorter: (a, b) => (a.ipAddress || "").localeCompare(b.ipAddress || ""),
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "ipAddress" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text) => <span className="font-medium">{text}</span>,
  },
  {
    title: withSortIcon("Login Time", "loginTime", sortedInfo, "center"),
    dataIndex: "loginTime",
    key: "loginTime",
    align: "center",
    width: 140,
    ellipsis: true,
    sorter: (a, b) => (a.loginSortKey || "").localeCompare(b.loginSortKey || ""),
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "loginTime" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (time) => (
      <span className="text-gray-600" title={time}>
        {time}
      </span>
    ),
  },
  {
    title: withSortIcon("Actions", "totalActions", sortedInfo, "center"),
    dataIndex: "totalActions",
    key: "totalActions",
    align: "center",
    width: 110,
    ellipsis: true,
    sorter: (a, b) => Number(a.totalActions || 0) - Number(b.totalActions || 0),
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "totalActions" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (q) => <span className="font-medium">{q}</span>,
  },
  {
    title: withSortIcon("Logout Time", "logoutTime", sortedInfo, "center"),
    dataIndex: "logoutTime",
    key: "logoutTime",
    align: "center",
    width: 140,
    ellipsis: true,
    sorter: (a, b) => (a.logoutTime || "").localeCompare(b.logoutTime || ""),
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "logoutTime" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (time) => (
      <span className="text-gray-600" title={time}>
        {time}
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
