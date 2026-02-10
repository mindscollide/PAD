import { Button } from "../../../../components";

import TypeColumnTitle from "../../../../components/dropdowns/filters/typeColumnTitle";
import StatusColumnTitle from "../../../../components/dropdowns/filters/statusColumnTitle";
import { Tag, Tooltip } from "antd";
import style from "./transactionsSummary.module.css";

import {
  formatApiDateTime,
  toYYMMDD,
} from "../../../../common/funtions/rejex";
import { getTradeTypeById } from "../../../../common/funtions/type";
import {
  mapBuySellToIds,
  mapStatusToIds,
} from "../../../../components/dropdowns/filters/utils";
import { withSortIcon } from "../../../../common/funtions/tableIcon";

/**
 * Utility: Build API request payload for approval listing
 *
 * @param {Object} searchState - Current search/filter state
 * @returns {Object} API-ready payload
 */
export const buildApiRequest = (searchState = {}) => ({
  PageNumber: Number(searchState.pageNumber) || 0,
  Length: Number(searchState.pageSize) || 10,
  ToDate: searchState.endDate ? toYYMMDD(searchState.endDate) : "",
  FromDate: searchState.startDate ? toYYMMDD(searchState.startDate) : "",
});

/**
 * Maps employee transaction data into a UI-friendly format
 *
 * @param {Object} getEmployeeTransactionReport - API response containing transactions
 * @returns {Array} Mapped transaction list
 */
export const mappingDateWiseTransactionReport = (
  myTradeApprovalLineManagerData = []
) => {
  const records = Array.isArray(myTradeApprovalLineManagerData)
    ? myTradeApprovalLineManagerData
    : myTradeApprovalLineManagerData?.records || [];

  if (!records.length) return [];

  return records.map((item) => ({
    key:
      item.transactionDate +
      item.totalEmployees +
      item.compliantTransactions +
      item.totalTransactions +
      item.nonCompliantTransactions,
    totalEmployees: item.totalEmployees,
    totalTransactions: item.totalTransactions || 0,
    compliantTransactions: item.compliantTransactions || 0,
    nonCompliantTransactions: item.nonCompliantTransactions || 0,
    transactionDate:
      [item?.transactionDate, item?.transactionTime]
        .filter(Boolean)
        .join(" ") || "—",
  }));
};


export const getBorderlessTableColumns = ({
  sortedInfo,
  handelViewDetails,
}) => [
  {
    title: withSortIcon(
      "Transaction Date",
      "transactionDate",
      sortedInfo,
      "center"
    ),
    dataIndex: "transactionDate",
    key: "transactionDate",
    width: 200,
    align: "center",
    ellipsis: true,
    sorter: (a, b) =>
      (a?.transactionDate || "").localeCompare(b?.transactionDate || ""),
    sortOrder:
      sortedInfo?.columnKey === "transactionDate" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (date) => (
      <span className="text-gray-600" title={date || "—"}>
        {formatApiDateTime(date) || "—"}
      </span>
    ),
  },
  {
    title: withSortIcon(
      "Total Employees",
      "totalEmployees",
      sortedInfo,
      "center"
    ),
    dataIndex: "totalEmployees",
    key: "totalEmployees",
    width: 140,
    align: "center",
    ellipsis: true,
    sorter: (a, b) => (a?.totalEmployees ?? 0) - (b?.totalEmployees ?? 0),
    sortOrder:
      sortedInfo?.columnKey === "totalEmployees" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (q) => <span>{q.toLocaleString()}</span>,
  },
  {
    title: withSortIcon(
      "Total Transactions",
      "totalTransactions",
      sortedInfo,
      "center"
    ),
    dataIndex: "totalTransactions",
    key: "totalTransactions",
    width: 140,
    align: "center",
    ellipsis: true,
    sorter: (a, b) => (a?.totalTransactions ?? 0) - (b?.totalTransactions ?? 0),
    sortOrder:
      sortedInfo?.columnKey === "totalTransactions" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (q) => <span>{q.toLocaleString()}</span>,
  },
  {
    title: withSortIcon(
      "Compliant Transactions",
      "compliantTransactions",
      sortedInfo,
      "center"
    ),
    dataIndex: "compliantTransactions",
    key: "compliantTransactions",
    width: 140,
    align: "center",
    ellipsis: true,
    sorter: (a, b) =>
      (a?.compliantTransactions ?? 0) - (b?.compliantTransactions ?? 0),
    sortOrder:
      sortedInfo?.columnKey === "compliantTransactions"
        ? sortedInfo.order
        : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (q) => <span>{q.toLocaleString()}</span>,
  },
  {
    title: withSortIcon(
      "Non-Compliant Transactions",
      "nonCompliantTransactions",
      sortedInfo,
      "center"
    ),
    dataIndex: "nonCompliantTransactions",
    key: "nonCompliantTransactions",
    width: 200,
    align: "center",
    ellipsis: true,
    sorter: (a, b) =>
      (a?.nonCompliantTransactions ?? 0) - (b?.nonCompliantTransactions ?? 0),
    sortOrder:
      sortedInfo?.columnKey === "nonCompliantTransactions"
        ? sortedInfo.order
        : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (q) => <span>{q.toLocaleString()}</span>,
  },
  {
    title: "",
    key: "action",
    width: 200,
    align: "right", // 🔷 Align content to the right
    render: (_, record) => (
      <div className={style.viewEditClass}>
        <Button
          className="small-light-button"
          text={"View Details"}
          onClick={() => {
            console.log(record, "tradeApprovalID");
            handelViewDetails(record.transactionDate);
          }}
        />
      </div>
    ),
  },
];

export const buildApiRequestViewDetails = (
  searchState = {},
  assetTypeListingData
) => ({
  PageNumber: Number(searchState.pageNumber) || 0,
  Length: Number(searchState.pageSize) || 10,
  TransactionDate: searchState.transactionDate,
  QuantitySearch: searchState.quantitySearch,
  InstrumentNameSearch: searchState.instrumentNameSearch,
  RequesterNameSearch: searchState.requesterNameSearch,
  StatusIds: mapStatusToIds(searchState.status, 2),
  TypeIds: mapBuySellToIds(searchState.type, assetTypeListingData?.Equities),
});

export const mappingDateWiseTransactionviewDetailst = (
  assetTypeData,
  myTradeApprovalLineManagerData = []
) => {
  const records = Array.isArray(myTradeApprovalLineManagerData)
    ? myTradeApprovalLineManagerData
    : myTradeApprovalLineManagerData?.records || [];

  if (!records.length) return [];

  return records.map((item) => ({
    key: item.workFlowID,
    approvalID: item.approvalID,
    tradeApprovalID: item.tradeApprovalID || "",
    instrumentCode: item?.instrumentShortCode || "—",
    instrumentName: item?.instrumentName || "—",
    assetTypeShortCode: item?.assetShortCode || "—",
    transactionDate:
      `${item?.creationDate || ""} ${item?.creationTime || ""}`.trim() || "—",
    department: item.departmentName,
    type: getTradeTypeById(assetTypeData, item?.tradeType) || "-",
    status: item.approvalStatus?.approvalStatusName || "",
    quantity: item.quantity || 0,
    timeRemainingToTrade: item.timeRemainingToTrade || "",
    assetType: item.assetType?.assetTypeName || "",
    assetTypeID: item.assetType?.assetTypeID || 0,
    employeeName: item.requesterName || "",
    employeeID: item.employeeID || "",
    accetanceComments: item.accetanceComments || "",
    rejectionComment: item.rejectionComment || "",
  }));
};
/**
 * Renders status tag with appropriate styling
 * @param {string} status - Approval status
 * @param {Object} approvalStatusMap - Status to style mapping
 * @returns {JSX.Element} Status tag component
 */
const renderStatusTag = (status, approvalStatusMap) => {
  const tagConfig = approvalStatusMap[status] || {};

  return (
    <Tag
      style={{
        backgroundColor: tagConfig.backgroundColor,
        color: tagConfig.textColor,
        whiteSpace: "nowrap",
        display: "inline-flex",
        alignItems: "center",
        border: "none",
        borderRadius: 4,
        padding: "2px 8px",
        fontSize: 14,
      }}
    >
      {tagConfig.label || status}
    </Tag>
  );
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

const numberSorter = (key) => (a, b) =>
  Number(String(a[key] || 0).replace(/[^\d]/g, "")) -
  Number(String(b[key] || 0).replace(/[^\d]/g, ""));

export const getBorderlessTableColumnsViewDetails = ({
  approvalStatusMap,
  sortedInfoView,
  coTransactionsSummarysReportsViewDetailsSearch,
  setCOTransactionsSummarysReportsViewDetailSearch,
  handelViewDetails,
  setIsViewComments,
}) => [
  {
    title: withSortIcon("Employee ID", "employeeID", sortedInfoView),
    dataIndex: "employeeID",
    key: "employeeID",
    align: "left",
    width: 150,
    ellipsis: true,
    sorter: numberSorter("employeeID"),
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfoView?.columnKey === "employeeID" ? sortedInfoView.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (employeeID) => {
      return (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span className="font-medium">{employeeID}</span>
        </div>
      );
    },
  },
  {
    title: withSortIcon("Employee Name", "employeeName", sortedInfoView),
    dataIndex: "employeeName",
    key: "employeeName",
    width: 200,
    align: "left",
    ellipsis: true,
    sorter: (a, b) => a.employeeName.localeCompare(b.employeeName),
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfoView?.columnKey === "employeeName"
        ? sortedInfoView.order
        : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text) => <span className="font-medium">{text}</span>,
  },
  {
    title: withSortIcon("Instrument", "instrumentName", sortedInfoView),
    dataIndex: "instrumentName",
    key: "instrumentName",
    align: "left",
    width: 150,
    ellipsis: true,
    sorter: (a, b) => {
      const nameA = a?.instrumentName || "";
      const nameB = b?.instrumentName || "";
      return nameA.localeCompare(nameB);
    },
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfoView?.columnKey === "instrumentName"
        ? sortedInfoView.order
        : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (instrument, record) => {
      const assetCode = record?.assetTypeShortCode;
      const code = record?.instrumentCode || "";
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
      "Initiated at",
      "transactionDate",
      sortedInfoView,
      "center"
    ),
    dataIndex: "transactionDate",
    key: "transactionDate",
    align: "center",
    width: 200,
    ellipsis: true,
    sorter: (a, b) =>
      (a?.transactionDate || "").localeCompare(b?.transactionDate || ""),
    sortOrder:
      sortedInfoView?.columnKey === "transactionDate"
        ? sortedInfoView.order
        : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (date) => (
      <span className="text-gray-600" title={date || "—"}>
        {formatApiDateTime(date) || "—"}
      </span>
    ),
  },
  {
    title: withFilterHeader(() => (
      <TypeColumnTitle
        state={coTransactionsSummarysReportsViewDetailsSearch}
        setState={setCOTransactionsSummarysReportsViewDetailSearch}
      />
    )),
    dataIndex: "type",
    width: 150,
    key: "type",
    ellipsis: true,
    filteredValue: coTransactionsSummarysReportsViewDetailsSearch.type?.length
      ? coTransactionsSummarysReportsViewDetailsSearch.type
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
    title: withSortIcon("Quantity", "quantity", sortedInfoView, "center"),
    dataIndex: "quantity",
    key: "quantity",
    align: "center",
    width: 100,
    sorter: (a, b) => (a?.quantity ?? 0) - (b?.quantity ?? 0),
    sortOrder:
      sortedInfoView?.columnKey === "quantity" ? sortedInfoView.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text) => (
      <span className={`${style["cell-text"]} font-medium`}>
        {text !== null && text !== undefined
          ? Number(text).toLocaleString("en-US")
          : "-"}
      </span>
    ),
  },
  {
    title: withFilterHeader(() => (
      <StatusColumnTitle
        state={coTransactionsSummarysReportsViewDetailsSearch}
        setState={setCOTransactionsSummarysReportsViewDetailSearch}
      />
    )),
    width: 200,
    dataIndex: "status",
    key: "status",
    ellipsis: true,
    filteredValue: coTransactionsSummarysReportsViewDetailsSearch.status?.length
      ? coTransactionsSummarysReportsViewDetailsSearch.status
      : null,
    onFilter: () => true,
    render: (status, record) => (
      <div id={`cell-${record.key}-status`}>
        {renderStatusTag(status, approvalStatusMap)}
      </div>
    ),
  },
  {
    title: "",
    key: "action",
    width: 150,
    align: "right", // 🔷 Align content to the right
    render: (_, record) => (
      <div className={style.viewEditClass}>
        <Button
          className="small-light-button"
          text={"View Comment"}
          onClick={() => {
            console.log(record, "tradeApprovalID");
            // handelViewDetails(record.approvalID);
            setIsViewComments(true);
            // setCheckTradeApprovalID(record?.approvalID);
            // setEditBrokerModal(true);
            // setEditModalData(record);
          }}
        />
      </div>
    ),
  },
];
