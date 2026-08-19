import React, { useEffect, useRef, useCallback, useMemo } from "react";
import { Col, Row } from "antd";
import { BoxCard } from "../../../../components";
import { useApi } from "../../../../context/ApiContext";
import { useGlobalLoader } from "../../../../context/LoaderContext";
import { useNotification } from "../../../../components/NotificationProvider/NotificationProvider";
import { useNavigate } from "react-router-dom";
import { GetHTAReportsDashboardStatsAPI } from "../../../../api/myApprovalApi";
import style from "./lineManager.module.css";
import { useMyApproval } from "../../../../context/myApprovalContaxt";

/**
 * 📌 HTAReportsIndex
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
const HTAReportsIndex = () => {
  const { callApi } = useApi();
  const { showLoader } = useGlobalLoader();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const hasFetched = useRef(false);

  const MemoizedBoxCard = React.memo(BoxCard);

  const { htaReportsDashboardData, setHTAReportsDashboardData } =
    useMyApproval();

  /**
   * 🔹 Fetch dashboard data (Memoized)
   */
  const fetchApi = useCallback(async () => {
    try {
      showLoader(true);

      const res = await GetHTAReportsDashboardStatsAPI({
        callApi,
        showNotification,
        showLoader,
        navigate,
      });

      // Apply role-based filtering here if needed
      await setHTAReportsDashboardData(res || []);
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

  // policyBreaches
  const policyBreaches = useMemo(
    () => htaReportsDashboardData?.policyBreaches?.data || [],
    [htaReportsDashboardData?.policyBreaches?.data]
  );

  // tradeApprovalRequest
  const tradeApprovalRequest = useMemo(
    () => htaReportsDashboardData?.tradeApprovalRequest?.data || [],
    [htaReportsDashboardData?.tradeApprovalRequest?.data]
  );

  // tradeApprovalRequest
  const tatRequestApprovals = useMemo(
    () => htaReportsDashboardData?.tatRequestApprovals?.data || [],
    [htaReportsDashboardData?.tatRequestApprovals?.data]
  );
  // pendingRequest
  const pendingRequest = useMemo(
    () => htaReportsDashboardData?.pendingRequest?.data || [],
    [htaReportsDashboardData?.pendingRequest?.data]
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
          {/* ---- Policy Breaches ---- */}
          <Col xs={12} md={12} lg={12}>
            <MemoizedBoxCard
              reportsFlag={true}
              locationStyle="up"
              title="Policy Breaches"
              mainClassName="reports"
              boxes={policyBreaches}
              userRole="HTA"
              route="hta-policy-breaches-reports"
            />
          </Col>

          {/* ---- Trade Approval Requests ---- */}
          <Col xs={12} md={12} lg={12}>
            <MemoizedBoxCard
              reportsFlag={true}
              locationStyle="up"
              title="Trade Approval Requests"
              mainClassName="reports"
              boxes={tradeApprovalRequest}
              userRole="HTA"
              route="hta-trade-approval-requests"
            />
          </Col>

          {/* ---- TAT Request Approvals ---- */}
          <Col xs={12} md={12} lg={12}>
            <MemoizedBoxCard
              reportsFlag={true}
              locationStyle="up"
              title="TAT Request Approvals"
              mainClassName="reports"
              boxes={tatRequestApprovals}
              userRole="HTA"
              route="hta-tat-reports"
            />
          </Col>

          {/* ---- Pending Requests ---- */}
          <Col xs={12} md={12} lg={12}>
            <MemoizedBoxCard
              reportsFlag={true}
              locationStyle="up"
              title="Pending Requests"
              mainClassName="reports"
              boxes={pendingRequest}
              userRole="HTA"
              route="hta-pending-requests"
            />
          </Col>
        </Row>
      </div>
    </>
  );
};

export default HTAReportsIndex;
