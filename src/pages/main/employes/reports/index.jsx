import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { Col, Row } from "antd";
import EmptyState from "../../../../components/emptyStates/empty-states";
import { BoxCard } from "../../../../components";
import { useApi } from "../../../../context/ApiContext";
import { useGlobalLoader } from "../../../../context/LoaderContext";
import { useNotification } from "../../../../components/NotificationProvider/NotificationProvider";
import { Outlet, useNavigate } from "react-router-dom";
import { GetEmployeeReportsDashboardStatsAPI } from "../../../../api/myApprovalApi";
import style from "./employee.module.css";
import { useMyApproval } from "../../../../context/myApprovalContaxt";

/**
 * 📌 EmpolyesReportsIndex
 *
 * This component displays Employee Dashboard Reports, including:
 * - My Approvals
 * - My Transactions
 * - My History
 * - Under Development fallback (when no data)
 *
 * 🔹 Behavior:
 * - Loads data once when the component mounts
 * - Uses API → GetEmployeeReportsDashboardStatsAPI
 * - Shows loader & notification on errors
 * - Memoizes BoxCard to avoid unnecessary re-renders
 */
const EmpolyesReportsIndex = () => {
  const { callApi } = useApi();
  const { showLoader } = useGlobalLoader();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const hasFetched = useRef(false);

  const MemoizedBoxCard = React.memo(BoxCard);

  const { employeeReportsDashboardData, setEmployeeReportsDashboardData } =
    useMyApproval();

  /**
   * 🔹 Fetch dashboard data (Memoized)
   */
  const fetchApi = useCallback(async () => {
    try {
      showLoader(true);

      const res = await GetEmployeeReportsDashboardStatsAPI({
        callApi,
        showNotification,
        showLoader,
        navigate,
      });

      // Apply role-based filtering here if needed
      await setEmployeeReportsDashboardData(res || []);
    } catch (error) {
      console.error("Failed to fetch reports:", error);
      showNotification({
        title: "Error",
        description: "Failed to fetch employee reports.",
        type: "error",
      });
    } finally {
      showLoader(false);
    }
  }, [callApi, navigate, showLoader, showNotification]);

  /**
   * 🔹 Initial Data Load
   */
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    fetchApi();
  }, [fetchApi]);

  // complianceStanding
  const employeeReportsComplianceStanding = useMemo(
    () => employeeReportsDashboardData?.myComplianceStanding?.data || [],
    [employeeReportsDashboardData?.myComplianceStanding?.data],
  );

  // tradeApprovals
  const employeeReportsTradeApprovals = useMemo(
    () => employeeReportsDashboardData?.myTradeApprovals?.data || [],
    [employeeReportsDashboardData?.myTradeApprovals?.data],
  );
  // tradeApprovalsStanding
  const employeeReportsTradeApprovalsStanding = useMemo(
    () => employeeReportsDashboardData?.myTradeApprovalsStanding?.data || [],
    [employeeReportsDashboardData?.myTradeApprovalsStanding?.data],
  );

  // transactions
  const employeeReportsTransactionsStanding = useMemo(
    () => employeeReportsDashboardData?.myTransactions?.data || [],
    [employeeReportsDashboardData?.myTransactions?.data],
  );

  /**
   * 🔹 Render UI
   */
  return (
    <>
      <div style={{ padding: " 0px 38px 0px 38px " }}>
        <Row>
          <Col>
            <h2 className={style.heading}>Reports</h2>
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          {/* ---- My Approvals ---- */}
          <Col xs={24} md={12} lg={12}>
            <MemoizedBoxCard
              reportsFlag={true}
              locationStyle="up"
              title="My Trade Approvals"
              mainClassName="reports"
              boxes={employeeReportsTradeApprovals}
              buttonId="Approvals-view-btn"
              buttonClassName="big-white-card-button"
              userRole="employee"
              route="my-trade-approvals"
            />
          </Col>

          {/* ---- My Trade Approvals Standing ---- */}
          <Col xs={24} md={12} lg={12}>
            <MemoizedBoxCard
              reportsFlag={true}
              showProgress={true}
              percentageText="Approved"
              locationStyle="up"
              title="My Trade Approvals Standing"
              mainClassName="reports"
              boxes={employeeReportsTradeApprovalsStanding}
              buttonId="Transactions-view-btn"
              buttonClassName="big-white-card-button"
              userRole="employee"
              route="my-trade-approvals-standing"
            />
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          {/* ---- My Transactions ---- */}
          <Col xs={24} md={12} lg={12}>
            <MemoizedBoxCard
              reportsFlag={true}
              locationStyle="up"
              title="My Transactions"
              mainClassName="reports"
              boxes={employeeReportsTransactionsStanding}
              buttonId="Transactions-view-btn"
              buttonClassName="big-white-card-button"
              userRole="employee"
              route="my-transactions"
            />
          </Col>

          {/* ---- My Compliance Standing ---- */}
          <Col xs={24} md={12} lg={12}>
            <MemoizedBoxCard
              reportsFlag={true}
              showProgress={true}
              percentageText="compliant"
              locationStyle="up"
              title="My Compliance Standing"
              mainClassName="reports"
              boxes={employeeReportsComplianceStanding}
              buttonId="Transactions-view-btn"
              buttonClassName="big-white-card-button"
              userRole="employee"
              route="my-compliance-approvals"
            />
          </Col>
        </Row>
      </div>
    </>
  );
};

export default EmpolyesReportsIndex;
