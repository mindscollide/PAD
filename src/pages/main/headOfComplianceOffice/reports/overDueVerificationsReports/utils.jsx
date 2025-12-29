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
  ApprovedQuantity: Number(searchState.approvedQuantity) || null,
  ShareTraded: Number(searchState.sharesTraded) || null,
  PageNumber: Number(searchState.pageNumber) || 0,
  Length: Number(searchState.pageSize) || 10,
  Type: searchState.type,
  StatusIds: [],
  EscalationFromDate: "",
  EscalationToDate: "",
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
  coOverdueVerificationListData = []
) => {
  const overdueVerifications = Array.isArray(coOverdueVerificationListData)
    ? coOverdueVerificationListData
    : coOverdueVerificationListData?.overdueVerifications || [];
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
  coOverdueVerificationReportSearch,
  setCoOverdueVerificationReportSearch,
  setViewDetailHeadOfComplianceEscalated,
  handleViewDetailsForReconcileTransaction,
}) => [
  {
    title: (
      <div style={{ marginLeft: "8px" }}>
        {withSortIcon("Requester Name", "requesterName", sortedInfo)}
      </div>
    ),
    dataIndex: "requesterName",
    key: "requesterName",
    align: "left",
    width: "180px",
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
    title: withSortIcon("Type", "tradeType", sortedInfo),
    dataIndex: "tradeType",
    key: "tradeType",
    ellipsis: true,
    width: "80px",
    filteredValue: coOverdueVerificationReportSearch.type?.length
      ? coOverdueVerificationReportSearch.type
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
    title: withSortIcon("Compliance Officer", "complianceOfficer", sortedInfo),
    dataIndex: "complianceOfficer",
    key: "complianceOfficer",
    ellipsis: true,
    width: "170px",
    filteredValue: coOverdueVerificationReportSearch.complianceOfficer?.length
      ? coOverdueVerificationReportSearch.complianceOfficer
      : null,
    onFilter: () => true, // Actual filtering handled by API
    render: (complianceOfficer, record) => (
      <span
        id={`cell-${record.key}-complianceOfficer`}
        className={complianceOfficer === "Buy" ? "text-green-600" : "text-red-600"}
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
    ellipsis: true,
    width: "160px",
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
      "Transaction Date & Time",
      "transactionDate",
      sortedInfo
    ),
    dataIndex: "transactionDate",
    key: "transactionDate",
    align: "left",
    width: "220px",
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
    render: (_, record) => (
      <span className="text-gray-600">
        {formatApiDateTime(`${record.transactionDate}`)}
      </span>
    ),
  },

  {
    title: withSortIcon("Approved Quantity", "approvedQuantity", sortedInfo),
    dataIndex: "approvedQuantity",
    width: "180px",
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
    title: withSortIcon("Shares Traded", "shareTraded", sortedInfo),
    dataIndex: "shareTraded",
    key: "shareTraded",
    width: "180px",
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
    align: "right",
    render: (_, record) => {
      return record.isEscalationOpen ? (
        <img src={EscaltedOn} width={"40px"} />
      ) : null;
    },
  },
  {
    title: "",
    key: "action",
    align: "right", // 🔷 Align content to the right
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
