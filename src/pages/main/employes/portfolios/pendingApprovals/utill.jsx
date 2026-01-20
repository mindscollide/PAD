// utils.jsx
import React from "react";
import { Tag, Tooltip, Typography } from "antd";
import { Button } from "../../../../../components";

// Assets (sort icons)
import DefaultColumnArrow from "../../../../../assets/img/default-colum-arrow.png";
import ArrowUp from "../../../../../assets/img/arrow-up-dark.png";
import ArrowDown from "../../../../../assets/img/arrow-down-dark.png";

// Filter dropdowns for headers
import TypeColumnTitle from "../../../../../components/dropdowns/filters/typeColumnTitle";
import StatusColumnTitle from "../../../../../components/dropdowns/filters/statusColumnTitle";

// Helpers
import {
  formatApiDateTime,
  formatCode,
  toYYMMDD,
} from "../../../../../common/funtions/rejex";
import {
  mapBuySellToIds,
  mapStatusToIds,
} from "../../../../../components/dropdowns/filters/utils";
import { getTradeTypeById } from "../../../../../common/funtions/type";
import { withSortIcon } from "../../../../../common/funtions/tableIcon";

const { Text } = Typography;
/**
 * Build API request payload for portfolio listing
 *
 * @param {Object} searchState - Current search/filter state
 * @param {Object} assetTypeListingData - Extra request metadata
 * @param {String} assetType - Asset type key (e.g., "Equities")
 * @returns {Object} API-ready payload
 */
export const buildApiRequest = (searchState = {}, assetTypeListingData) => ({
  InstrumentName: searchState.instrumentName || "",
  Quantity: searchState.quantity ? Number(searchState.quantity) : 0,
  StartDate: searchState.startDate ? toYYMMDD(searchState.startDate) : "",
  StatusIds: mapStatusToIds(searchState.status, 2),
  TypeIds: mapBuySellToIds(searchState.type, assetTypeListingData?.Equities),
  EndDate: searchState.endDate ? toYYMMDD(searchState.endDate) : "",
  BrokerIds: Array.isArray(searchState.brokerIDs) ? searchState.brokerIDs : [],
  PageNumber: Number(searchState.pageNumber) || 0,
  Length: Number(searchState.pageSize) || 10,
});

/**
 * Generates column definitions for the Employee Pending Approval borderless table.
 *
 * Includes:
 * - Sorting with icons
 * - Ellipsis handling
 * - Fallback values for undefined/null
 *
 * @param {Object} approvalStatusMap - Map of statuses (key = status string, value = { label, backgroundColor, textColor }).
 * @param {Object} sortedInfo - Current sorting state from AntD Table.
 * @param {Object} employeePendingApprovalSearch - Current filter/search state object.
 * @param {Function} setEmployeePendingApprovalSearch - Setter function for updating filter/search state.
 * @returns {Array<Object>} Column definitions for AntD Table.
 */
export const getBorderlessTableColumns = (
  approvalStatusMap = {},
  sortedInfo = {},
  employeePendingApprovalSearch = {},
  setEmployeePendingApprovalSearch = () => {}
) => [
  // 🔹 Instrument Column
  {
    title: withSortIcon("Instrument", "instrument", sortedInfo),
    align: "left",
    dataIndex: "instrument",
    key: "instrument",
    ellipsis: true,
    width: "10%",
    sorter: (a, b) =>
      (a?.instrumentName || "").localeCompare(b?.instrumentName || ""),
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "instrument" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,

    render: (_, record) => {
      const { instrument, instrumentName, assetTypeShortCode } = record;

      const displayText = instrument ? ` ${instrument}` : instrument || "—";

      const tooltipText =
        instrument && instrumentName
          ? `${instrument} - ${instrumentName}`
          : instrument || "—";

      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <span className="custom-shortCode-asset" style={{ minWidth: 30 }}>
            {assetTypeShortCode?.substring(0, 2).toUpperCase()}
          </span>
          <Tooltip title={tooltipText} placement="topLeft">
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
              {displayText}
            </span>
          </Tooltip>
        </div>
      );
    },
  },

  // 🔹 Transaction ID Column
  {
    title: withSortIcon("Transaction ID", "tradeApprovalID", sortedInfo),
    align: "left",
    dataIndex: "tradeApprovalID",
    key: "tradeApprovalID",
    width: "10%",
    ellipsis: true,
    sorter: (a, b) =>
      (a?.tradeApprovalID || "").localeCompare(b?.tradeApprovalID || ""),
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "tradeApprovalID" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text) => (
      <span className="font-medium" title={text || "N/A"}>
        {formatCode(text) || "—"}
      </span>
    ),
  },

  // 🔹 Approval Request Date & Time Column
  {
    title: withSortIcon(
      "Approval Request Date & Time",
      "approvalRequestDateime",
      sortedInfo,
      "center"
    ),
    align: "center",
    dataIndex: "approvalRequestDateime",
    key: "approvalRequestDateime",
    width: "20%",
    ellipsis: true,
    sorter: (a, b) =>
      (a?.approvalRequestDateime || "").localeCompare(
        b?.approvalRequestDateime || ""
      ),
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "approvalRequestDateime"
        ? sortedInfo.order
        : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (date) => (
      <span className="text-gray-600" title={date || "N/A"}>
        {formatApiDateTime(date) || "—"}
      </span>
    ),
  },

  // 🔹 Quantity Column
  {
    title: withSortIcon("Quantity", "quantity", sortedInfo, "center"),
    align: "center",
    dataIndex: "quantity",
    key: "quantity",
    width: "7%",
    ellipsis: true,
    sorter: (a, b) => (a?.quantity || 0) - (b?.quantity || 0),
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "quantity" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (value, record) => (
      <Text
        style={{ color: record?.type === "Buy" ? "#00640A" : "#A50000" }}
        title={value?.toLocaleString() || "0"}
      >
        <span className="font-medium">{value?.toLocaleString() || "0"}</span>
      </Text>
    ),
  },

  // 🔹 Trade Type Column
  {
    title: (
      <TypeColumnTitle
        state={employeePendingApprovalSearch}
        setState={setEmployeePendingApprovalSearch}
      />
    ),
    dataIndex: "type",
    key: "type",
    ellipsis: true,
    filteredValue: employeePendingApprovalSearch?.type?.length
      ? employeePendingApprovalSearch.type
      : null,
    onFilter: () => true, // filtering handled externally
    render: (type) => <span title={type || "N/A"}>{type || "—"}</span>,
    onHeaderCell: () => ({
      style: {
        minWidth: "100px",
        maxWidth: "100px",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      },
    }),
    onCell: () => ({
      style: {
        minWidth: "100px",
        maxWidth: "100px",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      },
    }),
  },

  // 🔹 Broker Column
  {
    title: withSortIcon("Broker", "broker", sortedInfo),
    align: "left",
    dataIndex: "broker",
    key: "broker",
    width: "12%",
    ellipsis: true,
    sorter: (a, b) => (a?.broker || "").localeCompare(b?.broker || ""),
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "broker" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text) => (
      <span className="font-medium" title={text || "N/A"}>
        {text || "—"}
      </span>
    ),
  },

  // 🔹 Status Column
  {
    title: (
      <StatusColumnTitle
        state={employeePendingApprovalSearch}
        setState={setEmployeePendingApprovalSearch}
      />
    ),
    dataIndex: "status",
    key: "status",
    ellipsis: true,
    filteredValue: employeePendingApprovalSearch?.status?.length
      ? employeePendingApprovalSearch.status
      : null,
    onFilter: () => true,
    render: (status) => {
      const tag = approvalStatusMap?.[status] || {};
      return (
        <Tag
          style={{
            backgroundColor: tag.backgroundColor,
            color: tag.textColor,
            whiteSpace: "nowrap", // prevent wrapping
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "inline-block",
            // maxWidth: "100%", // tag respects parent cell width
          }}
          className="border-less-table-orange-status"
        >
          {tag.label}
        </Tag>
      );
    },
    onHeaderCell: () => ({
      style: {
        minWidth: "150px",
        maxWidth: "240px",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      },
    }),
    onCell: () => ({
      style: {
        minWidth: "150px",
        maxWidth: "240px",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      },
    }),
  },

  // 🔹 Action Column
  {
    title: "",
    key: "actions",
    width: "15%",
    render: (record) =>
      record?.status === "Non Compliant" ? (
        <Button className="big-white-button" text="Comments" />
      ) : null,
  },
];

/**
 * Converts raw broker list from API into AntD Select-compatible options.
 *
 * @param {Array<Object>} brokers - List of broker objects.
 * @param {string|number} brokers[].brokerID - Unique broker identifier.
 * @param {string} brokers[].brokerName - Display name for the broker.
 * @returns {Array<Object>} Formatted broker options.
 */
export const formatBrokerOptions = (brokers = []) => {
  if (!Array.isArray(brokers)) return [];
  return brokers.map(({ brokerID, brokerName }) => ({
    value: brokerID ?? "",
    label: brokerName || "Unnamed Broker",
    brokerID: brokerID ?? "",
    brokerName: brokerName || "Unnamed Broker",
  }));
};

export const mapToTableRows = (assetTypeData, list = [], brokerOptions = []) =>
  (Array.isArray(list) ? list : []).map((item = {}) => {
    let brokerLabel = "";

    if (item?.broker === "Multiple Brokers") {
      brokerLabel = "Multiple Brokers";
    } else if (item?.broker) {
      const broker = brokerOptions.find(
        (b) => String(b.brokerID) === String(item.broker)
      );
      brokerLabel =
        broker?.label || item?.broker?.brokerName || String(item.broker);
    }

    return {
      key: item?.workFlowID || `row-${Math.random()}`, // fallback unique key
      instrument: item?.instrumentShortCode || "—",
      instrumentName: item?.instrumentName || "—",
      assetTypeShortCode: item?.assetType?.assetTypeShortCode || "—",
      tradeApprovalID: item?.tradeApprovalID || "—",
      approvalRequestDateime:
        `${item?.transactionConductedDate || ""} ${
          item?.transactionConductedTime || ""
        }`.trim() || "—",
      quantity: item?.quantity ?? 0,
      type: getTradeTypeById(assetTypeData, item?.tradeType) || "—",
      broker: brokerLabel || "—",
      status: item?.workFlowStatus?.workFlowStatus || "—",
    };
  });
