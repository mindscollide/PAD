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

const { Header } = Layout;

const Headers = () => {
  const navigate = useNavigate();
  const { collapsed, setCollapsed, selectedKeyRef, setSelectedKey } =
    useSidebarContext();
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
              selectedKeyRef.current !== "50" &&
              selectedKeyRef.current !== "20" &&
              selectedKeyRef.current !== "22" &&
              selectedKeyRef.current !== "8" ? (
                <SearchWithFilter />
              ) : selectedKeyRef.current === "20" &&
                !openNewFormForAdminGropusAndPolicy ? (
                <SearchWithFilter />
              ) : selectedKeyRef.current === "20" &&
                openNewFormForAdminGropusAndPolicy &&
                pageTabesForAdminGropusAndPolicy !== 0 ? (
                <SearchWithFilter />
              ) : (
                selectedKeyRef.current === "5" &&
                currentPath === "/PAD/reports/my-trade-approvals" && (
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
