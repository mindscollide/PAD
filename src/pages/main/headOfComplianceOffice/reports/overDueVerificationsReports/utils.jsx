import { Button } from "../../../../../components";

import ArrowUP from "../../../../../assets/img/arrow-up-dark.png";
import ArrowDown from "../../../../../assets/img/arrow-down-dark.png";
import EscaltedOn from "../../../../../assets/img/escalated.png";
import DefaultColumArrow from "../../../../../assets/img/default-colum-arrow.png";
import TypeColumnTitle from "../../../../../components/dropdowns/filters/typeColumnTitle";
import { Tag, Tooltip } from "antd";
import style from "./OverDueVerificationReports.module.css";

import {
  formatApiDateTime,
  toYYMMDD,
} from "../../../../../common/funtions/rejex";
import { mapBuySellToIds } from "../../../../../components/dropdowns/filters/utils";
import { getTradeTypeById } from "../../../../../common/funtions/type";
import { withSortIcon } from "../../../../../common/funtions/tableIcon";

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
    complianceOfficer: item?.complianceOfficer || "—",
    transactionDate:
      `${item?.transactionDate || ""} ${item?.transactionTime || ""}`.trim() ||
      "—",
    escalatedDate:
      `${item?.escalatedDate || ""} ${item?.escalatedTime || ""}`.trim() || "—",
    type: getTradeTypeById(assetTypeData, item?.tradeType) || "-",
    approvedQuantity: item.approvedQuantity || 0,
    shareTraded: item.shareTraded || 0,
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
  setViewDetailHeadOfComplianceEscalated,
  handleViewDetailsForReconcileTransaction,
}) => [
  {
    title: withSortIcon("Requester Name", "requesterName", sortedInfo),
    align: "left",
    dataIndex: "requesterName",
    key: "requesterName",
    width: 160,
    ellipsis: true,
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
    width: 100,
    key: "type",
    ellipsis: true,
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
    dataIndex: "complianceOfficer",
    key: "complianceOfficer",
    ellipsis: true,
    align: "left",
    width: 140,
    filteredValue: OverdueVerificationHCOReportSearch?.complianceOfficer?.length
      ? OverdueVerificationHCOReportSearch?.complianceOfficer
      : null,
    onFilter: () => true, // Actual filtering handled by API
    render: (complianceOfficer, record) => (
      <span
        id={`cell-${record.key}-complianceOfficer`}
        className={
          complianceOfficer === "Buy" ? "text-green-600" : "text-red-600"
        }
        data-testid={`trade-type-${complianceOfficer}`}
        style={{
          display: "inline-block",
          width: "100%",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {complianceOfficer}
      </span>
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
    dataIndex: "transactionDate",
    key: "transactionDate",
    align: "center",
    width: 150,
    ellipsis: true,
    sorter: (a, b) => {
      const dateA = new Date(`${a.transactionDate}`).getTime();
      const dateB = new Date(`${b.transactionDate}`).getTime();
      return dateA - dateB;
    },
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "transactionDate" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (transactionDate) => (
      <Tooltip title={formatApiDateTime(transactionDate) || "—"}>
        <span className="text-gray-600" title={transactionDate || "—"}>
          {formatApiDateTime(transactionDate) || "—"}
        </span>
      </Tooltip>
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
    ellipsis: true,
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
    ellipsis: true,
    sorter: (a, b) => a.shareTraded - b.shareTraded,
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "shareTraded" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (q) => <span className="font-medium">{q.toLocaleString()}</span>,
  },
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
    dataIndex: "escalatedDate",
    key: "escalatedDate",
    align: "center",
    width: 150,
    ellipsis: true,
    sorter: (a, b) => {
      const dateA = new Date(`${a.escalatedDate}`).getTime();
      const dateB = new Date(`${b.escalatedDate}`).getTime();
      return dateA - dateB;
    },
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "escalatedDate" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (_, record) => (
      <span className="text-gray-600">
        {formatApiDateTime(`${record.escalatedDate}`)}
      </span>
    ),
  },
  {
    title: "",
    key: "action",
    align: "center", // 🔷 Align content to the right
    width: 50,
    render: (_, record) => (
      <div className={style.viewEditClass}>
        <Button
          className="small-dark-button"
          text={"View Details"}
          onClick={() => {
            handleViewDetailsForReconcileTransaction(record?.workFlowID);
            console.log(record, "tradeApprovalID");
            // setIsViewComments(true);
            // setCheckTradeApprovalID(record?.approvalID);
            // setEditBrokerModal(true);
            // setEditModalData(record);
          }}
        />
      </div>
    ),
  },
];
