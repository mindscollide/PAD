import React, { useEffect, useState, useRef, useCallback } from "react";
import { Breadcrumb, Col, Row } from "antd";
import Excel from "../../../../../assets/img/xls.png";
import { UpOutlined, DownOutlined } from "@ant-design/icons";
// 🔹 Components
import BorderlessTable from "../../../../../components/tables/borderlessTable/borderlessTable";
import PageLayout from "../../../../../components/pageContainer/pageContainer";

// 🔹 Table Config
import {
  buildApiRequest,
  getBorderlessTableColumns,
  mappingDateWiseTransactionReport,
} from "./utils";

// 🔹 Contexts

// 🔹 Styles
import style from "./PortfolioHistoryReports.module.css";
import { useMyApproval } from "../../../../../context/myApprovalContaxt";
import {
  ExportPortfolioHistoryCOExcel,
  GetComplianceOfficerPortfolioHistoryRequestApi,
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
import { approvalStatusMap } from "../../../../../components/tables/borderlessTable/utill";

const CompianceOfficerPortfolioHistoryReports = () => {
  const navigate = useNavigate();
  const hasFetched = useRef(false);
  // Bumped ONLY by a replace-style fetch (initial load / filter change) -
  // represents the current "filter epoch". An append (scroll "load more")
  // fetch records this value when issued and, on completion, only merges
  // if it's unchanged - i.e. no newer filter/initial load has started
  // since. A replace's own response is only applied if it's still the
  // latest epoch too (guards against two rapid filter changes racing each
  // other). This alone isn't quite enough on its own - see
  // replaceInFlightRef below for why.
  const generationRef = useRef(0);
  // True for the entire duration a replace-style fetch is in flight.
  // generationRef alone can't stop this specific race: a scroll "load
  // more" that gets issued WHILE a filter's replace fetch is still
  // pending shares that same (not-yet-bumped-again) epoch, so it would
  // pass the generation check and get applied as an APPEND onto the
  // still-old, pre-filter list the instant it lands - even if that's
  // before the replace's own response comes back. Blocking any append
  // from being issued at all while a replace is in flight closes that
  // window (this is exactly what was reported: applying a Status filter
  // while a scroll fetch was mid-flight left the old rows in place with
  // the new ones added on top instead of replacing them).
  const replaceInFlightRef = useRef(false);
  // Next page to request for a scroll "load more" - tracked explicitly
  // instead of trusting coPortfolioHistoryReportSearch.pageNumber (whose
  // increment step here had gone missing/inconsistent between call sites,
  // which on its own would have kept re-requesting - and re-appending -
  // the same page on every scroll). Reset to 2 on every replace (page 1
  // just loaded fresh) and incremented by 1 after each successful append.
  const nextPageRef = useRef(2);
  const tableScrollEmployeeTransaction = useRef(null);

  // -------------------- Contexts --------------------
  const { callApi } = useApi();
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();
  const {
    coPortfolioHistoryListData,
    setCoPortfolioHistoryListData,
    resetCOPortfolioHistoryReportListData,
  } = useMyApproval();

  const {
    coPortfolioHistoryReportSearch,
    setCoPortfolioHistoryReportSearch,
    resetComplianceOfficerPortfolioHistoryReportSearch,
  } = useSearchBarContext();

  const { assetTypeListingData, setAssetTypeListingData } =
    useDashboardContext();

  // -------------------- Local State --------------------
  const [sortedInfo, setSortedInfo] = useState({});
  const [loadingMore, setLoadingMore] = useState(false);
  const [open, setOpen] = useState(false);

  // -------------------- Effects --------------------

  // 🔹 Initial Fetch

  const fetchApiCall = useCallback(
    async (requestData, replace = false, showLoaderFlag = true) => {
      if (!requestData || typeof requestData !== "object") return false;

      // An append (scroll "load more") never gets issued while a replace
      // (filter/initial load) is still in flight - see replaceInFlightRef
      // above. A replace itself is always allowed through; it's what
      // starts the block in the first place.
      if (!replace && replaceInFlightRef.current) return false;

      if (showLoaderFlag) showLoader(true);

      // A replace starts a NEW epoch immediately, before the network call
      // goes out - this instantly invalidates any append (or older
      // replace) already in flight from a previous epoch, no matter which
      // one's response happens to land first. An append just records
      // which epoch it belongs to, to check against when it completes.
      const myGeneration = replace
        ? ++generationRef.current
        : generationRef.current;
      if (replace) replaceInFlightRef.current = true;

      try {
        const res = await GetComplianceOfficerPortfolioHistoryRequestApi({
          callApi,
          showNotification,
          showLoader,
          navigate,
          requestdata: requestData,
        });

        // Stale response - a newer replace has started an epoch since
        // this one was issued. Discard rather than merge (whether this
        // would have replaced or appended).
        if (myGeneration !== generationRef.current) return false;

        const currentAssetTypeData = getSafeAssetTypeData(
          assetTypeListingData,
          setAssetTypeListingData,
        );

        const records = Array.isArray(res?.complianceOfficerPortfolioHistory)
          ? res.complianceOfficerPortfolioHistory
          : [];
        const mapped = mappingDateWiseTransactionReport(
          currentAssetTypeData?.Equities,
          records,
        );
        if (!mapped || typeof mapped !== "object") return false;

        setCoPortfolioHistoryListData((prev) => ({
          complianceOfficerPortfolioHistory: replace
            ? mapped
            : [...(prev?.complianceOfficerPortfolioHistory || []), ...mapped],
          totalRecordsDataBase: res?.totalRecords || 0,
          totalRecordsTable: replace
            ? mapped.length
            : (prev?.totalRecordsTable || 0) + mapped.length,
        }));

        return true;
      } finally {
        if (replace) replaceInFlightRef.current = false;
      }
    },
    [
      assetTypeListingData,
      callApi,
      navigate,
      setCoPortfolioHistoryListData,
      showLoader,
      showNotification,
    ],
  );

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    // Page 1 is being loaded fresh here - the next scroll should ask for
    // page 2, see nextPageRef above.
    nextPageRef.current = 2;
    const requestData = {
      ...buildApiRequest(coPortfolioHistoryReportSearch, assetTypeListingData),
      PageNumber: 1,
    };
    fetchApiCall(requestData, true, true);
  }, []);

  //   // Reset on Unmount
  useEffect(() => {
    return () => {
      // Reset search state for fresh load
      resetComplianceOfficerPortfolioHistoryReportSearch();
      resetCOPortfolioHistoryReportListData();
    };
  }, []);

  // 🔹 call api on search
  useEffect(() => {
    if (coPortfolioHistoryReportSearch?.filterTrigger) {
      // Fresh page 1 for the new filter - same reset as the initial fetch
      // above.
      nextPageRef.current = 2;
      const requestData = {
        ...buildApiRequest(
          coPortfolioHistoryReportSearch,
          assetTypeListingData,
        ),
        PageNumber: 1,
      };
      setCoPortfolioHistoryReportSearch((prev) => ({
        ...prev,
        filterTrigger: false,
      }));
      fetchApiCall(requestData, true, true);
    }
  }, [coPortfolioHistoryReportSearch?.filterTrigger]);

  // 🔹 Infinite Scroll (lazy loading)
  useTableScrollBottom(
    async () => {
      if (
        coPortfolioHistoryListData?.totalRecordsDataBase <=
        coPortfolioHistoryListData?.totalRecordsTable
      )
        return;
      // Extra, cheap early-out on top of fetchApiCall's own guard - no
      // point building a request/flipping the loader for a call we know
      // will be rejected.
      if (replaceInFlightRef.current) return;

      try {
        setLoadingMore(true);
        const requestData = {
          ...buildApiRequest(
            coPortfolioHistoryReportSearch,
            assetTypeListingData,
          ),
          PageNumber: nextPageRef.current,
        };
        const applied = await fetchApiCall(requestData, false, false);
        // Only advance the page cursor if this page's rows actually made
        // it into state - a discarded (stale/blocked) call should retry
        // the same page next time, not skip ahead.
        if (applied) nextPageRef.current += 1;
      } catch (err) {
        console.error("Error loading more approvals:", err);
      } finally {
        setLoadingMore(false);
      }
    },
    0,
    "border-less-table-blue",
  );
  // -------------------- Table Columns --------------------
  const columns = getBorderlessTableColumns({
    approvalStatusMap,
    sortedInfo,
    coPortfolioHistoryReportSearch,
    setCoPortfolioHistoryReportSearch,
  });

  /** 🔹 Handle removing individual filter */
  const handleRemoveFilter = (key) => {
    const resetMap = {
      instrumentName: { instrumentName: "" },
      requesterName: { requesterName: "" },
      departmentName: { departmentName: "" },
      quantity: { quantity: 0 },
      // requestDate resets startDate + endDate
    };

    setCoPortfolioHistoryReportSearch((prev) => ({
      ...prev,
      ...resetMap[key], // reset only the clicked filter
      pageNumber: 1,
      filterTrigger: true,
    }));
  };

  /** 🔹 Handle removing all filters */
  const handleRemoveAllFilters = () => {
    setCoPortfolioHistoryReportSearch((prev) => ({
      ...prev,
      instrumentName: "",
      requesterName: "",
      departmentName: "",
      quantity: 0,
      type: [],
      status: [],
      pageNumber: 1,
      filterTrigger: true,
    }));
  };

  /** 🔹 Build Active Filters */
  const activeFilters = (() => {
    const { instrumentName, requesterName, departmentName, quantity } =
      coPortfolioHistoryReportSearch || {};

    const truncate = (val) =>
      val.length > 13 ? val.slice(0, 13) + "..." : val;

    return [
      instrumentName
        ? { key: "instrumentName", value: truncate(instrumentName) }
        : null,

      departmentName
        ? { key: "departmentName", value: truncate(departmentName) }
        : null,

      requesterName
        ? { key: "requesterName", value: truncate(requesterName) }
        : null,

      quantity ? { key: "quantity", value: quantity } : null,
    ].filter(Boolean);
  })();

  // 🔷 Excel Report download Api Hit
  const downloadPortfolioHistoryExport = async () => {
    showLoader(true);
    const requestdata = {
      InstrumentName: "",
      DepartmentName: "",
      Quantity: 0,
      StatusIds: [],
      TypeIds: [],
      RequesterName: "",
    };

    await ExportPortfolioHistoryCOExcel({
      callApi,
      showLoader,
      requestdata: requestdata,
      navigate,
    });
  };

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
                  <span className={style.breadcrumbText}>
                    Portfolio History
                  </span>
                ),
              },
            ]}
          />
        </Col>
        <Col>
          <div className={style.headerActionsRow}>
            <CustomButton
              disabled={
                coPortfolioHistoryListData?.complianceOfficerPortfolioHistory
                  ?.length === 0
              }
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
                onClick={downloadPortfolioHistoryExport}
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
            rows={coPortfolioHistoryListData?.complianceOfficerPortfolioHistory}
            columns={columns}
            classNameTable="border-less-table-blue"
            scroll={
              coPortfolioHistoryListData?.complianceOfficerPortfolioHistory
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

export default CompianceOfficerPortfolioHistoryReports;
