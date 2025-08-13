// src/api/loginApi.js
const responseMessages = {
  ERM_Auth_AuthServiceManager_Login_01: "Login Successful",
  ERM_Auth_AuthServiceManager_Login_02: "Login Failed",
  ERM_Auth_AuthServiceManager_Login_03:
    "User is temporarily disabled and cannot login",
  ERM_Auth_AuthServiceManager_Login_04: "Account permanently closed",
  ERM_Auth_AuthServiceManager_Login_05:
    "Account inactive; requires reactivation",
  ERM_Auth_AuthServiceManager_Login_06: "An error occurred. Please try again.",
  ERM_Auth_AuthServiceManager_Login_07: "Please fill both fields",
};

const getMessage = (code) =>
  responseMessages[code] || "Something went wrong. Please try again.";

export const login = async ({
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
      lineManagerDetails,
    } = res.result;
    const message = getMessage(res.result.responseMessage);
    const responseCodeKey = res.result.responseMessage;
    console.log("msg", message);
    console.log("msg", responseCodeKey);
    if (responseCodeKey === "ERM_Auth_AuthServiceManager_Login_01") {
      sessionStorage.setItem("auth_token", userToken.token);
      sessionStorage.setItem("refresh_token", userToken.refreshToken);
      sessionStorage.setItem("token_timeout", userToken.tokenTimeOut);
      sessionStorage.setItem(
        "user_assigned_roles",
        JSON.stringify(userAssignedRoles)
      );
      sessionStorage.setItem(
        "user_profile_data",
        JSON.stringify(userProfileData)
      );
      sessionStorage.setItem(
        "line_Manager_Details",
        JSON.stringify(lineManagerDetails)
      );
      sessionStorage.setItem("user_mqtt_Port", JSON.stringify(mqtt?.mqttPort));
      sessionStorage.setItem(
        "user_mqtt-ip_Address",
        JSON.stringify(mqtt?.mqttipAddress)
      );
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
    sessionStorage.removeItem("auth_token");
    sessionStorage.removeItem("refresh_token");
    sessionStorage.removeItem("token_timeout");

    // Optional: Clear entire sessionStorage if needed
    // sessionStorage.clear();

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
