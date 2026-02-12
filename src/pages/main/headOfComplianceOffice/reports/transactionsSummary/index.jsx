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
  DownloadComplianceOfficerDateWiseTransactionReportRequestAPI,
  DownloadLineManagerMyTradeApprovalReportRequestAPI,
  DownloadMyTransactionReportRequestAPI,
  ExportHOCTransactionSummaryReportExcelApi,
  GetComplianceOfficerViewTransactionSummaryAPI,
  GetHOCViewTransactionSummaryAPI,
  SearchComplianceOfficerTransactionSummaryReportRequest,
  SearchLineManagerTradeApprovalRequestApi,
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
import { mapStatusToIds } from "../../../../../components/dropdowns/filters/utils";
import ViewCommentHOCTransaction from "./viewDetails/viewComment/ViewComment";
// import ViewComment from "./viewComment/ViewComment";

const HCATransactionsSummarysReports = () => {
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
    hcoTransactionSummaryReportListData,
    setHCOTransactionSummaryReportListData,
    resetTransactionSummaryHeadOfCompliance,

    coTransactionSummaryReportViewDetailsFlag,
    setCOTransactionSummaryReportViewDetailsFlag,
    coTransactionSummaryReportViewDetailsListData,
    setCOTransactionSummaryReportViewDetailsListData,
    resetCOTransactionSummaryReportViewDetailsListData,
    selectedWorkFlowViewDetaild,
    setSelectedWorkFlowViewDetaild,
  } = useMyApproval();

  const { isViewComments, setIsViewComments, setCheckTradeApprovalID } =
    useGlobalModal();

  const {
    hcoTransactionsSummarysReportsSearch,
    setHCOTransactionsSummarysReportsSearch,
    resetHOCTransactionsSummarysReportsSearch,

    hocTransactionsSummarysReportsViewDetailsSearch,
    setHOCTransactionsSummarysReportsViewDetailSearch,
    resetHOCTransactionsSummarysReportsViewDetailsSearch,
  } = useSearchBarContext();

  // -------------------- Local State --------------------
  const [sortedInfo, setSortedInfo] = useState({});
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
      const res = await GetHOCViewTransactionSummaryAPI({
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

      setHCOTransactionSummaryReportListData((prev) => ({
        transactions: replace
          ? mapped
          : [...(prev?.transactions || []), ...mapped],
        // this is for to run lazy loading its data comming from database of total data in db
        totalRecordsDataBase: res?.totalRecords || 0,
        // this is for to know how mush dta currently fetch from  db
        totalRecordsTable: replace
          ? mapped.length
          : hcoTransactionSummaryReportListData.totalRecordsTable +
            mapped.length,
      }));

      setHCOTransactionsSummarysReportsSearch((prev) => {
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
      setHCOTransactionsSummarysReportsSearch,
      showLoader,
      showNotification,
    ],
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
        setAssetTypeListingData,
      );
      const mapped = mappingDateWiseTransactionviewDetailst(
        currentAssetTypeData?.Equities,
        record,
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

      setHOCTransactionsSummarysReportsViewDetailSearch((prev) => {
        const next = {
          ...prev,
          pageNumber: replace ? mapped.length : prev.pageNumber + mapped.length,
        };
        return next;
      });
      if (coTransactionSummaryReportViewDetailsFlag === false) {
        setCOTransactionSummaryReportViewDetailsFlag(true);
      }
    },
    [
      callApi,
      navigate,
      setHOCTransactionsSummarysReportsViewDetailSearch,
      showLoader,
      showNotification,
    ],
  );

  // -------------------- Effects --------------------

  // 🔹 Initial Fetch
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    const requestData = buildApiRequest(hcoTransactionsSummarysReportsSearch);
    fetchApiCall(requestData, true, true);
  }, []);

  //   // Reset on Unmount
  useEffect(() => {
    return () => {
      // Reset search state for fresh load
      resetHOCTransactionsSummarysReportsSearch();
      resetTransactionSummaryHeadOfCompliance();
      setCOTransactionSummaryReportViewDetailsFlag(false);
      resetCOTransactionSummaryReportViewDetailsListData();
      resetHOCTransactionsSummarysReportsViewDetailsSearch();
    };
  }, []);

  // 🔹 call api on search
  useEffect(() => {
    if (hcoTransactionsSummarysReportsSearch?.filterTrigger) {
      const requestData = buildApiRequest(hcoTransactionsSummarysReportsSearch);
      fetchApiCall(requestData, true, true);
    }
  }, [hcoTransactionsSummarysReportsSearch?.filterTrigger]);

  useEffect(() => {
    if (hocTransactionsSummarysReportsViewDetailsSearch?.filterTrigger) {
      setHOCTransactionsSummarysReportsViewDetailSearch((prev) => ({
        ...prev,
        filterTrigger: false,
      }));
      const requestData = buildApiRequestViewDetails(
        hocTransactionsSummarysReportsViewDetailsSearch,
        assetTypeListingData,
      );
      fetchApiCallViewDetails(requestData, true, true);
    }
  }, [hocTransactionsSummarysReportsViewDetailsSearch?.filterTrigger]);
  
  useEffect(() => {
    if (open) {
      setOpen(false);
    }
  }, [coTransactionSummaryReportViewDetailsFlag]);

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
          console.log(
            "StatusFilterDropdown handleOk",
            hocTransactionsSummarysReportsViewDetailsSearch,
          );

          const requestData = buildApiRequestViewDetails(
            hocTransactionsSummarysReportsViewDetailsSearch,
            assetTypeListingData,
          );

          await fetchApiCall(requestData, false, false);
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
        hcoTransactionSummaryReportListData?.totalRecordsDataBase <=
        hcoTransactionSummaryReportListData?.totalRecordsTable
      ) {
        return;
      }

      try {
        setLoadingMore(true);

        const requestData = buildApiRequest(
          hcoTransactionsSummarysReportsSearch,
        );

        await fetchApiCall(requestData, false, false);
      } catch (error) {
        console.error("Error loading summary list:", error);
      } finally {
        setLoadingMore(false);
      }
    },
    0,
    "border-less-table-blue",
  );

  const handelViewDetails = async (transactionDate) => {
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
    setHOCTransactionsSummarysReportsViewDetailSearch((prev) => ({
      ...prev,
      transactionDate: transactionDate.split(" ")[0],
    }));
    fetchApiCallViewDetails(requestData, true, true);
  };

  // -------------------- Table Columns --------------------
  const columnsReport = getBorderlessTableColumns({
    approvalStatusMap,
    sortedInfo,
    hcoTransactionsSummarysReportsSearch,
    setHCOTransactionsSummarysReportsSearch,
    handelViewDetails,
  });

  const columnsViewDetails = getBorderlessTableColumnsViewDetails({
    approvalStatusMap,
    sortedInfo,
    hocTransactionsSummarysReportsViewDetailsSearch,
    setHOCTransactionsSummarysReportsViewDetailSearch,
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

    setHCOTransactionsSummarysReportsSearch((prev) => ({
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

    setHCOTransactionsSummarysReportsSearch((prev) => ({
      ...prev,
      startDate: null,
      endDate: null,
      pageNumber: 0,
      filterTrigger: true,
    }));
  };

  // 🔷 Excel Report download Api Hit
  const downloadHOCTransactionSummaryReportExcelFormat = async () => {
    showLoader(true);
    const requestdata = {
      FromDate: dateRange.StartDate || null,
      ToDate: dateRange.EndDate || null,
    };

    await ExportHOCTransactionSummaryReportExcelApi({
      callApi,
      showLoader,
      requestdata: requestdata,
      navigate,
    });
  };

  /** 🔹 Handle removing individual filter */
  const handleRemoveFilter = (key) => {
    const resetMap = {
      instrumentName: { instrumentName: "" },
      employeeName: { employeeName: "" },
      quantity: { quantity: "" },
    };

    setHOCTransactionsSummarysReportsViewDetailSearch((prev) => ({
      ...prev,
      ...(resetMap[key] || {}),
      pageNumber: 0,
      filterTrigger: true,
    }));
  };

  /** 🔹 Handle removing all filters */
  const handleRemoveAllFilters = () => {
    setHOCTransactionsSummarysReportsViewDetailSearch((prev) => ({
      ...prev,
      quantity: "",
      instrumentName: "",
      employeeName: "",
      pageNumber: 0,
      filterTrigger: true,
    }));
  };

  /** 🔹 Build Active Filters for display */
  const activeFilters = (() => {
    const { instrumentName, employeeName, quantity } =
      hocTransactionsSummarysReportsViewDetailsSearch || {};

    return [
      instrumentName && {
        key: "instrumentName",
        value:
          instrumentName.length > 13
            ? instrumentName.slice(0, 13) + "..."
            : instrumentName,
      },

      employeeName && {
        key: "employeeName",
        value:
          employeeName.length > 13
            ? employeeName.slice(0, 13) + "..."
            : employeeName,
      },

      quantity &&
        Number(quantity) > 0 && {
          key: "quantity",
          value: Number(quantity).toLocaleString("en-US"),
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
                    onClick={() => navigate("/PAD/hca-reports")}
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
                      resetHOCTransactionsSummarysReportsViewDetailsSearch();
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
                onClick={downloadHOCTransactionSummaryReportExcelFormat}
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
          activeFilters.length > 0 ? "changeHeightreports" : "repotsHeight"
        }
      >
        <div className="px-4 md:px-6 lg:px-8 ">
          <BorderlessTable
            rows={
              coTransactionSummaryReportViewDetailsFlag
                ? coTransactionSummaryReportViewDetailsListData.record
                : hcoTransactionSummaryReportListData?.transactions
            }
            columns={
              coTransactionSummaryReportViewDetailsFlag
                ? columnsViewDetails
                : columnsReport
            }
            classNameTable="border-less-table-blue"
            scroll={
              hcoTransactionSummaryReportListData?.transactions?.length
                ? {
                    x: "max-content",
                    y: 500,
                  }
                : undefined
            }
            onChange={(pagination, filters, sorter) => setSortedInfo(sorter)}
            loading={loadingMore}
            ref={
              coTransactionSummaryReportViewDetailsFlag
                ? tableScrollTransactionSummaryViewDetailsList
                : tableScrollTransactionSummaryReportList
            }
          />
        </div>
      </PageLayout>

      {isViewComments && <ViewCommentHOCTransaction />}
    </>
  );
};

export default HCATransactionsSummarysReports;
