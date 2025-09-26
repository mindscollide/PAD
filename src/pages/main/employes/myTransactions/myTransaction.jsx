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
import {
  GetAllTransactionViewDetails,
  SearchEmployeeTransactionsDetails,
} from "../../../../api/myTransactionsApi";

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
import { useGlobalModal } from "../../../../context/GlobalModalContext";
import ViewDetailsTransactionModal from "./modals/viewDetailsTransactionModal/ViewDetailsTransactionModal";
import ViewTransactionCommentModal from "./modals/viewTransactionCommentModal/ViewTransactionCommentModal";
import { useTableScrollBottom } from "../myApprovals/utill";
import { toYYMMDD } from "../../../../commen/funtions/rejex";
import ViewTicketTransactionModal from "./modals/viewTicketTransactionModal/ViewTicketTransactionModal";

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
  const {
    viewDetailTransactionModal,
    setViewDetailTransactionModal,
    viewCommentTransactionModal,
    isViewTicketTransactionModal,
  } = useGlobalModal();
  const { addApprovalRequestData, employeeBasedBrokersData } =
    useDashboardContext();
  const {
    employeeMyTransactionSearch,
    setEmployeeMyTransactionSearch,
    resetEmployeeMyTransactionSearch,
  } = useSearchBarContext();

  const {
    employeeTransactionsData,
    setEmployeeTransactionsData,
    employeeTransactionsTableDataMqtt,
    setEmployeeTransactionsTableDataMqtt,
    setEmployeeTransactionViewDetailData,
  } = useTransaction();

  // -------------------- Local State --------------------
  const [sortedInfo, setSortedInfo] = useState({});
  const [myTransactionData, setMyTransactionData] = useState([]);
  const [loadingMore, setLoadingMore] = useState(false); // spinner at bottom
  const [submittedFilters, setSubmittedFilters] = useState([]);

  console.log(submittedFilters, "checkSubmittedFilterALign");

  /**
   * Fetches approval data from API on component mount
   */
  const fetchApprovals = async (flag) => {
    if (flag) {
      await showLoader(true);
    }

    const requestdata = {
      InstrumentName:
        employeeMyTransactionSearch.instrumentName ||
        employeeMyTransactionSearch.mainInstrumentName,
      Quantity: employeeMyTransactionSearch.quantity || 0,
      StartDate: employeeMyTransactionSearch.startDate
        ? toYYMMDD(employeeMyTransactionSearch.startDate)
        : "",
      EndDate: employeeMyTransactionSearch.endDate
        ? toYYMMDD(employeeMyTransactionSearch.endDate)
        : "",
      BrokerIDs: employeeMyTransactionSearch.brokerIDs || [],
      StatusIds: employeeMyTransactionSearch.status || [],
      TypeIds: employeeMyTransactionSearch.type || [],
      PageNumber: 0,
      Length: employeeMyTransactionSearch.pageSize || 10,
    };

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
   * Runs only once to fetch approvals on initial render
   */
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchApprovals(true);

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

  useEffect(() => {
    if (employeeTransactionsTableDataMqtt) {
      fetchApprovals(false);
      setEmployeeTransactionsTableDataMqtt(false);
    }
  }, [employeeTransactionsTableDataMqtt]);

  // helper to map brokerId → brokerName
  const brokerIdToName = (id) => {
    const broker = employeeBasedBrokersData?.find((b) => b.brokerID === id);
    return broker ? broker.brokerName : id;
  };

  // Keys to track which filters to sync/display
  const filterKeys = [
    { key: "instrumentName", label: "Instrument" },
    { key: "mainInstrumentName", label: "Main Instrument" },
    { key: "startDate", label: "Start Date" },
    { key: "endDate", label: "End Date" },
    { key: "quantity", label: "Quantity" },
    { key: "brokerIDs", label: "Brokers" }, // 🔹 NEW
  ];

  console.log(approvalStatusMap, "approvalStatusMapapprovalStatusMap");

  // This Api is for the getAllViewDetailModal For myTransaction in Emp role
  // GETALLVIEWDETAIL OF Transaction API FUNCTION
  const handleViewDetailsForTransaction = async (workFlowID) => {
    await showLoader(true);
    const requestdata = { TradeApprovalID: workFlowID };

    const responseData = await GetAllTransactionViewDetails({
      callApi,
      showNotification,
      showLoader,
      requestdata,
      navigate,
    });

    if (responseData) {
      setEmployeeTransactionViewDetailData(responseData);
      setViewDetailTransactionModal(true);
    }
  };

  // -------------------- Table Columns --------------------
  const columns = getBorderlessTableColumns({
    approvalStatusMap,
    sortedInfo,
    employeeMyTransactionSearch,
    setViewDetailTransactionModal,
    setEmployeeMyTransactionSearch,
    handleViewDetailsForTransaction,
  });

  /**
   * Removes a filter tag and re-fetches data
   */
  const handleRemoveFilter = async (key, valueToRemove) => {
    console.log("Check Data");
    const normalizedKey = key?.toLowerCase();
    // 1️⃣ Update UI state for removed filters
    setSubmittedFilters((prev) =>
      prev.filter(
        (item) =>
          !(
            item.key === key &&
            (valueToRemove ? item.value === valueToRemove : true)
          )
      )
    );

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
      StartDate: employeeMyTransactionSearch.startDate
        ? toYYMMDD(employeeMyTransactionSearch.startDate)
        : "",
      EndDate: employeeMyTransactionSearch.endDate
        ? toYYMMDD(employeeMyTransactionSearch.endDate)
        : "",
      BrokerIDs: [...(employeeMyTransactionSearch.brokerIDs || [])],
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
        startDate: "",
        pageNumber: 0,
      }));
    } else if (normalizedKey === "enddate") {
      requestdata.EndDate = "";
      setEmployeeMyTransactionSearch((prev) => ({
        ...prev,
        endDate: "",
        pageNumber: 0,
      }));
    } else if (key === "brokerIDs") {
      let updatedBrokers = [];

      if (valueToRemove) {
        // remove just one broker ID
        updatedBrokers = (employeeMyTransactionSearch.brokerIDs || []).filter(
          (id) => id !== valueToRemove
        );
      } else {
        // ❗ clear all brokers if no specific value given
        updatedBrokers = [];
      }

      requestdata.BrokerIDs = updatedBrokers;

      setEmployeeMyTransactionSearch((prev) => ({
        ...prev,
        brokerIDs: updatedBrokers,
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
    if (employeeMyTransactionSearch.filterTrigger) {
      const filterKeys = [
        { key: "instrumentName" },
        { key: "quantity" },
        { key: "startDate" },
        { key: "endDate" },
        { key: "brokerIDs" },
      ];

      const snapshot = filterKeys
        .filter(({ key }) => employeeMyTransactionSearch[key])
        .flatMap(({ key }) => {
          const val = employeeMyTransactionSearch[key];
          if (!val) return [];

          if (key === "brokerIDs" && Array.isArray(val)) {
            return val.map((id) => ({
              key,
              value: id,
              label: brokerIdToName(id),
            }));
          }

          return [{ key, value: val, label: val }];
        });

      setSubmittedFilters(snapshot);

      setEmployeeMyTransactionSearch((prev) => ({
        ...prev,
        filterTrigger: false,
      }));
    }
  }, [employeeMyTransactionSearch.filterTrigger, brokerIdToName]);

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
        .flatMap(({ key }) => {
          const val = employeeMyTransactionSearch[key];
          if (!val) return [];

          if (key === "brokerIDs" && Array.isArray(val)) {
            return val.map((id) => ({
              key,
              value: id,
              label: brokerIdToName(id), // ✅ fix: add label
            }));
          }

          return [{ key, value: val, label: val }];
        });

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
        const mappedData = employeeTransactionsData?.transactions.map(
          (item) => ({
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
          })
        );

        // 🔹 Set approvals data
        setMyTransactionData(mappedData);

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
        setMyTransactionData([]);
      }
    } catch (error) {
      console.error("Error processing employee approvals:", error);
    } finally {
      // 🔹 Always stop loading state
      setLoadingMore(false);
    }
  }, [employeeTransactionsData]);

  // Inside your component
  useTableScrollBottom(
    async () => {
      // ✅ Only load more if there are still records left
      if (
        employeeTransactionsData?.totalRecords !== myTransactionData?.length
      ) {
        try {
          setLoadingMore(true);

          // ✅ Consistent assetKey fallback
          const assetKey =
            employeeMyTransactionSearch.assetType ||
            (addApprovalRequestData &&
            Object.keys(addApprovalRequestData).length > 0
              ? Object.keys(addApprovalRequestData)[0]
              : "Equities");

          const assetData = addApprovalRequestData?.[assetKey] || { items: [] };

          // ✅ Pass assetData to mapBuySellToIds
          const TypeIds = mapBuySellToIds(
            employeeMyTransactionSearch.type || [],
            assetData
          );

          // Build request payload
          const requestdata = {
            InstrumentName:
              employeeMyTransactionSearch.instrumentName ||
              employeeMyTransactionSearch.mainInstrumentName,
            Quantity: employeeMyTransactionSearch.quantity || 0,
            StartDate: employeeMyTransactionSearch.startDate
              ? toYYMMDD(employeeMyTransactionSearch.startDate)
              : "",
            EndDate: employeeMyTransactionSearch.endDate
              ? toYYMMDD(employeeMyTransactionSearch.endDate)
              : "",
            BrokerIDs: employeeMyTransactionSearch.brokerIDs || [],
            StatusIds: mapStatusToIds(employeeMyTransactionSearch.status),
            TypeIds: TypeIds || [],
            PageNumber: employeeMyTransactionSearch.pageNumber || 0,
            Length: employeeMyTransactionSearch.pageSize || 10,
          };

          console.log("Lazy load requestdata", requestdata);
          const data = await SearchEmployeeTransactionsDetails({
            callApi,
            showNotification,
            showLoader,
            requestdata,
            navigate,
          });

          if (!data) return;

          setEmployeeTransactionsData((prevState) => {
            const safePrev =
              prevState && typeof prevState === "object"
                ? prevState
                : { transactions: [], totalRecords: 0 };

            return {
              transactions: [
                ...(Array.isArray(safePrev.transactions)
                  ? safePrev.transactions
                  : []),
                ...(Array.isArray(data?.transactions) ? data.transactions : []),
              ],
              totalRecords: data?.totalRecords ?? safePrev.totalRecords,
            };
          });
        } catch (error) {
          console.error("Error loading more approvals:", error);
        } finally {
          setLoadingMore(false);
        }
      }
    },
    0,
    "border-less-table-blue" // Container selector
  );

  // -------------------- Render --------------------
  return (
    <>
      {/* 🔹 Active Filter Tags */}
      <div className={style["filter-tags-container"]}>
        {submittedFilters
          // Brokers ke case me handle alag se karenge
          .filter(({ key }) => key !== "brokerIDs")
          .map(({ key, value }) => (
            <div key={`${key}-${value}`} className={style["filter-tag"]}>
              <span className={style["filter-tag-text"]}>{value}</span>
              <span
                className={style["filter-tag-close"]}
                onClick={() => handleRemoveFilter(key, value)}
              >
                &times;
              </span>
            </div>
          ))}

        {/* 🔹 BrokerIDs ka special case */}
        {employeeMyTransactionSearch?.brokerIDs?.length === 1 &&
          submittedFilters
            .filter(({ key }) => key === "brokerIDs")
            .map(({ key, value, label }) => (
              <div key={`${key}-${value}`} className={style["filter-tag"]}>
                <span className={style["filter-tag-text"]}>{label}</span>
                <span
                  className={style["filter-tag-close"]}
                  onClick={() => handleRemoveFilter(key, value)}
                >
                  &times;
                </span>
              </div>
            ))}

        {employeeMyTransactionSearch?.brokerIDs?.length > 1 && (
          <div className={style["filter-tag"]}>
            <span>{"Multiple Brokers"}</span>
            <span
              className={style["filter-tag-close"]}
              onClick={() => handleRemoveFilter("brokerIDs")}
            >
              &times;
            </span>
          </div>
        )}
      </div>
      {/* 🔹 Transactions Table */}
      <Row>
        <Col>
          <PageLayout background="white" style={{ marginTop: "10px" }}>
            <div className="px-4 md:px-6 lg:px-8 ">
              <Row>
                <Col>
                  <h2 className={style["heading"]}>My Transactions</h2>
                </Col>
              </Row>
              <BorderlessTable
                rows={myTransactionData} // Replace with API data when ready
                columns={columns}
                classNameTable="border-less-table-blue"
                scroll={
                  myTransactionData?.length
                    ? {
                        x: "max-content",
                        y: submittedFilters.length > 0 ? 450 : 500,
                      }
                    : undefined
                }
                onChange={(pagination, filters, sorter) => {
                  setSortedInfo(sorter);
                }}
                loading={loadingMore}
              />
            </div>
          </PageLayout>
        </Col>
      </Row>
      {viewDetailTransactionModal && <ViewDetailsTransactionModal />}

      {/* To Show view Comment Modal */}
      {viewCommentTransactionModal && <ViewTransactionCommentModal />}

      {/* To show View Ticket Modal */}
      {isViewTicketTransactionModal && <ViewTicketTransactionModal />}
    </>
  );
};

export default MyTransaction;
