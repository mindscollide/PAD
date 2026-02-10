/**
 * 📌 AdminReportsIndex
 * ---------------------------------------------------------
 * This component loads and displays all Compliance Officer
 * Dashboard Reports, including:
 *
 *  ▪ Date-wise Transactions
 *  ▪ Transaction Summary
 *  ▪ Overdue Verifications
 *  ▪ Portfolio History
 *
 * 🔥 Features:
 *  - API-driven report loading (GetComplianceOfficerReportsDashboardStatsAPI)
 *  - Memoized report card list rendering (BoxCard)
 *  - Loader and notifications integrated
 *  - Prevents duplicate API calls using useRef
 *  - Memoized data slices for performance optimization
 */

import React, { useEffect, useRef, useCallback, useMemo } from "react";
import { Col, Row } from "antd";
import { BoxCard } from "../../../components";
import { useApi } from "../../../context/ApiContext";
import { useGlobalLoader } from "../../../context/LoaderContext";
import { useNotification } from "../../../components/NotificationProvider/NotificationProvider";
import { Outlet, useNavigate } from "react-router-dom";
import {
  GetComplianceOfficerReportsDashboardStatsAPI,
  GetHOCReportsDashboardStatsAPI,
} from "../../../api/myApprovalApi";
import style from "./adminReport.module.css";
import { useMyApproval } from "../../../context/myApprovalContaxt";
import { useSidebarContext } from "../../../context/sidebarContaxt";

const AdminReportsIndex = () => {
  /* ---------------------------------------------------------
     🔹 External Hooks & Utilities
     --------------------------------------------------------- */
  const { callApi } = useApi();
  const { showLoader } = useGlobalLoader();
  const { showNotification } = useNotification();
  const { selectedKey } = useSidebarContext();

  console.log(selectedKey, "selectedKeyselectedKey");

  const navigate = useNavigate();

  /** Prevent duplicate API calls on re-renders */
  const hasFetched = useRef(false);

  /** Memoized version of BoxCard to prevent unnecessary re-renders */
  const MemoizedBoxCard = React.memo(BoxCard);

  /* ---------------------------------------------------------
     🔹 Global Context: Compliance Officer Dashboard Data
     --------------------------------------------------------- */
  const { adminReportsDashboardData, setAdminReportsDashboardData } =
    useMyApproval();

  /* ---------------------------------------------------------
     🔹 Fetching Dashboard Data (Memoized)
     --------------------------------------------------------- */
  const fetchApi = useCallback(async () => {
    try {
      showLoader(true);

      const res = await GetHOCReportsDashboardStatsAPI({
        callApi,
        showNotification,
        showLoader,
        navigate,
      });

      // Update global state
      await setAdminReportsDashboardData(res || []);
      console.log("adminReportsDashboardData", res);
    } catch (error) {
      console.error("Failed to fetch reports:", error);
      showNotification({
        title: "Error",
        description: "Failed to fetch head of compliance officer reports.",
        type: "error",
      });
    } finally {
      showLoader(false);
    }
  }, [
    callApi,
    navigate,
    showLoader,
    showNotification,
    setAdminReportsDashboardData,
  ]);

  /* ---------------------------------------------------------
     🔹 Initial Load (Only Once)
     --------------------------------------------------------- */
  useEffect(() => {
    if (hasFetched.current) return; // Prevents duplicate API call
    hasFetched.current = true;

    fetchApi();
  }, [fetchApi]);

  /* ---------------------------------------------------------
     🔹 Extract Report Groups (Memoized for Performance)
     --------------------------------------------------------- */

  /** Admin User Activity Report */
  const adminUserActivityReports = useMemo(
    () => adminReportsDashboardData?.userActivityCount?.data || [],
    [adminReportsDashboardData?.userActivityCount?.data],
  );

  /** Admin User Wise Compliance Report */
  const adminUserWiseComplianceReport = useMemo(
    () => adminReportsDashboardData?.userWiseComplianceCount?.data || [],
    [adminReportsDashboardData?.userWiseComplianceCount?.data],
  );

  /** Admin Policy Breaches Report */
  const adminPolicyBreachesReport = useMemo(
    () => adminReportsDashboardData?.policyBreachesCount?.data || [],
    [adminReportsDashboardData?.policyBreachesCount?.data],
  );

  /** Admin Trade Approval Report*/
  const adminTradeApprovalReport = useMemo(
    () => adminReportsDashboardData?.tradeApprovalRequestCount?.data || [],
    [adminReportsDashboardData?.tradeApprovalRequestCount?.data],
  );

  /** Admin User-Wise Transaction Report*/
  const adminUserWiseTransactionReport = useMemo(
    () => adminReportsDashboardData?.userWiseTransactionCount?.data || [],
    [adminReportsDashboardData?.userWiseTransactionCount?.data],
  );

  /** Admin Date-Wise Transaction Report*/
  const adminDateWiseTransactionReport = useMemo(
    () => adminReportsDashboardData?.userDateTransactionCount?.data || [],
    [adminReportsDashboardData?.userDateTransactionCount?.data],
  );

  /** Compliance Standing Transaction Report Report*/
  const complianceStandingTransactionReport = useMemo(
    () =>
      adminReportsDashboardData?.complianceStandingTransactionCount?.data || [],
    [adminReportsDashboardData?.complianceStandingTransactionCount?.data],
  );

  /** TAT Request Approval Report*/
  const adminTatRequestApprovalReport = useMemo(
    () => adminReportsDashboardData?.tatRequestApprovalCount?.data || [],
    [adminReportsDashboardData?.tatRequestApprovalCount?.data],
  );

  /* ---------------------------------------------------------
     🔹 Render UI
     --------------------------------------------------------- */
  return (
    <>
      <div style={{ padding: "0px 38px" }}>
        {/* Header */}
        <Row>
          <Col>
            <h2 className={style.heading}>Reports</h2>
          </Col>
        </Row>

        {/* ========== First Row Reports ========== */}
        <Row gutter={[16, 16]}>
          {/* ---- User Activity Report ---- */}
          <Col xs={24} md={12} lg={12}>
            <MemoizedBoxCard
              reportsFlag={true}
              locationStyle="up"
              title="User Activity Report"
              mainClassName="reports"
              boxes={adminUserActivityReports}
              buttonId="Transactions-view-btn"
              buttonClassName="big-white-card-button"
              userRole="Admin"
              route="admin-user-activity-report"
            />
          </Col>
          {/* ---- User Wise Compliance Report ---- */}
          <Col xs={24} md={12} lg={12}>
            <MemoizedBoxCard
              reportsFlag={true}
              locationStyle="up"
              title="User Wise Compliance Report"
              mainClassName="reports"
              boxes={adminUserWiseComplianceReport}
              buttonId="Approvals-view-btn"
              buttonClassName="big-white-card-button"
              userRole="Admin"
              route="admin-user-wise-compliance-report"
            />
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          {/* ---- Policy Breaches Report ---- */}
          <Col xs={24} md={12} lg={12}>
            <MemoizedBoxCard
              reportsFlag={true}
              locationStyle="up"
              title="Policy Breaches"
              mainClassName="reports"
              boxes={adminPolicyBreachesReport}
              buttonId="Transactions-view-btn"
              buttonClassName="big-white-card-button"
              userRole="Admin"
              route="admin-policy-breaches-report"
            />
          </Col>
          {/* ---- Trade Approval Requests ---- */}
          <Col xs={24} md={12} lg={12}>
            <MemoizedBoxCard
              reportsFlag={true}
              locationStyle="up"
              title="Trade Approval Requests"
              mainClassName="reports"
              boxes={adminTradeApprovalReport}
              buttonId="Transactions-view-btn"
              buttonClassName="big-white-card-button"
              userRole="Admin"
              route="admin-trade-approval-report"
            />
          </Col>
        </Row>
        {/* ========== Second Row Reports ========== */}
        <Row gutter={[16, 16]}>
          {/* ---- Date Wise Transaction Report ---- */}
          <Col xs={24} md={12} lg={12}>
            <MemoizedBoxCard
              reportsFlag={true}
              locationStyle="up"
              title="Date Wise Transaction Report"
              mainClassName="reports"
              boxes={adminDateWiseTransactionReport}
              buttonId="Transactions-view-btn"
              buttonClassName="big-white-card-button"
              userRole="Admin"
              route="admin-date-wise-transaction-report"
            />
          </Col>

          {/* ---- Transactions Summary Report ---- */}
          <Col xs={24} md={12} lg={12}>
            <MemoizedBoxCard
              reportsFlag={true}
              locationStyle="up"
              title="Transactions Summary Report"
              mainClassName="reports"
              boxes={adminUserWiseTransactionReport}
              buttonId="Transactions-view-btn"
              buttonClassName="big-white-card-button"
              userRole="Admin"
              route="admin-transactions-summary-report"
            />
          </Col>
        </Row>

        {/* ========== Third Row Reports ========== */}
        <Row gutter={[16, 16]}>
          {/* ---- TAT Request Approvals Report ---- */}
          <Col xs={24} md={12} lg={12}>
            <MemoizedBoxCard
              reportsFlag={true}
              locationStyle="up"
              title="TAT Request Approvals"
              mainClassName="reports"
              boxes={adminTatRequestApprovalReport}
              buttonId="Transactions-view-btn"
              buttonClassName="big-white-card-button"
              userRole="Admin"
              route="admin-TAT-Request-report"
            />
          </Col>
          {/* ---- Trades Uploaded via Portfolio ---- */}
          <Col xs={24} md={12} lg={12}>
            <MemoizedBoxCard
              reportsFlag={true}
              locationStyle="up"
              title="Trades Uploaded via Portfolio"
              mainClassName="reports"
              boxes={complianceStandingTransactionReport}
              buttonId="Transactions-view-btn"
              buttonClassName="big-white-card-button"
              userRole="Admin"
              route="admin-trades-uploaded-via-portfolio-report"
            />
          </Col>
        </Row>
      </div>
    </>
  );
};

export default AdminReportsIndex;
