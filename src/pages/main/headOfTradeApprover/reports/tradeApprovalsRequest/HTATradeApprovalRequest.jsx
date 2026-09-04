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
  getBorderlessTableColumns,
  mapEmployeeTransactionsReport,
} from "./utils";
import { approvalStatusMap } from "../../../../../components/tables/borderlessTable/utill";

// 🔹 Styles
import style from "./HTATradeApprovalRequest.module.css";
import { useMyApproval } from "../../../../../context/myApprovalContaxt";
import {
  ExportHTATradeApprovalRequestsExcelReport,
  GetHTATradeApprovalRequestsReport,
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
import { toYYMMDD } from "../../../../../common/funtions/rejex";
import dayjs from "dayjs";

const HTATradeApprovalRequest = () => {
  const navigate = useNavigate();
  const hasFetched = useRef(false);
  const tableScrollEmployeeTransaction = useRef(null);

  // -------------------- Contexts --------------------
  const { callApi } = useApi();
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();
  const { myTradeApprovalLineManagerData, setMyTradeApprovalLineManagerData } =
    useMyApproval();

  const {
    myTradeApprovalReportLineManageSearch,
    setMyTradeApprovalReportLineManageSearch,
    resetLineManagerMyTradeApproval,
  } = useSearchBarContext();

  const { assetTypeListingData, setAssetTypeListingData } =
    useDashboardContext();

  // -------------------- Local State --------------------
  const [sortedInfo, setSortedInfo] = useState({});
  const [loadingMore, setLoadingMore] = useState(false);
  const [open, setOpen] = useState(false);
  const [dateRange, setDateRange] = useState(() => {
    const today = dayjs();
    const sixMonthsAgo = dayjs().subtract(6, "month");

    return { StartDate: sixMonthsAgo, EndDate: today };
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

      const res = await GetHTATradeApprovalRequestsReport({
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

      const records = Array.isArray(res?.records) ? res.records : [];
      console.log("records", records);
      const mapped = mapEmployeeTransactionsReport(
        currentAssetTypeData?.Equities,
        records
      );
      if (!mapped || typeof mapped !== "object") return;
      console.log("records", mapped);

      setMyTradeApprovalLineManagerData((prev) => ({
        records: replace ? mapped : [...(prev?.records || []), ...mapped],
        // this is for to run lazy loading its data comming from database of total data in db
        totalRecordsDataBase: res?.totalRecords || 0,
        // this is for to know how mush dta currently fetch from  db
        totalRecordsTable: replace
          ? mapped.length
          : myTradeApprovalLineManagerData.totalRecordsTable + mapped.length,
      }));
      setMyTradeApprovalReportLineManageSearch((prev) => {
        const next = {
          ...prev,
          // Backend PageNumber is now a 1-based page index
          pageNumber: replace ? 2 : prev.pageNumber + 1,
        };

        // this is for check if filter value get true only on that it will false
        if (prev.filterTrigger) {
          next.filterTrigger = false;
        }

        return next;
      });
    },
    [
      assetTypeListingData,
      callApi,
      navigate,
      setMyTradeApprovalReportLineManageSearch,
      showLoader,
      showNotification,
    ]
  );

  // -------------------- Effects --------------------

  // 🔹 Initial Fetch
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const today = dayjs();
    const sixMonthsAgo = dayjs().subtract(6, "month");

    setMyTradeApprovalReportLineManageSearch((prev) => ({
      ...prev,
      startDate: prev.startDate || sixMonthsAgo,
      endDate: prev.endDate || today,
    }));

    const requestData = buildApiRequest(
      {
        ...myTradeApprovalReportLineManageSearch,
        startDate:
          myTradeApprovalReportLineManageSearch.startDate || sixMonthsAgo,
        endDate: myTradeApprovalReportLineManageSearch.endDate || today,
      },
      assetTypeListingData
    );
    fetchApiCall(requestData, true, true);
  }, []);

  // Reset on Unmount
  useEffect(() => {
    return () => {
      // Reset search state for fresh load
      resetLineManagerMyTradeApproval();
    };
  }, []);

  // 🔹 call api on search
  useEffect(() => {
    if (myTradeApprovalReportLineManageSearch?.filterTrigger) {
      const requestData = buildApiRequest(
        myTradeApprovalReportLineManageSearch,
        assetTypeListingData
      );
      fetchApiCall(requestData, true, true);
    }
  }, [myTradeApprovalReportLineManageSearch?.filterTrigger]);

  // 🔹 Infinite Scroll (lazy loading)
  useTableScrollBottom(
    async () => {
      if (
        myTradeApprovalLineManagerData?.totalRecordsDataBase <=
        myTradeApprovalLineManagerData?.totalRecordsTable
      )
        return false;

      try {
        setLoadingMore(true);
        const requestData = buildApiRequest(
          myTradeApprovalReportLineManageSearch,
          assetTypeListingData
        );
        await fetchApiCall(requestData, false, false);
      } catch (err) {
        console.error("Error loading more approvals:", err);
        return true;
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
    myTradeApprovalReportLineManageSearch,
    setMyTradeApprovalReportLineManageSearch,
  });

  /** 🔹 Handle removing individual filter */
  const handleRemoveFilter = (key) => {
    console.log(key, "checkCheclebdkjbkwbcdjh");
    const resetMap = {
      employeeName: { employeeName: "" },
      departmentName: { departmentName: "" },
    };

    setMyTradeApprovalReportLineManageSearch((prev) => ({
      ...prev,
      ...resetMap[key],
      pageNumber: 0,
      filterTrigger: true,
    }));
  };

  /** 🔹 Handle removing all filters */
  const handleRemoveAllFilters = () => {
    setMyTradeApprovalReportLineManageSearch((prev) => ({
      ...prev,
      employeeName: "",
      departmentName: "",
      pageNumber: 0,
      filterTrigger: true,
    }));
  };

  /** 🔹 Build Active Filters */
  const activeFilters = (() => {
    const { employeeName, departmentName } =
      myTradeApprovalReportLineManageSearch || {};

    return [
      employeeName && {
        key: "employeeName",
        value:
          employeeName.length > 13
            ? employeeName.slice(0, 13) + "..."
            : employeeName,
      },

      departmentName && {
        key: "departmentName",
        value:
          departmentName.length > 13
            ? departmentName.slice(0, 13) + "..."
            : departmentName,
      },
    ].filter(Boolean);
  })();

  // Normalizes a dayjs OR native Date into whatever toYYMMDD expects (native Date),
  // so it works regardless of which type the caller currently holds.
  const formatDateForApi = (date) => {
    if (!date) return null;
    const jsDate = dayjs.isDayjs(date) ? date.toDate() : date;
    return toYYMMDD(jsDate) || null;
  };

  // 🔷 Excel Report download Api Hit
  const downloadMyTradeApprovalLineManagerInExcelFormat = async () => {
    showLoader(true);

    const requestdata = {
      StartDate: formatDateForApi(dateRange.StartDate),
      EndDate: formatDateForApi(dateRange.EndDate),
      SearchEmployeeName: myTradeApprovalReportLineManageSearch.employeeName,
      SearchDepartmentName:
        myTradeApprovalReportLineManageSearch.departmentName,
    };

    await ExportHTATradeApprovalRequestsExcelReport({
      callApi,
      showLoader,
      requestdata: requestdata,
      navigate,
      setOpen,
    });
  };

  const handleDateChange = (dates) => {
    if (dates && dates.length === 2) {
      setDateRange({
        StartDate: dates?.[0] || null,
        EndDate: dates?.[1] || null,
      });
      setMyTradeApprovalReportLineManageSearch((prev) => ({
        ...prev,
        startDate: dates?.[0] || null,
        endDate: dates?.[1] || null,
        pageNumber: 0,
      }));

      // Call API immediately after date change
      fetchApiCall(
        {
          EmployeeName: myTradeApprovalReportLineManageSearch.employeeName,
          DepartmentName: myTradeApprovalReportLineManageSearch.departmentName,
          PageNumber: 0,
          Length: 10,
          StartDate: toYYMMDD(dates[0]) || null,
          EndDate: toYYMMDD(dates[1]) || null,
        },
        true,
        true
      );
    }
  };

  const handleClearDates = () => {
    const defaultStart = dayjs().subtract(6, "month");
    const defaultEnd = dayjs();

    // Reset state back to the SRS 6-month default, not null,
    // so the picker re-displays the active range instead of appearing empty.
    setDateRange({
      StartDate: defaultStart,
      EndDate: defaultEnd,
    });
    setMyTradeApprovalReportLineManageSearch((prev) => ({
      ...prev,
      startDate: defaultStart,
      endDate: defaultEnd,
      pageNumber: 0,
    }));

    // Call API with the default 6-month range, not empty values
    fetchApiCall(
      {
        EmployeeName: myTradeApprovalReportLineManageSearch.employeeName,
        DepartmentName: myTradeApprovalReportLineManageSearch.departmentName,
        PageNumber: 0,
        Length: 10,
        StartDate: toYYMMDD(defaultStart.toDate()) || null,
        EndDate: toYYMMDD(defaultEnd.toDate()) || null,
      },
      true,
      true
    );
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
                    onClick={() => navigate("/PAD/hta-reports")}
                    className={style.breadcrumbLink}
                  >
                    Reports
                  </span>
                ),
              },
              {
                title: (
                  <span className={style.breadcrumbText}>
                    Trade Approval Requests
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
              disabled={myTradeApprovalLineManagerData?.records?.length === 0}
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
          activeFilters.length > 0 ? "changeHeightreports" : "repotsHeight"
        }
      >
        <div className="px-4 md:px-6 lg:px-8 ">
          <BorderlessTable
            rows={myTradeApprovalLineManagerData?.records}
            columns={columns}
            classNameTable="border-less-table-blue"
            scroll={
              myTradeApprovalLineManagerData?.records?.length
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

export default HTATradeApprovalRequest;
