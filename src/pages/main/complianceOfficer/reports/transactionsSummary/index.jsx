import React, { useEffect, useState, useRef, useCallback } from "react";
import { Breadcrumb, Col, Row } from "antd";
import PDF from "../../../../../assets/img/pdf.png";
import Excel from "../../../../../assets/img/xls.png";
import { UpOutlined, DownOutlined } from "@ant-design/icons";
// 🔹 Components
import BorderlessTable from "../../../../../components/tables/borderlessTable/borderlessTable";
import PageLayout from "../../../../../components/pageContainer/pageContainer";

// 🔹 Table Config
import {
  buildApiRequest,
  buildApiRequestViewDetails,
  getBorderlessTableColumns,
  getBorderlessTableColumnsViewDetails,
  mappingDateWiseTransactionReport,
  mappingDateWiseTransactionviewDetailst,
} from "./utils";
import { approvalStatusMap } from "../../../../../components/tables/borderlessTable/utill";

// 🔹 Contexts
import { useGlobalModal } from "../../../../../context/GlobalModalContext";

// 🔹 Styles
import style from "./transactionsSummary.module.css";
import { useMyApproval } from "../../../../../context/myApprovalContaxt";
import {
  ExportComplianceOfficerTransactionSummaryReportExcel,
  ExportComplianceOfficerViewTransactionSummaryReportExcel,
  GetComplianceOfficerViewTransactionSummaryAPI,
  SearchComplianceOfficerTransactionSummaryReportRequest,
} from "../../../../../api/myApprovalApi";
import { useNotification } from "../../../../../components/NotificationProvider/NotificationProvider";
import { useApi } from "../../../../../context/ApiContext";
import { useGlobalLoader } from "../../../../../context/LoaderContext";
import { useNavigate } from "react-router-dom";
import { useSearchBarContext } from "../../../../../context/SearchBarContaxt";
import { useDashboardContext } from "../../../../../context/dashboardContaxt";
import { getSafeAssetTypeData } from "../../../../../common/funtions/assetTypesList";
import { useTableScrollBottom } from "../../../../../common/funtions/scroll";
import CustomButton from "../../../../../components/buttons/button";
import { DateRangePicker } from "../../../../../components";
import ViewCommentTransaction from "./viewDetails/viewComment/ViewComment";
import { formatToYYYYMMDD } from "../../../../../common/funtions/rejex";
// import ViewComment from "./viewComment/ViewComment";

const COTransactionsSummarysReports = () => {
  const navigate = useNavigate();
  const hasFetched = useRef(false);
  const tableScrollTransactionSummaryReportList = useRef(null);
  const tableScrollTransactionSummaryViewDetailsList = useRef(null);
  const { assetTypeListingData, setAssetTypeListingData } =
    useDashboardContext();
  // -------------------- Contexts --------------------
  const { callApi } = useApi();
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();
  const {
    coTransactionSummaryReportListData,
    setCOTransactionSummaryReportListData,
    resetCOTransactionSummaryReportListData,

    coTransactionSummaryReportViewDetailsFlag,
    setCOTransactionSummaryReportViewDetailsFlag,
    coTransactionSummaryReportViewDetailsListData,
    setCOTransactionSummaryReportViewDetailsListData,
    resetCOTransactionSummaryReportViewDetailsListData,

    // ADDED (2026-08-17): "which row's View Comments was clicked" - was
    // never wired up on the CO side at all, unlike HOC's own version of
    // this report which already uses this same state correctly.
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
      const res = await SearchComplianceOfficerTransactionSummaryReportRequest({
        callApi,
        showNotification,
        showLoader,
        requestdata: requestData,
        navigate,
      });

      const transactions = Array.isArray(res?.transactions)
        ? res.transactions
        : [];
      const mapped = mappingDateWiseTransactionReport(transactions);
      if (!mapped || typeof mapped !== "object") return;

      setCOTransactionSummaryReportListData((prev) => ({
        transactions: replace
          ? mapped
          : [...(prev?.transactions || []), ...mapped],
        // this is for to run lazy loading its data comming from database of total data in db
        totalRecordsDataBase: res?.totalRecords || 0,
        // this is for to know how mush dta currently fetch from  db
        totalRecordsTable: replace
          ? mapped.length
          : coTransactionSummaryReportListData.totalRecordsTable +
            mapped.length,
      }));

      setCOTransactionsSummarysReportsSearch((prev) => {
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
      setCOTransactionsSummarysReportsSearch,
      showLoader,
      showNotification,
    ]
  );

  const fetchApiCallViewDetails = useCallback(
    async (requestData, replace = false, showLoaderFlag = true) => {
      if (!requestData || typeof requestData !== "object") return;
      if (showLoaderFlag) showLoader(true);
      const res = await GetComplianceOfficerViewTransactionSummaryAPI({
        callApi,
        showNotification,
        showLoader,
        requestdata: requestData,
        navigate,
      });

      const record = Array.isArray(res?.record) ? res.record : [];
      const currentAssetTypeData = getSafeAssetTypeData(
        assetTypeListingData,
        setAssetTypeListingData
      );
      const mapped = mappingDateWiseTransactionviewDetailst(
        currentAssetTypeData?.Equities,
        record
      );
      if (!mapped || typeof mapped !== "object") return;

      setCOTransactionSummaryReportViewDetailsListData((prev) => ({
        record: replace ? mapped : [...(prev?.record || []), ...mapped],
        // this is for to run lazy loading its data comming from database of total data in db
        totalRecordsDataBase: res?.totalRecords || 0,
        // this is for to know how mush dta currently fetch from  db
        totalRecordsTable: replace
          ? mapped.length
          : coTransactionSummaryReportViewDetailsListData.totalRecordsTable +
            mapped.length,
      }));

      setCOTransactionsSummarysReportsViewDetailSearch((prev) => {
        const next = {
          ...prev,
          pageNumber: replace ? mapped.length : prev.pageNumber + mapped.length,
        };
        return next;
      });
      setCOTransactionSummaryReportViewDetailsFlag(true);
    },
    [
      callApi,
      navigate,
      setCOTransactionsSummarysReportsViewDetailSearch,
      showLoader,
      showNotification,
    ]
  );

  // -------------------- Effects --------------------

  // 🔹 Initial Fetch
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
    const requestData = buildApiRequest(updatedState, assetTypeListingData);
    fetchApiCall(requestData, true, true);

    return () => {
      resetCOTransactionsSummarysReportsSearch();
      resetCOTransactionSummaryReportListData();
      setCOTransactionSummaryReportViewDetailsFlag(false);
      resetCOTransactionSummaryReportViewDetailsListData();
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
          coTransactionSummaryReportViewDetailsListData?.totalRecordsDataBase <=
          coTransactionSummaryReportViewDetailsListData?.totalRecordsTable
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
        coTransactionSummaryReportListData?.totalRecordsDataBase <=
        coTransactionSummaryReportListData?.totalRecordsTable
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
    console.log("responseData", transactionDate);
    await showLoader(true);
    const requestData = {
      TransactionDate: transactionDate.split(" ")[0],
      PageNumber: 0,
      Length: 10,
      QuantitySearch: "",
      InstrumentNameSearch: "",
      RequesterNameSearch: "",
      StatusIds: [],
      TypeIds: [],
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

  const handleDateChange = (dates) => {
    if (!dates || dates.length !== 2) return;

    const start = dates[0];
    const end = dates[1];

    setDateRange({
      StartDate: start,
      EndDate: end,
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

  // 🔷 Excel Report download Api Hit — summary list (date groups)
  // Was calling the shared "Date-Wise Transactions" report export (a
  // different report entirely, used by several other pages) with a
  // payload shape that doesn't even match this endpoint — hence always
  // erroring. Confirmed shape per
  // API_Changes/2026-08-06_co_transaction_summary_exports.md: just
  // {FromDate, ToDate}, both optional.
  const downloadMyTradeApprovalLineManagerInExcelFormat = async () => {
    showLoader(true);
    const { PageNumber, Length, ...requestdata } = buildApiRequest(
      coTransactionsSummarysReportsSearch
    );

    await ExportComplianceOfficerTransactionSummaryReportExcel({
      callApi,
      showLoader,
      requestdata,
      navigate,
      setOpen,
    });
  };

  // 🔷 Excel Report download Api Hit — "View Details" drill-down for one
  // date (brand new endpoint, was previously not wired up at all — the
  // Export button always called the summary export above regardless of
  // which view was open).
  const downloadComplianceOfficerViewTransactionSummaryExcelFormat =
    async () => {
      showLoader(true);
      const { PageNumber, Length, ...requestdata } = buildApiRequestViewDetails(
        coTransactionsSummarysReportsViewDetailsSearch,
        assetTypeListingData
      );

      await ExportComplianceOfficerViewTransactionSummaryReportExcel({
        callApi,
        showLoader,
        requestdata,
        navigate,
        setOpen,
      });
    };

  /** 🔹 Handle removing individual filter */
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

  /** 🔹 Build Active Filters for display */
  const activeFilters = (() => {
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
    ? coTransactionSummaryReportViewDetailsListData?.record
    : coTransactionSummaryReportListData?.transactions;

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
                    onClick={() => navigate("/PAD/co-reports")}
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
                      resetCOTransactionSummaryReportViewDetailsListData();
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
              disabled={tableRows.length === 0}
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
                onClick={
                  coTransactionSummaryReportViewDetailsFlag
                    ? downloadComplianceOfficerViewTransactionSummaryExcelFormat
                    : downloadMyTradeApprovalLineManagerInExcelFormat
                }
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
                ? coTransactionSummaryReportViewDetailsListData.record
                : coTransactionSummaryReportListData?.transactions
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

export default COTransactionsSummarysReports;
