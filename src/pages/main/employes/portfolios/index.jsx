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
import { SearchEmployeePendingUploadedPortFolio } from "../../../../api/protFolioApi";
import { useApi } from "../../../../context/ApiContext";
import { useNotification } from "../../../../components/NotificationProvider/NotificationProvider";
import { useGlobalLoader } from "../../../../context/LoaderContext";
import { useNavigate } from "react-router-dom";
import { useGlobalModal } from "../../../../context/GlobalModalContext";

const { Title } = Typography;

const PortfolioIndex = () => {
  const navigate = useNavigate();
  // Contexts for tab state and search filters
  const {
    activeTab,
    setActiveTab,
    uploadPortfolioModal,
    setUploadPortfolioModal,
  } = usePortfolioContext();
  const {
    employeePortfolioSearch,
    setEmployeePortfolioSearch,
    resetEmployeePortfolioSearch,
    employeePendingApprovalSearch,
    setEmployeePendingApprovalSearch,
    resetEmployeePendingApprovalSearch,
  } = useSearchBarContext();

  const { isSubmit } = useGlobalModal();

  const { callApi } = useApi();
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();

  console.log(
    uploadPortfolioModal,
    isSubmit,
    activeTab,
    "uploadPortfolioModalChecker"
  );

  const isPortfolio = activeTab === "portfolio";

  // State to hold currently applied filters
  const [submittedFilters, setSubmittedFilters] = useState([]);

  // Hardcoded totals (can be made dynamic later)
  const totalPortfolio = "$4,910,000";
  const totalPending = "$2,340,000";

  // Filters with display labels
  const filterKeysPortfolio = [
    { key: "instrumentShortName", label: "Instrument" },
    { key: "mainInstrumentShortName", label: "Main Instrument" },
    { key: "quantity", label: "Quantity" },
    { key: "broker", label: "Broker" },
  ];
  const filterKeysPendingApproval = [
    { key: "instrumentName", label: "Instrument" },
    { key: "mainInstrumentName", label: "Main Instrument" },
    { key: "quantity", label: "Quantity" },
    { key: "broker", label: "Broker" },
  ];

  // Remove a specific filter from both state and context
  const handleRemoveFilter = (key) => {
    if (isPortfolio) {
      if (key === "dateRange") {
        setEmployeePortfolioSearch((prev) => ({
          ...prev,
          startDate: "",
          endDate: "",
        }));
      } else if (key === "broker") {
        setEmployeePortfolioSearch((prev) => ({
          ...prev,
          broker: [],
        }));
      } else {
        setEmployeePortfolioSearch((prev) => ({
          ...prev,
          [key]: "",
        }));
      }

      setSubmittedFilters((prev) => prev.filter((item) => item.key !== key));
    } else {
      if (key === "dateRange") {
        setEmployeePendingApprovalSearch((prev) => ({
          ...prev,
          startDate: "",
          endDate: "",
        }));
      } else if (key === "broker") {
        setEmployeePendingApprovalSearch((prev) => ({
          ...prev,
          broker: [],
        }));
      } else {
        setEmployeePendingApprovalSearch((prev) => ({
          ...prev,
          [key]: "",
        }));
      }

      setSubmittedFilters((prev) => prev.filter((item) => item.key !== key));
    }
  };

  // Update submittedFilters when the filter trigger is set
  useEffect(() => {
    if (isPortfolio && employeePortfolioSearch.filterTrigger) {
      const snapshot = [];
      // Handle all basic filters
      filterKeysPortfolio.forEach(({ key, label }) => {
        const value = employeePortfolioSearch[key];

        if (key === "broker" && Array.isArray(value) && value.length > 0) {
          snapshot.push({ key, label, value });
        } else if (value && key !== "broker") {
          snapshot.push({ key, label, value });
        }
      });

      // Handle combined date range filter
      const { startDate, endDate } = employeePortfolioSearch;
      if (startDate || endDate) {
        const formattedStart = startDate
          ? moment(startDate).format("YYYY-MM-DD")
          : "N/A";
        const formattedEnd = endDate
          ? moment(endDate).format("YYYY-MM-DD")
          : "N/A";

        snapshot.push({
          key: "dateRange",
          label: "Date Range",
          value: `${formattedStart} - ${formattedEnd}`,
        });
      }

      setSubmittedFilters(snapshot);

      // Reset trigger after processing
      setEmployeePortfolioSearch((prev) => ({
        ...prev,
        filterTrigger: false,
      }));
    }
  }, [employeePortfolioSearch.filterTrigger]);

  useEffect(() => {
    if (!isPortfolio && employeePendingApprovalSearch.filterTrigger) {
      const snapshot = [];

      // Handle all basic filters
      filterKeysPendingApproval.forEach(({ key, label }) => {
        const value =
          employeePendingApprovalSearch[key] !== undefined
            ? employeePendingApprovalSearch[key]
            : employeePendingApprovalSearch.key;

        if (key === "broker" && Array.isArray(value) && value.length > 0) {
          snapshot.push({ key, label, value });
        } else if (value && key !== "broker") {
          snapshot.push({ key, label, value });
        }
      });

      // Handle combined date range filter
      const { startDate, endDate } = employeePendingApprovalSearch;
      if (startDate || endDate) {
        const formattedStart = startDate
          ? moment(startDate).format("YYYY-MM-DD")
          : "N/A";
        const formattedEnd = endDate
          ? moment(endDate).format("YYYY-MM-DD")
          : "N/A";

        snapshot.push({
          key: "dateRange",
          label: "Date Range",
          value: `${formattedStart} - ${formattedEnd}`,
        });
      }
      setSubmittedFilters(snapshot);

      // Reset trigger after processing
      setEmployeePendingApprovalSearch((prev) => ({
        ...prev,
        filterTrigger: false,
      }));
    }
  }, [employeePendingApprovalSearch.filterTrigger]);

  // 🔹 Click handler for Portfolio tab
  const handlePortfolioClick = async () => {
    setActiveTab("portfolio");
    resetEmployeePendingApprovalSearch();

    // Example API call for Portfolio
    await SearchEmployeePendingUploadedPortFolio({
      callApi,
      showNotification,
      showLoader,
      requestdata: { type: "portfolio" }, // customize request body
      navigate,
    });
  };

  // 🔹 Click handler for Pending Approvals tab
  const handlePendingClick = async () => {
    resetEmployeePortfolioSearch();
    setActiveTab("pending");
  };

  return (
    <>
      {/* Display active filters as removable tags */}
      {submittedFilters.length > 0 && (
        <Row gutter={[12, 12]} className={styles["filter-tags-container"]}>
          {submittedFilters.map(({ key, label, value }) => (
            <Col key={key}>
              <div className={styles["filter-tag"]}>
                <span className={styles["filter-value"]}>{value}</span>
                <span
                  className={styles["filter-tag-close"]}
                  onClick={() => handleRemoveFilter(key)}
                >
                  &times;
                </span>
              </div>
            </Col>
          ))}
        </Row>
      )}

      {/* Page content */}
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

                {/* Animated underline to indicate selected tab */}
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
                  Total:
                  <span className={styles.totalAmount}>
                    {isPortfolio ? totalPortfolio : totalPending}
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

      {/* To Call the uplaod Portfolio Modal Here */}

      {uploadPortfolioModal && <UploadPortfolioModal />}
    </>
  );
};

export default PortfolioIndex;
