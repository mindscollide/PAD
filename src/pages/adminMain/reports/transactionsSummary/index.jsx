import React, { useEffect, useState, useRef, useCallback } from "react";
import { Breadcrumb, Col, Row } from "antd";
import PDF from "../../../../assets/img/pdf.png";
import Excel from "../../../../assets/img/xls.png";
import { UpOutlined, DownOutlined } from "@ant-design/icons";
// 🔹 Components
import BorderlessTable from "../../../../components/tables/borderlessTable/borderlessTable";
import PageLayout from "../../../../components/pageContainer/pageContainer";

// 🔹 Table Config
import {
  buildApiRequest,
  buildApiRequestViewDetails,
  buildExportRequest,
  buildExportRequestViewDetails,
  formatDateOnly,
  getBorderlessTableColumns,
  getBorderlessTableColumnsViewDetails,
  mappingDateWiseTransactionReport,
  mappingDateWiseTransactionviewDetailst,
} from "./utils";
import { approvalStatusMap } from "../../../../components/tables/borderlessTable/utill";

// 🔹 Contexts

// 🔹 Styles
import style from "./transactionsSummary.module.css";
import { useMyApproval } from "../../../../context/myApprovalContaxt";
import {
  ExportAdminTransactionSummaryReport,
  ExportAdminTransactionSummaryViewDetails,
  GetAdminTransactionSummaryReportAPI,
  GetAdminTransactionSummaryViewDetailsAPI,
} from "../../../../api/myApprovalApi";
import { useNotification } from "../../../../components/NotificationProvider/NotificationProvider";
import { useApi } from "../../../../context/ApiContext";
import { useGlobalLoader } from "../../../../context/LoaderContext";
import { useNavigate } from "react-router-dom";
import { useSearchBarContext } from "../../../../context/SearchBarContaxt";
import { useDashboardContext } from "../../../../context/dashboardContaxt";
import { useTableScrollBottom } from "../../../../common/funtions/scroll";
import CustomButton from "../../../../components/buttons/button";
import { DateRangePicker } from "../../../../components";
// import ViewComment from "../../../employes/myApprovals/modal/viewComment/ViewComment";
import ViewCommentTransaction from "./viewDetails/viewComment/ViewComment";
import { useGlobalModal } from "../../../../context/GlobalModalContext";
// import ViewComment from "./viewComment/ViewComment";
// ADDED: needed to seed the display-only date-range picker value on
// initial load and to keep it showing the selected range after a change.
import { formatToYYYYMMDD } from "../../../../common/funtions/rejex";

const AdminTransactionsSummarysReports = () => {
  const navigate = useNavigate();
  const hasFetched = useRef(false);
  const tableScrollTransactionSummaryReportList = useRef(null);
  const tableScrollTransactionSummaryViewDetailsList = useRef(null);
  // -------------------- Contexts --------------------
  const { callApi } = useApi();
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();
  const {
    adminTransactionSummaryReportData,
    setAdminTransactionSummaryReportData,
    resetAdminTransactionSummaryReportData,

    coTransactionSummaryReportViewDetailsFlag,
    setCOTransactionSummaryReportViewDetailsFlag,
    adminTransactionSummaryViewDetailsData,
    setAdminTransactionSummaryViewDetailsData,
    resetAdminTransactionSummaryViewDetailsData,
    setSelectedWorkFlowViewDetaild,
  } = useMyApproval();

  const { isViewComments, setIsViewComments } = useGlobalModal();

  const {
    coTransactionsSummarysReportsSearch,
    setCOTransactionsSummarysReportsSearch,
    resetCOTransactionsSummarysReportsSearch,

    coTransactionsSummarysReportsViewDetailsSearch,
    setCOTransactionsSummarysReportsViewDetailSearch,
    resetCOTransactionsSummarysReportsViewDetailsSearch,
  } = useSearchBarContext();

  const { assetTypeListingData } = useDashboardContext();

  // -------------------- Local State --------------------
  const [sortedInfo, setSortedInfo] = useState({});
  const [sortedInfoView, setSortedInfoView] = useState({});
  const [loadingMore, setLoadingMore] = useState(false);
  const [open, setOpen] = useState(false);
  const [dateRange, setDateRange] = useState({
    StartDate: null,
    EndDate: null,
  });

  // -------------------- Helpers --------------------

  /**
   * Fetches transactions from API.
   * @param {boolean} flag - whether to show loader
   */
  const fetchApiCall = useCallback(
    async (requestData, replace = false, showLoaderFlag = true) => {
      if (!requestData || typeof requestData !== "object") return;
      if (showLoaderFlag) showLoader(true);
      const res = await GetAdminTransactionSummaryReportAPI({
        callApi,
        showNotification,
        showLoader,
        requestdata: requestData,
        navigate,
      });

      const mapped = mappingDateWiseTransactionReport(res);
      if (!Array.isArray(mapped)) return;

      setAdminTransactionSummaryReportData((prev) => ({
        transactions: replace
          ? mapped
          : [...(prev?.transactions || []), ...mapped],
        totalRecordsDataBase: res?.totalRecords || 0,
        totalRecordsTable: replace
          ? mapped.length
          : (prev?.totalRecordsTable || 0) + mapped.length,
      }));

      setCOTransactionsSummarysReportsSearch((prev) => {
        const next = {
          ...prev,
          pageNumber: replace ? 2 : (prev.pageNumber || 1) + 1,
        };

        // this is for check if filter value get true only on that it will false
        if (prev.filterTrigger) {
          next.filterTrigger = false;
        }

        return next;
      });
    },
    [callApi, navigate, showLoader, showNotification]
  );

  const fetchApiCallViewDetails = useCallback(
    async (requestData, replace = false, showLoaderFlag = true) => {
      if (!requestData || typeof requestData !== "object") return;
      if (showLoaderFlag) showLoader(true);
      const res = await GetAdminTransactionSummaryViewDetailsAPI({
        callApi,
        showNotification,
        showLoader,
        requestdata: requestData,
        navigate,
      });

      const mapped = mappingDateWiseTransactionviewDetailst(res);
      if (!Array.isArray(mapped)) return;

      setAdminTransactionSummaryViewDetailsData((prev) => ({
        record: replace ? mapped : [...(prev?.record || []), ...mapped],
        totalRecordsDataBase: res?.totalRecords || 0,
        totalRecordsTable: replace
          ? mapped.length
          : (prev?.totalRecordsTable || 0) + mapped.length,
      }));

      // PageNumber is a row offset: rows loaded so far.
      setCOTransactionsSummarysReportsViewDetailSearch((prev) => ({
        ...prev,
        pageNumber: replace
          ? mapped.length
          : (prev.pageNumber || 0) + mapped.length,
      }));
      setCOTransactionSummaryReportViewDetailsFlag(true);
    },
    [callApi, navigate, showLoader, showNotification]
  );

  // -------------------- Effects --------------------

  // 🔹 Initial Fetch
  // Seeds a default 6-month date range (today - 6mo → today) on first
  // load, same pattern as CO's Date-wise Transaction Report - the
  // picker's own display value comes from dateRange, and the actual
  // request comes from startDate/endDate pushed into the search state
  // before buildApiRequest reads them.
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6);

    setDateRange({
      StartDate: formatToYYYYMMDD(startDate),
      EndDate: formatToYYYYMMDD(endDate),
    });

    const updatedState = {
      ...coTransactionsSummarysReportsSearch,
      startDate,
      endDate,
    };

    setCOTransactionsSummarysReportsSearch(updatedState);

    const requestData = buildApiRequest(updatedState);
    fetchApiCall(requestData, true, true);
  }, []);

  //   // Reset on Unmount
  useEffect(() => {
    return () => {
      // Reset search state for fresh load
      resetCOTransactionsSummarysReportsSearch();
      resetAdminTransactionSummaryReportData();
      setCOTransactionSummaryReportViewDetailsFlag(false);
      resetAdminTransactionSummaryViewDetailsData();
      resetCOTransactionsSummarysReportsViewDetailsSearch();
    };
  }, []);

  // 🔹 call api on search
  useEffect(() => {
    if (coTransactionsSummarysReportsSearch?.filterTrigger) {
      const requestData = buildApiRequest(coTransactionsSummarysReportsSearch);
      fetchApiCall(requestData, true, true);
    }
  }, [coTransactionsSummarysReportsSearch?.filterTrigger]);

  useEffect(() => {
    if (coTransactionsSummarysReportsViewDetailsSearch?.filterTrigger) {
      setCOTransactionsSummarysReportsViewDetailSearch((prev) => ({
        ...prev,
        filterTrigger: false,
      }));
      const requestData = buildApiRequestViewDetails(
        coTransactionsSummarysReportsViewDetailsSearch,
        assetTypeListingData
      );
      fetchApiCallViewDetails(requestData, true, true);
    }
  }, [coTransactionsSummarysReportsViewDetailsSearch?.filterTrigger]);

  // 🔹 Infinite Scroll (lazy loading)
  useTableScrollBottom(
    async () => {
      // -------------------------------
      // CASE 1: VIEW DETAILS SCROLL
      // -------------------------------
      if (coTransactionSummaryReportViewDetailsFlag) {
        if (
          adminTransactionSummaryViewDetailsData?.totalRecordsDataBase <=
          adminTransactionSummaryViewDetailsData?.totalRecordsTable
        ) {
          return;
        }

        try {
          setLoadingMore(true);

          const requestData = buildApiRequestViewDetails(
            coTransactionsSummarysReportsViewDetailsSearch,
            assetTypeListingData
          );

          await fetchApiCallViewDetails(requestData, false, false);
        } catch (error) {
          console.error("Error loading view details:", error);
        } finally {
          setLoadingMore(false);
        }

        return; // 🔴 VERY IMPORTANT
      }

      // -------------------------------
      // CASE 2: SUMMARY LIST SCROLL
      // -------------------------------
      if (
        adminTransactionSummaryReportData?.totalRecordsDataBase <=
        adminTransactionSummaryReportData?.totalRecordsTable
      ) {
        return;
      }

      try {
        setLoadingMore(true);

        const requestData = buildApiRequest(
          coTransactionsSummarysReportsSearch
        );

        await fetchApiCall(requestData, false, false);
      } catch (error) {
        console.error("Error loading summary list:", error);
      } finally {
        setLoadingMore(false);
      }
    },
    0,
    "border-less-table-blue"
  );

  const handelViewDetails = async (transactionDate) => {
    await showLoader(true);
    const requestData = {
      TransactionDate: transactionDate.split(" ")[0],
      PageNumber: 0,
      Length: 10,
      // FIXED (API_Changes/2026-08-28_admin_transaction_summary_view_
      // details_fix.md "Update"): QuantitySearch is a nullable number
      // (`long?`) server-side now - "" fails strict System.Text.Json
      // deserialization just like a numeric value used to, and this is
      // the very first request fired when opening View Details.
      QuantitySearch: null,
      InstrumentNameSearch: "",
      RequesterNameSearch: "",
      // ADDED (API_Changes/2026-09-23_admin_type_nested_and_typeids_filter.md):
      // fresh drill-down, no Type/Status filter applied yet.
      TypeIds: [],
      StatusIds: [],
    };
    setCOTransactionsSummarysReportsViewDetailSearch((prev) => ({
      ...prev,
      transactionDate: transactionDate.split(" ")[0],
    }));
    fetchApiCallViewDetails(requestData, true, true);
  };

  // -------------------- Table Columns --------------------
  const columnsReport = getBorderlessTableColumns({
    approvalStatusMap,
    sortedInfo,
    coTransactionsSummarysReportsSearch,
    setCOTransactionsSummarysReportsSearch,
    handelViewDetails,
  });

  const columnsViewDetails = getBorderlessTableColumnsViewDetails({
    approvalStatusMap,
    sortedInfoView,
    coTransactionsSummarysReportsViewDetailsSearch,
    setCOTransactionsSummarysReportsViewDetailSearch,
    handelViewDetails,
    setIsViewComments,
    setSelectedWorkFlowViewDetaild,
  });

  // 🔹 Date range change
  // CHANGED: previously reset dateRange back to {null, null} after every
  // selection (picker fell back to its placeholder), relying solely on
  // the "dateRange" active-filter tag to show the applied range. Now
  // keeps the picker itself showing the selected range, same convention
  // as CO's Date-wise Transaction Report.
  const handleDateChange = (dates) => {
    if (!dates || dates.length !== 2) return;

    const start = dates[0];
    const end = dates[1];

    setDateRange({
      StartDate: formatToYYYYMMDD(start),
      EndDate: formatToYYYYMMDD(end),
    });

    setCOTransactionsSummarysReportsSearch((prev) => ({
      ...prev,
      startDate: start,
      endDate: end,
      pageNumber: 0,
      filterTrigger: true,
    }));
  };

  const handleClearDates = () => {
    // Clearing resets to the same default 6-month range used on first
    // load, rather than wiping the filter out entirely - matches CO's
    // Date-wise Transaction Report, where StartDate/EndDate always
    // reflect a real range rather than "no filter".
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6);

    setDateRange({
      StartDate: formatToYYYYMMDD(startDate),
      EndDate: formatToYYYYMMDD(endDate),
    });

    setCOTransactionsSummarysReportsSearch((prev) => ({
      ...prev,
      startDate,
      endDate,
      pageNumber: 0,
      filterTrigger: true,
    }));
  };

  // 🔷 Excel Report download Api Hit
  // FIXED (API_Changes/2026-08-28_admin_transaction_summary_export.md):
  // was calling DownloadComplianceOfficerDateWiseTransactionReportRequestAPI
  // - CO's own Date-wise Transaction Report export, an entirely different
  // report - with a request payload that was also always hardcoded
  // empty. Wired to the two real dedicated endpoints now, branching on
  // which screen is currently showing (list vs View Details drill-down),
  // same as the rest of this page's dual-mode logic.
  const downloadMyTradeApprovalLineManagerInExcelFormat = async () => {
    if (coTransactionSummaryReportViewDetailsFlag) {
      await ExportAdminTransactionSummaryViewDetails({
        callApi,
        showLoader,
        requestdata: buildExportRequestViewDetails(
          coTransactionsSummarysReportsViewDetailsSearch,
          assetTypeListingData
        ),
        navigate,
        setOpen,
      });
      return;
    }

    await ExportAdminTransactionSummaryReport({
      callApi,
      showLoader,
      requestdata: buildExportRequest(coTransactionsSummarysReportsSearch),
      navigate,
      setOpen,
    });
  };

  /** 🔹 Handle removing individual filter (View Details search tags) */
  const handleRemoveFilter = (key) => {
    const resetMap = {
      instrumentNameSearch: { instrumentNameSearch: "" },
      requesterNameSearch: { requesterNameSearch: "" },
      quantitySearch: { quantitySearch: "" },
    };

    setCOTransactionsSummarysReportsViewDetailSearch((prev) => ({
      ...prev,
      ...resetMap[key],
      pageNumber: 0,
      filterTrigger: true,
    }));
  };

  /** 🔹 Handle removing all filters */
  const handleRemoveAllFilters = () => {
    setCOTransactionsSummarysReportsViewDetailSearch((prev) => ({
      ...prev,
      instrumentNameSearch: "",
      requesterNameSearch: "",
      quantitySearch: "",
      pageNumber: 0,
      filterTrigger: true,
    }));
  };

  /** 🔹 Build Active Filters for display
   * Same as CO's Transactions Summary: tags only on the View Details
   * drill-down (instrument / employee / quantity). The list screen's date
   * range stays in the picker, and Type/Status show in their column
   * headers.
   */
  const activeFilters = (() => {
    if (!coTransactionSummaryReportViewDetailsFlag) return [];

    const { instrumentNameSearch, requesterNameSearch, quantitySearch } =
      coTransactionsSummarysReportsViewDetailsSearch || {};

    return [
      instrumentNameSearch && {
        key: "instrumentNameSearch",
        value:
          instrumentNameSearch.length > 13
            ? instrumentNameSearch.slice(0, 13) + "..."
            : instrumentNameSearch,
      },
      requesterNameSearch && {
        key: "requesterNameSearch",
        value:
          requesterNameSearch.length > 13
            ? requesterNameSearch.slice(0, 13) + "..."
            : requesterNameSearch,
      },
      quantitySearch &&
        Number(quantitySearch) > 0 && {
          key: "quantitySearch",
          value: Number(quantitySearch).toLocaleString("en-US"),
        },
    ].filter(Boolean);
  })();

  const tableRows = coTransactionSummaryReportViewDetailsFlag
    ? adminTransactionSummaryViewDetailsData?.record
    : adminTransactionSummaryReportData?.transactions;

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
                  <span
                    className={style.breadcrumbText}
                    style={{
                      cursor: coTransactionSummaryReportViewDetailsFlag
                        ? "pointer"
                        : "default",
                    }}
                    onClick={() => {
                      coTransactionSummaryReportViewDetailsFlag &&
                        setCOTransactionSummaryReportViewDetailsFlag(false);
                      resetAdminTransactionSummaryViewDetailsData();
                      resetCOTransactionsSummarysReportsViewDetailsSearch();
                    }}
                  >
                    Transactions Summary Report
                  </span>
                ),
              },
              ...(coTransactionSummaryReportViewDetailsFlag
                ? [
                    {
                      title: (
                        <span className={style.breadcrumbText}>
                          View Details
                        </span>
                      ),
                    },
                  ]
                : []),
            ]}
          />
        </Col>

        <Col>
          <div className={style.headerActionsRow}>
            {!coTransactionSummaryReportViewDetailsFlag ? (
              <DateRangePicker
                size="medium"
                className={style.dateRangePickerClass}
                value={[dateRange.StartDate, dateRange.EndDate]}
                onChange={handleDateChange}
                onClear={handleClearDates}
              />
            ) : (
              <div className={style.readonlyDateRange}>
                <span className={style.readonlyDateRangeLabel}>
                  Start date - End date
                </span>
                <span className={style.readonlyDateRangeValue}>
                  {dateRange.StartDate} - {dateRange.EndDate}
                </span>
              </div>
            )}

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
              {/* <div className={style.dropdownItem}>
                <img src={PDF} alt="PDF" draggable={false} />
                <span>Export PDF</span>
              </div> */}
              <div
                className={style.dropdownItem}
                onClick={downloadMyTradeApprovalLineManagerInExcelFormat}
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
          activeFilters.length > 0 ? "changeHeightlmreports" : "repotsHeightHOC"
        }
      >
        <div className="px-4 md:px-6 lg:px-8 ">
          <BorderlessTable
            rows={
              coTransactionSummaryReportViewDetailsFlag
                ? adminTransactionSummaryViewDetailsData?.record
                : adminTransactionSummaryReportData?.transactions
            }
            columns={
              coTransactionSummaryReportViewDetailsFlag
                ? columnsViewDetails
                : columnsReport
            }
            classNameTable="border-less-table-blue"
            scroll={
              tableRows && tableRows.length > 0
                ? {
                    x: 1300,
                    y: 470,
                  }
                : undefined
            }
            onChange={(pagination, filters, sorter) =>
              coTransactionSummaryReportViewDetailsFlag
                ? setSortedInfoView(sorter)
                : setSortedInfo(sorter)
            }
            loading={loadingMore}
            ref={
              coTransactionSummaryReportViewDetailsFlag
                ? tableScrollTransactionSummaryViewDetailsList
                : tableScrollTransactionSummaryReportList
            }
          />
        </div>
      </PageLayout>

      {isViewComments && <ViewCommentTransaction />}
    </>
  );
};

export default AdminTransactionsSummarysReports;
