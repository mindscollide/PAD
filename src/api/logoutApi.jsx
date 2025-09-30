// src/api/logoutRequest.js

export const logoutRequest = async ({
  callApi,
  showNotification,
  showLoader,
  navigate,
}) => {
  try {
    showLoader(true);

    const response = await callApi({
      requestMethod: import.meta.env.VITE_LOGOUT_REQUEST_METHOD,
      endpoint: import.meta.env.VITE_API_AUTH,
    });

    // ✅ Session expiry handler (if you already use this in other requests)
    // if (handleExpiredSession(response, navigate, showLoader)) return;

    if (!response) {
      showNotification({
        type: "error",
        title: "Logout Failed",
        description: "No response from server.",
      });
      return false;
    }

    const { responseMessage } = response.result;

    if (responseMessage === "ERM_AuthService_AuthManager_LogOut_01") {
      console.log("logoutRequest");
      // ✅ Redirect to login
      return true;
    }

    // ❌ Fallback: error case
    showNotification({
      type: "error",
      title: "Logout Failed",
      description: "Unexpected response from server.",
    });

    return false;
  } catch (err) {
    console.error("Logout Error:", err);
    showNotification({
      type: "error",
      title: "Logout Error",
      description: "An unexpected error occurred during logout.",
    });
    return false;
  } finally {
    showLoader(false);
  }
};
