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
import { useTableScrollBottom } from "../../../../common/funtions/scroll";
import CustomButton from "../../../../components/buttons/button";
import { DateRangePicker } from "../../../../components";
// import ViewComment from "../../../employes/myApprovals/modal/viewComment/ViewComment";
import ViewCommentTransaction from "./viewDetails/viewComment/ViewComment";
import { useGlobalModal } from "../../../../context/GlobalModalContext";
// import ViewComment from "./viewComment/ViewComment";

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

  const { isViewComments, setIsViewComments, setCheckTradeApprovalID } =
    useGlobalModal();

  const {
    coTransactionsSummarysReportsSearch,
    setCOTransactionsSummarysReportsSearch,
    resetCOTransactionsSummarysReportsSearch,

    coTransactionsSummarysReportsViewDetailsSearch,
    setCOTransactionsSummarysReportsViewDetailSearch,
    resetCOTransactionsSummarysReportsViewDetailsSearch,
  } = useSearchBarContext();

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

      setCOTransactionsSummarysReportsViewDetailSearch((prev) => ({
        ...prev,
        pageNumber: replace ? 2 : (prev.pageNumber || 1) + 1,
      }));
      setCOTransactionSummaryReportViewDetailsFlag(true);
    },
    [callApi, navigate, showLoader, showNotification]
  );

  // -------------------- Effects --------------------

  // 🔹 Initial Fetch
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    const requestData = buildApiRequest(coTransactionsSummarysReportsSearch);
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
        coTransactionsSummarysReportsViewDetailsSearch
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
            coTransactionsSummarysReportsViewDetailsSearch
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
      PageNumber: 1,
      Length: 10,
      // FIXED (API_Changes/2026-08-28_admin_transaction_summary_view_
      // details_fix.md "Update"): QuantitySearch is a nullable number
      // (`long?`) server-side now - "" fails strict System.Text.Json
      // deserialization just like a numeric value used to, and this is
      // the very first request fired when opening View Details.
      QuantitySearch: null,
      InstrumentNameSearch: "",
      RequesterNameSearch: "",
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
    setIsViewComments,
    setSelectedWorkFlowViewDetaild,
  });

  const handleDateChange = (dates) => {
    if (!dates || dates.length !== 2) return;

    const start = dates[0];
    const end = dates[1];

    setCOTransactionsSummarysReportsSearch((prev) => ({
      ...prev,
      startDate: start,
      endDate: end,
      pageNumber: 0,
      filterTrigger: true,
    }));

    // Clears the picker's own input back to its placeholder once the
    // range is applied - the selected range is still visible as the
    // "dateRange" active-filter tag below (reads straight off
    // coTransactionsSummarysReportsSearch, set above), and still drives
    // the API request the same way. Same convention as Date-wise
    // Transaction Report's own date picker.
    setDateRange({ StartDate: null, EndDate: null });
  };

  const handleClearDates = () => {
    setDateRange({
      StartDate: null,
      EndDate: null,
    });

    setCOTransactionsSummarysReportsSearch((prev) => ({
      ...prev,
      startDate: null,
      endDate: null,
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
          coTransactionsSummarysReportsViewDetailsSearch
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

  /** 🔹 Handle removing individual filter
   * FIXED: this always reset coTransactionsSummarysReportsViewDetailSearch
   * (the View Details drill-down's own filters), even while on the main
   * summary list - which has no filters of its own besides the date range
   * picker (a completely different search-state object,
   * coTransactionsSummarysReportsSearch), so the tag never actually
   * appeared for it in the first place. Branch on which screen is active,
   * same as activeFilters below. */
  const handleRemoveFilter = (key) => {
    if (key === "dateRange") {
      handleClearDates();
      return;
    }

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
    if (coTransactionSummaryReportViewDetailsFlag) {
      setCOTransactionsSummarysReportsViewDetailSearch((prev) => ({
        ...prev,
        instrumentNameSearch: "",
        requesterNameSearch: "",
        quantitySearch: "",
        pageNumber: 0,
        filterTrigger: true,
      }));
    } else {
      handleClearDates();
    }
  };

  /** 🔹 Build Active Filters for display
   * FIXED: was always read off coTransactionsSummarysReportsViewDetailsSearch
   * regardless of which screen was showing - so the main list's date range
   * filter (the only filter it has) never produced a tag at all, since
   * that search state doesn't even hold startDate/endDate. Now mirrors
   * Date-wise Transaction Report's own "requestDate" tag convention for
   * the list screen, and keeps the existing instrument/employee/quantity
   * tags for the View Details drill-down screen.
   */
  const activeFilters = (() => {
    if (coTransactionSummaryReportViewDetailsFlag) {
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
    }

    const { startDate, endDate } = coTransactionsSummarysReportsSearch || {};
    return startDate && endDate
      ? [{ key: "dateRange", value: `${startDate} → ${endDate}` }]
      : [];
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
            {!coTransactionSummaryReportViewDetailsFlag && (
              <DateRangePicker
                size="medium"
                className={style.dateRangePickerClass}
                value={[dateRange.StartDate, dateRange.EndDate]}
                onChange={handleDateChange}
                onClear={handleClearDates}
              />
            )}
            {coTransactionSummaryReportViewDetailsFlag && (
              <p className={style.transactionDateLabel}>
                Transaction Date:{" "}
                <span className={style.transactionDateValue}>
                  {formatDateOnly(
                    coTransactionsSummarysReportsViewDetailsSearch?.transactionDate
                  )}
                </span>
              </p>
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
                    x: "max-content",
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
