import { Layout } from "antd";
import SideBar from "../sidebar/sidebar";
import "./dashboard_module.css";
import Headers from "../header/header";
import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useMqttClient } from "../../../commen/mqtt/mqttConnection";

const { Content } = Layout;

const Dashboard = () => {
  const location = useLocation();
  const subscribeID = "TRADE";
  const userProfileData = JSON.parse(sessionStorage.getItem("user_profile_data"));
  let userID = userProfileData?.userID;
  const { connectToMqtt, isConnected } = useMqttClient({
    onMessageArrivedCallback: (data) => {
      console.log("onMessageArrivedCallback mqtt",data)
    },
    onConnectionLostCallback: () => {
      console.warn("MQTT disconnected inside feature");
    },
  });
  useEffect(() => {
    connectToMqtt({ subscribeID, userID });
  },[]);
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
