// src/pages/complianceOfficer/reconcile/ReconcileIndex.jsx

import React, { useEffect, useState } from "react";
import { Typography, Row, Col } from "antd";

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
  // ─── Context Hooks ─────────────────────────────────────────────
  const { activeTab, setActiveTab } = useReconcileContext();

  const {
    resetComplianceOfficerReconcileTransactionsSearch,
    resetComplianceOfficerReconcilePortfoliosSearch,
    setComplianceOfficerReconcileTransactionsSearch,
    complianceOfficerReconcileTransactionsSearch,
    setComplianceOfficerReconcilePortfolioSearch,
    complianceOfficerReconcilePortfolioSearch,
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

  /** 🔹 Handle removing individual filter */
  const handleRemoveFilter = (key) => {
    const resetMap = {
      instrumentName: { instrumentName: "" },
      requesterName: { requesterName: "" },
      dateRange: { startDate: null, endDate: null },
      quantity: { quantity: 0 },
    };
    if (isTransactions) {
      setComplianceOfficerReconcileTransactionsSearch((prev) => ({
        ...prev,
        ...resetMap[key],
        pageNumber: 0,
        filterTrigger: true,
      }));
    } else {
      setComplianceOfficerReconcilePortfolioSearch((prev) => ({
        ...prev,
        ...resetMap[key],
        pageNumber: 0,
        filterTrigger: true,
      }));
    }
  };

  /** 🔹 Handle removing all filters */
  const handleRemoveAllFilters = () => {
    if (isTransactions) {
      setComplianceOfficerReconcileTransactionsSearch((prev) => ({
        ...prev,
        instrumentName: "",
        requesterName: "",
        startDate: null,
        endDate: null,
        quantity: 0,
        pageNumber: 0,
        filterTrigger: true,
      }));
    } else {
      setComplianceOfficerReconcilePortfolioSearch((prev) => ({
        ...prev,
        instrumentName: "",
        requesterName: "",
        startDate: null,
        endDate: null,
        quantity: 0,
        pageNumber: 0,
        filterTrigger: true,
      }));
    }
  };

  /** 🔹 Build Active Filters */
  const activeFilters = (() => {
    const { instrumentName, startDate, endDate, quantity, requesterName } =
      isTransactions
        ? complianceOfficerReconcileTransactionsSearch || {}
        : complianceOfficerReconcilePortfolioSearch || {};

    return [
      instrumentName && {
        key: "instrumentName",
        value:
          instrumentName.length > 13
            ? instrumentName.slice(0, 13) + "..."
            : instrumentName,
      },
      requesterName && {
        key: "requesterName",
        value:
          requesterName.length > 13
            ? requesterName.slice(0, 13) + "..."
            : requesterName,
      },
      startDate &&
        endDate && {
          key: "dateRange",
          value: `${startDate} → ${endDate}`,
        },
      quantity &&
        Number(quantity) > 0 && {
          key: "quantity",
          value: Number(quantity).toLocaleString("en-US"),
        },
    ].filter(Boolean);
  })();

  // ─── Render ────────────────────────────────────────────────────
  return (
    <>
      {/* 🔹 Active Filter Tags */}
      {activeFilters.length > 0 && (
        <Row gutter={[12, 12]} className={styles["filter-tags-container"]}>
          {activeFilters.map(({ key, value }) => (
            <Col key={key}>
              <div className={styles["filter-tag"]}>
                <span>{value}</span>
                <span
                  className={styles["filter-tag-close"]}
                  onClick={() => handleRemoveFilter(key)}
                >
                  &times;
                </span>
              </div>
            </Col>
          ))}

          {/* 🔹 Show Clear All only if more than one filter */}
          {activeFilters.length > 1 && (
            <Col>
              <div
                className={`${styles["filter-tag"]} ${styles["clear-all-tag"]}`}
                onClick={handleRemoveAllFilters}
              >
                <span>Clear All</span>
              </div>
            </Col>
          )}
        </Row>
      )}
      <PageLayout
        background="white"
        className={activeFilters.length > 0 && "changeHeight"}
      >
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
              <ReconcileTransaction activeFilters={activeFilters}/>
            </div>
          ) : (
            <div className={styles.placeholder}>
              <ReconcilePortfolio activeFilters={activeFilters}/>
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
