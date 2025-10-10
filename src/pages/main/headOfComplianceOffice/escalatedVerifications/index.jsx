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
import EscalatedTransactionVerifications from "./escalatedVerification/reconcileTransaction";
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
    headOfComplianceApprovalEscalatedVerificationsSearch,
    setHeadOfComplianceApprovalEscalatedVerificationsSearch,
    resetHeadOfComplianceApprovalEscalatedVerificationsSearch,
    headOfComplianceApprovalPortfolioSearch,
    setHeadOfComplianceApprovalPortfolioSearch,
    resetHeadOfComplianceApprovalPortfolioSearch,
  } = useSearchBarContext();
  const { isSubmit } = useGlobalModal();

  // ─── Local States ──────────────────────────────────────────────
  const [submittedFilters, setSubmittedFilters] = useState([]); // Track applied filters (future use)
  const [uploadPortfolioModal, setUploadPortfolioModal] = useState(false); // Toggle Upload Portfolio modal

  // ─── Derived State ─────────────────────────────────────────────
  const isEscalatedVerification = activeTabHCO === "escalated";
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

  /** 🔹 Handle removing individual filter */
  const handleRemoveFilter = (key) => {
    const resetMap = {
      instrumentName: { instrumentName: "" },
      requesterName: { requesterName: "" },
      quantity: { quantity: 0 },
      dateRange: { escalatedDateFrom: null, requestDateTo: null },
      escalatedDateRange: { escalatedDateFrom: null, escalatedDateTo: null },
    };
    if (isEscalatedVerification) {
      setHeadOfComplianceApprovalEscalatedVerificationsSearch((prev) => ({
        ...prev,
        ...resetMap[key],
        pageNumber: 0,
        filterTrigger: true,
      }));
    } else {
      setHeadOfComplianceApprovalPortfolioSearch((prev) => ({
        ...prev,
        ...resetMap[key],
        pageNumber: 0,
        filterTrigger: true,
      }));
    }
  };

  /** 🔹 Handle removing all filters */
  const handleRemoveAllFilters = () => {
    if (isEscalatedVerification) {
      setHeadOfComplianceApprovalEscalatedVerificationsSearch((prev) => ({
        ...prev,
        instrumentName: "",
        requesterName: "",
        quantity: 0,
        requestDateFrom: null,
        requestDateTo: null,
        escalatedDateFrom: null,
        escalatedDateTo: null,
        pageNumber: 0,
        filterTrigger: true,
      }));
    } else {
      setHeadOfComplianceApprovalPortfolioSearch((prev) => ({
        ...prev,
        instrumentName: "",
        requesterName: "",
        quantity: 0,
        requestDateFrom: null,
        requestDateTo: null,
        escalatedDateFrom: null,
        escalatedDateTo: null,
        pageNumber: 0,
        filterTrigger: true,
      }));
    }
  };

  /** 🔹 Build Active Filters */
  const activeFilters = (() => {
    const {
      instrumentName,
      requesterName,
      quantity,
      requestDateFrom,
      requestDateTo,
      escalatedDateFrom,
      escalatedDateTo,
    } = isEscalatedVerification
      ? headOfComplianceApprovalEscalatedVerificationsSearch || {}
      : headOfComplianceApprovalPortfolioSearch || {};

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
      requestDateFrom &&
        requestDateTo && {
          key: "dateRange",
          value: `${requestDateFrom} → ${requestDateTo}`,
        },
      escalatedDateFrom &&
        escalatedDateTo && {
          key: "escalatedDateRange",
          value: `${escalatedDateFrom} → ${escalatedDateTo}`,
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
                {/* Tab: Escalated Verifications */}
                <div
                  className={styles.tabButton}
                  onClick={handleEscalationClick}
                >
                  <Button
                    type="text"
                    className={
                      isEscalatedVerification
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
                      !isEscalatedVerification
                        ? "only-tex-selected"
                        : "only-tex-not-selected"
                    }
                    text="Escalated Portfolio"
                  />
                </div>

                {/* Animated underline indicator */}
                <div
                  className={
                    isEscalatedVerification
                      ? styles.underlineTransactions
                      : styles.underlinePorfolio
                  }
                  style={{
                    transform: isEscalatedVerification
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
          {isEscalatedVerification ? (
            <div className={styles.placeholder}>
              <EscalatedTransactionVerifications
                activeFilters={activeFilters}
              />
            </div>
          ) : (
            <div className={styles.placeholder}>
              <ReconcilePortfolio activeFilters={activeFilters} />
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
