import { Tag, Switch, Tooltip } from "antd";
import styles from "./groups_and_policy.module.css";
import { Button } from "../../../components";
import { withSortIcon } from "./addEditViewFlow/usersTab/utils";

// import TypeColumnTitle from "./typeFilter";

/**
 * Returns the appropriate sort icon based on current sort state
 *
 * @param {string} columnKey - The column's key
 * @param {object} sortedInfo - Current sort state from the table
 * @returns {JSX.Element} The sort icon
 */

export const mapAdminGroupAndPolicyData = (adminBrokerData = {}) => {
  const brokers = Array.isArray(adminBrokerData) ? adminBrokerData : [];

  if (!brokers.length) return [];

  return brokers.map((item) => ({
    key: item.brokerID,
    brokerID: item.brokerID,
    brokerName: item.brokerName || "—",
    psxCode: item.psxCode || "—",
    brokerStatusID: item.brokerStatusID,
    brokerStatus: item.brokerStatus || "—",
  }));
};

/**
 * Utility: Build API request payload for approval listing
 *
 * @param {Object} searchState - Current search/filter state
 * @param {Object} assetTypeListingData - Extra request metadata (optional)
 * @returns {Object} API-ready payload
 */
export const buildApiRequest = (searchState = {}) => ({
  GroupPolicyName: searchState.policyName || "",
  PageNumber: Number(searchState.pageNumber) || 0,
  Length: Number(searchState.pageSize) || 10,
});

/**
 * 🔹 Table Columns for Group Policy Listing (No Sorting)
 */
export const getGroupPolicyColumns = ({
  onViewDetails,
  onEdit,
  sortedInfo = {},
}) => [
  {
    title: withSortIcon("Group Policy Name", "groupTitle", sortedInfo),
    align: "left",
    dataIndex: "groupTitle",
    key: "groupTitle",
    ellipsis: true,
    width: 170,
    sorter: (a, b) => (a?.groupTitle || "").localeCompare(b?.groupTitle || ""),
    sortOrder: sortedInfo?.columnKey === "groupTitle" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (text) => {
      const truncated = text?.length > 35 ? text.slice(0, 35) + "…" : text;
      return (
        <Tooltip title={text}>
          <span>{truncated}</span>
        </Tooltip>
      );
    },
  },

  {
    title: withSortIcon("Policy Count", "policyCount", sortedInfo, "center"),
    dataIndex: "policyCount",
    key: "policyCount",
    width: 50,
    align: "center",
    ellipsis: true,
    sorter: (a, b) => a.policyCount - b.policyCount,
    sortDirections: ["ascend", "descend"],
    sortOrder:
      sortedInfo?.columnKey === "policyCount" ? sortedInfo.order : null,
    showSorterTooltip: false,
    sortIcon: () => null,
    render: (q) => <span className="font-medium">{q.toLocaleString()}</span>,
  },
  {
    title: "Users",
    dataIndex: "assignedUsers",
    key: "assignedUsers",
    width: 200,
    render: (assignedUsers = "") => {
      if (!assignedUsers?.trim()) return <span>-</span>;

      // ✅ Split by both comma (,) and plus (+)
      const parts = assignedUsers
        .split(/,|\+/)
        .map((s) => s.trim())
        .filter(Boolean);

      return (
        <div className={styles.userList}>
          {parts.map((part, index) => {
            const isMore = /\b\d+\s*more\b/i.test(part);
            const displayName = isMore
              ? `+ ${part.replace(/more/i, "").trim()} more`
              : part;

            return (
              <div
                key={index}
                className={`${styles.userChip} ${
                  isMore ? styles.moreUsers : ""
                }`}
                title={displayName} // ✅ Tooltip on hover
              >
                {displayName}
              </div>
            );
          })}
        </div>
      );
    },
  },
  {
    title: "",
    key: "viewDetails",
    align: "right",
    width: 80,
    render: (_, record) => (
      <Button
        type="primary"
        className="small-light-button"
        id={"view-group-policies-Details-" + record.groupPolicyID}
        text={"View Details"}
        onClick={() => onViewDetails(record)}
      />
    ),
  },
  {
    title: "",
    key: "edit",
    align: "right",
    width: 50,
    render: (_, record) => (
      <Button
        type="primary"
        className="small-light-button"
        id={"edit-group-policies-Details-" + record.groupPolicyID}
        text={"Edit"}
        onClick={() => onEdit(record)}
      />
    ),
  },
];
