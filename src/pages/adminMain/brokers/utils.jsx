import { Button } from "../../../components";

import ArrowUP from "../../../assets/img/arrow-up-dark.png";
import ArrowDown from "../../../assets/img/arrow-down-dark.png";
import { ArrowsAltOutlined } from "@ant-design/icons";
import { Tag, Switch } from "antd";
import styles from "./Broker.module.css";
import StatusColumnTitle from "../../../components/dropdowns/filters/statusColumnTitle";

// import TypeColumnTitle from "./typeFilter";

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
      <img src={ArrowDown} alt="Asc" className="custom-sort-icon" />
    ) : (
      <img src={ArrowUP} alt="Desc" className="custom-sort-icon" />
    );
  }
  return <ArrowsAltOutlined className="custom-sort-icon" />;
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
  PageNumber: Number(searchState.pageNumber) || 0,
  Length: Number(searchState.pageSize) || 10,
});

export const getBrokerTableColumns = (
  sortedInfo,
  adminBrokerSearch,
  setAdminBrokerSearch,
  setEditBrokerModal,
  setEditModalData
) => [
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
      <StatusColumnTitle
        state={adminBrokerSearch}
        setState={setAdminBrokerSearch}
      />
    ),
    dataIndex: "status",
    key: "status",
    render: (status, record) => {
      console.log(record, "recordrecord");
      const isActive = record.brokerStatus === "Active";
      return (
        <div className={styles.SwitchMainDiv}>
          <Switch
            checked={isActive}
            onChange={(value) => onStatusChange(record.brokerID, value)}
            className={`${styles.switchBase} ${
              isActive ? styles.switchbackground : styles.unSwitchBackground
            }`}
          />
          <span className={isActive ? styles.activeText : styles.InActiveText}>
            {isActive ? "Active" : "Inactive"}
          </span>
        </div>
      );
    },
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
            setEditBrokerModal(true);
            setEditModalData(record);
          }}
        />
      </div>
    ),
  },
];
