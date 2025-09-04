// src/pages/employee/approval/PendingApprovals.jsx

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";

// Components
import BorderlessTable from "../../../../../components/tables/borderlessTable/borderlessTable";

// Utils
import { getBorderlessTableColumns } from "./utill";
import { approvalStatusMap } from "../../../../../components/tables/borderlessTable/utill";

// Contexts
import { useSearchBarContext } from "../../../../../context/SearchBarContaxt";
import { useApi } from "../../../../../context/ApiContext";
import { useGlobalLoader } from "../../../../../context/LoaderContext";

// Hooks
import { useNotification } from "../../../../../components/NotificationProvider/NotificationProvider";

// API
import { SearchEmployeePendingUploadedPortFolio } from "../../../../../api/protFolioApi";
import { useTableScrollBottom } from "../../myApprovals/utill";
import moment from "moment";

const PendingApprovals = () => {
  const navigate = useNavigate();

  // Context hooks
  const { callApi } = useApi();
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();

  // Local state
  const [sortedInfo, setSortedInfo] = useState({});
  const [tableData, setTableData] = useState({
    rows: [],
    totalRecords: 0,
  });
  const [loadingMore, setLoadingMore] = useState(false);

  // Global search state (specific to employee pending approvals)
  const {
    employeePendingApprovalSearch,
    setEmployeePendingApprovalSearch,
    resetEmployeePendingApprovalSearch,
  } = useSearchBarContext();

  // Table column definitions
  const columns = getBorderlessTableColumns(
    approvalStatusMap,
    sortedInfo,
    employeePendingApprovalSearch,
    setEmployeePendingApprovalSearch,
    resetEmployeePendingApprovalSearch
  );

  // Guard to prevent duplicate API calls (React 18 StrictMode)
  const didFetchRef = useRef(false);

  /**
   * Transform API response → Table rows
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
   * Initial fetch (first page)
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

        setTableData({
          rows: mapped,
          totalRecords: res?.totalRecords || 0,
        });

        // Track total & next page
        setEmployeePendingApprovalSearch((prev) => ({
          ...prev,
          totalRecords: res?.totalRecords ?? mapped.length,
          pageNumber: 10,
        }));
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
      setEmployeePendingApprovalSearch,
    ]
  );
  const buildPortfolioRequest = (searchState) => {
    return {
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
    };
  };
  useEffect(() => {
    if (employeePendingApprovalSearch.filterTrigger) {
      console.log(
        "employeePendingApprovalSearch",
        buildPortfolioRequest(employeePendingApprovalSearch)
      );
      let data = buildPortfolioRequest(employeePendingApprovalSearch);

      fetchPendingApprovals(data);

      // Reset trigger after processing
      setEmployeePendingApprovalSearch((prev) => ({
        ...prev,
        filterTrigger: false,
      }));
    }
  }, [employeePendingApprovalSearch.filterTrigger]);
  /**
   * Lazy load more when reaching bottom
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
          showLoader, // don’t trigger full loader for lazy load
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
   * Run once on mount
   */
  useEffect(() => {
    if (didFetchRef.current) return;
    didFetchRef.current = true;
    let requestData = {
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

  return (
    <BorderlessTable
      rows={tableData.rows}
      columns={columns}
      classNameTable="border-less-table-blue"
      scroll={{ x: "max-content", y: 550 }}
      onChange={(pagination, filters, sorter) => {
        setSortedInfo(sorter || {});
      }}
      loading={loadingMore}
    />
  );
};

export default PendingApprovals;
