// src/pages/employee/approval/PendingApprovals.jsx

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import moment from "moment";

// Components
import BorderlessTable from "../../../../../components/tables/borderlessTable/borderlessTable";

// Utils
import {
  formatBrokerOptions,
  getBorderlessTableColumns,
  mapToTableRows,
} from "./utill";
import { approvalStatusMap } from "../../../../../components/tables/borderlessTable/utill";

// Contexts
import { useSearchBarContext } from "../../../../../context/SearchBarContaxt";
import { useApi } from "../../../../../context/ApiContext";
import { useGlobalLoader } from "../../../../../context/LoaderContext";
import { usePortfolioContext } from "../../../../../context/portfolioContax";
import { useDashboardContext } from "../../../../../context/dashboardContaxt";

// Hooks
import { useNotification } from "../../../../../components/NotificationProvider/NotificationProvider";
import { useTableScrollBottom } from "../../myApprovals/utill";

// API
import { SearchEmployeePendingUploadedPortFolio } from "../../../../../api/protFolioApi";

/**
 * 📄 PendingApprovals Component
 *
 * Displays a list of pending trade/portfolio approvals for employees.
 * Integrates:
 * - API fetching with infinite scroll
 * - MQTT real-time updates
 * - Global context synchronization
 * - Search and filter support
 *
 * @component
 */
const PendingApprovals = () => {
  const navigate = useNavigate();

  // -------------------------
  // ✅ Context hooks
  // -------------------------
  const { callApi } = useApi();
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();
  const { employeeBasedBrokersData, addApprovalRequestData } =
    useDashboardContext();

  // -------------------------
  // ✅ Local state
  // -------------------------
  const [sortedInfo, setSortedInfo] = useState({});
  const [tableData, setTableData] = useState({ rows: [], totalRecords: 0 });
  const [loadingMore, setLoadingMore] = useState(false);

  // -------------------------
  // ✅ Global context states
  // -------------------------
  const {
    employeePendingApprovalSearch,
    setEmployeePendingApprovalSearch,
    resetEmployeePendingApprovalSearch,
  } = useSearchBarContext();

  const {
    employeePendingApprovalsData,
    setEmployeePendingApprovalsData,
    employeePendingApprovalsDataMqtt,
    setEmployeePendingApprovalsDataMqtt,
  } = usePortfolioContext();

  // -------------------------
  // ✅ Derived values
  // -------------------------
  const brokerOptions = formatBrokerOptions(employeeBasedBrokersData || []);
  const columns = getBorderlessTableColumns(
    approvalStatusMap,
    sortedInfo,
    employeePendingApprovalSearch,
    setEmployeePendingApprovalSearch
  );

  // ✅ Prevent duplicate API calls (StrictMode double-render safeguard)
  const didFetchRef = useRef(false);

  // ----------------------------------------------------------------
  // 🔹 API CALL: Fetch pending approvals (initial + filters)
  // ----------------------------------------------------------------
  const fetchPendingApprovals = useCallback(
    async (requestData) => {
      if (!requestData || typeof requestData !== "object") {
        console.warn("⚠️ Invalid requestData:", requestData);
        return;
      }

      showLoader(true);
      try {
        const res = await SearchEmployeePendingUploadedPortFolio({
          callApi,
          showNotification,
          showLoader,
          requestdata: requestData,
          navigate,
        });

        const portfolios = Array.isArray(res?.pendingPortfolios)
          ? res.pendingPortfolios
          : [];

        const mapped = mapToTableRows(
          addApprovalRequestData?.Equities,
          portfolios,
          brokerOptions
        );

        setEmployeePendingApprovalsData((prev) => {
          if (portfolios.length === 0) {
            // 🔹 Reset when no records are found
            return { data: [], totalRecords: 0, Apicall: true };
          }
          return {
            ...prev,
            data: [...(prev.data || []), ...mapped],
            totalRecords: res?.totalRecords ?? prev.totalRecords ?? 0,
            Apicall: true,
          };
        });
      } catch (error) {
        console.error("❌ Error fetching pending approvals:", error);
        showNotification(
          "error",
          "Failed to fetch pending approvals. Please try again."
        );
      } finally {
        showLoader(false);
      }
    },
    [
      callApi,
      showNotification,
      showLoader,
      navigate,
      setEmployeePendingApprovalsData,
      brokerOptions,
    ]
  );

  // ----------------------------------------------------------------
  // 🔄 SYNC: Global → Local table data
  // ----------------------------------------------------------------
  useEffect(() => {
    if (employeePendingApprovalsData?.Apicall) {
      setTableData((prev) => {
        if (!employeePendingApprovalsData?.data?.length) {
          return { rows: [], totalRecords: 0 };
        }
        return {
          rows: [...(prev.rows || []), ...employeePendingApprovalsData.data],
          totalRecords: employeePendingApprovalsData.totalRecords || 0,
        };
      });

      // 🔹 Sync pagination info in search state
      setEmployeePendingApprovalSearch((prev) => ({
        ...prev,
        totalRecords:
          employeePendingApprovalsData.totalRecords ??
          employeePendingApprovalsData.data.length,
        pageNumber: 10,
      }));

      // 🔹 Reset API trigger flag
      setEmployeePendingApprovalsData((prev) => ({ ...prev, Apicall: false }));
    }
  }, [employeePendingApprovalsData?.Apicall]);

  // ----------------------------------------------------------------
  // 🔄 REAL-TIME: Handle new MQTT rows
  // ----------------------------------------------------------------
  useEffect(() => {
    if (employeePendingApprovalsDataMqtt?.mqttRecived) {
      const newRows = mapToTableRows(
        addApprovalRequestData?.Equities,
        Array.isArray(employeePendingApprovalsDataMqtt?.mqttRecivedData)
          ? employeePendingApprovalsDataMqtt.mqttRecivedData
          : [employeePendingApprovalsDataMqtt.mqttRecivedData],
        brokerOptions
      );

      if (newRows.length) {
        // Update table rows
        setTableData((prevTable) => ({
          rows: [newRows[0], ...(prevTable.rows || [])],
          totalRecords: (prevTable.totalRecords || 0) + 1,
        }));

        // Update global approvals context
        setEmployeePendingApprovalsData((prev) => {
          const safePrev = prev || {
            data: [],
            totalRecords: 0,
            Apicall: false,
          };

          return {
            ...safePrev,
            data: [newRows[0], ...safePrev.data],
            totalRecords: (safePrev.totalRecords || 0) + 1,
            Apicall: true,
          };
        });
      }

      // ✅ Reset MQTT state after processing
      setEmployeePendingApprovalsDataMqtt({
        mqttRecivedData: [],
        mqttRecived: false,
      });
    }
  }, [employeePendingApprovalsDataMqtt?.mqttRecived]);

  // ----------------------------------------------------------------
  // 🔧 HELPERS: Build API request payload
  // ----------------------------------------------------------------
  const buildPortfolioRequest = (searchState = {}) => ({
    InstrumentName:
      searchState.mainInstrumentName || searchState.instrumentName || "",
    Quantity: searchState.quantity ? Number(searchState.quantity) : 0,
    StartDate: searchState.startDate
      ? moment(searchState.startDate).format("YYYYMMDD")
      : "",
    EndDate: searchState.endDate
      ? moment(searchState.endDate).format("YYYYMMDD")
      : "",
    BrokerName: Array.isArray(searchState.broker)
      ? searchState.broker.join(",")
      : "",
    PageNumber: Number(searchState.pageNumber) || 0,
    Length: Number(searchState.pageSize) || 10,
  });

  // ----------------------------------------------------------------
  // 🔄 REACT: On search/filter trigger
  // ----------------------------------------------------------------
  useEffect(() => {
    if (employeePendingApprovalSearch?.filterTrigger) {
      const data = buildPortfolioRequest(employeePendingApprovalSearch);
      fetchPendingApprovals(data);

      setEmployeePendingApprovalSearch((prev) => ({
        ...prev,
        filterTrigger: false,
      }));
    }
  }, [employeePendingApprovalSearch?.filterTrigger, fetchPendingApprovals]);

  // ----------------------------------------------------------------
  // 🔄 INFINITE SCROLL
  // ----------------------------------------------------------------
  useTableScrollBottom(
    async () => {
      if (
        employeePendingApprovalSearch?.totalRecords <= tableData?.rows?.length
      )
        return;

      try {
        setLoadingMore(true);

        const requestData = {
          InstrumentName: "",
          Quantity: 0,
          StartDate: "",
          EndDate: "",
          BrokerName: "",
          PageNumber: employeePendingApprovalSearch.pageNumber || 0,
          Length: 10,
        };

        const res = await SearchEmployeePendingUploadedPortFolio({
          callApi,
          showNotification,
          showLoader,
          requestdata: requestData,
          navigate,
        });

        const mapped = mapToTableRows(
          addApprovalRequestData?.Equities,
          res?.pendingPortfolios || [],
          brokerOptions
        );

        setTableData((prev) => ({
          rows: [...(prev.rows || []), ...mapped],
          totalRecords: res?.totalRecords ?? prev.totalRecords ?? 0,
        }));

        setEmployeePendingApprovalSearch((prev) => ({
          ...prev,
          totalRecords: res?.totalRecords ?? prev.totalRecords,
          pageNumber: (prev.pageNumber || 0) + 10,
        }));
      } catch (error) {
        console.error("❌ Error loading more approvals:", error);
        showNotification("error", "Unable to load more approvals.");
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

    const requestData = {
      InstrumentName: "",
      Quantity: 0,
      StartDate: "",
      EndDate: "",
      BrokerName: "",
      PageNumber: 0,
      Length: 10,
    };
    fetchPendingApprovals(requestData);

    // Reset search state on page reload
    try {
      const navigationEntries = performance.getEntriesByType("navigation");
      if (navigationEntries?.[0]?.type === "reload") {
        resetEmployeePendingApprovalSearch();
      }
    } catch (error) {
      console.error("❌ Error detecting page reload:", error);
    }
  }, [fetchPendingApprovals, resetEmployeePendingApprovalSearch]);

  // ----------------------------------------------------------------
  // 🔄 CLEANUP (on unmount)
  // ----------------------------------------------------------------
  useEffect(() => {
    return () => {
      setSortedInfo({});
      setTableData({ rows: [], totalRecords: 0 });
      setLoadingMore(false);
      resetEmployeePendingApprovalSearch();
      setEmployeePendingApprovalsData({
        data: [],
        totalRecords: 0,
        Apicall: false,
      });
      setEmployeePendingApprovalsDataMqtt({
        mqttRecivedData: [],
        mqttRecived: false,
      });
    };
  }, []);

  // ----------------------------------------------------------------
  // 🎨 RENDER
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

export default PendingApprovals;
