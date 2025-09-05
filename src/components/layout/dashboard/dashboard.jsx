import { Layout } from "antd";
import SideBar from "../sidebar/sidebar";
import "./dashboard_module.css";
import Headers from "../header/header";
import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useMqttClient } from "../../../commen/mqtt/mqttConnection";
import { useMyApproval } from "../../../context/myApprovalContaxt";
import { useDashboardContext } from "../../../context/dashboardContaxt";

const { Content } = Layout;

const Dashboard = () => {
  const location = useLocation();
  const { setIsEmployeeMyApproval, setLineManagerApproval } = useMyApproval();
  const { setDashboardData } = useDashboardContext();
  const subscribeID = "PAD_TRADE";
  const userProfileData = JSON.parse(
    sessionStorage.getItem("user_profile_data")
  );
  const userAssignedRolesData = JSON.parse(
    sessionStorage.getItem("user_assigned_roles")
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
        const { receiverID, message, payload, roleIDs } = data;
        const currentUserId = userID; // 👈 replace with actual source

        // ✅ Only process if receiverID is an array and includes current user
        // if (!Array.isArray(receiverID) || !receiverID.includes(currentUserId)) {
        //   console.log("MQTT: Message not intended for this user", data);
        //   return;
        // }

        switch (message) {
          case "NEW_TRADE_APPROVAL_REQUEST": {
            if (payload) {
              setIsEmployeeMyApproval((prev) => ({
                ...prev,
                approvals: [payload, ...(prev.approvals || [])], // prepend
                totalRecords: (prev.totalRecords || 0) + 1, // increment safely
              }));

              setLineManagerApproval((prev) => ({
                ...prev,
                lineApprovals: [payload, ...(prev.lineApprovals || [])], // prepend
                totalRecords: (prev.totalRecords || 0) + 1, // increment safely
              }));
              console.log(
                "MQTT: NEW_TRADE_APPROVAL_REQUEST → payload",
                payload
              );
            } else {
              console.warn(
                "MQTT: Missing payload in NEW_TRADE_APPROVAL_REQUEST"
              );
            }
            break;
          }

          case "USER_DASHBOARD_DATA": {
            console.log("MQTT: USER_DASHBOARD_DATA", data);
            console.log(
              "MQTT: USER_DASHBOARD_DATA userAssignedRolesData",
              userAssignedRolesData
            );

            // Ensure roleIDs is valid and check against assigned roles
            const hasRole =
              !!data?.roleIDs &&
              Array.isArray(userAssignedRolesData) &&
              userAssignedRolesData.some(
                (role) => role.roleID === Number(data.roleIDs)
              );
            console.log(
              "MQTT: Authorized USER_DASHBOARD_DATA → hasRole",
              hasRole
            );
            if (hasRole) {
              console.log(
                "MQTT: Authorized USER_DASHBOARD_DATA → roleID",
                roleIDs
              );
              switch (roleIDs) {
                case "1": // Example: Admin
                  console.log("MQTT: Handling Admin dashboard update");
                  // do state updates for Admin
                  break;

                case "2": // Example: Employee
                  console.log("MQTT: Handling Employee dashboard update");
                  setDashboardData((prev) => {
                    if (!prev?.employee) return prev; // safeguard

                    const updatedEmployee = { ...prev.employee };

                    // loop through mqtt keys
                    Object.keys(payload).forEach((key) => {
                      if (payload[key] !== null) {
                        updatedEmployee[key] = payload[key]; // replace only non-null values
                      }
                    });

                    return {
                      ...prev,
                      employee: updatedEmployee,
                    };
                  });

                  // do state updates for Employee
                  break;

                case "3": // Example: Line Manager
                  console.log("MQTT: Handling Line Manager dashboard update");
                  setDashboardData((prev) => {
                    if (!prev?.lineManager) return prev; // safeguard

                    const updatedLineManager = { ...prev.lineManager };
                    console.log(
                      "MQTT : updatedLineManager",
                      updatedLineManager
                    );
                    // loop through mqtt keys
                    Object.keys(payload).forEach((key) => {
                      if (payload[key] !== null) {
                        updatedLineManager[key] = payload[key]; // replace only non-null values
                      }
                    });

                    return {
                      ...prev,
                      lineManager: updatedLineManager,
                    };
                  });
                  // do state updates for Manager
                  break;

                default:
                  console.warn(
                    "MQTT: Authorized roleID but no handler defined →",
                    roleIDs
                  );
                  break;
              }
              // ✅ do state updates here
            } else {
              console.warn(
                "MQTT: Missing or unauthorized roleID in USER_DASHBOARD_DATA",
                roleIDs
              );
            }
            break;
          }

          default:
            console.warn("MQTT: No handler for message →", message);
            break;
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
