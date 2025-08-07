// src/context/ApiContext.jsx
import React, { createContext, useContext } from "react";
import axios from "axios";
import { refreshToken } from "../api/refreshTokenApi";
import { useNotification } from "../components/NotificationProvider/NotificationProvider";
import { useGlobalLoader } from "./LoaderContext";
import { logout } from "../api/loginApi";

const ApiContext = createContext();

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://your-api.com";

export const ApiProvider = ({ children }) => {
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();

  const callApi = async ({
    endpoint = "",
    method = "POST",
    requestMethod = "",
    requestData = {},
    extraFormFields = {},
    headers = {},
    withAuth = true,
    retryOnExpire = true,
  }) => {
    try {
      showLoader(true);
      let token = "";
      if (withAuth) {
        token = sessionStorage.getItem("auth_token");
        if (!token) {
          return { success: false, expired: true };
        }
      }

      const form = new FormData();
      form.append("RequestMethod", requestMethod);
      form.append("RequestData", JSON.stringify(requestData));

      Object.entries(extraFormFields).forEach(([key, value]) => {
        form.append(key, value);
      });

      const config = {
        method,
        url: `${BASE_URL}${endpoint}`,
        data: form,
        headers: {
          ...(withAuth && token ? { _token: token } : {}),
        },
      };

      const res = await axios(config);
      const { responseCode, responseMessage, responseResult } = res.data;

      showLoader(false);

      if (responseCode === 200) {
        return {
          success: true,
          result: responseResult,
          responseMessage,
        };
      }

      if ((responseCode === 417 || responseCode === 401) && retryOnExpire) {
        const refreshed = await refreshToken(callApi, {
          showNotification,
          showLoader,
        });
        console.log("heloo log");
        if (refreshed === true) {
          // Retry the original request with fresh token
          return await callApi({
            endpoint,
            method,
            requestMethod,
            requestData,
            extraFormFields,
            headers,
            withAuth,
            retryOnExpire: false, // Prevent infinite loops
          });
        }
        // logout(navigate, showLoader);
        console.log("heloo log");
        return { success: false, expired: true };
      }

      return {
        success: false,
        message: responseMessage,
        responseCode,
      };
    } catch (err) {
      showLoader(false);
      const message = err.response?.data?.responseMessage || err.message;

      if (err.response?.status === 401 || err.response?.status === 403) {
        return { success: false, expired: true };
      }

      showNotification({
        type: "error",
        title: "API Error",
        description: message,
      });
      return { success: false, message };
    }
  };

  return (
    <ApiContext.Provider value={{ callApi }}>{children}</ApiContext.Provider>
  );
};

export const useApi = () => useContext(ApiContext);
