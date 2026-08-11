import React, { useEffect, useRef, useState, useCallback } from "react";
import { Breadcrumb, Col, Row } from "antd";
import BorderlessTable from "../../../../components/tables/borderlessTable/borderlessTable";
import PageLayout from "../../../../components/pageContainer/pageContainer";
import { TextField } from "../../../../components";
import CustomButton from "../../../../components/buttons/button";

import {
  buildEmployeeSearchRequest,
  mapEmployeeListData,
  buildSessionsRequest,
  mapSessionListData,
  getEmployeeListColumns,
  getSessionListColumns,
} from "./utils";

import style from "./UserActivityReport.module.css";
import {
  SearchManageUserListRequest,
  GetUserSessionWiseActivity,
  ViewUserSessionWiseActivity,
} from "../../../../api/adminApi";
import { useNotification } from "../../../../components/NotificationProvider/NotificationProvider";
import { useApi } from "../../../../context/ApiContext";
import { useGlobalLoader } from "../../../../context/LoaderContext";
import { useNavigate } from "react-router-dom";
import { useGlobalModal } from "../../../../context/GlobalModalContext";
import { useTableScrollBottom } from "../../../../common/funtions/scroll";
import { removeFirstSpace } from "../../../../common/funtions/rejex";
import ViewActionSessionWiseModal from "../../manageUsers/usersTab/sessionwise/viewActionSessionWiseModal/ViewActionSessionWiseModal";

const EMPLOYEE_SEARCH_INITIAL = {
  employeeName: "",
  departmentName: "",
  pageNumber: 1,
  pageSize: 10,
};

const SESSIONS_SEARCH_INITIAL = {
  ipAddress: "",
  startDate: "",
  endDate: "",
  pageNumber: 1,
  pageSize: 10,
};

/**
 * Admin Reports - User Activity Report (item 1 of
 * API_Changes/2026-08-11_admin_reports_all_apis.md, "already existed, no
 * change" on the backend). GetUserSessionWiseActivity only ever returns
 * one employee's sessions at a time - there's no system-wide list - so
 * this page is: search/pick an employee, then view that employee's
 * sessions (reusing exactly what Manage Users' own Session Wise Activity
 * screen already uses).
 */
const UserActivityReport = () => {
  const navigate = useNavigate();
  const { callApi } = useApi();
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();

  const {
    viewActionSessionWiseModal,
    setViewActionSessionWiseModal,
    setViewActionSessionWiseModalData,
  } = useGlobalModal();

  const hasFetchedEmployees = useRef(false);
  const employeeTableScrollRef = useRef(null);
  const sessionsTableScrollRef = useRef(null);

  // -------------------- Local State --------------------
  const [step, setStep] = useState("search"); // "search" | "sessions"
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [employeeSearch, setEmployeeSearch] = useState(EMPLOYEE_SEARCH_INITIAL);
  const [employeeNameInput, setEmployeeNameInput] = useState("");
  const [departmentNameInput, setDepartmentNameInput] = useState("");
  const [employeeSortedInfo, setEmployeeSortedInfo] = useState({});
  const [employeeLoadingMore, setEmployeeLoadingMore] = useState(false);
  const [employeeData, setEmployeeData] = useState({
    records: [],
    totalRecordsDataBase: 0,
    totalRecordsTable: 0,
  });

  const [sessionsSearch, setSessionsSearch] = useState(SESSIONS_SEARCH_INITIAL);
  const [sessionsSortedInfo, setSessionsSortedInfo] = useState({});
  const [sessionsLoadingMore, setSessionsLoadingMore] = useState(false);
  const [sessionsData, setSessionsData] = useState({
    records: [],
    totalRecordsDataBase: 0,
    totalRecordsTable: 0,
  });

  // -------------------- Employee search --------------------

  const fetchEmployees = useCallback(
    async (requestData, replace = false, showLoaderFlag = true) => {
      if (!requestData) return;
      if (showLoaderFlag) showLoader(true);

      const res = await SearchManageUserListRequest({
        callApi,
        showNotification,
        showLoader,
        requestdata: requestData,
        navigate,
      });

      const mapped = mapEmployeeListData(res);
      if (!Array.isArray(mapped)) return;

      setEmployeeData((prev) => ({
        records: replace ? mapped : [...(prev?.records || []), ...mapped],
        totalRecordsDataBase: res?.totalRecords || 0,
        totalRecordsTable: replace
          ? mapped.length
          : (prev?.totalRecordsTable || 0) + mapped.length,
      }));
      setEmployeeSearch((prev) => ({
        ...prev,
        pageNumber: replace ? 2 : (prev.pageNumber || 1) + 1,
      }));
    },
    [callApi, navigate, showLoader, showNotification]
  );

  useEffect(() => {
    if (hasFetchedEmployees.current) return;
    hasFetchedEmployees.current = true;
    fetchEmployees(buildEmployeeSearchRequest(EMPLOYEE_SEARCH_INITIAL), true, true);
  }, []);

  useTableScrollBottom(
    async () => {
      if (step !== "search") return;
      if (employeeData?.totalRecordsDataBase <= employeeData?.totalRecordsTable) return;

      try {
        setEmployeeLoadingMore(true);
        await fetchEmployees(buildEmployeeSearchRequest(employeeSearch), false, false);
      } catch (err) {
        console.error("Error loading more employees:", err);
      } finally {
        setEmployeeLoadingMore(false);
      }
    },
    0,
    "border-less-table-blue"
  );

  const handleEmployeeSearchClick = () => {
    const nextSearch = {
      ...EMPLOYEE_SEARCH_INITIAL,
      employeeName: employeeNameInput.trim(),
      departmentName: departmentNameInput.trim(),
    };
    setEmployeeSearch(nextSearch);
    fetchEmployees(buildEmployeeSearchRequest(nextSearch), true, true);
  };

  const handleEmployeeSearchReset = () => {
    setEmployeeNameInput("");
    setDepartmentNameInput("");
    setEmployeeSearch(EMPLOYEE_SEARCH_INITIAL);
    fetchEmployees(buildEmployeeSearchRequest(EMPLOYEE_SEARCH_INITIAL), true, true);
  };

  // -------------------- Sessions (per selected employee) --------------------

  const fetchSessions = useCallback(
    async (requestData, replace = false, showLoaderFlag = true) => {
      if (!requestData) return;
      if (showLoaderFlag) showLoader(true);

      const res = await GetUserSessionWiseActivity({
        callApi,
        showNotification,
        showLoader,
        requestdata: requestData,
        navigate,
      });

      const mapped = mapSessionListData(res);
      if (!Array.isArray(mapped)) return;

      setSessionsData((prev) => ({
        records: replace ? mapped : [...(prev?.records || []), ...mapped],
        totalRecordsDataBase: res?.totalRecords || 0,
        totalRecordsTable: replace
          ? mapped.length
          : (prev?.totalRecordsTable || 0) + mapped.length,
      }));
      setSessionsSearch((prev) => ({
        ...prev,
        pageNumber: replace ? 2 : (prev.pageNumber || 1) + 1,
      }));
    },
    [callApi, navigate, showLoader, showNotification]
  );

  useTableScrollBottom(
    async () => {
      if (step !== "sessions") return;
      if (sessionsData?.totalRecordsDataBase <= sessionsData?.totalRecordsTable) return;

      try {
        setSessionsLoadingMore(true);
        await fetchSessions(
          buildSessionsRequest(sessionsSearch, selectedEmployee?.employeeID),
          false,
          false
        );
      } catch (err) {
        console.error("Error loading more sessions:", err);
      } finally {
        setSessionsLoadingMore(false);
      }
    },
    0,
    "border-less-table-blue"
  );

  const handleViewSessions = (employee) => {
    setSelectedEmployee(employee);
    setStep("sessions");
    setSessionsSearch(SESSIONS_SEARCH_INITIAL);
    setSessionsData({ records: [], totalRecordsDataBase: 0, totalRecordsTable: 0 });
    fetchSessions(buildSessionsRequest(SESSIONS_SEARCH_INITIAL, employee.employeeID), true, true);
  };

  const handleBackToSearch = () => {
    setStep("search");
    setSelectedEmployee(null);
  };

  const handleViewActionModal = async (session) => {
    const res = await ViewUserSessionWiseActivity({
      callApi,
      showNotification,
      showLoader,
      requestdata: { SessionID: session.sessionID },
      navigate,
    });

    if (res?.result) {
      setViewActionSessionWiseModalData(res);
      setViewActionSessionWiseModal(true);
    } else {
      setViewActionSessionWiseModalData([]);
      setViewActionSessionWiseModal(false);
      showNotification({
        type: "warning",
        title: "No records found",
        description: "Against this session.",
      });
    }
  };

  // -------------------- Render --------------------

  if (step === "sessions") {
    const sessionColumns = getSessionListColumns({
      sortedInfo: sessionsSortedInfo,
      onViewActions: handleViewActionModal,
    });

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
                    <span onClick={handleBackToSearch} className={style.breadcrumbLink}>
                      User Activity Report
                    </span>
                  ),
                },
                {
                  title: (
                    <span className={style.breadcrumbText}>
                      Session wise Activity ({selectedEmployee?.employeeName})
                    </span>
                  ),
                },
              ]}
            />
          </Col>
        </Row>

        <PageLayout background="white" style={{ marginTop: "3px" }} className="repotsHeight">
          <div className="px-4 md:px-6 lg:px-8 ">
            <BorderlessTable
              rows={sessionsData?.records}
              columns={sessionColumns}
              classNameTable="border-less-table-blue"
              scroll={sessionsData?.records?.length ? { x: "max-content", y: 500 } : undefined}
              onChange={(pagination, filters, sorter) => setSessionsSortedInfo(sorter)}
              loading={sessionsLoadingMore}
              ref={sessionsTableScrollRef}
            />
          </div>
        </PageLayout>

        {viewActionSessionWiseModal && <ViewActionSessionWiseModal />}
      </>
    );
  }

  const employeeColumns = getEmployeeListColumns({
    sortedInfo: employeeSortedInfo,
    onViewSessions: handleViewSessions,
  });

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
              { title: <span className={style.breadcrumbText}>User Activity Report</span> },
            ]}
          />
        </Col>
      </Row>

      <Row gutter={[12, 12]} style={{ padding: "0 32px", marginBottom: 12 }}>
        <Col xs={24} sm={12} md={8}>
          <TextField
            label="Employee Name"
            name="employeeName"
            value={employeeNameInput}
            onChange={(e) => setEmployeeNameInput(removeFirstSpace(e.target.value))}
            placeholder="Employee Name"
            size="medium"
            classNames="Search-Field"
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <TextField
            label="Department Name"
            name="departmentName"
            value={departmentNameInput}
            onChange={(e) => setDepartmentNameInput(removeFirstSpace(e.target.value))}
            placeholder="Department Name"
            size="medium"
            classNames="Search-Field"
          />
        </Col>
        <Col
          xs={24}
          sm={24}
          md={8}
          style={{ display: "flex", alignItems: "flex-end", gap: 8 }}
        >
          <CustomButton
            onClick={handleEmployeeSearchReset}
            text="Reset"
            className="big-light-button"
          />
          <CustomButton
            onClick={handleEmployeeSearchClick}
            text="Search"
            className="big-dark-button"
          />
        </Col>
      </Row>

      <PageLayout background="white" style={{ marginTop: "3px" }} className="repotsHeight">
        <div className="px-4 md:px-6 lg:px-8 ">
          <BorderlessTable
            rows={employeeData?.records}
            columns={employeeColumns}
            classNameTable="border-less-table-blue"
            scroll={employeeData?.records?.length ? { x: "max-content", y: 500 } : undefined}
            onChange={(pagination, filters, sorter) => setEmployeeSortedInfo(sorter)}
            loading={employeeLoadingMore}
            ref={employeeTableScrollRef}
          />
        </div>
      </PageLayout>
    </>
  );
};

export default UserActivityReport;
