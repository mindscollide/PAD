import { Button } from "../../../components";

import ArrowUP from "../../../assets/img/arrow-up-dark.png";
import ArrowDown from "../../../assets/img/arrow-down-dark.png";
import { ArrowsAltOutlined } from "@ant-design/icons";
import { Tag, Switch, Tooltip } from "antd";
import styles from "./Instruments.module.css";
import StatusColumnTitle from "../../../components/dropdowns/filters/statusColumnTitle";
import { formatApiDateTime, toYYMMDD } from "../../../common/funtions/rejex";
import { mapStatusToIds } from "../../../components/dropdowns/filters/utils";
import DefaultColumArrow from "../../../assets/img/default-colum-arrow.png";
import style from "./Instruments.module.css";
import { withSortIcon } from "../../../common/funtions/tableIcon";

export const buildApiRequest = (searchState = {}) => ({
  InstrumentName: searchState.instrumentName || "",
  StartDate: searchState.startDate ? toYYMMDD(searchState.startDate) : "",
  EndDate: searchState.endDate ? toYYMMDD(searchState.endDate) : "",
  StatusIDs: mapStatusToIds?.(searchState.status, 3) || [],
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
          .filter((v) => v && v !== "-" && v !== "—")
          .join(" ") || null,
      closedPeriodEndDate:
        [item?.closedPeriodEndDate, item?.closedPeriodEndTime]
          .filter((v) => v && v !== "-" && v !== "—")
          .join(" ") || null,
      status: item.status || 0,
      timeRemainingToTrade: item.timeRemainingToTrade || "",
    };
  });
};

export const getInstrumentTableColumns = ({
  adminIntrgetInstrumentTableColumnsumentListSearch,
  adminIntrumentListSearch,
  setAdminIntrumentListSearch,
  sortedInfo,
  onStatusChange,
  //For Upcoming Closing Period
  onEditUpcomingClosing,
  // For Previous Closing Period
  onEditPreviousClosing,
  setEditInstrumentModal,
  setEditModalData,
  setSelectedInstrumentOnClick,
  setSelectedInstrumentNameDataOnClick,
}) => [
  {
    title: withSortIcon("Instrument", "instrument", sortedInfo),
    dataIndex: "instrument",
    key: "instrument",
    align: "left",
    width: 400,
    ellipsis: true,
    sorter: (a, b) => a.instrument.localeCompare(b.instrument),
    sortIcon: () => null,
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "instrument" ? sortedInfo.order : null,
    render: (text, record) => (
      <Tooltip title={text}>
        <div
          style={{
            maxWidth: "380px", // 🔴 important
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <span
            className={`font-medium ${
              !record.status ? styles.inActiveColumnTexts : ""
            }`}
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {text}
          </span>
        </div>
      </Tooltip>
    ),
  },
  {
    title: (
      <StatusColumnTitle
        state={adminIntrumentListSearch}
        setState={setAdminIntrumentListSearch}
      />
    ),
    width: 150,
    dataIndex: "status",
    key: "status",
    render: (status, record) => {
      const isActive = status === 1;
      console.log("isActive", isActive);
      return (
        <div className={styles.SwitchMainDiv}>
          <Switch
            checked={isActive}
            onChange={(value) => onStatusChange(record.instrumentID, value)}
            className={`${styles.switchBase} ${
              isActive ? styles.switchbackground : styles.unSwitchBackground
            }`}
          />
          <span className={isActive ? styles.activeText : styles.InActiveText}>
            {isActive ? "Active" : "In Active"}
          </span>
        </div>
      );
    },
  },
  {
    title: withSortIcon(
      "Closed Period Start Date",
      "closedPeriodStartDate",
      sortedInfo,
      "center",
    ),
    dataIndex: "closedPeriodStartDate",
    key: "closedPeriodStartDate",
    width: 150,
    align: "center",
    ellipsis: true,
    sorter: (a, b) =>
      formatApiDateTime(a.closedPeriodStartDate).localeCompare(
        formatApiDateTime(b.closedPeriodStartDate),
      ),

    sortOrder:
      sortedInfo?.columnKey === "closedPeriodStartDate"
        ? sortedInfo.order
        : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (date, record) => (
      <span className={!record.status ? styles.inActiveColumnTexts : ""}>
        {date ? formatApiDateTime(date) : "—"}
      </span>
    ),
  },
  {
    title: withSortIcon(
      " Closed Period End Date",
      "closedPeriodEndDate",
      sortedInfo,
      "center",
    ),
    dataIndex: "closedPeriodEndDate",
    key: "closedPeriodEndDate",
    width: 150,
    align: "center",
    ellipsis: true,
    sorter: (a, b) =>
      formatApiDateTime(a.closedPeriodEndDate).localeCompare(
        formatApiDateTime(b.closedPeriodEndDate),
      ),

    sortOrder:
      sortedInfo?.columnKey === "closedPeriodEndDate" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (date, record) => (
      <span
        className={!record.status ? styles.inActiveColumnTexts : ""}
        style={{ textAlign: "center" }}
      >
        {date ? formatApiDateTime(date) : "—"}
      </span>
    ),
  },
  {
    title: "",
    key: "action",
    align: "right",
    width: 150,
    render: (record) => {
      return (
        <Button
          className="Edit-small-dark-button"
          text="Edit Closed Period Date"
          onClick={() => {
            //For Previous CLosing Period
            onEditUpcomingClosing(record.instrumentID);
            //For Upcoming Closing Period
            onEditPreviousClosing(record.instrumentID);
            setEditInstrumentModal(true);
            setSelectedInstrumentOnClick(record.instrumentID);
            setSelectedInstrumentNameDataOnClick(record.instrument);
          }}
        />
      );
    },
  },
];
