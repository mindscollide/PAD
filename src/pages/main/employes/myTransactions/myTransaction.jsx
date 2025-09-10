import React, { useEffect, useState, useRef, useCallback } from "react";
import { Col, Row } from "antd";
import moment from "moment";
import { useNavigate } from "react-router-dom";

// Components
import BorderlessTable from "../../../../components/tables/borderlessTable/borderlessTable";
import { getBorderlessTableColumns } from "./utill";
import { approvalStatusMap } from "../../../../components/tables/borderlessTable/utill";
import PageLayout from "../../../../components/pageContainer/pageContainer";

// Contexts
import { useSearchBarContext } from "../../../../context/SearchBarContaxt";
import { useApi } from "../../../../context/ApiContext";
import { useNotification } from "../../../../components/NotificationProvider/NotificationProvider";
import { useGlobalLoader } from "../../../../context/LoaderContext";

// API
import { SearchEmployeeTransactionsDetails } from "../../../../api/myTransactionsApi";

// Styles
import style from "./myTransaction.module.css";

/**
 * 📄 MyTransaction Component
 *
 * Displays a table of employee transactions with filters, sorting, and pagination.
 * Integrates with:
 * - `SearchBarContext` for filter/search state.
 * - `useApi`, `useNotification`, and `useGlobalLoader` for API handling, UI feedback, and loading states.
 *
 * @component
 * @returns {JSX.Element}
 */
const MyTransaction = () => {
  const navigate = useNavigate();

  // -------------------- Context Hooks --------------------
  const { callApi } = useApi();
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();
  const {
    employeeMyTransactionSearch,
    setEmployeeMyTransactionSearch,
    resetEmployeeMyTransactionSearch,
  } = useSearchBarContext();

  // -------------------- Local State --------------------
  const [sortedInfo, setSortedInfo] = useState({});
  const [submittedFilters, setSubmittedFilters] = useState([]);

  // ✅ Guard against duplicate API calls (React.StrictMode mounts twice)
  const didFetchRef = useRef(false);

  // -------------------- Dummy Data (Replace with API in Production) --------------------
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
    // ... (rest of dummy transactions)
  ];

  // -------------------- Utility Functions --------------------

  /**
   * 🔹 Map raw API response data → Table rows
   *
   * @param {Array<Object>} list - List of transactions from API
   * @returns {Array<Object>} - Transformed rows for the table
   */
  const mapToTableRows = (list = []) =>
    list.map((item) => ({
      key: item.approvalID || item.id,
      instrument: item.instrument?.instrumentName || item.instrumentName || "",
      transactionid: item.transactionId || item.transactionid || "",
      approvalRequestDateime: `${item.transactionConductedDate || ""} ${
        item.transactionConductedTime || ""
      }`,
      quantity: item.quantity || 0,
      type: item.tradeType?.typeName || item.type || "",
      broker: item.broker?.brokerName || item.broker || "",
      status: item?.workFlowStatus?.approvalStatusName || item.status || "",
      ...item,
    }));

  /**
   * 🔹 Fetch employee transactions from API
   *
   * @param {Object} requestData - Request payload for API
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

        setEmployeeMyTransactionSearch((prev) => {
          if (!res?.pendingPortfolios || res.pendingPortfolios.length === 0) {
            // 🔹 Reset when no records
            return {
              data: [],
              totalRecords: 0,
              Apicall: true,
            };
          }

          // 🔹 Append new rows
          return {
            ...prev,
            data: [...(prev.data || []), ...mapped],
            totalRecords: res?.totalRecords ?? (prev.totalRecords || 0),
            Apicall: true,
          };
        });
      } catch (error) {
        console.error("❌ Error fetching pending approvals:", error);
      } finally {
        showLoader(false);
      }
    },
    [callApi, showNotification, showLoader, navigate, setEmployeeMyTransactionSearch]
  );

  // -------------------- Effects --------------------

  /**
   * 🔄 Initial API call on mount (avoids duplicate calls on React.StrictMode)
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
      TypeIDs: [],
      StatusIDs: [],
      PageNumber: 0,
      Length: 10,
    };

    fetchPendingApprovals(requestData);

    // Reset search state if page reloaded
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

  /**
   * 🔄 On `filterTrigger`, update submittedFilters for display
   */
  useEffect(() => {
    if (employeeMyTransactionSearch.filterTrigger) {
      const snapshot = [];

      // Collect active filters
      const filterKeys = [
        { key: "instrumentName", label: "Instrument" },
        { key: "mainInstrumentName", label: "Main Instrument" },
        { key: "quantity", label: "Quantity" },
      ];

      filterKeys.forEach(({ key, label }) => {
        const value = employeeMyTransactionSearch[key];
        if (value) snapshot.push({ key, label, value });
      });

      // Add date range filter
      const { startDate, endDate } = employeeMyTransactionSearch;
      if (startDate || endDate) {
        snapshot.push({
          key: "dateRange",
          label: "Date Range",
          value: `${startDate ? moment(startDate).format("YYYY-MM-DD") : "N/A"} - ${
            endDate ? moment(endDate).format("YYYY-MM-DD") : "N/A"
          }`,
        });
      }

      setSubmittedFilters(snapshot);

      // Reset trigger
      setEmployeeMyTransactionSearch((prev) => ({
        ...prev,
        filterTrigger: false,
      }));
    }
  }, [employeeMyTransactionSearch.filterTrigger]);

  /**
   * 🔄 Reset search state on hard page reload
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

  // -------------------- Handlers --------------------

  /**
   * Remove a filter from submitted filters & context
   *
   * @param {string} key - The filter key (e.g., "instrumentName", "dateRange")
   */
  const handleRemoveFilter = (key) => {
    if (key === "dateRange") {
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

    setSubmittedFilters((prev) => prev.filter((item) => item.key !== key));
  };

  // -------------------- Table Columns --------------------
  const columns = getBorderlessTableColumns(
    approvalStatusMap,
    sortedInfo,
    employeeMyTransactionSearch,
    setEmployeeMyTransactionSearch
  );

  // -------------------- Render --------------------
  return (
    <>
      {/* 🔹 Active Filter Tags */}
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

      {/* 🔹 Transactions Table */}
      <PageLayout background="white">
        <div className="px-4 md:px-6 lg:px-8">
          <Row>
            <Col>
              <h2 className={style["heading"]}>My Transactions</h2>
            </Col>
          </Row>

          <BorderlessTable
            rows={data} // Replace with API data when ready
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
