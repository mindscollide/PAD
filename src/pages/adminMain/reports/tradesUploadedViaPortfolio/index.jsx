import React, { useEffect, useState, useRef, useCallback } from "react";
import { Breadcrumb, Col, Row } from "antd";
import { UpOutlined, DownOutlined } from "@ant-design/icons";
import Excel from "../../../../assets/img/xls.png";

// 🔹 Components
import BorderlessTable from "../../../../components/tables/borderlessTable/borderlessTable";
import PageLayout from "../../../../components/pageContainer/pageContainer";

// 🔹 Table Config
import { buildApiRequest, getBorderlessTableColumns, mapListData } from "./utils";
import { approvalStatusMap } from "../../../../components/tables/borderlessTable/utill";

// 🔹 Styles
import style from "./TradesUploadedViaPortfolio.module.css";
import { useMyApproval } from "../../../../context/myApprovalContaxt";
import { GetAdminTradesUploadedViaPortfolioAPI } from "../../../../api/myApprovalApi";
import { useNotification } from "../../../../components/NotificationProvider/NotificationProvider";
import { useApi } from "../../../../context/ApiContext";
import { useGlobalLoader } from "../../../../context/LoaderContext";
import { useNavigate } from "react-router-dom";
import { useSearchBarContext } from "../../../../context/SearchBarContaxt";
import { useTableScrollBottom } from "../../../../common/funtions/scroll";
import CustomButton from "../../../../components/buttons/button";

/**
 * Admin Trades Uploaded via Portfolio report - list only, per
 * API_Changes/2026-08-11_admin_reports_all_apis.md (item 8).
 */
const AdminTradesUploadedViaPortfolio = () => {
  const navigate = useNavigate();
  const hasFetched = useRef(false);
  const tableScrollRef = useRef(null);

  // -------------------- Contexts --------------------
  const { callApi } = useApi();
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();
  const {
    adminTradesUploadedViaPortfolioReportData,
    setAdminTradesUploadedViaPortfolioReportData,
    resetAdminTradesUploadedViaPortfolioReportData,
  } = useMyApproval();

  const {
    adminTradesUploadedviaPortfolioReportSearch,
    setAdminTradesUploadedviaPortfolioReportSearch,
    resetAdminTradesUploadedviaPortfolioReportSearch,
  } = useSearchBarContext();

  // -------------------- Local State --------------------
  const [sortedInfo, setSortedInfo] = useState({});
  const [loadingMore, setLoadingMore] = useState(false);
  const [open, setOpen] = useState(false);

  // -------------------- Helpers --------------------

  /**
   * Fetches the Trades Uploaded via Portfolio list from
   * GetAdminTradesUploadedViaPortfolioAPI.
   * @param {object} requestData - API request payload
   * @param {boolean} replace - if true, replace the table rows; else append (lazy load)
   */
  const fetchApiCall = useCallback(
    async (requestData, replace = false, showLoaderFlag = true) => {
      if (!requestData || typeof requestData !== "object") return;
      if (showLoaderFlag) showLoader(true);

      const res = await GetAdminTradesUploadedViaPortfolioAPI({
        callApi,
        showNotification,
        showLoader,
        requestdata: requestData,
        navigate,
      });

      const mapped = mapListData(res);
      if (!Array.isArray(mapped)) return;

      setAdminTradesUploadedViaPortfolioReportData((prev) => ({
        records: replace ? mapped : [...(prev?.records || []), ...mapped],
        totalRecordsDataBase: res?.totalRecords || 0,
        totalRecordsTable: replace
          ? mapped.length
          : (prev?.totalRecordsTable || 0) + mapped.length,
      }));
      setAdminTradesUploadedviaPortfolioReportSearch((prev) => {
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
    const requestData = buildApiRequest(adminTradesUploadedviaPortfolioReportSearch);
    fetchApiCall(requestData, true, true);
  }, []);

  // Reset on Unmount
  useEffect(() => {
    return () => {
      resetAdminTradesUploadedviaPortfolioReportSearch();
      resetAdminTradesUploadedViaPortfolioReportData();
    };
  }, []);

  // 🔹 call api on search
  useEffect(() => {
    if (adminTradesUploadedviaPortfolioReportSearch?.filterTrigger) {
      const requestData = buildApiRequest(adminTradesUploadedviaPortfolioReportSearch);
      fetchApiCall(requestData, true, true);
    }
  }, [adminTradesUploadedviaPortfolioReportSearch?.filterTrigger]);

  // 🔹 Infinite Scroll (lazy loading)
  useTableScrollBottom(
    async () => {
      if (
        adminTradesUploadedViaPortfolioReportData?.totalRecordsDataBase <=
        adminTradesUploadedViaPortfolioReportData?.totalRecordsTable
      )
        return;

      try {
        setLoadingMore(true);
        const requestData = buildApiRequest(adminTradesUploadedviaPortfolioReportSearch);
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

  // -------------------- Table Columns --------------------
  const columns = getBorderlessTableColumns({
    approvalStatusMap,
    sortedInfo,
    adminTradesUploadedviaPortfolioReportSearch,
    setAdminTradesUploadedviaPortfolioReportSearch,
  });

  /** 🔹 Handle removing individual filter */
  const handleRemoveFilter = (key) => {
    const resetMap = {
      instrumentName: { instrumentName: "" },
      employeeName: { employeeName: "" },
      quantity: { quantity: 0 },
      dateRange: { startDate: null, endDate: null },
    };

    setAdminTradesUploadedviaPortfolioReportSearch((prev) => ({
      ...prev,
      ...resetMap[key],
      pageNumber: 0,
      filterTrigger: true,
    }));
  };

  /** 🔹 Handle removing all filters */
  const handleRemoveAllFilters = () => {
    setAdminTradesUploadedviaPortfolioReportSearch((prev) => ({
      ...prev,
      instrumentName: "",
      employeeName: "",
      quantity: 0,
      startDate: null,
      endDate: null,
      pageNumber: 0,
      filterTrigger: true,
    }));
  };

  /** 🔹 Build Active Filters */
  const activeFilters = (() => {
    const { instrumentName, employeeName, quantity, startDate, endDate } =
      adminTradesUploadedviaPortfolioReportSearch || {};

    return [
      instrumentName && {
        key: "instrumentName",
        label: "Instrument",
        value:
          instrumentName.length > 13 ? instrumentName.slice(0, 13) + "..." : instrumentName,
      },
      employeeName && {
        key: "employeeName",
        label: "Employee",
        value: employeeName.length > 13 ? employeeName.slice(0, 13) + "..." : employeeName,
      },
      quantity > 0 && {
        key: "quantity",
        label: "Quantity",
        value: Number(quantity).toLocaleString("en-US"),
      },
      startDate &&
        endDate && {
          key: "dateRange",
          label: "Date",
          value: `${startDate} → ${endDate}`,
        },
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
                    Trades Uploaded via Portfolio
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
                    {open ? <UpOutlined /> : <DownOutlined />}
                  </span>
                </span>
              }
              className="small-light-button-report"
              onClick={() => setOpen((prev) => !prev)}
            />
          </div>

          {/* 🔷 Export Dropdown - out of scope per doc, disabled until built */}
          {open && (
            <div className={style.dropdownExport}>
              <div className={style.dropdownItem} style={{ opacity: 0.5, cursor: "not-allowed" }}>
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
            rows={adminTradesUploadedViaPortfolioReportData?.records}
            columns={columns}
            classNameTable="border-less-table-blue"
            scroll={
              adminTradesUploadedViaPortfolioReportData?.records?.length
                ? { x: "max-content", y: activeFilters.length > 0 ? 450 : 500 }
                : undefined
            }
            onChange={(pagination, filters, sorter) => setSortedInfo(sorter)}
            loading={loadingMore}
            ref={tableScrollRef}
          />
        </div>
      </PageLayout>
    </>
  );
};

export default AdminTradesUploadedViaPortfolio;
