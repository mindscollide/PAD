import React, { useEffect, useRef, useState, useCallback } from "react";
import { Breadcrumb, Col, Row } from "antd";
import { DownOutlined } from "@ant-design/icons";
import BorderlessTable from "../../../../components/tables/borderlessTable/borderlessTable";
import PageLayout from "../../../../components/pageContainer/pageContainer";
import CustomButton from "../../../../components/buttons/button";

import {
  buildApiRequest,
  buildExportRequest,
  mapListData,
  getSessionListColumns,
} from "./utils";

import style from "./UserActivityReport.module.css";
import {
  GetUserSessionWiseActivity,
  ViewUserSessionWiseActivity,
  ExportUserSessionWiseActivityRequest,
} from "../../../../api/adminApi";
import { useNotification } from "../../../../components/NotificationProvider/NotificationProvider";
import { useApi } from "../../../../context/ApiContext";
import { useGlobalLoader } from "../../../../context/LoaderContext";
import { useNavigate } from "react-router-dom";
import { useGlobalModal } from "../../../../context/GlobalModalContext";
import { useSearchBarContext } from "../../../../context/SearchBarContaxt";
import { useMyApproval } from "../../../../context/myApprovalContaxt";
import { useTableScrollBottom } from "../../../../common/funtions/scroll";
import ViewActionSessionWiseModal from "../../manageUsers/usersTab/sessionwise/viewActionSessionWiseModal/ViewActionSessionWiseModal";

/**
 * Admin Reports - User Activity Report.
 *
 * SRS ("User Activity Report"): a single flat list, columns Employee ID,
 * Employee Name, Login Date, IP Address, Login Time, Actions, Logout Time,
 * View Actions button - default-sorted Login Date descending, searchable by
 * Employee Name / IP Address / Login Date range via the standard collapsed
 * header search bar.
 *
 * GetUserSessionWiseActivity is now system-wide (deployed - see
 * API_Changes/2026-08-25_user_activity_report_system_wide.md): EmployeeID: 0
 * means "every employee", EmployeeName is a server-side search, and each
 * row carries its own EmployeeID/EmployeeName. So this loads/paginates the
 * same way as every other admin report list (Policy Breaches, User-wise
 * Compliance, etc.) - one paginated call, infinite-scroll lazy load, no
 * client-side merge or "search first" gate.
 */
const UserActivityReport = () => {
  const navigate = useNavigate();
  const hasFetched = useRef(false);
  const tableScrollRef = useRef(null);

  const { callApi } = useApi();
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();

  const {
    viewActionSessionWiseModal,
    setViewActionSessionWiseModal,
    setViewActionSessionWiseModalData,
  } = useGlobalModal();

  const {
    userActivityReportAdmin,
    setUserActivityReportAdmin,
    resetUserActivityReportSearch,
  } = useSearchBarContext();

  const {
    adminUserActivityReportData,
    setAdminUserActivityReportData,
    resetAdminUserActivityReportData,
  } = useMyApproval();

  const [sortedInfo, setSortedInfo] = useState({});
  const [loadingMore, setLoadingMore] = useState(false);

  // -------------------- Fetch --------------------

  /**
   * @param {object} requestData - API request payload
   * @param {boolean} replace - if true, replace the table rows; else append (lazy load)
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

      const mapped = mapListData(res);
      if (!Array.isArray(mapped)) return;

      setAdminUserActivityReportData((prev) => ({
        records: replace ? mapped : [...(prev?.records || []), ...mapped],
        totalRecordsDataBase: res?.totalRecords || 0,
        totalRecordsTable: replace
          ? mapped.length
          : (prev?.totalRecordsTable || 0) + mapped.length,
      }));
      setUserActivityReportAdmin((prev) => {
        const next = {
          ...prev,
          pageNumber: replace ? 2 : (prev.pageNumber || 1) + 1,
        };
        if (prev.filterTrigger) next.filterTrigger = false;
        return next;
      });
    },
    [callApi, navigate, showLoader, showNotification]
  );

  // -------------------- Effects --------------------

  // Initial fetch - system-wide default list, Login Date descending.
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    const requestData = buildApiRequest(userActivityReportAdmin);
    fetchApiCall(requestData, true, true);
  }, []);

  // Leave no criteria/data behind for the next visit to this screen.
  useEffect(() => {
    return () => {
      resetUserActivityReportSearch();
      resetAdminUserActivityReportData();
    };
  }, []);

  // Re-runs whenever the header search bar (or a filter tag below) applies
  // new criteria.
  useEffect(() => {
    if (userActivityReportAdmin?.filterTrigger) {
      const requestData = buildApiRequest(userActivityReportAdmin);
      fetchApiCall(requestData, true, true);
    }
  }, [userActivityReportAdmin?.filterTrigger]);

  // Infinite scroll (lazy loading)
  useTableScrollBottom(
    async () => {
      if (
        adminUserActivityReportData?.totalRecordsDataBase <=
        adminUserActivityReportData?.totalRecordsTable
      )
        return;

      try {
        setLoadingMore(true);
        const requestData = buildApiRequest(userActivityReportAdmin);
        await fetchApiCall(requestData, false, false);
      } catch (err) {
        console.error("Error loading more:", err);
      } finally {
        setLoadingMore(false);
      }
    },
    0,
    "border-less-table-blue"
  );

  /** 🔹 Handle removing individual filter */
  const handleRemoveFilter = (key) => {
    const resetMap = {
      employeeName: { employeeName: "" },
      ipAddress: { ipAddress: "" },
      loginDate: { startDate: null, endDate: null },
    };

    setUserActivityReportAdmin((prev) => ({
      ...prev,
      ...resetMap[key],
      pageNumber: 0,
      filterTrigger: true,
    }));
  };

  /** 🔹 Handle removing all filters */
  const handleRemoveAllFilters = () => {
    setUserActivityReportAdmin((prev) => ({
      ...prev,
      employeeName: "",
      ipAddress: "",
      startDate: null,
      endDate: null,
      pageNumber: 0,
      filterTrigger: true,
    }));
  };

  /** 🔹 Build Active Filters */
  const activeFilters = (() => {
    const { employeeName, ipAddress, startDate, endDate } =
      userActivityReportAdmin || {};

    const truncate = (val) =>
      String(val).length > 13 ? `${String(val).slice(0, 13)}...` : String(val);

    const formatDate = (date) =>
      date ? new Date(date).toISOString().split("T")[0] : null;

    const from = formatDate(startDate);
    const to = formatDate(endDate);
    let loginDate = null;
    if (from && to) loginDate = `${from} to ${to}`;
    else if (from) loginDate = `From ${from}`;
    else if (to) loginDate = `Till ${to}`;

    return [
      employeeName && { key: "employeeName", value: truncate(employeeName) },
      // context seeds ipAddress as 0 rather than "" - treat that as empty
      ipAddress && ipAddress !== 0
        ? { key: "ipAddress", value: truncate(ipAddress) }
        : null,
      loginDate && { key: "loginDate", value: loginDate },
    ].filter(Boolean);
  })();

  // -------------------- Handlers --------------------

  const handleViewActionModal = async (session) => {
    const res = await ViewUserSessionWiseActivity({
      callApi,
      showNotification,
      showLoader,
      requestdata: { SessionID: session.sessionID },
      navigate,
    });

    if (res?.result) {
      // sessionID isn't part of ViewUserSessionWiseActivity's own response
      // shape - attached here so the modal's Download button (below) knows
      // which session to export without needing its own extra state.
      setViewActionSessionWiseModalData({
        ...res,
        sessionID: session.sessionID,
      });
      setViewActionSessionWiseModal(true);
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

  /**
   * SRS: "User can also export these records through Export option", with
   * Employee ID / Name / IP / Login Date / Login Time / Logout Time /
   * Session Duration / Actions Count as headers and Action Time / Action
   * Description as details.
   *
   * Wired to ExportUserSessionWiseActivity per
   * API_Changes/2026-08-27_user_activity_report_exports.md - same filters
   * currently applied to the on-screen list, no pagination (a full matching
   * set in one file).
   */
  const handleExportClick = () => {
    ExportUserSessionWiseActivityRequest({
      callApi,
      showNotification,
      showLoader,
      requestdata: buildExportRequest(userActivityReportAdmin),
      navigate,
    });
  };

  const columns = getSessionListColumns({
    sortedInfo,
    onViewActions: handleViewActionModal,
  });

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
                    onClick={() => navigate("/PAD/admin-reports")}
                    className={style.breadcrumbLink}
                  >
                    Reports
                  </span>
                ),
              },
              {
                title: (
                  <span className={style.breadcrumbText}>
                    User Activity Report
                  </span>
                ),
              },
            ]}
          />
        </Col>
        <Col>
          <div className={style.headerActionsRow}>
            <CustomButton
              text={
                <span className={style.exportButtonText}>
                  Export
                  <span className={style.iconContainer}>
                    <DownOutlined />
                  </span>
                </span>
              }
              className="small-light-button-report"
              onClick={handleExportClick}
            />
          </div>
        </Col>
      </Row>

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

      <PageLayout
        background="white"
        style={{ marginTop: "3px" }}
        className={
          activeFilters.length > 0 ? "changeHeightreports" : "repotsHeight"
        }
      >
        <div className="px-4 md:px-6 lg:px-8 ">
          <BorderlessTable
            rows={adminUserActivityReportData?.records}
            columns={columns}
            classNameTable="border-less-table-blue"
            scroll={
              adminUserActivityReportData?.records?.length
                ? { x: "max-content", y: activeFilters.length > 0 ? 450 : 500 }
                : undefined
            }
            onChange={(pagination, filters, sorter) => setSortedInfo(sorter)}
            loading={loadingMore}
            ref={tableScrollRef}
          />
        </div>
      </PageLayout>

      {viewActionSessionWiseModal && <ViewActionSessionWiseModal />}
    </>
  );
};

export default UserActivityReport;
