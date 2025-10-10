// src/pages/complianceOfficer/reconcile/ReconcileTransaction.jsx

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";

// 🔹 Components
import BorderlessTable from "../../../../../components/tables/borderlessTable/borderlessTable";

// 🔹 Utils
import {
  buildApiRequest,
  getBorderlessTableColumns,
  mapToTableRows,
} from "./util";
import { approvalStatusMap } from "../../../../../components/tables/borderlessTable/utill";

// 🔹 Contexts
import { useSearchBarContext } from "../../../../../context/SearchBarContaxt";
import { useApi } from "../../../../../context/ApiContext";
import { useGlobalLoader } from "../../../../../context/LoaderContext";
import { useDashboardContext } from "../../../../../context/dashboardContaxt";
import { useReconcileContext } from "../../../../../context/reconsileContax";

// 🔹 Hooks
import { useNotification } from "../../../../../components/NotificationProvider/NotificationProvider";
import { SearchComplianceOfficerReconcileTransactionRequest } from "../../../../../api/reconsile";
import { useGlobalModal } from "../../../../../context/GlobalModalContext";
import { GetAllTransactionViewDetails } from "../../../../../api/myTransactionsApi";
import ViewDetailReconcileTransaction from "./modals/viewDetailReconcileTransaction.jsx/ViewDetailReconcileTransaction";
import NoteModalComplianceOfficer from "./modals/noteModalComplianceOfficer/NoteModalComplianceOfficer";
import CompliantApproveModal from "./modals/compliantApproveModal/CompliantApproveModal";
import NonCompliantDeclineModal from "./modals/nonCompliantDeclineModal/nonCompliantDeclineModal";
import ViewReconcileTransactionComment from "./modals/viewReconcileTransactionComment/ViewReconcileTransactionComment";
import ViewTicketReconcileModal from "./modals/viewTicketReconcileModal/viewTicketReconcileModal";
import UploadReconcileTicketModal from "./modals/uploadReconcileTicketModal/UploadReconcileTicketModal";
import { useTableScrollBottom } from "../../../../../common/funtions/scroll";

/**
 * 📌 ReconcileTransaction
 *
 * Displays and manages the **Reconcile → Transactions tab** for Compliance Officers.
 *
 * Responsibilities:
 * - Fetch **pending approvals** (paginated + infinite scroll).
 * - Handle **real-time updates** from MQTT.
 * - Sync global state ↔ local table data.
 * - Manage search, filters, sorting, and cleanup.
 *
 * @component
 * @returns {JSX.Element} BorderlessTable with reconcile transactions.
 */
const ReconcileTransaction = ({ activeFilters }) => {
  const navigate = useNavigate();
  const { callApi } = useApi();
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();
  // Prevent duplicate API calls (StrictMode safeguard)
  const didFetchRef = useRef(false);
  const tableScrollCOReconcileTransaction = useRef(null);
  // -------------------------
  // ✅ Local state
  // -------------------------
  const [sortedInfo, setSortedInfo] = useState({});
  const [loadingMore, setLoadingMore] = useState(false);

  // -------------------------
  // ✅ Context hooks
  // -------------------------

  const {
    viewDetailReconcileTransaction,
    noteGlobalModal,
    compliantApproveModal,
    nonCompliantDeclineModal,
    viewCommentReconcileModal,
    isViewTicketTransactionModal,
    uploadComplianceModal,
  } = useGlobalModal();
  const { assetTypeListingData } = useDashboardContext();

  const {
    complianceOfficerReconcileTransactionsSearch,
    setComplianceOfficerReconcileTransactionsSearch,
    resetComplianceOfficerReconcileTransactionsSearch,
  } = useSearchBarContext();

  const {
    setComplianceOfficerReconcileTransactionData,
    complianceOfficerReconcileTransactionData,
    setComplianceOfficerReconcileTransactionDataMqtt,
    complianceOfficerReconcileTransactionDataMqtt,
    setReconcileTransactionViewDetailData,
  } = useReconcileContext();

  // ----------------------------------------------------------------
  // 🔹 API CALL: Fetch pending approvals
  // ----------------------------------------------------------------
  const fetchApiCall = useCallback(
    async (requestData, replace = false, loader = false) => {
      if (!requestData || typeof requestData !== "object") return;
      if (loader) showLoader(true);
      try {
        const res = await SearchComplianceOfficerReconcileTransactionRequest({
          callApi,
          showNotification,
          showLoader,
          requestdata: requestData,
          navigate,
        });

        const reconsileTransactions = Array.isArray(res?.transactions)
          ? res.transactions
          : [];

        const mapped = mapToTableRows(
          assetTypeListingData?.Equities,
          reconsileTransactions
        );

        // setComplianceOfficerReconcileTransactionData({
        //   data: mapped,
        //   totalRecords: res?.totalRecords ?? mapped.length,
        //   Apicall: true,
        //   replace,
        // });
        setComplianceOfficerReconcileTransactionData((prev) => ({
          reconsileTransaction: replace
            ? mapped
            : [...(prev?.reconsileTransaction || []), ...mapped],
          // this is for to run lazy loading its data comming from database of total data in db
          totalRecordsDataBase: res?.totalRecords,
          // this is for to know how mush dta currently fetch from  db
          totalRecordsTable: replace
            ? mapped.length
            : complianceOfficerReconcileTransactionData.totalRecordsTable +
              mapped.length,
        }));

        setComplianceOfficerReconcileTransactionsSearch((prev) => {
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
      } finally {
        if (!loader) showLoader(false);
      }
    },
    [callApi, showNotification, showLoader, navigate, assetTypeListingData]
  );

  // ----------------------------------------------------------------
  // 🔄 INITIAL LOAD (on mount)
  // ----------------------------------------------------------------
  useEffect(() => {
    if (didFetchRef.current) return;
    didFetchRef.current = true;

    const requestData = buildApiRequest(
      complianceOfficerReconcileTransactionsSearch,
      assetTypeListingData
    );
    fetchApiCall(requestData, true, true);

    try {
      const navigationEntries = performance.getEntriesByType("navigation");
      if (navigationEntries?.[0]?.type === "reload") {
        resetComplianceOfficerReconcileTransactionsSearch();
      }
    } catch (error) {
      console.error("❌ Error detecting page reload:", error);
    }
  }, [fetchApiCall, resetComplianceOfficerReconcileTransactionsSearch]);

  // ----------------------------------------------------------------
  // 🔄 CLEANUP (on unmount)
  // ----------------------------------------------------------------
  useEffect(() => {
    return () => {
      setSortedInfo({});
      setLoadingMore(false);
      resetComplianceOfficerReconcileTransactionsSearch();
      setComplianceOfficerReconcileTransactionData({
        reconsileTransaction: [],
        totalRecordsDataBase: 0,
        totalRecordsTable: 0,
      });
      setComplianceOfficerReconcileTransactionDataMqtt(false);
    };
  }, []);

  // This Api is for the getAllViewDetailModal For myTransaction in Emp role
  // GETALLVIEWDETAIL OF Transaction API FUNCTION
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

  // -------------------------
  // ✅ Derived values
  // -------------------------
  const columns = getBorderlessTableColumns({
    approvalStatusMap,
    sortedInfo,
    complianceOfficerReconcileTransactionsSearch,
    setComplianceOfficerReconcileTransactionsSearch,
    handleViewDetailsForReconcileTransaction,
  });

  // ----------------------------------------------------------------
  // 🔄 REAL-TIME: Handle new MQTT rows
  // ----------------------------------------------------------------
  useEffect(() => {
    if (!complianceOfficerReconcileTransactionDataMqtt) return;

    const requestData = buildApiRequest(
      complianceOfficerReconcileTransactionsSearch,
      assetTypeListingData
    );
    fetchApiCall(requestData, true, true);
    setComplianceOfficerReconcileTransactionDataMqtt(false);
  }, [complianceOfficerReconcileTransactionDataMqtt]);

  // ----------------------------------------------------------------
  // 🔄 On search/filter trigger
  // ----------------------------------------------------------------
  useEffect(() => {
    if (complianceOfficerReconcileTransactionsSearch?.filterTrigger) {
      const requestData = buildApiRequest(
        complianceOfficerReconcileTransactionsSearch,
        assetTypeListingData
      );

      fetchApiCall(requestData, true, true); // replace mode
    }
  }, [
    complianceOfficerReconcileTransactionsSearch?.filterTrigger,
    fetchApiCall,
  ]);

  // ----------------------------------------------------------------
  // 🔄 INFINITE SCROLL
  // ----------------------------------------------------------------
  useTableScrollBottom(
    async () => {
      if (
        complianceOfficerReconcileTransactionData?.totalRecordsDataBase <=
        complianceOfficerReconcileTransactionData?.totalRecordsTable
      )
        return;

      try {
        setLoadingMore(true);
        const requestData = buildApiRequest(
          complianceOfficerReconcileTransactionsSearch,
          assetTypeListingData
        );
        await fetchApiCall(requestData, false, false); // append mode
      } catch (error) {
        console.error("❌ Error loading more approvals:", error);
      } finally {
        setLoadingMore(false);
      }
    },
    0,
    "border-less-table-blue"
  );

  // ----------------------------------------------------------------
  // ✅ RENDER
  // ----------------------------------------------------------------
  return (
    <>
      <BorderlessTable
        rows={
          complianceOfficerReconcileTransactionData.reconsileTransaction || []
        }
        columns={columns}
        classNameTable="border-less-table-blue"
        scroll={
          complianceOfficerReconcileTransactionData.reconsileTransaction?.length
            ? { x: "max-content", y: activeFilters.length > 0 ? 450 : 500 }
            : undefined
        }
        onChange={(_, __, sorter) => setSortedInfo(sorter || {})}
        loading={loadingMore}
        ref={tableScrollCOReconcileTransaction}
      />

      {/* To show View Detail Reconcile Transaction on View Click */}
      {viewDetailReconcileTransaction && <ViewDetailReconcileTransaction />}

      {/* To show Note Modal When click on Compliant or Non Compliant */}
      {noteGlobalModal && <NoteModalComplianceOfficer />}

      {/* To Show Compliant Approve modal when I click submit */}
      {compliantApproveModal && <CompliantApproveModal />}

      {/* To Show Non COmpliant Modal by click on submit */}
      {nonCompliantDeclineModal && <NonCompliantDeclineModal />}

      {/* To show View Comment Modal when CLick on View Comment Button */}
      {viewCommentReconcileModal && <ViewReconcileTransactionComment />}

      {/* To show view Ticket Modal on click of View Ticket */}
      {isViewTicketTransactionModal && <ViewTicketReconcileModal />}

      {/* To Show upload Ticket Modal On Add Ticket Click */}
      {uploadComplianceModal && <UploadReconcileTicketModal />}
    </>
  );
};

export default ReconcileTransaction;
