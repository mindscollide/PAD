import React, { useEffect, useState, useRef, useCallback } from "react";
import { Breadcrumb, Col, Row } from "antd";
import Excel from "../../../../../assets/img/xls.png";
import { UpOutlined, DownOutlined } from "@ant-design/icons";
// 🔹 Components
import BorderlessTable from "../../../../../components/tables/borderlessTable/borderlessTable";
import PageLayout from "../../../../../components/pageContainer/pageContainer";

// 🔹 Table Config
import {
  buildApiRequest,
  getBorderlessTableColumns,
  mapListData,
} from "./utils";
import { approvalStatusMap } from "../../../../../components/tables/borderlessTable/utill";

// 🔹 Styles
import style from "./HTATAT.module.css";
import { useMyApproval } from "../../../../../context/myApprovalContaxt";
import {
  ExportHTATradeApprovalRequestsExcelReport,
  SearchHTATurnAroundTimeRequest,
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
import { toYYMMDD } from "../../../../../common/funtions/rejex";
import { useGlobalModal } from "../../../../../context/GlobalModalContext";
import ViewDetails from "./viewDetails/ViewDetails";

const HTATAT = () => {
  const navigate = useNavigate();
  const hasFetched = useRef(false);
  const tableScrollEmployeeTransaction = useRef(null);

  // -------------------- Contexts --------------------
  const { callApi } = useApi();
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();
  const { htaTATReportsData, setHTATATReportsData, resetHTATATReportsData } =
    useMyApproval();

  const { htaTATReportSearch, setHTATATReportSearch, resetHTATATReportSearch } =
    useSearchBarContext();

  const { assetTypeListingData, setAssetTypeListingData } =
    useDashboardContext();

  const {
    showViewDetailPageInTatOnHta,
    setShowViewDetailPageInTatOnHta,
    setShowSelectedTatDataOnViewDetailHTA,
  } = useGlobalModal();

  // -------------------- Local State --------------------
  const [sortedInfo, setSortedInfo] = useState({});
  const [loadingMore, setLoadingMore] = useState(false);
  const [open, setOpen] = useState(false);
  const [policyModalVisible, setPolicyModalVisible] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  // -------------------- Helpers --------------------

  /**
   * Fetches transactions from API.
   * @param {boolean} flag - whether to show loader
   */
  const fetchApiCall = useCallback(
    async (requestData, replace = false, showLoaderFlag = true) => {
      if (!requestData || typeof requestData !== "object") return;
      if (showLoaderFlag) showLoader(true);

      const res = await SearchHTATurnAroundTimeRequest({
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

      const employees = Array.isArray(res?.employees) ? res.employees : [];
      console.log("records", employees);
      const mapped = mapListData(currentAssetTypeData?.Equities, employees);
      if (!mapped || typeof mapped !== "object") return;
      console.log("records", mapped);

      setHTATATReportsData((prev) => ({
        employees: replace ? mapped : [...(prev?.employees || []), ...mapped],
        // this is for to run lazy loading its data comming from database of total data in db
        totalRecordsDataBase: res?.totalRecords || 0,
        // this is for to know how mush dta currently fetch from  db
        totalRecordsTable: replace
          ? mapped.length
          : htaTATReportsData.totalRecordsTable + mapped.length,
      }));
      setHTATATReportSearch((prev) => {
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
      setHTATATReportSearch,
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
      htaTATReportSearch,
      assetTypeListingData
    );
    fetchApiCall(requestData, true, true);
  }, []);

  // Reset on Unmount
  useEffect(() => {
    return () => {
      // Reset search state for fresh load
      resetHTATATReportSearch();
      resetHTATATReportsData();
    };
  }, []);

  // 🔹 call api on search
  useEffect(() => {
    if (htaTATReportSearch?.filterTrigger) {
      const requestData = buildApiRequest(
        htaTATReportSearch,
        assetTypeListingData
      );
      fetchApiCall(requestData, true, true);
    }
  }, [htaTATReportSearch?.filterTrigger]);

  // 🔹 Infinite Scroll (lazy loading)
  useTableScrollBottom(
    async () => {
      if (
        htaTATReportsData?.totalRecordsDataBase <=
        htaTATReportsData?.totalRecordsTable
      )
        return;

      try {
        setLoadingMore(true);
        const requestData = buildApiRequest(
          htaTATReportSearch,
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
    htaTATReportSearch,
    setHTATATReportSearch,
    setSelectedEmployee,
    setPolicyModalVisible,
    setShowViewDetailPageInTatOnHta,
    setShowSelectedTatDataOnViewDetailHTA,
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

    setHTATATReportSearch((prev) => ({
      ...prev,
      ...resetMap[key],
      pageNumber: 0,
      filterTrigger: true,
    }));
  };

  /** 🔹 Handle removing all filters */
  const handleRemoveAllFilters = () => {
    setHTATATReportSearch((prev) => ({
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
    } = htaTATReportSearch || {};

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

  // 🔷 Excel Report download Api Hit
  const downloadMyTradeApprovalLineManagerInExcelFormat = async () => {
    showLoader(true);
    const requestdata = {
      StartDate: toYYMMDD(htaTATReportSearch.startDate) || null,
      EndDate: toYYMMDD(htaTATReportSearch.endDate) || null,
      SearchEmployeeName: htaTATReportSearch.employeeName,
      SearchDepartmentName: htaTATReportSearch.departmentName,
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
      {showViewDetailPageInTatOnHta ? (
        <ViewDetails />
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
                        onClick={() => {
                          navigate("/PAD/hta-reports");
                          setShowViewDetailPageInTatOnHta(false);
                        }}
                        className={style.breadcrumbLink}
                      >
                        Reports
                      </span>
                    ),
                  },
                  {
                    title: (
                      <span
                        className={style.breadcrumbText}
                        onClick={() => setShowViewDetailPageInTatOnHta(false)}
                      >
                        TAT Request Approvals{" "}
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
              activeFilters.length > 0 ? "TATHTArepotsHeight" : "repotsHeight"
            }
          >
            <div className="px-4 md:px-6 lg:px-8 ">
              <BorderlessTable
                rows={htaTATReportsData?.employees}
                columns={columns}
                classNameTable="border-less-table-blue"
                scroll={
                  htaTATReportsData?.employees?.length
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

export default HTATAT;
