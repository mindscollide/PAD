/**
 * @file RejectedRequestTab.jsx
 * @description Displays the "Rejected Requests" tab in the Admin Panel.
 * It supports pagination, lazy loading, filtering, and MQTT-based real-time updates.
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Col, Row } from "antd";
import { UpOutlined, DownOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

// 🔹 Styles
import styles from "./rejectedRequestTab.module.css";

// 🔹 Components
import { BorderlessTable } from "../../../../components";

// 🔹 Contexts
import { useMyAdmin } from "../../../../context/AdminContext";
import { useSearchBarContext } from "../../../../context/SearchBarContaxt";
import { useGlobalLoader } from "../../../../context/LoaderContext";
import { useNotification } from "../../../../components/NotificationProvider/NotificationProvider";
import { useApi } from "../../../../context/ApiContext";

// 🔹 Utilities & Hooks
import { useTableScrollBottom } from "../../../../common/funtions/scroll";
import { SearchRejectedUserRegistrationRequests } from "../../../../api/adminApi";
import { buildApiRequest, getPendingUserColumns } from "./utils";
import { useGlobalModal } from "../../../../context/GlobalModalContext";

/**
 * @component RejectedRequestTab
 * @description Displays the list of rejected user registration requests with support for:
 * - Lazy loading (infinite scroll)
 * - Filters (from SearchBar context)
 * - MQTT updates
 * - Sorting
 *
 * @param {Object} props
 * @param {Array} props.activeFilters - Active filter array passed from parent
 */
const RejectedRequestTab = ({ activeFilters }) => {
  const navigate = useNavigate();
  const hasFetched = useRef(false);
  const rejectedRequestsTable = useRef(null);

  // 🔹 Context Hooks
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();
  const { callApi } = useApi();

  const {
    rejectedRequestsTabSearch,
    setRejectedRequestsTabSearch,
    resetRejectedRequestsTabSearch,
  } = useSearchBarContext();

  const {
    manageUsersRejectedRequestTabData,
    setManageUsersRejectedRequestTabData,
    resetManageUsersRejectedRequestTabData,
    manageUsersRejectedRequestTabMQTT,
    setManageUsersRejectedRequestTabMQTT,
  } = useMyAdmin();

  const { setViewDetailRejectedModal } = useGlobalModal();

  // 🔹 Local State
  const [loadingMore, setLoadingMore] = useState(false);
  const [sortedInfo, setSortedInfo] = useState({});
  const [viewModal, setViewModal] = useState(false);

  // 🔹 Table Columns
  const columns = getPendingUserColumns({
    sortedInfo,
    setViewModal,
    setViewDetailRejectedModal,
  });

  /**
   * @function fetchApiCall
   * @description Fetches rejected user registration requests from the backend.
   * Handles both initial load and lazy loading (pagination).
   *
   * @param {Object} requestData - The payload for API request.
   * @param {boolean} [replace=false] - If true, replaces table data. If false, appends data.
   * @param {boolean} [showLoaderFlag=true] - Whether to show the global loader during fetch.
   */
  const fetchApiCall = useCallback(
    async (requestData, replace = false, showLoaderFlag = true) => {
      if (!requestData || typeof requestData !== "object") return;

      if (showLoaderFlag) showLoader(true);

      const res = await SearchRejectedUserRegistrationRequests({
        callApi,
        showNotification,
        showLoader,
        requestdata: requestData,
        navigate,
      });

      const rejectedRequests = Array.isArray(res?.rejectedRequests)
        ? res.rejectedRequests.map((item) => ({
            ...item,
            lastReqeustedDateandtime: `${item.lastReqeustedDate || ""} ${
              item.lastReqeustedTime || ""
            }`.trim(),
            lastRejectionDateandtime: `${item.lastRejectionDate || ""} ${
              item.lastRejectionTime || ""
            }`.trim(),
          }))
        : [];

      console.log("Fetched Rejected Requests:", rejectedRequests);

      // 🔹 Update context state for table data
      setManageUsersRejectedRequestTabData((prev) => ({
        rejectedRequests: replace
          ? rejectedRequests
          : [...(prev?.rejectedRequests || []), ...rejectedRequests],
        totalRecordsDataBase: res?.totalRecords || 0,
        totalRecordsTable: replace
          ? rejectedRequests.length
          : (prev?.totalRecordsTable || 0) + rejectedRequests.length,
      }));

      // 🔹 Update search state for pagination
      setRejectedRequestsTabSearch((prev) => {
        const next = {
          ...prev,
          pageNumber: replace
            ? rejectedRequests.length
            : prev.pageNumber + rejectedRequests.length,
        };

        // Reset filter trigger after fetch
        if (prev.filterTrigger) {
          next.filterTrigger = false;
        }
        return next;
      });
    },
    [
      callApi,
      navigate,
      showLoader,
      showNotification,
      setRejectedRequestsTabSearch,
      setManageUsersRejectedRequestTabData,
    ]
  );

  // -------------------------------
  // 🔷 Effects
  // -------------------------------

  /**
   * 🔸 Initial Fetch (on mount)
   */
  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      const requestData = buildApiRequest(rejectedRequestsTabSearch);
      fetchApiCall(requestData, true, true);
    }
  }, [buildApiRequest, rejectedRequestsTabSearch, fetchApiCall]);

  /**
   * 🔸 Cleanup (on unmount)
   */
  useEffect(() => {
    return () => {
      resetRejectedRequestsTabSearch();
      resetManageUsersRejectedRequestTabData();
    };
  }, []);

  /**
   * 🔸 Re-fetch on Filter Trigger
   */
  useEffect(() => {
    if (rejectedRequestsTabSearch.filterTrigger) {
      const requestData = buildApiRequest(rejectedRequestsTabSearch);
      fetchApiCall(requestData, true, true);
    }
  }, [rejectedRequestsTabSearch.filterTrigger]);

  /**
   * 🔸 MQTT Updates
   * Refresh table data when MQTT flag is triggered.
   */
  useEffect(() => {
    if (manageUsersRejectedRequestTabMQTT) {
      setManageUsersRejectedRequestTabMQTT(false);
      let requestData = buildApiRequest(rejectedRequestsTabSearch);
      requestData = { ...requestData, PageNumber: 0 };
      fetchApiCall(requestData, true, false);
    }
  }, [manageUsersRejectedRequestTabMQTT]);

  /**
   * 🔸 Lazy Loading
   * Triggers when user scrolls to bottom of table.
   */
  useTableScrollBottom(
    async () => {
      const { totalRecordsDataBase, totalRecordsTable } =
        manageUsersRejectedRequestTabData || {};

      if (totalRecordsDataBase <= totalRecordsTable) return;

      try {
        setLoadingMore(true);
        const requestData = buildApiRequest(rejectedRequestsTabSearch);
        await fetchApiCall(requestData, false, false);
      } catch (err) {
        console.error("Error loading more rejected requests:", err);
      } finally {
        setLoadingMore(false);
      }
    },
    0,
    "border-less-table-blue"
  );

  /**
   * @function handleChange
   * @description Handles sorting change for table columns.
   */
  const handleChange = (_, __, sorter) => setSortedInfo(sorter);

  // -------------------------------
  // 🔷 Render
  // -------------------------------
  return (
    <div className={styles.userTableContainer}>
      <BorderlessTable
        rows={manageUsersRejectedRequestTabData?.rejectedRequests}
        columns={columns}
        classNameTable="border-less-table-blue"
        onChange={handleChange}
        loading={loadingMore}
        scroll={
          manageUsersRejectedRequestTabData?.rejectedRequests?.length
            ? { y: activeFilters ? 450 : 500 }
            : undefined
        }
        ref={rejectedRequestsTable}
      />
    </div>
  );
};

export default RejectedRequestTab;
