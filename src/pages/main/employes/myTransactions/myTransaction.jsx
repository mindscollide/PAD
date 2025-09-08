import React, { useEffect, useState, useRef, useCallback } from "react";
import { Col, Row } from "antd";
import moment from "moment";
import { useNavigate } from "react-router-dom";

// Components
import BorderlessTable from "../../../../components/tables/borderlessTable/borderlessTable";
import { getBorderlessTableColumns } from "./utill";
import { approvalStatusMap } from "../../../../components/tables/borderlessTable/utill";
import PageLayout from "../../../../components/pageContainer/pageContainer";
import EmptyState from "../../../../components/emptyStates/empty-states";

// Context
import { useSearchBarContext } from "../../../../context/SearchBarContaxt";

// Styles
import style from "./myTransaction.module.css";

/**
 * MyTransaction Component
 *
 * Displays a table of employee transactions with filtering, sorting, and
 * filter tag display. Integrates with `SearchBarContext` for filter state.
 *
 * @component
 * @returns {JSX.Element}
 */
const MyTransaction = () => {
  const navigate = useNavigate();

  // ✅ Context hooks
  const { callApi } = useApi();
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();
  // -------------------- Context --------------------
  const {
    employeeMyTransactionSearch,
    setEmployeeMyTransactionSearch,
    resetEmployeeMyTransactionSearch,
  } = useSearchBarContext();

  // -------------------- Local State --------------------
  const [sortedInfo, setSortedInfo] = useState({});
  const [submittedFilters, setSubmittedFilters] = useState([]);
  // ✅ Guard against duplicate API calls (React StrictMode mounts twice)
  const didFetchRef = useRef(false);
  // -------------------- Dummy Table Data --------------------
  // In production, replace this with API data or context data
  const data = [
    {
      key: "1",
      transactionId: "TRX-001",
      instrument: "GDSC-OCT",
      type: "Buy",
      transactionDate: "2024-10-11T10:00:00",
      status: "Pending",
      quantity: "10,000",
      broker: "MRA Securities Ltd.",
    },
    {
      key: "2",
      transactionId: "TRX-002",
      instrument: "GDSC-NOV",
      type: "Sell",
      transactionDate: "2024-10-11T10:00:00",
      status: "Pending",
      quantity: 15000,
      broker: "Multiple Brokers",
    },
    {
      key: "3",
      transactionId: "TRX-003",
      instrument: "AIRLINK-NOV",
      type: "Buy",
      transactionDate: "2024-10-04T10:00:00",
      status: "Pending",
      quantity: 6000000,
      broker: "AKD Securities",
    },
    {
      key: "4",
      transactionId: "TRX-004",
      instrument: "PQQ-OCT",
      type: "Buy",
      transactionDate: "2024-10-11T10:00:00",
      status: "Compliant",
      quantity: 5000000,
      broker: "Multiple Brokers",
    },
    {
      key: "5",
      transactionId: "TRX-005",
      instrument: "PRI-OCT",
      type: "Sell",
      transactionDate: "2024-10-11T12:00:00",
      status: "Compliant",
      quantity: 2000,
      broker: "AKD Securities",
    },
    {
      key: "6",
      transactionId: "TRX-006",
      instrument: "PRL-NOV",
      type: "Buy",
      transactionDate: "2024-10-10T11:00:00",
      status: "Compliant",
      quantity: 5000000,
      broker: "AKD Securities",
    },
    {
      key: "7",
      transactionId: "TRX-007",
      instrument: "PPL-NOV",
      type: "Buy",
      transactionDate: "2024-10-09T10:00:00",
      status: "Compliant",
      quantity: 5000000,
      broker: "AKD Securities",
    },
    {
      key: "8",
      transactionId: "TRX-008",
      instrument: "HUBC-NOV",
      type: "Buy",
      transactionDate: "2024-10-15T10:00:00",
      status: "Non Compliant",
      quantity: 2000,
      broker: "MRA Securities",
    },
    {
      key: "9",
      transactionId: "TRX-009",
      instrument: "HUBC-OCT",
      type: "Sell",
      transactionDate: "2024-10-11T10:00:00",
      status: "Non Compliant",
      quantity: 20000,
      broker: "Multiple Brokers",
    },
  ];

  /**
   * 🔹 Fetch pending approvals from API
   * Handles initial load and filter/search triggers.
   */
  const fetchPendingApprovals = useCallback(
    async (requestData) => {
      showLoader(true);

      try {
        const res = await SearchEmployeeTransactionsDetails({
          callApi,
          showNotification,
          showLoader,
          requestdata: requestData,
          navigate,
        });

        const mapped = mapToTableRows(res?.pendingPortfolios || []);

        setEmployeePendingApprovalsData((prev) => {
          if (!res?.pendingPortfolios || res.pendingPortfolios.length === 0) {
            // 🔹 Reset when no records
            return {
              data: [],
              totalRecords: 0,
              mqttRecived: false,
              Apicall: true,
            };
          }

          // 🔹 Append new rows
          return {
            ...prev,
            data: [...(prev.data || []), ...mapped],
            totalRecords: res?.totalRecords ?? (prev.totalRecords || 0),
            mqttRecived: false,
            Apicall: true,
          };
        });
      } catch (error) {
        console.error("❌ Error fetching pending approvals:", error);
      } finally {
        showLoader(false);
      }
    },
    [
      callApi,
      showNotification,
      showLoader,
      navigate,
      setEmployeePendingApprovalsData,
    ]
  );

  /**
   * 🔄 Initial load on mount
   */
  useEffect(() => {
    if (didFetchRef.current) return;
    didFetchRef.current = true;

    const requestData = {
      InstrumentName: "",
      Quantity: 0,
      StartDate: "",
      EndDate: "",
      BrokerIDs: [],
      PageNumber: 0,
      Length: 10,
    };
    fetchPendingApprovals(requestData);

    // Reset search state only if page reloaded
    try {
      const navigationEntries = performance.getEntriesByType("navigation");
      if (
        navigationEntries.length > 0 &&
        navigationEntries[0].type === "reload"
      ) {
        resetEmployeeMyTransactionSearch();
      }
    } catch (error) {
      console.error("❌ Error detecting page reload:", error);
    }
  }, [fetchPendingApprovals, resetEmployeeMyTransactionSearch]);
  // -------------------- Table Columns --------------------
  const columns = getBorderlessTableColumns(
    approvalStatusMap,
    sortedInfo,
    employeeMyTransactionSearch,
    setEmployeeMyTransactionSearch
  );

  // -------------------- Filter Config --------------------
  const filterKeys = [
    { key: "instrumentName", label: "Instrument" },
    { key: "mainInstrumentName", label: "Main Instrument" },
    { key: "quantity", label: "Quantity" },
  ];

  /**
   * Removes a filter from both context state and local `submittedFilters`.
   *
   * @param {string} key - The filter key to remove (e.g., "instrumentName")
   */
  const handleRemoveFilter = (key) => {
    if (key === "dateRange") {
      // Reset both start and end date
      setEmployeeMyTransactionSearch((prev) => ({
        ...prev,
        startDate: "",
        endDate: "",
      }));
    } else {
      setEmployeeMyTransactionSearch((prev) => ({
        ...prev,
        [key]: "",
      }));
    }

    // Remove from submitted filters
    setSubmittedFilters((prev) => prev.filter((item) => item.key !== key));
  };

  // -------------------- Effects --------------------

  /**
   * On `filterTrigger`, sync context filters into `submittedFilters`
   */
  useEffect(() => {
    if (employeeMyTransactionSearch.filterTrigger) {
      const snapshot = [];

      // Add non-date filters
      filterKeys.forEach(({ key, label }) => {
        const value = employeeMyTransactionSearch[key];
        if (value) {
          snapshot.push({ key, label, value });
        }
      });

      // Add combined date range
      const { startDate, endDate } = employeeMyTransactionSearch;
      if (startDate || endDate) {
        const formattedStart = startDate
          ? moment(startDate).format("YYYY-MM-DD")
          : "N/A";
        const formattedEnd = endDate
          ? moment(endDate).format("YYYY-MM-DD")
          : "N/A";

        snapshot.push({
          key: "dateRange",
          label: "Date Range",
          value: `${formattedStart} - ${formattedEnd}`,
        });
      }

      setSubmittedFilters(snapshot);

      // Reset filter trigger flag
      setEmployeeMyTransactionSearch((prev) => ({
        ...prev,
        filterTrigger: false,
      }));
    }
  }, [employeeMyTransactionSearch.filterTrigger]);

  /**
   * On page reload, reset search state from context
   */
  useEffect(() => {
    try {
      const navigationEntries = performance.getEntriesByType("navigation");
      if (navigationEntries.length > 0) {
        const navigationType = navigationEntries[0].type;
        if (navigationType === "reload") {
          resetEmployeeMyTransactionSearch();
        }
      }
    } catch (error) {
      console.error("❌ Error detecting reload:", error);
    }
  }, []);

  // -------------------- Render --------------------
  return (
    <>
      {/* Filter Tags */}
      {submittedFilters.length > 0 && (
        <Row gutter={[12, 12]} className={style["filter-tags-container"]}>
          {submittedFilters.map(({ key, value }) => (
            <Col key={key}>
              <div className={style["filter-tag"]}>
                <span>{value}</span>
                <span
                  className={style["filter-tag-close"]}
                  onClick={() => handleRemoveFilter(key)}
                >
                  &times;
                </span>
              </div>
            </Col>
          ))}
        </Row>
      )}

      {/* Page Layout with Table */}
      <PageLayout background="white">
        <div className="px-4 md:px-6 lg:px-8">
          <Row>
            <Col>
              <h2 className={style["heading"]}>My Transactions</h2>
            </Col>
          </Row>

          <BorderlessTable
            rows={data}
            classNameTable="border-less-table-blue"
            scroll={{ x: "max-content", y: 550 }}
            columns={columns}
            onChange={(_, __, sorter) => setSortedInfo(sorter)}
          />
        </div>
      </PageLayout>
    </>
  );
};

export default MyTransaction;
