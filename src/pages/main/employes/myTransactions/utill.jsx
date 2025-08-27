import { Button } from "../../../../components";

import ArrowUP from "../../../../assets/img/arrow-up-dark.png";
import ArrowDown from "../../../../assets/img/arrow-down-dark.png";
import DefaultColumArrow from "../../../../assets/img/default-colum-arrow.png";
import TypeColumnTitle from "../../../../components/dropdowns/filters/typeColumnTitle";
import StatusColumnTitle from "../../../../components/dropdowns/filters/statusColumnTitle";
import { Tag } from "antd";

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
    <img src={DefaultColumArrow} alt="Default" className="custom-sort-icon" />
  );
};
export const getBorderlessTableColumns = (
  approvalStatusMap,
  sortedInfo,
  employeeMyTransactionSearch,
  setEmployeeMyTransactionSearch
) => [
  {
    title: (
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        Transaction ID {getSortIcon("transactionId", sortedInfo)}
      </div>
    ),
    dataIndex: "transactionId",
    key: "transactionId",
    width: "12%",
    ellipsis: true,
    sorter: (a, b) => a.transactionId.localeCompare(b.transactionId),
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "transactionId" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text) => (
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span className="font-medium">{text}</span>
      </div>
    ),
  },
  {
    title: (
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        Instrument {getSortIcon("instrument", sortedInfo)}
      </div>
    ),
    dataIndex: "instrument",
    key: "instrument",
    width: "12%",
    ellipsis: true,
    sorter: (a, b) => a.instrument.localeCompare(b.instrument),
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "instrument" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text) => (
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span
          className="border-less-table-orange-instrumentBadge"
          style={{ minWidth: 30 }}
        >
          {text.split("-")[0].substring(0, 2).toUpperCase()}
        </span>
        <span className="font-medium">{text}</span>
      </div>
    ),
  },
  {
    title: (
      <TypeColumnTitle
        state={employeeMyTransactionSearch}
        setState={setEmployeeMyTransactionSearch}
      />
    ),
    dataIndex: "type",
    key: "type",
    ellipsis: true,
    width: "10%",
    filteredValue: employeeMyTransactionSearch?.type?.length
      ? employeeMyTransactionSearch?.type
      : null,
    onFilter: () => true,
    render: (type) => (
      <span className={type === "Buy" ? "text-green-600" : "text-red-600"}>
        {type}
      </span>
    ),
  },
  {
    title: (
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        Transaction Date & Time {getSortIcon("transactionDate", sortedInfo)}
      </div>
    ),
    dataIndex: "transactionDate",
    key: "transactionDate",
    ellipsis: true,
    width: "20%",
    sorter: (a, b) => a.transactionDate.localeCompare(b.transactionDate),
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "transactionDate" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (date) => <span className="text-gray-600">{date}</span>,
  },
  {
    title: (
      <StatusColumnTitle
        state={employeeMyTransactionSearch}
        setState={setEmployeeMyTransactionSearch}
      />
    ),
    dataIndex: "status",
    key: "status",
    ellipsis: true,
    width: "10%",
    filteredValue: employeeMyTransactionSearch.status?.length
      ? employeeMyTransactionSearch.status
      : null,
    onFilter: () => true,
    render: (status) => {
      const tag = approvalStatusMap[status] || {};
      return (
        <Tag
          style={{
            backgroundColor: tag.backgroundColor,
            color: tag.textColor,
          }}
          className="border-less-table-orange-status"
        >
          {tag.label}
        </Tag>
      );
    },
  },
  {
    title: (
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        Quantity {getSortIcon("quantity", sortedInfo)}
      </div>
    ),
    dataIndex: "quantity",
    key: "quantity",
    ellipsis: true,
    width: "10%",
    sorter: (a, b) => a.quantity - b.quantity,
    sortDirections: ["ascend", "descend"],
    sortOrder: sortedInfo?.columnKey === "quantity" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (q) => <span className="font-medium">{q.toLocaleString()}</span>,
  },
  {
    title: "Broker",
    dataIndex: "broker",
    width: "15%",
    key: "broker",
  },
  {
    title: "",
    key: "action",
    render: (_, record) => (
      <Button className="small-dark-button" text={"View Details"} />
    ),
  },
];
