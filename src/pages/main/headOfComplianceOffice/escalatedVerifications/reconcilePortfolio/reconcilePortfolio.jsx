// src/pages/headOfComplianceOfficer/reconcile/ReconcilePortfolioHCO.jsx

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";

// 📦 Third-party imports
import moment from "moment";

// 🔹 Component imports
import BorderlessTable from "../../../../../components/tables/borderlessTable/borderlessTable";

// 🔹 Utility imports
import { getBorderlessTableColumns, mapToTableRows } from "./util";
import { approvalStatusMap } from "../../../../../components/tables/borderlessTable/utill";

// 🔹 Context imports
import { useSearchBarContext } from "../../../../../context/SearchBarContaxt";
import { useApi } from "../../../../../context/ApiContext";
import { useGlobalLoader } from "../../../../../context/LoaderContext";
import { useReconcileContext } from "../../../../../context/reconsileContax";
import { useDashboardContext } from "../../../../../context/dashboardContaxt";
import { useGlobalModal } from "../../../../../context/GlobalModalContext";
import { usePortfolioContext } from "../../../../../context/portfolioContax";

// 🔹 Hook imports
import { useNotification } from "../../../../../components/NotificationProvider/NotificationProvider";
import { useTableScrollBottom } from "../../../employes/myApprovals/utill";

// 🔹 Helper imports
import { toYYMMDD } from "../../../../../commen/funtions/rejex";

// 🔹 Modal imports
import ViewDetailPortfolioTransaction from "./modals/viewDetailReconcileTransaction.jsx/ViewDetailPortfolioTransaction";
import { SearchHeadOfComplianceEscalatedPortfolioAPI } from "../../../../../api/reconsile";
import {
  mapBuySellToIds,
  mapStatusToIds,
} from "../../../../../components/dropdowns/filters/utils";

// 🔹 API imports (uncomment when ready)
// import {
//   GetAllReconcilePortfolioTransactionRequest,
//   SearchHeadOfComplianceReconcilePortfolioRequest,
// } from "../../../../../api/reconsile";

// =============================================================================
// 🎯 CONSTANTS & CONFIGURATION
// =============================================================================

/**
 * Configuration constants for the component
 */
const COMPONENT_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  TABLE_SCROLL_Y: 550,
  TABLE_CLASS_NAME: "border-less-table-blue",
  ASSET_TYPE: "Equities",
};

// =============================================================================
// 🎯 MAIN COMPONENT
// =============================================================================

/**
 * ReconcilePortfolioHCO Component
 *
 * Displays and manages the Reconcile → Portfolio tab for Head of Compliance Officer (HCO).
 * Handles fetching, displaying, and managing HCO portfolio reconciliation data with
 * support for infinite scroll, real-time updates, search, filtering, and detailed view modals.
 *
 * @component
 * @returns {JSX.Element} BorderlessTable with HCO reconcile portfolios
 */
const ReconcilePortfolioHCO = () => {
  const navigate = useNavigate();

  // ===========================================================================
  // 🎯 HOOKS & CONTEXTS
  // ===========================================================================

  // API & UI Contexts
  const { callApi } = useApi();
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();
  const { viewDetailPortfolioTransaction } = useGlobalModal();
  const { addApprovalRequestData } = useDashboardContext();

  // Search & Filter Contexts
  const {
    headOfComplianceApprovalPortfolioSearch,
    setHeadOfComplianceApprovalPortfolioSearch,
    resetHeadOfComplianceApprovalPortfolioSearch,
  } = useSearchBarContext();

  // Portfolio Data Contexts
  const {
    reconcilePortfolioViewDetailData,
    setReconcilePortfolioViewDetailData,
  } = usePortfolioContext();

  // Reconcile Data Contexts
  const {
    setHeadOfComplianceApprovalPortfolioData,
    headOfComplianceApprovalPortfolioData,
    setHeadOfComplianceApprovalPortfolioMqtt,
    headOfComplianceApprovalPortfolioMqtt,
  } = useReconcileContext();

  // ===========================================================================
  // 🎯 STATE MANAGEMENT
  // ===========================================================================

  const [sortedInfo, setSortedInfo] = useState({});
  const [tableData, setTableData] = useState({ rows: [], totalRecords: 0 });
  const [loadingMore, setLoadingMore] = useState(false);

  // Prevent duplicate API calls in StrictMode
  const didFetchRef = useRef(false);
  // ===========================================================================
  // 🎯 API FUNCTIONS
  // ===========================================================================

  /**
   * Fetches detailed portfolio transaction view for the modal
   *
   * @param {string} workFlowID - The workflow ID of the portfolio transaction to view
   */
  const handleViewDetailsForReconcileTransaction = async (workFlowID) => {
    await showLoader(true);
    const requestdata = { TradeApprovalID: workFlowID };

    // 🔹 Uncomment when API is ready
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
  // ===========================================================================
  // 🎯 DERIVED VALUES & MEMOIZATIONS
  // ===========================================================================

  /**
   * Table columns configuration
   */
  const columns = getBorderlessTableColumns({
    approvalStatusMap,
    sortedInfo,
    headOfComplianceApprovalPortfolioSearch,
    setHeadOfComplianceApprovalPortfolioSearch,
    handleViewDetailsForReconcileTransaction,
  });

  // ===========================================================================
  // 🎯 UTILITY FUNCTIONS
  // ===========================================================================

  /**
   * Builds API request payload from search/filter state
   *
   * @param {Object} searchState - Current search and filter state
   * @returns {Object} Formatted request payload for API
   */
  const buildPortfolioRequest = (searchState = {}) => {
    const RequestDateFrom = searchState.requestDateFrom
      ? toYYMMDD(searchState.requestDateFrom)
      : "";
    const RequestDateTo = searchState.requestDateTo
      ? toYYMMDD(searchState.requestDateTo)
      : "";
    const EscalatedDateFrom = searchState.escalatedDateFrom
      ? toYYMMDD(searchState.escalatedDateFrom)
      : "";
    const EscalatedDateTo = searchState.escalatedDateTo
      ? toYYMMDD(searchState.escalatedDateTo)
      : "";
    return {
      RequesterName: searchState.requesterName || "",
      InstrumentName:
        searchState.mainInstrumentName || searchState.instrumentName || "",
      Quantity: searchState.quantity ? Number(searchState.quantity) : 0,
      RequestDateFrom: RequestDateFrom,
      RequestDateTo: RequestDateTo,
      EscalatedDateFrom: EscalatedDateFrom,
      EscalatedDateTo: EscalatedDateTo,
      StatusIds: mapStatusToIds(searchState.status) || [],
      TypeIds:
        mapBuySellToIds(searchState.type, addApprovalRequestData?.Equities) ||
        [],
      PageNumber: Number(searchState.pageNumber) || 0,
      Length:
        Number(searchState.pageSize) || COMPONENT_CONFIG.DEFAULT_PAGE_SIZE,
    };
  };

  /**
   * Merges new rows into existing table data, ensuring no duplicates
   *
   * @param {Array} prevRows - Previous table rows
   * @param {Array} newRows - New rows to merge
   * @param {boolean} replace - Whether to replace existing rows
   * @returns {Array} Merged rows array
   */
  const mergeRows = (prevRows, newRows, replace = false) => {
    if (replace) return newRows;
    const ids = new Set(prevRows.map((r) => r.key));
    return [...prevRows, ...newRows.filter((r) => !ids.has(r.key))];
  };

  // ===========================================================================
  // 🎯 DATA FETCHING FUNCTIONS
  // ===========================================================================

  /**
   * Fetches HCO reconcile portfolios from API
   *
   * @param {Object} requestData - API request parameters
   * @param {boolean} replace - Whether to replace existing data
   * @param {boolean} loader - Whether to show loader during fetch
   */
  const fetchPortfolios = useCallback(
    async (requestData, replace = false, loader = false) => {
      if (!requestData || typeof requestData !== "object") return;

      if (!loader) showLoader(true);

      try {
        // 🔹 Uncomment when API is ready
        const res = await SearchHeadOfComplianceEscalatedPortfolioAPI({
          callApi,
          showNotification,
          showLoader,
          requestdata: requestData,
          navigate,
        });
        console.log("res", res);
        const portfolios = Array.isArray(res?.transactions)
          ? res.transactions
          : [];
        const mapped = mapToTableRows(
          addApprovalRequestData?.Equities,
          portfolios
        );
        console.log("res", mapped);

        setHeadOfComplianceApprovalPortfolioData({
          data: mapped,
          totalRecords: res?.totalRecords ?? mapped.length,
          Apicall: true,
          replace,
        });

        console.log("📊 Fetching HCO portfolios with:", requestData);
      } catch (error) {
        console.error("❌ Error fetching HCO reconcile portfolios:", error);
        showNotification({
          type: "error",
          message: "Failed to fetch portfolio data",
        });
      } finally {
        if (!loader) showLoader(false);
      }
    },
    [callApi, showNotification, showLoader, navigate, addApprovalRequestData]
  );

  // ===========================================================================
  // 🎯 EFFECTS - DATA SYNCING
  // ===========================================================================

  /**
   * Sync global portfolio data to local table state
   */
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

    // Sync pagination info with search context
    setHeadOfComplianceApprovalPortfolioSearch((prev) => ({
      ...prev,
      totalRecords:
        headOfComplianceApprovalPortfolioData.totalRecords ??
        headOfComplianceApprovalPortfolioData.data.length,
      pageNumber: headOfComplianceApprovalPortfolioData.replace
        ? COMPONENT_CONFIG.DEFAULT_PAGE_SIZE
        : prev.pageNumber,
    }));

    // Reset API trigger flag
    setHeadOfComplianceApprovalPortfolioData((prev) => ({
      ...prev,
      Apicall: false,
    }));
  }, [headOfComplianceApprovalPortfolioData?.Apicall]);

  /**
   * Handle real-time MQTT data updates
   */
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

    // Reset MQTT trigger
    setHeadOfComplianceApprovalPortfolioMqtt(false);
  }, [headOfComplianceApprovalPortfolioMqtt]);

  /**
   * Handle search/filter triggers
   */
  useEffect(() => {
    if (headOfComplianceApprovalPortfolioSearch?.filterTrigger) {
      const data = buildPortfolioRequest(
        headOfComplianceApprovalPortfolioSearch
      );

      fetchPortfolios(data, true); // replace mode
      setHeadOfComplianceApprovalPortfolioSearch((prev) => ({
        ...prev,
        filterTrigger: false,
      }));
    }
  }, [headOfComplianceApprovalPortfolioSearch?.filterTrigger, fetchPortfolios]);

  // ===========================================================================
  // 🎯 INFINITE SCROLL
  // ===========================================================================

  useTableScrollBottom(
    async () => {
      if (
        headOfComplianceApprovalPortfolioSearch?.totalRecords <=
        tableData?.rows?.length
      ) {
        return;
      }

      try {
        setLoadingMore(true);
        const requestData = {
          ...buildPortfolioRequest(headOfComplianceApprovalPortfolioSearch),
          PageNumber: headOfComplianceApprovalPortfolioSearch.pageNumber || 0,
        };

        await fetchPortfolios(requestData, false, true); // append mode
        setHeadOfComplianceApprovalPortfolioSearch((prev) => ({
          ...prev,
          pageNumber:
            (prev.pageNumber || 0) + COMPONENT_CONFIG.DEFAULT_PAGE_SIZE,
        }));
      } catch (error) {
        console.error("❌ Error loading more HCO portfolios:", error);
        showNotification({
          type: "error",
          message: "Failed to load more portfolio data",
        });
      } finally {
        setLoadingMore(false);
      }
    },
    0,
    COMPONENT_CONFIG.TABLE_CLASS_NAME
  );

  // ===========================================================================
  // 🎯 INITIALIZATION & CLEANUP
  // ===========================================================================

  /**
   * Initial data load on component mount
   */
  useEffect(() => {
    if (didFetchRef.current) return;
    didFetchRef.current = true;

    const requestData = buildPortfolioRequest({
      PageNumber: 0,
    });
    fetchPortfolios(requestData, true);

    // Reset search state on page reload
    try {
      const navigationEntries = performance.getEntriesByType("navigation");
      if (navigationEntries?.[0]?.type === "reload") {
        resetHeadOfComplianceApprovalPortfolioSearch();
      }
    } catch (error) {
      console.error("❌ Error detecting page reload:", error);
    }
  }, [fetchPortfolios, resetHeadOfComplianceApprovalPortfolioSearch]);

  /**
   * Cleanup on component unmount
   */
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

  // ===========================================================================
  // 🎯 RENDER
  // ===========================================================================

  return (
    <>
      <BorderlessTable
        rows={tableData?.rows || []}
        columns={columns}
        classNameTable={COMPONENT_CONFIG.TABLE_CLASS_NAME}
        scroll={
          tableData?.rows?.length
            ? { x: "max-content", y: COMPONENT_CONFIG.TABLE_SCROLL_Y }
            : undefined
        }
        onChange={(_, __, sorter) => setSortedInfo(sorter || {})}
        loading={loadingMore}
      />

      {/* View Detail Modal */}
      {viewDetailPortfolioTransaction && <ViewDetailPortfolioTransaction />}
    </>
  );
};

export default ReconcilePortfolioHCO;
