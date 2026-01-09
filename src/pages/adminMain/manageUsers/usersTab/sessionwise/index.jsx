import React, { useEffect, useState, useRef, useCallback } from "react";
import { Breadcrumb, Col, Row } from "antd";

// 🔹 Assets
import PDF from "../../../../../assets/img/pdf.png";
import Excel from "../../../../../assets/img/xls.png";

// 🔹 Components
import BorderlessTable from "../../../../../components/tables/borderlessTable/borderlessTable";
import PageLayout from "../../../../../components/pageContainer/pageContainer";

// 🔹 Table Utilities
import {
  buildApiRequest,
  getBorderlessTableColumns,
  mappingData,
} from "./utils";

// 🔹 Contexts
import { useNotification } from "../../../../../components/NotificationProvider/NotificationProvider";
import { useApi } from "../../../../../context/ApiContext";
import { useGlobalLoader } from "../../../../../context/LoaderContext";
import { useNavigate } from "react-router-dom";
import { useSearchBarContext } from "../../../../../context/SearchBarContaxt";
import { useMyAdmin } from "../../../../../context/AdminContext";

// 🔹 API
import {
  GetUserSessionWiseActivity,
  ViewUserSessionWiseActivity,
} from "../../../../../api/adminApi";

// 🔹 Hooks & Utils
import { useTableScrollBottom } from "../../../../../common/funtions/scroll";

// 🔹 Styles
import style from "./sessionWise.module.css";
import ViewActionSessionWiseModal from "./viewActionSessionWiseModal/ViewActionSessionWiseModal";
import { useGlobalModal } from "../../../../../context/GlobalModalContext";

/**
 * -------------------------------------------------------------
 *  USER SESSION WISE ACTIVITY PAGE
 * -------------------------------------------------------------
 * Displays activity logs of a selected user, including:
 *  - Login date
 *  - Login time
 *  - IP address
 *  - Session details
 *
 * Supports:
 *  - Lazy loading (infinite scroll)
 *  - Filtering (IP address, Login Date range)
 *  - Breadcrumb navigation
 *  - State managed via contexts
 */
const UserSessionWiseActivity = () => {
  // -------------------------------------------------------------
  //  Refs
  // -------------------------------------------------------------
  const hasFetched = useRef(false);
  const tableSessionWiseTransaction = useRef(null);

  // -------------------------------------------------------------
  //  Hooks & Contexts
  // -------------------------------------------------------------
  const navigate = useNavigate();
  const { callApi } = useApi();
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();

  const {
    adminSessionWiseActivityListData,
    setAdminSessionWiseActivityListData,
    sessionWiseViewActionModal,
    setSessionWiseViewActionModal,
  } = useMyAdmin();

  const { adminSessionWiseActivitySearch, setAdminSessionWiseActivitySearch } =
    useSearchBarContext();

  // For Session Wise View Action Modal in Admin Role
  const {
    viewActionSessionWiseModal,
    setViewActionSessionWiseModal,
    setViewActionSessionWiseModalData,
  } = useGlobalModal();

  // -------------------------------------------------------------
  //  Local state
  // -------------------------------------------------------------
  const [sortedInfo, setSortedInfo] = useState({});
  const [loadingMore, setLoadingMore] = useState(false);

  // -------------------------------------------------------------
  //  API CALL HANDLER
  // -------------------------------------------------------------

  /**
   * Fetch Session Activity Data
   *
   * @param {object} requestData - API request payload
   * @param {boolean} replace - if true → replace table data
   * @param {boolean} showLoaderFlag - true → show loader
   */
  const fetchApiCall = useCallback(
    async (requestData, replace = false, showLoaderFlag = true) => {
      if (!requestData || typeof requestData !== "object") return;

      // Show loader only for full load requests
      if (showLoaderFlag) showLoader(true);

      const res = await GetUserSessionWiseActivity({
        callApi,
        showNotification,
        showLoader,
        requestdata: requestData,
        navigate,
      });

      const records = Array.isArray(res?.sessions) ? res.sessions : [];
      const mapped = mappingData(records);

      if (!mapped || typeof mapped !== "object") return;

      // Update session list table
      setAdminSessionWiseActivityListData((prev) => ({
        ...prev,
        sessions: replace ? mapped : [...(prev?.sessions || []), ...mapped],
        totalRecordsDataBase: res?.totalRecords || 0,
        totalRecordsTable: replace
          ? mapped.length
          : prev.totalRecordsTable + mapped.length,
      }));

      // Update search context
      setAdminSessionWiseActivitySearch((prev) => {
        const next = {
          ...prev,
          pageNumber: replace ? mapped.length : prev.pageNumber + mapped.length,
        };

        if (prev.filterTrigger) next.filterTrigger = false;

        return next;
      });
    },
    [callApi, navigate, showLoader, showNotification]
  );

  // -------------------------------------------------------------
  //  Initial Fetch
  // -------------------------------------------------------------
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    let requestData = [];
    const navigationEntries = performance.getEntriesByType("navigation");

    if (navigationEntries.length > 0) {
      const navigationType = navigationEntries[0].type;

      if (navigationType === "reload") {
        const savedName = sessionStorage.getItem("sessionWiseEmployeeName");
        const savedID = sessionStorage.getItem("sessionWiseEmployeeID");
        if (savedName) {
          setAdminSessionWiseActivityListData((prev) => ({
            ...prev,
            employeeName: savedName,
          }));
        }
        if (savedID) {
          setAdminSessionWiseActivitySearch((prev) => ({
            ...prev,
            employeeID: savedID,
          }));
        }

        console.log("savedName", savedName);
        console.log("savedName", savedID);
        // Call your API function
        if (savedID) {
          requestData = buildApiRequest({
            ...adminSessionWiseActivitySearch,
            ...(savedID && { employeeID: savedID }),
          });
        } else {
          requestData = buildApiRequest(adminSessionWiseActivitySearch);
        }
      } else {
        requestData = buildApiRequest(adminSessionWiseActivitySearch);
        console.log("savedName", adminSessionWiseActivityListData);
        console.log("savedName", adminSessionWiseActivitySearch);
      }
    } else {
      requestData = buildApiRequest(adminSessionWiseActivitySearch);
    }
    fetchApiCall(requestData, true, true);
  }, []);

  // Reload Detection
  useEffect(() => {
    try {
      const navEntries = performance.getEntriesByType("navigation");
      if (navEntries[0]?.type === "reload") {
        if (adminSessionWiseActivityListData.employeeName) {
          sessionStorage.setItem(
            "sessionWiseEmployeeName",
            adminSessionWiseActivityListData.employeeName
          );
        }

        if (adminSessionWiseActivitySearch.employeeID) {
          sessionStorage.setItem(
            "sessionWiseEmployeeID",
            adminSessionWiseActivitySearch.employeeID
          );
        }
      }
    } catch (error) {
      console.error("Reload detection failed", error);
    }
  }, []);
  // -------------------------------------------------------------
  //  Filter trigger → Run new API search
  // -------------------------------------------------------------
  useEffect(() => {
    if (adminSessionWiseActivitySearch?.filterTrigger) {
      const requestData = buildApiRequest(adminSessionWiseActivitySearch);
      fetchApiCall(requestData, true, true);
    }
  }, [adminSessionWiseActivitySearch?.filterTrigger]);

  // -------------------------------------------------------------
  //  Lazy Loading (Infinite Scroll)
  // -------------------------------------------------------------
  useTableScrollBottom(
    async () => {
      if (
        adminSessionWiseActivityListData.totalRecordsTable >=
        adminSessionWiseActivityListData.totalRecordsDataBase
      )
        return;

      setLoadingMore(true);

      try {
        const requestData = buildApiRequest(adminSessionWiseActivitySearch);
        await fetchApiCall(requestData, false, false);
      } finally {
        setLoadingMore(false);
      }
    },
    0,
    "border-less-table-blue"
  );

  /** viewActionModal */
  const handleViewActionModal = async (data) => {
    const requestData = { SessionID: data.sessionID };
    showLoader(true);
    const res = await ViewUserSessionWiseActivity({
      callApi,
      showNotification,
      showLoader,
      requestdata: requestData,
      navigate,
    });
    if (res?.result) {
      setViewActionSessionWiseModal(true);
      setViewActionSessionWiseModalData(res);
    } else {
      setViewActionSessionWiseModalData([]);
      setViewActionSessionWiseModal(false);
      showNotification({
        type: "warning",
        title: "No records found",
        description: "Against this session.",
      });
    }
  };
  
  useEffect(() => {
    try {
      if (!viewActionSessionWiseModal) {
        setViewActionSessionWiseModalData([]);
      }
    } catch (error) {
      console.error("Reload detection failed", error);
    }
  }, [viewActionSessionWiseModal]);

  // -------------------------------------------------------------
  //  Table Columns
  // -------------------------------------------------------------
  const columns = getBorderlessTableColumns({
    sortedInfo,
    handleViewActionModal,
  });

  // -------------------------------------------------------------
  //  Filter Handling
  // -------------------------------------------------------------

  /** Remove individual filter */
  const handleRemoveFilter = (key) => {
    const resetMap = {
      ipAddress: { ipAddress: "" },
      loginDate: { startDate: null, endDate: null },
    };

    setAdminSessionWiseActivitySearch((prev) => ({
      ...prev,
      ...resetMap[key],
      pageNumber: 0,
      filterTrigger: true,
    }));
  };

  /** Clear all filters */
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

  /** Construct active filter tags */
  const activeFilters = (() => {
    const { ipAddress, startDate, endDate } = adminSessionWiseActivitySearch;

    const formatDate = (d) =>
      d ? new Date(d).toISOString().split("T")[0] : null;

    const formattedStart = formatDate(startDate);
    const formattedEnd = formatDate(endDate);

    let loginDate = null;
    if (formattedStart && formattedEnd) {
      loginDate = `${formattedStart} to ${formattedEnd}`;
    } else if (formattedStart) loginDate = `From ${formattedStart}`;
    else if (formattedEnd) loginDate = `Till ${formattedEnd}`;

    return [
      ipAddress ? { key: "ipAddress", value: ipAddress } : null,
      loginDate ? { key: "loginDate", value: loginDate } : null,
    ].filter(Boolean);
  })();

  // -------------------------------------------------------------
  //  Render
  // -------------------------------------------------------------
  return (
    <>
      {/* Breadcrumb */}
      <Row justify="start" align="middle" className={style.breadcrumbRow}>
        <Col>
          <Breadcrumb
            separator=">"
            className={style.customBreadcrumb}
            items={[
              {
                title: (
                  <span
                    className={style.breadcrumbLink}
                    onClick={() => navigate("/PAD/admin-users")}
                  >
                    Users
                  </span>
                ),
              },
              {
                title: (
                  <span className={style.breadcrumbText}>
                    Session wise Activity (
                    {adminSessionWiseActivityListData.employeeName})
                  </span>
                ),
              },
            ]}
          />
        </Col>
      </Row>

      {/* Active Filter Tags */}
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
                  ×
                </span>
              </div>
            </Col>
          ))}

          {activeFilters.length > 1 && (
            <Col>
              <div
                className={`${style["filter-tag"]} ${style["clear-all-tag"]}`}
                onClick={handleRemoveAllFilters}
              >
                Clear All
              </div>
            </Col>
          )}
        </Row>
      )}

      {/* Session Table */}
      <PageLayout
        background="white"
        className={
          activeFilters.length > 0
            ? "repotsHeightHOC"
            : "sessionwiseHeight"
        }
      >
        <div className="px-4 md:px-6 lg:px-8">
          <BorderlessTable
            rows={adminSessionWiseActivityListData?.sessions}
            columns={columns}
            classNameTable="border-less-table-blue"
            scroll={
              adminSessionWiseActivityListData?.sessions?.length
                ? {
                    x: "max-content",
                    y: activeFilters.length > 0 ? 500 : 550,
                  }
                : undefined
            }
            onChange={(pagination, filters, sorter) => setSortedInfo(sorter)}
            loading={loadingMore}
            ref={tableSessionWiseTransaction}
          />
        </div>
      </PageLayout>

      {/* View Action Session Wise Modal */}
      {viewActionSessionWiseModal && <ViewActionSessionWiseModal />}
    </>
  );
};

export default UserSessionWiseActivity;
