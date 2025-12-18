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

export const getBorderlessTableColumns = ({ sortedInfo }) => [
  // {
  //   title: "Date",
  //   dataIndex: "date",
  //   width: "190px",
  //   key: "date",
  //   ellipsis: true,
  //   sorter: (a, b) => a.date.localeCompare(b.date),
  //   sortDirections: ["ascend", "descend"],
  //   sortOrder: sortedInfo?.columnKey === "date" ? sortedInfo.order : null,
  //   showSorterTooltip: false,
  //   sortIcon: () => null,
  //   render: (text) => <span className="font-medium">{text}</span>,
  // },
  {
    title: "Time Stamp",
    dataIndex: "timeStamp",
    key: "timeStamp",
    width: "240px",
    ellipsis: true,
    sorter: (a, b) =>
      new Date(a.timeStamp).getTime() - new Date(b.timeStamp).getTime(),
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "timeStamp" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text) => <span className="font-medium">{text}</span>,
  },
  {
    title: "Action",
    dataIndex: "action",
    key: "action",
    ellipsis: true,
    sorter: (a, b) => a.action - b.action,
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "action" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (q) => <span className="font-medium">{q}</span>,
  },
];
