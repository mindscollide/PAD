// src/api/loginApi.js

import { hasAdminRole, hasOnlyAdminRole } from "../common/funtions/adminChecks";
import { getMessage } from "./utils";

export const login = async ({
  setUrgentAlert,
  setCurrentRoleIsAdmin,
  username,
  password,
  navigate,
  callApi,
  showNotification,
  showLoader,
}) => {
  showLoader(true);
  const res = await callApi({
    requestMethod: import.meta.env.VITE_LOGIN_REQUEST_METHOD,
    endpoint: import.meta.env.VITE_API_AUTH,
    requestData: {
      EmailAddress: username,
      Password: password,
      DeviceID: "1",
      DeviceName: "Mobile",
    },
    navigate,
    withAuth: false,
  });
  if (!res?.result?.isExecuted) {
    showLoader(false);
    return showNotification({
      type: "error",
      title: "Error",
      description: "Something went wrong. Please try again.",
    });
  }

  if (res.success) {
    const {
      mqtt,
      userAssignedRoles,
      userToken,
      userProfileData,
      userHierarchy,
      lastLoggedInDateTime,
      urgentApprovals,
    } = res.result;
    const message = getMessage(res.result.responseMessage);
    const responseCodeKey = res.result.responseMessage;
    if (responseCodeKey === "ERM_Auth_AuthServiceManager_Login_01") {
      sessionStorage.setItem("auth_token", userToken.token);
      sessionStorage.setItem("refresh_token", userToken.refreshToken);
      sessionStorage.setItem("token_timeout", userToken.tokenTimeOut);
      sessionStorage.setItem("lastLoggedInDateTime", lastLoggedInDateTime);
        if (userAssignedRoles.some((role) => role.roleID === 3)) {
        sessionStorage.setItem(
          "urgentApprovals",
          JSON.stringify(urgentApprovals[0])
        );
        if (urgentApprovals[0].count > 0) {
          sessionStorage.setItem("urgent_flag", true);
          setUrgentAlert(true);
        } else {
          sessionStorage.setItem("urgent_flag", false);
          setUrgentAlert(false);
        }
      }

      sessionStorage.setItem(
        "user_assigned_roles",
        JSON.stringify(userAssignedRoles)
      );
      sessionStorage.setItem(
        "user_profile_data",
        JSON.stringify(userProfileData)
      );
      sessionStorage.setItem(
        "user_Hierarchy_Details",
        JSON.stringify(userHierarchy)
      );
      sessionStorage.setItem("user_mqtt_Port", JSON.stringify(mqtt?.mqttPort));
      sessionStorage.setItem(
        "user_mqtt_ip_Address",
        JSON.stringify(mqtt?.mqttipAddress)
      );
      // Handle Admin logic
      if (hasOnlyAdminRole(userAssignedRoles)) {
        // this check is used for currently selected role if admin role assing to user
        sessionStorage.setItem("current_role_is_admin", true);
        // this check is used for user only have  role of admin
        sessionStorage.setItem("user_has_admin_only", true);
        // this check is used for user eployees and admin   role
        sessionStorage.setItem("user_has_admin_and_employees_role", false);
        setCurrentRoleIsAdmin(true);
      } else if (hasAdminRole(userAssignedRoles)) {
        // Multi-role: Default to user dashboard but allow toggle
        // this check is used for currently selected role if admin role assing to user
        sessionStorage.setItem("current_role_is_admin", false);
        // this check is used for user only have  role of admin
        sessionStorage.setItem("user_has_admin_only", false);
        // this check is used for user eployees and admin   role
        sessionStorage.setItem("user_has_admin_and_employees_role", true);
        setCurrentRoleIsAdmin(false);
      } else {
        // No admin role
        // this check is used for currently selected role if admin role assing to user
        sessionStorage.setItem("current_role_is_admin", false);
        // this check is used for user only have  role of admin
        sessionStorage.setItem("user_has_admin_only", false);
        // this check is used for user eployees and admin   role
        sessionStorage.setItem("user_has_admin_and_employees_role", false);
        setCurrentRoleIsAdmin(false);
      }
      navigate("/PAD");

      //Yaha success pa true rakha hai takay GetUserDashBoardStats ki API ka response anay tak loader chalay
      showLoader(true);
    } else {
      showNotification({
        type: "error",
        title: message,
        description: "Please login again.",
      });

      showLoader(false);
    }
  } else if (res.expired) {
    showNotification({
      type: "error",
      title: "Session expired",
      description: "Please login again.",
    });

    showLoader(false);
  } else {
    showNotification({
      type: "error",
      title: "Login Failed",
      description: getMessage(res.message),
    });

    showLoader(false);
  }
};

export const logout = ({ navigate, showLoader }) => {
  try {
    // Clear auth tokens and session info
    sessionStorage.removeItem("refresh_token");
    sessionStorage.removeItem("token_timeout");
    sessionStorage.removeItem("current_role_is_admin");
    sessionStorage.removeItem("user_has_admin_only");
    sessionStorage.removeItem("user_has_admin_and_employees_role");
    sessionStorage.removeItem("auth_token");
    sessionStorage.removeItem("lastLoggedInDateTime");
    sessionStorage.removeItem("user_assigned_roles");
    sessionStorage.removeItem("user_profile_data");
    sessionStorage.removeItem("user_Hierarchy_Details");
    sessionStorage.removeItem("user_mqtt_Port");
    sessionStorage.removeItem("user_mqtt_ip_Address");
    sessionStorage.removeItem("urgentApprovals");
    sessionStorage.removeItem("urgent_flag");
    sessionStorage.removeItem("user_mqtt_ip_Address");
    // Optional: Clear entire sessionStorage if needed
    sessionStorage.clear();

    console.log("User logged out");

    // Hide loader if provided
    if (typeof showLoader === "function") {
      showLoader(false);
    }

    // Redirect to login/home page
    if (typeof navigate === "function") {
      navigate("/", { replace: true });
    } else {
      // Fallback: hard redirect
      window.location.href = "/";
    }
  } catch (error) {
    console.error("Error during logout:", error);
  }
};
