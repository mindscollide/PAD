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
  ERM_Auth_AuthServiceManager_Login_02: "Username could not be verified",
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
  PAD_Trade_TradeServiceManager_AddTradeApprovalRequest_08:
    "Failed to generate ApprovalID",
  PAD_Trade_TradeServiceManager_AddTradeApprovalRequest_09: "Invalid Quantity",
  PAD_Trade_TradeServiceManager_AddTradeApprovalRequest_10: "Policy Violated",

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
    "please Select a Notes for resubmitting",
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
    "Data Available",
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

  // ==============================
  // 📂Escalated Verification and Portfolio (Head Of Compliance (HOC))
  // ==============================

  // SearchHeadOfComplianceEscalatedTransactions
  PAD_Trade_TradeServiceManager_SearchHeadOfComplianceEscalatedTransactions_01:
    "Data Available",
  PAD_Trade_TradeServiceManager_SearchHeadOfComplianceEscalatedTransactions_02:
    "No data available",
  PAD_Trade_TradeServiceManager_SearchHeadOfComplianceEscalatedTransactions_03:
    "Exception",

  // SearchHeadOfComplianceEscalatedPortfolio
  PAD_Trade_TradeServiceManager_SearchHeadOfComplianceEscalatedPortfolio_01:
    "Data Available",
  PAD_Trade_TradeServiceManager_SearchHeadOfComplianceEscalatedPortfolio_02:
    "No data available",
  PAD_Trade_TradeServiceManager_SearchHeadOfComplianceEscalatedPortfolio_03:
    "Exception",

  // GetAllViewDetailsEscalatedTransactionsAndPortFolioByTradeApprovalID
  PAD_Trade_TradeServiceManager_GetAllViewDetailsEscalatedTransactionsAndPortFolioByTradeApprovalID_01:
    "Data Available",
  PAD_Trade_TradeServiceManager_GetAllViewDetailsEscalatedTransactionsAndPortFolioByTradeApprovalID_02:
    "No data available",
  PAD_Trade_TradeServiceManager_GetAllViewDetailsEscalatedTransactionsAndPortFolioByTradeApprovalID_03:
    "Exception",

  // For Employee History Search Api
  PAD_Trade_TradeServiceManager_EmployeeHistoryWorkFlowDetails_01:
    "Data Available",
  PAD_Trade_TradeServiceManager_EmployeeHistoryWorkFlowDetails_02:
    "No data available",
  PAD_Trade_TradeServiceManager_EmployeeHistoryWorkFlowDetails_03: "Exception",

  // ==============================
  // 📂Web Notification  (Employee Role)
  // ==============================

  Settings_SettingsServiceManager_GetUserWebNotifications_01: "Data Available",
  Settings_SettingsServiceManager_GetUserWebNotifications_02:
    "No data available",
  Settings_SettingsServiceManager_GetUserWebNotifications_03: "Exception",

  //Mark As Read Notification Api
  Settings_SettingsServiceManager_MarkNotificationsAsRead_01: "Successfull",
  Settings_SettingsServiceManager_MarkNotificationsAsRead_02:
    "Invalid Request Data",
  Settings_SettingsServiceManager_MarkNotificationsAsRead_03: "UnSuccessfull",
  Settings_SettingsServiceManager_MarkNotificationsAsRead_04: "Exception",

  // ==============================
  // Brokers  (Admin Role)
  // ==============================

  PAD_Admin_GetBrokers_01: "Data found",
  PAD_Admin_GetBrokers_02: "No data found",
  PAD_Admin_GetBrokers_03: "Exception occurred",

  PAD_Admin_AddBroker_01: "Invalid input",
  PAD_Admin_AddBroker_02: "Successfully inserted all",
  PAD_Admin_AddBroker_03: "Insert failed",
  PAD_Admin_AddBroker_04: "Exception occurred",

  PAD_Admin_UpdateBroker_01: "Invalid input",
  PAD_Admin_UpdateBroker_02: "Successfully updated",
  PAD_Admin_UpdateBroker_03: " Update failed",
  PAD_Admin_UpdateBroker_04: "Exception occurred",

  PAD_Admin_UpdateBrokerStatus_01: "Invalid input",
  PAD_Admin_UpdateBrokerStatus_02: "Successfully updated",
  PAD_Admin_UpdateBrokerStatus_03: "Update failed or broker not found",
  PAD_Admin_UpdateBrokerStatus_04: "Exception occurred",

  PAD_Admin_GetInstrumentsWithClosingPeriod_01: "Data found",
  PAD_Admin_GetInstrumentsWithClosingPeriod_02: "No data found",
  PAD_Admin_GetInstrumentsWithClosingPeriod_03: "Exception occurred",

  PAD_Admin_CheckGroupTitleExists_01: "Exist",
  PAD_Admin_CheckGroupTitleExists_02: "Not Exist",
  PAD_Admin_CheckGroupTitleExists_03: "Exception occurred",

  Admin_AdminServiceManager_GetPoliciesForGroupPolicyPanel_01: "Data found",
  Admin_AdminServiceManager_GetPoliciesForGroupPolicyPanel_02: "No data found",
  Admin_AdminServiceManager_GetPoliciesForGroupPolicyPanel_03:
    "Exception occurred",

  PAD_GroupPolicyServiceManager_AddGroupPolicy_01: "Invalid or missing input",
  PAD_GroupPolicyServiceManager_AddGroupPolicy_02: "Success",
  PAD_GroupPolicyServiceManager_AddGroupPolicy_03:
    "Failed to create Group Policy",
  PAD_GroupPolicyServiceManager_AddGroupPolicy_04: "Exception occurred",
  PAD_GroupPolicyServiceManager_AddGroupPolicy_05:
    "UnauthorizedUser (Not Admin)",

  PAD_Admin_GetGroupPoliciesList_01: "Exist",
  PAD_Admin_GetGroupPoliciesList_02: "Not Exist",
  PAD_Admin_GetGroupPoliciesList_03: "Exception occurred",

  Admin_AdminServiceManager_GetGroupPolicyDetails_01: "Exist",
  Admin_AdminServiceManager_GetGroupPolicyDetails_02: "Not Exist",
  Admin_AdminServiceManager_GetGroupPolicyDetails_03: "Exception occurred",

  PAD_GroupPolicyServiceManager_UpdateGroupPolicy_01:
    "Invalid or missing input",
  PAD_GroupPolicyServiceManager_UpdateGroupPolicy_02: "Success",
  PAD_GroupPolicyServiceManager_UpdateGroupPolicy_03:
    "Failed to Update Group Policy",
  PAD_GroupPolicyServiceManager_UpdateGroupPolicy_05: "Exception",
  PAD_GroupPolicyServiceManager_UpdateGroupPolicy_06:
    "UnauthorizedUser (Not Admin)",

  Admin_AdminServiceManager_SearchPoliciesByGroupPolicyID_01: "Data found",
  Admin_AdminServiceManager_SearchPoliciesByGroupPolicyID_02: "No data found",
  Admin_AdminServiceManager_SearchPoliciesByGroupPolicyID_03:
    "Exception occurred",

  Admin_AdminServiceManager_SearchUsersByGroupPolicyID_01: "Data found",
  Admin_AdminServiceManager_SearchUsersByGroupPolicyID_02: "No data found",
  Admin_AdminServiceManager_SearchUsersByGroupPolicyID_03: "Exception occurred",
  PAD_Admin_AddInstrumentClosingPeriod_01: "Invalid input",
  PAD_Admin_AddInstrumentClosingPeriod_02: "Successfully inserted",
  PAD_Admin_AddInstrumentClosingPeriod_03: "Insert failed",
  PAD_Admin_AddInstrumentClosingPeriod_04: "Exception occurred",

  PAD_Admin_GetUpcomingClosingPeriods_01: "Data found",
  PAD_Admin_GetUpcomingClosingPeriods_02: "No data found",
  PAD_Admin_GetUpcomingClosingPeriods_03: "Exception occurred",
  PAD_Admin_GetUpcomingClosingPeriods_04: "Invalid input",

  PAD_Admin_DeleteInstrumentClosingPeriod_01: "Invalid input",
  PAD_Admin_DeleteInstrumentClosingPeriod_02: "Successfully deleted",
  PAD_Admin_DeleteInstrumentClosingPeriod_03:
    "Deletion failed or record not found",
  PAD_Admin_DeleteInstrumentClosingPeriod_04: "Exception occurred",

  PAD_Admin_GetPreviousClosingPeriods_01: "Data found",
  PAD_Admin_GetPreviousClosingPeriods_02: "No data found",
  PAD_Admin_GetPreviousClosingPeriods_03: "Exception occurred",
  PAD_Admin_GetPreviousClosingPeriods_04: "Invalid input",

  //For Manage User UsersTab listing messages
  Admin_AdminServiceManager_GetAllEmployeesWithAssignedManageUsersUserTabPolicies_01:
    "Data found",
  Admin_AdminServiceManager_GetAllEmployeesWithAssignedManageUsersUserTabPolicies_02:
    "No data found",
  Admin_AdminServiceManager_GetAllEmployeesWithAssignedManageUsersUserTabPolicies_03:
    "Exception occurred",

  //For Manage User UserTab View Detail Messages
  Admin_AdminServiceManager_GetUserFullDetailsByEmployeeID_01: "Data found",
  Admin_AdminServiceManager_GetUserFullDetailsByEmployeeID_02: "No data found",
  Admin_AdminServiceManager_GetUserFullDetailsByEmployeeID_03:
    "Exception occurred",
  Admin_AdminServiceManager_GetUserFullDetailsByEmployeeID_04:
    "Invalid Request",

  // For Line Manager in ManageUser Users Tab in View Detail Modal on Drop Down
  Admin_AdminServiceManager_GetAllLineManagers_01: "Data found",
  Admin_AdminServiceManager_GetAllLineManagers_02: "No data found",
  Admin_AdminServiceManager_GetAllLineManagers_03: "Exception occurred",

  // For Compliance Officer in ManageUser Users Tab in View Detail Modal on Drop Down
  Admin_AdminServiceManager_GetAllComplianceOfficer_01: "Data found",
  Admin_AdminServiceManager_GetAllComplianceOfficer_02: "Data found",
  Admin_AdminServiceManager_GetAllComplianceOfficer_03: "Data found",

  Admin_AdminServiceManager_GetPendingUserRegistrationRequests_01: "Data found",
  Admin_AdminServiceManager_GetPendingUserRegistrationRequests_02:
    "No data found",
  Admin_AdminServiceManager_GetPendingUserRegistrationRequests_03:
    "Exception occurred",

  // For Update Employee Manager in Manage User Users Tab  View Detail Modal Request in Admin on Save
  Admin_AdminServiceManager_UpdateEmployeeManager_01: "Invalid Request",
  Admin_AdminServiceManager_UpdateEmployeeManager_02: "Success",
  Admin_AdminServiceManager_UpdateEmployeeManager_03: "Failed to Update",
  Admin_AdminServiceManager_UpdateEmployeeManager_04: "Exception",

  Admin_AdminServiceManager_GetRejectedUserRegistrationRequests_01:
    "Data found",
  Admin_AdminServiceManager_GetRejectedUserRegistrationRequests_02:
    "No data found",
  Admin_AdminServiceManager_GetRejectedUserRegistrationRequests_03:
    "Exception occurred",

  //For Roles & Policies while standing on view Detail Modal on manage user Users Tab
  Admin_AdminServiceManager_GetUserDetailsWithRoles_01: "Data found",
  Admin_AdminServiceManager_GetUserDetailsWithRoles_02: "No data found",
  Admin_AdminServiceManager_GetUserDetailsWithRoles_03: "Exception occurred",

  Admin_AdminServiceManager_GetPredefinedReasonsByAdmin_01: "Data found",
  Admin_AdminServiceManager_GetPredefinedReasonsByAdmin_02: "No data found",
  Admin_AdminServiceManager_GetPredefinedReasonsByAdmin_03:
    "Exception occurred",

  // GetAllExistingGroupPolicies TO show group policies in dropdown of Edit Roles And Policies
  Admin_AdminServiceManager_GetAllExistingGroupPolicies_01: "Data found",
  Admin_AdminServiceManager_GetAllExistingGroupPolicies_02: "No data found",
  Admin_AdminServiceManager_GetAllExistingGroupPolicies_03:
    "Exception occurred",

  Admin_AdminServiceManager_GetUserRegistrationHistoryByLoginID_01:
    "Data found",
  Admin_AdminServiceManager_GetUserRegistrationHistoryByLoginID_02:
    "No data found",
  Admin_AdminServiceManager_GetUserRegistrationHistoryByLoginID_03:
    "Exception occurred",

  // GetAllUserRoles TO ROLES IN CHECKBOX of Edit Roles And Policies
  Admin_GetAllUserRoles_01: "Records found",
  Admin_GetAllUserRoles_02: "No Records found",
  Admin_GetAllUserRoles_03: "Exception occurred",

  // For Update Edit Roles And Policies on Manage User in Admin on Save
  PAD_UserServiceManager_UpdateUserDetailsWithRolesAndPolicies_01:
    "Invalid input",
  PAD_UserServiceManager_UpdateUserDetailsWithRolesAndPolicies_02: "Success",
  PAD_UserServiceManager_UpdateUserDetailsWithRolesAndPolicies_03:
    "Update failed",
  PAD_UserServiceManager_UpdateUserDetailsWithRolesAndPolicies_04:
    "Exception occurred",
  PAD_UserServiceManager_UpdateUserDetailsWithRolesAndPolicies_05:
    "Unauthorized User",

  // GetAllSystemConfigurations
  Admin_AdminServiceManager_GetAllSystemConfigurations: "Data found",
  Admin_AdminServiceManager_GetAllSystemConfigurations_02: "No data found",
  Admin_AdminServiceManager_GetAllSystemConfigurations_03: "Exception occurred",

  PAD_Admin_UpdateSystemConfiguration_01: "  Invalid input",
  PAD_Admin_UpdateSystemConfiguration_02: "Successfully updated",
  PAD_Admin_UpdateSystemConfiguration_03: "No rows updated",
  PAD_Admin_UpdateSystemConfiguration_04: "Exception occurred",

  // For Line Manager My Action Search Api
  PAD_Trade_LineManagerActionsWorkflowDetail_01: "Data Available",
  PAD_Trade_LineManagerActionsWorkflowDetail_02: "No data available",
  PAD_Trade_LineManagerActionsWorkflowDetail_03: "Exception",
};

/**
 * 🔹 Utility to extract a user-friendly message by response code
 *
 * @param {string|number} code - Response code from API
 * @returns {string} Mapped message or fallback error message
 */
export const getMessage = (code) => {
  const msg = responseMessages[code];
  if (
    msg === "Data Available" ||
    msg === "No data available" ||
    msg === "Data found" ||
    msg === "No data found" ||
    msg === "Successfully updated" ||
    msg === "Successfully inserted all" ||
    msg === "Exist" ||
    msg === "Not Exist" ||
    msg === "Success"
  ) {
    return "";
  }
  return msg || "Something went wrong. Please try again.";
};
