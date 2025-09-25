// src/pages/complianceOfficer/reconcile/ReconcilePortfolio.jsx

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";

// 📦 Third-party
import moment from "moment";

// 🔹 Components
import BorderlessTable from "../../../../../components/tables/borderlessTable/borderlessTable";

// 🔹 Utils (Portfolio-specific)
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

// 🔹 API
// import { SearchReconcilePortfolio } from "../../../../../api/portfolioApi";

// 🔹 Helpers
import { toYYMMDD } from "../../../../../commen/funtions/rejex";

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
const ReconcilePortfolio = () => {
  const navigate = useNavigate();

  // -------------------------
  // ✅ Context hooks
  // -------------------------
  const { callApi } = useApi();
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();

  const {
    complianceOfficerReconcilePortfolioSearch,
    setComplianceOfficerReconcilePortfolioSearch,
    resetComplianceOfficerReconcilePortfoliosSearch,
  } = useSearchBarContext();

  const {
    setComplianceOfficerReconcilePortfolioData,
    complianceOfficerReconcilePortfolioData,
    setComplianceOfficerReconcilePortfolioDataMqtt,
    complianceOfficerReconcilePortfolioDataMqtt,
  } = useReconcileContext();

  // -------------------------
  // ✅ Local state
  // -------------------------
  const [sortedInfo, setSortedInfo] = useState({});
  const [tableData, setTableData] = useState({ rows: [], totalRecords: 0 });
  const [loadingMore, setLoadingMore] = useState(false);

  // -------------------------
  // ✅ Derived values
  // -------------------------
  const columns = getBorderlessTableColumns(approvalStatusMap, sortedInfo);

  // Prevent duplicate API calls (StrictMode safeguard)
  const didFetchRef = useRef(false);

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
      PortfolioName: searchState.portfolioName || "",
      InstrumentName: searchState.instrumentName || "",
      Quantity: searchState.quantity ? Number(searchState.quantity) : 0,
      StartDate: startDate,
      EndDate: endDate,
      StatusIds: searchState.status || [],
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
  // 🔹 API CALL: Fetch reconcile portfolios
  // ----------------------------------------------------------------
  const fetchPortfolios = useCallback(
    async (requestData, replace = false, loader = false) => {
      if (!requestData || typeof requestData !== "object") return;
      if (!loader) showLoader(true);

      try {
        const res = [];
        // const res = await SearchReconcilePortfolio({
        //   callApi,
        //   showNotification,
        //   showLoader,
        //   requestdata: requestData,
        //   navigate,
        // });

        const portfolios = Array.isArray(res?.portfolios) ? res.portfolios : [];
        const mapped = mapToTableRows(portfolios);

        setComplianceOfficerReconcilePortfolioData({
          data: mapped,
          totalRecords: res?.totalRecords ?? mapped.length,
          Apicall: true,
          replace,
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
  // 🔄 SYNC: Global → Local table data
  // ----------------------------------------------------------------
  useEffect(() => {
    if (!complianceOfficerReconcilePortfolioData?.Apicall) return;

    setTableData((prev) => ({
      rows: mergeRows(
        prev.rows || [],
        complianceOfficerReconcilePortfolioData.data,
        complianceOfficerReconcilePortfolioData.replace
      ),
      totalRecords: complianceOfficerReconcilePortfolioData.totalRecords || 0,
    }));

    setComplianceOfficerReconcilePortfolioSearch((prev) => ({
      ...prev,
      totalRecords:
        complianceOfficerReconcilePortfolioData.totalRecords ??
        complianceOfficerReconcilePortfolioData.data.length,
      pageNumber: complianceOfficerReconcilePortfolioData.replace
        ? 10
        : prev.pageNumber,
    }));

    setComplianceOfficerReconcilePortfolioData((prev) => ({
      ...prev,
      Apicall: false,
    }));
  }, [complianceOfficerReconcilePortfolioData?.Apicall]);

  // ----------------------------------------------------------------
  // 🔄 REAL-TIME: Handle new MQTT rows
  // ----------------------------------------------------------------
  useEffect(() => {
    if (!complianceOfficerReconcilePortfolioDataMqtt?.mqttRecived) return;

    const newRows = mapToTableRows(
      Array.isArray(
        complianceOfficerReconcilePortfolioDataMqtt?.mqttRecivedData
      )
        ? complianceOfficerReconcilePortfolioDataMqtt.mqttRecivedData
        : [complianceOfficerReconcilePortfolioDataMqtt.mqttRecivedData]
    );

    if (newRows.length) {
      setTableData((prev) => ({
        rows: [newRows[0], ...(prev.rows || [])],
        totalRecords: (prev.totalRecords || 0) + 1,
      }));

      setComplianceOfficerReconcilePortfolioData((prev) => ({
        ...prev,
        data: [newRows[0], ...(prev.data || [])],
        totalRecords: (prev.totalRecords || 0) + 1,
        Apicall: false,
      }));
    }

    setComplianceOfficerReconcilePortfolioDataMqtt({
      mqttRecivedData: [],
      mqttRecived: false,
    });
  }, [complianceOfficerReconcilePortfolioDataMqtt?.mqttRecived]);

  // ----------------------------------------------------------------
  // 🔄 On search/filter trigger
  // ----------------------------------------------------------------
  useEffect(() => {
    if (complianceOfficerReconcilePortfolioSearch?.filterTrigger) {
      const data = buildPortfolioRequest(
        complianceOfficerReconcilePortfolioSearch
      );
      fetchPortfolios(data, true);
      setComplianceOfficerReconcilePortfolioSearch((prev) => ({
        ...prev,
        filterTrigger: false,
      }));
    }
  }, [
    complianceOfficerReconcilePortfolioSearch?.filterTrigger,
    fetchPortfolios,
  ]);

  // ----------------------------------------------------------------
  // 🔄 INFINITE SCROLL
  // ----------------------------------------------------------------
  useTableScrollBottom(
    async () => {
      if (
        complianceOfficerReconcilePortfolioSearch?.totalRecords <=
        tableData?.rows?.length
      )
        return;

      try {
        setLoadingMore(true);
        const requestData = {
          ...buildPortfolioRequest(complianceOfficerReconcilePortfolioSearch),
          PageNumber: complianceOfficerReconcilePortfolioSearch.pageNumber || 0,
          Length: 10,
        };
        await fetchPortfolios(requestData, false, true);
        setComplianceOfficerReconcilePortfolioSearch((prev) => ({
          ...prev,
          pageNumber: (prev.pageNumber || 0) + 10,
        }));
      } catch (error) {
        console.error("❌ Error loading more portfolios:", error);
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

    const requestData = buildPortfolioRequest({ PageNumber: 0, Length: 10 });
    fetchPortfolios(requestData, true);

    try {
      const navigationEntries = performance.getEntriesByType("navigation");
      if (navigationEntries?.[0]?.type === "reload") {
        resetComplianceOfficerReconcilePortfoliosSearch();
      }
    } catch (error) {
      console.error("❌ Error detecting page reload:", error);
    }
  }, [fetchPortfolios, resetComplianceOfficerReconcilePortfoliosSearch]);

  // ----------------------------------------------------------------
  // 🔄 CLEANUP (on unmount)
  // ----------------------------------------------------------------
  useEffect(() => {
    return () => {
      setSortedInfo({});
      setTableData({ rows: [], totalRecords: 0 });
      setLoadingMore(false);
      resetComplianceOfficerReconcilePortfoliosSearch();
      setComplianceOfficerReconcilePortfolioData({
        data: [],
        totalRecords: 0,
        Apicall: false,
      });
      setComplianceOfficerReconcilePortfolioDataMqtt({
        mqttRecivedData: [],
        mqttRecived: false,
      });
    };
  }, []);

  // ----------------------------------------------------------------
  // ✅ RENDER
  // ----------------------------------------------------------------
  return (
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
  );
};

export default ReconcilePortfolio;
