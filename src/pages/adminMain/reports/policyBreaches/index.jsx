import React, { useEffect, useState, useRef, useCallback } from "react";
import { Breadcrumb, Col, Row } from "antd";
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
  mapListData,
} from "./utils";
// 🔹 Styles
import style from "./AdminPolicyBreachesReport.module.css";
import { useMyApproval } from "../../../../context/myApprovalContaxt";
import {
  ExportAdminPolicyBreaches,
  ExportAdminPolicyBreachDetails,
  GetAdminPolicyBreachesAPI,
  GetAdminPolicyBreachDetailsAPI,
} from "../../../../api/myApprovalApi";
import { useNotification } from "../../../../components/NotificationProvider/NotificationProvider";
import { useApi } from "../../../../context/ApiContext";
import { useGlobalLoader } from "../../../../context/LoaderContext";
import { useNavigate } from "react-router-dom";
import { useSearchBarContext } from "../../../../context/SearchBarContaxt";
import { useTableScrollBottom } from "../../../../common/funtions/scroll";
import CustomButton from "../../../../components/buttons/button";
import PolicyBreachDetailsModal from "./PolicyBreachDetailsModal";

const AdminPolicyBreachesReport = () => {
  const navigate = useNavigate();
  const hasFetched = useRef(false);
  const tableScrollEmployeeTransaction = useRef(null);

  // -------------------- Contexts --------------------
  const { callApi } = useApi();
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();
  const {
    adminPolicyBreachesReportData,
    setAdminPolicyBreachesReportData,
    resetAdminPolicyBreachesReportData,
    adminPolicyBreachDetailsData,
    setAdminPolicyBreachDetailsData,
  } = useMyApproval();

  const {
    adminPolicyBreachesReportSearch,
    setAdminPolicyBreachesReportSearch,
    resetPolicyBreachesAdminReportSearch,
  } = useSearchBarContext();

  // -------------------- Local State --------------------
  const [sortedInfo, setSortedInfo] = useState({});
  const [loadingMore, setLoadingMore] = useState(false);
  const [open, setOpen] = useState(false);
  const [policyModalVisible, setPolicyModalVisible] = useState(false);
  const [policyModalLoading, setPolicyModalLoading] = useState(false);
  // The list row the "Policies Breached" modal was opened for - the
  // modal's Download button (ExportAdminPolicyBreachDetails) needs the
  // same identifying fields GetAdminPolicyBreachDetailsAPI was called
  // with, per API_Changes/2026-08-27_admin_policy_breaches_export.md.
  const [selectedPolicyBreachRecord, setSelectedPolicyBreachRecord] =
    useState(null);
  const [policyDownloading, setPolicyDownloading] = useState(false);
  // -------------------- Helpers --------------------

  /**
   * Fetches the Policy Breaches list from GetAdminPolicyBreachesAPI.
   * @param {object} requestData - API request payload
   * @param {boolean} replace - if true, replace the table rows; else append (lazy load)
   */
  const fetchApiCall = useCallback(
    async (requestData, replace = false, showLoaderFlag = true) => {
      if (!requestData || typeof requestData !== "object") return;
      if (showLoaderFlag) showLoader(true);

      const res = await GetAdminPolicyBreachesAPI({
        callApi,
        showNotification,
        showLoader,
        requestdata: requestData,
        navigate,
      });

      const mapped = mapListData(res);
      if (!Array.isArray(mapped)) return;

      setAdminPolicyBreachesReportData((prev) => ({
        records: replace ? mapped : [...(prev?.records || []), ...mapped],
        totalRecordsDataBase: res?.totalRecords || 0,
        totalRecordsTable: replace
          ? mapped.length
          : (prev?.totalRecordsTable || 0) + mapped.length,
      }));
      setAdminPolicyBreachesReportSearch((prev) => {
        const next = {
          ...prev,
          pageNumber: replace ? 2 : (prev.pageNumber || 1) + 1,
        };
        if (prev.filterTrigger) next.filterTrigger = false;
        return next;
      });
    },
    [callApi, navigate, showLoader, showNotification]
  );

  /** 🔹 Open the "Policies Breached" drill-down modal for a row */
  const handleViewPolicyBreachDetails = async (record) => {
    setPolicyModalVisible(true);
    setPolicyModalLoading(true);
    setSelectedPolicyBreachRecord(record);
    const res = await GetAdminPolicyBreachDetailsAPI({
      callApi,
      showNotification,
      showLoader,
      requestdata: {
        EmployeeID: record.employeeID,
        InstrumentName: record.instrumentName,
        Type: record.type,
        Quantity: record.quantity,
        RequestedDateTime: record.requestedDateTime,
      },
      navigate,
    });
    setAdminPolicyBreachDetailsData({ records: res?.records || [] });
    setPolicyModalLoading(false);
  };

  const handleClosePolicyModal = () => {
    setPolicyModalVisible(false);
    setAdminPolicyBreachDetailsData({ records: [] });
    setSelectedPolicyBreachRecord(null);
  };

  /** 🔹 "Policies Breached" modal Download button */
  const handleExportPolicyBreachDetails = async () => {
    if (!selectedPolicyBreachRecord) return;
    setPolicyDownloading(true);
    await ExportAdminPolicyBreachDetails({
      callApi,
      showLoader,
      requestdata: {
        EmployeeID: selectedPolicyBreachRecord.employeeID,
        InstrumentName: selectedPolicyBreachRecord.instrumentName,
        Type: selectedPolicyBreachRecord.type,
        Quantity: selectedPolicyBreachRecord.quantity,
        RequestedDateTime: selectedPolicyBreachRecord.requestedDateTime,
      },
      navigate,
    });
    setPolicyDownloading(false);
  };

  // -------------------- Effects --------------------

  // 🔹 Initial Fetch
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    const requestData = buildApiRequest(adminPolicyBreachesReportSearch);
    fetchApiCall(requestData, true, true);
  }, []);

  // Reset on Unmount
  useEffect(() => {
    return () => {
      // Reset search state for fresh load
      resetPolicyBreachesAdminReportSearch();
      resetAdminPolicyBreachesReportData();
    };
  }, []);

  // 🔹 call api on search
  useEffect(() => {
    if (adminPolicyBreachesReportSearch?.filterTrigger) {
      const requestData = buildApiRequest(adminPolicyBreachesReportSearch);
      fetchApiCall(requestData, true, true);
    }
  }, [adminPolicyBreachesReportSearch?.filterTrigger]);

  // 🔹 Infinite Scroll (lazy loading)
  useTableScrollBottom(
    async () => {
      if (
        adminPolicyBreachesReportData?.totalRecordsDataBase <=
        adminPolicyBreachesReportData?.totalRecordsTable
      )
        return;

      try {
        setLoadingMore(true);
        const requestData = buildApiRequest(adminPolicyBreachesReportSearch);
        await fetchApiCall(requestData, false, false);
      } catch (err) {
        console.error("Error loading more:", err);
      } finally {
        setLoadingMore(false);
      }
    },
    0,
    "border-less-table-blue"
  );

  // -------------------- Table Columns --------------------
  const columns = getBorderlessTableColumns({
    sortedInfo,
    adminPolicyBreachesReportSearch,
    setAdminPolicyBreachesReportSearch,
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

    setAdminPolicyBreachesReportSearch((prev) => ({
      ...prev,
      ...resetMap[key],
      pageNumber: 0,
      filterTrigger: true,
    }));
  };

  /** 🔹 Handle removing all filters */
  const handleRemoveAllFilters = () => {
    setAdminPolicyBreachesReportSearch((prev) => ({
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
    } = adminPolicyBreachesReportSearch || {};

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
          key: "dateRange",
          value: `${startDate} → ${endDate}`,
        },
    ].filter(Boolean);
  })();

  // 🔷 Excel Report download Api Hit
  // FIXED (API_Changes/2026-08-27_admin_policy_breaches_export.md): was
  // calling ExportHTATradeApprovalRequestsExcelReport - a completely
  // different report's export, with a request shape (SearchEmployeeName/
  // SearchDepartmentName) that doesn't even match this endpoint's own
  // fields. Wired to the real endpoint now.
  const downloadAdminPolicyBreachesInExcelFormat = async () => {
    await ExportAdminPolicyBreaches({
      callApi,
      showLoader,
      requestdata: buildExportRequest(adminPolicyBreachesReportSearch),
      navigate,
      setOpen,
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
                    onClick={() => navigate("/PAD/admin-reports")}
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
                onClick={downloadAdminPolicyBreachesInExcelFormat}
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
            rows={adminPolicyBreachesReportData?.records}
            columns={columns}
            classNameTable="border-less-table-blue"
            scroll={
              adminPolicyBreachesReportData?.records?.length
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
          records={adminPolicyBreachDetailsData?.records}
          employeeID={selectedPolicyBreachRecord?.employeeID}
          employeeName={selectedPolicyBreachRecord?.employeeName}
          onDownload={handleExportPolicyBreachDetails}
          downloading={policyDownloading}
        />
      )}
    </>
  );
};

export default AdminPolicyBreachesReport;
