import { Button } from "../../../../../components";
import EscaltedOn from "../../../../../assets/img/escalated.png";
import TypeColumnTitle from "../../../../../components/dropdowns/filters/typeColumnTitle";
import StatusColumnTitle from "../../../../../components/dropdowns/filters/statusColumnTitle";
import { Tag, Tooltip } from "antd";
import style from "./OverDueVerificationReports.module.css";

import {
  formatShowOnlyDate,
  toYYMMDD,
} from "../../../../../common/funtions/rejex";
import {
  mapBuySellToIds,
  mapStatusToIds,
} from "../../../../../components/dropdowns/filters/utils";
import { getTradeTypeById } from "../../../../../common/funtions/type";
import { withSortIcon } from "../../../../../common/funtions/tableIcon";
import { useGlobalModal } from "../../../../../context/GlobalModalContext";
import { useReconcileContext } from "../../../../../context/reconsileContax";

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
  Type: mapBuySellToIds(searchState.type, assetTypeListingData?.Equities),
  // Bundle-level status scheme (Pending/Compliant/Non-Compliant/Upcoming),
  // same as co-reconcile-transactions - not the workflow-level scheme
  StatusIds: mapStatusToIds(searchState.status, 1),
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

  if (!overdueVerifications.length) return [];

  return overdueVerifications.map((item) => ({
    key: item.workFlowID,
    workFlowID: item.workFlowID,
    requesterName: item.requesterName || "—",
    title: item.title || "",
    instrumentShortCode: item?.instrumentShortCode || "—",
    instrumentName: item?.instrumentName || "—",
    assetTypeShortCode: item?.assetTypeShortCode || "—",
    // Backend sends TransactionDate as a date-only "yyyyMMdd" string - there is
    // no separate TransactionTime field on this endpoint's response.
    transactionDate:
      [item?.transactionDate, item?.transactionTime]
        .filter(Boolean)
        .join(" ") || "—",
    // ✅ use typeName straight from the API response
    type:
      item?.tradeType?.typeName ||
      getTradeTypeById(assetTypeData, item?.tradeType) ||
      "-",
    approvedQuantity: item.approvedQuantity || 0,
    shareTraded: item.shareTraded || 0,
    status: item?.approvalStatus?.approvalStatusName || "—",
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
  approvalStatusMap = {},
  coOverdueVerificationReportSearch,
  setCoOverdueVerificationReportSearch,
  setViewDetailOverdueTransaction,
  handleViewDetailsForReconcileTransaction,
}) => [
  {
    title: withSortIcon("Requester Name", "requesterName", sortedInfo),
    dataIndex: "requesterName",
    key: "requesterName",
    align: "left",
    width: 200,
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
    title: (
      <TypeColumnTitle
        state={coOverdueVerificationReportSearch}
        setState={setCoOverdueVerificationReportSearch}
      />
    ),
    dataIndex: "type",
    width: 100,
    key: "type",
    filteredValue: coOverdueVerificationReportSearch.type?.length
      ? coOverdueVerificationReportSearch.type
      : null,
    onFilter: () => true, // Actual filtering handled by API
    render: (tradeType, record) => (
      <span
        id={`cell-${record.key}-type`}
        className={tradeType === "Buy" ? "text-green-600" : "text-red-600"}
        data-testid={`trade-type-${tradeType}`}
        style={{
          display: "inline-block",
          width: "100%",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {tradeType}
      </span>
    ),
  },
  {
    title: withSortIcon("Instrument", "instrumentName", sortedInfo),
    dataIndex: "instrumentName",
    key: "instrumentName",
    align: "left",
    ellipsis: true,
    width: 150,
    sorter: (a, b) =>
      (a?.instrumentShortCode || "").localeCompare(
        b?.instrumentShortCode || ""
      ),

    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "instrumentName" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (instrument, record) => {
      const assetCode = record?.assetTypeShortCode;
      const code = record?.instrumentShortCode || "";
      const name = record?.instrumentName || "";

      return (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span className="custom-shortCode-asset" style={{ minWidth: 30 }}>
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
    // transactionDate is a zero-padded "yyyyMMdd" string - new Date(...) can't
    // parse that format (returns Invalid Date/NaN for every row, so sorting had
    // no effect); a plain string compare sorts it correctly since it's fixed-width.
    sorter: (a, b) =>
      (a.transactionDate || "").localeCompare(b.transactionDate || ""),
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "transactionDate" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (_, record) => (
      <span className="text-gray-600">
        {formatShowOnlyDate(record.transactionDate)}
      </span>
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
    key: "approvedQuantity",
    align: "center",
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
    width: 200,
    align: "center",
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
    width: 100,
    render: (_, record) => {
      return record.isEscalationOpen ? (
        <img src={EscaltedOn} width={"40px"} />
      ) : null;
    },
  },
  {
    title: "",
    key: "action",
    width: 150,
    align: "center", // 🔷 Align content to the right
    render: (_, record) => {
      const { setViewDetailOverdueTransaction } = useGlobalModal();
      const { setSelectedOverdueTransactionData } = useReconcileContext();
      return (
        <Button
          className="small-dark-button"
          text={"View Details"}
          onClick={() => {
            setSelectedOverdueTransactionData(record);
            setViewDetailOverdueTransaction(true);
            handleViewDetailsForReconcileTransaction(record?.workFlowID);
            console.log(record, "tradeApprovalID");
            // setIsViewComments(true);
            // setCheckTradeApprovalID(record?.approvalID);
            // setEditBrokerModal(true);
            // setEditModalData(record);
          }}
        />
      );
    },
  },
];
