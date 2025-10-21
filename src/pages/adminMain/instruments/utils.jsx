import { Button } from "../../../components";

import ArrowUP from "../../../assets/img/arrow-up-dark.png";
import ArrowDown from "../../../assets/img/arrow-down-dark.png";
import { ArrowsAltOutlined } from "@ant-design/icons";
import { Tag, Switch } from "antd";
import styles from "./Instruments.module.css";
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
export const getInstrumentTableColumns = (
  sortedInfo,
  onStatusChange,
  setEditInstrumentModal
) => [
  {
    title: (
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        Instrument {getSortIcon("instrumentId", sortedInfo)}
      </div>
    ),
    dataIndex: "instrument",
    key: "instrument",
    ellipsis: true,
    sorter: (a, b) => a.instrument.localeCompare(b.instrument),
    sortIcon: () => null,
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "instrument" ? sortedInfo.order : null,
    render: (text, record) => (
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span
          className={`font-medium ${
            !record.status ? styles.inActiveColumnTexts : ""
          }`}
        >
          {text}
        </span>
      </div>
    ),
  },
  {
    title: <StatusColumnTitle state={""} setState={""} />,
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
        Closed Period Start Date {getSortIcon("startDate", sortedInfo)}
      </div>
    ),
    dataIndex: "startDate",
    key: "startDate",
    width: "15%",
    align: "center",
    sortIcon: () => null,
    ellipsis: true,
    sorter: (a, b) => new Date(a.startDate) - new Date(b.startDate),
    sortOrder: sortedInfo?.columnKey === "startDate" ? sortedInfo.order : null,
    showSorterTooltip: false,
    render: (date, record) => (
      <span className={!record.status ? styles.inActiveColumnTexts : ""}>
        {date || "-"}
      </span>
    ),
  },
  {
    title: (
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        Closed Period End Date {getSortIcon("endDate", sortedInfo)}
      </div>
    ),
    dataIndex: "endDate",
    key: "endDate",
    width: "15%",
    align: "center",
    sortIcon: () => null,
    ellipsis: true,
    sorter: (a, b) => new Date(a.endDate) - new Date(b.endDate),
    sortOrder: sortedInfo?.columnKey === "endDate" ? sortedInfo.order : null,
    showSorterTooltip: false,
    render: (date, record) => (
      <span className={!record.status ? styles.inActiveColumnTexts : ""}>
        {date || "-"}
      </span>
    ),
  },
  {
    title: "",
    key: "action",
    align: "right",
    render: (_, record) => (
      <Button
        className="Edit-small-dark-button"
        text="Edit Closed Period Date"
        onClick={() => setEditInstrumentModal(true)}
      />
    ),
  },
];
