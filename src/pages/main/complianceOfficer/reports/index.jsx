/**
 * 📌 ComplianceOfficerReportsIndex
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

import React, {
  useEffect,
  useRef,
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
import { GetComplianceOfficerReportsDashboardStatsAPI } from "../../../../api/myApprovalApi";
import style from "./compliance.module.css";
import { useMyApproval } from "../../../../context/myApprovalContaxt";

const ComplianceOfficerReportsIndex = () => {
  /* ---------------------------------------------------------
     🔹 External Hooks & Utilities
     --------------------------------------------------------- */
  const { callApi } = useApi();
  const { showLoader } = useGlobalLoader();
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  /** Prevent duplicate API calls on re-renders */
  const hasFetched = useRef(false);

  /** Memoized version of BoxCard to prevent unnecessary re-renders */
  const MemoizedBoxCard = React.memo(BoxCard);

  /* ---------------------------------------------------------
     🔹 Global Context: Compliance Officer Dashboard Data
     --------------------------------------------------------- */
  const { coReportsDashboardData, setCOReportsDashboardData } = useMyApproval();

  /* ---------------------------------------------------------
     🔹 Fetching Dashboard Data (Memoized)
     --------------------------------------------------------- */
  const fetchApi = useCallback(async () => {
    try {
      showLoader(true);

      const res = await GetComplianceOfficerReportsDashboardStatsAPI({
        callApi,
        showNotification,
        showLoader,
        navigate,
      });

      // Update global state
      await setCOReportsDashboardData(res || []);
      console.log("coReportsDashboardData", res);
    } catch (error) {
      console.error("Failed to fetch reports:", error);
      showNotification({
        title: "Error",
        description: "Failed to fetch compliance officer reports.",
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
    setCOReportsDashboardData,
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

  /** Date Wise Transactions */
  const coReportsComplianceDateWiseTransactions = useMemo(
    () => coReportsDashboardData?.dateWiseTransactions?.data || [],
    [coReportsDashboardData?.dateWiseTransactions?.data]
  );

  /** Transactions Summary */
  const coReportsTradeTransactionsSummary = useMemo(
    () => coReportsDashboardData?.transactionsSummary?.data || [],
    [coReportsDashboardData?.transactionsSummary?.data]
  );

  /** Overdue Verifications */
  const coReportsOverdueVerifications = useMemo(
    () => coReportsDashboardData?.overdueVerifications?.data || [],
    [coReportsDashboardData?.overdueVerifications?.data]
  );

  /** Portfolio History */
  const coReportsPortfolioHistory = useMemo(
    () => coReportsDashboardData?.portfolioHistory?.data || [],
    [coReportsDashboardData?.portfolioHistory?.data]
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
          {/* ---- Date Wise Transaction Report ---- */}
          <Col xs={12} md={8} lg={8}>
            <MemoizedBoxCard
              reportsFlag={true}
              locationStyle="up"
              title="Date Wise Transaction Report"
              mainClassName="reports"
              boxes={coReportsComplianceDateWiseTransactions}
              buttonId="Approvals-view-btn"
              buttonClassName="big-white-card-button"
              userRole="CO"
              route="co-date-wise-transaction-report"
            />
          </Col>

          {/* ---- Transaction Summary ---- */}
          <Col xs={12} md={8} lg={8}>
            <MemoizedBoxCard
              reportsFlag={true}
              locationStyle="up"
              title="Transactions Summary Report"
              mainClassName="reports"
              boxes={coReportsTradeTransactionsSummary}
              buttonId="Transactions-view-btn"
              buttonClassName="big-white-card-button"
              userRole="CO"
              route="co-transactions-summary-report"
            />
          </Col>

          {/* ---- Overdue Verifications ---- */}
          <Col xs={12} md={8} lg={8}>
            <MemoizedBoxCard
              reportsFlag={true}
              locationStyle="up"
              title="Overdue Verifications"
              mainClassName="reports"
              boxes={coReportsOverdueVerifications}
              buttonId="Transactions-view-btn"
              buttonClassName="big-white-card-button"
              userRole="CO"
              route="co-overdue-verifications"
            />
          </Col>
        </Row>

        {/* ========== Second Row Reports ========== */}
        <Row gutter={[16, 16]}>
          {/* ---- Portfolio History ---- */}
          <Col xs={12} md={8} lg={8}>
            <MemoizedBoxCard
              reportsFlag={true}
              locationStyle="up"
              title="Portfolio History"
              mainClassName="reports"
              boxes={coReportsPortfolioHistory}
              buttonId="Transactions-view-btn"
              buttonClassName="big-white-card-button"
              userRole="CO"
              route="co-portfolio-history"
            />
          </Col>
        </Row>
      </div>
    </>
  );
};

export default ComplianceOfficerReportsIndex;
