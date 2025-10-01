// src/pages/complianceOfficer/reconcile/EscalatedTransactionVerifications.jsx

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
import { useDashboardContext } from "../../../../../context/dashboardContaxt";
import { useReconcileContext } from "../../../../../context/reconsileContax";
import { useGlobalModal } from "../../../../../context/GlobalModalContext";

// 🔹 Hook imports
import { useNotification } from "../../../../../components/NotificationProvider/NotificationProvider";
import { useTableScrollBottom } from "../../../employes/myApprovals/utill";

// 🔹 API imports
import { SearchEmployeePendingUploadedPortFolio } from "../../../../../api/protFolioApi";
import { GetAllTransactionViewDetails } from "../../../../../api/myTransactionsApi";
import { SearchHeadOfComplianceEscalatedTransactionsAPI } from "../../../../../api/reconsile";

// 🔹 Helper imports
import {
  mapBuySellToIds,
  mapStatusToIds,
} from "../../../../../components/dropdowns/filters/utils";
import { toYYMMDD } from "../../../../../commen/funtions/rejex";

// 🔹 Modal imports
import ViewDetailReconcileTransaction from "./modals/viewDetailReconcileTransaction.jsx/ViewDetailReconcileTransaction";

// =============================================================================
// 🎯 CONSTANTS & CONFIGURATION
// =============================================================================

/**
 * Configuration constants for the component
 */
const COMPONENT_CONFIG = {
  ASSET_TYPE: "Equities",
  DEFAULT_PAGE_SIZE: 10,
  TABLE_SCROLL_Y: 550,
  TABLE_CLASS_NAME: "border-less-table-blue",
};

// =============================================================================
// 🎯 MAIN COMPONENT
// =============================================================================

/**
 * EscalatedTransactionVerifications Component
 *
 * Displays and manages the Reconcile → Transactions tab for Compliance Officers.
 * Handles fetching, displaying, and managing escalated transactions that require
 * reconciliation approval with support for infinite scroll, real-time updates,
 * search, filtering, and detailed view modals.
 *
 * @component
 * @returns {JSX.Element} Rendered component with transaction table and modals
 */
const EscalatedTransactionVerifications = () => {
  const navigate = useNavigate();

  // ===========================================================================
  // 🎯 HOOKS & CONTEXTS
  // ===========================================================================

  // API & UI Contexts
  const { callApi } = useApi();
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();
  const { viewDetailReconcileTransaction } = useGlobalModal();
  const { addApprovalRequestData } = useDashboardContext();

  // Search & Filter Contexts
  const {
    headOfComplianceApprovalEscalatedVerificationsSearch,
    setHeadOfComplianceApprovalEscalatedVerificationsSearch,
    resetHeadOfComplianceApprovalEscalatedVerificationsSearch,
  } = useSearchBarContext();

  // Reconcile Data Contexts
  const {
    setHeadOfComplianceApprovalEscalatedVerificationsData,
    headOfComplianceApprovalEscalatedVerificationsData,
    setHeadOfComplianceApprovalEscalatedVerificationsMqtt,
    headOfComplianceApprovalEscalatedVerificationsMqtt,
    setReconcileTransactionViewDetailData,
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
   * Fetches transaction view details for the reconcile modal
   *
   * @param {string} workFlowID - The workflow ID of the transaction to view
   */
  const handleViewDetailsForReconcileTransaction = async (workFlowID) => {
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
      setReconcileTransactionViewDetailData(responseData);
    }
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
    headOfComplianceApprovalEscalatedVerificationsSearch,
    setHeadOfComplianceApprovalEscalatedVerificationsSearch,
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
      StatusIds: mapStatusToIds(searchState.status)||[],
      TypeIds:
        mapBuySellToIds(searchState.type, addApprovalRequestData?.Equities) ||
        [],

      PageNumber: Number(searchState.pageNumber) || 0,
      Length:
        Number(searchState.pageSize) || 10,
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
   * Fetches pending approvals from API
   *
   * @param {Object} requestData - API request parameters
   * @param {boolean} replace - Whether to replace existing data
   * @param {boolean} loader - Whether to show loader during fetch
   */
  const fetchPendingApprovals = useCallback(
    async (requestData, replace = false, loader = false) => {
      if (!requestData || typeof requestData !== "object") return;

      if (!loader) showLoader(true);

      try {
        const res = await SearchHeadOfComplianceEscalatedTransactionsAPI({
          callApi,
          showNotification,
          showLoader,
          requestdata: requestData,
          navigate,
        });

        console.log("fetchPendingApprovals API Response:", res);

        const transactions = Array.isArray(res?.transactions)
          ? res.transactions
          : [];

        const mapped = mapToTableRows(
          addApprovalRequestData?.Equities,
          transactions
        );

        console.log("Mapped table data:", mapped);

        setHeadOfComplianceApprovalEscalatedVerificationsData({
          data: mapped,
          totalRecords: res?.totalRecords ?? mapped.length,
          Apicall: true,
          replace,
        });
      } catch (error) {
        console.error("❌ Error fetching pending approvals:", error);
        showNotification({
          type: "error",
          message: "Failed to fetch transactions",
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
   * Sync global transaction data to local table state
   */
  useEffect(() => {
    if (!headOfComplianceApprovalEscalatedVerificationsData?.Apicall) return;

    setTableData((prev) => ({
      rows: mergeRows(
        prev.rows || [],
        headOfComplianceApprovalEscalatedVerificationsData.data,
        headOfComplianceApprovalEscalatedVerificationsData.replace
      ),
      totalRecords:
        headOfComplianceApprovalEscalatedVerificationsData.totalRecords || 0,
    }));

    // Sync pagination info with search context
    setHeadOfComplianceApprovalEscalatedVerificationsSearch((prev) => ({
      ...prev,
      totalRecords:
        headOfComplianceApprovalEscalatedVerificationsData.totalRecords ??
        headOfComplianceApprovalEscalatedVerificationsData.data.length,
      pageNumber: headOfComplianceApprovalEscalatedVerificationsData.replace
        ? COMPONENT_CONFIG.DEFAULT_PAGE_SIZE
        : prev.pageNumber,
    }));

    // Reset API trigger flag
    setHeadOfComplianceApprovalEscalatedVerificationsData((prev) => ({
      ...prev,
      Apicall: false,
    }));
  }, [headOfComplianceApprovalEscalatedVerificationsData?.Apicall]);

  /**
   * Handle real-time MQTT data updates
   */
  useEffect(() => {
    if (headOfComplianceApprovalEscalatedVerificationsMqtt) {
      const requestData = {
        ...buildPortfolioRequest(
          headOfComplianceApprovalEscalatedVerificationsSearch
        ),
        PageNumber: 0,
      };

      fetchPendingApprovals(requestData, true);
      setHeadOfComplianceApprovalEscalatedVerificationsSearch((prev) => ({
        ...prev,
        PageNumber: 0,
      }));
      setHeadOfComplianceApprovalEscalatedVerificationsMqtt(false);
    }
  }, [headOfComplianceApprovalEscalatedVerificationsMqtt]);

  /**
   * Handle search/filter triggers
   */
  useEffect(() => {
    if (headOfComplianceApprovalEscalatedVerificationsSearch?.filterTrigger) {
      const data = buildPortfolioRequest(
        headOfComplianceApprovalEscalatedVerificationsSearch
      );

      fetchPendingApprovals(data, true); // replace mode
      setHeadOfComplianceApprovalEscalatedVerificationsSearch((prev) => ({
        ...prev,
        filterTrigger: false,
      }));
    }
  }, [
    headOfComplianceApprovalEscalatedVerificationsSearch?.filterTrigger,
    fetchPendingApprovals,
  ]);

  // ===========================================================================
  // 🎯 INFINITE SCROLL
  // ===========================================================================

  useTableScrollBottom(
    async () => {
      if (
        headOfComplianceApprovalEscalatedVerificationsSearch?.totalRecords <=
        tableData?.rows?.length
      ) {
        return;
      }

      try {
        setLoadingMore(true);
        const requestData = {
          ...buildPortfolioRequest(
            headOfComplianceApprovalEscalatedVerificationsSearch
          ),
          PageNumber:
            headOfComplianceApprovalEscalatedVerificationsSearch.pageNumber ||
            0,
          Length: COMPONENT_CONFIG.DEFAULT_PAGE_SIZE,
        };

        await fetchPendingApprovals(requestData, false, true); // append mode
        setHeadOfComplianceApprovalEscalatedVerificationsSearch((prev) => ({
          ...prev,
          pageNumber:
            (prev.pageNumber || 0) + COMPONENT_CONFIG.DEFAULT_PAGE_SIZE,
        }));
      } catch (error) {
        console.error("❌ Error loading more approvals:", error);
        showNotification({
          type: "error",
          message: "Failed to load more transactions",
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

    const requestData = buildPortfolioRequest(
      headOfComplianceApprovalEscalatedVerificationsSearch
    );
    fetchPendingApprovals(requestData, true);

    // Reset search state on page reload
    try {
      const navigationEntries = performance.getEntriesByType("navigation");
      if (navigationEntries?.[0]?.type === "reload") {
        resetHeadOfComplianceApprovalEscalatedVerificationsSearch();
      }
    } catch (error) {
      console.error("❌ Error detecting page reload:", error);
    }
  }, [
    fetchPendingApprovals,
    resetHeadOfComplianceApprovalEscalatedVerificationsSearch,
  ]);

  /**
   * Cleanup on component unmount
   */
  useEffect(() => {
    return () => {
      setSortedInfo({});
      setTableData({ rows: [], totalRecords: 0 });
      setLoadingMore(false);
      resetHeadOfComplianceApprovalEscalatedVerificationsSearch();
      setHeadOfComplianceApprovalEscalatedVerificationsData({
        data: [],
        totalRecords: 0,
        Apicall: false,
      });
      setHeadOfComplianceApprovalEscalatedVerificationsMqtt(false);
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
      {viewDetailReconcileTransaction && <ViewDetailReconcileTransaction />}
    </>
  );
};

export default EscalatedTransactionVerifications;
