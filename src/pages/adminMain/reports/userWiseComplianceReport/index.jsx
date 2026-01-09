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
import { approvalStatusMap } from "../../../../components/tables/borderlessTable/utill";

// 🔹 Styles
import style from "./UserWiseComplianceReport.module.css";
import { useMyApproval } from "../../../../context/myApprovalContaxt";
import {
  ExportHTATradeApprovalRequestsExcelReport,
  SearchPolicyBreachedWorkFlowsRequest,
} from "../../../../api/myApprovalApi";
import { useNotification } from "../../../../components/NotificationProvider/NotificationProvider";
import { useApi } from "../../../../context/ApiContext";
import { useGlobalLoader } from "../../../../context/LoaderContext";
import { useNavigate } from "react-router-dom";
import { useSearchBarContext } from "../../../../context/SearchBarContaxt";
import { useDashboardContext } from "../../../../context/dashboardContaxt";
import { getSafeAssetTypeData } from "../../../../common/funtions/assetTypesList";
import { useTableScrollBottom } from "../../../../common/funtions/scroll";
import CustomButton from "../../../../components/buttons/button";
import { toYYMMDD } from "../../../../common/funtions/rejex";
import { useSidebarContext } from "../../../../context/sidebarContaxt";
import { useGlobalModal } from "../../../../context/GlobalModalContext";
import ViewDetails from "./viewDetails/ViewDetails";
import ViewDetailsAdmin from "./viewDetails/ViewDetails";

const UserWiseComplianceReport = () => {
  const navigate = useNavigate();
  const hasFetched = useRef(false);
  const tableScrollEmployeeTransaction = useRef(null);

  // -------------------- Contexts --------------------
  const { callApi } = useApi();
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();
  const { htaPolicyBreachesReportsData, resetHTAPolicyBreachesReportsData } =
    useMyApproval();
  const {
    showViewDetailOfUserwiseComplianceReportAdmin,
    setShowViewDetailOfUserwiseComplianceReportAdmin,
  } = useGlobalModal();

  const { selectedKey } = useSidebarContext();
  console.log(selectedKey, "selectedKeyselectedKey");

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
  // -------------------- Helpers --------------------

  /**
   * Fetches transactions from API.
   * @param {boolean} flag - whether to show loader
   */
  // const fetchApiCall = useCallback(
  //   async (requestData, replace = false, showLoaderFlag = true) => {
  //     if (!requestData || typeof requestData !== "object") return;
  //     // if (showLoaderFlag) showLoader(true);

  //     // const res = await SearchPolicyBreachedWorkFlowsRequest({
  //     //   callApi,
  //     //   showNotification,
  //     //   showLoader,
  //     //   requestdata: requestData,
  //     //   navigate,
  //     // });
  //     console.log("res".res);

  //     // ✅ Always get the freshest version (from memory or session)
  //     const currentAssetTypeData = getSafeAssetTypeData(
  //       assetTypeListingData,
  //       setAssetTypeListingData
  //     );

  //     const records = Array.isArray(res?.records) ? res.records : [];
  //     console.log("records", records);
  //     const mapped = mapListData(currentAssetTypeData?.Equities, records);
  //     if (!mapped || typeof mapped !== "object") return;
  //     console.log("records", mapped);

  //     setHTAPolicyBreachesReportsData((prev) => ({
  //       records: replace ? mapped : [...(prev?.records || []), ...mapped],
  //       // this is for to run lazy loading its data comming from database of total data in db
  //       totalRecordsDataBase: res?.totalRecords || 0,
  //       // this is for to know how mush dta currently fetch from  db
  //       totalRecordsTable: replace
  //         ? mapped.length
  //         : htaPolicyBreachesReportsData.totalRecordsTable + mapped.length,
  //     }));
  //     setHTAPolicyBreachesReportSearch((prev) => {
  //       const next = {
  //         ...prev,
  //         pageNumber: replace ? mapped.length : prev.pageNumber + mapped.length,
  //       };

  //       // this is for check if filter value get true only on that it will false
  //       if (prev.filterTrigger) {
  //         next.filterTrigger = false;
  //       }

  //       return next;
  //     });
  //   },
  //   [
  //     assetTypeListingData,
  //     callApi,
  //     navigate,
  //     setHTAPolicyBreachesReportSearch,
  //     showLoader,
  //     showNotification,
  //   ]
  // );

  // -------------------- Effects --------------------

  // 🔹 Initial Fetch
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    const requestData = buildApiRequest(
      htaPolicyBreachesReportSearch,
      assetTypeListingData
    );
    // fetchApiCall(requestData, true, true);
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
      // fetchApiCall(requestData, true, true);
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
        // await fetchApiCall(requestData, false, false);
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
    htaPolicyBreachesReportSearch,
    setHTAPolicyBreachesReportSearch,
    setSelectedEmployee,
    setPolicyModalVisible,
    setShowViewDetailOfUserwiseComplianceReportAdmin,
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

      (startDate || endDate) && {
        key: "dateRange",
        label: "Date",
        value: `${startDate ? startDate.format("DD/MM/YYYY") : ""} ${
          endDate ? `- ${endDate.format("DD/MM/YYYY")}` : ""
        }`,
      },
    ].filter(Boolean);
  })();

  // 🔷 Excel Report download Api Hit
  const downloadMyTradeApprovalLineManagerInExcelFormat = async () => {
    showLoader(true);
    const requestdata = {
      StartDate: toYYMMDD(htaPolicyBreachesReportSearch.startDate) || null,
      EndDate: toYYMMDD(htaPolicyBreachesReportSearch.endDate) || null,
      SearchEmployeeName: htaPolicyBreachesReportSearch.employeeName,
      SearchDepartmentName: htaPolicyBreachesReportSearch.departmentName,
    };

    await ExportHTATradeApprovalRequestsExcelReport({
      callApi,
      showLoader,
      requestdata: requestdata,
      navigate,
    });
  };

  //Hardcoded Data
  const hardcodedTableData = [
    {
      key: "1",
      employeeID: "EMP-1001",
      employeeName: "Amit Sharma",
      department: "Compliance",
      approvalScore: 82,
      complianceScore: 91,
    },
    {
      key: "2",
      employeeID: "EMP-1002",
      employeeName: "Neha Verma",
      department: "Risk Management",
      approvalScore: 74,
      complianceScore: 88,
    },
    {
      key: "3",
      employeeID: "EMP-1003",
      employeeName: "Rahul Mehta",
      department: "Trading",
      approvalScore: 69,
      complianceScore: 79,
    },
    {
      key: "4",
      employeeID: "EMP-1004",
      employeeName: "Pooja Singh",
      department: "Operations",
      approvalScore: 90,
      complianceScore: 95,
    },
    {
      key: "5",
      employeeID: "EMP-1005",
      employeeName: "Karan Patel",
      department: "IT",
      approvalScore: 77,
      complianceScore: 83,
    },
  ];

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
                // rows={htaPolicyBreachesReportsData?.records}
                rows={hardcodedTableData}
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
