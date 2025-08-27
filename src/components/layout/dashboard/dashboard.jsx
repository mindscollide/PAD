import { Layout } from "antd";
import SideBar from "../sidebar/sidebar";
import "./dashboard_module.css";
import Headers from "../header/header";
import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useMqttClient } from "../../../commen/mqtt/mqttConnection";
import { useMyApproval } from "../../../context/myApprovalContaxt";

const { Content } = Layout;

const Dashboard = () => {
  const location = useLocation();
  const { setIsEmployeeMyApproval } = useMyApproval();

  const subscribeID = "PAD_TRADE";
  const userProfileData = JSON.parse(
    sessionStorage.getItem("user_profile_data")
  );
  let userID = userProfileData?.userID;
  const { connectToMqtt, isConnected } = useMqttClient({
    onMessageArrivedCallback: (data) => {
      if (!data || !data.message) {
        console.warn("MQTT: Received invalid message", data);
        return;
      }

      console.log("MQTT: Message arrived →", data.message, data);

      try {
        const { receiverID } = data;
        const currentUserId = userID; // 👈 replace with your actual user ID source

        // ✅ Only process if currentUserId is in receiverID array
        if (Array.isArray(receiverID) && receiverID.includes(currentUserId)) {
          switch (data.message) {
            case "NEW_TRADE_APPROVAL_REQUEST":
              if (data.payload && receiverID.includes(2)) {
                setIsEmployeeMyApproval((prev) => ({
                  ...prev,
                  approvals: [data.payload, ...(prev.approvals || [])], // add new at the start
                  totalRecords: (prev.totalRecords || 0) + 1, // increment safely
                }));
                console.log(
                  "MQTT: NEW_TRADE_APPROVAL_REQUEST → payload",
                  data.payload
                );
              } else {
                console.warn(
                  "MQTT: Missing payload in NEW_TRADE_APPROVAL_REQUEST"
                );
              }
              break;

            // Example: you can easily add more message types here
            case "TRADE_UPDATED":
              console.log("MQTT: TRADE_UPDATED", data.payload);
              // do state updates here
              break;

            default:
              console.warn(
                "MQTT: No specific handler for message →",
                data.message
              );
              break;
          }
        }
      } catch (error) {
        console.error("MQTT: Error handling message", error, data);
      }
    },
    onConnectionLostCallback: () => {
      console.warn("MQTT disconnected inside feature");
    },
  });
  useEffect(() => {
    connectToMqtt({ subscribeID, userID });
  }, []);
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
