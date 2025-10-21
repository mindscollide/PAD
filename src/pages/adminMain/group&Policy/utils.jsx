import { Button } from "../../../components";

import ArrowUP from "../../../assets/img/arrow-up-dark.png";
import ArrowDown from "../../../assets/img/arrow-down-dark.png";
import { ArrowsAltOutlined } from "@ant-design/icons";
import { Tag, Switch } from "antd";
import styles from "./groups_and_policy.module.css";
import StatusColumnTitle from "../../../components/dropdowns/filters/statusColumnTitle";
import { mapStatusToIds } from "../../../components/dropdowns/filters/utils";
import DefaultColumArrow from "../../../assets/img/default-colum-arrow.png";

// import TypeColumnTitle from "./typeFilter";

/**
 * Returns the appropriate sort icon based on current sort state
 *
 * @param {string} columnKey - The column's key
 * @param {object} sortedInfo - Current sort state from the table
 * @returns {JSX.Element} The sort icon
 */

export const mapAdminGroupAndPolicyData = (adminBrokerData = {}) => {
  const brokers = Array.isArray(adminBrokerData) ? adminBrokerData : [];

  if (!brokers.length) return [];

  return brokers.map((item) => ({
    key: item.brokerID,
    brokerID: item.brokerID,
    brokerName: item.brokerName || "—",
    psxCode: item.psxCode || "—",
    brokerStatusID: item.brokerStatusID,
    brokerStatus: item.brokerStatus || "—",
  }));
};

const getSortIcon = (columnKey, sortedInfo) => {
  if (sortedInfo?.columnKey === columnKey) {
    return sortedInfo.order === "ascend" ? (
      <img src={ArrowDown} alt="Asc" className="custom-sort-icon" />
    ) : (
      <img src={ArrowUP} alt="Desc" className="custom-sort-icon" />
    );
  }
  return (
    <img
      draggable={false}
      src={DefaultColumArrow}
      alt="Not sorted"
      className="custom-sort-icon"
      data-testid={`sort-icon-${columnKey}-default`}
    />
  );
};

/**
 * Utility: Build API request payload for approval listing
 *
 * @param {Object} searchState - Current search/filter state
 * @param {Object} assetTypeListingData - Extra request metadata (optional)
 * @returns {Object} API-ready payload
 */
export const buildApiRequest = (searchState = {}) => ({
  BrokerName: searchState.brokerName || "",
  PSXCode: searchState.psxCode || "",
  StatusIds: mapStatusToIds?.(searchState.status) || [],
  PageNumber: Number(searchState.pageNumber) || 0,
  Length: Number(searchState.pageSize) || 10,
});

export const getTableColumns = ({
  sortedInfo,
  //   adminBrokerSearch,
  //   setAdminBrokerSearch,
  //   setEditBrokerModal,
  //   setEditModalData,
  //   onStatusChange,
}) => [
  {
    title: (
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        Broker Name {getSortIcon("brokerName", sortedInfo)}
      </div>
    ),
    dataIndex: "brokerName",
    key: "brokerName",
    ellipsis: true,
    sorter: (a, b) => a.brokerName.localeCompare(b.brokerName),
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo.columnKey === "brokerName" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text) => (
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span className="font-medium">{text}</span>
      </div>
    ),
  },

  {
    title: (
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        PSX Code {getSortIcon("psxCode", sortedInfo)}
      </div>
    ),
    dataIndex: "psxCode",
    key: "psxCode",
    ellipsis: true,
    sorter: (a, b) => a.psxCode - b.psxCode,
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "psxCode" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (q) => <span className="font-medium">{q.toLocaleString()}</span>,
  },
  {
    title: "",
    key: "action",
    align: "right", // 🔷 Align content to the right
    render: (_, record) => (
      <div className={styles.viewEditClass}>
        <Button
          className="Edit-small-dark-button"
          text={"Edit"}
          onClick={() => {
            // setEditBrokerModal(true);
            // setEditModalData(record);
          }}
        />
      </div>
    ),
  },
];
