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
import { useNavigate } from "react-router-dom";
import { GetEmployeeReportsDashboardStatsAPI, GetLineManagerReportDashBoard } from "../../../../api/myApprovalApi";
import style from "./lineManager.module.css";
import { useMyApproval } from "../../../../context/myApprovalContaxt";

/**
 * 📌 LineManagerReportsIndex
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
const LineManagerReportsIndex = () => {
  const { callApi } = useApi();
  const { showLoader } = useGlobalLoader();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const hasFetched = useRef(false);

  const MemoizedBoxCard = React.memo(BoxCard);

  const {
    lineManagerReportsDashboardData,
    setLineManagerReportsDashboardData,
  } = useMyApproval();

  /**
   * 🔹 Fetch dashboard data (Memoized)
   */
  const fetchApi = useCallback(async () => {
    try {
      showLoader(true);

      const res = await GetLineManagerReportDashBoard({
        callApi,
        showNotification,
        showLoader,
        navigate,
      });

      // Apply role-based filtering here if needed
      await setLineManagerReportsDashboardData(res || []);
      console.log("lineManagerReportsDashboardData", res);
      ß;
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
  const lineManagerReportsPendingRequests = useMemo(
    () => lineManagerReportsDashboardData?.pendingApprovals?.data || [],
    [lineManagerReportsDashboardData?.pendingApprovals?.data]
  );

  // tradeApprovals
  const lineManagerReportTradeApprovalRequests = useMemo(
    () => lineManagerReportsDashboardData?.tradeApprovalsRequests?.data || [],
    [lineManagerReportsDashboardData?.tradeApprovalsRequests?.data]
  );
  console.log("lineManagerReportTradeApprovalRequests", lineManagerReportTradeApprovalRequests);


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
          <Col xs={12} md={8} lg={8}>
            <MemoizedBoxCard
              reportsFlag={true}
              locationStyle="up"
              title="Pending Requests"
              mainClassName="reports"
              boxes={lineManagerReportsPendingRequests}
              userRole="LM"
              route="approvals"
            />
          </Col>

          {/* ---- My Transactions ---- */}
          <Col xs={12} md={8} lg={8}>
            <MemoizedBoxCard
              reportsFlag={true}
              locationStyle="up"
              title="Trade Approval Requests"
              mainClassName="reports"
              boxes={lineManagerReportTradeApprovalRequests}
              userRole="LM"
              route="transactions"
            />
          </Col>
        </Row>
      </div>
    </>
  );
};

export default LineManagerReportsIndex;
