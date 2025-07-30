import { Layout } from "antd";
import SideBar from "../sidebar/sidebar";
import "./dashboard_module.css";
import Headers from "../header/header";
import { Outlet, useLocation } from "react-router-dom";

const { Content } = Layout;

const Dashboard = () => {
  const location = useLocation();

  // Get page-specific class based on route
  const getContentClass = () => {
    if (location.pathname === "/PAD") return "pad_content";
    return "pad_content";
  };
  return (
    <Layout style={{ minHeight: "100vh", maxHeight: "100vh" }}>
      <SideBar />
      <Layout className="layout-content-area">
        <Headers />
        <Content prefixCls={getContentClass()}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default Dashboard;
