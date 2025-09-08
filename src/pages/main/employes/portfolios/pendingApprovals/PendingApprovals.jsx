// src/pages/employee/approval/PendingApprovals.jsx

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import moment from "moment";

// Components
import BorderlessTable from "../../../../../components/tables/borderlessTable/borderlessTable";

// Utils
import { getBorderlessTableColumns } from "./utill";
import { approvalStatusMap } from "../../../../../components/tables/borderlessTable/utill";

// Contexts
import { useSearchBarContext } from "../../../../../context/SearchBarContaxt";
import { useApi } from "../../../../../context/ApiContext";
import { useGlobalLoader } from "../../../../../context/LoaderContext";
import { usePortfolioContext } from "../../../../../context/portfolioContax";

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

  // ✅ Local state for table
  const [sortedInfo, setSortedInfo] = useState({});
  const [tableData, setTableData] = useState({
    rows: [],
    totalRecords: 0,
  });
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

  // ✅ Build column definitions
  const columns = getBorderlessTableColumns(
    approvalStatusMap,
    sortedInfo,
    employeePendingApprovalSearch,
    setEmployeePendingApprovalSearch,
    resetEmployeePendingApprovalSearch
  );

  // ✅ Guard against duplicate API calls (React StrictMode mounts twice)
  const didFetchRef = useRef(false);

  /**
   * 🔹 Transform raw API data → Table rows
   */
  const mapToTableRows = (list = []) =>
    list.map((item) => ({
      key: item.approvalID || item.id,
      instrument: item.instrument?.instrumentName || item.instrumentName || "",
      transactionid: item.transactionId || item.transactionid || "",
      approvalRequestDateime: `${item.transactionConductedDate || ""} ${
        item.transactionConductedTime || ""
      }`,
      quantity: item.quantity || 0,
      type: item.tradeType?.typeName || item.type || "",
      broker: item.broker?.brokerName || item.broker || "",
      status: item?.workFlowStatus?.approvalStatusName || item.status || "",
      ...item,
    }));

  /**
   * 🔹 Fetch pending approvals from API
   * Handles initial load and filter/search triggers.
   */
  const fetchPendingApprovals = useCallback(
    async (requestData) => {
      showLoader(true);

      try {
        const res = await SearchEmployeePendingUploadedPortFolio({
          callApi,
          showNotification,
          showLoader,
          requestdata: requestData,
          navigate,
        });

        const mapped = mapToTableRows(res?.pendingPortfolios || []);

        setEmployeePendingApprovalsData((prev) => {
          if (!res?.pendingPortfolios || res.pendingPortfolios.length === 0) {
            // 🔹 Reset when no records
            return {
              data: [],
              totalRecords: 0,
              mqttRecived: false,
              Apicall: true,
            };
          }

          // 🔹 Append new rows
          return {
            ...prev,
            data: [...(prev.data || []), ...mapped],
            totalRecords: res?.totalRecords ?? (prev.totalRecords || 0),
            mqttRecived: false,
            Apicall: true,
          };
        });
      } catch (error) {
        console.error("❌ Error fetching pending approvals:", error);
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
    ]
  );

  /**
   * 🔄 Sync `employeePendingApprovalsData` → `tableData`
   * Runs whenever API updates context state.
   */
  useEffect(() => {
    if (employeePendingApprovalsData.Apicall) {
      setTableData((prev) => {
        if (employeePendingApprovalsData.data.length === 0) {
          return { rows: [], totalRecords: 0 };
        }

        return {
          rows: [...(prev.rows || []), ...employeePendingApprovalsData.data],
          totalRecords: employeePendingApprovalsData.totalRecords,
        };
      });

      // Update global search state (pagination info)
      setEmployeePendingApprovalSearch((prev) => ({
        ...prev,
        totalRecords:
          employeePendingApprovalsData.totalRecords ??
          employeePendingApprovalsData.data.length,
        pageNumber: 10,
      }));

      // Reset Apicall flag
      setEmployeePendingApprovalsData((prev) => ({
        ...prev,
        Apicall: false,
      }));
    }
  }, [employeePendingApprovalsData.Apicall]);

  /**
   * 🔄 Handle new MQTT data (prepend new record to top of list)
   */
  useEffect(() => {
    if (employeePendingApprovalsDataMqtt.mqttRecived) {
      const mapped = mapToTableRows(
        Array.isArray(employeePendingApprovalsDataMqtt?.mqttRecivedData)
          ? employeePendingApprovalsDataMqtt.mqttRecivedData
          : [employeePendingApprovalsDataMqtt.mqttRecivedData]
      );

      // Prepend new row(s) at index 0
      setEmployeePendingApprovalsData((prev) => ({
        ...prev,
        data: [...mapped, ...(prev.data || [])],
        totalRecords: (prev.totalRecords || 0) + mapped.length, // increment count
        Apicall: true, // trigger table sync effect
      }));
    }

    // Reset mqtt state after handling
    setEmployeePendingApprovalsDataMqtt({
      mqttRecivedData: [],
      mqttRecived: false,
    });
  }, [employeePendingApprovalsDataMqtt.mqttRecived]);

  /**
   * 🔹 Build request payload from search state
   */
  const buildPortfolioRequest = (searchState) => ({
    InstrumentName:
      searchState.mainInstrumentName || searchState.instrumentName || "",
    Quantity: searchState.quantity ? Number(searchState.quantity) : 0,
    StartDate: searchState.startDate
      ? moment(searchState.startDate).format("YYYYMMDD")
      : "",
    EndDate: searchState.endDate
      ? moment(searchState.endDate).format("YYYYMMDD")
      : "",
    BrokerName:
      Array.isArray(searchState.broker) && searchState.broker.length > 0
        ? searchState.broker.join(",")
        : "",
    PageNumber: searchState.pageNumber ? Number(searchState.pageNumber) : 0,
    Length: searchState.pageSize ? Number(searchState.pageSize) : 10,
  });

  /**
   * 🔄 React to search/filter trigger
   */
  useEffect(() => {
    if (employeePendingApprovalSearch.filterTrigger) {
      console.log(
        "employeePendingApprovalSearch",
        employeePendingApprovalSearch
      );
      const data = buildPortfolioRequest(employeePendingApprovalSearch);
      fetchPendingApprovals(data);

      // Reset filter trigger
      setEmployeePendingApprovalSearch((prev) => ({
        ...prev,
        filterTrigger: false,
      }));
    }
  }, [employeePendingApprovalSearch.filterTrigger, fetchPendingApprovals]);

  /**
   * 🔄 Infinite scroll → load more data when reaching bottom
   */
  useTableScrollBottom(
    async () => {
      if (employeePendingApprovalSearch?.totalRecords <= tableData?.rows.length)
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
          showLoader, // don't trigger full loader for lazy load
          requestdata: requestData,
          navigate,
        });

        const mapped = mapToTableRows(res?.pendingPortfolios || []);
        setTableData((prev) => [...prev, ...mapped]);

        setEmployeePendingApprovalSearch((prev) => ({
          ...prev,
          totalRecords: res?.totalRecords ?? prev.totalRecords,
          pageNumber: (prev.pageNumber || 0) + 10,
        }));
      } catch (error) {
        console.error("❌ Error loading more approvals:", error);
      } finally {
        setLoadingMore(false);
      }
    },
    0,
    "border-less-table-blue" // table container class
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

    // Reset search state only if page reloaded
    try {
      const navigationEntries = performance.getEntriesByType("navigation");
      if (
        navigationEntries.length > 0 &&
        navigationEntries[0].type === "reload"
      ) {
        resetEmployeePendingApprovalSearch();
      }
    } catch (error) {
      console.error("❌ Error detecting page reload:", error);
    }
  }, [fetchPendingApprovals, resetEmployeePendingApprovalSearch]);
  
  /**
   * 🔄 Cleanup → reset states on unmount
   */
  useEffect(() => {
    return () => {
      // ✅ Reset local states
      setSortedInfo({});
      setTableData({ rows: [], totalRecords: 0 });
      setLoadingMore(false);

      // ✅ Reset search state (from SearchBarContext)
      resetEmployeePendingApprovalSearch();

      // ✅ Reset portfolio context states
      setEmployeePendingApprovalsData({
        data: [],
        totalRecords: 0,
        Apicall: false,
      });
      setEmployeePendingApprovalsDataMqtt({
        mqttRecivedData: [],
        mqttRecived: false,
      });

      console.log("🧹 PendingApprovals cleanup → all states reset");
    };
  }, []);

  return (
    <BorderlessTable
      rows={tableData.rows}
      columns={columns}
      classNameTable="border-less-table-blue"
      scroll={
        tableData?.rows?.length ? { x: "max-content", y: 550 } : undefined
      }
      onChange={(pagination, filters, sorter) => {
        setSortedInfo(sorter || {});
      }}
      loading={loadingMore}
    />
  );
};

export default PendingApprovals;
