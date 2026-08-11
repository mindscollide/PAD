import ArrowUP from "../../../../../assets/img/arrow-up-dark.png";
import ArrowDown from "../../../../../assets/img/arrow-down-dark.png";
import DefaultColumArrow from "../../../../../assets/img/default-colum-arrow.png";
import style from "./ViewDetails.module.css";
import { toYYMMDD, formatApiDateTime } from "../../../../../common/funtions/rejex";

/**
 * Utility: Build API request payload for GetAdminTATRequestApprovalDetailsAPI
 * per API_Changes/2026-08-11_admin_reports_all_apis.md (dates default to
 * last 6 months on the backend if omitted). No other filters are supported
 * server-side for this endpoint.
 *
 * @param {Object} searchState - Current search/filter state
 * @param {number|string} employeeID - the employee this drill-down is scoped to
 * @returns {Object} API-ready payload
 */
export const buildApiRequest = (searchState = {}, employeeID) => ({
  EmployeeID: employeeID,
  StartDate: searchState.startDate ? toYYMMDD(searchState.startDate) : "",
  EndDate: searchState.endDate ? toYYMMDD(searchState.endDate) : "",
  // (pageNumber - 1) * length on the backend - 0 (the search state's
  // initial value) resolves to page 1 the same as 1 would.
  PageNumber: Number(searchState.pageNumber) || 1,
  Length: Number(searchState.pageSize) || 10,
});

/**
 * Maps GetAdminTATRequestApprovalDetailsAPI records into a UI-friendly
 * format - one row per request. actionBy reflects whichever actor's
 * bundle was the last one modified on that workflow.
 *
 * @param {Object|Array} res - API response ({records, totalRecords}) or a bare array
 * @returns {Array} Mapped list
 */
export const mapListData = (res = []) => {
  const records = Array.isArray(res) ? res : res?.records || [];

  if (!records.length) return [];

  return records.map((item, index) => ({
    key: item.requestID ?? index,
    requestID: item.requestID,
    instrumentName: item.instrumentName || "—",
    initiatedAt:
      `${item?.initiatedDate || ""} ${item?.initiatedTime || ""}`.trim() || "—",
    type: item.tradeType || "-",
    quantity: item.quantity || 0,
    actionBy: item.actionBy || "—",
    actionAt: `${item?.actionDate || ""} ${item?.actionTime || ""}`.trim() || "—",
    tatHours: item.tatHours || 0,
    tatMinutes: item.tatMinutes || 0,
  }));
};

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

export const getBorderlessTableColumns = ({ sortedInfo }) => [
  {
    title: withSortIcon("Instrument", "instrumentName", sortedInfo),
    dataIndex: "instrumentName",
    key: "instrumentName",
    width: 200,
    ellipsis: true,
    sorter: (a, b) => (a.instrumentName || "").localeCompare(b.instrumentName || ""),
    sortOrder: sortedInfo?.columnKey === "instrumentName" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (name) => <span className="font-medium">{name}</span>,
  },
  {
    title: withSortIcon("Initiated At", "initiatedAt", sortedInfo, "center"),
    dataIndex: "initiatedAt",
    key: "initiatedAt",
    width: 180,
    align: "center",
    ellipsis: true,
    sorter: (a, b) => (a.initiatedAt || "").localeCompare(b.initiatedAt || ""),
    sortOrder: sortedInfo?.columnKey === "initiatedAt" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (v) => (
      <span className="text-gray-600" title={v}>
        {formatApiDateTime(v) || v}
      </span>
    ),
  },
  {
    title: "Type",
    dataIndex: "type",
    key: "type",
    width: 100,
    ellipsis: true,
    render: (type) => (
      <span className={type === "Buy" ? "text-green-600" : "text-red-600"}>{type}</span>
    ),
  },
  {
    title: withSortIcon("Quantity", "quantity", sortedInfo, "center"),
    dataIndex: "quantity",
    key: "quantity",
    align: "center",
    width: 140,
    ellipsis: true,
    sorter: (a, b) => Number(a.quantity || 0) - Number(b.quantity || 0),
    sortOrder: sortedInfo?.columnKey === "quantity" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (v) => <span className="font-medium">{Number(v).toLocaleString("en-US")}</span>,
  },
  {
    title: withSortIcon("Action By", "actionBy", sortedInfo),
    dataIndex: "actionBy",
    key: "actionBy",
    width: 180,
    ellipsis: true,
    sorter: (a, b) => (a.actionBy || "").localeCompare(b.actionBy || ""),
    sortOrder: sortedInfo?.columnKey === "actionBy" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (v) => <span className="font-medium">{v}</span>,
  },
  {
    title: withSortIcon("Action At", "actionAt", sortedInfo, "center"),
    dataIndex: "actionAt",
    key: "actionAt",
    width: 180,
    align: "center",
    ellipsis: true,
    sorter: (a, b) => (a.actionAt || "").localeCompare(b.actionAt || ""),
    sortOrder: sortedInfo?.columnKey === "actionAt" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (v) => (
      <span className="text-gray-600" title={v}>
        {formatApiDateTime(v) || v}
      </span>
    ),
  },
  {
    title: withSortIcon("TAT", "tatHours", sortedInfo, "center"),
    key: "tat",
    align: "center",
    width: 140,
    ellipsis: true,
    sorter: (a, b) =>
      Number(a.tatHours || 0) * 60 +
      Number(a.tatMinutes || 0) -
      (Number(b.tatHours || 0) * 60 + Number(b.tatMinutes || 0)),
    sortOrder: sortedInfo?.columnKey === "tatHours" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (_, record) => (
      <span className="font-medium">
        {record.tatHours}H, {record.tatMinutes}M
      </span>
    ),
  },
];
