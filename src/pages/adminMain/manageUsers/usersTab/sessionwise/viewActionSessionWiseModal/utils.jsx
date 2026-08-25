import ArrowUP from "../../../../../../assets/img/arrow-up-dark.png";
import ArrowDown from "../../../../../../assets/img/arrow-down-dark.png";
import DefaultColumArrow from "../../../../../../assets/img/default-colum-arrow.png";
import style from "./ViewActionSessionWiseModal.module.css";

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
      <img
        draggable={false}
        src={ArrowDown}
        alt="Asc"
        className="custom-sort-icon"
      />
    ) : (
      <img
        draggable={false}
        src={ArrowUP}
        alt="Desc"
        className="custom-sort-icon"
      />
    );
  }
  return (
    <img
      draggable={false}
      src={DefaultColumArrow}
      alt="Default"
      className="custom-sort-icon"
    />
  );
};

// Helper for consistent column titles
const withSortIcon = (label, columnKey, sortedInfo) => (
  <div className={style["table-header-wrapper"]}>
    <span className={style["table-header-text"]}>{label}</span>
    <span className={style["table-header-icon"]}>
      {getSortIcon(columnKey, sortedInfo)}
    </span>
  </div>
);

/**
 * Converts a backend action time-of-day string into minutes since midnight,
 * for sorting. Backend format is DATE_FORMAT(..., '%h:%i %p') → "04:44 PM".
 * Returns -1 for anything unparseable so blank/malformed rows sink to the
 * bottom rather than scrambling the order.
 *
 * @param {string} timeStamp - e.g. "04:44 PM"
 * @returns {number} minutes since midnight, or -1
 */
const toMinutesOfDay = (timeStamp) => {
  const match = String(timeStamp || "")
    .trim()
    .match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return -1;

  let hours = Number(match[1]) % 12;
  const minutes = Number(match[2]);
  if (match[3].toUpperCase() === "PM") hours += 12;

  return hours * 60 + minutes;
};

// SRS ("User Activity Report" > View Actions modal) specifies three detail
// columns: Action Date, Action Time, Action Description.
//
// "Action Date" is NOT rendered here because the backend does not return it:
// sp_GetUserSessionWiseActivityActions formats its ActionTime column as
// DATE_FORMAT(AL.Timestamp, '%h:%i %p') - time-of-day only, no date part -
// and UserSessionActivtyAuditActions (AdminModel.cs) carries only
// { TimeStamp, Action }. Adding an "Action Date" column now would render an
// permanently empty column. Flagged for the backend pass; once the SP also
// returns the date part, add the column here.
export const getBorderlessTableColumns = ({ sortedInfo }) => [
  {
    // RENAMED (SRS): was "Time Stamp". The underlying value is a
    // time-of-day string ("04:44 PM"), so "Action Time" is both the SRS
    // wording and the more accurate label.
    title: "Action Time",
    dataIndex: "timeStamp",
    key: "timeStamp",
    width: "240px",
    ellipsis: true,
    // FIXED: was `new Date(a.timeStamp).getTime()` - the value is a bare
    // time-of-day string ("04:44 PM"), not a parseable date, so every row
    // produced NaN and the sort silently did nothing. Compared as a
    // 24-hour-normalised value instead so AM/PM orders correctly (a plain
    // string compare would put "12:30 AM" after "04:44 AM").
    sorter: (a, b) => toMinutesOfDay(a?.timeStamp) - toMinutesOfDay(b?.timeStamp),
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "timeStamp" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text) => <span className="font-medium">{text}</span>,
  },
  {
    // RENAMED (SRS): was "Action".
    title: "Action Description",
    dataIndex: "action",
    key: "action",
    ellipsis: true,
    // FIXED: was `a.action - b.action` - a numeric subtraction on a
    // free-text description, which is always NaN, so this sort never
    // worked either.
    sorter: (a, b) => (a?.action || "").localeCompare(b?.action || ""),
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "action" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (q) => <span className="font-medium">{q}</span>,
  },
];
