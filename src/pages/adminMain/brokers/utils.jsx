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
export const getBrokerTableColumns = (sortedInfo) => [
  {
    title: (
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        Broker Name {getSortIcon("transactionId", sortedInfo)}
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
        state={""}
        setState={""}
      />
    ),
    dataIndex: "status",
    key: "status",
    render: (status, record) => (
      <div className={styles.SwitchMainDiv}>
        <Switch
          checked={status}
          onChange={(value) => onStatusChange(record.key, value)}
          className={`${styles.switchBase} ${
            status ? styles.switchbackground : styles.unSwitchBackground
          }`}
        />
        <span className={status ? styles.activeText : styles.InActiveText}>
          {status ? "Active" : "Inactive"}
        </span>
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
    render: (_, record) => (
      <Button className="Edit-small-dark-button" text={"Edit"} />
    ),
  },
];
