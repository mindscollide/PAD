/**
 * 📌 HeadOFComplianceApprovalReportsIndex
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
import EmptyState from "../../../../components/emptyStates/empty-states";
import { BoxCard } from "../../../../components";
import { useApi } from "../../../../context/ApiContext";
import { useGlobalLoader } from "../../../../context/LoaderContext";
import { useNotification } from "../../../../components/NotificationProvider/NotificationProvider";
import { Outlet, useNavigate } from "react-router-dom";
import {
  GetComplianceOfficerReportsDashboardStatsAPI,
  GetHOCReportsDashboardStatsAPI,
} from "../../../../api/myApprovalApi";
import style from "./compliance.module.css";
import { useMyApproval } from "../../../../context/myApprovalContaxt";

const HeadOFComplianceApprovalReportsIndex = () => {
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
  const { hcaReportsDashboardData, setHCAReportsDashboardData } =
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
      await setHCAReportsDashboardData(res || []);
      console.log("hcaReportsDashboardData", res);
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
    setHCAReportsDashboardData,
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
  const hcaReportsComplianceDateWiseTransactions = useMemo(
    () => hcaReportsDashboardData?.dateWiseTransactionCount?.data || [],
    [hcaReportsDashboardData?.dateWiseTransactionCount?.data]
  );

  /** Transactions Summary */
  const transactionSummary = useMemo(
    () => hcaReportsDashboardData?.transactionSummary?.data || [],
    [hcaReportsDashboardData?.transactionSummary?.data]
  );

  /** Overdue Verifications */
  const hcaReportsOverdueVerifications = useMemo(
    () => hcaReportsDashboardData?.overDueVerificationsCount?.data || [],
    [hcaReportsDashboardData?.overDueVerificationsCount?.data]
  );

  /** Portfolio History */
  const hcaReportsPortfolioHistory = useMemo(
    () => hcaReportsDashboardData?.uploadedPortfolioCount?.data || [],
    [hcaReportsDashboardData?.uploadedPortfolioCount?.data]
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
          {/* ---- Overdue Verifications ---- */}
          <Col xs={12} md={8} lg={8}>
            <MemoizedBoxCard
              reportsFlag={true}
              locationStyle="up"
              title="Overdue Verifications"
              mainClassName="reports"
              boxes={hcaReportsOverdueVerifications}
              buttonId="Transactions-view-btn"
              buttonClassName="big-white-card-button"
              userRole="HCA"
              route="hca-overdue-verifications"
            />
          </Col>
          {/* ---- Date Wise Transaction Report ---- */}
          <Col xs={12} md={8} lg={8}>
            <MemoizedBoxCard
              reportsFlag={true}
              locationStyle="up"
              title="Date Wise Transaction Report"
              mainClassName="reports"
              boxes={hcaReportsComplianceDateWiseTransactions}
              buttonId="Approvals-view-btn"
              buttonClassName="big-white-card-button"
              userRole="HCA"
              route="hca-date-wise-transaction-report"
            />
          </Col>
          {/* ---- Transaction Summary ---- */}
          <Col xs={12} md={8} lg={8}>
            <MemoizedBoxCard
              reportsFlag={true}
              locationStyle="up"
              title="Transactions Summary Report"
              mainClassName="reports"
              boxes={transactionSummary}
              buttonId="Transactions-view-btn"
              buttonClassName="big-white-card-button"
              userRole="HCA"
              route="hca-transactions-summary-report"
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
              title="Trades Uploaded via Portfolio"
              mainClassName="reports"
              boxes={hcaReportsPortfolioHistory}
              buttonId="Transactions-view-btn"
              buttonClassName="big-white-card-button"
              userRole="HCA"
              route="hca-upload-portfolio"
            />
          </Col>
        </Row>
      </div>
    </>
  );
};

export default HeadOFComplianceApprovalReportsIndex;
