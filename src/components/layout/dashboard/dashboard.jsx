// src/components/dashboard/Dashboard.jsx
import { Layout } from "antd";
import SideBar from "../sidebar/sidebar";
import "./dashboard_module.css";
import Headers from "../header/header";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef } from "react"; // Added useRef

// Contexts
import { useMqttClient } from "../../../common/mqtt/mqttConnection";
import { useMyApproval } from "../../../context/myApprovalContaxt";
import { useDashboardContext } from "../../../context/dashboardContaxt";
import { usePortfolioContext } from "../../../context/portfolioContax";
import { useTransaction } from "../../../context/myTransaction";
import { useReconcileContext } from "../../../context/reconsileContax";
import { useSidebarContext } from "../../../context/sidebarContaxt";
import { useEscalatedApprovals } from "../../../context/escalatedApprovalContext";
import { useGlobalModal } from "../../../context/GlobalModalContext";
import { useWebNotification } from "../../../context/notificationContext";
import { GetUserWebNotificationRequest } from "../../../api/notification";
import { useNotification } from "../../NotificationProvider/NotificationProvider";
import { useApi } from "../../../context/ApiContext";
import { useGlobalLoader } from "../../../context/LoaderContext";
import { useMyAdmin } from "../../../context/AdminContext";
import {
  ManageBrokerModal,
  MyProfileModal,
  NotificationSettingsModal,
} from "../../../pages";
import { logout } from "../../../api/loginApi";
import { mapEmployeeMyApprovalData } from "../../../pages/main/employes/myApprovals/utils";
const { Content } = Layout;

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const connectionAttemptedRef = useRef(false); // ✅ Track connection attempts

  // Context hooks
  // setIsEmployeeMyApprovalMqtt (full-refetch trigger) no longer used here -
  // every EMPLOYEE_* case that used to set it now patches
  // employeeMyApproval in place via patchEmployeeMyApprovalRow instead.
  const {
    setLineManagerApprovalMQtt,
    setLineManagerApproval,
    setIsEmployeeMyApproval,
    setOverdueVerificationHCOListData,
    setOverdueVerificationHCOMqtt,
  } = useMyApproval();
  const {
    setAdminBrokerMqtt,
    setAdminIntrumentsMqtt,
    setAdminAddDeleteClosingInstrument,
    setManageUsersPendingTabMqtt,
    setManageUsersRejectedRequestTabMQTT,
    manageUsersTabRef,
    // ADDED (2026-08-07): was already scaffolded in AdminContext.jsx but
    // never wired to the MQTT handler - GROUP_POLICY_CREATED/UPDATED had no
    // FE handler at all (see MQTT_Message_Catalog.md).
    setAdminGropusAndPolicyMqtt,
  } = useMyAdmin();
  const {
    setHtaEscalatedApprovalDataMqtt,
    setHtaEscalatedApprovalData,
    viewDetailsHeadOfApprovalIDRef,
  } = useEscalatedApprovals();
  const {
    setViewDetailsHeadOfApprovalModal,
    setIsViewDetail,
    setIsConductedTransaction,
  } = useGlobalModal();
  const {
    setEmployeePendingApprovalsDataMqtt,
    activeTabRef,
    setEmployeePortfolioDataMqtt,
    setEmployeePendingApprovalsData,
  } = usePortfolioContext();

  const {
    setComplianceOfficerReconcileTransactionData,
    setComplianceOfficerReconcileTransactionDataMqtt,
    setComplianceOfficerReconcilePortfolioDataMqtt,
    setHeadOfComplianceApprovalEscalatedVerificationsMqtt,
    setHeadOfComplianceApprovalEscalatedVerificationsData,
    setHeadOfComplianceApprovalPortfolioMqtt,
    activeTabRef: reconcileActiveTab,
    activeTabHCORef,
  } = useReconcileContext();
  const {
    setDashboardData,
    currentRoleIsAdmin,
    roleChanegFlag,
    setRoleChanegFlag,
    currentRoleIsAdminRef,
    urgentAlert,
    setUrgentAlert,
    manageBrokersModalOpen,
    setManageBrokersModalOpen,
    assetTypeListingData,
  } = useDashboardContext();

  const { setUploadPortfolioModal } = usePortfolioContext();

  const { setEmployeeTransactionsTableDataMqtt, setEmployeeTransactionsData } =
    useTransaction();
  const { setWebNotificationData } = useWebNotification();
  const { callApi } = useApi();
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();
  const { selectedKeyRef } = useSidebarContext();

  // User info from session storage
  const userProfileData = JSON.parse(
    sessionStorage.getItem("user_profile_data")
  );
  const userAssignedRolesData = JSON.parse(
    sessionStorage.getItem("user_assigned_roles")
  );
  const currentUserId = userProfileData?.userID;

  // ✅ Memoize the topic to prevent unnecessary recreations
  const topic = useMemo(() => {
    return currentUserId ? `PAD_${currentUserId}` : null;
  }, [currentUserId]);

  /**
   * ✅ Utility: check if current user has required role(s)
   */
  const hasUserRole = (roleIDs) => {
    if (!roleIDs || !Array.isArray(userAssignedRolesData)) return false;

    const roleArray = Array.isArray(roleIDs) ? roleIDs : [roleIDs];

    return userAssignedRolesData.some((role) =>
      roleArray.includes(Number(role.roleID))
    );
  };

  /**
   * ✅ Normalizes the "list-refresh" escalation MQTT payload into a set of
   * matchable ID strings. Per API_Changes/2026-08-24_escalation_mqtt_
   * reference_for_fe.md, all 6 WORKFLOW_ESCALATED_FROM_x / x_ESCALATED_TO_x
   * messages carry Payload as a bare array of WorkFlowIDs
   * (`[<WorkFlowID>, ...]`) - not a full row object. Defensive fallback to
   * a single-element array covers the case a sender ever sends one bare ID
   * instead of an array.
   */
  const escalationWorkFlowIDs = (payload) =>
    (Array.isArray(payload) ? payload : [payload]).map(String);

  /**
   * ✅ Patches a single employee "My Approvals" row in place from an MQTT
   * "Trade summary" payload, instead of a full API refetch. Shared by
   * EMPLOYEE_TRADE_APPROVAL_REQUEST_APPROVED/DECLINED and
   * ..._STATUS_CHANGE_TRADED - all of which update an *existing* row's
   * status, not add a new one. payload is one raw approval item, same
   * shape SearchTadeApprovals returns per-row, so it's run through the
   * same mapper the initial fetch uses rather than guessing field names.
   * If the row isn't currently loaded in this client (e.g. a page past
   * what's been scrolled to), it's silently skipped rather than forcing a
   * refetch just to patch something not on screen.
   *
   * `overrides` lets a specific caller correct/supply fields the generic
   * mapper can't get right for its payload shape (see
   * ..._STATUS_CHANGE_TRADED below, whose payload doesn't carry the
   * approvalStatus block the mapper reads `status` from).
   */
  const patchEmployeeMyApprovalRow = (payload, overrides = {}) => {
    const [updatedApproval] = mapEmployeeMyApprovalData(
      assetTypeListingData?.Equities,
      [payload]
    );

    if (!updatedApproval) return;

    const patchedApproval = { ...updatedApproval, ...overrides };

    setIsEmployeeMyApproval((prev) => {
      const approvals = prev?.approvals || [];
      const existingIndex = approvals.findIndex(
        (item) => item.approvalID === patchedApproval.approvalID
      );

      if (existingIndex === -1) return prev;

      const updatedApprovals = [...approvals];
      updatedApprovals[existingIndex] = patchedApproval;

      return { ...prev, approvals: updatedApprovals };
    });
  };

  /**
   * Patches a single Pending Approvals row's status in place, instead of a
   * full refetch - a decline (Non-Compliant) keeps the row visible on this
   * page, it just needs its status text updated. Matches on tradeApprovalID
   * since that's the only field confirmed present in both the MQTT payload
   * and the row shape mapToTableRows produces (approvalID/workFlowID are not
   * confirmed to be the same value across the two).
   */
  const patchEmployeePendingApprovalRowStatus = (payload, status) => {
    const tradeApprovalID = payload?.tradeApprovalID;
    if (!tradeApprovalID) return;

    setEmployeePendingApprovalsData((prev) => {
      const rows = prev?.pendingApprovalsData || [];
      const existingIndex = rows.findIndex(
        (row) => row.tradeApprovalID === tradeApprovalID
      );
      if (existingIndex === -1) return prev;

      const updatedRows = [...rows];
      updatedRows[existingIndex] = {
        ...updatedRows[existingIndex],
        status,
      };
      return { ...prev, pendingApprovalsData: updatedRows };
    });
  };

  /**
   * REVERTED (2026-08-24, per explicit correction): this used to remove
   * the row outright. HOC's "Overdue Verifications" report is a historical
   * report, not an actionable queue like Escalated Verifications (currentKey
   * "15", still removed elsewhere) - a resolved row should stay listed,
   * just reflect its new status. Patches isEscalationOpen AND status in
   * place instead, matching BE_API_Changes/2026-08-24_overdue_verifications_
   * keeps_resolved_records.md (resolved rows now stay listed with their
   * real WorkFlowStatusID - Pending/Compliant/Non-Compliant - rather than
   * being excluded). Shared by
   * COMPLIANCE_OFFICER_TRANSACTION_APPROVAL_REQUEST_APPROVED/DECLINED, both
   * of which resolve an overdue row, just to a different status. Matches on
   * workFlowID (this report's row key) against payload.approvalID, the same
   * identifying field the "15" branch above already assumes lines up with
   * a workflow's ID.
   */
  const patchHOCOverdueVerificationRow = (payload, status) => {
    setOverdueVerificationHCOListData((prev) => {
      const rows = prev?.overdueVerifications || [];
      const existingIndex = rows.findIndex(
        (row) => String(row.workFlowID) === String(payload?.approvalID)
      );
      if (existingIndex === -1) return prev;

      const updatedRows = [...rows];
      updatedRows[existingIndex] = {
        ...updatedRows[existingIndex],
        isEscalationOpen: false,
        status,
      };

      return { ...prev, overdueVerifications: updatedRows };
    });
  };

  const apiCallwebNotification = async () => {
    const requestdata = { sRow: 0, eRow: 10 }; // Re-fetch just the first page
    const webNotificationRequest = await GetUserWebNotificationRequest({
      callApi,
      showNotification,
      showLoader,
      requestdata,
      navigate,
    });
    if (!webNotificationRequest) return;

    // This fires on every "WEBNOTIFICATION" MQTT push, which can land while
    // the user has scrolled the dropdown past the first page. Overwriting
    // webNotificationData wholesale would drop those already-loaded pages,
    // so merge the fresh first page in (dedupe by notificationID) instead
    // of replacing the list outright.
    setWebNotificationData((prev = {}) => {
      const existing = prev?.notifications || [];
      const incoming = webNotificationRequest.notifications || [];
      const incomingIds = new Set(incoming.map((n) => n.notificationID));

      return {
        ...prev,
        notifications: [
          ...incoming,
          ...existing.filter((n) => !incomingIds.has(n.notificationID)),
        ],
        unReadCount:
          webNotificationRequest.unReadCount ?? prev?.unReadCount ?? 0,
        totalCount: webNotificationRequest.totalCount ?? prev?.totalCount ?? 0,
      };
    });
  };
  /**
   * ✅ Handle MQTT messages
   */

  const { connectToMqtt, isConnected } = useMqttClient({
    onMessageArrivedCallback: (data) => {
      console.log("action", data);
      if (!data?.message) {
        console.warn("MQTT: Received invalid message", data);
        return;
      }
      try {
        const currentKey = selectedKeyRef.current;
        const currentreconcileActiveTab = reconcileActiveTab.current;
        const currentactiveTabRef = activeTabRef.current;
        const currentactiveHCOEscalatedTabRef = activeTabHCORef.current;
        const currentRoleIsAdminRefLocal = currentRoleIsAdminRef.current;
        const currentmanageUsersTabRef = manageUsersTabRef.current;
        const { message, payload, roleIDs, action } = data;
        if (!payload) return;

        // FIXED (2026-08-11): per API_Changes/2026-08-10_webnotification_mqtt_contract.md,
        // WEBNOTIFICATION is NOT routed like other MQTT messages - its BE
        // sender never sets RoleIDs (always ""), so it must be checked via
        // data.action up front, not via the roleIDs/message switch below.
        // The old checks for this lived *inside* the `hasUserRole(...)`
        // branch further down, which is always false for an empty roleIDs
        // (hasUserRole short-circuits on `!roleIDs`) - so apiCallwebNotification()
        // was silently never firing. Handling it here, unconditionally,
        // fixes that.
        if (action === "WEBNOTIFICATION") {
          apiCallwebNotification();
          return;
        }

        if (hasUserRole(Number(roleIDs))) {
          if (currentRoleIsAdminRefLocal) {
            // admin mqtt
            if (roleIDs !== "1") {
              // not admin MQTT → ignore completely
              return;
            }
          } else {
            if (roleIDs !== "1") {
              // fall through to switch below for this user's own role
            } else {
              // its admin MQTT → ignore completely
            }
          }
          switch (roleIDs) {
            case "1": {
              switch (message) {
                case "INSTRUMENT_STATUS_UPDATED": {
                  if (currentRoleIsAdminRefLocal) {
                    // admin mqtt
                    if (currentKey === "18") {
                      // not admin MQTT → ignore completely
                      setAdminIntrumentsMqtt(true);
                      return;
                    }
                  }
                  break;
                }
                case "USER_REGISTRATION_ACCEPTED": {
                  if (currentRoleIsAdminRefLocal) {
                    // admin mqtt
                    if (
                      currentKey === "21" &&
                      currentmanageUsersTabRef === "1"
                    ) {
                      // not admin MQTT → ignore completely
                      setManageUsersPendingTabMqtt(true);
                      return;
                    }
                  }
                  break;
                }
                case "USER_REGISTRATION_REJECTED": {
                  if (currentRoleIsAdminRefLocal) {
                    // admin mqtt
                    if (currentKey === "21") {
                      if (currentmanageUsersTabRef === "1") {
                        setManageUsersPendingTabMqtt(true);
                      }
                      if (currentmanageUsersTabRef === "2") {
                        setManageUsersRejectedRequestTabMQTT(true);
                      }
                      return;
                    }
                  }
                  break;
                }

                case "NEW_INSTRUMENT_CLOSING_PERIOD_ADDED":
                case "INSTRUMENT_CLOSING_PERIOD_DELETED": {
                  if (currentRoleIsAdminRefLocal) {
                    //admin Edit Modal Add and Delete Mqtt
                    if (currentKey === "18") {
                      setAdminAddDeleteClosingInstrument(true);
                      return;
                    }
                  }
                  break;
                }

                case "NEW_BROKER_ADDED":
                case "BROKER_UPDATED":
                case "BROKER_STATUS_UPDATED": {
                  if (currentRoleIsAdminRefLocal) {
                    // admin mqtt
                    if (currentKey === "19") {
                      // not admin MQTT → ignore completely
                      setAdminBrokerMqtt(true);
                      return;
                    }
                  }
                  break;
                }

                // ADDED (2026-08-07): was completely unhandled before (see
                // MQTT_Message_Catalog.md) - same pattern as the Broker/
                // Instrument cases above, currentKey "20" = Group Policies
                // page (see sidebar/utils.jsx routeMap).
                case "GROUP_POLICY_CREATED":
                case "GROUP_POLICY_UPDATED": {
                  if (currentRoleIsAdminRefLocal) {
                    if (currentKey === "20") {
                      setAdminGropusAndPolicyMqtt(true);
                      return;
                    }
                  }
                  break;
                }

                default:
                  console.warn("MQTT: No handler for message →", message);
              }
              break;
            }

            // Employee mqtt
            case "2": {
              switch (message) {
                // ADDED (2026-08-07): EMPLOYEE_PORTFOLIO_DASHBOARD_DATA was
                // completely unhandled before - the BE sender
                // (NotifyEmployeeDashboardPortFolioCountAsync) sends the
                // exact same UserRoleDashboard payload shape as
                // EMPLOYEE_USER_DASHBOARD_DATA (just with only the Portfolio
                // key populated), so it shares this handler rather than
                // duplicating it - the generic key-merge below only touches
                // whatever keys are actually present in the payload.
                case "EMPLOYEE_USER_DASHBOARD_DATA":
                case "EMPLOYEE_PORTFOLIO_DASHBOARD_DATA": {
                  if (currentKey === "0") {
                    setDashboardData((prev) => {
                      if (!prev?.employee) return prev;
                      const updatedEmployee = { ...prev.employee };
                      Object.keys(payload).forEach((key) => {
                        if (payload[key] !== null)
                          updatedEmployee[key] = payload[key];
                      });
                      return { ...prev, employee: updatedEmployee };
                    });
                  }
                  break;
                }
                case "EMPLOYEE_NEW_TRADE_APPROVAL_REQUEST": {
                  // New row (not an update to an existing one, unlike
                  // patchEmployeeMyApprovalRow's callers) - prepend instead
                  // of a full API refetch, same [payload, ...prev] shape
                  // already sketched for EMPLOYEE_CONDUCTED_TRANSACTION
                  // below. Dedup'd against approvalID in case the
                  // submitting client already added this optimistically on
                  // its own submit flow before the MQTT echo arrived. Both
                  // record-count totals bump by 1 - a real new row now
                  // exists in the DB and is now also loaded here.
                  if (currentKey === "1") {
                    const [newApproval] = mapEmployeeMyApprovalData(
                      assetTypeListingData?.Equities,
                      [payload]
                    );

                    if (newApproval) {
                      setIsEmployeeMyApproval((prev) => {
                        const approvals = prev?.approvals || [];
                        const alreadyPresent = approvals.some(
                          (item) => item.approvalID === newApproval.approvalID
                        );
                        if (alreadyPresent) return prev;

                        return {
                          ...prev,
                          approvals: [newApproval, ...approvals],
                          totalRecordsDataBase:
                            (prev?.totalRecordsDataBase || 0) + 1,
                          totalRecordsTable: (prev?.totalRecordsTable || 0) + 1,
                        };
                      });
                    }
                  }
                  break;
                }
                case "EMPLOYEE_CONDUCTED_TRANSACTION": {
                  if (currentKey === "2") {
                    setEmployeeTransactionsTableDataMqtt(true);
                    // setEmployeeTransactionsData((prev) => ({
                    //   ...prev,
                    //   data: [payload, ...(prev.data || [])],
                    //   totalRecords: (prev.totalRecords || 0) + 1,
                    // }));
                  }
                  break;
                }
                case "EMPLOYEE_TRADE_APPROVAL_REQUEST_STATUS_CHANGE_TRADED": {
                  // Patches in place instead of a full API refetch - see
                  // patchEmployeeMyApprovalRow above. Per
                  // MQTT_Message_Catalog.md this payload is "Trade summary
                  // + workFlowStatus block" - a different shape than the
                  // plain "Trade summary" the other callers get, and the
                  // mapper's `status` read (item.approvalStatus?.
                  // approvalStatusName) won't exist here, so it'd come out
                  // blank without an override. Reads the string status off
                  // workFlowStatus the same way this codebase already does
                  // elsewhere (pendingApprovals/utill.jsx,
                  // tradesUploadViaPortfolio/utill.jsx both read
                  // item.workFlowStatus?.workFlowStatus), falling back to
                  // the literal "Traded" - what this message means by
                  // definition - if that field isn't there either.
                  if (currentKey === "1") {
                    patchEmployeeMyApprovalRow(payload, {
                      status:
                        payload?.workFlowStatus?.workFlowStatus || "Traded",
                    });
                    setIsViewDetail(false);
                    setIsConductedTransaction(false);
                  }
                  break;
                }
                case "EMMPLOYEE_NEW_UPLOAD_PORTFOLIO_REQUEST": {
                  if (currentKey === "4" && currentactiveTabRef === "pending") {
                    // setEmployeePendingApprovalsDataMqtt({
                    //   mqttRecivedData: payload,
                    //   mqttRecived: true,
                    // });
                    setEmployeePendingApprovalsDataMqtt(true);
                  }
                  setUploadPortfolioModal(false);
                  break;
                }
                case "EMPLOYEE_TRADE_APPROVAL_REQUEST_APPROVED": {
                  // Testtest
                  // Patches in place instead of a full API refetch - see
                  // patchEmployeeMyApprovalRow above.
                  if (currentKey === "1") {
                    patchEmployeeMyApprovalRow(payload);
                  }
                  // setUploadPortfolioModal(false);
                  break;
                }
                case "EMPLOYEE_TRADE_APPROVAL_REQUEST_DECLINED": {
                  // Patches in place instead of a full API refetch - see
                  // patchEmployeeMyApprovalRow above.
                  if (currentKey === "1") {
                    patchEmployeeMyApprovalRow(payload);
                  }
                  break;
                }
                // case "EMPLOYEE_TRANSACTION_APPROVAL_REQUEST_APPROVED": {
                //   if (currentKey === "2") {
                //     setEmployeeTransactionsTableDataMqtt(true);
                //     // setEmployeeTransactionsData((prev) => ({
                //     //   ...prev,
                //     //   data: [payload, ...(prev.data || [])],
                //     //   totalRecords: (prev.totalRecords || 0) + 1,
                //     // }));
                //   }
                //   break;
                // }

                // case "EMPLOYEE_TRANSACTION_APPROVAL_REQUEST_APPROVED": {
                //   if (currentKey === "2") {
                //     setEmployeeTransactionsTableDataMqtt(true);
                //     setEmployeePendingApprovalsDataMqtt(true); // ADDED — refreshes Pending Approvals tab
                //     setEmployeePortfolioDataMqtt(true); // ADDED — refreshes Portfolio tab
                //   }
                //   break;
                // }

                case "EMPLOYEE_TRANSACTION_APPROVAL_REQUEST_APPROVED": {
                  // Despite the name, this same message also fires for
                  // Portfolio Compliant/Non-Compliant closures - not just
                  // Transactions (2026-08-19_employee_portfolio_transaction_
                  // mqtt_reliability.md). Was only refreshing the
                  // Transactions tab (currentKey "2"); mirrors
                  // WORKFLOW_ESCALATED_FROM_HOC's currentKey "4" branch
                  // below so the Portfolio pending list also drops the item
                  // live instead of only on next full reload.
                  if (currentKey === "2") {
                    setEmployeeTransactionsTableDataMqtt(true);
                    // setEmployeeTransactionsData((prev) => ({
                    //   ...prev,
                    //   data: [payload, ...(prev.data || [])],
                    //   totalRecords: (prev.totalRecords || 0) + 1,
                    // }));
                  } else if (
                    currentKey === "4" &&
                    currentactiveTabRef === "pending"
                  ) {
                    setEmployeePendingApprovalsDataMqtt(true);
                  } else if (
                    currentKey === "4" &&
                    currentactiveTabRef === "portfolio"
                  ) {
                    setEmployeePortfolioDataMqtt(true);
                  }
                  break;
                }
                case "EMPLOYEE_TRANSACTION_APPROVAL_REQUEST_DECLINED": {
                  // Same Portfolio/Transaction dual-purpose message as the
                  // Approved case above - see comment there.
                  if (currentKey === "2") {
                    setEmployeeTransactionsTableDataMqtt(true);
                  } else if (
                    currentKey === "4" &&
                    currentactiveTabRef === "pending"
                  ) {
                    patchEmployeePendingApprovalRowStatus(
                      payload,
                      "Non-Compliant"
                    );
                    setEmployeePendingApprovalsDataMqtt(true);
                  }
                  break;
                }
                case "EMPLOYEE_NEW_TRADE_APPROVAL_REQUEST_RESUBMITTED": {
                  console.log(
                    "EMPLOYEE_NEW_TRADE_APPROVAL_REQUEST_RESUBMITTED_EMPLOYEE_NEW_TRADE_APPROVAL_REQUEST_RESUBMITTED"
                  );
                  // Treated as an update to the existing row (a resubmit
                  // flips the same workflow's status back to pending rather
                  // than creating a new record) - patches in place instead
                  // of a full API refetch, see patchEmployeeMyApprovalRow
                  // above. If that assumption is wrong and this actually
                  // lands under a different approvalID, the patch silently
                  // no-ops (existingIndex === -1) rather than corrupting
                  // anything - worst case is a stale row until next full
                  // load, not a crash.
                  if (currentKey === "1") {
                    // Payload has no approvalStatus block (workFlowStatus is null too),
                    // same gap STATUS_CHANGE_TRADED has above - the generic mapper's
                    // `item.approvalStatus?.approvalStatusName` read comes back blank
                    // without an override. Falls back to the literal "Resubmit" - the
                    // actual approvalStatusName the API uses for this state, per a real
                    // SearchTradeApprovals response - if a future payload shape ever
                    // does include the block.
                    // patchEmployeeMyApprovalRow(payload);

                    patchEmployeeMyApprovalRow(payload, {
                      status:
                        payload?.approvalStatus?.approvalStatusName ||
                        "Resubmit",
                    });
                  }
                  break;
                }
                case "WORKFLOW_ESCALATED_FROM_HTA": {
                  // FIXED (2026-08-24, per escalation_mqtt_reference_for_fe.md):
                  // payload here is a bare [<WorkFlowID>, ...] array, not a
                  // full approval row object - patchEmployeeMyApprovalRow
                  // expects the latter (runs it through
                  // mapEmployeeMyApprovalData([payload])), so feeding it the
                  // raw ID array always silently no-op'd (no real row's
                  // approvalID is ever undefined, and that's what a mapped
                  // array-as-object comes out to). Patches isEscalated
                  // directly by ID instead - no API call, no full refetch.
                  if (currentKey === "1") {
                    const escalatedIDs = escalationWorkFlowIDs(payload);
                    setIsEmployeeMyApproval((prev) => {
                      const approvals = prev?.approvals || [];
                      const updatedApprovals = approvals.map((item) =>
                        escalatedIDs.includes(String(item.approvalID))
                          ? { ...item, isEscalated: true }
                          : item
                      );
                      return { ...prev, approvals: updatedApprovals };
                    });
                  }
                  break;
                }
                case "WORKFLOW_ESCALATED_FROM_HOC": {
                  if (currentKey === "2") {
                    // CHANGED (2026-08-24): was a full refetch
                    // (setEmployeeTransactionsTableDataMqtt) - patches
                    // isEscalated in place instead, matching this message's
                    // real payload shape (bare WorkFlowID array, see
                    // escalationWorkFlowIDs above). mapEmployeeTransactions
                    // already maps isEscalated and keys rows by workFlowID.
                    const escalatedIDs = escalationWorkFlowIDs(payload);
                    setEmployeeTransactionsData((prev) => {
                      const data = prev?.data || [];
                      const updatedData = data.map((item) =>
                        escalatedIDs.includes(String(item.workFlowID))
                          ? { ...item, isEscalated: true }
                          : item
                      );
                      return { ...prev, data: updatedData };
                    });
                  } else if (
                    currentKey === "4" &&
                    currentactiveTabRef === "pending"
                  ) {
                    // Left as a refetch: Pending Approvals' row shape
                    // (pendingApprovals/utill.jsx mapToTableRows) has no
                    // isEscalated field or column at all to patch - there's
                    // nothing in-place to update here without adding a new
                    // field/column, which is out of scope of this change.
                    setEmployeePendingApprovalsDataMqtt(true);
                  }
                  break;
                }
                // ADDED (2026-08-07, per 2026-08-07_mqtt_fixes_fe_implementation.md):
                // was completely unhandled - falling through to default and
                // silently dropped. BE now fans this out as a second,
                // separate message per assigned employee (RoleIDs=Employee),
                // so if this client received it at all, it's already for
                // them - no UserIDs-membership check needed, unlike
                // USER_DETAILS_UPDATED's UserID check. payload is a
                // JSON-encoded string here (PascalCase keys), not a
                // pre-parsed object like the dashboard-tile messages, same
                // as USER_DETAILS_UPDATED. No existing UI in this codebase
                // reads an employee's own Group Policy assignment live, so
                // there's nothing to silently refresh - goes with the
                // visible-notification option the doc offered instead,
                // mirroring how USER_DETAILS_UPDATED already handles "your
                // account changed" (just without the forced logout - no
                // token/session change is implied by a policy assignment).
                case "GROUP_POLICY_CREATED":
                case "GROUP_POLICY_UPDATED": {
                  try {
                    const parsedPolicyPayload = JSON.parse(payload);
                    const isNewAssignment = message === "GROUP_POLICY_CREATED";
                    showNotification({
                      type: "info",
                      title: isNewAssignment
                        ? "Group Policy Assigned"
                        : "Group Policy Updated",
                      description: parsedPolicyPayload?.GroupTitle
                        ? `Your assigned Group Policy "${
                            parsedPolicyPayload.GroupTitle
                          }" has been ${
                            isNewAssignment ? "assigned to you" : "updated"
                          }.`
                        : "Your assigned Group Policy has changed.",
                    });
                  } catch (error) {
                    console.error(
                      "MQTT: Failed to parse GROUP_POLICY payload",
                      error
                    );
                  }
                  break;
                }
                default:
                  console.warn("MQTT: No handler for message →", message);
              }
              break;
            }
            // Line manager mqtt
            case "3": {
              switch (message) {
                case "LINE_MANAGER_DASHBOARD_DATA": {
                  if (currentKey === "0") {
                    setDashboardData((prev) => {
                      // CORRECTED (2026-08-11): the 2026-08-07 "fix" here
                      // had it backwards. dashboardContaxt.jsx's bare
                      // useState default does use "LineManager"
                      // (capitalized), but that default is irrelevant -
                      // home.jsx's fetchData always replaces the whole
                      // dashboardData object via roleKeyMap (utills.jsx),
                      // whose role-3 key is "lineManager" (lowercase) - and
                      // home.jsx only ever reads dashboardData.lineManager.
                      // Merging into "LineManager" wrote to a key nothing
                      // reads, so this MQTT message went on silently
                      // updating a phantom key instead of the real one.
                      if (!prev?.lineManager) return prev;
                      const updatedLineManager = { ...prev.lineManager };
                      Object.keys(payload).forEach((key) => {
                        if (payload[key] !== null)
                          updatedLineManager[key] = payload[key];
                      });
                      return { ...prev, lineManager: updatedLineManager };
                    });
                  }
                  break;
                }
                case "YOU_HAVE_URGENT_ACTION_WHICH_REQUIRE_URGENT_ACTION": {
                  // Prevent multiple fetches on mount
                  sessionStorage.setItem(
                    "urgentApprovals",
                    JSON.stringify(payload)
                  );
                  console.log("urgentApprovals", payload);
                  if (payload.count > 0) {
                    sessionStorage.setItem("urgent_flag", true);
                    setUrgentAlert(true);
                    console.log("urgentApprovals", payload);
                  } else {
                    sessionStorage.setItem("urgent_flag", false);
                    setUrgentAlert(false);
                    console.log("urgentApprovals", payload);
                  }

                  break;
                }
                // ADDED (2026-08-07): was completely unhandled before. BE
                // sends this as an array of tiles ([{Count, Label, Type}, ...] -
                // "TOTAL PENDING APPROVALS" and "APPROVAL REQUIRE URGENT
                // ACTION"), not a keyed object like the sibling dashboard
                // messages, so it's re-keyed by each tile's own Label before
                // merging. Merges into dashboardData.lineManager - see the
                // CORRECTED note on LINE_MANAGER_DASHBOARD_DATA above for
                // why this is lowercase, not the "LineManager" this
                // originally used.
                case "LINE_MANAGER_DASHBOARD_URGENT_SUMMARY_UPDATE": {
                  if (currentKey === "0" && Array.isArray(payload)) {
                    setDashboardData((prev) => {
                      if (!prev?.lineManager) return prev;
                      const updated = { ...prev.lineManager };
                      payload.forEach((tile) => {
                        if (tile?.Label) updated[tile.Label] = tile;
                      });
                      return { ...prev, lineManager: updated };
                    });
                  }
                  break;
                }
                case "LINE_MANAGER_NEW_TRADE_APPROVAL_REQUEST": {
                  if (currentKey === "6") {
                    setLineManagerApprovalMQtt(true);
                    // handleLineManagerApprovalNewTrade(
                    //   payload,
                    //   currentlineManagerApprovalSearchRef,
                    //   setLineManagerApproval
                    // );
                  }
                  break;
                }
                case "LINE_MANAGER_TRADE_APPROVAL_REQUEST_APPROVED": {
                  if (currentKey === "6") {
                    setLineManagerApprovalMQtt(true);

                    // setLineManagerApproval((prev) => {
                    //   const lineApprovals = prev.lineApprovals || [];
                    //   const existingIndex = lineApprovals.findIndex(
                    //     (item) => item.approvalID === payload.approvalID
                    //   );

                    //   if (existingIndex === -1) return prev;

                    //   const updatedApprovals = [...lineApprovals];
                    //   updatedApprovals[existingIndex] = payload;

                    //   return {
                    //     ...prev,
                    //     lineApprovals: updatedApprovals,
                    //   };
                    // });
                  }
                  break;
                }
                case "LINE_MANAGER_TRADE_APPROVAL_REQUEST_DECLINED": {
                  if (currentKey === "6") {
                    setLineManagerApprovalMQtt(true);
                  }
                  break;
                }
                case "LINE_MANAGER_NEW_TRADE_APPROVAL_REQUEST_RESUBMITTED": {
                  if (currentKey === "6") {
                    setLineManagerApprovalMQtt(true);
                  }
                  break;
                }
                case "YOUR_REQUEST_ESCALATED_TO_HTA": {
                  // CHANGED (2026-08-24): was a full refetch
                  // (setLineManagerApprovalMQtt) - patches isEscalated in
                  // place instead. mapEscalatedApprovalsToTableRows
                  // (lineManager/approvalRequest/utill.jsx) doesn't expose
                  // an approvalID field on the mapped row, only `key`
                  // (set to item.approvalID at map time), so that's the
                  // match target here.
                  if (currentKey === "6") {
                    const escalatedIDs = escalationWorkFlowIDs(payload);
                    setLineManagerApproval((prev) => {
                      const lineApprovals = prev?.lineApprovals || [];
                      const updatedApprovals = lineApprovals.map((item) =>
                        escalatedIDs.includes(String(item.key))
                          ? { ...item, isEscalated: true }
                          : item
                      );
                      return { ...prev, lineApprovals: updatedApprovals };
                    });
                  }
                  break;
                }
                default:
                  console.warn("MQTT: No handler for message →", message);
              }
              break;
            }

            // Compliance officer mqtt
            case "4": {
              switch (message) {
                case "COMPLIANCE_OFFICER_DASHBOARD_DATA": {
                  if (currentKey === "0") {
                    setDashboardData((prev) => {
                      // CORRECTED (2026-08-11): the 2026-08-07 "fix" here
                      // had it backwards - see the note on
                      // LINE_MANAGER_DASHBOARD_DATA above. home.jsx's
                      // fetchData populates dashboardData via roleKeyMap
                      // (utills.jsx), whose role-4 key is
                      // "complianceOfficer" (lowercase), and home.jsx only
                      // ever reads dashboardData.complianceOfficer -
                      // dashboardContaxt.jsx's unused useState default
                      // casing ("ComplianceOfficer") isn't what's actually
                      // read anywhere.
                      if (!prev?.complianceOfficer) return prev;
                      const updatedEmployee = { ...prev.complianceOfficer };
                      Object.keys(payload).forEach((key) => {
                        if (payload[key] !== null)
                          updatedEmployee[key] = payload[key];
                      });
                      return { ...prev, complianceOfficer: updatedEmployee };
                    });
                  }
                  break;
                }
                case "COMPLIANCE_OFFICER_NEW_UPLOAD_PORTFOLIO_REQUEST": {
                  if (
                    currentKey === "9" &&
                    currentreconcileActiveTab === "portfolio"
                  ) {
                    setComplianceOfficerReconcilePortfolioDataMqtt(true);
                  }

                  break;
                }
                case "COMPLIANCE_OFFICER_CONDUCTED_TRANSACTION": {
                  if (
                    currentKey === "9" &&
                    currentreconcileActiveTab === "transactions"
                  ) {
                    setComplianceOfficerReconcileTransactionDataMqtt(true);
                  }
                  break;
                }
                // CHANGED (2026-08-11): the "transactions" branch used to
                // just set the generic refetch-trigger flag (full page-1
                // reload). This message is sent to Compliance Officer role
                // holders (RoleIDs=4 on the wire) whenever a transaction
                // they're tied to gets approved - handled properly now:
                //  - CO's own Reconcile Transactions list (currentKey "9",
                //    "transactions" tab): patch that row's status in place
                //    instead of a full refetch.
                //  - HOC's Escalated Verifications list (currentKey "15"):
                //    a dual-role CO+HOC user viewing their escalated queue
                //    when their own approval lands should see that row
                //    disappear (it's resolved, no longer needs HOC action).
                case "COMPLIANCE_OFFICER_TRANSACTION_APPROVAL_REQUEST_APPROVED": {
                  if (
                    currentKey === "9" &&
                    currentreconcileActiveTab === "transactions"
                  ) {
                    setComplianceOfficerReconcileTransactionData((prev) => {
                      const rows = prev?.reconsileTransaction || [];
                      const existingIndex = rows.findIndex(
                        (row) =>
                          String(row.approvalID) === String(payload?.approvalID)
                      );
                      if (existingIndex === -1) return prev;

                      const updatedRows = [...rows];
                      updatedRows[existingIndex] = {
                        ...updatedRows[existingIndex],
                        status:
                          (payload?.approvalStatus?.approvalStatusName ===
                            "Approved" &&
                            "Compliant") ||
                          updatedRows[existingIndex].status,
                      };

                      return { ...prev, reconsileTransaction: updatedRows };
                    });
                  } else if (
                    currentKey === "9" &&
                    currentreconcileActiveTab === "portfolio"
                  ) {
                    setComplianceOfficerReconcilePortfolioDataMqtt(true);
                  } else if (currentKey === "15") {
                    setHeadOfComplianceApprovalEscalatedVerificationsData(
                      (prev) => {
                        const rows = prev?.escalatedVerification || [];
                        const filteredRows = rows.filter(
                          (row) =>
                            String(row.workflowID) !==
                            String(payload?.approvalID)
                        );
                        if (filteredRows.length === rows.length) return prev;

                        return {
                          ...prev,
                          escalatedVerification: filteredRows,
                          totalRecordsDataBase: Math.max(
                            0,
                            (prev.totalRecordsDataBase || 0) - 1
                          ),
                          totalRecordsTable: filteredRows.length,
                        };
                      }
                    );
                  }

                  // ADDED (2026-08-24): HOC's "Overdue Verifications" report
                  // (currentKey "17" - shared by every hca-reports/* sub-page,
                  // so path-scoped to just this one via location.pathname,
                  // same way header.jsx/searchable-dropdown already
                  // distinguish these sub-routes) was never live-updated on
                  // this message - a row stayed showing Pending/"Escalated"
                  // after the underlying transaction was actually approved,
                  // until the next full page reload. Patched in place (row
                  // kept, status flipped to Compliant), not removed - see
                  // patchHOCOverdueVerificationRow above.
                  if (
                    currentKey === "17" &&
                    location.pathname ===
                      "/PAD/hca-reports/hca-overdue-verifications"
                  ) {
                    patchHOCOverdueVerificationRow(payload, "Compliant");
                  }
                  break;
                }
                case "COMPLIANCE_OFFICER_TRANSACTION_APPROVAL_REQUEST_DECLINED": {
                  if (
                    currentKey === "9" &&
                    currentreconcileActiveTab === "transactions"
                  ) {
                    setComplianceOfficerReconcileTransactionDataMqtt(true);
                  } else if (
                    currentKey === "9" &&
                    currentreconcileActiveTab === "portfolio"
                  ) {
                    setComplianceOfficerReconcilePortfolioDataMqtt(true);
                  }

                  // Same patch as the APPROVED case above - a declined
                  // transaction is also resolved but stays listed in HOC's
                  // Overdue Verifications report, flipped to Non-Compliant.
                  if (
                    currentKey === "17" &&
                    location.pathname ===
                      "/PAD/hca-reports/hca-overdue-verifications"
                  ) {
                    patchHOCOverdueVerificationRow(payload, "Non-Compliant");
                  }
                  break;
                }
                case "YOUR_REQUEST_ESCALATED_TO_HOC": {
                  if (
                    currentKey === "9" &&
                    currentreconcileActiveTab === "transactions"
                  ) {
                    // CHANGED (2026-08-24): was a full refetch - patches
                    // isEscalated in place instead. mapToTableRows
                    // (complianceOfficer/reconcile/transaction/util.jsx)
                    // maps both approvalID and isEscalated (API_Changes/
                    // 2026-08-11_co_reconcile_transactions_isEscalated.md).
                    const escalatedIDs = escalationWorkFlowIDs(payload);
                    setComplianceOfficerReconcileTransactionData((prev) => {
                      const rows = prev?.reconsileTransaction || [];
                      const updatedRows = rows.map((row) =>
                        escalatedIDs.includes(String(row.approvalID))
                          ? { ...row, isEscalated: true }
                          : row
                      );
                      return { ...prev, reconsileTransaction: updatedRows };
                    });
                  } else if (
                    currentKey === "9" &&
                    currentreconcileActiveTab === "portfolio"
                  ) {
                    // Left as a refetch: the Portfolio sub-tab's row shape
                    // (reconcile/portfolio/util.jsx mapToTableRows) has no
                    // isEscalated field/column to patch, unlike the
                    // Transactions sub-tab above.
                    setComplianceOfficerReconcilePortfolioDataMqtt(true);
                  }
                  break;
                }
                default:
                  console.warn("MQTT: No handler for message →", message);
              }
              break;
            }
            // HTA mqtt
            case "5": {
              switch (message) {
                // ADDED (2026-08-07): was completely unhandled (see the
                // "// missing dashboard" comment this replaces) - merges into
                // dashboardData.headofTradeApproval, same generic key-merge
                // pattern already used for LM/CO dashboards. CORRECTED
                // (2026-08-11): originally used "HeadofTradeApproval"
                // (capitalized), matching dashboardContaxt.jsx's unused
                // useState default - but home.jsx's fetchData populates
                // dashboardData via roleKeyMap (utills.jsx), whose role-5
                // key is "headofTradeApproval" (lowercase 'h'), and
                // home.jsx only ever reads that casing. Same root cause as
                // the LM/CO fix above.
                case "HTA_DASHBOARD_DATA":
                case "HTA_ESCALATION_DASHBOARD_STATS": {
                  if (currentKey === "0") {
                    setDashboardData((prev) => {
                      if (!prev?.headofTradeApproval) return prev;
                      const updated = { ...prev.headofTradeApproval };
                      Object.keys(payload).forEach((key) => {
                        if (payload[key] !== null) updated[key] = payload[key];
                      });
                      return { ...prev, headofTradeApproval: updated };
                    });
                  }
                  break;
                }
                case "REQUEST_ESCALATED_TO_HTA": {
                  if (currentKey === "12") {
                    setHtaEscalatedApprovalDataMqtt(true);
                  }
                  break;
                }
                // ADDED (2026-08-07, per 2026-08-07_hta_escalation_
                // resolved_notification.md): a Line Manager approving/
                // declining a request that was escalated past them
                // resolves the HTA's open escalation. Unlike the sibling
                // case above (a brand new escalation, where a full
                // refetch is the only option since there's no existing row
                // to update), a resolution instead patches the listing in
                // place - the resolved request no longer belongs in
                // "Escalated Approvals" at all, so its row is removed
                // rather than refetching the whole page. Also closes View
                // Details if the HTA has this exact request open right
                // now, via viewDetailsHeadOfApprovalIDRef (escalatedApprovalContext.jsx).
                case "ESCALATED_REQUEST_RESOLVED_HTA": {
                  if (currentKey === "12") {
                    // payload is "a raw array containing the single
                    // resolved workFlowID" per the doc. This table's rows
                    // only carry approvalID (not a separate workFlowID),
                    // so matching against approvalID assumes the two line
                    // up - the same value this page already sends as
                    // TradeApprovalID when fetching View Details. Not
                    // explicitly confirmed by the doc; flagged as an
                    // assumption.
                    const resolvedWorkFlowID = Array.isArray(payload)
                      ? payload[0]
                      : payload;

                    if (
                      resolvedWorkFlowID != null &&
                      Number(viewDetailsHeadOfApprovalIDRef?.current) ===
                        Number(resolvedWorkFlowID)
                    ) {
                      setViewDetailsHeadOfApprovalModal(false);
                    }

                    setHtaEscalatedApprovalData((prev) => {
                      const list = prev?.htaEscalatedApprovalsList || [];
                      const remaining = list.filter(
                        (item) =>
                          Number(item.approvalID) !== Number(resolvedWorkFlowID)
                      );

                      if (remaining.length === list.length) return prev;

                      return {
                        ...prev,
                        htaEscalatedApprovalsList: remaining,
                        totalRecordsDataBase: Math.max(
                          0,
                          (prev?.totalRecordsDataBase || 0) - 1
                        ),
                        totalRecordsTable: Math.max(
                          0,
                          (prev?.totalRecordsTable || 0) - 1
                        ),
                      };
                    });
                  }
                  break;
                }
                default:
                  console.warn("MQTT: No handler for message →", message);
              }
              break;
            }
            // HOC mqtt
            case "6": {
              switch (message) {
                // ADDED (2026-08-07): was completely unhandled - see the
                // matching HTA case above for the full rationale. CORRECTED
                // (2026-08-11): "headofComplianceOfficer" (lowercase 'h'),
                // matching roleKeyMap's role-6 key and what home.jsx
                // actually reads - not "HeadofComplianceOfficer".
                case "HOC_ESCALATION_DASHBOARD_STATS": {
                  if (currentKey === "0") {
                    setDashboardData((prev) => {
                      if (!prev?.headofComplianceOfficer) return prev;
                      const updated = { ...prev.headofComplianceOfficer };
                      Object.keys(payload).forEach((key) => {
                        if (payload[key] !== null) updated[key] = payload[key];
                      });
                      return { ...prev, headofComplianceOfficer: updated };
                    });
                  }
                  break;
                }
                case "REQUEST_ESCALATED_TO_HOC": {
                  if (currentKey === "15") {
                    if (currentactiveHCOEscalatedTabRef === "escalated") {
                      setHeadOfComplianceApprovalEscalatedVerificationsMqtt(
                        true
                      );
                    } else if (
                      currentactiveHCOEscalatedTabRef === "portfolio"
                    ) {
                      // FIXED (2026-08-11): was calling
                      // setHeadOfComplianceApprovalEscalatedVerificationsData(true)
                      // - the *data* setter (expects a full
                      // {escalatedVerification, totalRecordsDataBase,
                      // totalRecordsTable} object), not the boolean
                      // refetch-trigger flag - this overwrote the whole list
                      // state with the literal value `true`, so the next
                      // `.escalatedVerification` read anywhere would be
                      // undefined. Should have been the *Mqtt* flag setter,
                      // matching the "escalated" tab branch above and every
                      // other refetch-trigger case in this file.
                      setHeadOfComplianceApprovalPortfolioMqtt(true);
                    }
                  }

                  // ADDED (2026-08-24, per API_Changes/2026-08-24_escalation_
                  // mqtt_reference_for_fe.md): this message only refreshed
                  // Escalated Verifications (currentKey "15") above - HOC's
                  // Overdue Verifications report (currentKey "17", shared by
                  // every hca-reports/* sub-page, path-scoped via
                  // location.pathname same as the
                  // COMPLIANCE_OFFICER_TRANSACTION_APPROVAL_REQUEST_APPROVED/
                  // DECLINED handling above) never live-updated when a NEW
                  // escalation landed while it was open - only resolving an
                  // existing row did. Full refetch (not a row patch) since
                  // this is a brand-new row with no existing entry to patch.
                  if (
                    currentKey === "17" &&
                    location.pathname ===
                      "/PAD/hca-reports/hca-overdue-verifications"
                  ) {
                    setOverdueVerificationHCOMqtt(true);
                  }
                  break;
                }
                default:
                  console.warn("MQTT: No handler for message →", message);
              }
              break;
            }

            default:
              console.log("mqtt User details updated → logging out");
          }
        } else {
          switch (message) {
            case "USER_DETAILS_UPDATED": {
              try {
                const parsedPayload = JSON.parse(payload);
                if (parsedPayload?.UserID === currentUserId) {
                  // CHANGED (2026-08-06, per CR): FK_UserStatusID: 1=Active,
                  // 2=Disabled, 3=Closed, 4=Dormant (see statusOptions in
                  // EditRoleAndPoliciesModal.jsx). Each status now gets the
                  // same title/description pairing shown at login for that
                  // status (see ERM_Auth_AuthServiceManager_Login_04/_05 in
                  // utils.jsx + loginApi.jsx), so the live push the user
                  // sees right now and the message they'd see if they tried
                  // to log back in read consistently. Any update that
                  // leaves status at Active (1) - i.e. a Group Policy
                  // assign/change with no status change - keeps the
                  // previous generic "Account Updated" wrapper. No backend/
                  // MQTT payload change needed - FK_UserStatusID was already
                  // in the payload.
                  let title = "Account Updated";
                  let description =
                    "Your Group Policy and/or Status is changed by the Admin. Please login again.";

                  switch (parsedPayload?.FK_UserStatusID) {
                    case 2: // Disabled
                      title = "Account inactive; requires reactivation";
                      description = "Please login again.";
                      break;
                    case 3: // Closed
                      title = "Account permanently closed";
                      description = "Please contact System Administrator.";
                      break;
                    case 4: // Dormant
                      title = "Account is Inactive and requires reactivation";
                      description = "Please contact System Administrator.";
                      break;
                    default:
                      // ADDED (2026-08-07, per 2026-08-07_employee_manager_
                      // reassign_force_logout.md): UpdateEmployeeManager
                      // (Admin reassigns an employee's Line Manager or
                      // Compliance Officer) now also sends this same
                      // message with status left unchanged (still Active),
                      // landing here alongside genuine Group Policy
                      // changes. EntityTypeID (1=Line Manager, 2=Compliance
                      // Officer) distinguishes the two so a reassigned
                      // employee gets a message naming what actually
                      // changed, instead of the generic "Group Policy
                      // and/or Status" text for something that isn't a
                      // policy change at all. Genuine Group Policy changes
                      // don't send EntityTypeID, so they keep the original
                      // generic text set above.
                      if (parsedPayload?.EntityTypeID === 1) {
                        description =
                          "Your Line Manager has been reassigned by the Admin. Please login again.";
                      } else if (parsedPayload?.EntityTypeID === 2) {
                        description =
                          "Your Compliance Officer has been reassigned by the Admin. Please login again.";
                      }
                      break;
                  }

                  showNotification({
                    type: "warning",
                    title,
                    description,
                  });
                  logout({ navigate, showLoader });
                }
              } catch (error) {
                console.error("error", error);
              }
              break;
            }
            // ADDED (2026-08-07): was completely unhandled before - see
            // MQTT_Message_Catalog.md. Fires from a server-side idle-session
            // timer (SessionKillTimer_Elapsed in UserCollection.cs) that
            // deletes the user's registered token; unlike every other
            // message, its BE sender never sets RoleIDs at all, so
            // hasUserRole(...) always evaluates false for it regardless of
            // the recipient's actual role - that's exactly why it lands in
            // this same "else" branch as USER_DETAILS_UPDATED rather than
            // needing its own roleIDs case. Its Payload is also a bare
            // string ("USER_lOGOUT_DUE_TO_INACTIVITY" again, not JSON), so -
            // unlike USER_DETAILS_UPDATED - there's nothing to JSON.parse or
            // cross-check; the message key alone is the whole signal, and
            // this client only ever receives it on its own MQTT topic
            // (PAD_<currentUserId>) in the first place.
            case "USER_lOGOUT_DUE_TO_INACTIVITY": {
              showNotification({
                type: "warning",
                title: "Session Expired",
                description:
                  "You have been logged out due to inactivity. Please login again.",
              });
              logout({ navigate, showLoader });
              break;
            }

            default:
              console.warn("MQTT: No handler for message →", message);
          }
        }
      } catch (error) {
        console.error("MQTT: Error handling message", error, data);
      }
    },
    onConnectionLostCallback: () => {
      console.warn("MQTT disconnected");
      connectionAttemptedRef.current = false; // ✅ Reset on disconnection
    },
  });

  // ✅ Connect to MQTT only once when topic is available
  useEffect(() => {
    if (topic && !connectionAttemptedRef.current) {
      connectionAttemptedRef.current = true; // ✅ Mark as attempted
      console.log("🔄 Connecting to MQTT with topic:", topic);
      connectToMqtt({ topic, userID: currentUserId });
    }
  }, [topic, connectToMqtt, currentUserId]); // Removed isConnected from dependencies

  // FIXED: the notification list had no initial fetch of its own anywhere
  // - apiCallwebNotification (above) only ever ran reactively, off an
  // incoming "WEBNOTIFICATION" MQTT push, and the only other place that
  // ever populated webNotificationData was Home's own fetchData
  // (GetUserDashBoardStats bundles a notifications call in with brokers/
  // instruments/asset types/etc.), which only runs when Home itself
  // mounts. Refreshing on any other page never mounts Home, so
  // webNotificationData stayed at its empty default until an MQTT push
  // happened to arrive. This is the persistent layout wrapping every
  // /PAD/* route (mounts on every refresh regardless of which nested
  // page is active), so fetching the first page here directly guarantees
  // the notification list is populated no matter where the user lands.
  useEffect(() => {
    apiCallwebNotification();
  }, []);

  // Get page-specific class based on route
  const getContentClass = () => {
    return location.pathname === "/PAD" ? "pad_content" : "pad_content";
  };

  useEffect(() => {
    // Redirect only if user just became admin
    if (roleChanegFlag && location.pathname !== "/PAD") {
      navigate("/PAD", { replace: true });
      setRoleChanegFlag(false);
    }
  }, [currentRoleIsAdmin]); // Runs only when admin state changes

  return (
    <Layout style={{ minHeight: "100vh", maxHeight: "100vh" }}>
      <SideBar />
      <Layout prefixCls="layout-content-area">
        <Headers />
        <Content prefixCls={getContentClass()}>
          <Outlet />
        </Content>
      </Layout>
      <ManageBrokerModal
        open={manageBrokersModalOpen}
        onClose={() => setManageBrokersModalOpen(false)}
      />
      <MyProfileModal />
      <NotificationSettingsModal />
    </Layout>
  );
};

export default Dashboard;
