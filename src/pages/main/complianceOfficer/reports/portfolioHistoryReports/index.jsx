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

// 🔹 Contexts
import { useGlobalModal } from "../../../../../context/GlobalModalContext";

// 🔹 Styles
import style from "./PortfolioHistoryReports.module.css";
import { useMyApproval } from "../../../../../context/myApprovalContaxt";
import {
  ExportOverdueVerificationCOExcel,
  ExportPortfolioHistoryCOExcel,
  GetComplianceOfficerPortfolioHistoryRequestApi,
  SearchHOCOverdueVerificationsRequestApi,
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
import { useSidebarContext } from "../../../../../context/sidebarContaxt";
import { approvalStatusMap } from "../../../../../components/tables/borderlessTable/utill";

const CompianceOfficerPortfolioHistoryReports = () => {
  const navigate = useNavigate();
  const hasFetched = useRef(false);
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

  const { selectedKey } = useSidebarContext();
  console.log(selectedKey, "selectedKey");

  console.log(coPortfolioHistoryListData, "coPortfolioHistoryListData");

  const { assetTypeListingData, setAssetTypeListingData } =
    useDashboardContext();

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
      const res = await GetComplianceOfficerPortfolioHistoryRequestApi({
        callApi,
        showNotification,
        showLoader,
        navigate,
        requestdata: requestData,
      });

      // ✅ Always get the freshest version (from memory or session)
      const currentAssetTypeData = getSafeAssetTypeData(
        assetTypeListingData,
        setAssetTypeListingData
      );

      const records = Array.isArray(res?.complianceOfficerPortfolioHistory)
        ? res.complianceOfficerPortfolioHistory
        : [];
      console.log("records", records);
      const mapped = mappingDateWiseTransactionReport(
        currentAssetTypeData?.Equities,
        records
      );
      if (!mapped || typeof mapped !== "object") return;
      console.log("records", mapped);

      setCoPortfolioHistoryListData((prev) => ({
        complianceOfficerPortfolioHistory: replace
          ? mapped
          : [...(prev?.complianceOfficerPortfolioHistory || []), ...mapped],
        // this is for to run lazy loading its data comming from database of total data in db
        totalRecordsDataBase: res?.totalRecords || 0,
        // this is for to know how mush dta currently fetch from  db
        totalRecordsTable: replace
          ? mapped.length
          : coPortfolioHistoryListData.totalRecordsTable + mapped.length,
      }));
      setCoPortfolioHistoryReportSearch((prev) => {
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
      setCoPortfolioHistoryReportSearch,
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
      coPortfolioHistoryReportSearch,
      assetTypeListingData
    );
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
      const requestData = buildApiRequest(
        coPortfolioHistoryReportSearch,
        assetTypeListingData
      );
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

      try {
        setLoadingMore(true);
        const requestData = buildApiRequest(
          coPortfolioHistoryReportSearch,
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
      pageNumber: 0,
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
      pageNumber: 0,
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
