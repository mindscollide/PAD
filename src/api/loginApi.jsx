import Cookies from "js-cookie";
import { CheckCircleOutlined } from "@ant-design/icons";

const handleResponseMessages = (code) => {
  const messages = {
    ERM_Auth_AuthServiceManager_Login_01: "Login Successful",
    ERM_Auth_AuthServiceManager_Login_02: "Login Failed",
    ERM_Auth_AuthServiceManager_Login_03:
      "User is temporarily disabled and cannot login",
    ERM_Auth_AuthServiceManager_Login_04:
      "Account permanently closed (employee termination or deceased)",
    ERM_Auth_AuthServiceManager_Login_05:
      "Account inactive per Active Directory sync; requires reactivation",
    ERM_Auth_AuthServiceManager_Login_06:
      "An error occurred. Please try again.",
    ERM_Auth_AuthServiceManager_Login_07: "Please fill both fields",
  };

  return messages[code] || "Something went wrong. Please try again.";
};

export const login = async ({
  username,
  password,
  navigate,
  setProfile,
  callApi,
  showNotification,
  setRoles,
}) => {
  try {
    const res = await callApi({
      requestMethod: import.meta.env.VITE_LOGIN_REQUEST_METHOD,
      endpoint: import.meta.env.VITE_API_AUTH,
      requestData: {
        EmailAddress: username,
        Password: password,
        DeviceID: "1",
        DeviceName: "Mobile",
      },
    });

    console.log("res", res);

    // First check if the request was executed
    if (!res?.result?.isExecuted) {
      showNotification({
        type: "error",
        title: "Error",
        description: "Something went wrong. Please try again.",
      });
      return;
    }

    // Handle different response scenarios
    if (res.success && res.responseCode === 200) {
      const responseMessage = handleResponseMessages(
        res?.result?.responseMessage
      );

      if (responseMessage === "Login Successful") {
        const { userAssignedRoles, userToken, userProfileData } = res.result;

        // 1. Save token, refresh token, and expiry in cookies
        Cookies.set("auth_token", userToken.token);
        Cookies.set("refresh_token", userToken.refreshToken);
        Cookies.set("token_timeout", userToken.tokenTimeOut);
        setRoles(userAssignedRoles);
        // 2. Save roles in localStorage
        // localStorage.setItem("roles", JSON.stringify(userAssignedRoles));
        localStorage.setItem("auth", "true");

        // 3. Save profile data in context
        setProfile(userProfileData);

        // 5. Navigate to dashboard
        navigate("/PAD");
      } else {
        showNotification({
          type: "error",
          title: responseMessage,
          description: "Please login again.",
        });
      }
    } else if (res.responseCode !== 200) {
      showNotification({
        type: "error",
        title: "Something went wrong. Please try again.",
        description: "Please login again.",
      });
    } else if (res.expired) {
      showNotification({
        type: "error",
        title: "Session expired",
        description: "Please login again.",
      });
    } else {
      showNotification({
        type: "error",
        title: "Login Failed",
        description: res.message
          ? handleResponseMessages(res.message)
          : "Something went wrong. Please try again.",
      });
    }
  } catch (error) {
    console.error("Login error:", error);
    showNotification({
      type: "error",
      title: "Error",
      description: "An unexpected error occurred. Please try again.",
    });
  }
};
