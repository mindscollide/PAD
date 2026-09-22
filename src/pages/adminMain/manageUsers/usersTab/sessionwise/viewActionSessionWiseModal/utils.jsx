import ArrowUP from "../../../../../../assets/img/arrow-up-dark.png";
import ArrowDown from "../../../../../../assets/img/arrow-down-dark.png";
import DefaultColumArrow from "../../../../../../assets/img/default-colum-arrow.png";
import style from "./ViewActionSessionWiseModal.module.css";

/**
 * Returns the appropriate sort icon based on current sort state
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
 * Converts API date + GMT time into a timestamp.
 *
 * API:
 * actionDate = "20260917"
 * actionTime = "071430"
 *
 * The API time is GMT/UTC.
 */
const getApiTimestamp = (actionDate, actionTime) => {
  if (!actionDate || !actionTime) return -1;

  const year = actionDate.slice(0, 4);
  const month = actionDate.slice(4, 6);
  const day = actionDate.slice(6, 8);

  const hours = actionTime.slice(0, 2);
  const minutes = actionTime.slice(2, 4);
  const seconds = actionTime.slice(4, 6);

  const date = new Date(
    `${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`
  );

  const timestamp = date.getTime();

  return Number.isNaN(timestamp) ? -1 : timestamp;
};

/**
 * Converts API GMT/UTC date + time into Pakistan time.
 *
 * Example:
 * 20260917 + 071430
 * GMT → 02:14 PM? No:
 * 07:14 AM GMT + 5 = 12:14 PM PKT
 */
const formatApiTime = (actionDate, actionTime) => {
  const timestamp = getApiTimestamp(actionDate, actionTime);

  if (timestamp === -1) return "-";

  return new Date(timestamp).toLocaleTimeString("en-US", {
    timeZone: "Asia/Karachi",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export const getBorderlessTableColumns = ({ sortedInfo }) => [
  {
    // title: withSortIcon("Timestamp", "actionTime", sortedInfo),
    title: "Timestamp",
    dataIndex: "actionTime",
    key: "actionTime",
    width: "240px",

    /**
     * Sort using the complete date + time.
     *
     * This is important because actionTime alone cannot correctly
     * sort records belonging to different dates.
     */
    // sorter: (a, b) => {
    //   const timeA = getApiTimestamp(a?.actionDate, a?.actionTime);
    //   const timeB = getApiTimestamp(b?.actionDate, b?.actionTime);

    //   return timeA - timeB;
    // },

    // sortDirections: ["ascend", "descend"],

    // sortOrder: sortedInfo?.columnKey === "actionTime" ? sortedInfo.order : null,

    // showSorterTooltip: false,
    // sortIcon: () => null,

    /**
     * API gives GMT.
     * Display it as Pakistan local time.
     */
    render: (_, record) => (
      <span className="font-medium">
        {formatApiTime(record?.actionDate, record?.actionTime)}
      </span>
    ),
  },

  {
    // title: withSortIcon("Action Description", "action", sortedInfo),
    title: "Action",
    dataIndex: "action",
    key: "action",
    width: "400px",

    // sorter: (a, b) => (a?.action || "").localeCompare(b?.action || ""),

    // sortDirections: ["ascend", "descend"],

    // sortOrder: sortedInfo?.columnKey === "action" ? sortedInfo.order : null,

    // showSorterTooltip: false,
    // sortIcon: () => null,

    render: (text) => <span className="font-medium">{text}</span>,
  },
];
