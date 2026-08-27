import React, { useEffect, useState, useRef, useCallback } from "react";
import { Breadcrumb, Col, Row } from "antd";
import Excel from "../../../../../assets/img/xls.png";
import { UpOutlined, DownOutlined } from "@ant-design/icons";
// 🔹 Components
import BorderlessTable from "../../../../../components/tables/borderlessTable/borderlessTable";
import PageLayout from "../../../../../components/pageContainer/pageContainer";
import CustomButton from "../../../../../components/buttons/button";

// 🔹 Table Config
import {
  buildApiRequest,
  getBorderlessTableColumns,
  mapListData,
} from "./utils";
import { approvalStatusMap } from "../../../../../components/tables/borderlessTable/utill";

// 🔹 Styles
import style from "./HTAPolicyBreaches.module.css";
import { useMyApproval } from "../../../../../context/myApprovalContaxt";
import {
  DownloadMyTransactionReportRequestAPI,
  ExportHTAPolicyBreachDetailsExcelReport,
  ExportHTAPolicyBreachesExcelReport,
  GetHTAPolicyBreachDetailsAPI,
  GetHTATradeApprovalRequestsReport,
  SearchPolicyBreachedWorkFlowsRequest,
} from "../../../../../api/myApprovalApi";
import PolicyBreachDetailsModal from "./PolicyBreachDetailsModal";
import { useNotification } from "../../../../../components/NotificationProvider/NotificationProvider";
import { useApi } from "../../../../../context/ApiContext";
import { useGlobalLoader } from "../../../../../context/LoaderContext";
import { useNavigate } from "react-router-dom";
import { useSearchBarContext } from "../../../../../context/SearchBarContaxt";
import { useDashboardContext } from "../../../../../context/dashboardContaxt";
import { getSafeAssetTypeData } from "../../../../../common/funtions/assetTypesList";
import { useTableScrollBottom } from "../../../../../common/funtions/scroll";
import { DateRangePicker } from "../../../../../components";
import { toYYMMDD } from "../../../../../common/funtions/rejex";

const HTAPolicyBreachesReport = () => {
  const navigate = useNavigate();
  const hasFetched = useRef(false);
  const tableScrollEmployeeTransaction = useRef(null);

  // -------------------- Contexts --------------------
  const { callApi } = useApi();
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();
  const {
    htaPolicyBreachesReportsData,
    setHTAPolicyBreachesReportsData,
    resetHTAPolicyBreachesReportsData,
  } = useMyApproval();

  const {
    htaPolicyBreachesReportSearch,
    setHTAPolicyBreachesReportSearch,
    resetHTAPolicyBreachesReportSearch,
  } = useSearchBarContext();

  const { assetTypeListingData, setAssetTypeListingData } =
    useDashboardContext();

  // -------------------- Local State --------------------
  const [sortedInfo, setSortedInfo] = useState({});
  const [loadingMore, setLoadingMore] = useState(false);
  const [open, setOpen] = useState(false);
  const [policyModalVisible, setPolicyModalVisible] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  // ADDED (2026-08-18): "Policies Breached" drill-down modal state -
  // API_Changes/2026-08-18_hta_policy_breach_details_and_export_apis.md.
  // policyModalVisible/selectedEmployee already existed but nothing ever
  // rendered a modal or fetched details for them.
  const [policyBreachRecords, setPolicyBreachRecords] = useState([]);
  const [policyModalLoading, setPolicyModalLoading] = useState(false);
  const [policyDownloading, setPolicyDownloading] = useState(false);
  // -------------------- Helpers --------------------

  /**
   * Fetches transactions from API.
   * @param {boolean} flag - whether to show loader
   */
  const fetchApiCall = useCallback(
    async (requestData, replace = false, showLoaderFlag = true) => {
      if (!requestData || typeof requestData !== "object") return;
      if (showLoaderFlag) showLoader(true);

      const res = await SearchPolicyBreachedWorkFlowsRequest({
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
      const mapped = mapListData(currentAssetTypeData?.Equities, records);
      if (!mapped || typeof mapped !== "object") return;
      console.log("records", mapped);

      setHTAPolicyBreachesReportsData((prev) => ({
        records: replace ? mapped : [...(prev?.records || []), ...mapped],
        // this is for to run lazy loading its data comming from database of total data in db
        totalRecordsDataBase: res?.totalRecords || 0,
        // this is for to know how mush dta currently fetch from  db
        totalRecordsTable: replace
          ? mapped.length
          : htaPolicyBreachesReportsData.totalRecordsTable + mapped.length,
      }));
      setHTAPolicyBreachesReportSearch((prev) => {
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
      setHTAPolicyBreachesReportSearch,
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
      htaPolicyBreachesReportSearch,
      assetTypeListingData
    );
    fetchApiCall(requestData, true, true);
  }, []);

  // Reset on Unmount
  useEffect(() => {
    return () => {
      // Reset search state for fresh load
      resetHTAPolicyBreachesReportSearch();
      resetHTAPolicyBreachesReportsData();
    };
  }, []);

  // 🔹 call api on search
  useEffect(() => {
    if (htaPolicyBreachesReportSearch?.filterTrigger) {
      const requestData = buildApiRequest(
        htaPolicyBreachesReportSearch,
        assetTypeListingData
      );
      fetchApiCall(requestData, true, true);
    }
  }, [htaPolicyBreachesReportSearch?.filterTrigger]);

  // 🔹 Infinite Scroll (lazy loading)
  useTableScrollBottom(
    async () => {
      if (
        htaPolicyBreachesReportsData?.totalRecordsDataBase <=
        htaPolicyBreachesReportsData?.totalRecordsTable
      )
        return;

      try {
        setLoadingMore(true);
        const requestData = buildApiRequest(
          htaPolicyBreachesReportSearch,
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

  // ADDED (2026-08-18): "Policies Breached" drill-down + export
  // (API_Changes/2026-08-18_hta_policy_breach_details_and_export_apis.md).
  // Same identifying fields both GetHTAPolicyBreachDetailsAPI and
  // ExportHTAPolicyBreachDetailsExcelReport need, built from the clicked
  // row - no extra lookup required.
  const buildPolicyBreachDetailsRequest = (record) => ({
    UserID: record?.employeeID,
    InstrumentName: record?.instrumentName,
    TradeType: record?.tradeType,
    Quantity: record?.quantity,
    RequestedDateTime: record?.requestedDateTime,
  });

  /** 🔹 Open the "Policies Breached" drill-down modal for a row */
  const handleViewPolicyBreachDetails = async (record) => {
    setSelectedEmployee(record);
    setPolicyModalVisible(true);
    setPolicyModalLoading(true);
    const res = await GetHTAPolicyBreachDetailsAPI({
      callApi,
      showNotification,
      showLoader,
      requestdata: buildPolicyBreachDetailsRequest(record),
      navigate,
    });
    setPolicyBreachRecords(res?.records || []);
    setPolicyModalLoading(false);
  };

  const handleClosePolicyModal = () => {
    setPolicyModalVisible(false);
    setSelectedEmployee(null);
    setPolicyBreachRecords([]);
  };

  /** 🔹 Modal's own Download button */
  const handleDownloadPolicyBreachDetails = async () => {
    if (!selectedEmployee) return;
    setPolicyDownloading(true);
    await ExportHTAPolicyBreachDetailsExcelReport({
      callApi,
      showLoader,
      requestdata: buildPolicyBreachDetailsRequest(selectedEmployee),
      navigate,
    });
    setPolicyDownloading(false);
  };

  // ADDED (2026-08-18): list-level "Export Excel" toolbar button, now
  // wired to the real dedicated endpoint (ExportHTAPolicyBreachesExcelReport)
  // instead of the wrong report (ExportHTATradeApprovalRequestsExcelReport)
  // it was previously calling. Request shape matches
  // PolicyBreachesListExportRequestModel exactly - unpaginated, no TypeIds.
  const downloadPolicyBreachesReportInExcelFormat = async () => {
    const requestdata = {
      InstrumentName: htaPolicyBreachesReportSearch.instrumentName || "",
      EmployeeName: htaPolicyBreachesReportSearch.employeeName || "",
      DepartmentName: htaPolicyBreachesReportSearch.departmentName || "",
      FromDate: toYYMMDD(htaPolicyBreachesReportSearch.startDate) || "",
      ToDate: toYYMMDD(htaPolicyBreachesReportSearch.endDate) || "",
      Quantity: Number(htaPolicyBreachesReportSearch.quantity) || 0,
    };

    await ExportHTAPolicyBreachesExcelReport({
      callApi,
      showLoader,
      requestdata,
      navigate,
      setOpen,
    });
  };

  // -------------------- Table Columns --------------------
  const columns = getBorderlessTableColumns({
    approvalStatusMap,
    sortedInfo,
    htaPolicyBreachesReportSearch,
    setHTAPolicyBreachesReportSearch,
    onViewPolicyBreachDetails: handleViewPolicyBreachDetails,
  });

  /** 🔹 Handle removing individual filter */
  const handleRemoveFilter = (key) => {
    const resetMap = {
      instrumentName: { instrumentName: "" },
      employeeName: { employeeName: "" },
      departmentName: { departmentName: "" },
      quantity: { quantity: "" },
      dateRange: { startDate: null, endDate: null },
    };

    setHTAPolicyBreachesReportSearch((prev) => ({
      ...prev,
      ...resetMap[key],
      pageNumber: 0,
      filterTrigger: true,
    }));
  };

  /** 🔹 Handle removing all filters */
  const handleRemoveAllFilters = () => {
    setHTAPolicyBreachesReportSearch((prev) => ({
      ...prev,
      instrumentName: "",
      employeeName: "",
      departmentName: "",
      quantity: "",
      startDate: null,
      endDate: null,
      pageNumber: 0,
      filterTrigger: true,
    }));
  };

  /** 🔹 Build Active Filters */
  const activeFilters = (() => {
    const {
      instrumentName,
      employeeName,
      departmentName,
      quantity,
      startDate,
      endDate,
    } = htaPolicyBreachesReportSearch || {};

    return [
      instrumentName && {
        key: "instrumentName",
        label: "Instrument",
        value:
          instrumentName.length > 13
            ? instrumentName.slice(0, 13) + "..."
            : instrumentName,
      },

      employeeName && {
        key: "employeeName",
        label: "Employee",
        value:
          employeeName.length > 13
            ? employeeName.slice(0, 13) + "..."
            : employeeName,
      },

      departmentName && {
        key: "departmentName",
        label: "Department",
        value:
          departmentName.length > 13
            ? departmentName.slice(0, 13) + "..."
            : departmentName,
      },

      quantity && {
        key: "quantity",
        label: "Quantity",
        value: Number(quantity).toLocaleString("en-US"),
      },

      startDate &&
        endDate && {
          label: "Date",
          key: "dateRange",
          value: `${startDate} → ${endDate}`,
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
                    onClick={() => navigate("/PAD/hta-reports")}
                    className={style.breadcrumbLink}
                  >
                    Reports
                  </span>
                ),
              },
              {
                title: (
                  <span className={style.breadcrumbText}>Policy Breaches</span>
                ),
              },
            ]}
          />
        </Col>

        <Col>
          <div className={style.headerActionsRow}>
            <CustomButton
              disabled={htaPolicyBreachesReportsData?.records?.length === 0}
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
              <div
                className={style.dropdownItem}
                onClick={downloadPolicyBreachesReportInExcelFormat}
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
            rows={htaPolicyBreachesReportsData?.records}
            columns={columns}
            classNameTable="border-less-table-blue"
            scroll={
              htaPolicyBreachesReportsData?.records?.length
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

      {policyModalVisible && (
        <PolicyBreachDetailsModal
          visible={policyModalVisible}
          onClose={handleClosePolicyModal}
          loading={policyModalLoading}
          records={policyBreachRecords}
          employeeID={selectedEmployee?.employeeID}
          employeeName={selectedEmployee?.employeeName}
          onDownload={handleDownloadPolicyBreachDetails}
          downloading={policyDownloading}
        />
      )}
    </>
  );
};

export default HTAPolicyBreachesReport;
