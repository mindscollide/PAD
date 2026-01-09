import ArrowUP from "../../../../../assets/img/arrow-up-dark.png";
import ArrowDown from "../../../../../assets/img/arrow-down-dark.png";
import DefaultColumArrow from "../../../../../assets/img/default-colum-arrow.png";
import style from "./HTATAT.module.css";

import {
  formatApiDateTime,
  toYYMMDD,
} from "../../../../../common/funtions/rejex";
import { getTradeTypeById } from "../../../../../common/funtions/type";
import TypeColumnTitle from "../../../../../components/dropdowns/filters/typeColumnTitle";
import { Button } from "../../../../../components";

/**
 * Utility: Build API request payload for approval listing
 *
 * @param {Object} searchState - Current search/filter state
 * @param {Object} assetTypeListingData - Extra request metadata (optional)
 * @returns {Object} API-ready payload
 */
export const buildApiRequest = (searchState = {}) => ({
  EmployeeName: searchState.employeeName || "",
  DepartmentName: searchState.departmentName || "",
  PageNumber: Number(searchState.pageNumber) || 0,
  Length: Number(searchState.pageSize) || 10,
});

/**
 * Maps employee transaction data into a UI-friendly format
 *
 * @param {Object} getEmployeeTransactionReport - API response containing transactions
 * @returns {Array} Mapped transaction list
 */
export const mapListData = (
  assetTypeData,
  myTradeApprovalLineManagerData = []
) => {
  const records = Array.isArray(myTradeApprovalLineManagerData)
    ? myTradeApprovalLineManagerData
    : myTradeApprovalLineManagerData?.records || [];

  if (!records.length) return [];
  console.log(records, "departmentdepartment");
  return records.map((item) => ({
    key: item.userID,
    employeeID: item.employeeID,
    employeeName: item.employeeName || "",
    departmentName: item.department || "",
    quantity: item.quantity || 0,
    totalRequests: item.totalRequests || 0,
    totalTurnAroundDays: item.totalTurnAroundDays || 0,
    requestDateTime:
      `${item?.requestDate || ""} ${item?.requestTime || ""}`.trim() || "—",
    resubmitted: item.resubmitted || 0,
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
  approvalStatusMap,
  sortedInfo,
  htaPolicyBreachesReportSearch,
  setHTAPolicyBreachesReportSearch,
  setSelectedEmployee,
  setPolicyModalVisible,
  setShowViewDetailPageInTatOnHta,
  setShowSelectedTatDataOnViewDetailHTA,
}) => [
  {
    title: (
      <div style={{ marginLeft: "8px" }}>
        {withSortIcon("Employee ID", "employeeID", sortedInfo)}
      </div>
    ),
    dataIndex: "employeeID",
    key: "employeeID",
    width: "140px",
    ellipsis: true,
    sorter: (a, b) => a.employeeID - b.employeeID,
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "employeeID" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (employeeID) => {
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginLeft: "8px",
          }}
        >
          <span className="font-medium">{employeeID}</span>
        </div>
      );
    },
  },
  {
    title: withSortIcon("Employee Name", "employeeName", sortedInfo),
    dataIndex: "employeeName",
    key: "employeeName",
    ellipsis: true,
    width: "140px",
    sorter: (a, b) => a.employeeName.localeCompare(b.employeeName),
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "employeeName" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text, record) => {
      return (
        <div id={`cell-${record.key}-employeeName`}>
          <span className="font-medium">{text}</span>
        </div>
      );
    },
  },
  {
    title: withSortIcon("Department", "departmentName", sortedInfo),
    dataIndex: "departmentName",
    key: "departmentName",
    ellipsis: true,
    width: "140px",
    sorter: (a, b) => a.departmentName - b.departmentName,
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "departmentName" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text, record) => {
      return (
        <div id={`cell-${record.key}-departmentName`}>
          <span className="font-medium">{text}</span>
        </div>
      );
    },
  },
  {
    title: withSortIcon("Request Count", "totalRequests", sortedInfo),
    dataIndex: "totalRequests",
    key: "totalRequests",
    width: "140px",
    ellipsis: true,
    sorter: (a, b) => a.totalRequests - b.totalRequests,
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "totalRequests" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text, record) => (
      <span
        className={`${style["cell-text"]} font-medium cursor-pointer text-primary`}
      >
        {text}
      </span>
    ),
  },
  {
    title: withSortIcon(
      "Avg turn around time",
      "totalTurnAroundDays",
      sortedInfo
    ),
    dataIndex: "totalTurnAroundDays",
    key: "totalTurnAroundDays",
    width: "140px",
    ellipsis: true,
    sorter: (a, b) =>
      Number(a.totalTurnAroundDays || 0) - Number(b.totalTurnAroundDays || 0),
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "totalTurnAroundDays" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text) => (
      <span className={`${style["cell-text"]} font-medium`}>
        {text !== null && text !== undefined
          ? Number(text).toLocaleString("en-US")
          : "-"}
      </span>
    ),
  },
  {
    title: "",
    key: "actions",
    align: "right",
    width: "100px",
    render: (record) => {
      console.log(record, "showSelectedTatDataOnViewDetailHTA");
      //Global State to selected data to show in ViewDetailLineManagerModal Statuses
      return (
        <>
          <div
            id={`cell-${record.key}-actions`}
            style={{
              display: "flex",
              alignItems: "center",
              marginRight: "10px",
            }}
          >
            <Button
              className="view-large-transparent-button"
              text="View Details"
              onClick={() => {
                setShowViewDetailPageInTatOnHta(true);
                setShowSelectedTatDataOnViewDetailHTA(record);
              }}
            />
          </div>
        </>
      );
    },
  },
];
