import React, { useEffect, useRef, useState, useCallback } from "react";
import { Breadcrumb, Col, Row } from "antd";
import { buildApiRequest, getBorderlessTableColumns, mapListData } from "./utils";
import style from "./ViewDetails.module.css";
import { useMyApproval } from "../../../../../context/myApprovalContaxt";
import { GetAdminTATRequestApprovalDetailsAPI } from "../../../../../api/myApprovalApi";
import { useNotification } from "../../../../../components/NotificationProvider/NotificationProvider";
import { useApi } from "../../../../../context/ApiContext";
import { useGlobalLoader } from "../../../../../context/LoaderContext";
import { useNavigate } from "react-router-dom";
import { useGlobalModal } from "../../../../../context/GlobalModalContext";
import { useTableScrollBottom } from "../../../../../common/funtions/scroll";
import { BorderlessTable, PageLayout, DateRangePicker } from "../../../../../components";

/**
 * Admin TAT Request Approvals - View Details (per employee), per
 * API_Changes/2026-08-11_admin_reports_all_apis.md (item 7). No
 * server-side filter fields other than the date range are supported by
 * GetAdminTATRequestApprovalDetailsAPI, so this page keeps its own local
 * search/pagination state rather than adding to the shared search-bar
 * popover infrastructure (which has no case wired for this path anyway).
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

  const employeeID = showSelectedTatDataOnViewDetailHTA?.employeeID;

  // -------------------- Local State --------------------
  const [sortedInfo, setSortedInfo] = useState({});
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState({
    startDate: null,
    endDate: null,
    pageNumber: 1,
    pageSize: 10,
  });

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
      setSearch((prev) => ({
        ...prev,
        pageNumber: replace ? 2 : (prev.pageNumber || 1) + 1,
      }));
    },
    [callApi, navigate, showLoader, showNotification]
  );

  // 🔹 Initial Fetch
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    const requestData = buildApiRequest(search, employeeID);
    fetchApiCall(requestData, true, true);
  }, []);

  // Reset on Unmount
  useEffect(() => {
    return () => {
      resetAdminTATRequestApprovalDetailsData();
    };
  }, []);

  // 🔹 Infinite Scroll (lazy loading)
  useTableScrollBottom(
    async () => {
      if (
        adminTATRequestApprovalDetailsData?.totalRecordsDataBase <=
        adminTATRequestApprovalDetailsData?.totalRecordsTable
      )
        return;

      try {
        setLoadingMore(true);
        const requestData = buildApiRequest(search, employeeID);
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

  const handleDateChange = (dates) => {
    if (!dates || dates.length !== 2) {
      setSearch((prev) => ({ ...prev, startDate: null, endDate: null }));
      const requestData = buildApiRequest(
        { ...search, startDate: null, endDate: null, pageNumber: 1 },
        employeeID
      );
      fetchApiCall(requestData, true, true);
      return;
    }

    const [start, end] = dates;
    const nextSearch = { ...search, startDate: start, endDate: end, pageNumber: 1 };
    setSearch(nextSearch);
    fetchApiCall(buildApiRequest(nextSearch, employeeID), true, true);
  };

  const columns = getBorderlessTableColumns({ sortedInfo });

  const handleBack = () => {
    setShowViewDetailPageInTatOnHta(false);
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
                  <span onClick={handleBack} className={style.breadcrumbLink}>
                    TAT Request Approvals
                  </span>
                ),
              },
              {
                title: <span className={style.breadcrumbText}>View Details</span>,
              },
            ]}
          />
        </Col>
        <Col>
          <DateRangePicker
            size="medium"
            value={[search.startDate, search.endDate]}
            onChange={handleDateChange}
            onClear={() => handleDateChange(null)}
          />
        </Col>
      </Row>

      <Row className={style.breadcrumbRowBelowData}>
        <Col span={8}>
          <p className={style.mainTitleTextClass}>
            Employee ID:{" "}
            <span className={style.subTitleTextClass}>
              {showSelectedTatDataOnViewDetailHTA?.employeeID}
            </span>
          </p>
        </Col>
        <Col span={8}>
          <p className={style.mainTitleTextClass}>
            Employee Name:{" "}
            <span className={style.subTitleTextClass}>
              {showSelectedTatDataOnViewDetailHTA?.employeeName}
            </span>
          </p>
        </Col>
        <Col span={8}>
          <p className={style.mainTitleTextClass}>
            Department:{" "}
            <span className={style.subTitleTextClass}>
              {showSelectedTatDataOnViewDetailHTA?.departmentName}
            </span>
          </p>
        </Col>
      </Row>

      <PageLayout background="white" style={{ marginTop: "3px" }} className="repotsHeight">
        <div className="px-4 md:px-6 lg:px-8 ">
          <BorderlessTable
            rows={adminTATRequestApprovalDetailsData?.records}
            columns={columns}
            classNameTable="border-less-table-blue"
            scroll={
              adminTATRequestApprovalDetailsData?.records?.length
                ? { x: "max-content", y: 500 }
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
