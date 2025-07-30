import React, { createContext, useContext, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";

const ApiContext = createContext();

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://your-api.com";

export const ApiProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [expired, setExpired] = useState(false);

  const callApi = async ({
    endpoint = "",
    method = "POST",
    requestMethod = "",
    requestData = {},
    extraFormFields = {},
    headers = {},
    withAuth = true, // 👈 Pass false if token is NOT required
    retryOnExpire = false,
    onExpireRetry = null,
  }) => {
    setLoading(true);
    setError(null);
    setExpired(false);

    try {
      const token = Cookies.get("auth_token");

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
          "Content-Type": "multipart/form-data",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...headers,
        },
      };

      const res = await axios(config);
      const { responseCode, responseMessage, responseResult } = res.data;

      if (responseCode === 200) {
        setResponse(responseResult);
        return {
          success: true,
          result: responseResult,
          responseCode,
          responseMessage,
        };
      }

      if (responseCode === 417) {
        if (retryOnExpire && typeof onExpireRetry === "function") {
          await onExpireRetry();
          return await callApi({
            endpoint,
            method,
            requestMethod,
            requestData,
            extraFormFields,
            headers,
            withAuth,
            retryOnExpire: false, // avoid infinite loop
          });
        }

        setExpired(true);
        setError("Session expired");
        return { success: false, expired: true, responseCode };
      }

      setError(responseMessage || "Unexpected error");
      return { success: false, message: responseMessage, responseCode };
    } catch (err) {
      const message = err.response?.data?.responseMessage || err.message;
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  return (
    <ApiContext.Provider value={{ callApi, loading, response, error, expired }}>
      {children}
    </ApiContext.Provider>
  );
};

export const useApi = () => useContext(ApiContext);
