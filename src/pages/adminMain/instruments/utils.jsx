import { Button } from "../../../components";

import { Switch, Tooltip } from "antd";
import styles from "./Instruments.module.css";
import StatusColumnTitle from "../../../components/dropdowns/filters/statusColumnTitle";
import {
  formatApiDateTime,
  formatShowOnlyDateForDateRange,
  toYYMMDD,
} from "../../../common/funtions/rejex";
import { mapStatusToIds } from "../../../components/dropdowns/filters/utils";
import DefaultColumArrow from "../../../assets/img/default-colum-arrow.png";
import { withSortIcon } from "../../../common/funtions/tableIcon";

export const buildApiRequest = (searchState = {}) => ({
  InstrumentName: searchState.instrumentName || "",
  StartDate: searchState.startDate ? toYYMMDD(searchState.startDate) : "",
  EndDate: searchState.endDate ? toYYMMDD(searchState.endDate) : "",
  StatusIDs: mapStatusToIds?.(searchState.status, 3) || [],
  PageNumber: Number(searchState.pageNumber) || 0,
  Length: Number(searchState.pageSize) || 10,
});

// "COTT - (Colony) Thal Textile Mills Limited" from the nested instrument
// object; tolerates the old plain-string shape too.
const buildInstrumentLabel = (instrument) => {
  if (!instrument) return "";
  if (typeof instrument === "string") return instrument;
  const { instrumentCode, instrumentName } = instrument;
  return [instrumentCode, instrumentName].filter(Boolean).join(" - ");
};

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
      // CHANGED (API_Changes/2026-09-25_get_instruments_with_closing_period_
      // instrument_object_and_sort.md): `instrument` is now an object
      // {instrumentID, instrumentName, instrumentCode}, not the old
      // "CODE - Name" string. The column, its sorter and the Edit modal
      // (which splits on " - " for its title) all still read the string, so
      // rebuild that text here; the parts are kept alongside.
      instrument: buildInstrumentLabel(item?.instrument),
      instrumentCode: item?.instrument?.instrumentCode || "",
      instrumentName: item?.instrument?.instrumentName || "",
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
  adminIntrumentListSearch,
  setAdminIntrumentListSearch,
  sortedInfo,
  onStatusChange,
  //For Upcoming Closing Period
  onEditUpcomingClosing,
  // For Previous Closing Period
  onEditPreviousClosing,
  setEditInstrumentModal,
  setSelectedInstrumentOnClick,
  setSelectedInstrumentNameDataOnClick,
}) => [
  {
    // Same cell as the employee My Approvals Instrument column: asset badge +
    // short code, full "CODE - Name" in the tooltip. This API has no
    // per-row asset type, so the badge falls back to "EQ" (same fallback as
    // Admin Transactions Summary).
    title: withSortIcon("Instrument", "instrumentCode", sortedInfo),
    dataIndex: "instrumentCode",
    key: "instrumentCode",
    align: "left",
    width: 390,
    ellipsis: true,
    sorter: (a, b) =>
      (a?.instrumentCode || "").localeCompare(b?.instrumentCode || ""),
    sortIcon: () => null,
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "instrumentCode" ? sortedInfo.order : null,
    showSorterTooltip: false,
    render: (_, record) => {
      const code = record?.instrumentCode || "—";
      const name = record?.instrumentName || "—";
      return (
        <div
          id={`cell-${record.key}-instrumentCode`}
          className={!record.status ? styles.inActiveColumnTexts : ""}
          style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}
        >
          <span
            className="custom-shortCode-asset"
            style={{
              minWidth: 32,
              flexShrink: 0,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            data-testid="asset-code"
          >
            EQ
          </span>
          <Tooltip
            title={`${code} - ${name}`}
            placement="topLeft"
            overlayStyle={{ maxWidth: "300px" }}
          >
            <span
              className="font-medium"
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                minWidth: 0,
                flex: 1,
                cursor: "pointer",
              }}
              data-testid="instrument-code"
            >
              {code}
            </span>
          </Tooltip>
        </div>
      );
    },

    // render: (text) => (
    //   <Tooltip title={text}>
    //     <span
    //       style={{
    //         display: "block",
    //         maxWidth: 300,
    //         overflow: "hidden",
    //         whiteSpace: "nowrap",
    //         textOverflow: "ellipsis",
    //       }}
    //     >
    //       {text}
    //     </span>
    //   </Tooltip>
    // ),
  },
  {
    title: (
      <StatusColumnTitle
        state={adminIntrumentListSearch}
        setState={setAdminIntrumentListSearch}
      />
    ),
    width: 130,
    dataIndex: "status",
    key: "status",
    render: (status, record) => {
      const isActive = status === 1;
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
      "center"
    ),
    dataIndex: "closedPeriodStartDate",
    key: "closedPeriodStartDate",
    width: 150,
    align: "center",
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
        {/* FIXED (2026-08-11): was formatShowOnlyDate, which only looks at
            the date portion and silently drops the time - same bug already
            fixed once for the Edit modal's own closing-period tables (see
            formatShowOnlyDateForDateRange). closedPeriodStartDate here is
            the combined "YYYYMMDD HHmmss" string (date+time joined in
            mapAdminInstrumentListData below), so this now does the same
            real UTC->local conversion instead of a naive date-only read. */}
        {date ? formatShowOnlyDateForDateRange(date) : "—"}
      </span>
    ),
  },
  {
    title: withSortIcon(
      " Closed Period End Date",
      "closedPeriodEndDate",
      sortedInfo,
      "center"
    ),
    dataIndex: "closedPeriodEndDate",
    key: "closedPeriodEndDate",
    width: 150,
    align: "center",
    // ellipsis: true,
    sorter: (a, b) =>
      formatApiDateTime(a.closedPeriodEndDate).localeCompare(
        formatApiDateTime(b.closedPeriodEndDate)
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
        {date ? formatShowOnlyDateForDateRange(date) : "—"}
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
