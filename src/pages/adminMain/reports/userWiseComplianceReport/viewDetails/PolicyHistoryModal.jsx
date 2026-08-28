import React, { useState } from "react";
import { GlobalModal, BorderlessTable } from "../../../../../components";
import CustomButton from "../../../../../components/buttons/button";
import { withSortIcon } from "../../../../../common/funtions/tableIcon";
import style from "./ViewDetails.module.css";

/**
 * "View More" modal - Admin User-wise Compliance Report > View Details'
 * left panel policy section. Opened with the already-fetched/mapped
 * {currentPolicy, previouslyAssignedPolicies} (see viewDetails/utils.jsx's
 * mapPolicyHistoryResponse) - this component only renders, it doesn't
 * fetch.
 */
const PolicyHistoryModal = ({ open, onClose, currentPolicy, previouslyAssignedPolicies }) => {
  const [sortedInfo, setSortedInfo] = useState({});

  const columns = [
    {
      title: withSortIcon("Policy Name", "policyName", sortedInfo),
      dataIndex: "policyName",
      key: "policyName",
      ellipsis: true,
      sorter: (a, b) => (a.policyName || "").localeCompare(b.policyName || ""),
      sortOrder: sortedInfo?.columnKey === "policyName" ? sortedInfo.order : null,
      showSorterTooltip: false,
      sortIcon: () => null,
      render: (text) => <span className="font-medium">{text}</span>,
    },
    {
      // SRS: "let the Admin sort on the Previously Assigned Policies and
      // Assigned Date" - sorts assignedDateRaw (yyyyMMdd digits, correctly
      // orderable as a plain string), not the dashed display string.
      title: withSortIcon("Assigned Date", "assignedDate", sortedInfo, "center"),
      dataIndex: "assignedDate",
      key: "assignedDate",
      align: "center",
      sorter: (a, b) =>
        (a.assignedDateRaw || "").localeCompare(b.assignedDateRaw || ""),
      sortOrder: sortedInfo?.columnKey === "assignedDate" ? sortedInfo.order : null,
      showSorterTooltip: false,
      sortIcon: () => null,
      render: (text) => <span className="text-gray-600">{text}</span>,
    },
  ];

  return (
    <GlobalModal
      visible={open}
      width="720px"
      centered
      onCancel={onClose}
      modalBody={
        <>
          <div className={style.policyHistoryHeader}>
            <h3>Policy Assignment History</h3>
            {currentPolicy && (
              <p className={style.policyHistoryCurrent}>
                Current: <strong>{currentPolicy.policyName}</strong> - assigned{" "}
                {currentPolicy.assignedDate}
              </p>
            )}
          </div>

          <BorderlessTable
            rows={previouslyAssignedPolicies}
            columns={columns}
            classNameTable="border-less-table-noColorTable"
            onChange={(pagination, filters, sorter) => setSortedInfo(sorter)}
          />

          <div className={style.policyHistoryFooter}>
            <CustomButton
              text="Close"
              className="big-light-button"
              onClick={onClose}
            />
          </div>
        </>
      }
    />
  );
};

export default PolicyHistoryModal;
