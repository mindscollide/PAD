// src/pages/complianceOfficer/reconcile/ReconcileTransaction.jsx

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
import { useDashboardContext } from "../../../../../context/dashboardContaxt";
import { useReconcileContext } from "../../../../../context/reconsileContax";

// 🔹 Hooks
import { useNotification } from "../../../../../components/NotificationProvider/NotificationProvider";
import { useTableScrollBottom } from "../../../employes/myApprovals/utill";

// 🔹 API
import { SearchEmployeePendingUploadedPortFolio } from "../../../../../api/protFolioApi";

// 🔹 Helpers
import {
  mapBuySellToIds,
  mapStatusToIds,
} from "../../../../../components/dropdowns/filters/utils";
import { toYYMMDD } from "../../../../../commen/funtions/rejex";
import { SearchComplianceOfficerReconcileTransactionRequest } from "../../../../../api/reconsile";
import { useGlobalModal } from "../../../../../context/GlobalModalContext";
import { GetAllTransactionViewDetails } from "../../../../../api/myTransactionsApi";
import ViewDetailReconcileTransaction from "./modals/viewDetailReconcileTransaction.jsx/ViewDetailReconcileTransaction";
import NoteLineManagerModal from "../../../lineManager/approvalRequest/modal/noteLineManagerModal/NoteLineManagerModal";
import { useSidebarContext } from "../../../../../context/sidebarContaxt";
import NoteModalComplianceOfficer from "./modals/noteModalComplianceOfficer/NoteModalComplianceOfficer";
import CompliantApproveModal from "./modals/compliantApproveModal/CompliantApproveModal";
import NonCompliantDeclineModal from "./modals/nonCompliantDeclineModal/nonCompliantDeclineModal";
import ViewReconcileTransactionComment from "./modals/viewReconcileTransactionComment/ViewReconcileTransactionComment";

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
const ReconcileTransaction = () => {
  const navigate = useNavigate();
  const { selectedKey } = useSidebarContext();

  // -------------------------
  // ✅ Context hooks
  // -------------------------
  const { callApi } = useApi();
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();
  const {
    viewDetailReconcileTransaction,
    noteGlobalModal,
    compliantApproveModal,
    nonCompliantDeclineModal,
    viewCommentReconcileModal,
  } = useGlobalModal();
  const { addApprovalRequestData } = useDashboardContext();

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

  console.log(
    complianceOfficerReconcileTransactionData,
    "complianceOfficerReconcileTransactionData"
  );

  console.log(selectedKey, "selectedKeyselectedKey2123");

  // -------------------------
  // ✅ Local state
  // -------------------------
  const [sortedInfo, setSortedInfo] = useState({});
  const [tableData, setTableData] = useState({ rows: [], totalRecords: 0 });
  const [loadingMore, setLoadingMore] = useState(false);

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

  // Prevent duplicate API calls (StrictMode safeguard)
  const didFetchRef = useRef(false);
  const assetType = "Equities";

  // ----------------------------------------------------------------
  // 🔧 HELPERS
  // ----------------------------------------------------------------

  /**
   * Build API request payload from search/filter state.
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
      StatusIds: mapStatusToIds(searchState.status),
      TypeIds: mapBuySellToIds(
        searchState.type,
        addApprovalRequestData?.[assetType]
      ),
      PageNumber: Number(searchState.pageNumber) || 0,
      Length: Number(searchState.pageSize) || 10,
    };
  };

  /**
   * Merge new rows into existing table data.
   * Ensures no duplicate rows by `key`.
   */
  const mergeRows = (prevRows, newRows, replace = false) => {
    if (replace) return newRows;
    const ids = new Set(prevRows.map((r) => r.key));
    return [...prevRows, ...newRows.filter((r) => !ids.has(r.key))];
  };

  // ----------------------------------------------------------------
  // 🔹 API CALL: Fetch pending approvals
  // ----------------------------------------------------------------
  const fetchPendingApprovals = useCallback(
    async (requestData, replace = false, loader = false) => {
      if (!requestData || typeof requestData !== "object") return;
      if (!loader) showLoader(true);
      try {
        const res = await SearchComplianceOfficerReconcileTransactionRequest({
          callApi,
          showNotification,
          showLoader,
          requestdata: requestData,
          navigate,
        });
        console.log("fetchPendingApprovals", res);

        const transactions = Array.isArray(res?.transactions)
          ? res.transactions
          : [];

        const mapped = mapToTableRows(
          addApprovalRequestData?.Equities,
          transactions
        );
        console.log("fetchPendingApprovals", mapped);

        setComplianceOfficerReconcileTransactionData({
          data: mapped,
          totalRecords: res?.totalRecords ?? mapped.length,
          Apicall: true,
          replace,
        });
      } catch (error) {
        console.error("❌ Error fetching pending approvals:", error);
      } finally {
        if (!loader) showLoader(false);
      }
    },
    [callApi, showNotification, showLoader, navigate, addApprovalRequestData]
  );

  // ----------------------------------------------------------------
  // 🔄 SYNC: Global → Local table data
  // ----------------------------------------------------------------
  useEffect(() => {
    if (!complianceOfficerReconcileTransactionData?.Apicall) return;

    setTableData((prev) => ({
      rows: mergeRows(
        prev.rows || [],
        complianceOfficerReconcileTransactionData.data,
        complianceOfficerReconcileTransactionData.replace
      ),
      totalRecords: complianceOfficerReconcileTransactionData.totalRecords || 0,
    }));

    // Sync pagination info
    setComplianceOfficerReconcileTransactionsSearch((prev) => ({
      ...prev,
      totalRecords:
        complianceOfficerReconcileTransactionData.totalRecords ??
        complianceOfficerReconcileTransactionData.data.length,
      pageNumber: complianceOfficerReconcileTransactionData.replace
        ? 10
        : prev.pageNumber,
    }));

    // Reset API trigger flag
    setComplianceOfficerReconcileTransactionData((prev) => ({
      ...prev,
      Apicall: false,
    }));
  }, [complianceOfficerReconcileTransactionData?.Apicall]);

  // ----------------------------------------------------------------
  // 🔄 REAL-TIME: Handle new MQTT rows
  // ----------------------------------------------------------------
  useEffect(() => {
    if (!complianceOfficerReconcileTransactionDataMqtt?.mqttRecived) return;

    const newRows = mapToTableRows(
      addApprovalRequestData?.Equities,
      Array.isArray(
        complianceOfficerReconcileTransactionDataMqtt?.mqttRecivedData
      )
        ? complianceOfficerReconcileTransactionDataMqtt.mqttRecivedData
        : [complianceOfficerReconcileTransactionDataMqtt.mqttRecivedData]
    );

    if (newRows.length) {
      setTableData((prev) => ({
        rows: [newRows[0], ...(prev.rows || [])],
        totalRecords: (prev.totalRecords || 0) + 1,
      }));

      setComplianceOfficerReconcileTransactionData((prev) => ({
        ...prev,
        data: [newRows[0], ...(prev.data || [])],
        totalRecords: (prev.totalRecords || 0) + 1,
        Apicall: false,
      }));
    }

    setComplianceOfficerReconcileTransactionDataMqtt({
      mqttRecivedData: [],
      mqttRecived: false,
    });
  }, [complianceOfficerReconcileTransactionDataMqtt?.mqttRecived]);

  // ----------------------------------------------------------------
  // 🔄 On search/filter trigger
  // ----------------------------------------------------------------
  useEffect(() => {
    if (complianceOfficerReconcileTransactionsSearch?.filterTrigger) {
      const data = buildPortfolioRequest(
        complianceOfficerReconcileTransactionsSearch
      );

      fetchPendingApprovals(data, true); // replace mode
      setComplianceOfficerReconcileTransactionsSearch((prev) => ({
        ...prev,
        filterTrigger: false,
      }));
    }
  }, [
    complianceOfficerReconcileTransactionsSearch?.filterTrigger,
    fetchPendingApprovals,
  ]);

  // ----------------------------------------------------------------
  // 🔄 INFINITE SCROLL
  // ----------------------------------------------------------------
  useTableScrollBottom(
    async () => {
      if (
        complianceOfficerReconcileTransactionsSearch?.totalRecords <=
        tableData?.rows?.length
      )
        return;

      try {
        setLoadingMore(true);
        const requestData = {
          ...buildPortfolioRequest(
            complianceOfficerReconcileTransactionsSearch
          ),
          PageNumber:
            complianceOfficerReconcileTransactionsSearch.pageNumber || 0,
          Length: 10,
        };
        await fetchPendingApprovals(requestData, false, true); // append mode
        setComplianceOfficerReconcileTransactionsSearch((prev) => ({
          ...prev,
          pageNumber: (prev.pageNumber || 0) + 10,
        }));
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
  // 🔄 INITIAL LOAD (on mount)
  // ----------------------------------------------------------------
  useEffect(() => {
    if (didFetchRef.current) return;
    didFetchRef.current = true;

    const requestData = buildPortfolioRequest({
      PageNumber: 0,
      Length: 10,
    });
    fetchPendingApprovals(requestData, true);

    try {
      const navigationEntries = performance.getEntriesByType("navigation");
      if (navigationEntries?.[0]?.type === "reload") {
        resetComplianceOfficerReconcileTransactionsSearch();
      }
    } catch (error) {
      console.error("❌ Error detecting page reload:", error);
    }
  }, [
    fetchPendingApprovals,
    resetComplianceOfficerReconcileTransactionsSearch,
  ]);

  // ----------------------------------------------------------------
  // 🔄 CLEANUP (on unmount)
  // ----------------------------------------------------------------
  useEffect(() => {
    return () => {
      setSortedInfo({});
      setTableData({ rows: [], totalRecords: 0 });
      setLoadingMore(false);
      resetComplianceOfficerReconcileTransactionsSearch();
      setComplianceOfficerReconcileTransactionData({
        data: [],
        totalRecords: 0,
        Apicall: false,
      });
      setComplianceOfficerReconcileTransactionDataMqtt({
        mqttRecivedData: [],
        mqttRecived: false,
      });
    };
  }, []);

  // ----------------------------------------------------------------
  // ✅ RENDER
  // ----------------------------------------------------------------
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
    </>
  );
};

export default ReconcileTransaction;
