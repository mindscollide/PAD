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
  getBorderlessTableColumns,
  mapListData,
} from "./utils";
// 🔹 Styles
import style from "./UserWiseComplianceReport.module.css";
import { useMyApproval } from "../../../../context/myApprovalContaxt";
import {
  ExportHTATradeApprovalRequestsExcelReport,
  GetAdminUserWiseComplianceReportAPI,
} from "../../../../api/myApprovalApi";
import { useNotification } from "../../../../components/NotificationProvider/NotificationProvider";
import { useApi } from "../../../../context/ApiContext";
import { useGlobalLoader } from "../../../../context/LoaderContext";
import { useNavigate } from "react-router-dom";
import { useSearchBarContext } from "../../../../context/SearchBarContaxt";
import { useTableScrollBottom } from "../../../../common/funtions/scroll";
import CustomButton from "../../../../components/buttons/button";
import { toYYMMDD } from "../../../../common/funtions/rejex";
import { useGlobalModal } from "../../../../context/GlobalModalContext";
import ViewDetailsAdmin from "./viewDetails/ViewDetails";

const UserWiseComplianceReport = () => {
  const navigate = useNavigate();
  const hasFetched = useRef(false);
  const tableScrollEmployeeTransaction = useRef(null);

  // -------------------- Contexts --------------------
  const { callApi } = useApi();
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();
  const {
    adminUserWiseComplianceReportData,
    setAdminUserWiseComplianceReportData,
    resetAdminUserWiseComplianceReportData,
  } = useMyApproval();
  const {
    showViewDetailOfUserwiseComplianceReportAdmin,
    setShowViewDetailOfUserwiseComplianceReportAdmin,
  } = useGlobalModal();

  const {
    userActivityComplianceReportAdmin,
    setUserActivityComplianceReportAdmin,
    resetUserWiseComplianceReportSearch,
  } = useSearchBarContext();

  // -------------------- Local State --------------------
  const [sortedInfo, setSortedInfo] = useState({});
  const [loadingMore, setLoadingMore] = useState(false);
  const [open, setOpen] = useState(false);
  // -------------------- Helpers --------------------

  /**
   * Fetches the User-wise Compliance Report list from
   * GetAdminUserWiseComplianceReportAPI.
   * @param {object} requestData - API request payload
   * @param {boolean} replace - if true, replace the table rows; else append (lazy load)
   */
  const fetchApiCall = useCallback(
    async (requestData, replace = false, showLoaderFlag = true) => {
      if (!requestData || typeof requestData !== "object") return;
      if (showLoaderFlag) showLoader(true);

      const res = await GetAdminUserWiseComplianceReportAPI({
        callApi,
        showNotification,
        showLoader,
        requestdata: requestData,
        navigate,
      });

      const mapped = mapListData(res);
      if (!Array.isArray(mapped)) return;

      setAdminUserWiseComplianceReportData((prev) => ({
        records: replace ? mapped : [...(prev?.records || []), ...mapped],
        totalRecordsDataBase: res?.totalRecords || 0,
        totalRecordsTable: replace
          ? mapped.length
          : (prev?.totalRecordsTable || 0) + mapped.length,
      }));
      setUserActivityComplianceReportAdmin((prev) => {
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

  // -------------------- Effects --------------------

  // 🔹 Initial Fetch
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    const requestData = buildApiRequest(userActivityComplianceReportAdmin);
    fetchApiCall(requestData, true, true);
  }, []);

  // Reset on Unmount
  useEffect(() => {
    return () => {
      // Reset search state for fresh load
      resetUserWiseComplianceReportSearch();
      resetAdminUserWiseComplianceReportData();
    };
  }, []);

  // 🔹 call api on search
  useEffect(() => {
    if (userActivityComplianceReportAdmin?.filterTrigger) {
      const requestData = buildApiRequest(userActivityComplianceReportAdmin);
      fetchApiCall(requestData, true, true);
    }
  }, [userActivityComplianceReportAdmin?.filterTrigger]);

  // 🔹 Infinite Scroll (lazy loading)
  useTableScrollBottom(
    async () => {
      if (
        adminUserWiseComplianceReportData?.totalRecordsDataBase <=
        adminUserWiseComplianceReportData?.totalRecordsTable
      )
        return;

      try {
        setLoadingMore(true);
        const requestData = buildApiRequest(userActivityComplianceReportAdmin);
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
    setShowViewDetailOfUserwiseComplianceReportAdmin,
  });

  /** 🔹 Handle removing individual filter */
  const handleRemoveFilter = (key) => {
    const resetMap = {
      employeeName: { employeeName: "" },
      departmentName: { departmentName: "" },
    };

    setUserActivityComplianceReportAdmin((prev) => ({
      ...prev,
      ...resetMap[key],
      pageNumber: 0,
      filterTrigger: true,
    }));
  };

  /** 🔹 Handle removing all filters */
  const handleRemoveAllFilters = () => {
    setUserActivityComplianceReportAdmin((prev) => ({
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
      userActivityComplianceReportAdmin || {};

    return [
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
    ].filter(Boolean);
  })();

  // 🔷 Excel Report download Api Hit
  const downloadMyTradeApprovalLineManagerInExcelFormat = async () => {
    showLoader(true);
    const requestdata = {
      StartDate: toYYMMDD(userActivityComplianceReportAdmin.startDate) || null,
      EndDate: toYYMMDD(userActivityComplianceReportAdmin.endDate) || null,
      SearchEmployeeName: userActivityComplianceReportAdmin.employeeName,
      SearchDepartmentName: userActivityComplianceReportAdmin.departmentName,
    };

    await ExportHTATradeApprovalRequestsExcelReport({
      callApi,
      showLoader,
      requestdata: requestdata,
      navigate,
    });
  };

  // -------------------- Render --------------------
  return (
    <>
      {showViewDetailOfUserwiseComplianceReportAdmin ? (
        <ViewDetailsAdmin />
      ) : (
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
                        Users Wise Compliance Report
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
                rows={adminUserWiseComplianceReportData?.records}
                columns={columns}
                classNameTable="border-less-table-blue"
                scroll={
                  adminUserWiseComplianceReportData?.records?.length
                    ? {
                        x: "max-content",
                        y: activeFilters.length > 0 ? 450 : 500,
                      }
                    : undefined
                }
                onChange={(pagination, filters, sorter) =>
                  setSortedInfo(sorter)
                }
                loading={loadingMore}
                ref={tableScrollEmployeeTransaction}
              />
            </div>
          </PageLayout>
        </>
      )}
    </>
  );
};

export default UserWiseComplianceReport;
