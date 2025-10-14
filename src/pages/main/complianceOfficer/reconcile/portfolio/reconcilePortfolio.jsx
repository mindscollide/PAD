// src/pages/complianceOfficer/reconcile/ReconcilePortfolio.jsx

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";

// 🔹 Components
import BorderlessTable from "../../../../../components/tables/borderlessTable/borderlessTable";

// 🔹 Utils (Portfolio-specific)
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
import { useReconcileContext } from "../../../../../context/reconsileContax";

// 🔹 Hooks
import { useNotification } from "../../../../../components/NotificationProvider/NotificationProvider";

// 🔹 Helpers
import {
  GetAllReconcilePortfolioTransactionRequest,
  SearchComplianceOfficerReconcilePortfolioRequest,
} from "../../../../../api/reconsile";
import { useDashboardContext } from "../../../../../context/dashboardContaxt";
import { useGlobalModal } from "../../../../../context/GlobalModalContext";
import { usePortfolioContext } from "../../../../../context/portfolioContax";
import ViewDetailPortfolioTransaction from "./modals/viewDetailPortfolioReconcileTransaction/ViewDetailPortfolioTransaction";
import NotePortfolioComplianceOfficerModal from "./modals/notePortfolioComplianceOfficerModal/NotePortfolioComplianceOfficerModal";
import ViewReconcilePortfolioComment from "./modals/viewReconcilePortfolioComment/ViewReconcilePortfolioComment";
import CompliantPortfolioApproveModal from "./modals/compliantPortfolioApproveModal/CompliantPortfolioApproveModal";
import NonCompliantPortdolioDeclineModal from "./modals/nonCompliantPortdolioDeclineModal/nonCompliantPortdolioDeclineModal";

import { useTableScrollBottom } from "../../../../../common/funtions/scroll";
import { getSafeAssetTypeData } from "../../../../../common/funtions/assetTypesList";

/**
 * 📌 ReconcilePortfolio
 *
 * Displays and manages the **Reconcile → Portfolio tab** for Compliance Officers.
 *
 * Responsibilities:
 * - Fetch **portfolio reconciliation data** (paginated + infinite scroll).
 * - Handle **real-time updates** from MQTT.
 * - Sync global state ↔ local table data.
 * - Manage search, filters, sorting, and cleanup.
 *
 * @component
 * @returns {JSX.Element} BorderlessTable with reconcile portfolios.
 */
const ReconcilePortfolio = ({ activeFilters }) => {
  const navigate = useNavigate();

  // -------------------------
  // ✅ Context hooks
  // -------------------------
  const { callApi } = useApi();
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();
  // Prevent duplicate API calls (StrictMode safeguard)
  const didFetchRef = useRef(false);
  const tableScrollCOReconcilePortfolio = useRef(null);

  // -------------------------
  // ✅ Local state
  // -------------------------
  const [sortedInfo, setSortedInfo] = useState({});
  const [loadingMore, setLoadingMore] = useState(false);

  const {
    viewDetailPortfolioTransaction,
    noteGlobalModal,
    viewCommentPortfolioModal,
    compliantPortfolioApproveModal,
    nonCompliantPortfolioDeclineModal,
  } = useGlobalModal();

  const {
    complianceOfficerReconcilePortfolioSearch,
    setComplianceOfficerReconcilePortfolioSearch,
    resetComplianceOfficerReconcilePortfoliosSearch,
  } = useSearchBarContext();

  const { setReconcilePortfolioViewDetailData } = usePortfolioContext();

  const {
    setComplianceOfficerReconcilePortfolioData,
    complianceOfficerReconcilePortfolioData,
    setComplianceOfficerReconcilePortfolioDataMqtt,
    complianceOfficerReconcilePortfolioDataMqtt,
  } = useReconcileContext();
  const { assetTypeListingData, setAssetTypeListingData } =
    useDashboardContext();

  // This Api is for the getAllViewDetailModal For myTransaction in Emp role
  // GETALLVIEWDETAIL OF Transaction API FUNCTION
  const handleViewDetailsForReconcileTransaction = async (workFlowID) => {
    await showLoader(true);
    const requestdata = { TradeApprovalID: workFlowID };

    const responseData = await GetAllReconcilePortfolioTransactionRequest({
      callApi,
      showNotification,
      showLoader,
      requestdata,
      navigate,
    });

    if (responseData) {
      setReconcilePortfolioViewDetailData(responseData);
    }
  };

  // -------------------------
  // ✅ Derived values
  // -------------------------
  const columns = getBorderlessTableColumns({
    approvalStatusMap,
    sortedInfo,
    complianceOfficerReconcilePortfolioSearch,
    setComplianceOfficerReconcilePortfolioSearch,
    handleViewDetailsForReconcileTransaction,
  });

  /**
   * Merge new rows into existing table data.
   * Ensures no duplicate rows by `key`.
   */
  // const mergeRows = (prevRows, newRows, replace = false) => {
  //   if (replace) return newRows;
  //   const ids = new Set(prevRows.map((r) => r.key));
  //   return [...prevRows, ...newRows.filter((r) => !ids.has(r.key))];
  // };

  // ----------------------------------------------------------------
  // 🔹 API CALL: Fetch reconcile portfolios
  // ----------------------------------------------------------------
  const fetchApiCall = useCallback(
    async (requestData, replace = false, loader = false) => {
      if (!requestData || typeof requestData !== "object") return;
      if (loader) showLoader(true);
      try {
        const res = await SearchComplianceOfficerReconcilePortfolioRequest({
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

        const reconsilePortfolios = Array.isArray(res?.portfolios)
          ? res.portfolios
          : [];
        const mapped = mapToTableRows(
          currentAssetTypeData?.Equities,
          reconsilePortfolios
        );

        setComplianceOfficerReconcilePortfolioData((prev) => ({
          reconsilePortfolios: replace
            ? mapped
            : [...(prev?.reconsilePortfolios || []), ...mapped],
          // this is for to run lazy loading its data comming from database of total data in db
          totalRecordsDataBase: res?.totalRecords || 0,
          // this is for to know how mush dta currently fetch from  db
          totalRecordsTable: replace
            ? mapped.length
            : complianceOfficerReconcilePortfolioData.totalRecordsTable +
              mapped.length,
        }));

        setComplianceOfficerReconcilePortfolioSearch((prev) => {
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
        console.error("❌ Error fetching reconcile portfolios:", error);
      } finally {
        if (!loader) showLoader(false);
      }
    },
    [callApi, showNotification, showLoader, navigate]
  );

  // ----------------------------------------------------------------
  // 🔄 INITIAL LOAD (on mount)
  // ----------------------------------------------------------------
  useEffect(() => {
    if (didFetchRef.current) return;
    didFetchRef.current = true;

    const requestData = buildApiRequest(
      complianceOfficerReconcilePortfolioSearch,
      assetTypeListingData
    );
    fetchApiCall(requestData, true, true);

    try {
      const navigationEntries = performance.getEntriesByType("navigation");
      if (navigationEntries?.[0]?.type === "reload") {
        resetComplianceOfficerReconcilePortfoliosSearch();
      }
    } catch (error) {
      console.error("❌ Error detecting page reload:", error);
    }
  }, [fetchApiCall, resetComplianceOfficerReconcilePortfoliosSearch]);

  // ----------------------------------------------------------------
  // 🔄 REAL-TIME: Handle new MQTT rows
  // ----------------------------------------------------------------
  // useEffect(() => {
  //   if (!complianceOfficerReconcilePortfolioDataMqtt?.mqtt) return;

  //   const newRows = mapToTableRows(
  //     assetTypeListingData?.Equities,
  //     Array.isArray(complianceOfficerReconcilePortfolioDataMqtt?.data)
  //       ? complianceOfficerReconcilePortfolioDataMqtt.data
  //       : [complianceOfficerReconcilePortfolioDataMqtt.data]
  //   );

  //   if (newRows.length) {
  //     setTableData((prev) => ({
  //       rows: [newRows[0], ...(prev.rows || [])],
  //       totalRecords: (prev.totalRecords || 0) + 1,
  //     }));

  //     setComplianceOfficerReconcilePortfolioData((prev) => ({
  //       ...prev,
  //       data: [newRows[0], ...(prev.data || [])],
  //       totalRecords: (prev.totalRecords || 0) + 1,
  //       Apicall: false,
  //     }));
  //   }

  //   setComplianceOfficerReconcilePortfolioDataMqtt({
  //     data: [],
  //     mqtt: false,
  //   });
  // }, [complianceOfficerReconcilePortfolioDataMqtt?.mqtt]);

  useEffect(() => {
    if (!complianceOfficerReconcilePortfolioDataMqtt) return;
    const requestData = buildApiRequest(
      complianceOfficerReconcilePortfolioSearch,
      assetTypeListingData
    );
    fetchApiCall(requestData, true, false);
    setComplianceOfficerReconcilePortfolioDataMqtt(false);
  }, [complianceOfficerReconcilePortfolioDataMqtt]);

  // ----------------------------------------------------------------
  // 🔄 On search/filter trigger
  // ----------------------------------------------------------------
  useEffect(() => {
    if (complianceOfficerReconcilePortfolioSearch?.filterTrigger) {
      const requestData = buildApiRequest(
        complianceOfficerReconcilePortfolioSearch,
        assetTypeListingData
      );

      fetchApiCall(requestData, true, true);
    }
  }, [complianceOfficerReconcilePortfolioSearch?.filterTrigger, fetchApiCall]);

  // ----------------------------------------------------------------
  // 🔄 INFINITE SCROLL
  // ----------------------------------------------------------------

  useTableScrollBottom(
    async () => {
      if (
        complianceOfficerReconcilePortfolioData?.totalRecordsDataBase <=
        complianceOfficerReconcilePortfolioData?.totalRecordsTable
      )
        return;

      try {
        setLoadingMore(true);
        const requestData = buildApiRequest(
          complianceOfficerReconcilePortfolioSearch,
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
  // 🔄 CLEANUP (on unmount)
  // ----------------------------------------------------------------
  useEffect(() => {
    return () => {
      setSortedInfo({});
      setLoadingMore(false);
      resetComplianceOfficerReconcilePortfoliosSearch();
      setComplianceOfficerReconcilePortfolioData({
        reconsilePortfolios: [],
        totalRecordsDataBase: 0,
        totalRecordsTable: 0,
      });
    };
  }, []);

  // ----------------------------------------------------------------
  // ✅ RENDER
  // ----------------------------------------------------------------
  return (
    <>
      <BorderlessTable
        rows={
          complianceOfficerReconcilePortfolioData?.reconsilePortfolios || []
        }
        columns={columns}
        classNameTable="border-less-table-blue"
        scroll={
          complianceOfficerReconcilePortfolioData?.reconsilePortfolios?.length
            ? { x: "max-content", y: activeFilters.length > 0 ? 450 : 500 }
            : undefined
        }
        onChange={(_, __, sorter) => setSortedInfo(sorter || {})}
        loading={loadingMore}
        ref={tableScrollCOReconcilePortfolio}
      />

      {/* To show view Detail Modal while click on View Detail Btn */}
      {viewDetailPortfolioTransaction && <ViewDetailPortfolioTransaction />}

      {/* Open Note Modal By clickimg on compliant Btn on reconcile Portfolio */}
      {noteGlobalModal && <NotePortfolioComplianceOfficerModal />}

      {/* To show open only View Modal which is coming in Compliant and Non Compliant on Reconcile Portfolio */}
      {viewCommentPortfolioModal && <ViewReconcilePortfolioComment />}

      {/* To show COmpliant Modal when Note Modal is SUccess on portfolio Reconcile */}
      {compliantPortfolioApproveModal && <CompliantPortfolioApproveModal />}

      {/* To show Non Portfolio COmpliant Modal when Note Modal is SUccess on portfolio Reconcile */}
      {nonCompliantPortfolioDeclineModal && (
        <NonCompliantPortdolioDeclineModal />
      )}
    </>
  );
};

export default ReconcilePortfolio;
