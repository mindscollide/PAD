// src/pages/headOfComplianceOfficer/reconcile/ReconcilePortfolioHCO.jsx

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";

// 📦 Third-party
import moment from "moment";

// 🔹 Components
import BorderlessTable from "../../../../../components/tables/borderlessTable/borderlessTable";

// 🔹 Utils
import { getBorderlessTableColumns, mapToTableRows } from "./util";
import { approvalStatusMap } from "../../../../../components/tables/borderlessTable/utill";

// 🔹 Contexts
import { useSearchBarContext } from "../../../../../context/SearchBarContaxt";
import { useApi } from "../../../../../context/ApiContext";
import { useGlobalLoader } from "../../../../../context/LoaderContext";
import { useReconcileContext } from "../../../../../context/reconsileContax";

// 🔹 Hooks
import { useNotification } from "../../../../../components/NotificationProvider/NotificationProvider";
import { useTableScrollBottom } from "../../../employes/myApprovals/utill";

// 🔹 Helpers
import { toYYMMDD } from "../../../../../commen/funtions/rejex";
// import {
//   GetAllReconcilePortfolioTransactionRequest,
//   SearchHeadOfComplianceReconcilePortfolioRequest,
// } from "../../../../../api/reconsile";
import { useDashboardContext } from "../../../../../context/dashboardContaxt";
import { useGlobalModal } from "../../../../../context/GlobalModalContext";
import { usePortfolioContext } from "../../../../../context/portfolioContax";
import ViewDetailPortfolioTransaction from "./modals/viewDetailReconcileTransaction.jsx/ViewDetailPortfolioTransaction";

/**
 * 📌 ReconcilePortfolioHCO
 *
 * Displays and manages the **Reconcile → Portfolio tab** for
 * **Head of Compliance Officer (HCO)** role.
 *
 * Responsibilities:
 * - Fetch **HCO portfolio reconciliation data** (paginated + infinite scroll).
 * - Handle **real-time updates** from MQTT.
 * - Sync global state ↔ local table data.
 * - Manage search, filters, sorting, and cleanup.
 *
 * @component
 * @returns {JSX.Element} BorderlessTable with HCO reconcile portfolios.
 */
const ReconcilePortfolioHCO = () => {
  const navigate = useNavigate();

  // -------------------------
  // ✅ Context hooks
  // -------------------------
  const { callApi } = useApi();
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();
  const { viewDetailPortfolioTransaction } = useGlobalModal();

  const {
    headOfComplianceApprovalPortfolioSearch,
    setHeadOfComplianceApprovalPortfolioSearch,
    resetHeadOfComplianceApprovalPortfolioSearch,
  } = useSearchBarContext();

  const {
    reconcilePortfolioViewDetailData,
    setReconcilePortfolioViewDetailData,
  } = usePortfolioContext();

  const {
    setHeadOfComplianceApprovalPortfolioData,
    headOfComplianceApprovalPortfolioData,
    setHeadOfComplianceApprovalPortfolioMqtt,
    headOfComplianceApprovalPortfolioMqtt,
  } = useReconcileContext();

  const { addApprovalRequestData } = useDashboardContext();

  // -------------------------
  // ✅ Local state
  // -------------------------
  const [sortedInfo, setSortedInfo] = useState({});
  const [tableData, setTableData] = useState({ rows: [], totalRecords: 0 });
  const [loadingMore, setLoadingMore] = useState(false);

  // ----------------------------------------------------------------
  // 🔧 HELPERS
  // ----------------------------------------------------------------

  /**
   * Handle fetching of detailed transaction view.
   *
   * @async
   * @param {string|number} workFlowID - ID of the workflow to fetch details for.
   */
  const handleViewDetailsForReconcileTransaction = async (workFlowID) => {
    await showLoader(true);
    const requestdata = { TradeApprovalID: workFlowID };

    // const responseData = await GetAllReconcilePortfolioTransactionRequest({
    //   callApi,
    //   showNotification,
    //   showLoader,
    //   requestdata,
    //   navigate,
    // });

    // if (responseData) {
    //   setReconcilePortfolioViewDetailData(responseData);
    // }
  };

  /**
   * Build API request payload from search/filter state.
   *
   * @param {object} searchState - Current search/filter state.
   * @returns {object} API request payload.
   */
  const buildPortfolioRequest = (searchState = {}) => {
    const startDate = searchState.startDate
      ? toYYMMDD(searchState.startDate)
      : "";
    const endDate = searchState.endDate ? toYYMMDD(searchState.endDate) : "";

    return {
      RequesterName: searchState.requesterName || "",
      InstrumentName:
        searchState.mainInstrumentName || searchState.instrumentName || "",
      Quantity: searchState.quantity ? Number(searchState.quantity) : 0,
      StartDate: startDate,
      EndDate: endDate,
      StatusIds: searchState.status || [],
      TypeIds: searchState.type || [],
      PageNumber: Number(searchState.pageNumber) || 0,
      Length: Number(searchState.pageSize) || 10,
    };
  };

  /**
   * Merge new rows into existing table data.
   * Prevents duplicates by comparing `key`.
   *
   * @param {Array} prevRows - Existing table rows.
   * @param {Array} newRows - New rows to merge in.
   * @param {boolean} replace - If true, replaces rows instead of appending.
   * @returns {Array} Updated rows.
   */
  const mergeRows = (prevRows, newRows, replace = false) => {
    if (replace) return newRows;
    const ids = new Set(prevRows.map((r) => r.key));
    return [...prevRows, ...newRows.filter((r) => !ids.has(r.key))];
  };

  // ----------------------------------------------------------------
  // 🔹 API CALL: Fetch HCO reconcile portfolios
  // ----------------------------------------------------------------
  const fetchPortfolios = useCallback(
    async (requestData, replace = false, loader = false) => {
      if (!requestData || typeof requestData !== "object") return;
      // if (!loader) showLoader(true);

      // try {
      //   const res = await SearchHeadOfComplianceReconcilePortfolioRequest({
      //     callApi,
      //     showNotification,
      //     showLoader,
      //     requestdata: requestData,
      //     navigate,
      //   });

      //   const portfolios = Array.isArray(res?.portfolios) ? res.portfolios : [];
      //   const mapped = mapToTableRows(
      //     addApprovalRequestData?.Equities,
      //     portfolios
      //   );

      //   setHeadOfComplianceApprovalPortfolioData({
      //     data: mapped,
      //     totalRecords: res?.totalRecords ?? mapped.length,
      //     Apicall: true,
      //     replace,
      //   });
      // } catch (error) {
      //   console.error("❌ Error fetching HCO reconcile portfolios:", error);
      // } finally {
      //   if (!loader) showLoader(false);
      // }
    },
    [callApi, showNotification, showLoader, navigate]
  );

  // ----------------------------------------------------------------
  // 🔄 SYNC: Global → Local table data
  // ----------------------------------------------------------------
  useEffect(() => {
    if (!headOfComplianceApprovalPortfolioData?.Apicall) return;

    setTableData((prev) => ({
      rows: mergeRows(
        prev.rows || [],
        headOfComplianceApprovalPortfolioData.data,
        headOfComplianceApprovalPortfolioData.replace
      ),
      totalRecords: headOfComplianceApprovalPortfolioData.totalRecords || 0,
    }));

    setHeadOfComplianceApprovalPortfolioSearch((prev) => ({
      ...prev,
      totalRecords:
        headOfComplianceApprovalPortfolioData.totalRecords ??
        headOfComplianceApprovalPortfolioData.data.length,
      pageNumber: headOfComplianceApprovalPortfolioData.replace
        ? 10
        : prev.pageNumber,
    }));

    setHeadOfComplianceApprovalPortfolioData((prev) => ({
      ...prev,
      Apicall: false,
    }));
  }, [headOfComplianceApprovalPortfolioData?.Apicall]);

  // ----------------------------------------------------------------
  // 🔄 REAL-TIME: Handle MQTT updates
  // ----------------------------------------------------------------
  useEffect(() => {
    if (!headOfComplianceApprovalPortfolioMqtt) return;
    const requestData = {
      ...buildPortfolioRequest(headOfComplianceApprovalPortfolioSearch),
      PageNumber: 0,
    };

    fetchPortfolios(requestData, true);
    setHeadOfComplianceApprovalPortfolioSearch((prev) => ({
      ...prev,
      PageNumber: 0,
    }));

    setHeadOfComplianceApprovalPortfolioMqtt(false);
  }, [headOfComplianceApprovalPortfolioMqtt]);

  // ----------------------------------------------------------------
  // 🔄 On search/filter trigger
  // ----------------------------------------------------------------
  useEffect(() => {
    if (headOfComplianceApprovalPortfolioSearch?.filterTrigger) {
      const data = buildPortfolioRequest(
        headOfComplianceApprovalPortfolioSearch
      );

      fetchPortfolios(data, true);
      setHeadOfComplianceApprovalPortfolioSearch((prev) => ({
        ...prev,
        filterTrigger: false,
      }));
    }
  }, [headOfComplianceApprovalPortfolioSearch?.filterTrigger, fetchPortfolios]);

  // ----------------------------------------------------------------
  // 🔄 INFINITE SCROLL
  // ----------------------------------------------------------------
  useTableScrollBottom(
    async () => {
      if (
        headOfComplianceApprovalPortfolioSearch?.totalRecords <=
        tableData?.rows?.length
      )
        return;

      try {
        setLoadingMore(true);
        const requestData = {
          ...buildPortfolioRequest(headOfComplianceApprovalPortfolioSearch),
          PageNumber: headOfComplianceApprovalPortfolioSearch.pageNumber || 0,
          Length: 10,
        };
        await fetchPortfolios(requestData, false, true); // append mode
        setHeadOfComplianceApprovalPortfolioSearch((prev) => ({
          ...prev,
          pageNumber: (prev.pageNumber || 0) + 10,
        }));
      } catch (error) {
        console.error("❌ Error loading more HCO portfolios:", error);
      } finally {
        setLoadingMore(false);
      }
    },
    0,
    "border-less-table-blue"
  );

  // ----------------------------------------------------------------
  // 🔄 INITIAL LOAD (on mount)
  // ----------------------------------------------------------------
  const didFetchRef = useRef(false);
  useEffect(() => {
    if (didFetchRef.current) return;
    didFetchRef.current = true;

    const requestData = buildPortfolioRequest({ PageNumber: 0, Length: 10 });
    fetchPortfolios(requestData, true);

    try {
      const navigationEntries = performance.getEntriesByType("navigation");
      if (navigationEntries?.[0]?.type === "reload") {
        resetHeadOfComplianceApprovalPortfolioSearch();
      }
    } catch (error) {
      console.error("❌ Error detecting page reload:", error);
    }
  }, [fetchPortfolios, resetHeadOfComplianceApprovalPortfolioSearch]);

  // ----------------------------------------------------------------
  // 🔄 CLEANUP (on unmount)
  // ----------------------------------------------------------------
  useEffect(() => {
    return () => {
      setSortedInfo({});
      setTableData({ rows: [], totalRecords: 0 });
      setLoadingMore(false);
      resetHeadOfComplianceApprovalPortfolioSearch();
      setHeadOfComplianceApprovalPortfolioData({
        data: [],
        totalRecords: 0,
        Apicall: false,
      });
    };
  }, []);

  // ----------------------------------------------------------------
  // ✅ RENDER
  // ----------------------------------------------------------------
  const columns = getBorderlessTableColumns({
    approvalStatusMap,
    sortedInfo,
    headOfComplianceApprovalPortfolioSearch,
    setHeadOfComplianceApprovalPortfolioSearch,
    handleViewDetailsForReconcileTransaction,
  });

  return (
    <>
      <BorderlessTable
        rows={tableData?.rows || []}
        columns={columns}
        classNameTable="border-less-table-blue"
        scroll={
          tableData?.rows?.length ? { x: "max-content", y: 550 } : undefined
        }
        onChange={(_, __, sorter) => setSortedInfo(sorter || {})}
        loading={loadingMore}
      />
      {viewDetailPortfolioTransaction && <ViewDetailPortfolioTransaction />}
    </>
  );
};

export default ReconcilePortfolioHCO;
