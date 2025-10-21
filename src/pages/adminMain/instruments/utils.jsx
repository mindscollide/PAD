import { Button } from "../../../components";

import ArrowUP from "../../../assets/img/arrow-up-dark.png";
import ArrowDown from "../../../assets/img/arrow-down-dark.png";
import { ArrowsAltOutlined } from "@ant-design/icons";
import { Tag, Switch } from "antd";
import styles from "./Instruments.module.css";
import StatusColumnTitle from "../../../components/dropdowns/filters/statusColumnTitle";
import { formatApiDateTime, toYYMMDD } from "../../../common/funtions/rejex";
import { mapStatusToIds } from "../../../components/dropdowns/filters/utils";
import DefaultColumArrow from "../../../assets/img/default-colum-arrow.png";

export const buildApiRequest = (searchState = {}) => ({
  InstrumentName: searchState.instrumentName || "",
  StartDate: searchState.startDate ? toYYMMDD(searchState.startDate) : "",
  EndDate: searchState.endDate ? toYYMMDD(searchState.endDate) : "",
  StatusIds: mapStatusToIds?.(searchState.status) || [],
  PageNumber: Number(searchState.pageNumber) || 0,
  Length: Number(searchState.pageSize) || 10,
});

export const mapAdminInstrumentListData = (adminInstruments = []) => {
  const instruments = Array.isArray(adminInstruments)
    ? adminInstruments
    : adminInstruments?.instruments || [];

  if (!instruments.length) return [];

  // Keep track of used keys to avoid duplicates
  const usedKeys = new Set();

  return instruments.map((item) => {
    let key;
    do {
      // Generate a unique key using instrumentID + random 6-digit number
      const randomPart = Math.floor(100000 + Math.random() * 900000);
      key = `${item.instrumentID}_${randomPart}`;
    } while (usedKeys.has(key)); // regenerate if duplicate found

    usedKeys.add(key);

    return {
      key,
      instrumentID: item?.instrumentID,
      instrument: item?.instrument,
      closedPeriodStartDate:
        [item?.closedPeriodStartDate, item?.closedPeriodStartTime]
          .filter(Boolean)
          .join(" ") || "—",
      closedPeriodEndDate:
        [item?.closedPeriodEndDate, item?.closedPeriodEndTime]
          .filter(Boolean)
          .join(" ") || "—",
      status: item.status || 0,
      timeRemainingToTrade: item.timeRemainingToTrade || "",
    };
  });
};

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

export const getInstrumentTableColumns = (
  adminIntrumentListSearch,
  setAdminIntrumentListSearch,
  sortedInfo,
  onStatusChange,
  setEditInstrumentModal,
  setEditModalData
) => [
  {
    title: (
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        Instrument {getSortIcon("instrument", sortedInfo)}
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
    title: (
      <StatusColumnTitle
        state={adminIntrumentListSearch}
        setState={setAdminIntrumentListSearch}
      />
    ),
    dataIndex: "status",
    key: "status",
    render: (status, record) => {
      const isActive = status === 1;
      console.log("isActive", isActive);
      return (
        <div className={styles.SwitchMainDiv}>
          <Switch
            checked={isActive}
            onChange={(value) =>
              console.log("isActive", record.instrumentID, value)
            }
            onChange={(value) => onStatusChange(record.instrumentID, value)}
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
        Closed Period Start Date{" "}
        {getSortIcon("closedPeriodStartDate", sortedInfo)}
      </div>
    ),
    dataIndex: "closedPeriodStartDate",
    key: "closedPeriodStartDate",
    width: "15%",
    align: "center",
    ellipsis: true,
    sorter: (a, b) =>
      formatApiDateTime(a.closedPeriodStartDate).localeCompare(
        formatApiDateTime(b.closedPeriodStartDate)
      ),

    sortOrder:
      sortedInfo?.columnKey === "closedPeriodStartDate"
        ? sortedInfo.order
        : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (date, record) => (
      <span className={!record.status ? styles.inActiveColumnTexts : ""}>
        {formatApiDateTime(date)}
      </span>
    ),
  },
  {
    title: (
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        Closed Period End Date {getSortIcon("closedPeriodEndDate", sortedInfo)}
      </div>
    ),
    dataIndex: "closedPeriodEndDate",
    key: "closedPeriodEndDate",
    width: "15%",
    align: "center",
    ellipsis: true,
    sorter: (a, b) =>
      formatApiDateTime(a.closedPeriodEndDate).localeCompare(
        formatApiDateTime(b.closedPeriodEndDate)
      ),

    sortOrder:
      sortedInfo?.columnKey === "closedPeriodEndDate" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (date, record) => (
      <span className={!record.status ? styles.inActiveColumnTexts : ""}>
        {formatApiDateTime(date)}
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
