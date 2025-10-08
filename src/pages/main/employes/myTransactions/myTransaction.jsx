import React, { useEffect, useState, useRef } from "react";
import { Col, Row } from "antd";
import { useNavigate } from "react-router-dom";
import moment from "moment";

// 🔹 Components
import BorderlessTable from "../../../../components/tables/borderlessTable/borderlessTable";
import PageLayout from "../../../../components/pageContainer/pageContainer";
import EmptyState from "../../../../components/emptyStates/empty-states";
import ViewDetailsTransactionModal from "./modals/viewDetailsTransactionModal/ViewDetailsTransactionModal";
import ViewTransactionCommentModal from "./modals/viewTransactionCommentModal/ViewTransactionCommentModal";
import ViewTicketTransactionModal from "./modals/viewTicketTransactionModal/ViewTicketTransactionModal";

// 🔹 Table Config
import { getBorderlessTableColumns } from "./utill";
import { approvalStatusMap } from "../../../../components/tables/borderlessTable/utill";

// 🔹 Contexts
import { useSearchBarContext } from "../../../../context/SearchBarContaxt";
import { useApi } from "../../../../context/ApiContext";
import { useNotification } from "../../../../components/NotificationProvider/NotificationProvider";
import { useGlobalLoader } from "../../../../context/LoaderContext";
import { useTransaction } from "../../../../context/myTransaction";
import { useDashboardContext } from "../../../../context/dashboardContaxt";
import { useGlobalModal } from "../../../../context/GlobalModalContext";

// 🔹 API
import {
  GetAllTransactionViewDetails,
  SearchEmployeeTransactionsDetails,
} from "../../../../api/myTransactionsApi";

// 🔹 Utils
import {
  mapBuySellToIds,
  mapStatusToIds,
} from "../../../../components/dropdowns/filters/utils";
import { toYYMMDD } from "../../../../commen/funtions/rejex";

// 🔹 Styles
import style from "./myTransaction.module.css";
import { useTableScrollBottom } from "../../../../commen/funtions/scroll";
import { buildBrokerOptions } from "../../../../commen/funtions/brokersList";

/**
 * 📄 MyTransaction Component
 *
 * Displays employee transactions with filters, sorting, and infinite scrolling.
 * Integrates with:
 * - `SearchBarContext` for search/filter state
 * - `ApiContext` for API calls
 * - `LoaderContext` + `NotificationProvider` for feedback
 * - `DashboardContext` for brokers data
 * - `GlobalModal` for modal management
 *
 * @returns {JSX.Element}
 */
const MyTransaction = () => {
  const navigate = useNavigate();
  const hasFetched = useRef(false);

  // -------------------- Contexts --------------------
  const { callApi } = useApi();
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();
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
  const {
    viewDetailTransactionModal,
    setViewDetailTransactionModal,
    viewCommentTransactionModal,
    isViewTicketTransactionModal,
  } = useGlobalModal();

  // -------------------- Local State --------------------
  const [sortedInfo, setSortedInfo] = useState({});
  const [myTransactionData, setMyTransactionData] = useState([]);
  const [loadingMore, setLoadingMore] = useState(false);

  // -------------------- Helpers --------------------


  /**
   * Fetches transactions from API.
   * @param {boolean} flag - whether to show loader
   */
  const fetchApprovals = async (flag) => {
    if (flag) await showLoader(true);

    const requestdata = {
      InstrumentName: employeeMyTransactionSearch.instrumentName,
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
    console.log("requestdata", requestdata);
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
   * Fetches detailed view for a transaction.
   * @param {string} workFlowID
   */
  const handleViewDetailsForTransaction = async (workFlowID) => {
    await showLoader(true);

    const responseData = await GetAllTransactionViewDetails({
      callApi,
      showNotification,
      showLoader,
      requestdata: { TradeApprovalID: workFlowID },
      navigate,
    });

    if (responseData) {
      setEmployeeTransactionViewDetailData({
        ...responseData,
        TradeApprovalID: workFlowID,
      });
      setViewDetailTransactionModal(true);
    }
  };

  // -------------------- Effects --------------------

  // 🔹 Initial Fetch
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    fetchApprovals(true);

    // Reset search state for fresh load
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

  // 🔹 call api on search
  useEffect(() => {
    if (employeeMyTransactionSearch.filterTrigger) {
      fetchApprovals(true);
      setEmployeeMyTransactionSearch((prev) => ({
        ...prev,
        filterTrigger: false,
      }));
    }
  }, [employeeMyTransactionSearch.filterTrigger]);

  // 🔹 Refresh on MQTT update
  useEffect(() => {
    if (employeeTransactionsTableDataMqtt) {
      fetchApprovals(false);
      setEmployeeTransactionsTableDataMqtt(false);
    }
  }, [employeeTransactionsTableDataMqtt]);

  // 🔹 Normalize API data → table rows
  useEffect(() => {
    try {
      if (Array.isArray(employeeTransactionsData?.transactions)) {
        const mappedData = employeeTransactionsData.transactions.map(
          (item) => ({
            key: item.workFlowID,
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

        setMyTransactionData(mappedData);

        // Sync total records
        setEmployeeMyTransactionSearch((prev) => ({
          ...prev,
          totalRecords:
            prev.totalRecords !== employeeTransactionsData.totalRecords
              ? employeeTransactionsData.totalRecords
              : prev.totalRecords,
          pageNumber: mappedData.length,
        }));
      } else {
        setMyTransactionData([]);
      }
    } catch (error) {
      console.error("Error processing employee approvals:", error);
    } finally {
      setLoadingMore(false);
    }
  }, [employeeTransactionsData]);

  // 🔹 Infinite Scroll (lazy loading)
  useTableScrollBottom(
    async () => {
      if (
        employeeTransactionsData?.totalRecords !== myTransactionData?.length
      ) {
        try {
          setLoadingMore(true);

          const assetKey =
            employeeMyTransactionSearch.assetType ||
            Object.keys(addApprovalRequestData || {})[0] ||
            "Equities";

          const assetData = addApprovalRequestData?.[assetKey] || { items: [] };
          const TypeIds = mapBuySellToIds(
            employeeMyTransactionSearch.type || [],
            assetData
          );

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
            TypeIds,
            PageNumber: employeeMyTransactionSearch.pageNumber || 0,
            Length: employeeMyTransactionSearch.pageSize || 10,
          };

          const data = await SearchEmployeeTransactionsDetails({
            callApi,
            showNotification,
            showLoader,
            requestdata,
            navigate,
          });

          if (!data) return;

          setEmployeeTransactionsData((prevState) => ({
            transactions: [
              ...(prevState?.transactions || []),
              ...(data?.transactions || []),
            ],
            totalRecords: data?.totalRecords ?? prevState?.totalRecords,
          }));
        } catch (error) {
          console.error("Error loading more transactions:", error);
        } finally {
          setLoadingMore(false);
        }
      }
    },
    0,
    "border-less-table-blue"
  );

  // -------------------- Table Columns --------------------
  const columns = getBorderlessTableColumns({
    approvalStatusMap,
    sortedInfo,
    employeeMyTransactionSearch,
    setViewDetailTransactionModal,
    setEmployeeMyTransactionSearch,
    handleViewDetailsForTransaction,
  });

  /** 🔹 Handle removing individual filter */
  const handleRemoveFilter = (key) => {
    const resetMap = {
      instrumentName: { instrumentName: "" },
      dateRange: { startDate: null, endDate: null },
      quantity: { quantity: 0 },
      brokerIDs: { brokerIDs: [] },
    };

    setEmployeeMyTransactionSearch((prev) => ({
      ...prev,
      ...resetMap[key],
      pageNumber: 0,
      filterTrigger: true,
    }));
  };

  /** 🔹 Handle removing all filters */
  const handleRemoveAllFilters = () => {
    setEmployeeMyTransactionSearch((prev) => ({
      ...prev,
      instrumentName: "",
      startDate: null,
      endDate: null,
      quantity: 0,
      brokerIDs: [],
      pageNumber: 0,
      filterTrigger: true,
    }));
  };
  const brokerOptions = buildBrokerOptions(employeeBasedBrokersData);
  /** 🔹 Build Active Filters */
  const activeFilters = (() => {
    const { instrumentName, startDate, endDate, quantity, brokerIDs } =
      employeeMyTransactionSearch || {};

    return [
      instrumentName && {
        key: "instrumentName",
        value:
          instrumentName.length > 13
            ? instrumentName.slice(0, 13) + "..."
            : instrumentName,
      },
      startDate &&
        endDate && {
          key: "dateRange",
          value: `${startDate} → ${endDate}`,
        },
      quantity &&
        Number(quantity) > 0 && {
          key: "quantity",
          value: Number(quantity).toLocaleString("en-US"),
        },
      brokerIDs?.length > 0 && {
        key: "brokerIDs",
        value:
          brokerIDs.length === 1
            ? (() => {
                const broker = brokerOptions.find(
                  (b) => b.value === brokerIDs[0]
                );
                if (!broker) return "";
                return broker.label.length > 13
                  ? broker.label.slice(0, 13) + "..."
                  : broker.label;
              })()
            : "Multiple",
      },
    ].filter(Boolean);
  })();
  // -------------------- Render --------------------
  return (
    <>
      {/* 🔹 Active Filter Tags */}
      {activeFilters.length > 0 && (
        <Row gutter={[12, 12]} className={style["filter-tags-container"]}>
          {activeFilters.map(({ key, value }) => (
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

          {/* 🔹 Show Clear All only if more than one filter */}
          {activeFilters.length > 1 && (
            <Col>
              <div
                className={`${style["filter-tag"]} ${style["clear-all-tag"]}`}
                onClick={handleRemoveAllFilters}
              >
                <span>Clear All</span>
              </div>
            </Col>
          )}
        </Row>
      )}

      {/* 🔹 Transactions Table */}
      <PageLayout background="white" style={{ marginTop: "10px" }}
       className={activeFilters.length > 0 && "changeHeight"}>
        <div className="px-4 md:px-6 lg:px-8 ">
          <Row>
            <Col>
              <h2 className={style["heading"]}>My Transactions</h2>
            </Col>
          </Row>
          <BorderlessTable
            rows={myTransactionData}
            columns={columns}
            classNameTable="border-less-table-blue"
            scroll={
              myTransactionData?.length
                ? {
                    x: "max-content",
                    y: activeFilters.length > 0 ? 450 : 500,
                  }
                : undefined
            }
            onChange={(pagination, filters, sorter) => setSortedInfo(sorter)}
            loading={loadingMore}
          />
        </div>
      </PageLayout>

      {/* 🔹 Modals */}
      {viewDetailTransactionModal && <ViewDetailsTransactionModal />}
      {viewCommentTransactionModal && <ViewTransactionCommentModal />}
      {isViewTicketTransactionModal && <ViewTicketTransactionModal />}
    </>
  );
};

export default MyTransaction;
