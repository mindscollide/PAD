import { Tag, Switch, Tooltip } from "antd";
import styles from "./groups_and_policy.module.css";
import { Button } from "../../../components";

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
export const getGroupPolicyColumns = ({ onViewDetails, onEdit }) => [
  {
    title: "Group Policy Name",
    dataIndex: "groupTitle",
    key: "groupTitle",
    width: "20%",
    render: (text) => {
      const truncated = text?.length > 50 ? text.slice(0, 50) + "…" : text;
      return (
        <Tooltip title={text}>
          <span className={styles.groupPolicyName}>{truncated}</span>
        </Tooltip>
      );
    },
  },
  {
    title: "Policy Count",
    dataIndex: "policyCount",
    key: "policyCount",
    align: "center",
    width: "10%",
    render: (policyCount) => <span>{policyCount}</span>,
  },
  {
    title: "Policy Count",
    dataIndex: "policyCount",
    key: "policyCount",
    align: "center",
    width: "8%",
    render: (policyCount) => <span>{policyCount}</span>,
  },
  // {
  //   title: "Users",
  //   dataIndex: "assignedUsers",
  //   key: "assignedUsers",
  //   width: "30%",
  //   render: (assignedUsers = "") => {
  //     if (!assignedUsers?.trim()) return <span>-</span>;

  //     // ✅ Split by both comma (,) and plus (+)
  //     const parts = assignedUsers
  //       .split(/,|\+/) // split by comma OR plus
  //       .map((s) => s.trim())
  //       .filter(Boolean); // remove empty strings

  //     return (
  //       <div className={styles.userList}>
  //         {parts.map((part, index) => {
  //           const isMore = /\b\d+\s*more\b/i.test(part); // detect "X more"
  //           return (
  //             <div
  //               key={index}
  //               className={isMore ? styles.moreUsers : styles.userChip}
  //             >
  //               {isMore ? `+ ${part.replace(/more/i, "").trim()} more` : part}
  //             </div>
  //           );
  //         })}
  //       </div>
  //     );
  //   },
  // },
  {
    title: "Users",
    dataIndex: "assignedUsers",
    key: "assignedUsers",
    width: "30%",
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
    width: "8%",
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
    width: "8%",
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
