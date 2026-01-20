import { Button } from "../../../../../components";

import TypeColumnTitle from "../../../../../components/dropdowns/filters/typeColumnTitle";
import StatusColumnTitle from "../../../../../components/dropdowns/filters/statusColumnTitle";
import { Tag, Tooltip } from "antd";
import style from "./transactionsSummary.module.css";

import {
  formatApiDateTime,
  toYYMMDD,
} from "../../../../../common/funtions/rejex";
import { getTradeTypeById } from "../../../../../common/funtions/type";
import {
  mapBuySellToIds,
  mapStatusToIds,
} from "../../../../../components/dropdowns/filters/utils";
import { withSortIcon } from "../../../../../common/funtions/tableIcon";

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

export const buildApiRequestViewDetails = (
  searchState = {},
  assetTypeListingData
) => ({
  PageNumber: Number(searchState.pageNumber) || 0,
  Length: Number(searchState.pageSize) || 10,
  TransactionDate: searchState.transactionDate,
  QuantitySearch: searchState.quantity,
  InstrumentNameSearch: searchState.instrumentName,
  RequesterNameSearch: searchState.employeeName,
  StatusIds: mapStatusToIds(searchState.status),
  TypeIds: mapBuySellToIds(searchState.type, assetTypeListingData?.Equities),
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
    totalEmployees: item.totalEmployees || "0",
    totalTransactions: item.totalTransactions || "0",
    compliantTransactions: item.compliantTransactions || "0",
    nonCompliantTransactions: item.nonCompliantTransactions || "0",
    transactionDate:
      [item?.transactionDate, item?.transactionTime]
        .filter(Boolean)
        .join(" ") || "—",
  }));
};
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
    approvalComment: item.approvalComment || "",
    rejectionComment: item.rejectionComment || "",
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
    align: "center",
    dataIndex: "transactionDate",
    key: "transactionDate",
    width: 200,
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
    width: 200,
    ellipsis: true,
    align: "center",
    sorter: (a, b) => (a?.totalEmployees ?? 0) - (b?.totalEmployees ?? 0),
    sortOrder:
      sortedInfo?.columnKey === "totalEmployees" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (q) => <span className="font-medium">{q.toLocaleString()}</span>,
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
    width: 200,
    ellipsis: true,
    align: "center",
    sorter: (a, b) => (a?.totalTransactions ?? 0) - (b?.totalTransactions ?? 0),
    sortOrder:
      sortedInfo?.columnKey === "totalTransactions" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (q) => <span className="font-medium">{q.toLocaleString()}</span>,
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
    width: 200,
    ellipsis: true,
    align: "center",
    sorter: (a, b) =>
      (a?.compliantTransactions ?? 0) - (b?.compliantTransactions ?? 0),
    sortOrder:
      sortedInfo?.columnKey === "compliantTransactions"
        ? sortedInfo.order
        : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (q) => <span className="font-medium">{q.toLocaleString()}</span>,
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
    ellipsis: true,
    align: "center",
    sorter: (a, b) =>
      (a?.nonCompliantTransactions ?? 0) - (b?.nonCompliantTransactions ?? 0),
    sortOrder:
      sortedInfo?.columnKey === "nonCompliantTransactions"
        ? sortedInfo.order
        : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (q) => <span className="font-medium">{q.toLocaleString()}</span>,
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
            handelViewDetails(record.transactionDate);
          }}
        />
      </div>
    ),
  },
];
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
        overflow: "hidden",
        textOverflow: "ellipsis",
        display: "inline-flex",
        alignItems: "center",
        maxWidth: "100%",
        minWidth: 0,
        margin: 0,
        border: "none",
        borderRadius: "4px",
        padding: "2px 8px",
        fontSize: "16px",
        lineHeight: "1.4",
      }}
      className="border-less-table-orange-status"
      data-testid={`status-tag-${status}`}
    >
      <span
        style={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {tagConfig.label || status}
      </span>
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

export const getBorderlessTableColumnsViewDetails = ({
  approvalStatusMap,
  sortedInfo,
  hocTransactionsSummarysReportsViewDetailsSearch,
  setHOCTransactionsSummarysReportsViewDetailSearch,
  handelViewDetails,
}) => [
  {
    title: withSortIcon("Employee ID", "employeeID", sortedInfo),
    dataIndex: "employeeID",
    key: "employeeID",
    width: 150,
    align: "left",
    ellipsis: true,
    sorter: (a, b) =>
      parseInt(a.employeeID.replace(/[^\d]/g, ""), 10) -
      parseInt(b.employeeID.replace(/[^\d]/g, ""), 10),
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "employeeID" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (employeeID) => {
      return <span className="font-medium">{employeeID}</span>;
    },
  },
  {
    title: withSortIcon("Employee Name", "employeeName", sortedInfo),
    dataIndex: "employeeName",
    key: "employeeName",
    width: 200,
    align: "left",
    ellipsis: true,
    sorter: (a, b) => a.employeeName.localeCompare(b.employeeName),
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "employeeName" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text) => <span className="font-medium">{text}</span>,
  },
  {
    title: withSortIcon("Instrument", "instrumentName", sortedInfo),
    dataIndex: "instrumentName",
    key: "instrumentName",
    align: "left",
    width: 150,
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
      sortedInfo,
      "center"
    ),
    dataIndex: "transactionDate",
    key: "transactionDate",
    width: 200,
    align: "center",
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
    title: withFilterHeader(() => (
      <TypeColumnTitle
        state={hocTransactionsSummarysReportsViewDetailsSearch}
        setState={setHOCTransactionsSummarysReportsViewDetailSearch}
      />
    )),
    dataIndex: "type",
    width: 150,
    key: "type",
    ellipsis: true,
    filteredValue: hocTransactionsSummarysReportsViewDetailsSearch.type?.length
      ? hocTransactionsSummarysReportsViewDetailsSearch.type
      : null,
    onFilter: () => true, // Actual filtering handled by API
    render: (type, record) => (
      <span id={`cell-${record.key}-type`}>{type}</span>
    ),
  },
  {
    title: withSortIcon("Quantity", "quantity", sortedInfo, "center"),
    align: "center",
    dataIndex: "quantity",
    key: "quantity",
    width: 100,
    sorter: (a, b) => (a?.quantity ?? 0) - (b?.quantity ?? 0),
    sortOrder: sortedInfo?.columnKey === "quantity" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (q) => (
      <span className="font-medium">{Number(q).toLocaleString("en-US") || "—"}</span>
    ),
  },
  {
    title: withFilterHeader(() => (
      <StatusColumnTitle
        state={hocTransactionsSummarysReportsViewDetailsSearch}
        setState={setHOCTransactionsSummarysReportsViewDetailSearch}
      />
    )),
    width: 200,
    dataIndex: "status",
    key: "status",
    ellipsis: true,
    filteredValue: hocTransactionsSummarysReportsViewDetailsSearch.status
      ?.length
      ? hocTransactionsSummarysReportsViewDetailsSearch.status
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
          text={"View Details"}
          onClick={() => {
            console.log(record, "record");
          }}
        />
      </div>
    ),
  },
];
