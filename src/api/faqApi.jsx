import { getMessage, handleExpiredSession } from "./utils";

// 🔹 GetPadFaqs - pre-defined FAQ list, per SRS "FAQ" section. Same for
// every role (pre-configured, not role-scoped). Lives in the Admin
// service - already live per 2026-08-19_my_profile_and_notification_
// settings.md, no BE work pending for this one.
export const GetPadFaqsRequest = async ({
  callApi,
  showNotification,
  showLoader,
  requestdata,
  navigate,
}) => {
  try {
    const res = await callApi({
      requestMethod: import.meta.env.VITE_GET_PAD_FAQS_REQUEST_METHOD,
      endpoint: import.meta.env.VITE_API_ADMIN,
      requestData: requestdata,
      navigate,
    });

    if (handleExpiredSession(res, navigate, showLoader)) return null;

    if (!res?.result?.isExecuted) {
      showNotification({
        type: "error",
        title: "Error",
        description: "Something went wrong while fetching FAQs.",
      });
      return null;
    }

    if (res.success) {
      const { responseMessage, faqs, totalRecords } = res.result;

      // Case 1 → Data available
      if (responseMessage === "PAD_Admin_AdminServiceManager_GetPadFaqs_01") {
        return {
          faqs: faqs || [],
          totalRecords: totalRecords || 0,
        };
      }

      // Case 2 → No data
      if (responseMessage === "PAD_Admin_AdminServiceManager_GetPadFaqs_02") {
        return { faqs: [], totalRecords: 0 };
      }

      const message = getMessage(responseMessage);
      if (message) {
        showNotification({
          type: "warning",
          title: message,
          description: "No FAQs available.",
        });
      }
      return { faqs: [], totalRecords: 0 };
    }

    showNotification({
      type: "error",
      title: "Fetch Failed",
      description: getMessage(res.message),
    });
    return null;
  } catch {
    showNotification({
      type: "error",
      title: "Error",
      description: "An unexpected error occurred while fetching FAQs.",
    });
    return null;
  } finally {
    showLoader(false);
  }
};
