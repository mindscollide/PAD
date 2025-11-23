import React, { useEffect, useState, useRef, useCallback } from "react";
import { Breadcrumb, Col, Row } from "antd";
import { useNavigate } from "react-router-dom";

// 🔹 Table Config
import {
  buildApiRequest,
  getBorderlessTableColumns,
  mapEmployeeTransactions,
} from "./utill";

// 🔹 Contexts
import { useSearchBarContext } from "../../../../../context/SearchBarContaxt";
import { useApi } from "../../../../../context/ApiContext";
import { useGlobalLoader } from "../../../../../context/LoaderContext";
import { useTransaction } from "../../../../../context/myTransaction";
import { useDashboardContext } from "../../../../../context/dashboardContaxt";

// 🔹 API

// 🔹 Styles
import style from "./mytradeapprovals.module.css";
import { buildBrokerOptions } from "../../../../../common/funtions/brokersList";
import { useTableScrollBottom } from "../../../../../common/funtions/scroll";
import { getSafeAssetTypeData } from "../../../../../common/funtions/assetTypesList";
import { BorderlessTable, PageLayout } from "../../../../../components";
import { approvalStatusMap } from "../../../../../components/tables/borderlessTable/utill";
import { useNotification } from "../../../../../components/NotificationProvider/NotificationProvider";
import { GetAllTransactionViewDetails } from "../../../../../api/myTransactionsApi";
import { useGlobalModal } from "../../../../../context/GlobalModalContext";
import { SearchMyTradeApprovalsReportsApi } from "../../../../../api/myApprovalApi";

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
const MytradeapprovalsReport = () => {
  const navigate = useNavigate();
  const hasFetched = useRef(false);
  const tableScrollEmployeeTransaction = useRef(null);

  // -------------------- Contexts --------------------
  const { callApi } = useApi();
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();

  const {
    assetTypeListingData,
    setAssetTypeListingData,
    employeeBasedBrokersData,
  } = useDashboardContext();

  const {
    employeeMyTradeApprovalsSearch,
    setEmployeeMyTradeApprovalsSearch,
    resetEmployeMyTradeApprovalsSearch,
  } = useSearchBarContext();

  const {
    employeeMyTradeApprovalsData,
    setEmployeeMyTradeApprovalsData,
    employeeMyTradeApprovalsMqtt,
    setEmployeeMyTradeApprovalMqtt,
    resetMyTradeApprovalsState,
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

      const res = await SearchMyTradeApprovalsReportsApi({
        callApi,
        showNotification,
        showLoader,
        requestdata: requestData,
        navigate,
      });
      console.log("res".res);
      // ✅ Always get the freshest version (from memory or session)
      const currentAssetTypeData = getSafeAssetTypeData(
        assetTypeListingData,
        setAssetTypeListingData
      );

      const myTradeApprovals = Array.isArray(res?.myTradeApprovals)
        ? res.myTradeApprovals
        : [];
      //   console.log("transactions", transactions);
      const mapped = mapEmployeeTransactions(
        currentAssetTypeData?.Equities,
        myTradeApprovals
      );
      //   if (!mapped || typeof mapped !== "object") return;
      //   console.log("transactions", mapped);

      setEmployeeMyTradeApprovalsData((prev) => ({
        myTradeApprovals: replace
          ? mapped
          : [...(prev?.myTradeApprovals || []), ...mapped],
        // this is for to run lazy loading its data comming from database of total data in db
        totalRecordsDataBase: res?.totalRecords || 0,
        // this is for to know how mush dta currently fetch from  db
        totalRecordsTable: replace
          ? mapped.length
          : employeeMyTradeApprovalsData.totalRecordsTable + mapped.length,
      }));
      setEmployeeMyTradeApprovalsSearch((prev) => {
        const next = {
          ...prev,
          pageNumber: replace ? mapped.length : prev.pageNumber + mapped.length,
        };

        // this is for check if filter value get true only on that it will false
        if (prev.filterTrigger) {
          next.filterTrigger = false;
        }

        return next;
      });
    },
    [
      assetTypeListingData,
      callApi,
      navigate,
      setEmployeeMyTradeApprovalsSearch,
      showLoader,
      showNotification,
    ]
  );

  /**
   * Fetches detailed view for a transaction.
   * @param {string} workFlowID
   */
  const handleViewDetailsForTransaction = async (workFlowID) => {
    // await showLoader(true);
    // const responseData = await GetAllTransactionViewDetails({
    //   callApi,
    //   showNotification,
    //   showLoader,
    //   requestdata: { TradeApprovalID: workFlowID },
    //   navigate,
    // });
    // if (responseData) {
    //   setEmployeeTransactionViewDetailData({
    //     ...responseData,
    //     TradeApprovalID: workFlowID,
    //   });
    //   setViewDetailTransactionModal(true);
    // }
  };

  // -------------------- Effects --------------------

  // 🔹 Initial Fetch
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    const requestData = buildApiRequest(
      employeeMyTradeApprovalsSearch,
      assetTypeListingData
    );
    fetchApiCall(requestData, true, true);
  }, []);

  // Reset on Unmount
  useEffect(() => {
    return () => {
      // Reset search state for fresh load
      resetEmployeMyTradeApprovalsSearch();
    };
  }, []);

  // 🔹 call api on search
  useEffect(() => {
    if (employeeMyTradeApprovalsSearch.filterTrigger) {
      const requestData = buildApiRequest(
        employeeMyTradeApprovalsSearch,
        assetTypeListingData
      );
      fetchApiCall(requestData, true, true);
    }
  }, [employeeMyTradeApprovalsSearch.filterTrigger]);

  // 🔹 Refresh on MQTT update
  useEffect(() => {
    if (employeeMyTradeApprovalsMqtt) {
      let requestData = buildApiRequest(
        employeeMyTradeApprovalsSearch,
        assetTypeListingData
      );
      requestData = {
        ...requestData,
        PageNumber: 0,
      };
      fetchApiCall(requestData, true, false);
      setEmployeeMyTradeApprovalMqtt(false);
    }
  }, [employeeMyTradeApprovalsMqtt]);

  // 🔹 Infinite Scroll (lazy loading)
  useTableScrollBottom(
    async () => {
      if (
        employeeMyTradeApprovalsData?.totalRecordsDataBase <=
        employeeMyTradeApprovalsData?.totalRecordsTable
      )
        return;

      try {
        setLoadingMore(true);
        const requestData = buildApiRequest(
          employeeMyTradeApprovalsSearch,
          assetTypeListingData
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
    employeeMyTradeApprovalsSearch,
    setViewDetailTransactionModal,
    setEmployeeMyTradeApprovalsSearch,
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

    setEmployeeMyTradeApprovalsSearch((prev) => ({
      ...prev,
      ...resetMap[key],
      pageNumber: 0,
      filterTrigger: true,
    }));
  };

  /** 🔹 Handle removing all filters */
  const handleRemoveAllFilters = () => {
    setEmployeeMyTradeApprovalsSearch((prev) => ({
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
      employeeMyTradeApprovalsSearch || {};

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

      <Row justify="start" align="middle" className={style.breadcrumbRow}>
        <Col>
          <Breadcrumb
            separator=">"
            className={style.customBreadcrumb}
            items={[
              {
                title: (
                  <span
                    onClick={() => navigate("/PAD/reports")}
                    className={style.breadcrumbLink}
                  >
                    Rports
                  </span>
                ),
              },
              {
                title: (
                  <span className={style.breadcrumbText}>
                    My Trade Approvals
                  </span>
                ),
              },
            ]}
          />
        </Col>
      </Row>
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
        style={{ marginTop: "2px" }}
        className={
          activeFilters.length > 0 ? "changeHeightreports" : "repotsHeight"
        }
      >
        <div className="px-4 md:px-6 lg:px-8 ">
          <BorderlessTable
            rows={employeeMyTradeApprovalsData?.transactions}
            columns={columns}
            classNameTable="border-less-table-blue"
            scroll={
              employeeMyTradeApprovalsData?.transactions?.length
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
    </>
  );
};

export default MytradeapprovalsReport;
