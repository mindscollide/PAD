import { getMessage, handleExpiredSession } from "./utils";

// 🔹 SearchComplianceOfficerReconcileTransactionRequest
export const SearchComplianceOfficerReconcileTransactionRequest = async ({
  callApi,
  showNotification,
  showLoader,
  requestdata,
  navigate,
}) => {
  try {
    // 🔹 API Call
    const res = await callApi({
      requestMethod: import.meta.env
        .VITE_SEARCH_COMPLIANCE_OFFICER_RECONCILE_TRANSACTIONS_REQUEST_METHOD,
      endpoint: import.meta.env.VITE_API_TRADE,
      requestData: requestdata,
      navigate,
    });

    // 🔹 Handle session expiry
    if (handleExpiredSession(res, navigate, showLoader)) return null;

    // 🔹 Validate API execution
    if (!res?.result?.isExecuted) {
      showNotification({
        type: "error",
        title: "Error",
        description: "Something went wrong. Please try again.",
      });
      return null;
    }

    // 🔹 Handle successful execution
    if (res.success) {
      const { responseMessage, complianceOfficerApprovals, totalRecords } =
        res.result;
      const message = getMessage(responseMessage);

      // Case 1 → Data Available
      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_SearchComplianceOfficerReconcileTransactionRequest_01"
      ) {
        return {
          transactions: complianceOfficerApprovals || [],
          totalRecords: totalRecords || 0,
        };
      }

      // Case 2 → No Data Available
      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_SearchComplianceOfficerReconcileTransactionRequest_02"
      ) {
        return {
          transactions: [],
          totalRecords: 0,
        };
      }

      // Case 3 → Other messages (warnings, exceptions)
      if (message) {
        showNotification({
          type: "warning",
          title: message,
          description: "No reconcile transactions found.",
        });
      }

      return null;
    }

    // 🔹 Handle failure
    showNotification({
      type: "error",
      title: "Fetch Failed",
      description: getMessage(res.message),
    });
    return null;
  } catch (error) {
    // 🔹 Unexpected exception handler
    showNotification({
      type: "error",
      title: "Error",
      description: "An unexpected error occurred.",
    });
    return null;
  }
  // No blanket showLoader(false) here — the caller's fetchApiCall owns
  // loader show/hide via its own `loader` flag, specifically so
  // MQTT-triggered background refreshes can run silently without
  // touching an unrelated in-flight loader (e.g. the Compliant/
  // Non-Compliant submit flow's own loader).
};

// 🔹 SearchComplianceOfficerReconcilePortfolioRequest
export const SearchComplianceOfficerReconcilePortfolioRequest = async ({
  callApi,
  showNotification,
  showLoader,
  requestdata,
  navigate,
}) => {
  try {
    // 🔹 API Call
    const res = await callApi({
      requestMethod: import.meta.env
        .VITE_SEARCH_COMPLIANCE_OFFICER_RECONCILE_PORTFOLIO_REQUEST_METHOD,
      endpoint: import.meta.env.VITE_API_TRADE,
      requestData: requestdata,
      navigate,
    });

    // 🔹 Handle session expiry
    if (handleExpiredSession(res, navigate, showLoader)) return null;

    // 🔹 Validate API execution
    if (!res?.result?.isExecuted) {
      showNotification({
        type: "error",
        title: "Error",
        description: "Something went wrong. Please try again.",
      });
      return null;
    }

    // 🔹 Handle successful execution
    if (res.success) {
      const {
        responseMessage,
        complianceOfficerApprovalsPortfolio,
        totalRecords,
      } = res.result;
      const message = getMessage(responseMessage);

      // Case 1 → Data Available
      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_SearchComplianceOfficerReconcilePortfolioRequest_01"
      ) {
        return {
          portfolios: complianceOfficerApprovalsPortfolio || [],
          totalRecords: totalRecords || 0,
        };
      }

      // Case 2 → No Data Available
      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_SearchComplianceOfficerReconcilePortfolioRequest_02"
      ) {
        return {
          portfolios: [],
          totalRecords: 0,
        };
      }

      // Case 3 → Other messages (warnings, exceptions)
      if (message) {
        showNotification({
          type: "warning",
          title: message,
          description: "No reconcile portfolios found.",
        });
      }

      return null;
    }

    // 🔹 Handle failure
    showNotification({
      type: "error",
      title: "Fetch Failed",
      description: getMessage(res.message),
    });
    return null;
  } catch (error) {
    // 🔹 Unexpected exception handler
    showNotification({
      type: "error",
      title: "Error",
      description: "An unexpected error occurred.",
    });
    return null;
  }
  // No blanket showLoader(false) here — the caller's fetchApiCall owns
  // loader show/hide via its own `loader` flag, specifically so
  // MQTT-triggered background refreshes can run silently without
  // touching an unrelated in-flight loader (e.g. the Compliant/
  // Non-Compliant submit flow's own loader).
};

//Get All View Details By rECONCILE pORTFOLIO tRANSACTION Trade Approval ID
export const GetAllReconcilePortfolioTransactionRequest = async ({
  callApi,
  showNotification,
  showLoader,
  requestdata,
  navigate,
}) => {
  try {
    console.log("Check APi");
    const res = await callApi({
      requestMethod: import.meta.env
        .VITE_GET_COMPLIANCE_OFFICER_RECONCILE_PORTFOLIO_REQUEST_METHOD,
      endpoint: import.meta.env.VITE_API_TRADE,
      requestData: requestdata,
      navigate,
    });
    if (handleExpiredSession(res, navigate, showLoader)) return null;

    if (!res?.result?.isExecuted) {
      console.log("Check APi");
      showNotification({
        type: "error",
        title: "Error",
        description: "Something went wrong. Please try again.",
      });
      return null;
    }

    if (res.success) {
      const {
        responseMessage,
        assetTypes,
        details,
        hierarchyDetails,
        requesterName,
        workFlowStatus,
        myActionStatusID,
        myActionStatus,
      } = res.result;

      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_GetComplianceOfficerViewDetailsByTradeApprovalID_01"
      ) {
        console.log("Check APi");
        return {
          assetTypes: assetTypes || [],
          details: details || [],
          hierarchyDetails: hierarchyDetails || [],
          requesterName: requesterName || "",
          workFlowStatus: workFlowStatus || {},
          myActionStatusID: myActionStatusID ?? null,
          myActionStatus: myActionStatus || "",
        };
      }

      showNotification({
        type: "warning",
        title: getMessage(responseMessage),
        description: "No details available for this Trade Approval ID.",
      });
      return {
        assetTypes: [],
        details: [],
        hierarchyDetails: [],
        requesterName: "",
        workFlowStatus: {},
        myActionStatusID: null,
        myActionStatus: "",
      };
    }

    showNotification({
      type: "error",
      title: "Fetch Failed",
      description: getMessage(res.message),
    });
    return null;
  } catch (error) {
    showNotification({
      type: "error",
      title: "Error",
      description: "An unexpected error occurred.",
    });
    return null;
  } finally {
    showLoader(false);
  }
};

//UPDATE Compliance REQUEST STATUS API START HERE
export const UpdatedComplianceOfficerTransactionRequest = async ({
  callApi,
  showNotification,
  showLoader,
  requestdata,
  setNoteGlobalModal,
  setCompliantApproveModal,
  setNonCompliantDeclineModal,
  setCompliantPortfolioApproveModal,
  setNonCompliantPortfolioDeclineModal,
  submitText,
  setValue,
  navigate,
}) => {
  try {
    // 🔹 Call the API
    const res = await callApi({
      requestMethod: import.meta.env
        .VITE_UPDATE_COMPLIANCE_OFFICER_TRANSACTION_REQUEST_METHOD,
      endpoint: import.meta.env.VITE_API_TRADE,
      requestData: requestdata,
      navigate,
    });

    //  Check if session has expired
    if (handleExpiredSession(res, navigate, showLoader)) return false;

    // If execution failed
    if (!res?.result?.isExecuted) {
      // CORRECTED (2026-08-07_update_transaction_status_policy_violation_
      // no_longer_blocks.md, refined same-day): marking Compliant on a
      // transaction that violates an assigned policy is still blocked
      // (isExecuted: false) - only marking the same transaction
      // Non-Compliant now succeeds. violatedPolicies comes back populated
      // on this specific failure - surface why instead of the generic
      // message, since retrying identically will always hit the same
      // block; only choosing Non-Compliant gets past it.
      const violatedPolicies = res?.result?.violatedPolicies;
      if (Array.isArray(violatedPolicies) && violatedPolicies.length > 0) {
        const policyCodes = violatedPolicies
          .map((p) => p?.policyCode)
          .filter(Boolean)
          .join(", ");
        showNotification({
          type: "error",
          title: "Cannot Mark Compliant",
          description: policyCodes
            ? `This transaction breaches ${
                violatedPolicies.length > 1 ? "policies" : "policy"
              } ${policyCodes} and cannot be marked Compliant. Mark it Non-Compliant instead.`
            : "This transaction breaches an assigned policy and cannot be marked Compliant. Mark it Non-Compliant instead.",
        });
      } else {
        showNotification({
          type: "error",
          title: "Error",
          description: "Something went wrong. Please try again.",
        });
      }
      showLoader(false);
      return false;
    }

    // If API response is successful
    if (res.success) {
      const { responseMessage } = res.result;

      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_UpdateTransactionRequestStatus_01"
      ) {
        // Reaching here with violatedPolicies populated means this was a
        // Non-Compliant submission on a violating transaction - the one
        // combination that now succeeds instead of blocking (Compliant on
        // the same violation is still blocked, handled in the
        // isExecuted:false branch above). Logged server-side for the
        // Policy Breaches report either way; surfaced here as a heads-up
        // since the submission otherwise proceeds silently
        // (2026-08-07_update_transaction_status_policy_violation_no_
        // longer_blocks.md).
        const violatedPolicies = res.result?.violatedPolicies;
        if (Array.isArray(violatedPolicies) && violatedPolicies.length > 0) {
          const policyCodes = violatedPolicies
            .map((p) => p?.policyCode)
            .filter(Boolean)
            .join(", ");
          showNotification({
            type: "warning",
            title: "Policy Violation Noted",
            description: policyCodes
              ? `This transaction breaches ${
                  violatedPolicies.length > 1 ? "policies" : "policy"
                } ${policyCodes}. Logged for the Policy Breaches report.`
              : "This transaction breaches an assigned policy. Logged for the Policy Breaches report.",
          });
        }

        setNoteGlobalModal({ visible: false, action: null });
        if (
          submitText === "Compliant" ||
          submitText === "HOC-Compliant" ||
          submitText === "HOC-Portfolio-Compliant"
        ) {
          setCompliantApproveModal(true);
          setValue("");
        } else if (submitText === "Portfolio-Compliant") {
          setCompliantPortfolioApproveModal(true);
          setValue("");
        } else if (submitText === "Portfolio-Non-Compliant") {
          setNonCompliantPortfolioDeclineModal(true);
          setValue("");
        } else if (
          submitText === "Non-Compliant" ||
          submitText === "HOC-NOC-Compliant" ||
          submitText === "HOC-Portfolio-Non-Compliant"
        ) {
          setNonCompliantDeclineModal(true);
          setValue("");
        }

        // Loader stays up until the Compliant/Non-Compliant confirmation
        // modal has actually been told to open above — only then hide it.
        showLoader(false);
        return true;
      }

      //  Other known warnings
      showNotification({
        type: "warning",
        title: getMessage(responseMessage),
      });
      showLoader(false);
      return false;
    }

    //  Fallback error for unknown failures
    showNotification({
      type: "error",
      title: "Request Failed",
      description: getMessage(res.message),
    });
    showLoader(false);
    return false;
  } catch (error) {
    // Exception: no modal is opening, so hide the loader immediately
    showNotification({
      type: "error",
      title: "Error",
      description: "An unexpected error occurred.",
    });
    showLoader(false);
    return false;
  }
};

// 🔹 SearchComplianceOfficerReconcileTransactionRequest
export const SearchHeadOfComplianceEscalatedTransactionsAPI = async ({
  callApi,
  showNotification,
  showLoader,
  requestdata,
  navigate,
}) => {
  try {
    // 🔹 API Call
    const res = await callApi({
      requestMethod: import.meta.env
        .VITE_SEARCH_HEAD_OF_COMPLIANCE_OFFICER_RECONCILE_TRANSACTIONS_REQUEST_METHOD,
      endpoint: import.meta.env.VITE_API_TRADE,
      requestData: requestdata,
      navigate,
    });

    // 🔹 Handle session expiry
    if (handleExpiredSession(res, navigate, showLoader)) return null;

    // 🔹 Validate API execution
    if (!res?.result?.isExecuted) {
      showNotification({
        type: "error",
        title: "Error",
        description: "Something went wrong. Please try again.",
      });
      return null;
    }

    // 🔹 Handle successful execution
    if (res.success) {
      const { responseMessage, headOfComplianceApprovals, totalRecords } =
        res.result;
      const message = getMessage(responseMessage);

      // Case 1 → Data Available
      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_SearchHeadOfComplianceEscalatedTransactions_01"
      ) {
        return {
          transactions: headOfComplianceApprovals || [],
          totalRecords: totalRecords || 0,
        };
      }

      // Case 2 → No Data Available
      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_SearchHeadOfComplianceEscalatedTransactions_02"
      ) {
        return {
          transactions: [],
          totalRecords: 0,
        };
      }

      // Case 3 → Other messages (warnings, exceptions)
      if (message) {
        showNotification({
          type: "warning",
          title: message,
          description: "No reconcile transactions found.",
        });
      }

      return null;
    }

    // 🔹 Handle failure
    showNotification({
      type: "error",
      title: "Fetch Failed",
      description: getMessage(res.message),
    });
    return null;
  } catch (error) {
    // 🔹 Unexpected exception handler
    showNotification({
      type: "error",
      title: "Error",
      description: "An unexpected error occurred.",
    });
    return null;
  } finally {
    // 🔹 Always stop loader
    showLoader(false);
  }
};

// 🔹 SearchHeadOfComplianceEscalatedPortfolio
export const SearchHeadOfComplianceEscalatedPortfolioAPI = async ({
  callApi,
  showNotification,
  showLoader,
  requestdata,
  navigate,
}) => {
  try {
    // 🔹 API Call
    const res = await callApi({
      requestMethod: import.meta.env
        .VITE_SEARCH_HEAD_OF_COMPLIANCE_OFFICER_RECONCILE_ESCALATED_PORTFOLIO_REQUEST_METHOD,
      endpoint: import.meta.env.VITE_API_TRADE,
      requestData: requestdata,
      navigate,
    });

    // 🔹 Handle session expiry
    if (handleExpiredSession(res, navigate, showLoader)) return null;

    // 🔹 Validate API execution
    if (!res?.result?.isExecuted) {
      showNotification({
        type: "error",
        title: "Error",
        description: "Something went wrong. Please try again.",
      });
      return null;
    }

    // 🔹 Handle successful execution
    if (res.success) {
      const {
        responseMessage,
        headOfComplianceEscalatedPortfolios,
        totalRecords,
      } = res.result;
      const message = getMessage(responseMessage);

      // Case 1 → Data Available
      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_SearchHeadOfComplianceEscalatedPortfolio_01"
      ) {
        return {
          transactions: headOfComplianceEscalatedPortfolios || [],
          totalRecords: totalRecords || 0,
        };
      }

      // Case 2 → No Data Available
      if (
        responseMessage ===
        "PAD_Trade_TradeServiceManager_SearchHeadOfComplianceEscalatedPortfolio_02"
      ) {
        return {
          transactions: [],
          totalRecords: 0,
        };
      }

      // Case 3 → Other messages (warnings, exceptions)
      if (message) {
        showNotification({
          type: "warning",
          title: message,
          description: "No reconcile transactions found.",
        });
      }

      return null;
    }

    // 🔹 Handle failure
    showNotification({
      type: "error",
      title: "Fetch Failed",
      description: getMessage(res.message),
    });
    return null;
  } catch (error) {
    // 🔹 Unexpected exception handler
    showNotification({
      type: "error",
      title: "Error",
      description: "An unexpected error occurred.",
    });
    return null;
  } finally {
    // 🔹 Always stop loader
    showLoader(false);
  }
};

//Get All View Details By rECONCILE pORTFOLIO tRANSACTION Trade Approval ID
export const GetAllComplianceOfficerReconcileTransactionAndPortfolioRequest =
  async ({ callApi, showNotification, showLoader, requestdata, navigate }) => {
    try {
      console.log("handleViewDetailsHeadOfComplianceForReconcileTransaction");

      const res = await callApi({
        requestMethod: import.meta.env
          .VITE_GET_ALL_VIEW_DETAILS_FOR_COMPLIANCE_OFFICER_ESCALATED_TRANSACTION_AND_PORTFOLIO_REQUEST_METHOD,
        endpoint: import.meta.env.VITE_API_TRADE,
        requestData: requestdata,
      });
      if (handleExpiredSession(res, navigate, showLoader)) return null;

      if (!res?.result?.isExecuted) {
        showNotification({
          type: "error",
          title: "Error",
          description: "Something went wrong. Please try again.",
        });
        return null;
      }
      console.log("handleViewDetailsHeadOfComplianceForReconcileTransaction");

      if (res.success) {
        const {
          responseMessage,
          details,
          assetTypes,
          hierarchyDetails,
          workFlowStatus,
          tradedWorkFlowRequests,
          ticketUploaded,
          requesterName,
          escalations,
          transactionDate,
          transactionTime,
        } = res.result;

        if (
          responseMessage ===
          "PAD_Trade_TradeServiceManager_GetAllViewDetailsEscalatedTransactionsAndPortFolioByTradeApprovalID_01"
        ) {
          console.log(
            "handleViewDetailsHeadOfComplianceForReconcileTransaction"
          );

          return {
            details: details || [],
            assetTypes: assetTypes || [],
            hierarchyDetails: hierarchyDetails || [],
            workFlowStatus: workFlowStatus || {},
            tradedWorkFlowRequests: tradedWorkFlowRequests || [],
            ticketUploaded: ticketUploaded || false,
            requesterName: requesterName || "",
            escalations: escalations || [],
            transactionDate: transactionDate || "",
            transactionTime: transactionTime || "",
          };
        }

        showNotification({
          type: "warning",
          title: getMessage(responseMessage),
          description: "No details available for this Trade Approval ID.",
        });
        return {
          details: [],
          assetTypes: [],
          hierarchyDetails: [],
          workFlowStatus: {},
          tradedWorkFlowRequests: [],
          ticketUploaded: false,
          requesterName: "",
          escalations: [],
          transactionDate: "",
          transactionTime: "",
        };
      }

      showNotification({
        type: "error",
        title: "Fetch Failed",
        description: getMessage(res.message),
      });
      return null;
    } catch (error) {
      showNotification({
        type: "error",
        title: "Error",
        description: "An unexpected error occurred.",
      });
      return null;
    } finally {
      showLoader(false);
    }
  };
