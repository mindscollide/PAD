// src/pages/headOfComplianceOfficer/reconcile/ReconcilePortfolioHCO.jsx

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";

// 🔹 Component imports
import BorderlessTable from "../../../../../components/tables/borderlessTable/borderlessTable";

// 🔹 Utility imports
import {
  buildApiRequest,
  getBorderlessTableColumns,
  mapToTableRows,
} from "./util";
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

// 🔹 Modal imports
import {
  GetAllComplianceOfficerReconcileTransactionAndPortfolioRequest,
  SearchHeadOfComplianceEscalatedPortfolioAPI,
} from "../../../../../api/reconsile";

import ViewDetailHeadOfComplianceReconcilePortfolio from "./modals/viewDetailHeadOfComplianceReconcilePortfolio/ViewDetailHeadOfComplianceReconcilePortfolio";
import ViewReconcilePortfolioComment from "./modals/viewEscalatedPortfolioComment/ViewReconcilePortfolioComment";
import NoteHeadOfCompliancePortfolioModal from "./modals/noteHeadOfCompliancePortfolioModal/NoteHeadOfCompliancePortfolioModal";
import ApproveHeadOfCompliancePortfolioModal from "./modals/approveHeadOfCompliancePortfolioModal/ApproveHeadOfCompliancePortfolioModal";
import DeclinedHeadOfCompliancePortfolioModal from "./modals/declinedHeadOfCompliancePortfolioModal/DeclinedHeadOfCompliancePortfolioModal";
import { useTableScrollBottom } from "../../../../../common/funtions/scroll";
import { getSafeAssetTypeData } from "../../../../../common/funtions/assetTypesList";

// 🔹 API imports (uncomment when ready)
// import {
//   GetAllReconcilePortfolioTransactionRequest,
//   SearchHeadOfComplianceReconcilePortfolioRequest,
// } from "../../../../../api/reconsile";

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
const ReconcilePortfolioHCO = ({ activeFilters }) => {
  const navigate = useNavigate();

  // ===========================================================================
  // 🎯 HOOKS & CONTEXTS
  // ===========================================================================

  // API & UI Contexts
  const { callApi } = useApi();
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();
  const {
    viewDetailHeadOfComplianceEscalatedPortfolio,
    setViewDetailHeadOfComplianceEscalatedPortfolio,
    viewCommentPortfolioModal,
    compliantApproveModal,
    nonCompliantDeclineModal,
    noteGlobalModal,
  } = useGlobalModal();
  const { assetTypeListingData, setAssetTypeListingData } =
    useDashboardContext();

  // Search & Filter Contexts
  const {
    headOfComplianceApprovalPortfolioSearch,
    setHeadOfComplianceApprovalPortfolioSearch,
    resetHeadOfComplianceApprovalPortfolioSearch,
  } = useSearchBarContext();

  // Portfolio Data Contexts
  const { setIsEscalatedPortfolioHeadOfComplianceViewDetailData } =
    usePortfolioContext();

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
  const [loadingMore, setLoadingMore] = useState(false);

  // Prevent duplicate API calls in StrictMode
  const didFetchRef = useRef(false);
  const tableScrollHCAEcalatedVerification = useRef(null);

  // ===========================================================================
  // 🎯 API FUNCTIONS
  // ===========================================================================

  /**
   * Fetches transaction view details for the reconcile modal
   *
   * @param {string} workFlowID - The workflow ID of the transaction to view
   */
  const handleViewDetailsHeadOfComplianceForPortfolioTransaction = async (
    workFlowID
  ) => {
    await showLoader(true);
    const requestdata = { TradeApprovalID: workFlowID };

    const responseData =
      await GetAllComplianceOfficerReconcileTransactionAndPortfolioRequest({
        callApi,
        showNotification,
        showLoader,
        requestdata,
        navigate,
      });

    if (responseData) {
      setIsEscalatedPortfolioHeadOfComplianceViewDetailData(responseData);
      setViewDetailHeadOfComplianceEscalatedPortfolio(true);
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
    headOfComplianceApprovalPortfolioSearch,
    setHeadOfComplianceApprovalPortfolioSearch,
    onViewDetail: handleViewDetailsHeadOfComplianceForPortfolioTransaction,
  });

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
  const fetchApiCall = useCallback(
    async (requestData, replace = false, showLoaderFlag = true) => {
      if (!requestData || typeof requestData !== "object") return;

      if (showLoaderFlag) showLoader(true);

      try {
        // 🔹 Uncomment when API is ready
        const res = await SearchHeadOfComplianceEscalatedPortfolioAPI({
          callApi,
          showNotification,
          showLoader,
          requestdata: requestData,
          navigate,
        });

        // ✅ Always get the freshest version (from memory or session)
        const currentAssetTypeData = getSafeAssetTypeData(
          assetTypeListingData,
          setAssetTypeListingData
        );

        const escalatedPortfolio = Array.isArray(res?.transactions)
          ? res.transactions
          : [];

        const mapped = mapToTableRows(
          currentAssetTypeData?.Equities,
          escalatedPortfolio
        );
        console.log("res", mapped);

        setHeadOfComplianceApprovalPortfolioData((prev) => ({
          escalatedPortfolio: replace
            ? mapped
            : [...(prev?.escalatedPortfolio || []), ...mapped],
          // this is for to run lazy loading its data comming from database of total data in db
          totalRecordsDataBase: res.totalRecords || 0,
          // this is for to know how mush dta currently fetch from  db
          totalRecordsTable: replace
            ? mapped.length
            : headOfComplianceApprovalPortfolioData.totalRecordsTable +
              mapped.length,
        }));

        setHeadOfComplianceApprovalPortfolioSearch((prev) => {
          const next = {
            ...prev,
            pageNumber: replace
              ? mapped.length
              : prev.pageNumber + mapped.length,
          };
          // this is for check if filter value get true only on that it will false
          if (prev.filterTrigger) {
            next.filterTrigger = false;
          }

          return next;
        });
      } catch (error) {
        console.error("❌ Error fetching HCO reconcile portfolios:", error);
        showNotification({
          type: "error",
          message: "Failed to fetch escalated portfolio data",
        });
      } finally {
        if (showLoaderFlag) showLoader(false);
      }
    },
    [callApi, showNotification, showLoader, navigate, assetTypeListingData]
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

    const requestData = buildApiRequest(
      headOfComplianceApprovalPortfolioSearch,
      assetTypeListingData
    );
    fetchApiCall(requestData, true, true);

    // Reset search state on page reload
    try {
      const navigationEntries = performance.getEntriesByType("navigation");
      if (navigationEntries?.[0]?.type === "reload") {
        resetHeadOfComplianceApprovalPortfolioSearch();
      }
    } catch (error) {
      console.error("❌ Error detecting page reload:", error);
    }
  }, [fetchApiCall, resetHeadOfComplianceApprovalPortfolioSearch]);

  // ===========================================================================
  // 🎯 EFFECTS - DATA SYNCING
  // ===========================================================================
  /**
   * Handle real-time MQTT data updates
   */
  useEffect(() => {
    if (!headOfComplianceApprovalPortfolioMqtt) return;

    let requestData = buildApiRequest(
      headOfComplianceApprovalPortfolioSearch,
      assetTypeListingData
    );
    requestData = {
      ...requestData,
      PageNumber: 0,
    };
    fetchApiCall(requestData, true, false);
    // Reset MQTT trigger
    setHeadOfComplianceApprovalPortfolioMqtt(false);
  }, [headOfComplianceApprovalPortfolioMqtt]);

  /**
   * Handle search/filter triggers
   */
  useEffect(() => {
    if (headOfComplianceApprovalPortfolioSearch?.filterTrigger) {
      const requestData = buildApiRequest(
        headOfComplianceApprovalPortfolioSearch,
        assetTypeListingData
      );

      fetchApiCall(requestData, true, true); // replace mode
    }
  }, [headOfComplianceApprovalPortfolioSearch?.filterTrigger, fetchApiCall]);

  // ===========================================================================
  // 🎯 INFINITE SCROLL
  // ===========================================================================

  useTableScrollBottom(
    async () => {
      if (
        headOfComplianceApprovalPortfolioData?.totalRecordsDataBase <=
        headOfComplianceApprovalPortfolioData?.totalRecordsTable
      ) {
        return;
      }

      try {
        setLoadingMore(true);
        const requestData = buildApiRequest(
          headOfComplianceApprovalPortfolioSearch,
          assetTypeListingData
        );

        await fetchApiCall(requestData, false, false); // append mode
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
    "border-less-table-blue"
  );

  /**
   * Cleanup on component unmount
   */
  useEffect(() => {
    return () => {
      setSortedInfo({});
      setLoadingMore(false);
      resetHeadOfComplianceApprovalPortfolioSearch();
      setHeadOfComplianceApprovalPortfolioData({
        escalatedPortfolio: [],
        totalRecordsDataBase: 0,
        totalRecordsTable: 0,
      });
    };
  }, []);

  // ===========================================================================
  // 🎯 RENDER
  // ===========================================================================

  return (
    <>
      <BorderlessTable
        rows={headOfComplianceApprovalPortfolioData?.escalatedPortfolio || []}
        columns={columns}
        classNameTable={"border-less-table-blue"}
        scroll={
          headOfComplianceApprovalPortfolioData?.escalatedPortfolio?.length
            ? {
                x: "max-content",
                y: activeFilters.length > 0 ? 450 : 500,
              }
            : undefined
        }
        onChange={(_, __, sorter) => setSortedInfo(sorter || {})}
        loading={loadingMore}
        ref={tableScrollHCAEcalatedVerification}
      />

      {/* View Detail Modal */}
      {viewDetailHeadOfComplianceEscalatedPortfolio && (
        <ViewDetailHeadOfComplianceReconcilePortfolio />
      )}

      {/* To Show Note Modal when Click on Note from the Escalated Portfolio */}
      {noteGlobalModal && <NoteHeadOfCompliancePortfolioModal />}

      {/* View Comment Modal Open When Click On Portfolio View Comment */}
      {viewCommentPortfolioModal && <ViewReconcilePortfolioComment />}

      {/* To SHow Approved Compliant Modal WHen APi is succes */}
      {compliantApproveModal && <ApproveHeadOfCompliancePortfolioModal />}

      {/* To SHow Approved Non-Compliant Modal WHen APi is succes */}
      {nonCompliantDeclineModal && <DeclinedHeadOfCompliancePortfolioModal />}
    </>
  );
};

export default ReconcilePortfolioHCO;
