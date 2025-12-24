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
  mappingDateWiseTransactionReport,
} from "./utils";
import { approvalStatusMap } from "../../../../../components/tables/borderlessTable/utill";

// 🔹 Contexts
import { useGlobalModal } from "../../../../../context/GlobalModalContext";

// 🔹 Styles
import style from "./dataWiseTransactionsReports.module.css";
import { useMyApproval } from "../../../../../context/myApprovalContaxt";
import {
  DownloadComplianceOfficerDateWiseTransactionReportRequestAPI,
  DownloadLineManagerMyTradeApprovalReportRequestAPI,
  DownloadMyTransactionReportRequestAPI,
  SearchComplianceOfficerDateWiseTransactionRequest,
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
import ViewDetaildDateWiseTransaction from "./ViewDetaildDateWiseTransaction/ViewDetaildDateWiseTransaction";
import { toYYMMDD } from "../../../../../common/funtions/rejex";
import { DateWiseTransactionReportViewDetails } from "../../../../../api/myTransactionsApi";
import { useReconcileContext } from "../../../../../context/reconsileContax";

const COdataWiseTransactionsReports = () => {
  const navigate = useNavigate();
  const hasFetched = useRef(false);
  const tableScrollEmployeeTransaction = useRef(null);

  // -------------------- Contexts --------------------
  const { callApi } = useApi();
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();
  const {
    coDatewiseTransactionReportListData,
    setCODatewiseTransactionReportListData,
  } = useMyApproval();

  const { isViewComments, setIsViewComments, setCheckTradeApprovalID } =
    useGlobalModal();

  const {
    coDatewiseTransactionReportSearch,
    setCODatewiseTransactionReportSearch,
    resetComplianceOfficerDateWiseTransationReportSearch,
  } = useSearchBarContext();

  const { assetTypeListingData, setAssetTypeListingData } =
    useDashboardContext();

  const { setReconcileTransactionViewDetailData } = useReconcileContext();

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
      const res = await SearchComplianceOfficerDateWiseTransactionRequest({
        callApi,
        showNotification,
        showLoader,
        requestdata: requestData,
        navigate,
      });

      // ✅ Always get the freshest version (from memory or session)
      const currentAssetTypeData = getSafeAssetTypeData(
        assetTypeListingData,
        setAssetTypeListingData
      );

      const records = Array.isArray(res?.complianceOfficerApprovals)
        ? res.complianceOfficerApprovals
        : [];
      console.log("records", records);
      const mapped = mappingDateWiseTransactionReport(
        currentAssetTypeData?.Equities,
        records
      );
      if (!mapped || typeof mapped !== "object") return;
      console.log("records", mapped);

      setCODatewiseTransactionReportListData((prev) => ({
        complianceOfficerApprovalsList: replace
          ? mapped
          : [...(prev?.complianceOfficerApprovalsList || []), ...mapped],
        // this is for to run lazy loading its data comming from database of total data in db
        totalRecordsDataBase: res?.totalRecords || 0,
        // this is for to know how mush dta currently fetch from  db
        totalRecordsTable: replace
          ? mapped.length
          : coDatewiseTransactionReportListData.totalRecordsTable +
            mapped.length,
      }));
      setCODatewiseTransactionReportSearch((prev) => {
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
      assetTypeListingData,
      callApi,
      navigate,
      setCODatewiseTransactionReportSearch,
      showLoader,
      showNotification,
    ]
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
        coDatewiseTransactionReportListData?.totalRecordsDataBase <=
        coDatewiseTransactionReportListData?.totalRecordsTable
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
  const handelViewDetails = async (workFlowID) => {
    await showLoader(true);
    const requestdata = { TradeApprovalID: workFlowID };

    const responseData = await DateWiseTransactionReportViewDetails({
      callApi,
      showNotification,
      showLoader,
      requestdata,
      navigate,
    });

    if (responseData) {
      console.log("responseData",responseData)
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
  const downloadMyTradeApprovalLineManagerInExcelFormat = async () => {
    showLoader(true);
    const requestdata = {
      InstrumentName: "",
      DepartmentName: "",
      Quantity: 0,
      StatusIds: [],
      TypeIds: [],
      RequesterName: "",
      StartDate: "",
      EndDate: "",
    };

    await DownloadComplianceOfficerDateWiseTransactionReportRequestAPI({
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
                    Date Wise Transaction
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
            rows={
              coDatewiseTransactionReportListData?.complianceOfficerApprovalsList
            }
            columns={columns}
            classNameTable="border-less-table-blue"
            scroll={
              coDatewiseTransactionReportListData
                ?.complianceOfficerApprovalsList?.length
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

export default COdataWiseTransactionsReports;
