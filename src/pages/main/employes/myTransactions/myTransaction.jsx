import React, { useEffect, useState, useRef, useCallback } from "react";
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
import {
  buildApiRequest,
  getBorderlessTableColumns,
  mapEmployeeTransactions,
} from "./utill";
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

// 🔹 Styles
import style from "./myTransaction.module.css";
import { buildBrokerOptions } from "../../../../common/funtions/brokersList";
import { useTableScrollBottom } from "../../../../common/funtions/scroll";

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
  const tableScrollEmployeeTransaction = useRef(null);

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
  const [loadingMore, setLoadingMore] = useState(false);

  // -------------------- Helpers --------------------

  /**
   * Fetches transactions from API.
   * @param {boolean} flag - whether to show loader
   */
  const fetchApiCall = useCallback(
    async (requestData, replace = false, showLoaderFlag = true) => {
      if (!requestData || typeof requestData !== "object") return;
      if (showLoaderFlag) showLoader(true);

      const res = await SearchEmployeeTransactionsDetails({
        callApi,
        showNotification,
        showLoader,
        requestdata: requestData,
        navigate,
      });
      const transactions = Array.isArray(res?.transactions)
        ? res.transactions
        : [];
      const mapped = mapEmployeeTransactions(
        addApprovalRequestData?.Equities,
        transactions
      );
      if (!mapped || typeof mapped !== "object") return;

      setEmployeeTransactionsData((prev) => ({
        transactions: replace
          ? mapped
          : [...(prev?.transactions || []), ...mapped],
        // this is for to run lazy loading its data comming from database of total data in db
        totalRecordsDataBase: res?.totalRecords,
        // this is for to know how mush dta currently fetch from  db
        totalRecordsTable: replace
          ? mapped.length
          : employeeTransactionsData.totalRecordsTable + mapped.length,
      }));
      setEmployeeMyTransactionSearch((prev) => {
        const next = {
          ...prev,
          pageNumber: replace ? mapped.length : prev.pageNumber + mapped.length,
        };

        if (prev.filterTrigger) {
          next.filterTrigger = false;
        }

        return next;
      });
    },
    [
      addApprovalRequestData,
      callApi,
      navigate,
      setEmployeeMyTransactionSearch,
      showLoader,
      showNotification,
    ]
  );

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
    const requestData = buildApiRequest(
      employeeMyTransactionSearch,
      addApprovalRequestData
    );
    fetchApiCall(requestData, true, true);

    // Reset search state for fresh load
    resetEmployeeMyTransactionSearch();
  }, []);

  // 🔹 call api on search
  useEffect(() => {
    if (employeeMyTransactionSearch.filterTrigger) {
      const requestData = buildApiRequest(
        employeeMyTransactionSearch,
        addApprovalRequestData
      );
      fetchApiCall(requestData, true, true);
    }
  }, [employeeMyTransactionSearch.filterTrigger]);

  // 🔹 Refresh on MQTT update
  useEffect(() => {
    if (employeeTransactionsTableDataMqtt) {
      const requestData = buildApiRequest(
        employeeMyTransactionSearch,
        addApprovalRequestData
      );
      fetchApiCall(requestData, true, true);
      setEmployeeTransactionsTableDataMqtt(false);
    }
  }, [employeeTransactionsTableDataMqtt]);

  // 🔹 Infinite Scroll (lazy loading)
  useTableScrollBottom(
    async () => {
      if (
        employeeTransactionsData?.totalRecordsDataBase ===
        employeeTransactionsData?.totalRecordsTable
      )
        return;

      try {
        setLoadingMore(true);
        const requestData = buildApiRequest(
          employeeMyTransactionSearch,
          addApprovalRequestData
        );
        await fetchApiCall(requestData, false, false);
      } catch (err) {
        console.error("Error loading more approvals:", err);
      } finally {
        setLoadingMore(false);
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
      <PageLayout
        background="white"
        style={{ marginTop: "10px" }}
        className={activeFilters.length > 0 && "changeHeight"}
      >
        <div className="px-4 md:px-6 lg:px-8 ">
          <Row>
            <Col>
              <h2 className={style["heading"]}>My Transactions</h2>
            </Col>
          </Row>
          <BorderlessTable
            rows={employeeTransactionsData.transactions}
            columns={columns}
            classNameTable="border-less-table-blue"
            scroll={
              employeeTransactionsData.transactions?.length
                ? {
                    x: "max-content",
                    y: activeFilters.length > 0 ? 450 : 500,
                  }
                : undefined
            }
            onChange={(pagination, filters, sorter) => setSortedInfo(sorter)}
            loading={loadingMore}
            ref={tableScrollEmployeeTransaction}
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
