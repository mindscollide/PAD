import React, { useEffect, useState, useRef, useCallback } from "react";
import { Breadcrumb, Col, Row } from "antd";
import PDF from "../../../../../assets/img/pdf.png";
import Excel from "../../../../../assets/img/xls.png";
// 🔹 Components
import BorderlessTable from "../../../../../components/tables/borderlessTable/borderlessTable";
import PageLayout from "../../../../../components/pageContainer/pageContainer";

// 🔹 Table Config
import {
  buildApiRequest,
  getBorderlessTableColumns,
  mappingData,
} from "./utils";
import { approvalStatusMap } from "../../../../../components/tables/borderlessTable/utill";

// 🔹 Contexts
import { useGlobalModal } from "../../../../../context/GlobalModalContext";

// 🔹 Styles
import style from "./sessionWise.module.css";

import { useNotification } from "../../../../../components/NotificationProvider/NotificationProvider";
import { useApi } from "../../../../../context/ApiContext";
import { useGlobalLoader } from "../../../../../context/LoaderContext";
import { useNavigate } from "react-router-dom";
import { useSearchBarContext } from "../../../../../context/SearchBarContaxt";
import { useDashboardContext } from "../../../../../context/dashboardContaxt";
import { getSafeAssetTypeData } from "../../../../../common/funtions/assetTypesList";
import { useTableScrollBottom } from "../../../../../common/funtions/scroll";
import { useMyAdmin } from "../../../../../context/AdminContext";
import { GetUserSessionWiseActivity } from "../../../../../api/adminApi";

const UserSessionWiseActivity = () => {
  const navigate = useNavigate();
  const hasFetched = useRef(false);
  const tableScrollEmployeeTransaction = useRef(null);

  // -------------------- Contexts --------------------
  const { callApi } = useApi();
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();
  const {
    adminSessionWiseActivityListData,
    setAdminSessionWiseActivityListData,
    resetAdminSessionWiseActivityListData,
  } = useMyAdmin();

  const {
    adminSessionWiseActivitySearch,
    setAdminSessionWiseActivitySearch,
    resetAdminSessionWiseActivitySearch,
  } = useSearchBarContext();

  // -------------------- Local State --------------------
  const [sortedInfo, setSortedInfo] = useState({});
  const [loadingMore, setLoadingMore] = useState(false);
  const [open, setOpen] = useState(false);

  // -------------------- Helpers --------------------

  /**
   * Fetches transactions from API.
   * @param {boolean} flag - whether to show loader
   */
  const fetchApiCall = useCallback(
    async (requestData, replace = false, showLoaderFlag = true) => {
      if (!requestData || typeof requestData !== "object") return;
      if (showLoaderFlag) showLoader(true);
      const res = await GetUserSessionWiseActivity({
        callApi,
        showNotification,
        showLoader,
        requestdata: requestData,
        navigate,
      });

      const records = Array.isArray(res?.sessions) ? res.sessions : [];
      console.log("records", records);
      const mapped = mappingData(records);
      console.log("records", mapped);
      if (!mapped || typeof mapped !== "object") return;

      setAdminSessionWiseActivityListData((prev) => ({
        ...prev,
        sessions: replace ? mapped : [...(prev?.sessions || []), ...mapped],
        // this is for to run lazy loading its data comming from database of total data in db
        totalRecordsDataBase: res?.totalRecords || 0,
        // this is for to know how mush dta currently fetch from  db
        totalRecordsTable: replace
          ? mapped.length
          : adminSessionWiseActivityListData.totalRecordsTable + mapped.length,
      }));
      setAdminSessionWiseActivitySearch((prev) => {
        const next = {
          ...prev,
          pageNumber: replace ? mapped.length : prev.pageNumber + mapped.length,
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
      setAdminSessionWiseActivitySearch,
      showLoader,
      showNotification,
    ]
  );
  console.log("records", adminSessionWiseActivityListData);
  console.log("records", adminSessionWiseActivitySearch);

  // -------------------- Effects --------------------

  // 🔹 Initial Fetch
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    const requestData = buildApiRequest(adminSessionWiseActivitySearch);
    fetchApiCall(requestData, true, true);
  }, []);

  //   // Reset on Unmount
  //   useEffect(() => {
  //     return () => {
  //       // Reset search state for fresh load
  //       resetAdminSessionWiseActivitySearch();
  //     };
  //   }, []);

  // 🔹 call api on search
  useEffect(() => {
    if (adminSessionWiseActivitySearch?.filterTrigger) {
      const requestData = buildApiRequest(adminSessionWiseActivitySearch);
      fetchApiCall(requestData, true, true);
    }
  }, [adminSessionWiseActivitySearch?.filterTrigger]);

  // 🔹 Infinite Scroll (lazy loading)
  useTableScrollBottom(
    async () => {
      if (
        adminSessionWiseActivityListData?.totalRecordsDataBase <=
        adminSessionWiseActivityListData?.totalRecordsTable
      )
        return;

      try {
        setLoadingMore(true);
        const requestData = buildApiRequest(adminSessionWiseActivitySearch);
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

  // -------------------- Table Columns --------------------
  const columns = getBorderlessTableColumns({
    sortedInfo,
  });

  /** 🔹 Handle removing individual filter */
  const handleRemoveFilter = (key) => {
    const resetMap = {
      ipAddress: { ipAddress: "" },

      // reset login date range
      loginDate: { startDate: null, endDate: null },
    };

    setAdminSessionWiseActivitySearch((prev) => ({
      ...prev,
      ...resetMap[key],
      pageNumber: 0,
      filterTrigger: true,
    }));
  };

  /** 🔹 Handle removing all filters */
  const handleRemoveAllFilters = () => {
    setAdminSessionWiseActivitySearch((prev) => ({
      ...prev,
      ipAddress: "",
      startDate: null,
      endDate: null,
      pageNumber: 0,
      filterTrigger: true,
    }));
  };

  /** 🔹 Build Active Filters */
  const activeFilters = (() => {
    const { ipAddress, startDate, endDate } =
      adminSessionWiseActivitySearch || {};

    const formatDate = (date) =>
      date ? new Date(date).toISOString().split("T")[0] : null;

    const formattedStart = formatDate(startDate);
    const formattedEnd = formatDate(endDate);

    // 🔹 Combine date range
    let loginDate = null;
    if (formattedStart && formattedEnd) {
      loginDate = `${formattedStart} to ${formattedEnd}`;
    } else if (formattedStart) {
      loginDate = `From ${formattedStart}`;
    } else if (formattedEnd) {
      loginDate = `Till ${formattedEnd}`;
    }

    return [
      ipAddress ? { key: "ipAddress", value: ipAddress } : null,
      loginDate ? { key: "loginDate", value: loginDate } : null,
    ].filter(Boolean);
  })();

  // -------------------- Render --------------------
  return (
    <>
      <Row justify="start" align="middle" className={style.breadcrumbRow}>
        <Col>
          <Breadcrumb
            separator=">"
            className={style.customBreadcrumb}
            items={[
              {
                title: (
                  <span
                    onClick={() => navigate("/PAD/admin-users")}
                    className={style.breadcrumbLink}
                  >
                    Users
                  </span>
                ),
              },
              {
                title: (
                  <span className={style.breadcrumbText}>
                    Session wise Activity (
                    {adminSessionWiseActivityListData?.employeeName})
                  </span>
                ),
              },
            ]}
          />
        </Col>
      </Row>
      {/* 🔹 Active Filter Tags */}
      {activeFilters.length > 0 && (
        <Row gutter={[12, 12]} className={style["filter-tags-container"]}>
          {activeFilters.map(({ key, value }) => (
            <Col key={key}>
              <div className={style["filter-tag"]}>
                <span>{value}</span>
                <span
                  className={style["filter-tag-close"]}
                  onClick={() => handleRemoveFilter(key)}
                >
                  &times;
                </span>
              </div>
            </Col>
          ))}

          {/* 🔹 Show Clear All only if more than one filter */}
          {activeFilters.length > 1 && (
            <Col>
              <div
                className={`${style["filter-tag"]} ${style["clear-all-tag"]}`}
                onClick={handleRemoveAllFilters}
              >
                <span>Clear All</span>
              </div>
            </Col>
          )}
        </Row>
      )}
      {/* 🔹 Transactions Table */}
      <PageLayout
        background="white"
        style={{ marginTop: "3px" }}
        className={
          activeFilters.length > 0 ? "changeHeightreports" : "repotsHeight"
        }
      >
        <div className="px-4 md:px-6 lg:px-8 ">
          <BorderlessTable
            rows={adminSessionWiseActivityListData?.sessions}
            columns={columns}
            classNameTable="border-less-table-blue"
            scroll={
              adminSessionWiseActivityListData?.complianceOfficerApprovalsList
                ?.length
                ? {
                    x: "max-content",
                    y: activeFilters.length > 0 ? 450 : 500,
                  }
                : undefined
            }
            onChange={(pagination, filters, sorter) => setSortedInfo(sorter)}
            loading={loadingMore}
            ref={tableScrollEmployeeTransaction}
          />
        </div>
      </PageLayout>
    </>
  );
};

export default UserSessionWiseActivity;
