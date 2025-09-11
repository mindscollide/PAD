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

const PendingApprovals = () => {
  const navigate = useNavigate();

  // ✅ Context hooks
  const { callApi } = useApi();
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();
  const { employeeBasedBrokersData } = useDashboardContext();

  // ✅ Local state for table
  const [sortedInfo, setSortedInfo] = useState({});
  const [tableData, setTableData] = useState({ rows: [], totalRecords: 0 });
  const [loadingMore, setLoadingMore] = useState(false);

  // ✅ Global context states
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

  // ✅ Format brokers safely
  const brokerOptions = formatBrokerOptions(employeeBasedBrokersData || []);

  // ✅ Build column definitions
  const columns = getBorderlessTableColumns(
    approvalStatusMap,
    sortedInfo,
    employeePendingApprovalSearch,
    setEmployeePendingApprovalSearch
  );

  // ✅ Guard against duplicate API calls (React StrictMode mounts twice)
  const didFetchRef = useRef(false);

  /**
   * 🔹 Fetch pending approvals from API
   * Handles initial load and filter/search triggers.
   *
   * @param {Object} requestData - Payload for API request
   */
  const fetchPendingApprovals = useCallback(
    async (requestData) => {
      if (!requestData || typeof requestData !== "object") {
        console.warn(
          "⚠️ Invalid requestData passed to fetchPendingApprovals:",
          requestData
        );
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

        const mapped = mapToTableRows(portfolios, brokerOptions);

        setEmployeePendingApprovalsData((prev) => {
          if (portfolios.length === 0) {
            // 🔹 Reset when no records
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

  /**
   * 🔄 Sync global portfolio context → local table data
   */
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

      // update search state (pagination info)
      setEmployeePendingApprovalSearch((prev) => ({
        ...prev,
        totalRecords:
          employeePendingApprovalsData.totalRecords ??
          employeePendingApprovalsData.data.length,
        pageNumber: 10,
      }));

      setEmployeePendingApprovalsData((prev) => ({ ...prev, Apicall: false }));
    }
  }, [employeePendingApprovalsData?.Apicall]);

  /**
   * 🔄 Handle new MQTT data
   */
  useEffect(() => {
    if (employeePendingApprovalsDataMqtt?.mqttRecived) {
      const newRows = mapToTableRows(
        Array.isArray(employeePendingApprovalsDataMqtt?.mqttRecivedData)
          ? employeePendingApprovalsDataMqtt.mqttRecivedData
          : [employeePendingApprovalsDataMqtt.mqttRecivedData],
        brokerOptions
      );

      console.log("🔄 MQTT incoming:", newRows);

      if (newRows.length) {
        setEmployeePendingApprovalsData((prev) => {
          // ✅ Ensure prev is a valid object
          const safePrev = prev || {
            data: [],
            totalRecords: 0,
            Apicall: false,
          };

          return {
            ...safePrev,
            data: [...newRows, ...(safePrev.data || [])], // prepend
            totalRecords: (safePrev.totalRecords || 0) + newRows.length, // update count
            Apicall: true, // trigger table sync
          };
        });
      }

      // ✅ Reset mqtt state after processing
      setEmployeePendingApprovalsDataMqtt({
        mqttRecivedData: [],
        mqttRecived: false,
      });
    }
  }, [employeePendingApprovalsDataMqtt?.mqttRecived]);

  /**
   * 🔹 Build request payload from search state safely
   */
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

  /**
   * 🔄 React to search/filter trigger
   */
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

  /**
   * 🔄 Infinite scroll
   */
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

  /**
   * 🔄 Initial load on mount
   */
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

    try {
      const navigationEntries = performance.getEntriesByType("navigation");
      if (navigationEntries?.[0]?.type === "reload") {
        resetEmployeePendingApprovalSearch();
      }
    } catch (error) {
      console.error("❌ Error detecting page reload:", error);
    }
  }, [fetchPendingApprovals, resetEmployeePendingApprovalSearch]);

  /**
   * 🔄 Cleanup on unmount
   */
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
