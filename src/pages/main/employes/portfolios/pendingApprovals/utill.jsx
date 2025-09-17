// utils.jsx
import React from "react";
import { Tag, Typography } from "antd";
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
} from "../../../../../commen/funtions/rejex";

const { Text } = Typography;

/**
 * Returns the correct sorting icon based on the current sort state.
 *
 * @param {string} columnKey - The column key to check against the sorted column.
 * @param {Object} sortedInfo - Ant Design Table's sort state object.
 * @returns {JSX.Element} Sort icon (img element).
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
        src={ArrowUp}
        alt="Desc"
        className="custom-sort-icon"
      />
    );
  }
  return (
    <img
      draggable={false}
      src={DefaultColumnArrow}
      alt="Default"
      className="custom-sort-icon"
    />
  );
};

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
    title: (
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        Instrument {getSortIcon("instrument", sortedInfo)}
      </div>
    ),
    dataIndex: "instrument",
    key: "instrument",
    ellipsis: true,
    sorter: (a, b) => (a?.instrument || "").localeCompare(b?.instrument || ""),
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "instrument" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text) => (
      <span className="font-medium" title={text || "N/A"}>
        {text || "—"}
      </span>
    ),
  },

  // 🔹 Transaction ID Column
  {
    title: (
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        Transaction ID {getSortIcon("tradeApprovalID", sortedInfo)}
      </div>
    ),
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
    title: (
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        Approval Request Date & Time{" "}
        {getSortIcon("approvalRequestDateime", sortedInfo)}
      </div>
    ),
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
    title: (
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        Quantity {getSortIcon("quantity", sortedInfo)}
      </div>
    ),
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
    title: (
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        Broker {getSortIcon("broker", sortedInfo)}
      </div>
    ),
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

/**
 * Transforms raw API response into AntD Table row format.
 *
 * @param {Array<Object>} list - API response data.
 * @param {Array<Object>} brokerOptions - Preformatted broker options (from `formatBrokerOptions`).
 * @returns {Array<Object>} Table row objects ready for rendering.
 */
export const getTradeTypeById = (assetTypeData, tradeTypeID) => {
  console.log("assetTypeData", assetTypeData);
  if (!assetTypeData?.items || !Array.isArray(assetTypeData.items)) {
    return "";
  }

  const match = assetTypeData.items.find(
    (item) => item.tradeApprovalTypeID === tradeTypeID
  );

  return match?.type || "";
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
