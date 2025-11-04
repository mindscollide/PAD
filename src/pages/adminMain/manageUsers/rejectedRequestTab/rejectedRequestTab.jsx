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

const RejectedRequestTab = ({activeFilters}) => {
  const navigate = useNavigate();
  const hasFetched = useRef(false);
  const tableScrollBrokersList = useRef(null);

  // 🔷 Context Hooks
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();
  const { callApi } = useApi();
  const {
    adminBrokerSearch,
    setAdminBrokerSearch,
    resetAdminBrokersListSearch,
  } = useSearchBarContext();

  const {
    adminBrokerData,
    setAdminBrokerData,
    resetAdminBrokersDataContextState,
    adminBrokerMqtt,
    setAdminBrokerMqtt,
  } = useMyAdmin();
  
  const [loadingMore, setLoadingMore] = useState(false);

  // 🔷 UI State
  const [sortedInfo, setSortedInfo] = useState({});
  const [open, setOpen] = useState(false);

  // 🔷 Table Columns
  //   const columns = getBrokerTableColumns({
  //     sortedInfo,
  //     adminBrokerSearch,
  //     setAdminBrokerSearch,
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
      const brokers = Array.isArray(res?.brokers) ? res.brokers : [];

      setAdminBrokerData((prev) => ({
        brokers: replace ? brokers : [...(prev?.brokers || []), ...brokers],
        // this is for to run lazy loading its data comming from database of total data in db
        totalRecordsDataBase: res?.totalRecords || 0,
        // this is for to know how mush dta currently fetch from  db
        totalRecordsTable: replace
          ? brokers.length
          : adminBrokerData.totalRecordsTable + brokers.length,
      }));

      setAdminBrokerSearch((prev) => {
        const next = {
          ...prev,
          pageNumber: replace
            ? brokers.length
            : prev.pageNumber + brokers.length,
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
      setAdminBrokerSearch,
      setAdminBrokerData,
    ]
  );

  // ----------------- Effects -----------------

  // 🔷 Initial Data Fetch
  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      const requestData = buildApiRequest(adminBrokerSearch);
      fetchApiCall(requestData, true, true);
    }
  }, [buildApiRequest, adminBrokerSearch, fetchApiCall]);

  // Reset on Unmount
  useEffect(() => {
    return () => {
      resetAdminBrokersListSearch();
      resetAdminBrokersDataContextState();
    };
  }, []);

  // Fetch on Filter Trigger
  useEffect(() => {
    if (adminBrokerSearch.filterTrigger) {
      const requestData = buildApiRequest(adminBrokerSearch);

      fetchApiCall(requestData, true, true);
    }
  }, [adminBrokerSearch.filterTrigger]);

  // MQTT Updates
  useEffect(() => {
    if (adminBrokerMqtt) {
      setAdminBrokerMqtt(false);
      let requestData = buildApiRequest(adminBrokerSearch);
      requestData = {
        ...requestData,
        PageNumber: 0,
      };
      fetchApiCall(requestData, true, false);
    }
  }, [adminBrokerMqtt]);

  // Lazy loading
  useTableScrollBottom(
    async () => {
      if (
        adminBrokerData?.totalRecordsDataBase <=
        adminBrokerData?.totalRecordsTable
      )
        return;

      try {
        setLoadingMore(true);
        const requestData = buildApiRequest(adminBrokerSearch);
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
          // rows={adminBrokerData?.brokers || []}
          classNameTable="border-less-table-blue"
          scroll={
            adminBrokerData?.brokers?.length
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
