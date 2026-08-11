import { Button } from "../../../../components";

import TypeColumnTitle from "../../../../components/dropdowns/filters/typeColumnTitle";
import StatusColumnTitle from "../../../../components/dropdowns/filters/statusColumnTitle";
import { Tag, Tooltip } from "antd";
import EscalatedIcon from "../../../../assets/img/escalated.png";

import {
  dashBetweenApprovalAssets,
  formatApiDateTime,
  toYYMMDD,
} from "../../../../common/funtions/rejex";
import { useGlobalModal } from "../../../../context/GlobalModalContext";
import {
  mapBuySellToIds,
  mapStatusToIds,
} from "../../../../components/dropdowns/filters/utils";
import { getTradeTypeById } from "../../../../common/funtions/type";
import { withSortIcon } from "../../../../common/funtions/tableIcon";

/**
 * Utility: Build API request payload for approval listing
 *
 * @param {Object} searchState - Current search/filter state
 * @param {Object} assetTypeListingData - Extra request metadata (optional)
 * @returns {Object} API-ready payload
 */
export const buildApiRequest = (searchState = {}, assetTypeListingData) => ({
  InstrumentName: searchState.instrumentName || "",
  Quantity: searchState.quantity ? Number(searchState.quantity) : 0,
  BrokerIDs: searchState.brokerIDs || [],

  StartDate: searchState.startDate ? toYYMMDD(searchState.startDate) : "",
  EndDate: searchState.endDate ? toYYMMDD(searchState.endDate) : "",
  StatusIds: mapStatusToIds?.(searchState.status, 2) || [],
  TypeIds:
    mapBuySellToIds?.(searchState.type, assetTypeListingData?.Equities) || [],
  PageNumber: Number(searchState.pageNumber) || 0,
  Length: Number(searchState.pageSize) || 10,
});

/**
 * Maps employee transaction data into a UI-friendly format
 *
 * @param {Object} employeeTransactionsData - API response containing transactions
 * @returns {Array} Mapped transaction list
 */
export const mapEmployeeTransactions = (
  assetTypeData,
  employeeTransactionsData = {}
) => {
  if (!employeeTransactionsData) return [];

  return employeeTransactionsData.map((item) => ({
    key: item.workFlowID,
    workFlowID: item.workFlowID || null,
    title: `ConductTransactionRequest-${item.workFlowID || ""}-${
      item.requestDate || ""
    } ${item.requestTime || ""}`,
    description: item.description || "",
    instrumentShortCode: item.instrumentShortCode || "",
    instrumentName: item.instrumentName || "",
    quantity: item.quantity || 0,
    tradeApprovalID: item.tradeApprovalID || "",
    tradeApprovalTypeID: item.tradeApprovalTypeID || null,
    tradeType: getTradeTypeById(assetTypeData, item?.tradeApproval) || "-",
    isEscalated: item.isEscalated,
    workFlowStatusID: item.workFlowStatusID || null,
    workFlowStatus: item.workFlowStatus || "",
    assetTypeID: item.assetTypeID || null,
    assetType: item.assetType || "",
    assetShortCode: item.assetShortCode || "",

    transactionConductedDateandTime:
      `${item?.transactionConductedDate || ""} ${
        item?.transactionConductedTime || ""
      }`.trim() || "—",
    transactionConductedDate: item.transactionConductedDate || "",
    transactionConductedTime: item.transactionConductedTime || "",
    deadlineDate: item.deadlineDate || "",
    deadlineTime: item.deadlineTime || "",
    brokers: item.brokers || [],
    broker:
      Array.isArray(item.brokers) && item.brokers.length > 1
        ? "Multiple Brokers"
        : item.brokers?.[0]?.brokerName || item.broker || "—",
  }));
};

export const getBorderlessTableColumns = ({
  approvalStatusMap,
  sortedInfo,
  employeeMyTransactionSearch,
  setViewDetailTransactionModal,
  setEmployeeMyTransactionSearch,
  handleViewDetailsForTransaction,
}) => [
  {
    title: withSortIcon("Transaction ID", "tradeApprovalID", sortedInfo),
    align: "left",
    dataIndex: "tradeApprovalID",
    key: "tradeApprovalID",
    width: 140,
    // ellipsis: true,
    sorter: (a, b) =>
      parseInt(a.tradeApprovalID.replace(/[^\d]/g, ""), 10) -
      parseInt(b.tradeApprovalID.replace(/[^\d]/g, ""), 10),
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "tradeApprovalID" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (tradeApprovalID) => {
      return (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span className="font-medium">
            {dashBetweenApprovalAssets(tradeApprovalID)}
            {/* {dashBetweenApprovalAssets("REQ888888")} */}
          </span>
        </div>
      );
    },
  },
  {
    title: withSortIcon("Instrument", "instrumentName", sortedInfo),
    align: "left",
    dataIndex: "Instrument",
    key: "instrumentName",
    width: 120,
    ellipsis: true,
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
      const assetCode = record?.assetShortCode;
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
    title: (
      <TypeColumnTitle
        state={employeeMyTransactionSearch}
        setState={setEmployeeMyTransactionSearch}
      />
    ),
    dataIndex: "tradeType",
    key: "tradeType",
    width: 100,
    align: "center",
    filteredValue: employeeMyTransactionSearch.type?.length
      ? employeeMyTransactionSearch?.type
      : null,
    onFilter: () => true,
    render: (value) => {
      return value || "-";
    },
  },
  {
    title: withSortIcon(
      "Transaction Date & Time",
      "transactionConductedDateandTime",
      sortedInfo,
      "center"
    ),
    dataIndex: "transactionConductedDateandTime",
    key: "transactionConductedDateandTime",
    width: 250,
    align: "center",
    // ellipsis: true,
    sorter: (a, b) =>
      formatApiDateTime(a.transactionConductedDateandTime).localeCompare(
        formatApiDateTime(b.transactionConductedDateandTime)
      ),
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "transactionConductedDateandTime"
        ? sortedInfo.order
        : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (date, record) => (
      <span id={`cell-${record.key}-requestDateTime`} className="text-gray-600">
        {formatApiDateTime(date)}
      </span>
    ),
  },
  {
    title: (
      <StatusColumnTitle
        state={employeeMyTransactionSearch}
        setState={setEmployeeMyTransactionSearch}
      />
    ),
    dataIndex: "workFlowStatus",
    key: "workFlowStatus",
    ellipsis: true,
    width: 130,
    filteredValue: employeeMyTransactionSearch.status?.length
      ? employeeMyTransactionSearch.status
      : null,
    onFilter: () => true,
    render: (status) => {
      const tag = approvalStatusMap[status] || {};
      return (
        <Tag
          style={{
            backgroundColor: tag.backgroundColor,
            color: tag.textColor,
          }}
          className="border-less-table-orange-status"
        >
          {tag.label}
        </Tag>
      );
    },
  },
  {
    // ADDED: backend already sends isEscalated (SearchEmployeeTransactionsResponse.IsEscalated)
    // and it was already being mapped in mapEmployeeTransactions above, but no
    // column ever rendered it - same escalated-icon pattern already used on
    // the sibling My Approvals page (employes/myApprovals/utils.jsx).
    title: "",
    dataIndex: "isEscalated",
    key: "isEscalated",
    width: 50,
    align: "center",
    render: (isEscalated) =>
      isEscalated && (
        <img
          draggable={false}
          src={EscalatedIcon}
          alt="Escalated"
          data-testid="escalated-icon"
          style={{ display: "block", margin: "0 auto" }}
        />
      ),
  },
  {
    title: withSortIcon("Quantity", "quantity", sortedInfo, "center"),
    align: "center",
    dataIndex: "quantity",
    key: "quantity",
    // ellipsis: true,
    width: 100,
    sorter: (a, b) => a.quantity - b.quantity,
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "quantity" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (q) => <span className="font-medium">{q.toLocaleString()}</span>,
  },

  {
    title: withSortIcon("Broker", "broker", sortedInfo),
    align: "left",
    dataIndex: "broker",
    width: 200,
    key: "broker",
    sorter: (a, b) => a.broker - b.broker,
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "broker" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (broker, record) => {
      const brokers = record?.brokers || [];
      if (brokers.length > 1) {
        return (
          <Tooltip title={brokers.map((b) => b.brokerName).join(", ")}>
            <span>{broker}</span>
          </Tooltip>
        );
      }
      return <span>{broker}</span>;
    },
  },
  {
    title: "",
    key: "action",
    render: (_, record) => {
      //Global State to selected data to show in ViewDetailModal
      const { setSelectedViewDetailOfTransaction } = useGlobalModal();
      return (
        <Button
          className="small-dark-button"
          text={"View Details"}
          onClick={() => {
            handleViewDetailsForTransaction(record?.workFlowID);
            setSelectedViewDetailOfTransaction(record);
            setViewDetailTransactionModal(true);
          }}
        />
      );
    },
  },
];
