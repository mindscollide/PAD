import { Button } from "../../../../../components";

import ArrowUP from "../../../../../assets/img/arrow-up-dark.png";
import ArrowDown from "../../../../../assets/img/arrow-down-dark.png";
import Trash from "../../../../../assets/img/trash.png";
import { ArrowsAltOutlined } from "@ant-design/icons";
import { Tag, Switch } from "antd";
import styles from "./EditInstrument.module.css";
import StatusColumnTitle from "../../../../../components/dropdowns/filters/statusColumnTitle";

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

export const upcomingClosedPeriodsTable = (sortedInfo, handleDelete) => [
  {
    title: (
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        Start date - End date {getSortIcon("dateRange", sortedInfo)}
      </div>
    ),
    dataIndex: "dateRange",
    key: "dateRange",
    width: "60%",
    sorter: (a, b) => a.start.localeCompare(b.start),
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "dateRange" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text, record) => <span className="font-medium">{text}</span>,
  },
  {
    title: (
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        Duration {getSortIcon("duration", sortedInfo)}
      </div>
    ),
    dataIndex: "duration",
    key: "duration",
    sorter: (a, b) => parseInt(a.duration) - parseInt(b.duration),
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "duration" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text) => <span className="font-medium">{text}</span>,
  },
  {
    title: "",
    key: "action",
    align: "center",
    render: (_, record) => (
      <img
        src={Trash}
        alt="delete"
        className={styles.deleteIcon}
        onClick={() => handleDelete(record.key)}
        style={{ cursor: "pointer" }}
      />
    ),
  },
];

export const previousClosedPeriodsTable = (sortedInfo, handleDelete) => [
  {
    title: (
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        Start date - End date {getSortIcon("dateRange1", sortedInfo)}
      </div>
    ),
    dataIndex: "dateRange1",
    key: "dateRange1",
    sortOrder: sortedInfo?.columnKey === "dateRange1" ? sortedInfo.order : null,
    sorter: (a, b) => a.dateRange1.localeCompare(b.dateRange1),
    sortDirections: ["ascend", "descend"],
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text) => <span className="font-medium">{text}</span>,
  },
  {
    title: (
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        Duration {getSortIcon("duration1", sortedInfo)}
      </div>
    ),
    dataIndex: "duration1",
    key: "duration1",
    render: (text) => <span className="font-medium">{text}</span>,
    sorter: (a, b) => parseInt(a.duration1) - parseInt(b.duration1),
    sortIcon: () => null,
    showSorterTooltip: false,
    sortOrder: sortedInfo?.columnKey === "duration1" ? sortedInfo.order : null,
  },
  {
    title: (
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        Start date - End date {getSortIcon("dateRange2", sortedInfo)}
      </div>
    ),
    dataIndex: "dateRange2",
    key: "dateRange2",
    render: (text) => <span className="font-medium">{text}</span>,
    sorter: (a, b) => a.dateRange2.localeCompare(b.dateRange2),
    sortIcon: () => null,
    showSorterTooltip: false,
    sortOrder: sortedInfo?.columnKey === "dateRange2" ? sortedInfo.order : null,
  },
  {
    title: (
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        Duration {getSortIcon("duration2", sortedInfo)}
      </div>
    ),
    dataIndex: "duration2",
    key: "duration2",
    render: (text) => <span className="font-medium">{text}</span>,
    sorter: (a, b) => parseInt(a.duration2) - parseInt(b.duration2),
    sortIcon: () => null,
    showSorterTooltip: false,
    sortOrder: sortedInfo?.columnKey === "duration2" ? sortedInfo.order : null,
  },
];
