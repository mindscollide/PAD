import { Button } from "../../../../../components";
import TypeColumnTitle from "../../../../../components/dropdowns/filters/typeColumnTitle";
import StatusColumnTitle from "../../../../../components/dropdowns/filters/statusColumnTitle";
import { Tag, Tooltip } from "antd";
import style from "./dataWiseTransactionsReports.module.css";

import {
  dashBetweenApprovalAssets,
  formatApiDateTime,
  toYYMMDD,
} from "../../../../../common/funtions/rejex";
import {
  mapBuySellToIds,
  mapStatusToIds,
} from "../../../../../components/dropdowns/filters/utils";
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
  DepartmentName: searchState.departmentName || "",
  Quantity: Number(searchState.quantity) || 0,

  PageNumber: Number(searchState.pageNumber) || 0,
  Length: Number(searchState.pageSize) || 10,

  StatusIds: mapStatusToIds(searchState.status),
  TypeIds: mapBuySellToIds(searchState.type, assetTypeListingData?.Equities),

  RequesterName: searchState.employeeName || "",

  StartDate: searchState.startDate ? toYYMMDD(searchState.startDate) : "",
  EndDate: searchState.endDate ? toYYMMDD(searchState.endDate) : "",
});

/**
 * Maps employee transaction data into a UI-friendly format
 *
 * @param {Object} getEmployeeTransactionReport - API response containing transactions
 * @returns {Array} Mapped transaction list
 */
export const mappingDateWiseTransactionReport = (
  assetTypeData,
  myTradeApprovalLineManagerData = []
) => {
  const records = Array.isArray(myTradeApprovalLineManagerData)
    ? myTradeApprovalLineManagerData
    : myTradeApprovalLineManagerData?.records || [];

  if (!records.length) return [];

  return records.map((item) => ({
    key: item.tradeApprovalID,
    approvalID: item.approvalID,
    tradeApprovalID: item.tradeApprovalID || "",
    instrumentCode: item?.instrument?.instrumentCode || "—",
    instrumentName: item?.instrument?.instrumentName || "—",
    assetTypeShortCode: item?.assetType?.assetTypeShortCode || "—",
    transactionDate:
      `${item?.requestDate || ""} ${item?.requestTime || ""}`.trim() || "—",
    department: item?.departmentName|| "—",
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
export const getBorderlessTableColumns = ({
  approvalStatusMap,
  sortedInfo,
  coDatewiseTransactionReportSearch,
  setCODatewiseTransactionReportSearch,
  handelViewDetails,
}) => [
  {
    title: withSortIcon("Employee ID", "employeeID", sortedInfo),
    align: "left",
    dataIndex: "employeeID",
    key: "employeeID",
    width: "10%",
    ellipsis: true,
    sorter: (a, b) =>
      parseInt(a.employeeID.replace(/[^\d]/g, ""), 10) -
      parseInt(b.employeeID.replace(/[^\d]/g, ""), 10),
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "employeeID" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (employeeID) => {
      return (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span className="font-medium">
            {employeeID}
            {/* {dashBetweenApprovalAssets("REQ888888")} */}
          </span>
        </div>
      );
    },
  },
  {
    title: withSortIcon("Employee Name", "employeeName", sortedInfo),
    dataIndex: "employeeName",
    key: "employeeName",
    align: "left",
    width: "160px",
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
    title: withSortIcon("Department Name", "department", sortedInfo),
    dataIndex: "department",
    key: "department",
    align: "left",
    width: 180,
    ellipsis: true,
    sorter: (a, b) => a.department.localeCompare(b.department),
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "department" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text) => <span className="font-medium">{text}</span>,
  },
  {
    title: withSortIcon("Instrument", "instrumentName", sortedInfo),
    dataIndex: "instrumentName",
    key: "instrumentName",
    width: "140px",
    ellipsis: true,
    sorter: (a, b) => {
      const nameA = a?.instrumentName || "";
      const nameB = b?.instrumentName || "";
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
      "Transaction Date",
      "transactionDate",
      sortedInfo,
      "center"
    ),
    align: "center",
    dataIndex: "transactionDate",
    key: "transactionDate",
    ellipsis: true,
    width: 140,
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
    title: withFilterHeader(() => (
      <TypeColumnTitle
        state={coDatewiseTransactionReportSearch}
        setState={setCODatewiseTransactionReportSearch}
      />
    )),
    dataIndex: "type",
    width: 100,
    key: "type",
    ellipsis: true,
    filteredValue: coDatewiseTransactionReportSearch.type?.length
      ? coDatewiseTransactionReportSearch.type
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
    title: withSortIcon("Quantity", "quantity", sortedInfo, "center"),
    dataIndex: "quantity",
    key: "quantity",
    align: "center",
    width: "120px",
    ellipsis: true,
    sorter: (a, b) => a.quantity - b.quantity,
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "quantity" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (q) => <span className="font-medium">{q.toLocaleString()}</span>,
  },
  {
    title: withFilterHeader(() => (
      <StatusColumnTitle
        state={coDatewiseTransactionReportSearch}
        setState={setCODatewiseTransactionReportSearch}
      />
    )),
    dataIndex: "status",
    key: "status",
    ellipsis: true,
    filteredValue: coDatewiseTransactionReportSearch.status?.length
      ? coDatewiseTransactionReportSearch.status
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
    align: "right", // 🔷 Align content to the right
    render: (_, record) => (
      <div className={style.viewEditClass}>
        <Button
          className="small-light-button"
          text={"View Details"}
          onClick={() => {
            console.log(record, "tradeApprovalID");
            handelViewDetails(record.approvalID);
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
