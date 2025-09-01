// src/api/refreshToken.js

export const refreshToken = async (
  callApi,
  { showNotification, showLoader } = {}
) => {
  try {
    showLoader?.(true);

    const refreshToken = sessionStorage.getItem("refresh_token");
    const token = sessionStorage.getItem("auth_token");

    const res = await callApi({
      requestMethod: import.meta.env.VITE_REFRESH_TOKEN_REQUEST_METHOD,
      endpoint: import.meta.env.VITE_API_AUTH,
      requestData: {
        RefreshToken: refreshToken,
        Token: token,
        LastLoginDateTime: new Date().toISOString(),
      },
      withAuth: false,
      retryOnExpire: false, // Prevent infinite refresh loops
    });
    console.log("res", res);
    // Successful refresh case
    if (
      res?.success &&
      res?.result?.isExecuted &&
      res?.result?.responseMessage ===
        "ERM_AuthService_AuthManager_RefreshToken_01"
    ) {
      console.log("res", res);
      await sessionStorage.setItem("auth_token", res?.result?.token);
      await sessionStorage.setItem("refresh_token", res?.result?.refreshToken);
      await sessionStorage.setItem("token_timeout", 10);
      return true;
    }

    // Failed refresh case (expired or invalid)
    showNotification?.({
      type: "error",
      title: "Session expired",
      description: "Please login again.",
    });

    // Clear existing tokens
    return { success: false, expired: true };
  } catch (error) {
    showLoader?.(false);
    showNotification?.({
      type: "error",
      title: "Refresh failed",
      description: "Unable to refresh session. Please login again.",
    });
    return false;
  }
};
