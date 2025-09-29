// src/pages/complianceOfficer/reconcile/EscalatedTransactionsIndex.jsx

import React, { useEffect, useState } from "react";
import { Typography, Row, Col } from "antd";
import { useNavigate } from "react-router-dom";

// 🔹 Styles & Components
import styles from "./styles.module.css";
import PageLayout from "../../../../components/pageContainer/pageContainer";
import { Button, SubmittedModal } from "../../../../components";

// 🔹 Contexts
import { useSearchBarContext } from "../../../../context/SearchBarContaxt";
import { useGlobalModal } from "../../../../context/GlobalModalContext";
import { useReconcileContext } from "../../../../context/reconsileContax";
import ReconcileTransaction from "./escalatedVerification/reconcileTransaction";
import ReconcilePortfolio from "./reconcilePortfolio/reconcilePortfolio";

const { Title } = Typography;

/**
 * 📌 EscalatedTransactionsIndex
 *
 * Main landing page for the **Compliance Officer → Reconcile Module**.
 *
 * Features:
 * - Provides **tab navigation** between:
 *   - Escalated Verifications
 *   - Reconcile Portfolio
 * - Handles **state cleanup** on unmount (search filters, context resets, localStorage cleanup).
 * - Displays **aggregate totals** (positive = green, negative = red).
 * - Integrates with global modals (e.g., submission success).
 * - Prepares hooks for future **Upload Portfolio modal** integration.
 *
 * @returns {JSX.Element} EscalatedTransactionsIndex page component
 */
const EscalatedTransactionsIndex = () => {
  const navigate = useNavigate();

  // ─── Context Hooks ─────────────────────────────────────────────
  const { activeTabHCO, setActiveTabHCO } = useReconcileContext();

  const {
    resetHeadOfComplianceApprovalEscalatedVerificationsSearch,
    resetHeadOfComplianceApprovalPortfolioSearch,
  } = useSearchBarContext();
  const { isSubmit } = useGlobalModal();

  // ─── Local States ──────────────────────────────────────────────
  const [submittedFilters, setSubmittedFilters] = useState([]); // Track applied filters (future use)
  const [uploadPortfolioModal, setUploadPortfolioModal] = useState(false); // Toggle Upload Portfolio modal

  // ─── Derived State ─────────────────────────────────────────────
  const isTransactions = activeTabHCO === "escalated";

  // ─── Lifecycle: Cleanup ────────────────────────────────────────
  useEffect(() => {
    return () => {
      // Reset search filters
      resetHeadOfComplianceApprovalEscalatedVerificationsSearch();
      resetHeadOfComplianceApprovalPortfolioSearch();

      // Restore default active tab
      setActiveTabHCO("escalated");

      // Clear local states
      setSubmittedFilters([]);

      // Remove any persisted filters from localStorage
      localStorage.removeItem("employeePortfolioSearch");
      localStorage.removeItem("employeePendingApprovalSearch");
    };
  }, []);

  // ─── Handlers ──────────────────────────────────────────────────
  /**
   * Switch to Escalated Verifications tab
   */
  const handleEscalationClick = () => {
    setActiveTabHCO("escalated");
    resetHeadOfComplianceApprovalPortfolioSearch();
  };

  /**
   * Switch to Reconcile Portfolio tab
   */
  const handlePortfolioClick = () => {
    setActiveTabHCO("portfolio");
    resetHeadOfComplianceApprovalEscalatedVerificationsSearch();
  };

  // ─── Render ────────────────────────────────────────────────────
  return (
    <>
      <PageLayout background="white">
        {/* ─── Header Section: Tabs + Totals + Actions ─────────────── */}
        <Row justify="space-between" align="middle" className={styles.header}>
          {/* ─── Tabs ───────────────────────────── */}
          <Col>
            <div className={styles.tabWrapper}>
              <div className={styles.tabButtons}>
                {/* Tab: Escalated Verifications */}
                <div
                  className={styles.tabButton}
                  onClick={handleEscalationClick}
                >
                  <Button
                    type="text"
                    className={
                      isTransactions
                        ? "only-tex-selected"
                        : "only-tex-not-selected"
                    }
                    text="Escalated Verifications"
                  />
                </div>

                {/* Tab: Reconcile Portfolio */}
                <div
                  className={styles.tabButton}
                  onClick={handlePortfolioClick}
                >
                  <Button
                    type="text"
                    className={
                      !isTransactions
                        ? "only-tex-selected"
                        : "only-tex-not-selected"
                    }
                    text="Reconcile Portfolio"
                  />
                </div>

                {/* Animated underline indicator */}
                <div
                  className={
                    isTransactions
                      ? styles.underlineTransactions
                      : styles.underlinePorfolio
                  }
                  style={{
                    transform: isTransactions
                      ? "translateX(0%)"
                      : "translateX(100%)",
                  }}
                />
              </div>
            </div>
          </Col>
        </Row>

        {/* ─── Content Section ────────────────────────────────────── */}
        <div className={styles.content}>
          {isTransactions ? (
            <div className={styles.placeholder}>
              <ReconcileTransaction />
            </div>
          ) : (
            <div className={styles.placeholder}>
              <ReconcilePortfolio />
            </div>
          )}
        </div>

        {/* ─── Submitted Success Modal ───────────────────────────── */}
        {isSubmit && <SubmittedModal />}
      </PageLayout>

      {/* ─── Upload Portfolio Modal (future integration) ─────────── */}
      {uploadPortfolioModal && (
        <div className={styles.modalPlaceholder}>
          UploadPortfolioModal goes here...
        </div>
      )}
    </>
  );
};

export default EscalatedTransactionsIndex;
