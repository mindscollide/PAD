import React, { useEffect, useState } from "react";
import { Typography, Row, Col } from "antd";
import styles from "./styles.module.css";
import { Button, SubmittedModal } from "../../../../components";
import PageLayout from "../../../../components/pageContainer/pageContainer";
import PendingApprovals from "./pendingApprovals/PendingApprovals";
import Portfolio from "./portfolio/Portfolio";
import { usePortfolioContext } from "../../../../context/portfolioContax";
import { useSearchBarContext } from "../../../../context/SearchBarContaxt";
import moment from "moment";
import UploadPortfolioModal from "./modal/uploadPortfolioModal/UploadPortfolioModal";
import { useNavigate } from "react-router-dom";
import { useGlobalModal } from "../../../../context/GlobalModalContext";

const { Title } = Typography;

const PortfolioIndex = () => {
  const navigate = useNavigate();

  // Contexts
  const {
    activeTab,
    setActiveTab,
    uploadPortfolioModal,
    setUploadPortfolioModal,
    aggregateTotalQuantity,
  } = usePortfolioContext();

  const {
    setEmployeePortfolioSearch,
    resetEmployeePortfolioSearch,
    setEmployeePendingApprovalSearch,
    resetEmployeePendingApprovalSearch,
  } = useSearchBarContext();

  const { isSubmit } = useGlobalModal();

  const isPortfolio = activeTab === "portfolio";

  // State to hold currently applied filters
  const [submittedFilters, setSubmittedFilters] = useState([]);

  // ✅ Cleanup all states + locals when page unmounts
  useEffect(() => {
    return () => {
      resetEmployeePortfolioSearch();
      resetEmployeePendingApprovalSearch();
      setActiveTab("portfolio"); // default back to portfolio
      setUploadPortfolioModal(false);
      setSubmittedFilters([]);

      // clear locals
      localStorage.removeItem("employeePortfolioSearch");
      localStorage.removeItem("employeePendingApprovalSearch");
    };
  }, []);

  // Format total quantity with commas
  const formattedTotal = new Intl.NumberFormat("en-US").format(
    aggregateTotalQuantity || 0
  );

  // Decide color based on sign
  const totalColor = Number(aggregateTotalQuantity) < 0 ? "#A50000" : "#00640A";

  // 🔹 Click handler for Portfolio tab
  const handlePortfolioClick = () => {
    setActiveTab("portfolio");
    resetEmployeePendingApprovalSearch();
  };

  // 🔹 Click handler for Pending Approvals tab
  const handlePendingClick = () => {
    resetEmployeePortfolioSearch();
    setActiveTab("pending");
  };

  return (
    <>
      <PageLayout background="white">
        {/* Header section with tab switcher and action buttons */}
        <Row justify="space-between" align="middle" className={styles.header}>
          {/* Tabs for Portfolio and Pending */}
          <Col>
            <div className={styles.tabWrapper}>
              <div className={styles.tabButtons}>
                <div
                  className={styles.tabButton}
                  onClick={handlePortfolioClick}
                >
                  <Button
                    type="text"
                    className={
                      isPortfolio
                        ? "only-tex-selected"
                        : "only-tex-not-selected"
                    }
                    text="Portfolio"
                  />
                </div>
                <div className={styles.tabButton} onClick={handlePendingClick}>
                  <Button
                    type="text"
                    className={
                      !isPortfolio
                        ? "only-tex-selected"
                        : "only-tex-not-selected"
                    }
                    text="Pending Approvals"
                  />
                </div>

                {/* Animated underline */}
                <div
                  className={
                    isPortfolio
                      ? styles.underlinePortfolio
                      : styles.underlinePending
                  }
                  style={{
                    transform: isPortfolio
                      ? "translateX(0%)"
                      : "translateX(100%)",
                  }}
                />
              </div>
            </div>
          </Col>

          {/* Totals and action buttons */}
          <Col>
            <div className={styles.actions}>
              <div className={styles.totalWrapper}>
                <Title level={5} className={styles.total}>
                  Total:{" "}
                  <span
                    className={styles.totalAmount}
                    style={{ color: totalColor }}
                  >
                    {formattedTotal}
                  </span>
                </Title>
              </div>
              <Button
                className={"large-dark-button"}
                text={" + Upload Portfolio"}
                onClick={() => setUploadPortfolioModal(true)}
              />
            </div>
          </Col>
        </Row>

        {/* Tab Content Area */}
        <div className={styles.content}>
          {isPortfolio ? (
            <Portfolio className={"profolio-employee-accordian"} />
          ) : (
            <PendingApprovals />
          )}
        </div>

        {isSubmit && <SubmittedModal />}
      </PageLayout>

      {/* Upload Portfolio Modal */}
      {uploadPortfolioModal && <UploadPortfolioModal />}
    </>
  );
};

export default PortfolioIndex;
