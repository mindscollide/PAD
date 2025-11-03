import React, { useEffect, useState } from "react";
import { Typography, Row, Col } from "antd";
import styles from "./styles.module.css";
import { Button, SubmittedModal } from "../../../../components";
import PageLayout from "../../../../components/pageContainer/pageContainer";
import PendingApprovals from "./pendingApprovals/PendingApprovals";
import Portfolio from "./portfolio/Portfolio";
import { usePortfolioContext } from "../../../../context/portfolioContax";
import { useSearchBarContext } from "../../../../context/SearchBarContaxt";
import UploadPortfolioModal from "./modal/uploadPortfolioModal/UploadPortfolioModal";
import { useGlobalModal } from "../../../../context/GlobalModalContext";
import { buildBrokerOptions } from "../../../../common/funtions/brokersList";
import { useDashboardContext } from "../../../../context/dashboardContaxt";

const { Title } = Typography;

const PortfolioIndex = () => {
  const { employeeBasedBrokersData } = useDashboardContext();
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
    employeePortfolioSearch,
    resetEmployeePortfolioSearch,
    setEmployeePendingApprovalSearch,
    employeePendingApprovalSearch,
    resetEmployeePendingApprovalSearch,
  } = useSearchBarContext();

  const { isSubmit } = useGlobalModal();

  const isPortfolio = activeTab === "portfolio";

  // ✅ Cleanup all states + locals when page unmounts
  useEffect(() => {
    return () => {
      resetEmployeePortfolioSearch();
      resetEmployeePendingApprovalSearch();
      setActiveTab("portfolio"); // default back to portfolio
      setUploadPortfolioModal(false);

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

  /** 🔹 Handle removing individual filter */
  const handleRemoveFilter = (key) => {
    const resetMap = {
      instrumentName: { instrumentName: "" },
      dateRange: { startDate: null, endDate: null },
      quantity: { quantity: 0 },
      brokerIDs: { brokerIDs: [] }, // ✅ both have brokerIDs
    };
    if (isPortfolio) {
      setEmployeePortfolioSearch((prev) => ({
        ...prev,
        ...resetMap[key],
        pageNumber: 0,
        filterTrigger: true,
      }));
    } else {
      setEmployeePendingApprovalSearch((prev) => ({
        ...prev,
        ...resetMap[key],
        pageNumber: 0,
        filterTrigger: true,
      }));
    }
  };

  /** 🔹 Handle removing all filters */
  const handleRemoveAllFilters = () => {
    if (isPortfolio) {
      setEmployeePortfolioSearch((prev) => ({
        ...prev,
        instrumentName: "",
        startDate: null,
        endDate: null,
        quantity: 0,
        brokerIDs: [], // ✅ clear brokerIDs for both
        pageNumber: 0,
        filterTrigger: true,
      }));
    } else {
      setEmployeePendingApprovalSearch((prev) => ({
        ...prev,
        instrumentName: "",
        startDate: null,
        endDate: null,
        quantity: 0,
        brokerIDs: [], // ✅ clear brokerIDs for both
        pageNumber: 0,
        filterTrigger: true,
      }));
    }
  };

  // 🔹 Broker options are needed for displaying broker labels
  const brokerOptions = buildBrokerOptions(employeeBasedBrokersData);

  /** 🔹 Build Active Filters */
  const activeFilters = (() => {
    const { instrumentName, startDate, endDate, quantity, brokerIDs } =
      isPortfolio
        ? employeePortfolioSearch || {}
        : employeePendingApprovalSearch || {};

    return [
      instrumentName && {
        key: "instrumentName",
        value:
          instrumentName.length > 13
            ? instrumentName.slice(0, 13) + "..."
            : instrumentName,
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
      brokerIDs?.length > 0 && {
        key: "brokerIDs",
        value:
          brokerIDs.length === 1
            ? (() => {
                const broker = brokerOptions.find(
                  (b) => b.value === brokerIDs[0]
                );
                if (!broker) return "";
                return broker.label.length > 13
                  ? broker.label.slice(0, 13) + "..."
                  : broker.label;
              })()
            : "Multiple",
      },
    ].filter(Boolean);
  })();

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
                  <span className={styles.totaltext}>Total: </span>
                  <span
                    className={styles.totalAmount}
                    style={{ color: totalColor }}
                  >
                    {formattedTotal}
                  </span>
                </Title>
              </div>
              <Button
                className={"large-dark-button-2"}
                text={" + Upload Portfolio"}
                onClick={() => setUploadPortfolioModal(true)}
              />
            </div>
          </Col>
        </Row>

        {/* Tab Content Area */}
        <div className={styles.content}>
          {isPortfolio ? (
            <Portfolio className={"profolio-employee-accordian"} activeFilters={activeFilters}/>
          ) : (
            <PendingApprovals activeFilters={activeFilters}/>
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
