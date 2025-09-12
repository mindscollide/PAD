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
import {
  mapBuySellToIds,
  mapStatusToIds,
} from "../../../../../components/dropdowns/filters/utils";

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
  // ✅ Local state
  // -------------------------
  const [sortedInfo, setSortedInfo] = useState({});
  const [tableData, setTableData] = useState({ rows: [], totalRecords: 0 });
  const [loadingMore, setLoadingMore] = useState(false);

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

  // ✅ Prevent duplicate API calls (StrictMode safeguard)
  const didFetchRef = useRef(false);
  const assetType = "Equities";
  // const statusIds = mapStatusToIds(state.status);
  // ----------------------------------------------------------------
  // 🔧 HELPERS
  // ----------------------------------------------------------------
  const buildPortfolioRequest = (searchState = {}) => ({
    InstrumentName:
      searchState.mainInstrumentName || searchState.instrumentName || "",
    Quantity: searchState.quantity ? Number(searchState.quantity) : 0,
    StartDate: searchState.startDate
      ? moment(searchState.startDate).format("YYYYMMDD")
      : "",
    StatusIds: mapStatusToIds(searchState.status),
    TypeIds: mapBuySellToIds(
      searchState.type,
      addApprovalRequestData?.[assetType]
    ),
    EndDate: searchState.endDate
      ? moment(searchState.endDate).format("YYYYMMDD")
      : "",
    BrokerIds: Array.isArray(searchState.broker) ? searchState.broker : [],
    PageNumber: Number(searchState.pageNumber) || 0,
    Length: Number(searchState.pageSize) || 10,
  });

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
      console.log("fetchPendingApprovals");
      if (!loader) showLoader(true);

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

        setEmployeePendingApprovalsData({
          data: mapped,
          totalRecords: res?.totalRecords ?? mapped.length,
          Apicall: true,
          replace,
        });
      } catch (error) {
        console.error("❌ Error fetching pending approvals:", error);
        showNotification(
          "error",
          "Failed to fetch pending approvals. Please try again."
        );
      } finally {
        if (!loader) showLoader(false);
      }
    },
    [
      callApi,
      showNotification,
      showLoader,
      navigate,
      brokerOptions,
      addApprovalRequestData,
    ]
  );

  // ----------------------------------------------------------------
  // 🔄 SYNC: Global → Local table data
  // ----------------------------------------------------------------
  useEffect(() => {
    if (!employeePendingApprovalsData?.Apicall) return;

    setTableData((prev) => {
      if (!employeePendingApprovalsData.data?.length) {
        return { rows: [], totalRecords: 0 };
      }

      return {
        rows: mergeRows(
          prev.rows || [],
          employeePendingApprovalsData.data,
          employeePendingApprovalsData.replace
        ),
        totalRecords: employeePendingApprovalsData.totalRecords || 0,
      };
    });

    // Sync pagination info
    setEmployeePendingApprovalSearch((prev) => ({
      ...prev,
      totalRecords:
        employeePendingApprovalsData.totalRecords ??
        employeePendingApprovalsData.data.length,
      pageNumber: employeePendingApprovalsData.replace ? 10 : prev.pageNumber,
    }));

    // Reset API trigger flag
    setEmployeePendingApprovalsData((prev) => ({ ...prev, Apicall: false }));
  }, [employeePendingApprovalsData?.Apicall]);

  // ----------------------------------------------------------------
  // 🔄 REAL-TIME: Handle new MQTT rows
  // ----------------------------------------------------------------
  useEffect(() => {
    if (!employeePendingApprovalsDataMqtt?.mqttRecived) return;

    const newRows = mapToTableRows(
      addApprovalRequestData?.Equities,
      Array.isArray(employeePendingApprovalsDataMqtt?.mqttRecivedData)
        ? employeePendingApprovalsDataMqtt.mqttRecivedData
        : [employeePendingApprovalsDataMqtt.mqttRecivedData],
      brokerOptions
    );

    if (newRows.length) {
      setTableData((prev) => ({
        rows: [newRows[0], ...(prev.rows || [])],
        totalRecords: (prev.totalRecords || 0) + 1,
      }));

      setEmployeePendingApprovalsData((prev) => ({
        ...prev,
        data: [newRows[0], ...(prev.data || [])],
        totalRecords: (prev.totalRecords || 0) + 1,
        Apicall: false,
      }));
    }

    setEmployeePendingApprovalsDataMqtt({
      mqttRecivedData: [],
      mqttRecived: false,
    });
  }, [employeePendingApprovalsDataMqtt?.mqttRecived]);

  // ----------------------------------------------------------------
  // 🔄 On search/filter trigger
  // ----------------------------------------------------------------
  useEffect(() => {
    if (employeePendingApprovalSearch?.filterTrigger) {
      const data = buildPortfolioRequest(employeePendingApprovalSearch);
      console.log("fetchPendingApprovals");
      fetchPendingApprovals(data, true); // replace mode
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
          ...buildPortfolioRequest(employeePendingApprovalSearch),
          PageNumber: employeePendingApprovalSearch.pageNumber || 0,
          Length: 10,
        };

        console.log("fetchPendingApprovals");
        await fetchPendingApprovals(requestData, false, true); // append mode
        setEmployeePendingApprovalSearch((prev) => ({
          ...prev,
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

    const requestData = buildPortfolioRequest({
      PageNumber: 0,
      Length: 10,
    });
    console.log("fetchPendingApprovals");
    fetchPendingApprovals(requestData, true);

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
