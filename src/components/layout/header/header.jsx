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

const { Header } = Layout;

const Headers = () => {
  const navigate = useNavigate();
  const { collapsed, setCollapsed, selectedKeyRef, setSelectedKey } =
    useSidebarContext();
  const { coTransactionSummaryReportViewDetailsFlag } = useMyApproval();

  const {
    openNewFormForAdminGropusAndPolicy,
    pageTypeForAdminGropusAndPolicy,
    pageTabesForAdminGropusAndPolicy,
  } = useMyAdmin();
  const location = useLocation();
  const currentPath = location.pathname;

  const { resetEmployeeMyApprovalSearch, resetLineManagerApprovalSearch } =
    useSearchBarContext();

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
            <Col xs={24} sm={24} md={24} lg={16}>
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
                ((selectedKeyRef.current === "5" &&
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
                      currentPath ===
                        "/PAD/lm-reports/lm-tradeapproval-request" ||
                      coTransactionSummaryReportViewDetailsFlag)) ||
                  (selectedKeyRef.current === "17" &&
                    (currentPath ===
                      "/PAD/hca-reports/hca-overdue-verifications" ||
                      currentPath === "/PAD/hca-reports/hca-upload-portfolio" ||
                      coTransactionSummaryReportViewDetailsFlag))) && (
                  <SearchWithFilter />
                )
              )}
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
