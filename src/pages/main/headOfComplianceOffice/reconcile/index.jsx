// src/pages/complianceOfficer/reconcile/ReconcileIndex.jsx

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
import ReconcileTransaction from "./transaction/reconcileTransaction";
import ReconcilePortfolio from "./portfolio/reconcilePortfolio";

const { Title } = Typography;

/**
 * 📌 ReconcileIndex
 *
 * Main landing page for the **Compliance Officer → Reconcile Module**.
 *
 * Features:
 * - Provides **tab navigation** between:
 *   - Reconcile Transactions
 *   - Reconcile Portfolio
 * - Handles **state cleanup** on unmount (search filters, context resets, localStorage cleanup).
 * - Displays **aggregate totals** (positive = green, negative = red).
 * - Integrates with global modals (e.g., submission success).
 * - Prepares hooks for future **Upload Portfolio modal** integration.
 *
 * @returns {JSX.Element} ReconcileIndex page component
 */
const ReconcileIndex = () => {
  const navigate = useNavigate();

  // ─── Context Hooks ─────────────────────────────────────────────
  const { activeTab, setActiveTab, aggregateTotalQuantity } =
    useReconcileContext();

  const {
    resetComplianceOfficerReconcileTransactionsSearch,
    resetComplianceOfficerReconcilePortfoliosSearch,
  } = useSearchBarContext();

  const { isSubmit } = useGlobalModal();

  // ─── Local States ──────────────────────────────────────────────
  const [submittedFilters, setSubmittedFilters] = useState([]); // Track applied filters (future use)
  const [uploadPortfolioModal, setUploadPortfolioModal] = useState(false); // Toggle Upload Portfolio modal

  // ─── Derived State ─────────────────────────────────────────────
  const isTransactions = activeTab === "transactions";

  // ─── Lifecycle: Cleanup ────────────────────────────────────────
  useEffect(() => {
    return () => {
      // Reset search filters
      resetComplianceOfficerReconcileTransactionsSearch();
      resetComplianceOfficerReconcilePortfoliosSearch();

      // Restore default active tab
      setActiveTab("transactions");

      // Clear local states
      setSubmittedFilters([]);

      // Remove any persisted filters from localStorage
      localStorage.removeItem("employeePortfolioSearch");
      localStorage.removeItem("employeePendingApprovalSearch");
    };
  }, []);

  // ─── Derived UI Values ─────────────────────────────────────────
  const formattedTotal = new Intl.NumberFormat("en-US").format(
    aggregateTotalQuantity || 0
  );

  const totalColor = Number(aggregateTotalQuantity) < 0 ? "#A50000" : "#00640A";

  // ─── Handlers ──────────────────────────────────────────────────
  /**
   * Switch to Reconcile Transactions tab
   */
  const handleTransactionsClick = () => {
    setActiveTab("transactions");
    resetComplianceOfficerReconcilePortfoliosSearch();
  };

  /**
   * Switch to Reconcile Portfolio tab
   */
  const handlePortfolioClick = () => {
    setActiveTab("portfolio");
    resetComplianceOfficerReconcileTransactionsSearch();
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
                {/* Tab: Reconcile Transactions */}
                <div
                  className={styles.tabButton}
                  onClick={handleTransactionsClick}
                >
                  <Button
                    type="text"
                    className={
                      isTransactions
                        ? "only-tex-selected"
                        : "only-tex-not-selected"
                    }
                    text="Reconcile Transactions"
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

export default ReconcileIndex;
