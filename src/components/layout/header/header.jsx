import { Layout, Row, Col } from "antd";
import ProfileDropdown from "../../dropdowns/profileDropdown/profileDropdown";
import NotificationDropdown from "../../dropdowns/notificationDropdown/notificationDropdown";
import Logo from "../../../assets/img/pad-logo-text.png";
import style from "./header.module.css";
import { useLocation, useNavigate } from "react-router-dom";
import { useSidebarContext } from "../../../context/sidebarContaxt";
import SearchWithFilter from "../../dropdowns/searchableDropedown/SearchWithPopoverOnly";

const { Header } = Layout;

const Headers = () => {
  const navigate = useNavigate();
  const { collapsed, setCollapsed, selectedKey, setSelectedKey } =
    useSidebarContext();
  const location = useLocation();

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
            onClick={() => {
              navigate("/PAD");
              setSelectedKey("");
            }}
            src={Logo}
            alt="logo"
            className={style["logo"]}
          />
        </Col>
        <Col xs={24} sm={24} md={24} lg={20}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={24} md={24} lg={16}>
              {location.pathname !== "/PAD" && <SearchWithFilter />}
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
