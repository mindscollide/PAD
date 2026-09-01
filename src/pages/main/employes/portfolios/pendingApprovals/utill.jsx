// utils.jsx
import React from "react";
import { Tag, Tooltip, Typography } from "antd";
import { Button } from "../../../../../components";
import EscalatedIcon from "../../../../../assets/img/escalated.png";

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
  // Plain UTC date conversion - the same-day padding workaround was
  // removed 2026-08-25 now that BE's fix (API_Changes/2026-08-24_same_day_
  // date_search_now_works.md) is confirmed live.
  EndDate: searchState.endDate ? toYYMMDD(searchState.endDate) : "",
  BrokerIds: Array.isArray(searchState.brokerIDs) ? searchState.brokerIDs : [],
  // Real 1-indexed page number (BE_API_Changes/2026-08-24_same_day_date_
  // search_now_works.md pagination offset fix, bundled into
  // sp_searchEmployeePendingPortfolio_FixSameDayDateFilter.sql - OFFSET
  // (PageNumber-1)*Length) - was `|| 0`, matching the old buggy backend
  // that used PageNumber as a raw row offset.
  PageNumber: Number(searchState.pageNumber) || 1,
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
    width: 150,
    sorter: (a, b) => (a?.instrument || "").localeCompare(b?.instrument || ""),
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
    width: 150,

    sorter: (a, b) =>
      (a?.tradeApprovalID || "").localeCompare(b?.tradeApprovalID || ""),
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "tradeApprovalID" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text) => (
      <span className="font-medium">{formatCode(text) || "—"}</span>
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
    width: 250,

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
      <span className="text-gray-600">{formatApiDateTime(date) || "—"}</span>
    ),
  },

  // 🔹 Quantity Column
  {
    title: withSortIcon("Quantity", "quantity", sortedInfo, "center"),
    align: "center",
    dataIndex: "quantity",
    key: "quantity",
    width: 150,

    sorter: (a, b) => (a?.quantity || 0) - (b?.quantity || 0),
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "quantity" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (value, record) => (
      <Text style={{ color: record?.type === "Buy" ? "#00640A" : "#A50000" }}>
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
    dataIndex: "tradeType",
    key: "tradeType",
    width: 150,

    filteredValue: employeePendingApprovalSearch?.type?.length
      ? employeePendingApprovalSearch.type
      : null,
    onFilter: () => true, // filtering handled externally
    render: (type) => <span>{type || "—"}</span>,
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
    width: 250,

    sorter: (a, b) => (a?.broker || "").localeCompare(b?.broker || ""),
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "broker" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (broker, record) => {
      if (broker === "Multiple Brokers" && record?.brokersListed) {
        return (
          <Tooltip title={record.brokersListed}>
            <span>{broker}</span>
          </Tooltip>
        );
      }
      return <span>{broker}</span>;
    },
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
    width: 150,

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

  // 🔹 Escalated Icon - same pattern as CO Reconcile > Transaction/Portfolio
  {
    title: "",
    dataIndex: "isEscalated",
    key: "isEscalated",
    width: 60,
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
    let brokersListed = [];
    // console.log("mapToTableRows", item);
    // console.log("mapToTableRows", brokerOptions);
    if (item?.broker === "Multiple Brokers") {
      brokerLabel = "Multiple Brokers";

      const brokerListArr = Array.isArray(item?.brokerList)
        ? item.brokerList
        : [];
      brokersListed = brokerListArr
        .map((b) => b.brokerName)
        .filter(Boolean)
        .join(", ");
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
      brokersListed: brokersListed || "",
      approvalRequestDateime:
        `${item?.transactionConductedDate || ""} ${
          item?.transactionConductedTime || ""
        }`.trim() || "—",
      quantity: item?.quantity ?? 0,
      tradeType: getTradeTypeById(assetTypeData, item?.tradeType) || "—",
      broker: brokerLabel || "—",
      status: item?.workFlowStatus?.workFlowStatus || "—",
      // ADDED: same gap as the CO reconcile screens had (BE already sends
      // isEscalated on SearchEmployeePendingUploadedPortFolio's response
      // via IsEscalationOpen, just never picked up here) - no column ever
      // rendered it either.
      isEscalated: item?.isEscalated || false,
    };
  });
