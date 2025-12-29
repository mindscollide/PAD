import React, { useEffect, useState, useRef, useCallback } from "react";
import { Breadcrumb, Col, Row } from "antd";
import { useNavigate } from "react-router-dom";
import PDF from "../../../../../assets/img/pdf.png";
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
import style from "./tradesUploadViaPortfolio.module.css";
import { buildBrokerOptions } from "../../../../../common/funtions/brokersList";
import { useTableScrollBottom } from "../../../../../common/funtions/scroll";
import { getSafeAssetTypeData } from "../../../../../common/funtions/assetTypesList";
import { BorderlessTable, PageLayout } from "../../../../../components";
import { approvalStatusMap } from "../../../../../components/tables/borderlessTable/utill";
import { useNotification } from "../../../../../components/NotificationProvider/NotificationProvider";
import { GetAllTransactionViewDetails } from "../../../../../api/myTransactionsApi";
import { useGlobalModal } from "../../../../../context/GlobalModalContext";
import {
  DownloadMyTradeApprovalReportRequestAPI,
  SearchHOCUploadedPortFolio,
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
const TradesUploadViaPortfolio = () => {
  const navigate = useNavigate();
  const hasFetched = useRef(false);
  const tableScrollEmployeeTransaction = useRef(null);

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
    hcoTradesUploadViaPortfolioSearch,
    setHCOTradesUploadViaPortfolioSearch,
    resetHCOTradesUploadViaPortfolioSearch,
  } = useSearchBarContext();

  const {
    hcoUploadedPortFolioData,
    setHCOUploadedPortFolioData,
    hcoUploadedPortFolioDataMqtt,
    setHCOUploadedPortFolioDataMqtt,
    resetHCOUploadedPortFolioData,
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

      const res = await SearchHOCUploadedPortFolio({
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

      const pendingPortfolios = Array.isArray(res?.pendingPortfolios)
        ? res.pendingPortfolios
        : [];
      //   console.log("transactions", transactions);
      const mapped = mapEmployeeTransactions(
        currentAssetTypeData?.Equities,
        pendingPortfolios
      );
      if (!mapped || typeof mapped !== "object") return;
      console.log("transactions", mapped);

      setHCOUploadedPortFolioData((prev) => ({
        pendingPortfolios: replace
          ? mapped
          : [...(prev?.pendingPortfolios || []), ...mapped],
        // this is for to run lazy loading its data comming from database of total data in db
        totalRecordsDataBase: res?.totalRecords || 0,
        // this is for to know how mush dta currently fetch from  db
        totalRecordsTable: replace
          ? mapped.length
          : hcoUploadedPortFolioData.totalRecordsTable + mapped.length,
      }));
      setHCOTradesUploadViaPortfolioSearch((prev) => {
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
      setHCOTradesUploadViaPortfolioSearch,
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
      hcoTradesUploadViaPortfolioSearch,
      assetTypeListingData
    );
    fetchApiCall(requestData, true, true);
  }, []);

  // Reset on Unmount
  useEffect(() => {
    return () => {
      // Reset search state for fresh load
      resetHCOTradesUploadViaPortfolioSearch();
      resetHCOUploadedPortFolioData();
    };
  }, []);

  // 🔹 call api on search
  useEffect(() => {
    if (hcoTradesUploadViaPortfolioSearch.filterTrigger) {
      const requestData = buildApiRequest(
        hcoTradesUploadViaPortfolioSearch,
        assetTypeListingData
      );
      fetchApiCall(requestData, true, true);
    }
  }, [hcoTradesUploadViaPortfolioSearch.filterTrigger]);

  // 🔹 Refresh on MQTT update
  useEffect(() => {
    if (hcoUploadedPortFolioDataMqtt) {
      let requestData = buildApiRequest(
        hcoTradesUploadViaPortfolioSearch,
        assetTypeListingData
      );
      requestData = {
        ...requestData,
        PageNumber: 0,
      };
      fetchApiCall(requestData, true, false);
      setHCOUploadedPortFolioDataMqtt(false);
    }
  }, [hcoUploadedPortFolioDataMqtt]);

  // 🔹 Infinite Scroll (lazy loading)
  useTableScrollBottom(
    async () => {
      if (
        hcoUploadedPortFolioData?.totalRecordsDataBase <=
        hcoUploadedPortFolioData?.totalRecordsTable
      )
        return;

      try {
        setLoadingMore(true);
        const requestData = buildApiRequest(
          hcoTradesUploadViaPortfolioSearch,
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
    hcoTradesUploadViaPortfolioSearch,
    setHCOTradesUploadViaPortfolioSearch,
  });

  /** 🔹 Handle removing individual filter */
  const handleRemoveFilter = (key) => {
    const resetMap = {
      instrumentName: { instrumentName: "" },
      dateRange: { startDate: null, endDate: null },
      quantity: { quantity: 0 },
      brokerIDs: { brokerIDs: [] },
    };

    setHCOTradesUploadViaPortfolioSearch((prev) => ({
      ...prev,
      ...resetMap[key],
      pageNumber: 0,
      filterTrigger: true,
    }));
  };

  /** 🔹 Handle removing all filters */
  const handleRemoveAllFilters = () => {
    setHCOTradesUploadViaPortfolioSearch((prev) => ({
      ...prev,
      instrumentName: "",
      startDate: null,
      endDate: null,
      quantity: 0,
      brokerIDs: [],
      pageNumber: 0,
      filterTrigger: true,
    }));
  };

  const brokerOptions = buildBrokerOptions(employeeBasedBrokersData);

  /** 🔹 Build Active Filters */
  const activeFilters = (() => {
    const { instrumentName, startDate, endDate, quantity, brokerIDs } =
      hcoTradesUploadViaPortfolioSearch || {};

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
                    onClick={() => navigate("/PAD/hca-reports")}
                    className={style.breadcrumbLink}
                  >
                    Reports
                  </span>
                ),
              },
              {
                title: (
                  <span className={style.breadcrumbText}>
                    Trades Upload Via Portfolio
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
            rows={hcoUploadedPortFolioData?.myTradeApprovals}
            columns={columns}
            classNameTable="border-less-table-blue"
            scroll={
              hcoUploadedPortFolioData?.myTradeApprovals?.length
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

export default TradesUploadViaPortfolio;
