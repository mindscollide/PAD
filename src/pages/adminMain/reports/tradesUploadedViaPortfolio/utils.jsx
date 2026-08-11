import { Tag, Tooltip } from "antd";
import TypeColumnTitle from "../../../../components/dropdowns/filters/typeColumnTitle";
import StatusColumnTitle from "../../../../components/dropdowns/filters/statusColumnTitle";
import { withSortIcon } from "../../../../common/funtions/tableIcon";
import { formatApiDateTime, toYYMMDD } from "../../../../common/funtions/rejex";

/**
 * Utility: Build API request payload for GetAdminTradesUploadedViaPortfolioAPI
 * per API_Changes/2026-08-11_admin_reports_all_apis.md. Status filters on
 * the raw WorkFlowStatusID (1=Pending, 8=Compliant, 9=Non-Compliant for
 * Portfolio uploads) - unlike other reports' StatusIds, this one is sent
 * as-is (no label-to-id mapping needed since the search state already
 * stores the raw ids selected via the Status column filter).
 *
 * @param {Object} searchState - Current search/filter state
 * @returns {Object} API-ready payload
 */
export const buildApiRequest = (searchState = {}) => ({
  InstrumentName: searchState.instrumentName || "",
  EmployeeName: searchState.employeeName || "",
  StartDate: searchState.startDate ? toYYMMDD(searchState.startDate) : "",
  EndDate: searchState.endDate ? toYYMMDD(searchState.endDate) : "",
  Quantity: searchState.quantity ? Number(searchState.quantity) : 0,
  Type: searchState.type?.length ? searchState.type : ["Buy", "Sell"],
  Status: searchState.status?.length ? searchState.status : [8, 9],
  // (pageNumber - 1) * length on the backend - 0 (the search state's
  // initial value) resolves to page 1 the same as 1 would.
  PageNumber: Number(searchState.pageNumber) || 1,
  Length: Number(searchState.pageSize) || 10,
});

/**
 * Maps GetAdminTradesUploadedViaPortfolioAPI records into a UI-friendly
 * format.
 *
 * @param {Object|Array} res - API response ({records, totalRecords}) or a bare array
 * @returns {Array} Mapped list
 */
export const mapListData = (res = []) => {
  const records = Array.isArray(res) ? res : res?.records || [];

  if (!records.length) return [];

  return records.map((item) => ({
    key: item.requestID,
    requestID: item.requestID,
    employeeID: item.employeeID,
    employeeName: item.employeeName || "",
    instrumentName: item.instrumentName || "—",
    instrumentShortCode: item.instrumentShortCode || "—",
    assetType: item.assetType || "",
    assetShortCode: item.assetShortCode || "",
    type: item.type || "-",
    uploadedDateTime:
      `${item?.uploadedDate || ""} ${item?.uploadedTime || ""}`.trim() || "—",
    quantity: item.quantity || 0,
    statusID: item.statusID,
    status: item.status || "",
  }));
};

const renderInstrumentCell = (record) => {
  const code = record?.instrumentShortCode || "—";
  const name = record?.instrumentName || "—";
  const assetCode = record?.assetShortCode || "";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
      <span
        className="custom-shortCode-asset"
        style={{
          minWidth: 32,
          flexShrink: 0,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {assetCode?.substring(0, 2).toUpperCase()}
      </span>
      <Tooltip title={`${code} - ${name}`} placement="topLeft" overlayStyle={{ maxWidth: 300 }}>
        <span
          className="font-medium"
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            minWidth: 0,
            flex: 1,
            cursor: "pointer",
          }}
        >
          {code}
        </span>
      </Tooltip>
    </div>
  );
};

export const getBorderlessTableColumns = ({
  approvalStatusMap,
  sortedInfo,
  adminTradesUploadedviaPortfolioReportSearch,
  setAdminTradesUploadedviaPortfolioReportSearch,
}) => [
  {
    title: withSortIcon("Employee ID", "employeeID", sortedInfo),
    dataIndex: "employeeID",
    key: "employeeID",
    width: "12%",
    align: "left",
    ellipsis: true,
    sorter: (a, b) => Number(a.employeeID) - Number(b.employeeID),
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "employeeID" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (employeeID) => <span className="font-medium">{employeeID}</span>,
  },
  {
    title: withSortIcon("Employee Name", "employeeName", sortedInfo),
    dataIndex: "employeeName",
    key: "employeeName",
    width: "14%",
    align: "left",
    ellipsis: true,
    sorter: (a, b) => (a.employeeName || "").localeCompare(b.employeeName || ""),
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "employeeName" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text) => <span className="font-medium">{text}</span>,
  },
  {
    title: withSortIcon("Instrument", "instrumentShortCode", sortedInfo),
    dataIndex: "instrumentShortCode",
    key: "instrumentShortCode",
    width: "14%",
    align: "left",
    ellipsis: true,
    sorter: (a, b) =>
      (a?.instrumentShortCode || "").localeCompare(b?.instrumentShortCode || ""),
    sortOrder:
      sortedInfo?.columnKey === "instrumentShortCode" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (_, record) => renderInstrumentCell(record),
  },
  {
    title: (
      <TypeColumnTitle
        state={adminTradesUploadedviaPortfolioReportSearch}
        setState={setAdminTradesUploadedviaPortfolioReportSearch}
      />
    ),
    dataIndex: "type",
    key: "type",
    ellipsis: true,
    align: "left",
    width: "10%",
    filteredValue: adminTradesUploadedviaPortfolioReportSearch?.type?.length
      ? adminTradesUploadedviaPortfolioReportSearch?.type
      : null,
    onFilter: () => true,
    render: (type, record) => (
      <span
        id={`cell-${record.key}-type`}
        className={type === "Buy" ? "text-green-600" : "text-red-600"}
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
    title: withSortIcon("Uploaded Date", "uploadedDateTime", sortedInfo, "center"),
    dataIndex: "uploadedDateTime",
    key: "uploadedDateTime",
    align: "center",
    ellipsis: true,
    width: "16%",
    sorter: (a, b) =>
      (a.uploadedDateTime || "").localeCompare(b.uploadedDateTime || ""),
    sortOrder:
      sortedInfo?.columnKey === "uploadedDateTime" ? sortedInfo.order : null,
    sortDirections: ["ascend", "descend"],
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (date) => (
      <span className="text-gray-600" title={date || "—"}>
        {formatApiDateTime(date) || "—"}
      </span>
    ),
  },
  {
    title: withSortIcon("Quantity", "quantity", sortedInfo, "center"),
    dataIndex: "quantity",
    key: "quantity",
    align: "center",
    ellipsis: true,
    width: "10%",
    sorter: (a, b) => Number(a.quantity || 0) - Number(b.quantity || 0),
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "quantity" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (q) => <span className="font-medium">{Number(q).toLocaleString("en-US")}</span>,
  },
  {
    title: (
      <StatusColumnTitle
        state={adminTradesUploadedviaPortfolioReportSearch}
        setState={setAdminTradesUploadedviaPortfolioReportSearch}
      />
    ),
    dataIndex: "status",
    key: "status",
    ellipsis: true,
    width: "12%",
    filteredValue: adminTradesUploadedviaPortfolioReportSearch?.status?.length
      ? adminTradesUploadedviaPortfolioReportSearch?.status
      : null,
    onFilter: () => true,
    render: (status) => {
      const tag = approvalStatusMap[status] || {};
      return (
        <Tag
          style={{ backgroundColor: tag.backgroundColor, color: tag.textColor }}
          className="border-less-table-orange-status"
        >
          {tag.label || status}
        </Tag>
      );
    },
  },
];
