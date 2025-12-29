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
import ViewDetailReconcileTransaction from "../../reconcile/transaction/modals/viewDetailReconcileTransaction.jsx/ViewDetailReconcileTransaction";
import { GetAllTransactionViewDetails } from "../../../../../api/myTransactionsApi";
import { useReconcileContext } from "../../../../../context/reconsileContax";
import ViewTicketReconcileModal from "../../reconcile/transaction/modals/viewTicketReconcileModal/viewTicketReconcileModal";
import UploadReconcileTicketModal from "../../reconcile/transaction/modals/uploadReconcileTicketModal/UploadReconcileTicketModal";
import CompliantApproveModal from "../../reconcile/transaction/modals/compliantApproveModal/CompliantApproveModal";
import NonCompliantDeclineModal from "../../reconcile/transaction/modals/nonCompliantDeclineModal/nonCompliantDeclineModal";
import NoteModalComplianceOfficer from "../../reconcile/transaction/modals/noteModalComplianceOfficer/NoteModalComplianceOfficer";

const CompianceOfficerOverdueVerificationReports = () => {
  const navigate = useNavigate();
  const hasFetched = useRef(false);
  const tableScrollEmployeeTransaction = useRef(null);

  // -------------------- Contexts --------------------
  const { callApi } = useApi();
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();
  const { coOverdueVerificationListData, setCoOverdueVerificationListData } =
    useMyApproval();

  const {
    coOverdueVerificationReportSearch,
    setCoOverdueVerificationReportSearch,
    resetComplianceOfficerOverdueVerificationReportSearch,
  } = useSearchBarContext();
  const {
    viewDetailReconcileTransaction,
    setViewDetailReconcileTransaction,
    uploadComplianceModal,
    isViewTicketTransactionModal,
    compliantApproveModal,
    nonCompliantDeclineModal,
    noteGlobalModal,
  } = useGlobalModal();

  console.log(coOverdueVerificationListData, "coOverdueVerificationListData");

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
      console.log("records", records);
      const mapped = mappingDateWiseTransactionReport(
        currentAssetTypeData?.Equities,
        records
      );
      if (!mapped || typeof mapped !== "object") return;
      console.log("records", mapped);

      setCoOverdueVerificationListData((prev) => ({
        overdueVerifications: replace
          ? mapped
          : [...(prev?.overdueVerifications || []), ...mapped],
        // this is for to run lazy loading its data comming from database of total data in db
        totalRecordsDataBase: res?.totalRecords || 0,
        // this is for to know how mush dta currently fetch from  db
        totalRecordsTable: replace
          ? mapped.length
          : coOverdueVerificationListData.totalRecordsTable + mapped.length,
      }));
      setCoOverdueVerificationReportSearch((prev) => {
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
      setCoOverdueVerificationReportSearch,
      showLoader,
      showNotification,
    ]
  );
  console.log("records", coOverdueVerificationListData);
  console.log("records", coOverdueVerificationReportSearch);

  // -------------------- Effects --------------------

  // 🔹 Initial Fetch
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    const requestData = buildApiRequest(
      coOverdueVerificationReportSearch,
      assetTypeListingData
    );
    fetchApiCall(requestData, true, true);
  }, []);

  //   // Reset on Unmount
  useEffect(() => {
    return () => {
      // Reset search state for fresh load
      resetComplianceOfficerOverdueVerificationReportSearch();
    };
  }, []);

  // 🔹 call api on search
  useEffect(() => {
    if (coOverdueVerificationReportSearch?.filterTrigger) {
      const requestData = buildApiRequest(
        coOverdueVerificationReportSearch,
        assetTypeListingData
      );
      fetchApiCall(requestData, true, true);
    }
  }, [coOverdueVerificationReportSearch?.filterTrigger]);

  // 🔹 Infinite Scroll (lazy loading)
  useTableScrollBottom(
    async () => {
      if (
        coOverdueVerificationListData?.totalRecordsDataBase <=
        coOverdueVerificationListData?.totalRecordsTable
      )
        return;

      try {
        setLoadingMore(true);
        const requestData = buildApiRequest(
          coOverdueVerificationReportSearch,
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

    const responseData = await GetAllTransactionViewDetails({
      callApi,
      showNotification,
      showLoader,
      requestdata,
      navigate,
    });

    if (responseData) {
      setReconcileTransactionViewDetailData(responseData);
    }
  };

  // -------------------- Table Columns --------------------
  const columns = getBorderlessTableColumns({
    sortedInfo,
    coOverdueVerificationReportSearch,
    setCoOverdueVerificationReportSearch,
    setViewDetailReconcileTransaction,
    handleViewDetailsForReconcileTransaction,
  });

  /** 🔹 Handle removing individual filter */
  const handleRemoveFilter = (key) => {
    const resetMap = {
      instrumentName: { instrumentName: "" },
      requesterName: { requesterName: "" },
      approvedQuantity: { approvedQuantity: 0 },
      sharesTraded: { sharesTraded: 0 },
      // requestDate resets startDate + endDate
      requestDate: { startDate: null, endDate: null },
    };

    setCoOverdueVerificationReportSearch((prev) => ({
      ...prev,
      ...resetMap[key], // reset only the clicked filter
      pageNumber: 0,
      filterTrigger: true,
    }));
  };

  /** 🔹 Handle removing all filters */
  const handleRemoveAllFilters = () => {
    setCoOverdueVerificationReportSearch((prev) => ({
      ...prev,
      instrumentName: "",
      requesterName: "",
      approvedQuantity: 0,
      sharesTraded: 0,
      startDate: null,
      endDate: null,
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
      approvedQuantity,
      sharesTraded,
      startDate,
      endDate,
    } = coOverdueVerificationReportSearch || {};

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
      instrumentName
        ? { key: "instrumentName", value: truncate(instrumentName) }
        : null,

      requesterName
        ? { key: "requesterName", value: truncate(requesterName) }
        : null,

      approvedQuantity
        ? { key: "approvedQuantity", value: approvedQuantity }
        : null,

      sharesTraded ? { key: "sharesTraded", value: sharesTraded } : null,

      requestDate ? { key: "requestDate", value: requestDate } : null,
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
      ApprovedQuantity: null,
      ShareTraded: null,
    };

    await ExportOverdueVerificationCOExcel({
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
          activeFilters.length > 0 ? "changeHeightreports" : "repotsHeight"
        }
      >
        <div className="px-4 md:px-6 lg:px-8 ">
          <BorderlessTable
            rows={coOverdueVerificationListData?.overdueVerifications}
            columns={columns}
            classNameTable="border-less-table-blue"
            scroll={
              coOverdueVerificationListData?.overdueVerifications?.length
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

      {/* To show View Detail Reconcile Transaction on View Click */}
      {viewDetailReconcileTransaction && <ViewDetailReconcileTransaction />}

      {/* To show view Ticket Modal on click of View Ticket */}
      {isViewTicketTransactionModal && <ViewTicketReconcileModal />}

      {/* To Show upload Ticket Modal On Add Ticket Click */}
      {uploadComplianceModal && <UploadReconcileTicketModal />}

      {/* To show Note Modal When click on Compliant or Non Compliant */}
      {noteGlobalModal && <NoteModalComplianceOfficer />}

      {/* To Show Compliant Approve modal when I click submit */}
      {compliantApproveModal && <CompliantApproveModal />}

      {/* To Show Non COmpliant Modal by click on submit */}
      {nonCompliantDeclineModal && <NonCompliantDeclineModal />}
    </>
  );
};

export default CompianceOfficerOverdueVerificationReports;
