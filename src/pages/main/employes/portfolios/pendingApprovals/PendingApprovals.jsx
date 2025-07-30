import React, { useEffect, useState } from "react";
import { Col, Row } from "antd";
import EmptyState from "../../../../../components/emptyStates/empty-states";
import BorderlessTable from "../../../../../components/tables/borderlessTable/borderlessTable";
import { getBorderlessTableColumns } from "./utill";
import { approvalStatusMap } from "../../../../../components/tables/borderlessTable/utill";
import style from "../styles.module.css";
import { useSearchBarContext } from "../../../../../context/SearchBarContaxt";

const PendingApprovals = () => {
  const [sortedInfo, setSortedInfo] = useState({});

  const data = [
    {
      id: 1,
      instrument: "PSO-NOV",
      transactionid: "TXN-1001",
      approvalRequestDateime: "2024-10-11 | 10:00 pm",
      quantity: 20000,
      type: "Buy",
      broker: "JS Global",
      status: "Pending",
    },
    {
      id: 2,
      instrument: "PSO-OCT",
      transactionid: "TXN-1002",
      approvalRequestDateime: "2024-10-11 | 10:00 pm",
      quantity: 20000,
      type: "Sell",
      broker: "Arif Habib",
      status: "Pending",
    },
    {
      id: 3,
      instrument: "PRL-OCT",
      transactionid: "TXN-1003",
      approvalRequestDateime: "2024-10-11 | 10:00 pm",
      quantity: 40000,
      type: "Buy",
      broker: "AKD Securities",
      status: "Pending",
    },
    {
      id: 4,
      instrument: "PRL-OCT",
      transactionid: "TXN-1004",
      approvalRequestDateime: "2024-10-11 | 10:00 pm",
      quantity: 20000,
      type: "Buy",
      broker: "BMA Capital",
      status: "Non Compliant",
    },
    {
      id: 5,
      instrument: "PSO-OCT",
      transactionid: "TXN-1005",
      approvalRequestDateime: "2024-10-11 | 10:00 pm",
      quantity: 20000,
      type: "Sell",
      broker: "JS Global",
      status: "Pending",
    },
    {
      id: 6,
      instrument: "PRL-OCT",
      transactionid: "TXN-1006",
      approvalRequestDateime: "2024-10-11 | 10:00 pm",
      quantity: 40000,
      type: "Buy",
      broker: "Arif Habib",
      status: "Pending",
    },
    {
      id: 7,
      instrument: "PRL-OCT",
      transactionid: "TXN-1007",
      approvalRequestDateime: "2024-10-11 | 10:00 pm",
      quantity: 20000,
      type: "Buy",
      broker: "AKD Securities",
      status: "Non Compliant",
    },
    {
      id: 8,
      instrument: "PSO-OCT",
      transactionid: "TXN-1008",
      approvalRequestDateime: "2024-10-11 | 10:00 pm",
      quantity: 20000,
      type: "Sell",
      broker: "BMA Capital",
      status: "Pending",
    },
    {
      id: 9,
      instrument: "PRL-OCT",
      transactionid: "TXN-1009",
      approvalRequestDateime: "2024-10-11 | 10:00 pm",
      quantity: 40000,
      type: "Buy",
      broker: "JS Global",
      status: "Pending",
    },
    {
      id: 10,
      instrument: "PRL-OAACT",
      transactionid: "TXN-1010",
      approvalRequestDateime: "2024-10-11 | 10:00 pm",
      quantity: 20000,
      type: "Buy",
      broker: "Arif Habib",
      status: "Non Compliant",
    },
  ];
  // Global state for filter/search values
  const {
    employeePendingApprovalSearch,
    setEmployeePendingApprovalSearch,
    resetEmployeePendingApprovalSearch,
  } = useSearchBarContext();

  const columns = getBorderlessTableColumns(
    approvalStatusMap,
    sortedInfo,
    employeePendingApprovalSearch,
    setEmployeePendingApprovalSearch,
    resetEmployeePendingApprovalSearch
  );

  useEffect(() => {
    try {
      // Get browser navigation entries (used to detect reload)
      const navigationEntries = performance.getEntriesByType("navigation");
      if (navigationEntries.length > 0) {
        const navigationType = navigationEntries[0].type;
        if (navigationType === "reload") {
          // Check localStorage for previously saved selectedKey
          resetEmployeePendingApprovalSearch();
        }
      }
    } catch (error) {
      console.error(
        "❌ Error detecting page reload or restoring state:",
        error
      );
    }
  }, []);


  return (
    <>
      {data?.length ? (
        <BorderlessTable
          rows={data}
          columns={columns}
          classNameTable="border-less-table-blue"
          scroll={{ x: "max-content", y: 550 }}
          onChange={(pagination, filters, sorter) => {
            setSortedInfo(sorter);
          }}
        />
      ) : (
        <EmptyState type="request" />
      )}
    </>
  );
};

export default PendingApprovals;
