// src/pages/employee/approval/PendingApprovals.jsx

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";

// Components
import EmptyState from "../../../../../components/emptyStates/empty-states";
import BorderlessTable from "../../../../../components/tables/borderlessTable/borderlessTable";

// Utils
import { getBorderlessTableColumns } from "./utill";
import { approvalStatusMap } from "../../../../../components/tables/borderlessTable/utill";

// Contexts
import { useSearchBarContext } from "../../../../../context/SearchBarContaxt";
import { useApi } from "../../../../../context/ApiContext";
import { useGlobalLoader } from "../../../../../context/LoaderContext";

// Hooks
import { useNotification } from "../../../../../components/NotificationProvider/NotificationProvider";

// API
import { SearchEmployeePendingUploadedPortFolio } from "../../../../../api/protFolioApi";

/**
 * PendingApprovals Component
 *
 * - Fetches employee pending approvals from API
 * - Displays data in a borderless table
 * - Uses global search bar context for filtering
 * - Resets search state on page reload
 */
const PendingApprovals = () => {
  const navigate = useNavigate();

  // Context hooks
  const { callApi } = useApi();
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();

  // Local state
  const [sortedInfo, setSortedInfo] = useState({});
  const [tableData, setTableData] = useState([]);
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

  // Global search state (specific to employee pending approvals)
  const {
    employeePendingApprovalSearch,
    setEmployeePendingApprovalSearch,
    resetEmployeePendingApprovalSearch,
  } = useSearchBarContext();

  // Table column definitions
  const columns = getBorderlessTableColumns(
    approvalStatusMap,
    sortedInfo,
    employeePendingApprovalSearch,
    setEmployeePendingApprovalSearch,
    resetEmployeePendingApprovalSearch
  );

  // Guard to prevent duplicate API calls (React 18 StrictMode)
  const didFetchRef = useRef(false);

  // API Fetcher (memoized)
  const fetchPendingApprovals = useCallback(async () => {
    showLoader(true);

    const requestData = {
      InstrumentName: "",
      Quantity: 0,
      StartDate: "",
      EndDate: "",
      BrokerName: "",
      PageNumber: 0,
      Length: 10,
    };

    const res = await SearchEmployeePendingUploadedPortFolio({
      callApi,
      showNotification,
      showLoader,
      requestdata: requestData,
      navigate,
    });

    setTableData(
      (res?.pendingPortfolios || []).map((item) => ({
        ...item,
        approvalRequestDateime: `${item.transactionConductedDate || ""} ${
          item.transactionConductedTime || ""
        }`,
      }))
    );
    showLoader(false);
  }, [callApi, showNotification, showLoader, navigate]);
  console.log("requestdata tableData",tableData)

  // Run only once on mount
  useEffect(() => {
    if (didFetchRef.current) return; // 🚨 Prevent double-call
    didFetchRef.current = true;

    fetchPendingApprovals();

    // Reset search state only if page reloaded
    try {
      const navigationEntries = performance.getEntriesByType("navigation");
      if (
        navigationEntries.length > 0 &&
        navigationEntries[0].type === "reload"
      ) {
        resetEmployeePendingApprovalSearch();
      }
    } catch (error) {
      console.error("❌ Error detecting page reload:", error);
    }
  }, [fetchPendingApprovals, resetEmployeePendingApprovalSearch]);

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
      <BorderlessTable
        rows={tableData}
        columns={columns}
        classNameTable="border-less-table-blue"
        scroll={{ x: "max-content", y: 550 }}
        onChange={(pagination, filters, sorter) => {
          setSortedInfo(sorter);
        }}
      />
    </>
  );
};

export default PendingApprovals;
