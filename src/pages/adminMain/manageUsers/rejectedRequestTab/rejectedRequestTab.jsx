import React, { useCallback, useEffect, useRef, useState } from "react";
import { Col, Row } from "antd";

// 🔹 Components

// 🔹 Contexts

// 🔹 Styles
import styles from "./rejectedRequestTab.module.css";
import { buildApiRequest } from "./utils";

import { useNavigate } from "react-router-dom";
import { UpOutlined, DownOutlined } from "@ant-design/icons";
import { BorderlessTable } from "../../../../components";
import { useMyAdmin } from "../../../../context/AdminContext";
import { useSearchBarContext } from "../../../../context/SearchBarContaxt";
import { useGlobalLoader } from "../../../../context/LoaderContext";
import { useNotification } from "../../../../components/NotificationProvider/NotificationProvider";
import { useApi } from "../../../../context/ApiContext";
import { useTableScrollBottom } from "../../../../common/funtions/scroll";
import { SearchBrokersAdminRequest } from "../../../../api/adminApi";

const RejectedRequestTab = ({ activeFilters }) => {
  const navigate = useNavigate();
  const hasFetched = useRef(false);
  const tableScrollBrokersList = useRef(null);

  // 🔷 Context Hooks
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

  const [loadingMore, setLoadingMore] = useState(false);

  // 🔷 UI State
  const [sortedInfo, setSortedInfo] = useState({});
  const [open, setOpen] = useState(false);

  // 🔷 Table Columns
  //   const columns = getBrokerTableColumns({
  //     sortedInfo,
  //     adminBrokerSearch,
  //     setRejectedRequestsTabSearch,
  //     setEditBrokerModal,
  //     setEditModalData,
  //     onStatusChange: onToggleStatusApiRequest,
  //   });
  // 🔷 Table Columns
  const columns = [];
  /** 🔹 Fetch approvals from API */
  const fetchApiCall = useCallback(
    async (requestData, replace = false, showLoaderFlag = true) => {
      if (!requestData || typeof requestData !== "object") return;
      if (showLoaderFlag) showLoader(true);

      const res = await SearchBrokersAdminRequest({
        callApi,
        showNotification,
        showLoader,
        requestdata: requestData,
        navigate,
      });
      const rejectedRequests = Array.isArray(res?.rejectedRequests)
        ? res.rejectedRequests
        : [];

      setManageUsersRejectedRequestTabData((prev) => ({
        brokers: replace
          ? rejectedRequests
          : [...(prev?.rejectedRequests || []), ...rejectedRequests],
        // this is for to run lazy loading its data comming from database of total data in db
        totalRecordsDataBase: res?.totalRecords || 0,
        // this is for to know how mush dta currently fetch from  db
        totalRecordsTable: replace
          ? rejectedRequests.length
          : manageUsersRejectedRequestTabData.totalRecordsTable +
            rejectedRequests.length,
      }));

      setRejectedRequestsTabSearch((prev) => {
        const next = {
          ...prev,
          pageNumber: replace
            ? rejectedRequests.length
            : prev.pageNumber + rejectedRequests.length,
        };

        // this is for check if filter value get true only on that it will false
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

  // ----------------- Effects -----------------

  // 🔷 Initial Data Fetch
  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      const requestData = buildApiRequest(rejectedRequestsTabSearch);
      fetchApiCall(requestData, true, true);
    }
  }, [buildApiRequest, rejectedRequestsTabSearch, fetchApiCall]);

  // Reset on Unmount
  useEffect(() => {
    return () => {
      resetRejectedRequestsTabSearch();
      resetManageUsersRejectedRequestTabData();
    };
  }, []);

  // Fetch on Filter Trigger
  useEffect(() => {
    if (rejectedRequestsTabSearch.filterTrigger) {
      const requestData = buildApiRequest(rejectedRequestsTabSearch);

      fetchApiCall(requestData, true, true);
    }
  }, [rejectedRequestsTabSearch.filterTrigger]);

  // MQTT Updates
  useEffect(() => {
    if (manageUsersRejectedRequestTabMQTT) {
      setManageUsersRejectedRequestTabMQTT(false);
      let requestData = buildApiRequest(rejectedRequestsTabSearch);
      requestData = {
        ...requestData,
        PageNumber: 0,
      };
      fetchApiCall(requestData, true, false);
    }
  }, [manageUsersRejectedRequestTabMQTT]);

  // Lazy loading
  useTableScrollBottom(
    async () => {
      if (
        manageUsersRejectedRequestTabData?.totalRecordsDataBase <=
        manageUsersRejectedRequestTabData?.totalRecordsTable
      )
        return;

      try {
        setLoadingMore(true);
        const requestData = buildApiRequest(rejectedRequestsTabSearch);
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

  return (
    <>
      <div className="px-4 md:px-6 lg:px-8">
        {/* 🔷 Brokers Table */}
        <BorderlessTable
          rows={manageUsersRejectedRequestTabData?.rejectedRequests || []}
          classNameTable="border-less-table-blue"
          scroll={
            manageUsersRejectedRequestTabData?.rejectedRequests?.length
              ? { x: "max-content", y: activeFilters.length > 0 ? 450 : 500 }
              : undefined
          }
          columns={columns}
          onChange={(pagination, filters, sorter) => {
            setSortedInfo(sorter);
          }}
          loading={loadingMore}
          ref={tableScrollBrokersList}
        />
      </div>
    </>
  );
};

export default RejectedRequestTab;
