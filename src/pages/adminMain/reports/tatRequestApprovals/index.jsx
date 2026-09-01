import React, { useEffect, useState, useRef, useCallback } from "react";
import { Breadcrumb, Col, Row } from "antd";
import Excel from "../../../../assets/img/xls.png";
import { UpOutlined, DownOutlined } from "@ant-design/icons";
// 🔹 Components
import BorderlessTable from "../../../../components/tables/borderlessTable/borderlessTable";
import PageLayout from "../../../../components/pageContainer/pageContainer";

// 🔹 Table Config
import {
  buildApiRequest,
  buildExportRequest,
  getBorderlessTableColumns,
  mapListData,
} from "./utils";

// 🔹 Styles
import style from "./AdminTATRequestApprovals.module.css";
import { useMyApproval } from "../../../../context/myApprovalContaxt";
import {
  ExportAdminTATRequestApprovals,
  GetAdminTATRequestApprovalsAPI,
} from "../../../../api/myApprovalApi";
import { useNotification } from "../../../../components/NotificationProvider/NotificationProvider";
import { useApi } from "../../../../context/ApiContext";
import { useGlobalLoader } from "../../../../context/LoaderContext";
import { useNavigate } from "react-router-dom";
import { useSearchBarContext } from "../../../../context/SearchBarContaxt";
import { useTableScrollBottom } from "../../../../common/funtions/scroll";
import CustomButton from "../../../../components/buttons/button";
import { useGlobalModal } from "../../../../context/GlobalModalContext";
import ViewDetails from "./viewDetails";
import { DateRangePicker } from "../../../../components";

/**
 * Admin TAT Request Approvals report - per-employee summary list, per
 * API_Changes/2026-08-11_admin_reports_all_apis.md (item 7). Reuses HTA's
 * own showViewDetailPageInTatOnHta/showSelectedTatDataOnViewDetailHTA
 * global-modal flags to toggle into the View Details subpage - HTA and
 * Admin never have both TAT pages mounted at once, so sharing is safe
 * (same pattern already used for CO/Admin's Transactions Summary Report).
 */
const AdminTATRequestApprovals = () => {
  const navigate = useNavigate();
  const hasFetched = useRef(false);
  const tableScrollEmployeeTransaction = useRef(null);

  // -------------------- Contexts --------------------
  const { callApi } = useApi();
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();
  const {
    adminTATRequestApprovalsReportData,
    setAdminTATRequestApprovalsReportData,
    resetAdminTATRequestApprovalsReportData,
  } = useMyApproval();

  const {
    adminTATApprovalRequestReportSearch,
    setAdminTATApprovalRequestReportSearch,
    resetAdminTATApprovalRequestReportSearch,
  } = useSearchBarContext();

  const {
    showViewDetailPageInTatOnHta,
    setShowViewDetailPageInTatOnHta,
    setShowSelectedTatDataOnViewDetailHTA,
  } = useGlobalModal();

  // -------------------- Local State --------------------
  const [sortedInfo, setSortedInfo] = useState({});
  const [loadingMore, setLoadingMore] = useState(false);
  const [open, setOpen] = useState(false);
  // ADDED: date range filter, same interaction pattern as the sibling
  // Date-wise Transaction Report / HTA's own TAT report - no default
  // range (the backend already defaults to the last 6 months per the
  // doc when omitted), goes through the existing filterTrigger effect.
  const [dateRange, setDateRange] = useState({
    StartDate: null,
    EndDate: null,
  });

  // -------------------- Helpers --------------------

  /**
   * Fetches the TAT Request Approvals list from GetAdminTATRequestApprovalsAPI.
   * @param {object} requestData - API request payload
   * @param {boolean} replace - if true, replace the table rows; else append (lazy load)
   */
  const fetchApiCall = useCallback(
    async (requestData, replace = false, showLoaderFlag = true) => {
      if (!requestData || typeof requestData !== "object") return;
      if (showLoaderFlag) showLoader(true);

      const res = await GetAdminTATRequestApprovalsAPI({
        callApi,
        showNotification,
        showLoader,
        requestdata: requestData,
        navigate,
      });

      const mapped = mapListData(res);
      if (!Array.isArray(mapped)) return;

      setAdminTATRequestApprovalsReportData((prev) => ({
        records: replace ? mapped : [...(prev?.records || []), ...mapped],
        totalRecordsDataBase: res?.totalRecords || 0,
        totalRecordsTable: replace
          ? mapped.length
          : (prev?.totalRecordsTable || 0) + mapped.length,
      }));
      setAdminTATApprovalRequestReportSearch((prev) => {
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

  // 🔹 Initial Fetch
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    const requestData = buildApiRequest(adminTATApprovalRequestReportSearch);
    fetchApiCall(requestData, true, true);
  }, []);

  // Reset on Unmount
  useEffect(() => {
    return () => {
      resetAdminTATApprovalRequestReportSearch();
      resetAdminTATRequestApprovalsReportData();
      setShowViewDetailPageInTatOnHta(false);
    };
  }, []);

  // 🔹 call api on search
  useEffect(() => {
    if (adminTATApprovalRequestReportSearch?.filterTrigger) {
      const requestData = buildApiRequest(adminTATApprovalRequestReportSearch);
      fetchApiCall(requestData, true, true);
    }
  }, [adminTATApprovalRequestReportSearch?.filterTrigger]);

  // 🔹 Infinite Scroll (lazy loading)
  useTableScrollBottom(
    async () => {
      if (
        adminTATRequestApprovalsReportData?.totalRecordsDataBase <=
        adminTATRequestApprovalsReportData?.totalRecordsTable
      )
        return;

      try {
        setLoadingMore(true);
        const requestData = buildApiRequest(adminTATApprovalRequestReportSearch);
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

  const handleViewDetails = (record) => {
    // Snapshot the list's currently-applied date range onto the record so
    // View Details can show it as text - same convention HTA's own TAT
    // View Details page uses (filterStartDate/filterEndDate). Reads off
    // adminTATApprovalRequestReportSearch (the actually-applied filter),
    // not the local dateRange picker state - that one self-clears right
    // after each apply, so it's always empty by the time this fires.
    setShowSelectedTatDataOnViewDetailHTA({
      ...record,
      filterStartDate: adminTATApprovalRequestReportSearch?.startDate,
      filterEndDate: adminTATApprovalRequestReportSearch?.endDate,
    });
    setShowViewDetailPageInTatOnHta(true);
  };

  // -------------------- Table Columns --------------------
  const columns = getBorderlessTableColumns({
    sortedInfo,
    onViewDetails: handleViewDetails,
  });

  /** 🔹 Handle removing individual filter */
  const handleRemoveFilter = (key) => {
    const resetMap = {
      employeeName: { employeeName: "" },
      departmentName: { departmentName: "" },
      dateRange: { startDate: null, endDate: null },
    };

    if (key === "dateRange") setDateRange({ StartDate: null, EndDate: null });

    setAdminTATApprovalRequestReportSearch((prev) => ({
      ...prev,
      ...resetMap[key],
      pageNumber: 0,
      filterTrigger: true,
    }));
  };

  /** 🔹 Handle removing all filters */
  const handleRemoveAllFilters = () => {
    setDateRange({ StartDate: null, EndDate: null });
    setAdminTATApprovalRequestReportSearch((prev) => ({
      ...prev,
      employeeName: "",
      departmentName: "",
      startDate: null,
      endDate: null,
      pageNumber: 0,
      filterTrigger: true,
    }));
  };

  /** 🔹 Build Active Filters */
  const activeFilters = (() => {
    const { employeeName, departmentName, startDate, endDate } =
      adminTATApprovalRequestReportSearch || {};

    return [
      employeeName && {
        key: "employeeName",
        label: "Employee",
        value: employeeName.length > 13 ? employeeName.slice(0, 13) + "..." : employeeName,
      },
      departmentName && {
        key: "departmentName",
        label: "Department",
        value:
          departmentName.length > 13 ? departmentName.slice(0, 13) + "..." : departmentName,
      },
      startDate &&
        endDate && {
          key: "dateRange",
          label: "Date",
          value: `${startDate} → ${endDate}`,
        },
    ].filter(Boolean);
  })();

  // Date range flows through the same filter state + filterTrigger effect
  // as employeeName/departmentName, into GetAdminTATRequestApprovalsAPI
  // via buildApiRequest, which already reads searchState.startDate/
  // endDate - mirrors Date-wise Transaction Report's own handleDateChange/
  // handleClearDates exactly (same shape, same comments).
  const handleDateChange = (dates) => {
    if (dates && dates.length === 2) {
      setAdminTATApprovalRequestReportSearch((prev) => ({
        ...prev,
        startDate: dates[0],
        endDate: dates[1],
        pageNumber: 0,
        filterTrigger: true,
      }));

      // Clears the picker's own input back to its placeholder once the
      // range is applied - the selected range is still visible as the
      // "dateRange" active-filter tag below (reads straight off
      // adminTATApprovalRequestReportSearch, set above), and still drives
      // the API request the same way.
      setDateRange({ StartDate: null, EndDate: null });
    }
  };

  const handleClearDates = () => {
    setDateRange({
      StartDate: null,
      EndDate: null,
    });

    setAdminTATApprovalRequestReportSearch((prev) => ({
      ...prev,
      startDate: null,
      endDate: null,
      pageNumber: 0,
      filterTrigger: true,
    }));
  };

  // 🔷 Excel Report download Api Hit
  // ADDED (API_Changes/2026-08-28_admin_tat_request_approvals_export.md):
  // was disabled with an explanatory note that no endpoint existed yet -
  // wired to the real one now.
  const downloadAdminTATRequestApprovalsInExcelFormat = async () => {
    await ExportAdminTATRequestApprovals({
      callApi,
      showLoader,
      requestdata: buildExportRequest(adminTATApprovalRequestReportSearch),
      navigate,
      setOpen,
    });
  };

  // -------------------- Render --------------------
  if (showViewDetailPageInTatOnHta) {
    return <ViewDetails />;
  }

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
                    TAT Request Approvals
                  </span>
                ),
              },
            ]}
          />
        </Col>

        <Col>
          <div className={style.headerActionsRow}>
            <DateRangePicker
              size="medium"
              className={style.dateRangePickerClass}
              value={[dateRange.StartDate, dateRange.EndDate]}
              onChange={handleDateChange}
              onClear={handleClearDates}
            />
            <CustomButton
              text={
                <span className={style.exportButtonText}>
                  Export
                  <span className={style.iconContainer}>
                    {open ? <UpOutlined /> : <DownOutlined />}
                  </span>
                </span>
              }
              className="small-light-button-report"
              onClick={() => setOpen((prev) => !prev)}
            />
          </div>

          {/* 🔷 Export Dropdown */}
          {open && (
            <div className={style.dropdownExport}>
              <div
                className={style.dropdownItem}
                onClick={downloadAdminTATRequestApprovalsInExcelFormat}
              >
                <img src={Excel} alt="Excel" draggable={false} />
                <span>Export Excel</span>
              </div>
            </div>
          )}
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

      {/* 🔹 Table */}
      <PageLayout
        background="white"
        style={{ marginTop: "3px" }}
        className={activeFilters.length > 0 ? "changeHeightreports" : "repotsHeight"}
      >
        <div className="px-4 md:px-6 lg:px-8 ">
          <BorderlessTable
            rows={adminTATRequestApprovalsReportData?.records}
            columns={columns}
            classNameTable="border-less-table-blue"
            scroll={
              adminTATRequestApprovalsReportData?.records?.length
                ? { x: "max-content", y: activeFilters.length > 0 ? 450 : 500 }
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

export default AdminTATRequestApprovals;
