import { Button } from "../../../../../components";

import EscaltedOn from "../../../../../assets/img/escalated.png";
import TypeColumnTitle from "../../../../../components/dropdowns/filters/typeColumnTitle";
import { Tooltip } from "antd";
import style from "./OverDueVerificationReports.module.css";

import {
  formatApiDateTime,
  toYYMMDD,
} from "../../../../../common/funtions/rejex";
import { mapBuySellToIds } from "../../../../../components/dropdowns/filters/utils";
import { getTradeTypeById } from "../../../../../common/funtions/type";
import { withSortIcon } from "../../../../../common/funtions/tableIcon";

// BE_API_Changes/2026-08-24_overdue_verifications_keeps_resolved_records.md:
// this report used to only ever show WorkFlowStatusID 1 (Pending) - resolved
// rows (8/Compliant, 9/Non-Compliant) were excluded server-side, so a status
// column was never worth showing. Now that resolved rows stay listed with
// their real status, this maps the numeric ID sp_HOCOverdueVerificationsReport
// returns (`WorkFlowStatusID` - it doesn't also return a label string, unlike
// the CO sibling report) to the same label vocabulary used everywhere else in
// the app (getStatusStyle in ViewDetailHeadOfComplianceReconcileTransaction.jsx).
const OVERDUE_WORKFLOW_STATUS_LABELS = {
  1: "Pending",
  2: "Resubmitted",
  3: "Approved",
  4: "Declined",
  5: "Traded",
  6: "Not Traded",
  8: "Compliant",
  9: "Non-Compliant",
};

/**
 * Utility: Build API request payload for approval listing
 *
 * @param {Object} searchState - Current search/filter state
 * @param {Object} assetTypeListingData - Extra request metadata (optional)
 * @returns {Object} API-ready payload
 */
export const buildApiRequest = (searchState = {}, assetTypeListingData) => ({
  InstrumentName: searchState.instrumentName || "",
  RequesterName: searchState.requesterName || "",
  ComplianceOfficerName: searchState.complianceOfficerName || "",
  ApprovedQuantity: Number(searchState.approvedQuantity) || null,
  ShareTraded: Number(searchState.sharesTraded) || null,
  PageNumber: Number(searchState.pageNumber) || 0,
  Length: Number(searchState.pageSize) || 10,
  TypeIds:
    mapBuySellToIds?.(searchState.type, assetTypeListingData?.Equities) || [],
  EscalationFromDate: searchState.fromDate
    ? toYYMMDD(searchState.fromDate)
    : "",
  EscalationToDate: searchState.toDate ? toYYMMDD(searchState.toDate) : "",
  FromDate: searchState.startDate ? toYYMMDD(searchState.startDate) : "",
  ToDate: searchState.endDate ? toYYMMDD(searchState.endDate) : "",
});

/**
 * Maps employee transaction data into a UI-friendly format
 *
 * @param {Object} getEmployeeTransactionReport - API response containing transactions
 * @returns {Array} Mapped transaction list
 */
export const mappingDateWiseTransactionReport = (
  assetTypeData,
  overdueVerificationHCOListData = []
) => {
  const overdueVerifications = Array.isArray(overdueVerificationHCOListData)
    ? overdueVerificationHCOListData
    : overdueVerificationHCOListData?.overdueVerifications || [];
  console.log(overdueVerifications, "overdueVerifications");
  if (!overdueVerifications.length) return [];

  return overdueVerifications.map((item) => ({
    key: item.workFlowID,
    workFlowID: item.workFlowID,
    requesterName: item.requesterName || "—",
    title: item.title || "",
    instrumentShortCode: item?.instrumentShortCode || "—",
    instrumentName: item?.instrumentName || "—",
    assetTypeShortCode: item?.assetTypeShortCode || "—",
    complianceOfficer: item?.complianceOfficerName || "—",
    transactionDate:
      `${item?.transactionDate || ""} ${item?.transactionTime || ""}`.trim() ||
      "—",
    escalatedDate:
      `${item?.escalatedOnDate || ""} ${item?.escalatedOnTime || ""}`.trim() ||
      "—",
    type: getTradeTypeById(assetTypeData, item?.tradeType) || "-",
    approvedQuantity: item.approvedQuantity || 0,
    shareTraded: item.shareTraded || 0,
    status:
      OVERDUE_WORKFLOW_STATUS_LABELS[Number(item?.workFlowStatusID)] || "—",
    timeRemainingToTrade: item.timeRemainingToTrade || "",
    tradeType: item.tradeType || "",
    assetType: item.assetType?.assetTypeName || "",
    assetTypeID: item.assetType?.assetTypeID || 0,
    isEscalationOpen: item.isEscalationOpen || false,
  }));
};

const withFilterHeader = (FilterComponent) => (
  <div
    className={style["table-header-wrapper"]}
    style={{
      display: "flex",
      alignItems: "center",
      minHeight: "32px",
      width: "100%",
    }}
  >
    <FilterComponent />
  </div>
);
export const getBorderlessTableColumns = ({
  sortedInfo,
  OverdueVerificationHCOReportSearch,
  setOverdueVerificationHCOReportSearch,
  handleViewDetailHeadOfComplianceOverdueCompliance,
}) => [
  {
    title: withSortIcon("Requester Name", "requesterName", sortedInfo),
    align: "left",
    dataIndex: "requesterName",
    key: "requesterName",
    width: 160,
    sorter: (a, b) => a.requesterName.localeCompare(b.requesterName),
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "requesterName" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text) => (
      <span className={`${style["cell-text"]} font-medium`}>{text}</span>
    ),
  },
  {
    title: withFilterHeader(() => (
      <TypeColumnTitle
        state={OverdueVerificationHCOReportSearch}
        setState={setOverdueVerificationHCOReportSearch}
      />
    )),
    dataIndex: "type",
    width: 90,
    key: "type",
    filteredValue: OverdueVerificationHCOReportSearch.type?.length
      ? OverdueVerificationHCOReportSearch.type
      : null,
    onFilter: () => true, // Actual filtering handled by API
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
    title: withSortIcon("Officer Name", "complianceOfficer", sortedInfo),
    align: "left",
    dataIndex: "complianceOfficer",
    key: "complianceOfficer",
    width: 130,
    ellipses: true,
    sorter: (a, b) => a.complianceOfficer.localeCompare(b.complianceOfficer),
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "complianceOfficer" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text) => (
      <span className={`${style["cell-text"]} font-medium`}>{text}</span>
    ),
  },
  {
    title: withSortIcon("Instrument", "instrumentName", sortedInfo),
    dataIndex: "instrumentName",
    key: "instrumentName",
    align: "left",
    ellipsis: true,
    width: 120,
    sorter: (a, b) => {
      const nameA = a?.instrumentShortCode || "";
      const nameB = b?.instrumentShortCode || "";
      return nameA.localeCompare(nameB);
    },
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "instrumentName" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (instrument, record) => {
      const assetCode = record?.assetTypeShortCode;
      const code = record?.instrumentShortCode || "";
      const instrumentName = record?.instrumentName || "";

      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <span className="custom-shortCode-asset" style={{ minWidth: 30 }}>
            {assetCode?.substring(0, 2).toUpperCase()}
          </span>
          <Tooltip title={instrumentName} placement="topLeft">
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
              title={code}
            >
              {code}
            </span>
          </Tooltip>
        </div>
      );
    },
  },
  {
    title: withSortIcon(
      "Transaction Date",
      "transactionDate",
      sortedInfo,
      "center"
    ),
    align: "center",
    dataIndex: "transactionDate",
    key: "transactionDate",
    width: 150,
    sorter: (a, b) =>
      (a?.transactionDate || "").localeCompare(b?.transactionDate || ""),
    sortOrder:
      sortedInfo?.columnKey === "transactionDate" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (date) => (
      <span className="text-gray-600">{formatApiDateTime(date) || "—"}</span>
    ),
  },
  {
    title: withSortIcon(
      "Approved Quantity",
      "approvedQuantity",
      sortedInfo,
      "center"
    ),
    dataIndex: "approvedQuantity",
    width: 180,
    align: "center",
    key: "approvedQuantity",
    sorter: (a, b) => a.approvedQuantity - b.approvedQuantity,
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "approvedQuantity" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (q) => <span className="font-medium">{q.toLocaleString()}</span>,
  },
  {
    title: withSortIcon("Shares Traded", "shareTraded", sortedInfo, "center"),
    dataIndex: "shareTraded",
    key: "shareTraded",
    align: "center",
    width: 150,
    sorter: (a, b) => a.shareTraded - b.shareTraded,
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "shareTraded" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (q) => <span className="font-medium">{q.toLocaleString()}</span>,
  },
  // {
  //   // ADDED per BE_API_Changes/2026-08-24_overdue_verifications_keeps_
  //   // resolved_records.md: resolved rows (Compliant/Non-Compliant) now stay
  //   // in this report instead of being excluded - the status genuinely
  //   // varies per row now, so it needs a visible column rendering all three
  //   // states, not just an implicit "always Pending" assumption.
  //   title: withSortIcon("Status", "status", sortedInfo, "center"),
  //   align: "center",
  //   dataIndex: "status",
  //   key: "status",
  //   width: 160,
  //   sorter: (a, b) => (a?.status || "").localeCompare(b?.status || ""),
  //   sortDirections: ["ascend", "descend"],
  //   sortOrder: sortedInfo?.columnKey === "status" ? sortedInfo.order : null,
  //   showSorterTooltip: false,
  //   sortIcon: () => null,
  //   render: (status) => {
  //     const tag = approvalStatusMap?.[status] || {};
  //     return (
  //       <Tag
  //         style={{
  //           backgroundColor: tag.backgroundColor,
  //           color: tag.textColor,
  //           whiteSpace: "nowrap",
  //           overflow: "hidden",
  //           textOverflow: "ellipsis",
  //           display: "inline-block",
  //         }}
  //         className="border-less-table-orange-status"
  //       >
  //         {tag.label || status || "—"}
  //       </Tag>
  //     );
  //   },
  // },
  {
    title: "",
    key: "isEscalationOpen",
    dataIndex: "isEscalationOpen",
    align: "center",
    width: 20,
    render: (_, record) => {
      return record.isEscalationOpen ? (
        <img src={EscaltedOn} width={"40px"} />
      ) : null;
    },
  },
  {
    title: withSortIcon(
      "Escalated Date",
      "escalatedDate",
      sortedInfo,
      "center"
    ),
    align: "center",
    dataIndex: "escalatedDate",
    key: "escalatedDate",
    width: 150,
    sorter: (a, b) =>
      (a?.escalatedDate || "").localeCompare(b?.escalatedDate || ""),
    sortOrder:
      sortedInfo?.columnKey === "escalatedDate" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (date) => (
      <span className="text-gray-600" title={date || "—"}>
        {formatApiDateTime(date) || "—"}
      </span>
    ),
  },
  {
    title: "",
    key: "action",
    align: "right", // 🔷 Align content to the right
    width: 50,
    render: (_, record) => (
      <div className={style.viewEditClass}>
        <Button
          className="small-dark-button"
          text={"View Details"}
          onClick={() => {
            handleViewDetailHeadOfComplianceOverdueCompliance(record);
          }}
        />
      </div>
    ),
  },
];
