import { Layout, Row, Col } from "antd";
import ProfileDropdown from "../../dropdowns/profileDropdown/profileDropdown";
import NotificationDropdown from "../../dropdowns/notificationDropdown/notificationDropdown";
import Logo from "../../../assets/img/pad-logo-text.png";
import style from "./header.module.css";
import { useLocation, useNavigate } from "react-router-dom";
import { useSidebarContext } from "../../../context/sidebarContaxt";
import SearchWithFilter from "../../dropdowns/searchableDropedown/SearchWithPopoverOnly";
import { useSearchBarContext } from "../../../context/SearchBarContaxt";
import { useMyAdmin } from "../../../context/AdminContext";
import { useMyApproval } from "../../../context/myApprovalContaxt";
import { useGlobalModal } from "../../../context/GlobalModalContext";
import { useEffect, useRef } from "react";

const { Header } = Layout;

const Headers = () => {
  const navigate = useNavigate();
  const { collapsed, setCollapsed, selectedKeyRef, setSelectedKey } =
    useSidebarContext();
  const { coTransactionSummaryReportViewDetailsFlag ,coTransactionSummaryReportViewDetailsFlagRef} = useMyApproval();

  const {
    openNewFormForAdminGropusAndPolicy,
    pageTypeForAdminGropusAndPolicy,
    pageTabesForAdminGropusAndPolicy,
  } = useMyAdmin();
  const location = useLocation();
  const currentPath = location.pathname;

  const { resetEmployeeMyApprovalSearch, resetLineManagerApprovalSearch } =
    useSearchBarContext();
  const { showViewDetailPageInTatOnHta } = useGlobalModal();

  const selectedKey = selectedKeyRef.current;

  const hideSearchKeys = ["0", "5", "8", "11", "14", "17", "20", "22", "50"];

  const shouldShowSearchWithFilter = () => {
    // 🔹 Default case
    if (!hideSearchKeys.includes(selectedKey)) {
      return true;
    }

    // 🔹 Key = 20 (Admin groups & policy)
    if (selectedKey === "20") {
      if (!openNewFormForAdminGropusAndPolicy) return true;
      if (
        openNewFormForAdminGropusAndPolicy &&
        pageTabesForAdminGropusAndPolicy !== 0
      ) {
        return true;
      }
      return false;
    }

    // 🔹 Key = 5
    if (
      selectedKey === "5" &&
      [
        "/PAD/reports/my-trade-approvals",
        "/PAD/reports/my-transactions",
        "/PAD/reports/my-trade-approvals-standing",
        "/PAD/reports/my-compliance-approvals",
      ].includes(currentPath)
    ) {
      return true;
    }

    // 🔹 Key = 8
    if (
      selectedKey === "8" &&
      [
        "/PAD/lm-reports/lm-pending-request",
        "/PAD/lm-reports/lm-tradeapproval-request",
      ].includes(currentPath)
    ) {
      return true;
    }

    // 🔹 Key = 11 (CO reports)
    if (
      selectedKey === "11" &&
      ([
        "/PAD/co-reports/co-date-wise-transaction-report",
        "/PAD/co-reports/co-overdue-verifications",
        "/PAD/co-reports/co-portfolio-history",
      ].includes(currentPath) ||
        (currentPath === "/PAD/co-reports/co-transactions-summary-report" &&
          coTransactionSummaryReportViewDetailsFlag))
    ) {
      return true;
    }

    // 🔹 Key = 14 (HTA)
    if (
      selectedKey === "14" &&
      ([
        "/PAD/hta-reports/hta-trade-approval-requests",
        "/PAD/hta-reports/hta-policy-breaches-reports",
        "/PAD/hta-reports/hta-pending-requests",
      ].includes(currentPath) ||
        (currentPath === "/PAD/hta-reports/hta-tat-reports" &&
          showViewDetailPageInTatOnHta))
    ) {
      return true;
    }

    // 🔹 Key = 17 (HCA)
    if (
      selectedKey === "17" &&
      [
        "/PAD/hca-reports/hca-overdue-verifications",
        "/PAD/hca-reports/hca-upload-portfolio",
        "/PAD/hca-reports/hca-date-wise-transaction-report",
      ].includes(currentPath)
    ) {
      return true;
    }

    // 🔹 Key = 23 (Admin)
    if (
      selectedKey === "23" &&
      [
        "/PAD/admin-reports/admin-policy-breaches-report",
        "/PAD/admin-reports/user-activity-report",
        "/PAD/admin-reports/admin-user-wise-compliance-report",
      ].includes(currentPath)
    ) {
      return true;
    }

    return false;
  };

  return (
    <Header className={style["custom-header"]}>
      <Row
        align="middle"
        justify="space-between"
        className={style["full-width-row"]}
      >
        {/* Left: Logo */}
        <Col xs={24} sm={24} md={24} lg={4} style={{ marginTop: 19.82 }}>
          <img
            draggable={false}
            onClick={() => {
              navigate("/PAD");
              setSelectedKey("0");
              resetEmployeeMyApprovalSearch();
              resetLineManagerApprovalSearch();
            }}
            src={Logo}
            alt="logo"
            className={style["logo"]}
          />
        </Col>
        <Col xs={24} sm={24} md={24} lg={20}>
          <Row gutter={[16, 16]}>
            {/* <Col xs={24} sm={24} md={24} lg={16}>
              {selectedKeyRef.current !== "0" &&
              selectedKeyRef.current !== "5" &&
              selectedKeyRef.current !== "8" &&
              selectedKeyRef.current !== "11" &&
              selectedKeyRef.current !== "14" &&
              selectedKeyRef.current !== "17" &&
              selectedKeyRef.current !== "50" &&
              selectedKeyRef.current !== "20" &&
              selectedKeyRef.current !== "22" ? (
                <SearchWithFilter />
              ) : selectedKeyRef.current === "20" &&
                !openNewFormForAdminGropusAndPolicy ? (
                <SearchWithFilter />
              ) : selectedKeyRef.current === "20" &&
                openNewFormForAdminGropusAndPolicy &&
                pageTabesForAdminGropusAndPolicy !== 0 ? (
                <SearchWithFilter />
              ) : (
                (selectedKeyRef.current === "5" &&
                  (currentPath === "/PAD/reports/my-trade-approvals" ||
                    currentPath === "/PAD/reports/my-transactions" ||
                    currentPath ===
                      "/PAD/reports/my-trade-approvals-standing" ||
                    currentPath === "/PAD/reports/my-compliance-approvals")) ||
                // Case 5: key = 8 and on pending request route
                (selectedKeyRef.current === "8" &&
                  (currentPath === "/PAD/lm-reports/lm-pending-request" ||
                    currentPath ===
                      "/PAD/lm-reports/lm-tradeapproval-request")) ||
                (selectedKeyRef.current === "11" &&
                  (currentPath ===
                    "/PAD/co-reports/co-date-wise-transaction-report" ||
                    currentPath ===
                      "/PAD/co-reports/co-overdue-verifications" ||
                    (currentPath ===
                      "/PAD/co-reports/co-transactions-summary-report" &&
                      coTransactionSummaryReportViewDetailsFlagRef.current) ||
                    currentPath === "/PAD/co-reports/co-portfolio-history")) ||
                (selectedKeyRef.current === "14" &&
                  (currentPath ===
                    "/PAD/hta-reports/hta-trade-approval-requests" ||
                    currentPath ===
                      "/PAD/hta-reports/hta-policy-breaches-reports" ||
                    currentPath === "/PAD/hta-reports/hta-pending-requests" ||
                    (currentPath === "/PAD/hta-reports/hta-tat-reports" &&
                      showViewDetailPageInTatOnHta === true))) ||
                (selectedKeyRef.current === "17" &&
                  (currentPath ===
                    "/PAD/hca-reports/hca-overdue-verifications" ||
                    currentPath === "/PAD/hca-reports/hca-upload-portfolio" ||
                    currentPath ===
                      "/PAD/hca-reports/hca-date-wise-transaction-report")) ||
                (selectedKeyRef.current === "23" &&
                  (currentPath ===
                    "/PAD/admin-reports/admin-policy-breaches-report" ||
                    currentPath === "/PAD/admin-reports/user-activity-report" ||
                    currentPath ===
                      "/PAD/admin-reports/admin-user-wise-compliance-report") && (
                    <SearchWithFilter />
                  ))
              )}
            </Col> */}
            <Col xs={24} sm={24} md={24} lg={16}>
              {shouldShowSearchWithFilter() && <SearchWithFilter />}
            </Col>
            <Col xs={24} sm={10} md={2} lg={2}>
              <NotificationDropdown />
            </Col>
            <Col xs={24} sm={14} md={10} lg={6}>
              <ProfileDropdown />
            </Col>
          </Row>

          {/* </div> */}
        </Col>
      </Row>
    </Header>
  );
};

export default Headers;
