// src/pages/complianceOfficer/reconcile/EscalatedTransactionVerifications.jsx

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
import { useDashboardContext } from "../../../../../context/dashboardContaxt";
import { useReconcileContext } from "../../../../../context/reconsileContax";
import { useGlobalModal } from "../../../../../context/GlobalModalContext";

// 🔹 Hook imports
import { useNotification } from "../../../../../components/NotificationProvider/NotificationProvider";

// 🔹 API imports
import {
  GetAllComplianceOfficerReconcileTransactionAndPortfolioRequest,
  SearchHeadOfComplianceEscalatedTransactionsAPI,
} from "../../../../../api/reconsile";

// 🔹 Helper imports
import ViewDetailHeadOfComplianceReconcileTransaction from "./modals/viewDetailHeadOfComplianceReconcileTransactions/ViewDetailHeadOfComplianceReconcileTransaction";
import UploadHeadOfComplianceTicketModal from "./modals/uploadHeadOfComplianceTicketModal/UploadHeadOfComplianceTicketModal";
import NoteHeadOfComplianceModal from "./modals/noteHeadOfComplianceModal/NoteHeadOfComplianceModal";
import ApproveHeadOfComplianceModal from "./modals/approveHeadOfComplianceModal/ApproveHeadOfComplianceModal";
import DeclinedHeadOfComplianceModal from "./modals/declinedHeadOfComplianceModal/DeclinedHeadOfComplianceModal";
import ViewTicketEscalatedModal from "./modals/viewTicketEscalatedModal/ViewTicketEscalatedModal";
import { useTableScrollBottom } from "../../../../../common/funtions/scroll";
import { getSafeAssetTypeData } from "../../../../../common/funtions/assetTypesList";

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
const EscalatedTransactionVerifications = ({ activeFilters }) => {
  const navigate = useNavigate();
  // ===========================================================================
  // 🎯 STATE MANAGEMENT
  // ===========================================================================

  const [sortedInfo, setSortedInfo] = useState({});
  const [loadingMore, setLoadingMore] = useState(false);

  // Prevent duplicate API calls in StrictMode
  const didFetchRef = useRef(false);
  const tableScrollHCAEcalatedPortfolio = useRef(null);

  // ===========================================================================
  // 🎯 HOOKS & CONTEXTS
  // ===========================================================================

  // API & UI Contexts
  const { callApi } = useApi();
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();
  const {
    viewDetailHeadOfComplianceEscalated,
    setViewDetailHeadOfComplianceEscalated,
    uploadComplianceModal,
    noteGlobalModal,
    compliantApproveModal,
    nonCompliantDeclineModal,
    isViewTicketTransactionModal,
  } = useGlobalModal();
  const { assetTypeListingData, setAssetTypeListingData } =
    useDashboardContext();

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
    setIsEscalatedHeadOfComplianceViewDetailData,
  } = useReconcileContext();

  // ===========================================================================
  // 🎯 API FUNCTIONS
  // ===========================================================================

  /**
   * Fetches transaction view details for the reconcile modal
   *
   * @param {string} workFlowID - The workflow ID of the transaction to view
   */
  const handleViewDetailsHeadOfComplianceForReconcileTransaction = async (
    workFlowID
  ) => {
    console.log("handleViewDetailsHeadOfComplianceForReconcileTransaction");
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
      setIsEscalatedHeadOfComplianceViewDetailData(responseData);
      setViewDetailHeadOfComplianceEscalated(true);
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
    onViewDetail: handleViewDetailsHeadOfComplianceForReconcileTransaction,
  });

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
  const fetchApiCall = useCallback(
    async (requestData, replace = false, showLoaderFlag = true) => {
      if (!requestData || typeof requestData !== "object") return;

      if (showLoaderFlag) showLoader(true);

      try {
        const res = await SearchHeadOfComplianceEscalatedTransactionsAPI({
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

        const escalatedVerification = Array.isArray(res?.transactions)
          ? res.transactions
          : [];

        const mapped = mapToTableRows(
          currentAssetTypeData?.Equities,
          escalatedVerification
        );

        setHeadOfComplianceApprovalEscalatedVerificationsData((prev) => ({
          escalatedVerification: replace
            ? mapped
            : [...(prev?.escalatedPortfolio || []), ...mapped],
          // this is for to run lazy loading its data comming from database of total data in db
          totalRecordsDataBase: res.totalRecords,
          // this is for to know how mush dta currently fetch from  db
          totalRecordsTable: replace
            ? mapped.length
            : headOfComplianceApprovalEscalatedVerificationsData.totalRecordsTable +
              mapped.length,
        }));

        setHeadOfComplianceApprovalEscalatedVerificationsSearch((prev) => {
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
        console.error("❌ Error fetching pending approvals:", error);
        showNotification({
          type: "error",
          message: "Failed to fetch transactions",
        });
      } finally {
        if (showLoaderFlag) showLoader(false);
      }
    },
    [callApi, showNotification, showLoader, navigate, assetTypeListingData]
  );

  // ===========================================================================
  // 🎯 EFFECTS - DATA SYNCING
  // ===========================================================================

  /**
   * Handle real-time MQTT data updates
   */
  useEffect(() => {
    if (headOfComplianceApprovalEscalatedVerificationsMqtt) {
      const requestData = buildApiRequest(
        headOfComplianceApprovalEscalatedVerificationsSearch,
        assetTypeListingData
      );
      fetchApiCall(requestData, true, false);
      setHeadOfComplianceApprovalEscalatedVerificationsMqtt(false);
    }
  }, [headOfComplianceApprovalEscalatedVerificationsMqtt]);

  /**
   * Handle search/filter triggers
   */
  useEffect(() => {
    if (headOfComplianceApprovalEscalatedVerificationsSearch?.filterTrigger) {
      const requestData = buildApiRequest(
        headOfComplianceApprovalEscalatedVerificationsSearch,
        assetTypeListingData
      );

      fetchApiCall(requestData, true, true); // replace mode
    }
  }, [
    headOfComplianceApprovalEscalatedVerificationsSearch?.filterTrigger,
    fetchApiCall,
  ]);

  // ===========================================================================
  // 🎯 INFINITE SCROLL
  // ===========================================================================

  useTableScrollBottom(
    async () => {
      if (
        headOfComplianceApprovalEscalatedVerificationsData?.totalRecordsDataBase <=
        headOfComplianceApprovalEscalatedVerificationsData?.totalRecordsTable
      ) {
        return;
      }

      try {
        setLoadingMore(true);
        const requestData = buildApiRequest(
          headOfComplianceApprovalEscalatedVerificationsSearch,
          assetTypeListingData
        );

        await fetchApiCall(requestData, false, true); // append mode
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
    "border-less-table-blue"
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
      headOfComplianceApprovalEscalatedVerificationsSearch,
      assetTypeListingData
    );
    fetchApiCall(requestData, true, true);

    // Reset search state on page reload
    try {
      const navigationEntries = performance.getEntriesByType("navigation");
      if (navigationEntries?.[0]?.type === "reload") {
        resetHeadOfComplianceApprovalEscalatedVerificationsSearch();
      }
    } catch (error) {
      console.error("❌ Error detecting page reload:", error);
    }
  }, [fetchApiCall, resetHeadOfComplianceApprovalEscalatedVerificationsSearch]);

  /**
   * Cleanup on component unmount
   */
  useEffect(() => {
    return () => {
      setSortedInfo({});
      setLoadingMore(false);
      resetHeadOfComplianceApprovalEscalatedVerificationsSearch();
      setHeadOfComplianceApprovalEscalatedVerificationsData({
        escalatedVerification: [],
        totalRecordsDataBase: 0,
        totalRecordsTable: 0,
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
        rows={
          headOfComplianceApprovalEscalatedVerificationsData?.escalatedVerification ||
          []
        }
        columns={columns}
        classNameTable={"border-less-table-blue"}
        scroll={
          headOfComplianceApprovalEscalatedVerificationsData
            ?.escalatedVerification?.length
            ? {
                x: "max-content",
                y: activeFilters.length > 0 ? 450 : 500,
              }
            : undefined
        }
        onChange={(_, __, sorter) => setSortedInfo(sorter || {})}
        loading={loadingMore}
        ref={tableScrollHCAEcalatedPortfolio}
      />
      {/* View Detail Modal */}
      {viewDetailHeadOfComplianceEscalated && (
        <ViewDetailHeadOfComplianceReconcileTransaction />
      )}

      {/* To SHow Upload Modal While click on Add Tocket Button */}
      {uploadComplianceModal && <UploadHeadOfComplianceTicketModal />}

      {/* To show Note Modal When Click on Compliant btn to open Note Modal */}
      {noteGlobalModal && <NoteHeadOfComplianceModal />}

      {/* To SHow Compliant Modal When note Modal APi is success */}
      {compliantApproveModal && <ApproveHeadOfComplianceModal />}

      {/* To Show Non Compliant Modal WHen Note Modal Api is Success */}
      {nonCompliantDeclineModal && <DeclinedHeadOfComplianceModal />}

      {isViewTicketTransactionModal && <ViewTicketEscalatedModal />}
    </>
  );
};

export default EscalatedTransactionVerifications;
