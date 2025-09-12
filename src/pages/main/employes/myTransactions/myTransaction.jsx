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
import { useTransaction } from "../../../../context/myTransaction";
import EmptyState from "../../../../components/emptyStates/empty-states";
import {
  mapBuySellToIds,
  mapStatusToIds,
} from "../../../../components/dropdowns/filters/utils";
import { apiCallSearch } from "../../../../components/dropdowns/searchableDropedown/utill";
import { useDashboardContext } from "../../../../context/dashboardContaxt";
import { useSidebarContext } from "../../../../context/sidebarContaxt";

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
  const hasFetched = useRef(false);

  // -------------------- Context Hooks --------------------
  const { callApi } = useApi();
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();
  const { selectedKey } = useSidebarContext();
  const { addApprovalRequestData } = useDashboardContext();
  const {
    employeeMyTransactionSearch,
    setEmployeeMyTransactionSearch,
    resetEmployeeMyTransactionSearch,
  } = useSearchBarContext();

  const { employeeTransactionsData, setEmployeeTransactionsData } =
    useTransaction();

  console.log(
    employeeTransactionsData,
    "employeeTransactionsDataemployeeTransactionsData"
  );

  // -------------------- Local State --------------------
  const [sortedInfo, setSortedInfo] = useState({});
  const [loadingMore, setLoadingMore] = useState(false); // spinner at bottom
  const [submittedFilters, setSubmittedFilters] = useState([]);

  /**
   * Fetches approval data from API on component mount
   */
  const fetchApprovals = async () => {
    await showLoader(true);
    const requestdata = {
      InstrumentName:
        employeeMyTransactionSearch.instrumentName ||
        employeeMyTransactionSearch.mainInstrumentName,
      Quantity: employeeMyTransactionSearch.quantity || 0,
      StartDate: employeeMyTransactionSearch.date || null,
      EndDate: employeeMyTransactionSearch.date || null,
      BrokerIDs: employeeMyTransactionSearch.brokerIDs || [],
      StatusIds: employeeMyTransactionSearch.status || [],
      TypeIds: employeeMyTransactionSearch.type || [],
      PageNumber: 0,
      Length: employeeMyTransactionSearch.pageSize || 10,
    };

    const data = await SearchEmployeeTransactionsDetails({
      callApi,
      showNotification,
      showLoader,
      requestdata,
      navigate,
    });

    setEmployeeTransactionsData(data);
  };

  /**
   * Runs only once to fetch approvals on initial render
   */
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchApprovals();

    resetEmployeeMyTransactionSearch();
    setEmployeeMyTransactionSearch({
      instrumentName: "",
      quantity: 0,
      startDate: null,
      endDate: null,
      mainInstrumentName: "",
      type: [],
      status: [],
      brokerIDs: [],
      pageSize: "",
      pageNumber: 0,
      filterTrigger: false,
      tableFilterTrigger: false,
    });
  }, []);

  // Keys to track which filters to sync/display
  const filterKeys = [
    { key: "instrumentName", label: "Instrument" },
    { key: "mainInstrumentName", label: "Main Instrument" },
    { key: "startDate", label: "Date" },
    { key: "endDate", label: "Date" },
    { key: "quantity", label: "Quantity" },
  ];

  console.log(approvalStatusMap, "approvalStatusMapapprovalStatusMap");

  // -------------------- Table Columns --------------------
  const columns = getBorderlessTableColumns(
    approvalStatusMap,
    sortedInfo,
    employeeMyTransactionSearch,
    setEmployeeMyTransactionSearch
  );

  /**
   * Removes a filter tag and re-fetches data
   */
  const handleRemoveFilter = async (key) => {
    console.log("Check Data");
    const normalizedKey = key?.toLowerCase();
    // 1️⃣ Update UI state for removed filters
    setSubmittedFilters((prev) => prev.filter((item) => item.key !== key));

    //To show dynamically AssetType like EQ equities ETC
    const assetKey = employeeMyTransactionSearch.assetType;
    const assetData = addApprovalRequestData?.[assetKey];

    // 2️⃣ Prepare API request parameters
    const TypeIds = mapBuySellToIds(
      employeeMyTransactionSearch.type,
      assetData
    );
    const statusIds = mapStatusToIds(employeeMyTransactionSearch.status);

    const requestdata = {
      InstrumentName:
        employeeMyTransactionSearch.instrumentName ||
        employeeMyTransactionSearch.mainInstrumentName,
      Quantity: employeeMyTransactionSearch.quantity || 0,
      StartDate: employeeMyTransactionSearch.date || null,
      EndDate: employeeMyTransactionSearch.date || null,
      BrokerIDs: employeeMyTransactionSearch.brokerIDs || [],
      StatusIds: statusIds || [],
      TypeIds: TypeIds || [],
      PageNumber: 0,
      Length: employeeMyTransactionSearch.pageSize || 10,
    };
    console.log(normalizedKey, "checkRequqestData");

    // 3️⃣ Reset API params for the specific filter being removed
    if (normalizedKey === "quantity") {
      console.log(requestdata, "checkRequqestData");
      requestdata.Quantity = 0;
      // 5️⃣ Update search state — only reset the specific key + page number
      setEmployeeMyTransactionSearch((prev) => ({
        ...prev,
        quantity: 0,
        pageNumber: 0,
      }));
    } else if (
      normalizedKey === "instrumentname" ||
      normalizedKey === "maininstrumentname"
    ) {
      console.log("Check Data");
      setEmployeeMyTransactionSearch((prev) => ({
        ...prev,
        instrumentName: "",
        mainInstrumentName: "",
        pageNumber: 0,
      }));
      requestdata.InstrumentName = "";
    } else if (normalizedKey === "startdate") {
      requestdata.StartDate = "";
      setEmployeeMyTransactionSearch((prev) => ({
        ...prev,
        startdate: "",
        pageNumber: 0,
      }));
    }

    // 4️⃣ Show loader and call API
    showLoader(true);
    console.log("Check Data");

    const data = await SearchEmployeeTransactionsDetails({
      callApi,
      showNotification,
      showLoader,
      requestdata,
      navigate,
    });

    setEmployeeTransactionsData(data);
  };

  /**
   * Syncs filters on `filterTrigger` from context
   */
  useEffect(() => {
    console.log("Filter Checker align");
    console.log(selectedKey, "Filter Checker align");
    if (employeeMyTransactionSearch.filterTrigger) {
      const snapshot = filterKeys
        .filter(({ key }) => employeeMyTransactionSearch[key])
        .map(({ key }) => ({
          key,
          value: employeeMyTransactionSearch[key],
        }));

      setSubmittedFilters(snapshot);

      setEmployeeMyTransactionSearch((prev) => ({
        ...prev,
        filterTrigger: false,
      }));
    }
  }, [employeeMyTransactionSearch.filterTrigger]);

  /**
   * Handles table-specific filter trigger
   */
  useEffect(() => {
    console.log(
      employeeMyTransactionSearch.tableFilterTrigger,
      "Filter Checker align"
    );
    const fetchFilteredData = async () => {
      if (!employeeMyTransactionSearch.tableFilterTrigger) return;

      const snapshot = filterKeys
        .filter(({ key }) => employeeMyTransactionSearch[key])
        .map(({ key }) => ({
          key,
          value: employeeMyTransactionSearch[key],
        }));

      console.log(selectedKey, "Filter Checker align");
      await apiCallSearch({
        selectedKey,
        employeeMyTransactionSearch,
        callApi,
        showNotification,
        showLoader,
        navigate,
        setData: setEmployeeTransactionsData,
      });

      setSubmittedFilters(snapshot);

      setEmployeeMyTransactionSearch((prev) => ({
        ...prev,
        tableFilterTrigger: false,
      }));
    };

    fetchFilteredData();
  }, [employeeMyTransactionSearch.tableFilterTrigger]);

  useEffect(() => {
    try {
      // Get browser navigation entries (used to detect reload)
      const navigationEntries = performance.getEntriesByType("navigation");
      if (
        navigationEntries.length > 0 &&
        navigationEntries[0].type === "reload"
      ) {
        // Check localStorage for previously saved selectedKey
        resetEmployeeMyTransactionSearch();
      }
    } catch (error) {
      console.error(
        "❌ Error detecting page reload or restoring state:",
        error
      );
    }
  }, []);

  // Lazy Loading Work Start
  useEffect(() => {
    try {
      if (
        employeeTransactionsData?.transactions &&
        Array.isArray(employeeTransactionsData?.transactions)
      ) {
        // 🔹 Map and normalize data
        const mappedData = employeeTransactionsData?.transactions.map((item) => ({
          key: item.workFlowID, // required for AntD table
          workFlowID: item.workFlowID || null,
          title: `ConductTransactionRequest-${item.workFlowID || ""}-${
            item.requestDate || ""
          } ${item.requestTime || ""}`,
          description: item.description || "",
          instrumentShortCode: item.instrumentShortCode || "",
          instrumentName: item.instrumentName || "",
          quantity: item.quantity || 0,
          tradeApprovalID: item.tradeApprovalID || "",
          tradeApprovalTypeID: item.tradeApprovalTypeID || null,
          tradeType: item.tradeType || "",
          workFlowStatusID: item.workFlowStatusID || null,
          workFlowStatus: item.workFlowStatus || "",
          assetTypeID: item.assetTypeID || null,
          assetType: item.assetType || "",
          assetShortCode: item.assetShortCode || "",
          transactionConductedDate: item.transactionConductedDate || "",
          transactionConductedTime: item.transactionConductedTime || "",
          deadlineDate: item.deadlineDate || "",
          deadlineTime: item.deadlineTime || "",
          broker: item.broker || "Multiple Brokers",
        }));

        // 🔹 Set approvals data
        setEmployeeTransactionsData(mappedData);

        // 🔹 Update search state (avoid unnecessary updates)
        setEmployeeMyTransactionSearch((prev) => ({
          ...prev,
          totalRecords:
            prev.totalRecords !== employeeTransactionsData.totalRecords
              ? employeeTransactionsData.totalRecords
              : prev.totalRecords,
          pageNumber: mappedData.length,
        }));
      } else if (employeeTransactionsData === null) {
        // No data case
        setEmployeeTransactionsData([]);
      }
    } catch (error) {
      console.error("Error processing employee approvals:", error);
    } finally {
      // 🔹 Always stop loading state
      setLoadingMore(false);
    }
  }, [employeeTransactionsData]);

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
          {employeeTransactionsData && employeeTransactionsData.length > 0 ? (
            <BorderlessTable
              rows={employeeTransactionsData} // Replace with API data when ready
              classNameTable="border-less-table-blue"
              scroll={{
                x: "max-content",
                y: submittedFilters.length > 0 ? 450 : 500,
              }}
              columns={columns}
              onChange={(pagination, filters, sorter) => {
                setSortedInfo(sorter);
              }}
              loading={loadingMore}
            />
          ) : (
            <EmptyState type="request" />
          )}
        </div>
      </PageLayout>
    </>
  );
};

export default MyTransaction;
