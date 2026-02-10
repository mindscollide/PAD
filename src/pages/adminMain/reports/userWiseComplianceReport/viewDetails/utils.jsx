import ArrowUP from "../../../../../../assets/img/arrow-up-dark.png";
import ArrowDown from "../../../../../../assets/img/arrow-down-dark.png";
import DefaultColumArrow from "../../../../../../assets/img/default-colum-arrow.png";
import style from "./ViewDetails.module.css";

import { toYYMMDD } from "../../../../../../common/funtions/rejex";
import { getTradeTypeById } from "../../../../../../common/funtions/type";
import TypeColumnTitle from "../../../../../../components/dropdowns/filters/typeColumnTitle";
import { Tooltip } from "antd";
import { withSortIcon } from "../../../../../common/funtions/tableIcon";

/**
 * Utility: Build API request payload for approval listing
 *
 * @param {Object} searchState - Current search/filter state
 * @param {Object} assetTypeListingData - Extra request metadata (optional)
 * @returns {Object} API-ready payload
 */
export const buildApiRequest = (
  searchState = {},
  showSelectedTatDataOnViewDetailHTA
) => ({
  EmployeeID: showSelectedTatDataOnViewDetailHTA?.employeeID || "",
  StartDate: searchState.startDate ? toYYMMDD(searchState.startDate) : "",
  EndDate: searchState.endDate ? toYYMMDD(searchState.endDate) : "",
  PageNumber: Number(searchState.pageNumber) || 0,
  Length: Number(searchState.pageSize) || 10,
});

/**
 * Maps employee transaction data into a UI-friendly format
 *
 * @param {Object} getEmployeeTransactionReport - API response containing transactions
 * @returns {Array} Mapped transaction list
 */
export const mapListData = (assetTypeData, htaTATViewDetailsData = []) => {
  const workFlows = Array.isArray(htaTATViewDetailsData)
    ? htaTATViewDetailsData
    : htaTATViewDetailsData?.workFlows || [];

  if (!workFlows.length) return [];

  return workFlows.map((item) => ({
    key: item.approvalID,

    approvalID: item.approvalID,
    title: item.title || "—",
    tradeApprovalID: item.tradeApprovalID || "—",
    instrument: item?.instrument?.instrumentShortCode ?? "—",
    instrumentName: item?.instrument?.instrumentName ?? "—",
    assetTypeName: item.assetType?.assetTypeName || "—",
    type: getTradeTypeById(assetTypeData, item?.tradeType) || "—",
    approvalStatus: item.approvalStatus?.approvalStatusName || "—",
    employeeID: item.employeeID || "—",
    quantity: item.quantity ?? "—",
    requestDateTime:
      `${item?.requestDate || ""} ${item?.requestTime || ""}`.trim() || "—",
    deadlineDateTime:
      `${item?.deadlineDate || ""} ${item?.deadlineTime || ""}`.trim() || "—",
  }));
};

export const getBorderlessTableColumns = ({
  approvalStatusMap,
  sortedInfo,
  htaTATViewDetailsSearch,
  setHTATATViewDetailsSearch,
}) => [
  {
    title: withSortIcon("Instrument", "instrumentCode", sortedInfo),
    dataIndex: "instrumentCode",
    key: "instrumentCode",
    width: 200,
    ellipsis: true,
    sorter: (a, b) =>
      (a?.instrumentCode || "").localeCompare(b?.instrumentCode || ""),
    sortOrder:
      sortedInfo?.columnKey === "instrumentCode" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (_, record) => {
      const code = record?.instrument || "—";
      const name = record?.instrumentName || "—";
      const assetCode = record?.assetTypeShortCode || "";

      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
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
    title: (
      <div style={{ marginLeft: "8px" }}>
        {withSortIcon("Initiated At", "initiatedAt", sortedInfo)}
      </div>
    ),
    dataIndex: "initiatedAt",
    key: "initiatedAt",
    width: "140px",
    ellipsis: true,
    sortDirections: ["ascend", "descend"],
    showSorterTooltip: false,
    sorter: (a, b) => (a.initiatedAt || "").localeCompare(b.initiatedAt || ""),
    sortOrder:
      sortedInfo?.columnKey === "initiatedAt" ? sortedInfo.order : null,
    sortIcon: () => null,

    render: (value) => (
      <div style={{ marginLeft: "8px" }}>
        <span className="font-medium">{value || "—"}</span>
      </div>
    ),
  },
  {
    title: (
      <TypeColumnTitle
        state={htaTATViewDetailsSearch}
        setState={setHTATATViewDetailsSearch}
      />
    ),
    dataIndex: "type",
    key: "type",
    ellipsis: true,
    width: "140px",
    filteredValue: htaTATViewDetailsSearch.type?.length
      ? htaTATViewDetailsSearch?.type
      : null,
    onFilter: () => true,
    sortIcon: () => null,
    showSorterTooltip: false,
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
    title: withSortIcon("Quantity", "quantity", sortedInfo),
    dataIndex: "quantity",
    key: "quantity",
    width: "140px",
    ellipsis: true,
    sortIcon: () => null,
    showSorterTooltip: false,
    sorter: (a, b) => Number(a.quantity) - Number(b.quantity),
    sortOrder: sortedInfo?.columnKey === "quantity" ? sortedInfo.order : null,
    render: (text) => (
      <span className="font-medium">
        {Number(text).toLocaleString("en-US")}
      </span>
    ),
  },
  {
    title: (
      <div style={{ marginLeft: "8px" }}>
        {withSortIcon("Action By", "actionBy", sortedInfo)}
      </div>
    ),
    dataIndex: "actionBy",
    key: "actionBy",
    width: "140px",
    sortIcon: () => null,
    ellipsis: true,
    showSorterTooltip: false,
    sorter: (a, b) => (a.actionBy || "").localeCompare(b.actionBy || ""),
    sortOrder: sortedInfo?.columnKey === "actionBy" ? sortedInfo.order : null,
    render: (value) => (
      <div style={{ marginLeft: "8px" }}>
        <span className="font-medium">{value || "—"}</span>
      </div>
    ),
  },
  {
    title: (
      <div style={{ marginLeft: "8px" }}>
        {withSortIcon("Action At", "actionAt", sortedInfo)}
      </div>
    ),
    dataIndex: "actionAt",
    key: "actionAt",
    width: "140px",
    ellipsis: true,
    showSorterTooltip: false,
    sortIcon: () => null,
    sorter: (a, b) => (a.actionAt || "").localeCompare(b.actionAt || ""),
    sortOrder: sortedInfo?.columnKey === "actionAt" ? sortedInfo.order : null,
    render: (value) => (
      <div style={{ marginLeft: "8px" }}>
        <span className="font-medium">{value || "—"}</span>
      </div>
    ),
  },
  {
    title: (
      <div style={{ marginLeft: "8px" }}>
        {withSortIcon("TAT", "Tat", sortedInfo)}
      </div>
    ),
    dataIndex: "Tat",
    key: "Tat",
    width: "140px",
    ellipsis: true,
    showSorterTooltip: false,
    sorter: (a, b) => (a.Tat || 0) - (b.Tat || 0),
    sortIcon: () => null,
    sortOrder: sortedInfo?.columnKey === "Tat" ? sortedInfo.order : null,
    render: (value) => (
      <div style={{ marginLeft: "8px" }}>
        <span className="font-medium">{value || "—"}</span>
      </div>
    ),
  },
];
