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
import style from "./OverDueVerificationReports.module.css";
import { useMyApproval } from "../../../../../context/myApprovalContaxt";
import {
  ExportHOCOverdueVerificationsExcelReport,
  ExportOverdueVerificationCOExcel,
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
// import ViewDetailReconcileTransaction from "../../reconcile/transaction/modals/viewDetailReconcileTransaction.jsx/ViewDetailReconcileTransaction";
import { GetAllTransactionViewDetails } from "../../../../../api/myTransactionsApi";
import { useReconcileContext } from "../../../../../context/reconsileContax";
import ViewDetailHeadOfComplianceReconcileTransaction from "../../escalatedVerifications/escalatedVerification/modals/viewDetailHeadOfComplianceReconcileTransactions/ViewDetailHeadOfComplianceReconcileTransaction";
import { GetAllComplianceOfficerReconcileTransactionAndPortfolioRequest } from "../../../../../api/reconsile";
import ViewTicketEscalatedModal from "../../escalatedVerifications/escalatedVerification/modals/viewTicketEscalatedModal/ViewTicketEscalatedModal";
import UploadHeadOfComplianceTicketModal from "../../escalatedVerifications/escalatedVerification/modals/uploadHeadOfComplianceTicketModal/UploadHeadOfComplianceTicketModal";
import NoteHeadOfComplianceModal from "../../escalatedVerifications/escalatedVerification/modals/noteHeadOfComplianceModal/NoteHeadOfComplianceModal";
import ApproveHeadOfComplianceModal from "../../escalatedVerifications/escalatedVerification/modals/approveHeadOfComplianceModal/ApproveHeadOfComplianceModal";
import DeclinedHeadOfComplianceModal from "../../escalatedVerifications/escalatedVerification/modals/declinedHeadOfComplianceModal/DeclinedHeadOfComplianceModal";

const HeadCompianceOfficerOverdueVerificationReports = () => {
  const navigate = useNavigate();
  const hasFetched = useRef(false);
  const tableScrollEmployeeTransaction = useRef(null);

  // -------------------- Contexts --------------------
  const { callApi } = useApi();
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();

  const { overdueVerificationHCOListData, setOverdueVerificationHCOListData } =
    useMyApproval();

  const {
    OverdueVerificationHCOReportSearch,
    setOverdueVerificationHCOReportSearch,
    resetHeadOfComplianceOfficerOverdueVerificationReportSearch,
  } = useSearchBarContext();

  const {
    viewDetailHeadOfComplianceEscalated,
    setViewDetailHeadOfComplianceEscalated,
    uploadComplianceModal,
    isViewTicketTransactionModal,
    compliantApproveModal,
    nonCompliantDeclineModal,
    noteGlobalModal,
  } = useGlobalModal();

  const { assetTypeListingData, setAssetTypeListingData } =
    useDashboardContext();

  const { setIsEscalatedHeadOfComplianceViewDetailData } =
    useReconcileContext();

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
      const res = await SearchHOCOverdueVerificationsRequestApi({
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

      const records = Array.isArray(res?.overdueVerifications)
        ? res.overdueVerifications
        : [];
      const mapped = mappingDateWiseTransactionReport(
        currentAssetTypeData?.Equities,
        records
      );
      if (!mapped || typeof mapped !== "object") return;
      console.log("records", mapped);

      setOverdueVerificationHCOListData((prev) => ({
        overdueVerifications: replace
          ? mapped
          : [...(prev?.overdueVerifications || []), ...mapped],
        // this is for to run lazy loading its data comming from database of total data in db
        totalRecordsDataBase: res?.totalRecords || 0,
        // this is for to know how mush dta currently fetch from  db
        totalRecordsTable: replace
          ? mapped.length
          : overdueVerificationHCOListData.totalRecordsTable + mapped.length,
      }));
      setOverdueVerificationHCOReportSearch((prev) => {
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
      setOverdueVerificationHCOReportSearch,
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
      OverdueVerificationHCOReportSearch,
      assetTypeListingData
    );
    fetchApiCall(requestData, true, true);
  }, []);

  //   // Reset on Unmount
  useEffect(() => {
    return () => {
      // Reset search state for fresh load
      resetHeadOfComplianceOfficerOverdueVerificationReportSearch();
    };
  }, []);

  // 🔹 call api on search
  useEffect(() => {
    if (OverdueVerificationHCOReportSearch?.filterTrigger) {
      const requestData = buildApiRequest(
        OverdueVerificationHCOReportSearch,
        assetTypeListingData
      );
      fetchApiCall(requestData, true, true);
    }
  }, [OverdueVerificationHCOReportSearch?.filterTrigger]);

  // 🔹 Infinite Scroll (lazy loading)
  useTableScrollBottom(
    async () => {
      if (
        overdueVerificationHCOListData?.totalRecordsDataBase <=
        overdueVerificationHCOListData?.totalRecordsTable
      )
        return;

      try {
        setLoadingMore(true);
        const requestData = buildApiRequest(
          OverdueVerificationHCOReportSearch,
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

  // This Api is for the getAllViewDetailModal For myTransaction in Emp role
  // GETALLVIEWDETAIL OF Transaction API FUNCTION
  const handleViewDetailsForReconcileTransaction = async (workFlowID) => {
    await showLoader(true);
    const requestdata = { TradeApprovalID: workFlowID };

    const responseData =
      await GetAllComplianceOfficerReconcileTransactionAndPortfolioRequest({
        callApi,
        showNotification,
        showLoader,
        requestdata,
        navigate,
      });

    if (responseData) {
      setIsEscalatedHeadOfComplianceViewDetailData(responseData);
      setViewDetailHeadOfComplianceEscalated(true);
    }
  };

  // -------------------- Table Columns --------------------
  const columns = getBorderlessTableColumns({
    sortedInfo,
    OverdueVerificationHCOReportSearch,
    setOverdueVerificationHCOReportSearch,
    setViewDetailHeadOfComplianceEscalated,
    handleViewDetailsForReconcileTransaction,
  });

  /** 🔹 Handle removing individual filter */
  const handleRemoveFilter = (key) => {
    const resetMap = {
      instrumentName: { instrumentName: "" },
      requesterName: { requesterName: "" },
      complianceOfficerName: { complianceOfficerName: "" },

      approvedQuantity: { approvedQuantity: 0 },
      sharesTraded: { sharesTraded: 0 },

      // 🔹 Transaction Date
      requestDate: { startDate: null, endDate: null },

      // 🔹 Escalated Date
      escalatedDate: { fromDate: null, toDate: null },
    };

    setOverdueVerificationHCOReportSearch((prev) => ({
      ...prev,
      ...(resetMap[key] || {}),
      pageNumber: 0,
      filterTrigger: true,
    }));
  };

  /** 🔹 Handle removing all filters */
  const handleRemoveAllFilters = () => {
    setOverdueVerificationHCOReportSearch((prev) => ({
      ...prev,
      instrumentName: "",
      requesterName: "",
      complianceOfficerName: "",
      approvedQuantity: 0,
      sharesTraded: 0,
      startDate: null,
      endDate: null,
      fromDate: null,
      toDate: null,
      type: "",
      pageNumber: 0,
      filterTrigger: true,
    }));
  };

  /** 🔹 Build Active Filters */
  const activeFilters = (() => {
    const {
      instrumentName,
      requesterName,
      complianceOfficerName,
      approvedQuantity,
      sharesTraded,
      startDate,
      endDate,
      fromDate,
      toDate,
    } = OverdueVerificationHCOReportSearch || {};

    /* ---------------- Helpers ---------------- */

    const truncate = (val) =>
      val?.length > 13 ? `${val.slice(0, 13)}...` : val;

    const formatDate = (date) =>
      date ? new Date(date).toISOString().split("T")[0] : null;

    const formatNumber = (num) =>
      typeof num === "number" ? num.toLocaleString("en-US") : null;

    const buildDateRangeLabel = (from, to) => {
      if (from && to) return `${from} to ${to}`;
      if (from) return `From ${from}`;
      if (to) return `Till ${to}`;
      return null;
    };

    /* ---------------- Date Formatting ---------------- */

    const transactionDate = buildDateRangeLabel(
      formatDate(startDate),
      formatDate(endDate)
    );

    const escalatedDate = buildDateRangeLabel(
      formatDate(fromDate),
      formatDate(toDate)
    );

    /* ---------------- Active Filters ---------------- */

    return [
      instrumentName
        ? { key: "instrumentName", value: truncate(instrumentName) }
        : null,

      requesterName
        ? { key: "requesterName", value: truncate(requesterName) }
        : null,

      complianceOfficerName
        ? {
            key: "complianceOfficerName",
            value: truncate(complianceOfficerName),
          }
        : null,

      approvedQuantity
        ? {
            key: "approvedQuantity",
            value: formatNumber(approvedQuantity),
          }
        : null,

      sharesTraded
        ? {
            key: "sharesTraded",
            value: formatNumber(sharesTraded),
          }
        : null,

      transactionDate ? { key: "requestDate", value: transactionDate } : null,

      escalatedDate ? { key: "escalatedDate", value: escalatedDate } : null,
    ].filter(Boolean);
  })();

  // 🔷 Excel Report download Api Hit
  const downloadOverdueVerificationExcelFormat = async () => {
    showLoader(true);
    const requestdata = {
      InstrumentName: "",
      RequesterName: "",
      Type: "",
      StatusIds: [],
      FromDate: "",
      ToDate: "",
      EscalationFromDate: "",
      EscalationToDate: "",
      ApprovedQuantity: null,
      ShareTraded: null,
    };

    await ExportHOCOverdueVerificationsExcelReport({
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
                    Overdue Verifications
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
                onClick={downloadOverdueVerificationExcelFormat}
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
          activeFilters.length > 0 ? "changeHeightlmreports" : "repotsHeightHOC"
        }
      >
        <div className="px-4 md:px-6 lg:px-8 ">
          <BorderlessTable
            rows={overdueVerificationHCOListData?.overdueVerifications}
            columns={columns}
            classNameTable="border-less-table-blue"
            scroll={
              overdueVerificationHCOListData?.overdueVerifications?.length
                ? {
                    x: "max-content",
                    y: activeFilters.length > 0 ? 400 : 450,
                  }
                : undefined
            }
            onChange={(pagination, filters, sorter) => setSortedInfo(sorter)}
            loading={loadingMore}
            ref={tableScrollEmployeeTransaction}
          />
        </div>
      </PageLayout>

      {/* To show View Detail Reconcile Transaction on View Click */}
      {viewDetailHeadOfComplianceEscalated && (
        <ViewDetailHeadOfComplianceReconcileTransaction />
      )}

      {/* To show view Ticket Modal on click of View Ticket */}
      {isViewTicketTransactionModal && <ViewTicketEscalatedModal />}

      {/* To Show upload Ticket Modal On Add Ticket Click */}
      {uploadComplianceModal && <UploadHeadOfComplianceTicketModal />}

      {/* To show Note Modal When click on Compliant or Non Compliant */}
      {noteGlobalModal && <NoteHeadOfComplianceModal />}

      {/* To Show Compliant Approve modal when I click submit */}
      {compliantApproveModal && <ApproveHeadOfComplianceModal />}

      {/* To Show Non COmpliant Modal by click on submit */}
      {nonCompliantDeclineModal && <DeclinedHeadOfComplianceModal />}
    </>
  );
};

export default HeadCompianceOfficerOverdueVerificationReports;
