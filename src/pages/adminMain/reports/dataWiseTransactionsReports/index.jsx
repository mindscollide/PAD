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
  buildExportRequest,
  getBorderlessTableColumns,
  mappingDateWiseTransactionReport,
} from "./utils";
import { approvalStatusMap } from "../../../../components/tables/borderlessTable/utill";

// 🔹 Contexts

// 🔹 Styles
import style from "./dataWiseTransactionsReports.module.css";
import { useMyApproval } from "../../../../context/myApprovalContaxt";
import {
  ExportAdminDateWiseTransactionReport,
  GetAdminDateWiseTransactionReportAPI,
  GetAdminDateWiseTransactionViewDetailsAPI,
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
import ViewDetaildDateWiseTransaction from "./ViewDetaildDateWiseTransaction/ViewDetaildDateWiseTransaction";
import { useReconcileContext } from "../../../../context/reconsileContax";
import { useGlobalModal } from "../../../../context/GlobalModalContext";

const AdmindataWiseTransactionsReports = () => {
  const navigate = useNavigate();
  const hasFetched = useRef(false);
  const tableScrollEmployeeTransaction = useRef(null);

  // -------------------- Contexts --------------------
  const { callApi } = useApi();
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();
  const {
    adminDateWiseTransactionReportData,
    setAdminDateWiseTransactionReportData,
    resetAdminDateWiseTransactionReportData,
  } = useMyApproval();

  const { isViewComments, setIsViewComments, setCheckTradeApprovalID } =
    useGlobalModal();

  const {
    coDatewiseTransactionReportSearch,
    setCODatewiseTransactionReportSearch,
    resetComplianceOfficerDateWiseTransationReportSearch,
  } = useSearchBarContext();

  const { assetTypeListingData } = useDashboardContext();

  const { setReconcileTransactionViewDetailData } = useReconcileContext();

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
      const res = await GetAdminDateWiseTransactionReportAPI({
        callApi,
        showNotification,
        showLoader,
        requestdata: requestData,
        navigate,
      });

      const mapped = mappingDateWiseTransactionReport(res);
      if (!Array.isArray(mapped)) return;

      setAdminDateWiseTransactionReportData((prev) => ({
        records: replace ? mapped : [...(prev?.records || []), ...mapped],
        totalRecordsDataBase: res?.totalRecords || 0,
        totalRecordsTable: replace
          ? mapped.length
          : (prev?.totalRecordsTable || 0) + mapped.length,
      }));
      setCODatewiseTransactionReportSearch((prev) => {
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


  // -------------------- Effects --------------------

  // 🔹 Initial Fetch
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    const requestData = buildApiRequest(
      coDatewiseTransactionReportSearch,
      assetTypeListingData
    );
    fetchApiCall(requestData, true, true);
  }, []);

  //   // Reset on Unmount
  useEffect(() => {
    return () => {
      // Reset search state for fresh load
      resetComplianceOfficerDateWiseTransationReportSearch();
      resetAdminDateWiseTransactionReportData();
    };
  }, []);

  // 🔹 call api on search
  useEffect(() => {
    if (coDatewiseTransactionReportSearch?.filterTrigger) {
      const requestData = buildApiRequest(
        coDatewiseTransactionReportSearch,
        assetTypeListingData
      );
      fetchApiCall(requestData, true, true);
    }
  }, [coDatewiseTransactionReportSearch?.filterTrigger]);

  // 🔹 Infinite Scroll (lazy loading)
  useTableScrollBottom(
    async () => {
      if (
        adminDateWiseTransactionReportData?.totalRecordsDataBase <=
        adminDateWiseTransactionReportData?.totalRecordsTable
      )
        return;

      try {
        setLoadingMore(true);
        const requestData = buildApiRequest(
          coDatewiseTransactionReportSearch,
          assetTypeListingData
        );
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
  // FIXED (API_Changes/2026-08-28_admin_datewise_transaction_view_details.md):
  // was calling DateWiseTransactionReportViewDetails - CO's own scoped
  // modal endpoint, keyed by TradeApprovalID - reused here by mistake.
  // Admin has its own endpoint now, keyed by RequestID (the workflow ID,
  // same field the list row already returns as requestID).
  const handelViewDetails = async (requestID) => {
    await showLoader(true);
    const requestdata = { RequestID: requestID };

    const responseData = await GetAdminDateWiseTransactionViewDetailsAPI({
      callApi,
      showNotification,
      showLoader,
      requestdata,
      navigate,
    });

    if (responseData) {
      setIsViewComments(true);

      setReconcileTransactionViewDetailData(responseData);
    }
  };
  // -------------------- Table Columns --------------------
  const columns = getBorderlessTableColumns({
    approvalStatusMap,
    sortedInfo,
    coDatewiseTransactionReportSearch,
    setCODatewiseTransactionReportSearch,
    handelViewDetails,
    setIsViewComments,
    setCheckTradeApprovalID,
  });

  /** 🔹 Handle removing individual filter */
  const handleRemoveFilter = (key) => {
    const resetMap = {
      employeeID: { employeeID: 0 },
      employeeName: { employeeName: "" },
      departmentName: { departmentName: "" },
      instrumentName: { instrumentName: "" },
      quantity: { quantity: 0 },

      // requestDate resets startDate + endDate
      requestDate: { startDate: null, endDate: null },

      type: { type: [] },
      status: { status: [] },
    };

    setCODatewiseTransactionReportSearch((prev) => ({
      ...prev,
      ...resetMap[key], // reset only the clicked filter
      pageNumber: 0,
      filterTrigger: true,
    }));
  };

  /** 🔹 Handle removing all filters */
  const handleRemoveAllFilters = () => {
    setCODatewiseTransactionReportSearch((prev) => ({
      ...prev,
      employeeID: 0,
      employeeName: "",
      departmentName: "",
      instrumentName: "",
      quantity: 0,
      startDate: null,
      endDate: null,
      type: [],
      status: [],
      pageNumber: 0,
      filterTrigger: true,
    }));
  };

  /** 🔹 Build Active Filters */
  const activeFilters = (() => {
    const {
      employeeID,
      employeeName,
      departmentName,
      instrumentName,
      quantity,
      startDate,
      endDate,
      type,
      status,
    } = coDatewiseTransactionReportSearch || {};

    const truncate = (val) =>
      val.length > 13 ? val.slice(0, 13) + "..." : val;

    const formatDate = (date) =>
      date ? new Date(date).toISOString().split("T")[0] : null;

    const formatArray = (arr) => (arr?.length ? arr.join(", ") : null);

    const formattedStart = formatDate(startDate);
    const formattedEnd = formatDate(endDate);

    // 🔹 Combine into requestDate
    let requestDate = null;
    if (formattedStart && formattedEnd) {
      requestDate = `${formattedStart} to ${formattedEnd}`;
    } else if (formattedStart) {
      requestDate = `From ${formattedStart}`;
    } else if (formattedEnd) {
      requestDate = `Till ${formattedEnd}`;
    }

    return [
      employeeID ? { key: "employeeID", value: employeeID } : null,

      employeeName
        ? { key: "employeeName", value: truncate(employeeName) }
        : null,

      departmentName
        ? { key: "departmentName", value: truncate(departmentName) }
        : null,

      instrumentName
        ? { key: "instrumentName", value: truncate(instrumentName) }
        : null,

      quantity ? { key: "quantity", value: quantity } : null,

      requestDate ? { key: "requestDate", value: requestDate } : null,

      type?.length ? { key: "type", value: formatArray(type) } : null,

      status?.length ? { key: "status", value: formatArray(status) } : null,
    ].filter(Boolean);
  })();

  // 🔷 Excel Report download Api Hit
  // FIXED (API_Changes/2026-08-28_admin_datewise_transaction_and_portfolio_
  // uploads_export.md): was calling
  // DownloadComplianceOfficerDateWiseTransactionReportRequestAPI - CO's
  // own scoped export, not this (system-wide) Admin report's - with a
  // request payload that was also always hardcoded empty, ignoring
  // whatever filters were actually active. Wired to the real endpoint now.
  const downloadAdminDateWiseTransactionReportInExcelFormat = async () => {
    await ExportAdminDateWiseTransactionReport({
      callApi,
      showLoader,
      requestdata: buildExportRequest(
        coDatewiseTransactionReportSearch,
        assetTypeListingData
      ),
      navigate,
      setOpen,
    });
  };

  // ADDED: date range now flows through the same filter state +
  // filterTrigger effect as every other filter (merges with employeeName/
  // department/instrument/type/status instead of overwriting them), and
  // into GetAdminDateWiseTransactionReportAPI via buildApiRequest, which
  // already reads searchState.startDate/endDate - same pattern as the
  // sibling CO/HCA Date-wise Transaction Report pages.
  const handleDateChange = (dates) => {
    if (dates && dates.length === 2) {
      setCODatewiseTransactionReportSearch((prev) => ({
        ...prev,
        startDate: dates[0],
        endDate: dates[1],
        pageNumber: 0,
        filterTrigger: true,
      }));

      // Clears the picker's own input back to its placeholder once the
      // range is applied - the selected range is still visible as the
      // "requestDate" active-filter tag below (reads straight off
      // coDatewiseTransactionReportSearch, set above), and still drives
      // the API request the same way. Requested explicitly: keeping the
      // picker showing the applied dates was fine functionally, just not
      // wanted visually once applied.
      setDateRange({ StartDate: null, EndDate: null });
    }
  };

  const handleClearDates = () => {
    setDateRange({
      StartDate: null,
      EndDate: null,
    });

    setCODatewiseTransactionReportSearch((prev) => ({
      ...prev,
      startDate: null,
      endDate: null,
      pageNumber: 0,
      filterTrigger: true,
    }));
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
                    Date Wise Transaction
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
              {/* <div className={style.dropdownItem}>
                <img src={PDF} alt="PDF" draggable={false} />
                <span>Export PDF</span>
              </div> */}
              <div
                className={style.dropdownItem}
                onClick={downloadAdminDateWiseTransactionReportInExcelFormat}
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
        className={
          activeFilters.length > 0 ? "TATHTAchangeHeightreports2" : "repotsHeightHOC"
        }
      >
        <div className="px-4 md:px-6 lg:px-8 ">
          <BorderlessTable
            rows={adminDateWiseTransactionReportData?.records}
            columns={columns}
            classNameTable="border-less-table-blue"
            scroll={
              adminDateWiseTransactionReportData?.records?.length
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

      {isViewComments && <ViewDetaildDateWiseTransaction />}
    </>
  );
};

export default AdmindataWiseTransactionsReports;
