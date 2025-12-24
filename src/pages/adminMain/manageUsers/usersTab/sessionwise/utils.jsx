import { Button } from "../../../../../components";

import ArrowUP from "../../../../../assets/img/arrow-up-dark.png";
import ArrowDown from "../../../../../assets/img/arrow-down-dark.png";
import DefaultColumArrow from "../../../../../assets/img/default-colum-arrow.png";
import TypeColumnTitle from "../../../../../components/dropdowns/filters/typeColumnTitle";
import StatusColumnTitle from "../../../../../components/dropdowns/filters/statusColumnTitle";
import { Tag, Tooltip } from "antd";
import style from "./sessionWise.module.css";

import {
  dashBetweenApprovalAssets,
  formatApiDateTime,
  toYYMMDD,
} from "../../../../../common/funtions/rejex";
import {
  mapBuySellToIds,
  mapStatusToIds,
} from "../../../../../components/dropdowns/filters/utils";
import { getTradeTypeById } from "../../../../../common/funtions/type";

/**
 * Utility: Build API request payload for approval listing
 *
 * @param {Object} searchState - Current search/filter state
 * @param {Object} assetTypeListingData - Extra request metadata (optional)
 * @returns {Object} API-ready payload
 */
export const buildApiRequest = (searchState) => ({
  EmployeeID: Number(searchState.employeeID) || 0,
  IPAddress: searchState.ipAddress || "",

  StartDate: searchState.startDate ? toYYMMDD(searchState.startDate) : "",
  EndDate: searchState.endDate ? toYYMMDD(searchState.endDate) : "",

  PageNumber: Number(searchState.pageNumber) || 0,
  Length: Number(searchState.pageSize) || 10,
});

/**
 * Maps employee transaction data into a UI-friendly format
 *
 * @param {Object} getEmployeeTransactionReport - API response containing transactions
 * @returns {Array} Mapped transaction list
 */
export const mappingData = (data = []) => {
  const records = Array.isArray(data) ? data : data?.records || [];

  if (!records.length) return [];

  return records.map((item) => ({
    key: item.sessionID, // unique key

    sessionID: item.sessionID || "",
    ipAddress: item.ipAddress || "",

    loginDateTime:
      `${item.loginDate || ""} ${item.loginTime || ""}`.trim() || "—",

    logoutDateTime:
      `${item.logoutDate || ""} ${item.logoutTime || ""}`.trim() || "—",

    totalActions: item.totalActions || 0,

    viewActionsButton: item.viewActionsButton || "",
  }));
};

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

export const getBorderlessTableColumns = ({
  sortedInfo,
  handleViewActionModal,
}) => [
  {
    title: (
      <span className={style.tableHeadingSpace}>
        {withSortIcon("IP Address", "ipAddress", sortedInfo)}
      </span>
    ),
    dataIndex: "ipAddress",
    key: "ipAddress",
    width: 300,
    ellipsis: true,
    sorter: (a, b) => a.ipAddress.localeCompare(b.ipAddress),
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "ipAddress" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text) => <span className="font-medium">{text}</span>,
  },

  {
    title: (
      <span className={style.tableHeadingSpace}>
        {withSortIcon("Login Date & Time", "loginDateTime", sortedInfo)}
      </span>
    ),
    dataIndex: "loginDateTime",
    key: "loginDateTime",
    ellipsis: true,
    width: 300,
    sorter: (a, b) =>
      new Date(a.loginDateTime).getTime() - new Date(b.loginDateTime).getTime(),
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "loginDateTime" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text) => (
      <span className="font-medium">{formatApiDateTime(text)}</span>
    ),
  },

  {
    title: withSortIcon("Total Actions", "totalActions", sortedInfo),
    dataIndex: "totalActions",
    key: "totalActions",
    width: 300,
    align: "left",
    ellipsis: true,
    sorter: (a, b) => a.totalActions - b.totalActions,
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "totalActions" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (q) => <span className="font-medium">{q}</span>,
  },
  {
    title: withSortIcon("Logout Date & Time", "logoutDateTime", sortedInfo),
    dataIndex: "logoutDateTime",
    key: "logoutDateTime",
    ellipsis: true,
    width:300,
    sorter: (a, b) =>
      new Date(a.logoutDateTime).getTime() -
      new Date(b.logoutDateTime).getTime(),
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "logoutDateTime" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text) => (
      <span className="font-medium text-gray-600">
        {text ? formatApiDateTime(text) : "—"}
      </span>
    ),
  },

  {
    title: "",
    key: "action",
    align: "right",
    render: (_, record) => (
      <div>
        <Button
          className="small-light-button"
          text={"View Actions"}
          onClick={() => {
            handleViewActionModal(record)
          }}
        />
      </div>
    ),
  },
];
