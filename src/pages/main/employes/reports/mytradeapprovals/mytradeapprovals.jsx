import React, { useEffect, useState, useRef, useCallback } from "react";
import { Breadcrumb, Col, Row } from "antd";
import { useNavigate } from "react-router-dom";
import Excel from "../../../../../assets/img/xls.png";
import { UpOutlined, DownOutlined } from "@ant-design/icons";

// 🔹 Table Config
import {
  buildApiRequest,
  getBorderlessTableColumns,
  mapEmployeeTransactions,
} from "./utill";

// 🔹 Contexts
import { useSearchBarContext } from "../../../../../context/SearchBarContaxt";
import { useApi } from "../../../../../context/ApiContext";
import { useGlobalLoader } from "../../../../../context/LoaderContext";
import { useTransaction } from "../../../../../context/myTransaction";
import { useDashboardContext } from "../../../../../context/dashboardContaxt";

// 🔹 API

// 🔹 Styles
import style from "./mytradeapprovals.module.css";
import { buildBrokerOptions } from "../../../../../common/funtions/brokersList";
import { useTableScrollBottom } from "../../../../../common/funtions/scroll";
import { getSafeAssetTypeData } from "../../../../../common/funtions/assetTypesList";
import { BorderlessTable, PageLayout } from "../../../../../components";
import { approvalStatusMap } from "../../../../../components/tables/borderlessTable/utill";
import { useNotification } from "../../../../../components/NotificationProvider/NotificationProvider";
import {
  DownloadMyTradeApprovalReportRequestAPI,
  SearchMyTradeApprovalsReportsApi,
} from "../../../../../api/myApprovalApi";
import CustomButton from "../../../../../components/buttons/button";

/**
 * 📄 MyTransaction Component
 *
 * Displays employee transactions with filters, sorting, and infinite scrolling.
 * Integrates with:
 * - `SearchBarContext` for search/filter state
 * - `ApiContext` for API calls
 * - `LoaderContext` + `NotificationProvider` for feedback
 * - `DashboardContext` for brokers data
 * - `GlobalModal` for modal management
 *
 * @returns {JSX.Element}
 */
const MytradeapprovalsReport = () => {
  const navigate = useNavigate();
  const hasFetched = useRef(false);
  const tableScrollEmployeeTransaction = useRef(null);
  // Next page to request on scroll, tracked explicitly as a real 1-indexed
  // page number - not derived from an accumulated row count. BE_API_Changes/
  // 2026-08-24_myhistory_totalrecords_now_honors_filters.md fixed
  // sp_GetEmployeeTradeApprovalReqeustReports to compute
  // OFFSET (PageNumber-1)*Length instead of using the raw PageNumber as the
  // offset directly, so the old FE workaround of sending an
  // ever-growing row count as "PageNumber" (matching that bug) would now
  // request wildly wrong offsets. Reset to 2 on every replace-style fetch
  // (page 1 just loaded fresh) and incremented by 1 after each load-more,
  // same pattern as myHistory.jsx's nextPageRef.
  const nextPageRef = useRef(2);

  // -------------------- Contexts --------------------
  const { callApi } = useApi();
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();

  const {
    assetTypeListingData,
    setAssetTypeListingData,
    employeeBasedBrokersData,
  } = useDashboardContext();

  const {
    employeeMyTradeApprovalsSearch,
    setEmployeeMyTradeApprovalsSearch,
    resetEmployeMyTradeApprovalsSearch,
  } = useSearchBarContext();

  const {
    employeeMyTradeApprovalsData,
    setEmployeeMyTradeApprovalsData,
    employeeMyTradeApprovalsMqtt,
    setEmployeeMyTradeApprovalMqtt,
  } = useTransaction();

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

      const res = await SearchMyTradeApprovalsReportsApi({
        callApi,
        showNotification,
        showLoader,
        requestdata: requestData,
        navigate,
      });
      console.log("res".res);
      // ✅ Always get the freshest version (from memory or session)
      const currentAssetTypeData = getSafeAssetTypeData(
        assetTypeListingData,
        setAssetTypeListingData
      );

      const myTradeApprovals = Array.isArray(res?.myTradeApprovals)
        ? res.myTradeApprovals
        : [];
      //   console.log("transactions", transactions);
      const mapped = mapEmployeeTransactions(
        currentAssetTypeData?.Equities,
        myTradeApprovals
      );
      if (!mapped || typeof mapped !== "object") return;

      setEmployeeMyTradeApprovalsData((prev) => ({
        myTradeApprovals: replace
          ? mapped
          : [...(prev?.myTradeApprovals || []), ...mapped],
        // this is for to run lazy loading its data comming from database of total data in db
        totalRecordsDataBase: res?.totalRecords || 0,
        // this is for to know how mush dta currently fetch from  db
        totalRecordsTable: replace
          ? mapped.length
          : employeeMyTradeApprovalsData.totalRecordsTable + mapped.length,
      }));

      // This page has now been fetched - advance the explicit page cursor
      // instead of accumulating a row count into context's pageNumber (see
      // nextPageRef above for why).
      nextPageRef.current = replace ? 2 : nextPageRef.current + 1;

      setEmployeeMyTradeApprovalsSearch((prev) =>
        prev.filterTrigger ? { ...prev, filterTrigger: false } : prev
      );
    },
    [
      assetTypeListingData,
      callApi,
      navigate,
      setEmployeeMyTradeApprovalsSearch,
      showLoader,
      showNotification,
    ]
  );

  // -------------------- Effects --------------------

  // 🔹 Initial Fetch
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    // Page 1 is being loaded fresh here - the next scroll should ask for
    // page 2, see nextPageRef above.
    nextPageRef.current = 2;
    const requestData = buildApiRequest(
      employeeMyTradeApprovalsSearch,
      assetTypeListingData
    );
    fetchApiCall(requestData, true, true);
  }, []);

  // Reset on Unmount
  useEffect(() => {
    return () => {
      // Reset search state for fresh load
      resetEmployeMyTradeApprovalsSearch();
    };
  }, []);

  // 🔹 call api on search
  useEffect(() => {
    if (employeeMyTradeApprovalsSearch.filterTrigger) {
      // Fresh page 1 for the new filter - same reset as the initial fetch
      // above.
      nextPageRef.current = 2;
      const requestData = buildApiRequest(
        employeeMyTradeApprovalsSearch,
        assetTypeListingData
      );
      fetchApiCall(requestData, true, true);
    }
  }, [employeeMyTradeApprovalsSearch.filterTrigger]);

  // 🔹 Refresh on MQTT update
  useEffect(() => {
    if (employeeMyTradeApprovalsMqtt) {
      nextPageRef.current = 2;
      let requestData = buildApiRequest(
        employeeMyTradeApprovalsSearch,
        assetTypeListingData
      );
      requestData = {
        ...requestData,
        // Real 1-indexed page 1 - was 0, matching the old buggy raw-offset
        // backend (see nextPageRef above).
        PageNumber: 1,
      };
      fetchApiCall(requestData, true, false);
      setEmployeeMyTradeApprovalMqtt(false);
    }
  }, [employeeMyTradeApprovalsMqtt]);

  // 🔹 Infinite Scroll (lazy loading)
  useTableScrollBottom(
    async () => {
      if (
        employeeMyTradeApprovalsData?.totalRecordsDataBase <=
        employeeMyTradeApprovalsData?.totalRecordsTable
      )
        return;

      try {
        setLoadingMore(true);
        // Override pagination with the explicitly tracked next page
        // instead of trusting context's pageNumber (see nextPageRef
        // above) - build the request from the current search/filter, then
        // force PageNumber/Length onto it, same as myHistory.jsx.
        const baseRequest = buildApiRequest(
          employeeMyTradeApprovalsSearch,
          assetTypeListingData
        );
        const requestData = {
          ...baseRequest,
          PageNumber: nextPageRef.current,
          Length: Number(employeeMyTradeApprovalsSearch.pageSize) || 10,
        };
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
    approvalStatusMap,
    sortedInfo,
    employeeMyTradeApprovalsSearch,
    setEmployeeMyTradeApprovalsSearch,
  });

  /** 🔹 Handle removing individual filter */
  const handleRemoveFilter = (key) => {
    const resetMap = {
      instrumentName: { instrumentName: "" },
      dateRange: { startDate: null, endDate: null },
      quantity: { quantity: 0 },
      brokerIDs: { brokerIDs: [] },
    };

    setEmployeeMyTradeApprovalsSearch((prev) => ({
      ...prev,
      ...resetMap[key],
      pageNumber: 1,
      filterTrigger: true,
    }));
  };

  /** 🔹 Handle removing all filters */
  const handleRemoveAllFilters = () => {
    setEmployeeMyTradeApprovalsSearch((prev) => ({
      ...prev,
      instrumentName: "",
      startDate: null,
      endDate: null,
      quantity: 0,
      brokerIDs: [],
      pageNumber: 1,
      filterTrigger: true,
    }));
  };

  const brokerOptions = buildBrokerOptions(employeeBasedBrokersData);

  /** 🔹 Build Active Filters */
  const activeFilters = (() => {
    const { instrumentName, startDate, endDate, quantity, brokerIDs } =
      employeeMyTradeApprovalsSearch || {};

    return [
      instrumentName && {
        key: "instrumentName",
        value:
          instrumentName.length > 13
            ? instrumentName.slice(0, 13) + "..."
            : instrumentName,
      },
      startDate &&
        endDate && {
          key: "dateRange",
          value: `${startDate} → ${endDate}`,
        },
      quantity &&
        Number(quantity) > 0 && {
          key: "quantity",
          value: Number(quantity).toLocaleString("en-US"),
        },
      brokerIDs?.length > 0 && {
        key: "brokerIDs",
        value:
          brokerIDs.length === 1
            ? (() => {
                const broker = brokerOptions.find(
                  (b) => b.value === brokerIDs[0]
                );
                if (!broker) return "";
                return broker.label.length > 13
                  ? broker.label.slice(0, 13) + "..."
                  : broker.label;
              })()
            : "Multiple",
      },
    ].filter(Boolean);
  })();

  // 🔷 Excel Report download Api Hit
  const downloadMyTransactionInExcelFormat = async () => {
    showLoader(true);
    const requestdata = {
      InstrumentName: "",
      Quantity: 0,
      StartDate: "",
      EndDate: "",
      StatusIds: [],
      TypeIds: [],
      Broker: "",
    };
    await DownloadMyTradeApprovalReportRequestAPI({
      callApi,
      showLoader,
      requestdata: requestdata,
      navigate,
      setOpen,
    });
  };

  // -------------------- Render --------------------
  return (
    <>
      {/* 🔹 Active Filter Tags */}

      <Row justify="start" align="middle" className={style.breadcrumbRow}>
        <Col>
          <Breadcrumb
            separator=">"
            className={style.customBreadcrumb}
            items={[
              {
                title: (
                  <span
                    onClick={() => navigate("/PAD/reports")}
                    className={style.breadcrumbLink}
                  >
                    Reports
                  </span>
                ),
              },
              {
                title: (
                  <span className={style.breadcrumbText}>
                    My Trade Approvals
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
                employeeMyTradeApprovalsData?.myTradeApprovals?.length === 0
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
                onClick={downloadMyTransactionInExcelFormat}
              >
                <img src={Excel} alt="Excel" draggable={false} />
                <span>Export XLS</span>
              </div>
            </div>
          )}
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
        style={{ marginTop: "2px" }}
        className={
          activeFilters.length > 0 ? "changeHeightreports" : "repotsHeight"
        }
      >
        <div className="px-4 md:px-6 lg:px-8 ">
          <BorderlessTable
            rows={employeeMyTradeApprovalsData?.myTradeApprovals}
            columns={columns}
            classNameTable="border-less-table-blue"
            scroll={
              employeeMyTradeApprovalsData?.myTradeApprovals?.length
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

export default MytradeapprovalsReport;
