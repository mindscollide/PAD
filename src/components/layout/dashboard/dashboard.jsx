// src/components/dashboard/Dashboard.jsx
import { Layout } from "antd";
import SideBar from "../sidebar/sidebar";
import "./dashboard_module.css";
import Headers from "../header/header";
import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";

// Contexts
import { useMqttClient } from "../../../commen/mqtt/mqttConnection";
import { useMyApproval } from "../../../context/myApprovalContaxt";
import { useDashboardContext } from "../../../context/dashboardContaxt";
import { usePortfolioContext } from "../../../context/portfolioContax";
import { useTransaction } from "../../../context/myTransaction";

const { Content } = Layout;

const Dashboard = () => {
  const location = useLocation();

  // Context hooks
  const { setIsEmployeeMyApproval } = useMyApproval();
  const { setEmployeePendingApprovalsDataMqtt } = usePortfolioContext();
  const { setDashboardData } = useDashboardContext();
  const { setEmployeeTransactionsData } = useTransaction();

  // Subscription channel
  const subscribeID = "PAD_TRADE";

  // User info from session storage
  const userProfileData = JSON.parse(
    sessionStorage.getItem("user_profile_data")
  );
  const userAssignedRolesData = JSON.parse(
    sessionStorage.getItem("user_assigned_roles")
  );
  const currentUserId = userProfileData?.userID;

  /**
   * ✅ Utility: check if current user has required role(s)
   */
  const hasUserRole = (roleIDs) => {
    if (!roleIDs || !Array.isArray(userAssignedRolesData)) return false;

    const roleArray = Array.isArray(roleIDs) ? roleIDs : [roleIDs];

    return userAssignedRolesData.some((role) =>
      roleArray.includes(Number(role.roleID))
    );
  };

  /**
   * ✅ Utility: check if current user is included in receiverIDs
   */
  const isUserReceiver = (receiverIDs) =>
    Array.isArray(receiverIDs) && receiverIDs.includes(currentUserId);

  /**
   * ✅ Handle MQTT messages
   */
  const { connectToMqtt } = useMqttClient({
    onMessageArrivedCallback: (data) => {
      if (!data?.message) {
        console.warn("MQTT: Received invalid message", data);
        return;
      }

      console.log("MQTT: Message arrived →", data.message, data);

      try {
        const { receiverID, message, payload, roleIDs } = data;
        console.log("MQTT: Admin portfolio update", data);
        console.log("MQTT: Admin portfolio update", receiverID);
        console.log("MQTT: Admin portfolio update", message);
        console.log("MQTT: Admin portfolio update", payload);
        console.log("MQTT: Admin portfolio update", roleIDs);
        console.log("MQTT: Admin portfolio update", userAssignedRolesData);
        console.log("MQTT: Admin portfolio update", currentUserId);
        console.log(
          "MQTT: Admin portfolio update",
          hasUserRole(Number(roleIDs))
        );
        console.log("MQTT: Admin portfolio update", isUserReceiver(receiverID));

        switch (message) {
          case "NEW_TRADE_APPROVAL_REQUEST": {
            if (payload) {
              // Prepend new trade approval
              setIsEmployeeMyApproval((prev) => ({
                ...prev,
                approvals: [payload, ...(prev.approvals || [])],
                totalRecords: (prev.totalRecords || 0) + 1,
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

          case "NEW_UPLOAD_PORTFOLIO_REQUEST": {
            if (
              payload &&
              hasUserRole(Number(roleIDs)) &&
              isUserReceiver(receiverID)
            ) {
              switch (String(roleIDs)) {
                case "1": // Admin
                  console.log("MQTT: Admin portfolio update");
                  break;

                case "2": // Employee
                  console.log("MQTT: Employee portfolio update");
                  setEmployeePendingApprovalsDataMqtt({
                    mqttRecivedData: payload,
                    mqttRecived: true,
                  });
                  break;

                case "3": // Line Manager
                  console.log("MQTT: Line Manager portfolio update");
                  break;

                default:
                  console.warn(
                    "MQTT: No handler defined for roleID →",
                    roleIDs
                  );
              }
            }
            break;
          }

          case "USER_DASHBOARD_DATA": {
            if (hasUserRole(roleIDs)) {
              switch (String(roleIDs)) {
                case "1": // Admin
                  console.log("MQTT: Admin dashboard update");
                  break;

                case "2": // Employee
                  console.log("MQTT: Employee dashboard update");
                  setDashboardData((prev) => {
                    if (!prev?.employee) return prev;
                    const updatedEmployee = { ...prev.employee };
                    Object.keys(payload).forEach((key) => {
                      if (payload[key] !== null)
                        updatedEmployee[key] = payload[key];
                    });
                    return { ...prev, employee: updatedEmployee };
                  });
                  break;

                case "3": // Line Manager
                  console.log("MQTT: Line Manager dashboard update");
                  setDashboardData((prev) => {
                    if (!prev?.lineManager) return prev;
                    const updatedLineManager = { ...prev.lineManager };
                    Object.keys(payload).forEach((key) => {
                      if (payload[key] !== null)
                        updatedLineManager[key] = payload[key];
                    });
                    return { ...prev, lineManager: updatedLineManager };
                  });
                  break;

                default:
                  console.warn(
                    "MQTT: No handler defined for roleID →",
                    roleIDs
                  );
              }
            } else {
              console.warn(
                "MQTT: Unauthorized or missing roleID in USER_DASHBOARD_DATA",
                roleIDs
              );
            }
            break;
          }

          // case "Transaction_Conducted": {
          //   try {
          //     console.log("MQTT ignored: role check failed");
          //     // 🔹 Get assigned roles from sessionStorage
          //     const storedRoles =
          //       JSON.parse(sessionStorage.getItem("user_assigned_roles")) || [];
          //     const hasEmployeeRole = storedRoles.some(
          //       (role) => role.roleID === 2
          //     );

          //     // 🔹 Allow only if both conditions are true
          //     if (!(hasEmployeeRole && roleIDs === "2")) {
          //       console.log("MQTT ignored: role check failed", {
          //         hasEmployeeRole,
          //         mqttRoleId,
          //       });
          //       break;
          //     }

          //     if (payload) {
          //       console.log("MQTT ignored: role check failed");

          //       const flattened = (
          //         Array.isArray(payload) ? payload : [payload]
          //       ).flatMap((item) => item);
          //       console.log(flattened, "MQTT ignored: role check failed");

          //       setEmployeeTransactionsData((prev) => ({
          //         ...prev,
          //         data: [...flattened, ...(prev.data || [])],
          //         totalRecords: (prev.totalRecords || 0) + flattened.length,
          //       }));
          //       console.log("MQTT: Transaction Conducted → payload", payload);
          //     } else {
          //       console.warn("MQTT: Missing payload in Transaction Conducted");
          //     }
          //   } catch (err) {
          //     console.error("MQTT role check failed:", err);
          //   }
          //   break;
          // }

          default:
            console.warn("MQTT: No handler for message →", message);
        }
      } catch (error) {
        console.error("MQTT: Error handling message", error, data);
      }
    },
    onConnectionLostCallback: () => {
      console.warn("MQTT disconnected");
    },
  });

  // Connect to MQTT on mount
  useEffect(() => {
    connectToMqtt({ subscribeID, userID: currentUserId });
  }, []);

  // Get page-specific class based on route
  const getContentClass = () => {
    return location.pathname === "/PAD" ? "pad_content" : "pad_content";
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
