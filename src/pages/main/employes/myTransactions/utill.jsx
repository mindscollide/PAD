import { Button } from "../../../../components";

import ArrowUP from "../../../../assets/img/arrow-up-dark.png";
import ArrowDown from "../../../../assets/img/arrow-down-dark.png";
import DefaultColumArrow from "../../../../assets/img/default-colum-arrow.png";
import TypeColumnTitle from "../../../../components/dropdowns/filters/typeColumnTitle";
import StatusColumnTitle from "../../../../components/dropdowns/filters/statusColumnTitle";
import { Tag, Tooltip } from "antd";
import style from "./myTransaction.module.css";

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
  StatusIds: mapStatusToIds?.(searchState.status) || [],
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
export const mapEmployeeTransactions = (assetTypeData,employeeTransactionsData = {}) => {
  if (!employeeTransactionsData) return [];
  console.log("assetTypeListingData", employeeTransactionsData);

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
    tradeType:getTradeTypeById(assetTypeData, item?.tradeApproval) || "-" ,
    isEscalated:item.isEscalated,
    workFlowStatusID: item.workFlowStatusID || null,
    workFlowStatus: item.workFlowStatus || "",
    assetTypeID: item.assetTypeID || null,
    assetType: item.assetType || "",
    assetShortCode: item.assetShortCode || "",
    transactionConductedDate: item.transactionConductedDate || "",
    transactionConductedTime: item.transactionConductedTime || "",
    deadlineDate: item.deadlineDate || "",
    deadlineTime: item.deadlineTime || "",
    broker: item.broker || "Multiple Brokers",
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
    dataIndex: "tradeApprovalID",
    key: "tradeApprovalID",
    width: "12%",
    ellipsis: true,
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
    dataIndex: "Instrument",
    key: "instrumentName",
    width: "15%",
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
      console.log(record, "Checkerrrrr");
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
    ellipsis: true,
    width: "10%",
    filteredValue: employeeMyTransactionSearch.type?.length
      ? employeeMyTransactionSearch?.type
      : null,
    onFilter: () => true,
    render: (value, record) => {
      console.log("check what type", value, record);
      return value || "-";
    },
  },
  {
    title: withSortIcon(
      "Transaction Date & Time",
      "transactionDateTime",
      sortedInfo
    ),
    dataIndex: "transactionDateTime",
    key: "transactionDateTime",
    ellipsis: true,
    width: "17%",
    sorter: (a, b) => {
      const dateA = new Date(
        `${a.transactionConductedDate} ${a.transactionConductedTime}`
      ).getTime();
      const dateB = new Date(
        `${b.transactionConductedDate} ${b.transactionConductedTime}`
      ).getTime();
      return dateA - dateB;
    },
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "transactionDateTime" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (_, record) => (
      <span className="text-gray-600">
        {formatApiDateTime(
          `${record.transactionConductedDate} ${record.transactionConductedTime}`
        )}
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
    width: "12%",
    filteredValue: employeeMyTransactionSearch.status?.length
      ? employeeMyTransactionSearch.status
      : null,
    onFilter: () => true,
    render: (status) => {
      console.log(status, "statusstatusstatus");
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
    title: withSortIcon("Quantity", "quantity", sortedInfo),
    dataIndex: "quantity",
    key: "quantity",
    ellipsis: true,
    width: "8%",
    sorter: (a, b) => a.quantity - b.quantity,
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "quantity" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (q) => <span className="font-medium">{q.toLocaleString()}</span>,
  },
  {
    title: withSortIcon("Broker", "broker", sortedInfo),
    dataIndex: "broker",
    width: "17%",
    key: "broker",
    sorter: (a, b) => a.broker - b.broker,
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "broker" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
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
