import ArrowUP from "../../../../../../assets/img/arrow-up-dark.png";
import ArrowDown from "../../../../../../assets/img/arrow-down-dark.png";
import DefaultColumArrow from "../../../../../../assets/img/default-colum-arrow.png";
import style from "./ViewDetails.module.css";

import {
  formatApiDateTime,
  toYYMMDD,
} from "../../../../../../common/funtions/rejex";
import { getTradeTypeById } from "../../../../../../common/funtions/type";
import TypeColumnTitle from "../../../../../../components/dropdowns/filters/typeColumnTitle";
import { mapBuySellToIds } from "../../../../../../components/dropdowns/filters/utils";
import { Tooltip } from "antd";

/**
 * Utility: Build API request payload for approval listing
 *
 * @param {Object} searchState - Current search/filter state
 * @param {Object} assetTypeListingData - Extra request metadata (optional)
 * @returns {Object} API-ready payload
 */
export const buildApiRequest = (
  searchState = {},
  showSelectedTatDataOnViewDetailHTA,
  assetTypeListingData
) => ({
  EmployeeID: showSelectedTatDataOnViewDetailHTA?.employeeID || "",
  StartDate: searchState.startDate ? toYYMMDD(searchState.startDate) : "",
  EndDate: searchState.endDate ? toYYMMDD(searchState.endDate) : "",
  TAT: searchState?.tat || 0,
  Quantity: searchState?.quantity || 0,
  InstrumentName: searchState?.instrumentName || "",
  ActionBy: searchState?.actionBy || "",
  ActionStartDate: searchState.actionStartDate
    ? toYYMMDD(searchState.actionStartDate)
    : "",
  ActionEndDate: searchState.actionEndDate
    ? toYYMMDD(searchState.actionEndDate)
    : "",
  // ADDED (2026-08-19): the Type column filter already existed
  // (TypeColumnTitle below, wired to htaTATViewDetailsSearch.type) but
  // was never actually sent - selecting a type had no effect. Per
  // API_Changes/2026-08-19_hta_tat_viewdetails_actionby_actionat_tat.md.
  TypeIds:
    mapBuySellToIds?.(searchState.type, assetTypeListingData?.Equities) || [],
  PageNumber: Number(searchState.pageNumber) || 0,
  Length: Number(searchState.pageSize) || 10,
});
/**
 * Maps employee transaction data into a UI-friendly format
 *
 * @param {Object} getEmployeeTransactionReport - API response containing transactions
 * @returns {Array} Mapped transaction list
 */
export const mapListData = (assetTypeData, htaTATViewDetailsData = []) => {
  const workFlows = Array.isArray(htaTATViewDetailsData)
    ? htaTATViewDetailsData
    : htaTATViewDetailsData?.workFlows || [];

  if (!workFlows.length) return [];

  return workFlows.map((item) => {
    // FIXED (2026-08-19): actionBy/actionAt/Tat columns already existed
    // (getBorderlessTableColumns below) but this mapping never populated
    // any of the three fields they read - they rendered "—" for every
    // row regardless of what the API sent. Per
    // API_Changes/2026-08-19_hta_tat_viewdetails_actionby_actionat_tat.md:
    // actionBy is an array of every distinct actor - collapse to
    // "Multiple Approvers" with the full list on hover when more than
    // one, same "single name direct / collapsed + hover" convention
    // already used by the HOC Transaction Summary View Details screen
    // (headOfComplianceOffice/reports/transactionsSummary/utils.jsx).
    // actionDate/actionTime/tat are null while still Pending - render
    // blank/"—", not "0".
    const actionByNames = Array.isArray(item.actionBy)
      ? item.actionBy.map((user) => user?.fullName).filter(Boolean)
      : [];

    return {
      key: item.approvalID,

      approvalID: item.approvalID,
      title: item.title || "—",
      tradeApprovalID: item.tradeApprovalID || "—",
      instrument: item?.instrument?.instrumentShortCode ?? "—",
      instrumentName: item?.instrument?.instrumentName ?? "—",
      assetTypeName: item.assetType?.assetTypeName || "—",
      // ADDED: the Instrument column's own render already destructured an
      // assetCode variable for the "EQ" badge shown on the hta-escalated-
      // requests table, but nothing ever populated it here - the badge
      // silently never rendered.
      assetTypeShortCode: item.assetType?.assetTypeShortCode || "",
      type: getTradeTypeById(assetTypeData, item?.tradeType) || "—",
      approvalStatus: item.approvalStatus?.approvalStatusName || "—",
      employeeID: item.employeeID || "—",
      quantity: item.quantity ?? "—",
      requestDateTime:
        `${item?.requestDate || ""} ${item?.requestTime || ""}`.trim() || "—",
      // FIXED: "Initiated At" column (dataIndex initiatedAt) was never
      // populated either - same class of gap, just not called out in
      // the doc since it isn't one of the three named fields.
      initiatedAt:
        formatApiDateTime(`${item?.requestDate} ${item?.requestTime}`) || "—",
      deadlineDateTime:
        `${item?.deadlineDate || ""} ${item?.deadlineTime || ""}`.trim() ||
        "—",
      actionBy:
        actionByNames.length > 1 ? "Multiple Approvers" : actionByNames[0] || "—",
      actionByFullNames: actionByNames.join(", "),
      actionAt:
        item.actionDate && item.actionTime
          ? formatApiDateTime(`${item.actionDate} ${item.actionTime}`)
          : "—",
      Tat: typeof item.tat === "number" ? item.tat : "—",
    };
  });
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
  htaTATViewDetailsSearch,
  setHTATATViewDetailsSearch,
}) => [
  {
    title: withSortIcon("Instrument", "instrumentCode", sortedInfo),
    dataIndex: "instrumentCode",
    key: "instrumentCode",
    width: 150,
    ellipsis: true,
    sorter: (a, b) =>
      (a?.instrumentCode || "").localeCompare(b?.instrumentCode || ""),
    sortOrder:
      sortedInfo?.columnKey === "instrumentCode" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (_, record) => {
      const code = record?.instrument || "—";
      const name = record?.instrumentName || "—";
      const assetCode = record?.assetTypeShortCode || "";

      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          {/* ADDED: asset type badge (e.g. "EQ") - assetCode was already
          destructured above but never rendered, so it silently never
          showed. Same badge markup as the hta-escalated-requests table
          (escalatedApprovals/utill.jsx's renderInstrumentCell). */}
          <span
            className="custom-shortCode-asset"
            style={{
              minWidth: 32,
              flexShrink: 0,
            }}
          >
            {assetCode?.substring(0, 2).toUpperCase()}
          </span>
          <Tooltip title={`${name} - ${code}`} placement="topLeft">
            <span
              className="font-medium"
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: "200px",
                display: "inline-block",
                cursor: "pointer",
              }}
            >
              {code}
            </span>
          </Tooltip>
        </div>
      );
    },
  },
  {
    title: withSortIcon("Initiated At", "initiatedAt", sortedInfo, "center"),
    dataIndex: "initiatedAt",
    key: "initiatedAt",
    width: 100,
    align: "center",
    ellipsis: true,
    sortDirections: ["ascend", "descend"],
    showSorterTooltip: false,
    sorter: (a, b) => (a.initiatedAt || "").localeCompare(b.initiatedAt || ""),
    sortOrder:
      sortedInfo?.columnKey === "initiatedAt" ? sortedInfo.order : null,
    sortIcon: () => null,
    render: (value) => <span className="font-medium">{value || "—"}</span>,
  },
  {
    title: (
      <TypeColumnTitle
        state={htaTATViewDetailsSearch}
        setState={setHTATATViewDetailsSearch}
      />
    ),
    dataIndex: "type",
    key: "type",
    ellipsis: true,
    width: 140,
    filteredValue: htaTATViewDetailsSearch.type?.length
      ? htaTATViewDetailsSearch?.type
      : null,
    onFilter: () => true,
    sortIcon: () => null,
    showSorterTooltip: false,
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
    title: withSortIcon("Quantity", "quantity", sortedInfo, "center"),
    dataIndex: "quantity",
    key: "quantity",
    align: "center",
    width: 150,
    ellipsis: true,
    sortIcon: () => null,
    showSorterTooltip: false,
    sorter: (a, b) => Number(a.quantity) - Number(b.quantity),
    sortOrder: sortedInfo?.columnKey === "quantity" ? sortedInfo.order : null,
    render: (text) => (
      <span className="font-medium">
        {Number(text).toLocaleString("en-US")}
      </span>
    ),
  },
  {
    title: withSortIcon("Action By", "actionBy", sortedInfo, "center"),
    dataIndex: "actionBy",
    key: "actionBy",
    align: "center",
    width: "140px",
    sortIcon: () => null,
    ellipsis: true,
    showSorterTooltip: false,
    sorter: (a, b) => (a.actionBy || "").localeCompare(b.actionBy || ""),
    sortOrder: sortedInfo?.columnKey === "actionBy" ? sortedInfo.order : null,
    // actionBy shows a single name directly, or "Multiple Approvers" when
    // more than one person acted on this workflow - hover reveals the
    // full comma-separated name list either way, same convention as the
    // HOC Transaction Summary View Details screen's own Action By column.
    render: (value, record) => (
      <Tooltip title={record?.actionByFullNames || value} placement="topLeft">
        <span className="font-medium">{value || "—"}</span>
      </Tooltip>
    ),
  },
  {
    title: withSortIcon("Action At", "actionAt", sortedInfo, "center"),
    dataIndex: "actionAt",
    key: "actionAt",
    align: "center",
    width: "140px",
    ellipsis: true,
    showSorterTooltip: false,
    sortIcon: () => null,
    sorter: (a, b) => (a.actionAt || "").localeCompare(b.actionAt || ""),
    sortOrder: sortedInfo?.columnKey === "actionAt" ? sortedInfo.order : null,
    render: (value) => <span className="font-medium">{value || "—"}</span>,
  },
  {
    title: withSortIcon("TAT", "Tat", sortedInfo, "center"),
    align: "center",
    dataIndex: "Tat",
    key: "Tat",
    width: "140px",
    ellipsis: true,
    showSorterTooltip: false,
    sorter: (a, b) =>
      (typeof a.Tat === "number" ? a.Tat : 0) -
      (typeof b.Tat === "number" ? b.Tat : 0),
    sortIcon: () => null,
    sortOrder: sortedInfo?.columnKey === "Tat" ? sortedInfo.order : null,
    // FIXED: `value || "—"` treated a genuine 0-day TAT (same-day
    // turnaround, a real and common value here) as falsy and rendered
    // "—" instead of "0" - only render the "—" fallback when the value
    // is actually missing (still Pending, per the API_Changes doc).
    render: (value) => (
      <span className="font-medium">
        {typeof value === "number" ? value : "—"}
      </span>
    ),
  },
];
