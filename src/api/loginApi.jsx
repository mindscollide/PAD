// src/api/loginApi.js
import Cookies from "js-cookie";

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
  setProfile,
  callApi,
  showNotification,
  setRoles,
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

  if (res.success && res.responseCode === 200) {
    const { userAssignedRoles, userToken, userProfileData } = res.result;
    const message = getMessage(res.result.responseMessage);
    const responseCodeKey = res.result.responseMessage;
    if (responseCodeKey === "ERM_Auth_AuthServiceManager_Login_01") {
      Cookies.set("auth_token", userToken.token, {
        secure: true,
        sameSite: "Strict",
        expires: 1, // 1 day — adjust as needed
      });
      Cookies.set("refresh_token", userToken.refreshToken, {
        secure: true,
        sameSite: "Strict",
        expires: 1, // 1 day — adjust as needed
      });
      Cookies.set("token_timeout", userToken.tokenTimeOut, {
        secure: true,
        sameSite: "Strict",
        expires: 1, // 1 day — adjust as needed
      });

      setRoles(userAssignedRoles);
      localStorage.setItem("auth", "true");
      setProfile(userProfileData);
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
