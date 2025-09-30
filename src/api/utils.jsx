// src/api/utils.js

import { logout } from "./loginApi";

/**
 * 🔹 Utility function to handle expired user sessions.
 * If the response contains an `expired` flag, it triggers logout flow.
 *
 * @function handleExpiredSession
 * @param {Object} res - The API response object.
 * @param {Function} navigate - React Router's navigation function for redirection.
 * @param {Function} showLoader - Function to toggle loader visibility.
 * @returns {boolean} Returns `true` if session is expired and logout is triggered, otherwise `false`.
 *
 * @example
 * if (handleExpiredSession(response, navigate, showLoader)) return;
 */
export const handleExpiredSession = (res, navigate, showLoader) => {
  if (res?.expired) {
    logout({ navigate, showLoader });
    return true;
  }
  return false;
};

/**
 * 🔹 Centralized response code → human-readable message mapping.
 * Used across multiple APIs (`loginApi`, `dashboardApi`, `myApprovalApi`, `portFolioApi`, etc.)
 *
 * Keys represent unique backend response codes.
 * Values are user-friendly messages for notifications.
 *
 * @constant {Object} responseMessages
 */
export const responseMessages = {
  // ==============================
  // 🔐 Login API (loginApi.jsx)
  // ==============================
  ERM_Auth_AuthServiceManager_Login_01: "Login Successful",
  ERM_Auth_AuthServiceManager_Login_02: "Login Failed",
  ERM_Auth_AuthServiceManager_Login_03:
    "User is temporarily disabled and cannot login",
  ERM_Auth_AuthServiceManager_Login_04: "Account permanently closed",
  ERM_Auth_AuthServiceManager_Login_05:
    "Account inactive; requires reactivation",
  ERM_Auth_AuthServiceManager_Login_06: "An error occurred. Please try again.",
  ERM_Auth_AuthServiceManager_Login_07: "Please fill both fields",

  // ==============================
  // 📊 Dashboard API (dashboardApi.jsx)
  // ==============================
  PAD_Trade_TradeServiceManager_SearchTradeApprovals_01: "Data Available",
  PAD_Trade_TradeServiceManager_SearchTradeApprovals_02: "No data available",
  PAD_Trade_TradeServiceManager_SearchTradeApprovals_03: "Exception",

  PAD_Trade_TradeServiceManager_GetUserDashBoardStats_01: "Data Available",
  PAD_Trade_TradeServiceManager_GetUserDashBoardStats_02: "No data available",
  PAD_Trade_TradeServiceManager_GetUserDashBoardStats_03: "Exception",

  PAD_Trade_TradeServiceManager_GetAllEmployeeBrokers_01: "Data Available",
  PAD_Trade_TradeServiceManager_GetAllEmployeeBrokers_02: "No data available",
  PAD_Trade_TradeServiceManager_GetAllEmployeeBrokers_03: "Exception",

  PAD_Trade_TradeServiceManager_GetAllInstruments_01: "Data Available",
  PAD_Trade_TradeServiceManager_GetAllInstruments_02: "No data available",
  PAD_Trade_TradeServiceManager_GetAllInstruments_03: "Exception",

  PAD_Trade_TradeServiceManager_GetAllTradeApprovalTypes_01: "Data Available",
  PAD_Trade_TradeServiceManager_GetAllTradeApprovalTypes_02:
    "No data available",
  PAD_Trade_TradeServiceManager_GetAllTradeApprovalTypes_03: "Exception",

  // ==============================
  // 📑 Predefined Reasons API
  // ==============================
  PAD_Trade_TradeServiceManager_GetAllPredefinedReasons_01: "Data Available",
  PAD_Trade_TradeServiceManager_GetAllPredefinedReasons_02: "No data available",
  PAD_Trade_TradeServiceManager_GetAllPredefinedReasons_03: "Exception",

  // ==============================
  // ✅ My Approvals API (myApprovalApi.jsx)
  // ==============================
  PAD_Trade_TradeServiceManager_AddTradeApprovalRequest_01:
    "Trade Approval Request Submitted",
  PAD_Trade_TradeServiceManager_AddTradeApprovalRequest_02:
    "Failed to save Trade Approval Request",
  PAD_Trade_TradeServiceManager_AddTradeApprovalRequest_03: "Exception",
  PAD_Trade_TradeServiceManager_AddTradeApprovalRequest_04:
    "No User hierarchy Found",
  PAD_Trade_TradeServiceManager_AddTradeApprovalRequest_05: "Work Flow Update",
  PAD_Trade_TradeServiceManager_AddTradeApprovalRequest_06:
    "Resubmission Successful",
  PAD_Trade_TradeServiceManager_AddTradeApprovalRequest_07:
    "Resubmission Failed",

  PAD_Trade_TradeServiceManager_GetAllViewDetailsByTradeApprovalID_01:
    "Data Available",
  PAD_Trade_TradeServiceManager_GetAllViewDetailsByTradeApprovalID_02:
    "No data available",
  PAD_Trade_TradeServiceManager_GetAllViewDetailsByTradeApprovalID_03:
    "Exception",

  // =============================
  // LINE MANAGER API'S RESPONSES FROM START HERE

  PAD_Trade_TradeServiceManager_SearchLineManagerApprovalsRequest_01:
    "Data Available",
  PAD_Trade_TradeServiceManager_SearchLineManagerApprovalsRequest_02:
    "No data available",
  PAD_Trade_TradeServiceManager_SearchLineManagerApprovalsRequest_03:
    "Exception",

  //Update Line Manager API
  PAD_Trade_TradeServiceManager_UpdateApprovalRequestStatus_01:
    "Successfully updated",
  PAD_Trade_TradeServiceManager_UpdateApprovalRequestStatus_02:
    "No update performed",
  PAD_Trade_TradeServiceManager_UpdateApprovalRequestStatus_03: "Exception",
  PAD_Trade_TradeServiceManager_UpdateApprovalRequestStatus_04:
    "User role not found",
  PAD_Trade_TradeServiceManager_UpdateApprovalRequestStatus_05:
    "Not authorized (Not Line Manager)",

  // GET ALL VIEW DETAILS LINE MANAGER API
  PAD_Trade_TradeServiceManager_GetLineManagerViewDetailsByTradeApprovalID_01:
    "Data Available",
  PAD_Trade_TradeServiceManager_GetLineManagerViewDetailsByTradeApprovalID_02:
    "No data available",
  PAD_Trade_TradeServiceManager_GetLineManagerViewDetailsByTradeApprovalID_03:
    "Exception",

  // UPDATE DATA ON HIT OF RESUBMIT BY SELECTING PREDEFINE REASON
  PAD_Trade_TradeServiceManager_ResubmitApprovalRequest_01:
    "Resubmission Successful",
  PAD_Trade_TradeServiceManager_ResubmitApprovalRequest_02:
    "Resubmission Failed",
  PAD_Trade_TradeServiceManager_ResubmitApprovalRequest_03: "Exception",
  PAD_Trade_TradeServiceManager_ResubmitApprovalRequest_04:
    "please Select a reason for resubmitting",
  PAD_Trade_TradeServiceManager_ResubmitApprovalRequest_5:
    "Failed to generate ApprovalID",

  // LINE MANAGER API'S RESPONSES FROM END HERE
  // =============================

  // ==============================
  // 📂 Portfolio API (portFolioApi.jsx)
  // ==============================

  // SearchEmployeePendingUploadedPortFolio
  PAD_Trade_TradeServiceManager_SearchEmployeePendingUploadedPortFolio_01:
    "Data Available",
  PAD_Trade_TradeServiceManager_SearchEmployeePendingUploadedPortFolio_02:
    "No data available",
  PAD_Trade_TradeServiceManager_SearchEmployeePendingUploadedPortFolio_03:
    "Exception",

  // Upload Portfolio start Here
  PAD_Trade_TradeServiceManager_UploadPortFolioRequest_01:
    "Upload Portfolio Request Submitted",
  PAD_Trade_TradeServiceManager_UploadPortFolioRequest_02:
    "Failed to save Upload PortFolio Request",
  PAD_Trade_TradeServiceManager_UploadPortFolioRequest_03:
    "No User hierarchy Found",
  PAD_Trade_TradeServiceManager_UploadPortFolioRequest_04: "Exception",
  PAD_Trade_TradeServiceManager_UploadPortFolioRequest_05:
    "Failed to generate ApprovalID",

  // SearchEmployeeApprovedUploadedPortFolio
  PAD_Trade_TradeServiceManager_SearchEmployeeApprovedUploadedPortFolio_01:
    "Data Available",
  PAD_Trade_TradeServiceManager_SearchEmployeeApprovedUploadedPortFolio_02:
    "No data available",
  PAD_Trade_TradeServiceManager_SSearchEmployeeApprovedUploadedPortFolio_03:
    "Exception",

  // Conduct Transaction Api Response Data
  PAD_Trade_TradeServiceManager_CondcutTransactionRequest_01:
    "Transaction Conducted",
  PAD_Trade_TradeServiceManager_CondcutTransactionRequest_02:
    "Transaction Not Conducted",
  PAD_Trade_TradeServiceManager_CondcutTransactionRequest_03: "Exception",
  PAD_Trade_TradeServiceManager_CondcutTransactionRequest_04:
    "User Hierarchy Not Found",
  PAD_Trade_TradeServiceManager_CondcutTransactionRequest_05:
    "TradeApprovalID Missing on which Transaction has to be performed",
  PAD_Trade_TradeServiceManager_CondcutTransactionRequest_07:
    "Quantity cannot be more then Approved Quantity",

  // ==============================
  // 📂 My Transaction API (myTransactionsApi.jsx)
  // ==============================
  PAD_Trade_TradeServiceManager_SearchEmployeeTransactio_01: "Data Available",
  PAD_Trade_TradeServiceManager_SearchEmployeeTransactio_02:
    "No data available",
  PAD_Trade_TradeServiceManager_SearchEmployeeTransactio_03: "Exception",

  // ==============================
  // 📂 GET ALL TRANSACTION VIEW DETAIL (myTransactionsApi.jsx)
  // ==============================
  PAD_Trade_TradeServiceManager_GetAllViewDetailsTransactionsByTradeApprovalID_01:
    "Data Available",
  PAD_Trade_TradeServiceManager_GetAllViewDetailsTransactionsByTradeApprovalID_02:
    "No data available",
  PAD_Trade_TradeServiceManager_GetAllViewDetailsTransactionsByTradeApprovalID_03:
    "Exception",

  // ==============================
  // 📂Reconsile  (reconsile.jsx)
  // ==============================
  PAD_Trade_TradeServiceManager_SearchComplianceOfficerReconcileTransactionRequest_01:
    "Data Available",
  PAD_Trade_TradeServiceManager_SearchComplianceOfficerReconcileTransactionRequest_02:
    "No data available",
  PAD_Trade_TradeServiceManager_SearchComplianceOfficerReconcileTransactionRequest_03:
    "Exception",

  PAD_Trade_TradeServiceManager_SearchComplianceOfficerReconcilePortfolioRequest_01:
    "Data Available",
  PAD_Trade_TradeServiceManager_SearchComplianceOfficerReconcilePortfolioRequest_02:
    "No data available",
  PAD_Trade_TradeServiceManager_SearchComplianceOfficerReconcilePortfolioRequest_03:
    "Exception",

  PAD_Trade_TradeServiceManager_GetComplianceOfficerViewDetailsByTradeApprovalID_01:
    "Data Available",
  PAD_Trade_TradeServiceManager_GetComplianceOfficerViewDetailsByTradeApprovalID_02:
    "No data available",
  PAD_Trade_TradeServiceManager_GetComplianceOfficerViewDetailsByTradeApprovalID_03:
    "Exception",

  PAD_Trade_TradeServiceManager_UpdateTransactionRequestStatus_01:
    "Successfully updated",
  PAD_Trade_TradeServiceManager_UpdateTransactionRequestStatus_02:
    "No update performed",
  PAD_Trade_TradeServiceManager_UpdateTransactionRequestStatus_03: "Exception",
  PAD_Trade_TradeServiceManager_UpdateTransactionRequestStatus_04:
    "User role not found",
  PAD_Trade_TradeServiceManager_UpdateTransactionRequestStatus_05:
    "Not authorized (Not Compliance)",

  // upload document
  Settings_SettingsServiceManager_UploadDocuments_01:
    "Document Uploaded Successfull",
  Settings_SettingsServiceManager_UploadDocuments_02: "No Document Uploaded",
  Settings_SettingsServiceManager_UploadDocuments_03: "Exception",

  // SaveFiles
  Settings_SettingsServiceManager_SaveFiles_01: "Files saved successfully",
  Settings_SettingsServiceManager_SaveFiles_02: "Failed to save any file",
  Settings_SettingsServiceManager_SaveFiles_03: "Exception",
  Settings_SettingsServiceManager_SaveFiles_04: "Delete failed",

  // GetWorkFlowFiles
  Settings_SettingsServiceManager_GetWorkFlowFiles_01: "Data found",
  Settings_SettingsServiceManager_GetWorkFlowFiles_02: "No data",
  Settings_SettingsServiceManager_GetWorkFlowFiles_03: "Exception",
  Settings_SettingsServiceManager_GetWorkFlowFiles_04: "Invalid request",

  // GetAnnotationOfFilesAttachement
  Settings_SettingsServiceManager_GetAnnotationOfFilesAttachement_01:
    " Data Available",
  Settings_SettingsServiceManager_GetAnnotationOfFilesAttachement_02:
    "No data available",
  Settings_SettingsServiceManager_GetAnnotationOfFilesAttachement_03:
    "Exception",

  // ==============================
  // 📂Escalated Approvals  (Head Of Trade Approvals(escalatedApprovals.jsx))
  // ==============================
  PAD_Trade_TradeServiceManager_SearchHTAEscalatedApprovalsRequest_01:
    "Data Available",
  PAD_Trade_TradeServiceManager_SearchHTAEscalatedApprovalsRequest_02:
    "No data available",
  PAD_Trade_TradeServiceManager_SearchHTAEscalatedApprovalsRequest_03:
    "Exception",

  PAD_Trade_TradeServiceManager_GetHTAViewDetailsByTradeApprovalID_01:
    "Data Available",
  PAD_Trade_TradeServiceManager_GetHTAViewDetailsByTradeApprovalID_02:
    "No data available",
  PAD_Trade_TradeServiceManager_GetHTAViewDetailsByTradeApprovalID_03:
    "Exception",
};

/**
 * 🔹 Utility to extract a user-friendly message by response code
 *
 * @param {string|number} code - Response code from API
 * @returns {string} Mapped message or fallback error message
 */
export const getMessage = (code) => {
  const msg = responseMessages[code];
  if (msg === "Data Available" || msg === "No data available") {
    return "";
  }
  return msg || "Something went wrong. Please try again.";
};
