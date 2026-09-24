import React, { useEffect, useRef, useState, useCallback } from "react";
import { Breadcrumb, Col, Row } from "antd";
import { UpOutlined, DownOutlined } from "@ant-design/icons";
import Excel from "../../../../../assets/img/xls.png";
import {
  buildApiRequest,
  buildExportRequest,
  getBorderlessTableColumns,
  mapListData,
} from "./utils";
import style from "./ViewDetails.module.css";
import { useMyApproval } from "../../../../../context/myApprovalContaxt";
import {
  ExportAdminTATRequestApprovalDetails,
  GetAdminTATRequestApprovalDetailsAPI,
} from "../../../../../api/myApprovalApi";
import { useNotification } from "../../../../../components/NotificationProvider/NotificationProvider";
import { useApi } from "../../../../../context/ApiContext";
import { useGlobalLoader } from "../../../../../context/LoaderContext";
import { useNavigate } from "react-router-dom";
import { useGlobalModal } from "../../../../../context/GlobalModalContext";
import { useTableScrollBottom } from "../../../../../common/funtions/scroll";
import { BorderlessTable, PageLayout } from "../../../../../components";
import CustomButton from "../../../../../components/buttons/button";
import { useSearchBarContext } from "../../../../../context/SearchBarContaxt";
import { useDashboardContext } from "../../../../../context/dashboardContaxt";

/**
 * Admin TAT Request Approvals - View Details (per employee), per
 * API_Changes/2026-08-11_admin_reports_all_apis.md (item 7). No
 * server-side filter fields other than the date range are supported by
 * GetAdminTATRequestApprovalDetailsAPI, so this page keeps its own local
 * search/pagination state rather than adding to the shared search-bar
 * popover infrastructure (which has no case wired for this path anyway).
 *
 * FIXED: this used to have its own interactive DateRangePicker filtering
 * the drill-down independently of the list's own applied range - removed
 * in favor of showing the list's already-applied range as read-only text
 * (same convention HTA's own TAT View Details page uses), so the
 * drill-down request itself now just reuses that same snapshot.
 */
const ViewDetails = () => {
  const navigate = useNavigate();
  const hasFetched = useRef(false);
  const tableScrollRef = useRef(null);

  const { callApi } = useApi();
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();

  const {
    adminTATRequestApprovalDetailsData,
    setAdminTATRequestApprovalDetailsData,
    resetAdminTATRequestApprovalDetailsData,
  } = useMyApproval();

  const {
    setShowViewDetailPageInTatOnHta,
    showSelectedTatDataOnViewDetailHTA,
  } = useGlobalModal();
  const { adminTATViewDetailsSearch, setAdminTATViewDetailsSearch } =
    useSearchBarContext();
  const { assetTypeListingData } = useDashboardContext(); // add this import + hook call
  const { resetAdminTATViewDetailSearch } = useSearchBarContext();
  const employeeID = showSelectedTatDataOnViewDetailHTA?.employeeID;

  // -------------------- Local State --------------------
  const [sortedInfo, setSortedInfo] = useState({});
  const [loadingMore, setLoadingMore] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (adminTATViewDetailsSearch?.filterTrigger) {
      const requestData = buildApiRequest(
        adminTATViewDetailsSearch,
        employeeID,
        assetTypeListingData // ✅ add here as well
      );
      fetchApiCall(requestData, true, true).then(() => {
        setAdminTATViewDetailsSearch((prev) => ({
          ...prev,
          filterTrigger: false,
        }));
      });
    }
  }, [adminTATViewDetailsSearch?.filterTrigger]);

  /** 🔹 Build Active Filters */
  const activeFilters = (() => {
    const {
      instrumentName,
      quantity,
      startDate,
      endDate,
      actionStartDate,
      actionEndDate,
      actionBy,
      tat,
    } = adminTATViewDetailsSearch || {}; // ✅ read the real state

    return [
      instrumentName && {
        key: "instrumentName",
        label: "Instrument",
        value:
          instrumentName.length > 13
            ? instrumentName.slice(0, 13) + "..."
            : instrumentName,
      },
      quantity > 0 && {
        key: "quantity",
        label: "Quantity",
        value: Number(quantity).toLocaleString("en-US"),
      },
      actionBy && {
        key: "actionBy",
        label: "Action By",
        value: actionBy.length > 13 ? actionBy.slice(0, 13) + "..." : actionBy,
      },
      tat > 0 && {
        key: "tat",
        label: "TAT",
        value: Number(tat).toLocaleString("en-US"),
      },
      startDate &&
        endDate && {
          key: "requestDateRange",
          value: `${startDate} → ${endDate}`,
        },
      actionStartDate &&
        actionEndDate && {
          key: "actionDateRange",
          value: `${actionStartDate} → ${actionEndDate}`,
        },
    ].filter(Boolean);
  })();
  const fetchApiCall = useCallback(
    async (requestData, replace = false, showLoaderFlag = true) => {
      if (!requestData || typeof requestData !== "object") return;
      if (showLoaderFlag) showLoader(true);

      const res = await GetAdminTATRequestApprovalDetailsAPI({
        callApi,
        showNotification,
        showLoader,
        requestdata: requestData,
        navigate,
      });

      const mapped = mapListData(res);
      if (!Array.isArray(mapped)) return;

      setAdminTATRequestApprovalDetailsData((prev) => ({
        records: replace ? mapped : [...(prev?.records || []), ...mapped],
        totalRecordsDataBase: res?.totalRecords || 0,
        totalRecordsTable: replace
          ? mapped.length
          : (prev?.totalRecordsTable || 0) + mapped.length,
      }));

      // ✅ increment pageNumber on the state that actually holds the filters
      setAdminTATViewDetailsSearch((prev) => ({
        ...prev,
        pageNumber: replace ? 2 : (prev.pageNumber || 1) + 1,
      }));
    },
    [
      callApi,
      navigate,
      showLoader,
      showNotification,
      setAdminTATViewDetailsSearch,
    ]
  );

  // 🔹 Initial Fetch
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    const requestData = buildApiRequest(
      adminTATViewDetailsSearch, // consider switching this from `search` too, for consistency
      employeeID,
      assetTypeListingData
    );
    fetchApiCall(requestData, true, true);
  }, []);

  // Reset on Unmount
  useEffect(() => {
    return () => {
      resetAdminTATRequestApprovalDetailsData();
      resetAdminTATViewDetailSearch();
    };
  }, []);

  useTableScrollBottom(
    async () => {
      if (
        adminTATRequestApprovalDetailsData?.totalRecordsDataBase <=
        adminTATRequestApprovalDetailsData?.totalRecordsTable
      )
        return;

      try {
        setLoadingMore(true);
        const requestData = buildApiRequest(
          searchStateRef.current,
          employeeID,
          assetTypeListingData // ✅ now included
        );
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

  // 🔹 Infinite Scroll (lazy loading)
  // Track the actual filter state, not the separate `search` state
  const searchStateRef = useRef(adminTATViewDetailsSearch);
  useEffect(() => {
    searchStateRef.current = adminTATViewDetailsSearch;
  }, [adminTATViewDetailsSearch]);
  const columns = getBorderlessTableColumns({
    sortedInfo,
    adminTATViewDetailsSearch,
    setAdminTATViewDetailsSearch,
  });

  const handleBack = () => {
    setShowViewDetailPageInTatOnHta(false);
  };

  // 🔷 Excel Report download Api Hit
  // ADDED (API_Changes/2026-08-28_admin_tat_request_approvals_export.md):
  // was disabled with an explanatory note that no endpoint existed yet -
  // wired to the real one now.
  const downloadAdminTATRequestApprovalDetailsInExcelFormat = async () => {
    await ExportAdminTATRequestApprovalDetails({
      callApi,
      showLoader,
      requestdata: buildExportRequest(
        adminTATViewDetailsSearch,
        employeeID,
        assetTypeListingData
      ),
      navigate,
      setOpen,
    });
  };

  const handleRemoveFilter = (key) => {
    const resetMap = {
      instrumentName: { instrumentName: "" },
      quantity: { quantity: 0 },
      actionBy: { actionBy: "" },
      tat: { tat: 0 },
      requestDateRange: { startDate: null, endDate: null },
      actionDateRange: { actionStartDate: null, actionEndDate: null },
    };

    setAdminTATViewDetailsSearch((prev) => ({
      ...prev,
      ...resetMap[key],
      pageNumber: 1,
      filterTrigger: true,
    }));
  };

  const handleRemoveAllFilters = () => {
    setAdminTATViewDetailsSearch((prev) => ({
      ...prev,
      instrumentName: "",
      quantity: 0,
      startDate: null,
      endDate: null,
      actionStartDate: null,
      actionEndDate: null,
      actionBy: "",
      tat: 0,
      pageNumber: 1,
      filterTrigger: true,
    }));
  };

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
                    onClick={() => {
                      navigate("/PAD/admin-reports");
                      handleBack();
                    }}
                    className={style.breadcrumbLink}
                  >
                    Reports
                  </span>
                ),
              },
              {
                title: (
                  <span onClick={handleBack} className={style.breadcrumbLink}>
                    TAT Request Approvals
                  </span>
                ),
              },
              {
                title: (
                  <span className={style.breadcrumbText}>View Details</span>
                ),
              },
            ]}
          />
        </Col>

        {/* ADDED per SRS ("TAT Request Approvals" > View Details):
            "Columns to Export: Date Range, Employee ID, Employee Name,
            Department Name, Request Count... The details will be
            Instrument Name, Initiated At, Trade Type, Quantity, Action
            By, Action At and TAT." */}
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

          {open && (
            <div className={style.dropdownExport}>
              <div
                className={style.dropdownItem}
                onClick={downloadAdminTATRequestApprovalDetailsInExcelFormat}
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
        <Row className={style["filter-tags-container"]}>
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

      <Row className={style.breadcrumbRowBelowData}>
        <Col span={6}>
          <p className={style.mainTitleTextClass}>
            Employee ID:
            <span className={style.subTitleTextClass}>
              {` ${showSelectedTatDataOnViewDetailHTA?.employeeID}`}
            </span>
          </p>
        </Col>
        <Col span={6}>
          <p className={style.mainTitleTextClass}>
            Employee Name:
            <span className={style.subTitleTextClass}>
              {` ${showSelectedTatDataOnViewDetailHTA?.employeeName}`}
            </span>
          </p>
        </Col>
        <Col span={6}>
          <p className={style.mainTitleTextClass}>
            Department:
            <span className={style.subTitleTextClass}>
              {` ${showSelectedTatDataOnViewDetailHTA?.departmentName}`}
            </span>
          </p>
        </Col>
        <Col span={6}>
          <p className={style.mainTitleTextClass}>
            Date Range:
            {/* FIXED (API_Changes/2026-09-23_admin_tat_request_approvals_fe_
                date_picker_issues.md #2): filterStartDate/filterEndDate are
                already "YYYY-MM-DD" strings, not Date objects - the removed
                formatDate() called .getFullYear()/.getMonth()/.getDate()
                directly on them, throwing a TypeError. Rendered as-is here,
                same convention HTA's own TAT View Details reference screen
                uses for these same fields. */}
            <span className={style.subTitleTextClass}>
              {showSelectedTatDataOnViewDetailHTA?.filterStartDate &&
              showSelectedTatDataOnViewDetailHTA?.filterEndDate
                ? ` ${showSelectedTatDataOnViewDetailHTA.filterStartDate} - ${showSelectedTatDataOnViewDetailHTA.filterEndDate}`
                : "—"}
            </span>
          </p>
        </Col>
      </Row>

      <PageLayout
        background="white"
        style={{ marginTop: "3px" }}
        className={
          activeFilters.length > 0
            ? "TATViewchangeHeightreports2"
            : "TATViewRepotsHeight"
        }
      >
        <div className="px-4 md:px-6 lg:px-8 ">
          <BorderlessTable
            rows={adminTATRequestApprovalDetailsData?.records}
            columns={columns}
            classNameTable="border-less-table-blue"
            scroll={
              adminTATRequestApprovalDetailsData?.records?.length
                ? { x: "max-content", y: activeFilters.length > 0 ? 400 : 450 }
                : undefined
            }
            onChange={(pagination, filters, sorter) => setSortedInfo(sorter)}
            loading={loadingMore}
            ref={tableScrollRef}
          />
        </div>
      </PageLayout>
    </>
  );
};

export default ViewDetails;
