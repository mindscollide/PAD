// src/components/dashboard/Dashboard.jsx
import { Layout } from "antd";
import SideBar from "../sidebar/sidebar";
import "./dashboard_module.css";
import Headers from "../header/header";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef } from "react"; // Added useRef

// Contexts
import { useMqttClient } from "../../../common/mqtt/mqttConnection";
import { useMyApproval } from "../../../context/myApprovalContaxt";
import { useDashboardContext } from "../../../context/dashboardContaxt";
import { usePortfolioContext } from "../../../context/portfolioContax";
import { useTransaction } from "../../../context/myTransaction";
import { useReconcileContext } from "../../../context/reconsileContax";
import { useSidebarContext } from "../../../context/sidebarContaxt";
import { useEscalatedApprovals } from "../../../context/escalatedApprovalContext";
import { useWebNotification } from "../../../context/notificationContext";
import { GetUserWebNotificationRequest } from "../../../api/notification";
import { useNotification } from "../../NotificationProvider/NotificationProvider";
import { useApi } from "../../../context/ApiContext";
import { useGlobalLoader } from "../../../context/LoaderContext";
import { useMyAdmin } from "../../../context/AdminContext";
import { ManageBrokerModal } from "../../../pages";
const { Content } = Layout;

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const connectionAttemptedRef = useRef(false); // ✅ Track connection attempts

  // Context hooks
  const { setLineManagerApprovalMQtt, setIsEmployeeMyApprovalMqtt } =
    useMyApproval();
  const {
    setAdminBrokerMqtt,
    setAdminIntrumentsMqtt,
    setAdminAddDeleteClosingInstrument,
    setManageUsersPendingTabMqtt,
    setManageUsersRejectedRequestTabMQTT,
    manageUsersTabRef,
  } = useMyAdmin();
  const { setHtaEscalatedApprovalDataMqtt } = useEscalatedApprovals();
  const { setEmployeePendingApprovalsDataMqtt, activeTabRef } =
    usePortfolioContext();

  const {
    setComplianceOfficerReconcileTransactionDataMqtt,
    setComplianceOfficerReconcilePortfolioDataMqtt,
    setHeadOfComplianceApprovalEscalatedVerificationsMqtt,
    setHeadOfComplianceApprovalEscalatedVerificationsData,
    activeTabRef: reconcileActiveTab,
    activeTabHCORef,
  } = useReconcileContext();
  const {
    setDashboardData,
    currentRoleIsAdmin,
    roleChanegFlag,
    setRoleChanegFlag,
    currentRoleIsAdminRef,
    urgentAlert,
    setUrgentAlert,
    manageBrokersModalOpen,
    setManageBrokersModalOpen,
  } = useDashboardContext();

  const { setEmployeeTransactionsTableDataMqtt } = useTransaction();
  const { setWebNotificationData } = useWebNotification();
  const { callApi } = useApi();
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();
  const { selectedKeyRef } = useSidebarContext();

  // User info from session storage
  const userProfileData = JSON.parse(
    sessionStorage.getItem("user_profile_data"),
  );
  const userAssignedRolesData = JSON.parse(
    sessionStorage.getItem("user_assigned_roles"),
  );
  const currentUserId = userProfileData?.userID;

  // ✅ Memoize the topic to prevent unnecessary recreations
  const topic = useMemo(() => {
    return currentUserId ? `PAD_${currentUserId}` : null;
  }, [currentUserId]);

  console.log("selectedKey", selectedKeyRef);

  /**
   * ✅ Utility: check if current user has required role(s)
   */
  const hasUserRole = (roleIDs) => {
    if (!roleIDs || !Array.isArray(userAssignedRolesData)) return false;

    const roleArray = Array.isArray(roleIDs) ? roleIDs : [roleIDs];

    return userAssignedRolesData.some((role) =>
      roleArray.includes(Number(role.roleID)),
    );
  };
  const apiCallwebNotification = async () => {
    const requestdata = { sRow: 0, eRow: 10 }; // Initial fetch data from API
    console.log("action", requestdata);
    const webNotificationRequest = await GetUserWebNotificationRequest({
      callApi,
      showNotification,
      showLoader,
      requestdata,
      navigate,
    });
    console.log("action", webNotificationRequest);
    await setWebNotificationData(webNotificationRequest);
  };
  /**
   * ✅ Handle MQTT messages
   */

  const { connectToMqtt, isConnected } = useMqttClient({
    onMessageArrivedCallback: (data) => {
      console.log("action", data);
      if (!data?.message) {
        console.warn("MQTT: Received invalid message", data);
        return;
      }
      try {
        const currentKey = selectedKeyRef.current;
        const currentreconcileActiveTab = reconcileActiveTab.current;
        const currentactiveTabRef = activeTabRef.current;
        const currentactiveHCOEscalatedTabRef = activeTabHCORef.current;
        const currentRoleIsAdminRefLocal = currentRoleIsAdminRef.current;
        const currentmanageUsersTabRef = manageUsersTabRef.current;
        const { message, payload, roleIDs, action } = data;
        if (!payload) return;
        // if (action === "WEBNOTIFICATION") {
        //   apiCallwebNotification();
        // }

        if (hasUserRole(Number(roleIDs))) {
          if (currentRoleIsAdminRefLocal) {
            // admin mqtt
            if (roleIDs !== "1") {
              // not admin MQTT → ignore completely
              return;
            } else {
              if (action === "WEBNOTIFICATION") {
                apiCallwebNotification();
              }
            }
          } else {
            if (roleIDs !== "1") {
              if (action === "WEBNOTIFICATION") {
                apiCallwebNotification();
              }
            } else {
              // its admin MQTT → ignore completely
            }
          }
          switch (roleIDs) {
            case "1": {
              switch (message) {
                case "INSTRUMENT_STATUS_UPDATED": {
                  if (currentRoleIsAdminRefLocal) {
                    // admin mqtt
                    if (currentKey === "18") {
                      // not admin MQTT → ignore completely
                      setAdminIntrumentsMqtt(true);
                      return;
                    }
                  }
                  break;
                }
                case "USER_REGISTRATION_ACCEPTED": {
                  if (currentRoleIsAdminRefLocal) {
                    // admin mqtt
                    if (
                      currentKey === "21" &&
                      currentmanageUsersTabRef === "1"
                    ) {
                      // not admin MQTT → ignore completely
                      setManageUsersPendingTabMqtt(true);
                      return;
                    }
                  }
                  break;
                }
                case "USER_REGISTRATION_REJECTED": {
                  if (currentRoleIsAdminRefLocal) {
                    // admin mqtt
                    if (currentKey === "21") {
                      if (currentmanageUsersTabRef === "1") {
                        setManageUsersPendingTabMqtt(true);
                      }
                      if (currentmanageUsersTabRef === "2") {
                        setManageUsersRejectedRequestTabMQTT(true);
                      }
                      return;
                    }
                  }
                  break;
                }

                case "NEW_INSTRUMENT_CLOSING_PERIOD_ADDED":
                case "INSTRUMENT_CLOSING_PERIOD_DELETED": {
                  if (currentRoleIsAdminRefLocal) {
                    //admin Edit Modal Add and Delete Mqtt
                    if (currentKey === "18") {
                      setAdminAddDeleteClosingInstrument(true);
                      return;
                    }
                  }
                  break;
                }

                case "NEW_BROKER_ADDED":
                case "BROKER_UPDATED":
                case "BROKER_STATUS_UPDATED": {
                  if (currentRoleIsAdminRefLocal) {
                    // admin mqtt
                    if (currentKey === "19") {
                      // not admin MQTT → ignore completely
                      setAdminBrokerMqtt(true);
                      return;
                    }
                  }
                  break;
                }

                default:
                  console.warn("MQTT: No handler for message →", message);
              }
              break;
            }

            // Employee mqtt
            case "2": {
              switch (message) {
                case "EMPLOYEE_USER_DASHBOARD_DATA": {
                  if (currentKey === "0") {
                    setDashboardData((prev) => {
                      if (!prev?.employee) return prev;
                      const updatedEmployee = { ...prev.employee };
                      Object.keys(payload).forEach((key) => {
                        if (payload[key] !== null)
                          updatedEmployee[key] = payload[key];
                      });
                      return { ...prev, employee: updatedEmployee };
                    });
                  }
                  break;
                }
                case "EMPLOYEE_NEW_TRADE_APPROVAL_REQUEST": {
                  if (currentKey === "1") {
                    setIsEmployeeMyApprovalMqtt(true);
                  }
                  break;
                }
                case "EMPLOYEE_CONDUCTED_TRANSACTION": {
                  if (currentKey === "2") {
                    setEmployeeTransactionsTableDataMqtt(true);
                    // setEmployeeTransactionsData((prev) => ({
                    //   ...prev,
                    //   data: [payload, ...(prev.data || [])],
                    //   totalRecords: (prev.totalRecords || 0) + 1,
                    // }));
                  }
                  break;
                }
                case "EMPLOYEE_TRADE_APPROVAL_REQUEST_STATUS_CHANGE_TRADED": {
                  if (currentKey === "1") {
                    setIsEmployeeMyApprovalMqtt(true);

                    // setIsEmployeeMyApproval((prev) => {
                    //   const approvals = prev.approvals || [];
                    //   const existingIndex = approvals.findIndex(
                    //     (item) => item.approvalID === payload.approvalID
                    //   );

                    //   if (existingIndex === -1) return prev;

                    //   const updatedApprovals = [...approvals];
                    //   updatedApprovals[existingIndex] = payload;

                    //   return {
                    //     ...prev,
                    //     approvals: updatedApprovals,
                    //   };
                    // });
                  }
                  break;
                }
                case "EMMPLOYEE_NEW_UPLOAD_PORTFOLIO_REQUEST": {
                  if (currentKey === "4" && currentactiveTabRef === "pending") {
                    // setEmployeePendingApprovalsDataMqtt({
                    //   mqttRecivedData: payload,
                    //   mqttRecived: true,
                    // });
                    setEmployeePendingApprovalsDataMqtt(true);
                  }
                  break;
                }
                case "EMPLOYEE_TRADE_APPROVAL_REQUEST_APPROVED": {
                  if (currentKey === "1") {
                    setIsEmployeeMyApprovalMqtt(true);

                    // setIsEmployeeMyApproval((prev) => {
                    //   const approvals = prev.approvals || [];
                    //   const existingIndex = approvals.findIndex(
                    //     (item) => item.approvalID === payload.approvalID
                    //   );

                    //   if (existingIndex === -1) return prev;

                    //   const updatedApprovals = [...approvals];
                    //   updatedApprovals[existingIndex] = payload;

                    //   return {
                    //     ...prev,
                    //     approvals: updatedApprovals,
                    //   };
                    // });
                  }
                  break;
                }
                case "EMPLOYEE_TRADE_APPROVAL_REQUEST_DECLINED": {
                  if (currentKey === "1") {
                    setIsEmployeeMyApprovalMqtt(true);
                  }
                  break;
                }
                case "EMPLOYEE_TRANSACTION_APPROVAL_REQUEST_APPROVED": {
                  if (currentKey === "2") {
                    setEmployeeTransactionsTableDataMqtt(true);
                    // setEmployeeTransactionsData((prev) => ({
                    //   ...prev,
                    //   data: [payload, ...(prev.data || [])],
                    //   totalRecords: (prev.totalRecords || 0) + 1,
                    // }));
                  }
                  break;
                }
                case "EMPLOYEE_TRANSACTION_APPROVAL_REQUEST_DECLINED": {
                  if (currentKey === "2") {
                    setEmployeeTransactionsTableDataMqtt(true);
                  }
                  break;
                }
                case "EMPLOYEE_NEW_TRADE_APPROVAL_REQUEST_RESUBMITTED": {
                  if (currentKey === "1") {
                    setIsEmployeeMyApprovalMqtt(true);
                  }
                  break;
                }
                case "WORKFLOW_ESCALATED_FROM_HTA": {
                  if (currentKey === "1") {
                    setIsEmployeeMyApprovalMqtt(true);
                  }
                  break;
                }
                case "WORKFLOW_ESCALATED_FROM_HOC": {
                  if (currentKey === "2") {
                    setEmployeeTransactionsTableDataMqtt(true);
                  } else if (
                    currentKey === "4" &&
                    currentactiveTabRef === "pending"
                  ) {
                    setEmployeePendingApprovalsDataMqtt(true);
                  }
                  break;
                }
                default:
                  console.warn("MQTT: No handler for message →", message);
              }
              break;
            }
            // Line manager mqtt
            case "3": {
              switch (message) {
                case "LINE_MANAGER_DASHBOARD_DATA": {
                  if (currentKey === "0") {
                    setDashboardData((prev) => {
                      if (!prev?.lineManager) return prev;
                      const updatedLineManager = { ...prev.lineManager };
                      Object.keys(payload).forEach((key) => {
                        if (payload[key] !== null)
                          updatedLineManager[key] = payload[key];
                      });
                      return { ...prev, lineManager: updatedLineManager };
                    });
                  }
                  break;
                }
                case "YOU_HAVE_URGENT_ACTION_WHICH_REQUIRE_URGENT_ACTION": {
                  // Prevent multiple fetches on mount
                  sessionStorage.setItem(
                    "urgentApprovals",
                    JSON.stringify(payload),
                  );
                  console.log("urgentApprovals", payload);
                  if (payload.count > 0) {
                    sessionStorage.setItem("urgent_flag", true);
                    setUrgentAlert(true);
                    console.log("urgentApprovals", payload);
                  } else {
                    sessionStorage.setItem("urgent_flag", false);
                    setUrgentAlert(false);
                    console.log("urgentApprovals", payload);
                  }

                  break;
                }
                case "LINE_MANAGER_NEW_TRADE_APPROVAL_REQUEST": {
                  if (currentKey === "6") {
                    setLineManagerApprovalMQtt(true);
                    // handleLineManagerApprovalNewTrade(
                    //   payload,
                    //   currentlineManagerApprovalSearchRef,
                    //   setLineManagerApproval
                    // );
                  }
                  break;
                }
                case "LINE_MANAGER_TRADE_APPROVAL_REQUEST_APPROVED": {
                  if (currentKey === "6") {
                    setLineManagerApprovalMQtt(true);

                    // setLineManagerApproval((prev) => {
                    //   const lineApprovals = prev.lineApprovals || [];
                    //   const existingIndex = lineApprovals.findIndex(
                    //     (item) => item.approvalID === payload.approvalID
                    //   );

                    //   if (existingIndex === -1) return prev;

                    //   const updatedApprovals = [...lineApprovals];
                    //   updatedApprovals[existingIndex] = payload;

                    //   return {
                    //     ...prev,
                    //     lineApprovals: updatedApprovals,
                    //   };
                    // });
                  }
                  break;
                }
                case "LINE_MANAGER_TRADE_APPROVAL_REQUEST_DECLINED": {
                  if (currentKey === "6") {
                    setLineManagerApprovalMQtt(true);
                  }
                  break;
                }
                case "LINE_MANAGER_NEW_TRADE_APPROVAL_REQUEST_RESUBMITTED": {
                  if (currentKey === "6") {
                    setLineManagerApprovalMQtt(true);
                  }
                  break;
                }
                case "YOUR_REQUEST_ESCALATED_TO_HTA": {
                  if (currentKey === "6") {
                    setLineManagerApprovalMQtt(true);
                  }
                  break;
                }
                default:
                  console.warn("MQTT: No handler for message →", message);
              }
              break;
            }

            // Compliance officer mqtt
            case "4": {
              switch (message) {
                case "COMPLIANCE_OFFICER_DASHBOARD_DATA": {
                  if (currentKey === "0") {
                    setDashboardData((prev) => {
                      if (!prev?.complianceOfficer) return prev;
                      const updatedEmployee = { ...prev.complianceOfficer };
                      Object.keys(payload).forEach((key) => {
                        if (payload[key] !== null)
                          updatedEmployee[key] = payload[key];
                      });
                      return { ...prev, complianceOfficer: updatedEmployee };
                    });
                  }
                  break;
                }
                case "COMPLIANCE_OFFICER_NEW_UPLOAD_PORTFOLIO_REQUEST": {
                  if (
                    currentKey === "9" &&
                    currentreconcileActiveTab === "portfolio"
                  ) {
                    setComplianceOfficerReconcilePortfolioDataMqtt(true);
                  }
                  break;
                }
                case "COMPLIANCE_OFFICER_CONDUCTED_TRANSACTION": {
                  if (
                    currentKey === "9" &&
                    currentreconcileActiveTab === "transactions"
                  ) {
                    setComplianceOfficerReconcileTransactionDataMqtt(true);
                  }
                  break;
                }
                case "COMPLIANCE_OFFICER_TRANSACTION_APPROVAL_REQUEST_APPROVED": {
                  if (
                    currentKey === "9" &&
                    currentreconcileActiveTab === "transactions"
                  ) {
                    setComplianceOfficerReconcileTransactionDataMqtt(true);
                  } else if (
                    currentKey === "9" &&
                    currentreconcileActiveTab === "portfolio"
                  ) {
                    setComplianceOfficerReconcilePortfolioDataMqtt(true);
                  }
                  break;
                }
                case "COMPLIANCE_OFFICER_TRANSACTION_APPROVAL_REQUEST_DECLINED": {
                  if (
                    currentKey === "9" &&
                    currentreconcileActiveTab === "transactions"
                  ) {
                    setComplianceOfficerReconcileTransactionDataMqtt(true);
                  } else if (
                    currentKey === "9" &&
                    currentreconcileActiveTab === "portfolio"
                  ) {
                    setComplianceOfficerReconcilePortfolioDataMqtt(true);
                  }
                  break;
                }
                case "YOUR_REQUEST_ESCALATED_TO_HOC": {
                  if (
                    currentKey === "9" &&
                    currentreconcileActiveTab === "transactions"
                  ) {
                    setComplianceOfficerReconcileTransactionDataMqtt(true);
                  } else if (
                    currentKey === "9" &&
                    currentreconcileActiveTab === "portfolio"
                  ) {
                    setComplianceOfficerReconcilePortfolioDataMqtt(true);
                  }
                  break;
                }
                default:
                  console.warn("MQTT: No handler for message →", message);
              }
              break;
            }
            // HTA mqtt
            case "5": {
              // missing dashboard
              switch (message) {
                case "REQUEST_ESCALATED_TO_HTA": {
                  if (currentKey === "12") {
                    setHtaEscalatedApprovalDataMqtt(true);
                  }
                  break;
                }
                default:
                  console.warn("MQTT: No handler for message →", message);
              }
              break;
            }
            // HOC mqtt
            case "6": {
              // missing dashboard
              switch (message) {
                case "REQUEST_ESCALATED_TO_HOC": {
                  if (currentKey === "15") {
                    if (currentactiveHCOEscalatedTabRef === "escalated") {
                      setHeadOfComplianceApprovalEscalatedVerificationsMqtt(
                        true,
                      );
                    } else if (
                      currentactiveHCOEscalatedTabRef === "portfolio"
                    ) {
                      setHeadOfComplianceApprovalEscalatedVerificationsData(
                        true,
                      );
                    }
                  }
                  break;
                }
                default:
                  console.warn("MQTT: No handler for message →", message);
              }
              break;
            }

            default:
              console.log("mqtt User details updated → logging out");
          }
        } else {
          switch (message) {
            case "USER_DETAILS_UPDATED": {
              try {
                const parsedPayload = JSON.parse(payload);
                if (parsedPayload?.UserID === currentUserId) {
                  navigate("/"); // your logout function
                }
              } catch (error) {
                console.error("error", error);
              }
              break;
            }

            default:
              console.warn("MQTT: No handler for message →", message);
          }
        }
      } catch (error) {
        console.error("MQTT: Error handling message", error, data);
      }
    },
    onConnectionLostCallback: () => {
      console.warn("MQTT disconnected");
      connectionAttemptedRef.current = false; // ✅ Reset on disconnection
    },
  });

  // ✅ Connect to MQTT only once when topic is available
  useEffect(() => {
    if (topic && !connectionAttemptedRef.current) {
      connectionAttemptedRef.current = true; // ✅ Mark as attempted
      console.log("🔄 Connecting to MQTT with topic:", topic);
      connectToMqtt({ topic, userID: currentUserId });
    }
  }, [topic, connectToMqtt, currentUserId]); // Removed isConnected from dependencies

  // Get page-specific class based on route
  const getContentClass = () => {
    return location.pathname === "/PAD" ? "pad_content" : "pad_content";
  };

  useEffect(() => {
    // Redirect only if user just became admin
    if (roleChanegFlag && location.pathname !== "/PAD") {
      navigate("/PAD", { replace: true });
      setRoleChanegFlag(false);
    }
  }, [currentRoleIsAdmin]); // Runs only when admin state changes

  return (
    <Layout style={{ minHeight: "100vh", maxHeight: "100vh" }}>
      <SideBar />
      <Layout prefixCls="layout-content-area">
        <Headers />
        <Content prefixCls={getContentClass()}>
          <Outlet />
        </Content>
      </Layout>
      <ManageBrokerModal
        open={manageBrokersModalOpen}
        onClose={() => setManageBrokersModalOpen(false)}
      />
    </Layout>
  );
};

export default Dashboard;
