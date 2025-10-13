// src/pages/employee/approval/PendingApprovals.jsx

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";

// Components
import BorderlessTable from "../../../../../components/tables/borderlessTable/borderlessTable";

// Utils
import {
  buildApiRequest,
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

// API
import { SearchEmployeePendingUploadedPortFolio } from "../../../../../api/protFolioApi";
import { useTableScrollBottom } from "../../../../../common/funtions/scroll";
import { getSafeAssetTypeData } from "../../../../../common/funtions/assetTypesList";

const PendingApprovals = ({ activeFilters }) => {
  const navigate = useNavigate();
  const tableScrollEmployeePendingApprovals = useRef(null);

  // -------------------------
  // ✅ Context hooks
  // -------------------------
  const { callApi } = useApi();
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();
  const {
    employeeBasedBrokersData,
    assetTypeListingData,
    setAssetTypeListingData,
  } = useDashboardContext();

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

  // ----------------------------------------------------------------
  // 🔹 API CALL: Fetch pending approvals
  // ----------------------------------------------------------------
  const fetchApiCall = useCallback(
    async (requestData, replace = false, loader = false) => {
      if (!requestData || typeof requestData !== "object") return;
      if (loader) showLoader(true);

      try {
        const res = await SearchEmployeePendingUploadedPortFolio({
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

        const pendingPortfolios = Array.isArray(res?.pendingPortfolios)
          ? res.pendingPortfolios
          : [];

        const mapped = mapToTableRows(
          currentAssetTypeData?.Equities,
          pendingPortfolios,
          brokerOptions
        );

        setEmployeePendingApprovalsData((prev) => ({
          pendingApprovalsData: replace
            ? mapped
            : [...(prev?.pendingApprovalsData || []), ...mapped],
          // this is for to run lazy loading its data comming from database of total data in db
          totalRecordsDataBase: res?.totalRecords || 0,
          // this is for to know how mush dta currently fetch from  db
          totalRecordsTable: replace
            ? mapped.length
            : employeePendingApprovalsData.totalRecordsTable + mapped.length,
        }));

        setEmployeePendingApprovalSearch((prev) => {
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
    [
      callApi,
      showNotification,
      showLoader,
      navigate,
      brokerOptions,
      assetTypeListingData,
    ]
  );

  // ----------------------------------------------------------------
  // 🔄 INITIAL LOAD (on mount)
  // ----------------------------------------------------------------
  useEffect(() => {
    if (didFetchRef.current) return;
    didFetchRef.current = true;

    const requestData = buildApiRequest(
      employeePendingApprovalSearch,
      assetTypeListingData
    );
    fetchApiCall(requestData, true, true);

    try {
      const navigationEntries = performance.getEntriesByType("navigation");
      if (navigationEntries?.[0]?.type === "reload") {
        resetEmployeePendingApprovalSearch();
      }
    } catch (error) {
      console.error("❌ Error detecting page reload:", error);
    }
  }, [fetchApiCall, resetEmployeePendingApprovalSearch]);

  // ----------------------------------------------------------------
  // 🔄 REAL-TIME: Handle new MQTT rows
  // ----------------------------------------------------------------
  useEffect(() => {
    if (employeePendingApprovalsDataMqtt) {
      const requestData = buildApiRequest(
        employeePendingApprovalSearch,
        assetTypeListingData
      );
      fetchApiCall(requestData, true, false);
      setEmployeePendingApprovalsDataMqtt(false);
    }

    // const newRows = mapToTableRows(
    //   assetTypeListingData?.Equities,
    //   Array.isArray(employeePendingApprovalsDataMqtt?.mqttRecivedData)
    //     ? employeePendingApprovalsDataMqtt.mqttRecivedData
    //     : [employeePendingApprovalsDataMqtt.mqttRecivedData],
    //   brokerOptions
    // );

    // if (newRows.length) {
    //   setTableData((prev) => ({
    //     rows: [newRows[0], ...(prev.rows || [])],
    //     totalRecords: (prev.totalRecords || 0) + 1,
    //   }));

    //   setEmployeePendingApprovalsData((prev) => ({
    //     ...prev,
    //     data: [newRows[0], ...(prev.data || [])],
    //     totalRecords: (prev.totalRecords || 0) + 1,
    //     Apicall: false,
    //   }));
    // }

    // setEmployeePendingApprovalsDataMqtt({
    //   mqttRecivedData: [],
    //   mqttRecived: false,
    // });
  }, [employeePendingApprovalsDataMqtt]);

  // ----------------------------------------------------------------
  // 🔄 On search/filter trigger
  // ----------------------------------------------------------------
  useEffect(() => {
    if (employeePendingApprovalSearch?.filterTrigger) {
      const requestData = buildApiRequest(
        employeePendingApprovalSearch,
        assetTypeListingData
      );
      fetchApiCall(requestData, true, true);
    }
  }, [employeePendingApprovalSearch?.filterTrigger, fetchApiCall]);

  // ----------------------------------------------------------------
  // 🔄 INFINITE SCROLL
  // ----------------------------------------------------------------

  useTableScrollBottom(
    async () => {
      if (
        employeePendingApprovalsData?.totalRecordsDataBase <=
        employeePendingApprovalsData?.totalRecordsTable
      )
        return;

      try {
        setLoadingMore(true);
        const requestData = buildApiRequest(
          employeePendingApprovalSearch,
          assetTypeListingData
        );

        await fetchApiCall(requestData, false, false);
      } catch (err) {
        console.error("Error loading more approvals:", err);
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
      resetEmployeePendingApprovalSearch();
      setEmployeePendingApprovalsData({
        pendingApprovalsData: [],
        // this is for to run lazy loading its data comming from database of total data in db
        totalRecordsDataBase: 0,
        // this is for to know how mush dta currently fetch from  db
        totalRecordsTable: 0,
      });
      setEmployeePendingApprovalsDataMqtt(false);
    };
  }, []);

  return (
    <BorderlessTable
      rows={employeePendingApprovalsData?.pendingApprovalsData || []}
      columns={columns}
      classNameTable="border-less-table-blue"
      scroll={
        employeePendingApprovalsData?.pendingApprovalsData?.length
          ? { x: "max-content", y: activeFilters.length > 0 ? 450 : 500 }
          : undefined
      }
      onChange={(_, __, sorter) => setSortedInfo(sorter || {})}
      loading={loadingMore}
      ref={tableScrollEmployeePendingApprovals}
    />
  );
};

export default PendingApprovals;
