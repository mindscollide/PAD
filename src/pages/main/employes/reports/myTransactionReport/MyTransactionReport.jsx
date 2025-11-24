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

// 🔹 Contexts
import { useGlobalModal } from "../../../../../context/GlobalModalContext";

// 🔹 Styles
import style from "./MyTransactionReport.module.css";
import { useMyApproval } from "../../../../../context/myApprovalContaxt";
import {
  DownloadMyTransactionReportRequestAPI,
  GetEmployeeTransactionReportRequestApi,
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

const MyTransactionReport = () => {
  const navigate = useNavigate();
  const hasFetched = useRef(false);
  const tableScrollEmployeeTransaction = useRef(null);

  // -------------------- Contexts --------------------
  const { callApi } = useApi();
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();
  const { getEmployeeTransactionReport, setGetEmployeeTransactionReport } =
    useMyApproval();

  const {
    employeeMyTransactionReportSearch,
    setEmployeeMyTransactionReportSearch,
    resetEmployeeMyTransactionReportSearch,
  } = useSearchBarContext();

  const { assetTypeListingData, setAssetTypeListingData } =
    useDashboardContext();

  console.log(getEmployeeTransactionReport, "getEmployeeTransactionReport");

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

      const res = await GetEmployeeTransactionReportRequestApi({
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

      const transactions = Array.isArray(res?.transactions)
        ? res.transactions
        : [];
      console.log("transactions", transactions);
      const mapped = mapEmployeeTransactionsReport(
        currentAssetTypeData?.Equities,
        transactions
      );
      if (!mapped || typeof mapped !== "object") return;
      console.log("transactions", mapped);

      setGetEmployeeTransactionReport((prev) => ({
        transactions: replace
          ? mapped
          : [...(prev?.transactions || []), ...mapped],
        // this is for to run lazy loading its data comming from database of total data in db
        totalRecordsDataBase: res?.totalRecords || 0,
        // this is for to know how mush dta currently fetch from  db
        totalRecordsTable: replace
          ? mapped.length
          : getEmployeeTransactionReport.totalRecordsTable + mapped.length,
      }));
      setEmployeeMyTransactionReportSearch((prev) => {
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
      setEmployeeMyTransactionReportSearch,
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
      employeeMyTransactionReportSearch,
      assetTypeListingData
    );
    fetchApiCall(requestData, true, true);
  }, []);

  // Reset on Unmount
  useEffect(() => {
    return () => {
      // Reset search state for fresh load
      resetEmployeeMyTransactionReportSearch();
    };
  }, []);

  // 🔹 call api on search
  useEffect(() => {
    if (employeeMyTransactionReportSearch?.filterTrigger) {
      const requestData = buildApiRequest(
        employeeMyTransactionReportSearch,
        assetTypeListingData
      );
      fetchApiCall(requestData, true, true);
    }
  }, [employeeMyTransactionReportSearch?.filterTrigger]);

  // 🔹 Infinite Scroll (lazy loading)
  useTableScrollBottom(
    async () => {
      if (
        getEmployeeTransactionReport?.totalRecordsDataBase <=
        getEmployeeTransactionReport?.totalRecordsTable
      )
        return;

      try {
        setLoadingMore(true);
        const requestData = buildApiRequest(
          employeeMyTransactionReportSearch,
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

  // -------------------- Table Columns --------------------
  const columns = getBorderlessTableColumns({
    approvalStatusMap,
    sortedInfo,
    employeeMyTransactionReportSearch,
    setEmployeeMyTransactionReportSearch,
  });

  /** 🔹 Handle removing individual filter */
  const handleRemoveFilter = (key) => {
    console.log(key, "checkCheclebdkjbkwbcdjh");
    const resetMap = {
      instrumentName: { instrumentName: "" },
      dateRange: { startDate: null, endDate: null },
      quantity: { quantity: 0 },
      actionDateRange: { actionStartDate: null, actionEndDate: null },
      broker: { broker: "" },
      actionBy: { actionBy: "" },
    };

    setEmployeeMyTransactionReportSearch((prev) => ({
      ...prev,
      ...resetMap[key],
      pageNumber: 0,
      filterTrigger: true,
    }));
  };

  /** 🔹 Handle removing all filters */
  const handleRemoveAllFilters = () => {
    setEmployeeMyTransactionReportSearch((prev) => ({
      ...prev,
      instrumentName: "",
      startDate: null,
      endDate: null,
      quantity: 0,
      actionBy: "",
      broker: "",
      actionStartDate: null,
      actionEndDate: null,
      pageNumber: 0,
      filterTrigger: true,
    }));
  };

  /** 🔹 Build Active Filters */
  const activeFilters = (() => {
    const {
      instrumentName,
      startDate,
      endDate,
      quantity,
      broker,
      actionBy,
      actionStartDate,
      actionEndDate,
    } = employeeMyTransactionReportSearch || {};

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
      actionStartDate &&
        actionEndDate && {
          key: "actionDateRange",
          value: `${actionStartDate} → ${actionEndDate}`,
        },
      broker && {
        key: "broker",
        value: broker.length > 13 ? broker.slice(0, 13) + "..." : broker,
      },
      actionBy && {
        key: "actionBy",
        value: actionBy.length > 13 ? actionBy.slice(0, 13) + "..." : actionBy,
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
      ActionBy: "",
      ActionStartDate: "",
      ActionEndDate: "",
    };
    await DownloadMyTransactionReportRequestAPI({
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
                    onClick={() => navigate("/PAD/reports")}
                    className={style.breadcrumbLink}
                  >
                    Reports
                  </span>
                ),
              },
              {
                title: (
                  <span className={style.breadcrumbText}>My Transactions</span>
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
                onClick={downloadMyTransactionInExcelFormat}
              >
                <img src={Excel} alt="Excel" draggable={false} />
                <span>Export XLS</span>
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
            rows={getEmployeeTransactionReport?.transactions}
            columns={columns}
            classNameTable="border-less-table-blue"
            scroll={
              getEmployeeTransactionReport?.transactions?.length
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

export default MyTransactionReport;
