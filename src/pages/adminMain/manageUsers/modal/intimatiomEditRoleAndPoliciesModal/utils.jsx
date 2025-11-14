import { Button } from "../../../../../components";
import ArrowUP from "../../../../../assets/img/arrow-up-dark.png";
import ArrowDown from "../../../../../assets/img/arrow-down-dark.png";
import { ArrowsAltOutlined } from "@ant-design/icons";
import styles from "./IntimationEditRoleAndPoliciesModal.module.css";

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

export const intimationEditRoleAndPoliciesTable = ({ sortedInfo }) => [
  {
    title: (
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        Employee ID {getSortIcon("employeeID", sortedInfo)}
      </div>
    ),
    dataIndex: "employeeID",
    key: "employeeID",
    width: "200px",
    sorter: (a, b) => a.employeeID.localeCompare(b.employeeID), // ✅ fixed sorter
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "employeeID" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text, record) => <span className="font-medium">{text}</span>,
  },
  {
    title: (
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        Employee Name {getSortIcon("employeeName", sortedInfo)}
      </div>
    ),
    dataIndex: "employeeName",
    key: "employeeName",
    width: "300px",
    sorter: (a, b) => a.employeeName.localeCompare(b.employeeName),
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "duration" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text) => <span className="font-medium">{text}</span>,
  },
];
