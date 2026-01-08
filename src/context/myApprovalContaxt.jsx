import React, { createContext, useContext, useState } from "react";

/**
 * MyapprovalContext
 * Global context to manage:
 * - Employee approvals
 * - Line manager approvals
 * - Dashboard/reporting data
 * - View details modal data
 * - Compliance officer reports
 */
const MyapprovalContext = createContext();

/**
 * MyApprovalProvider
 * -----------------------------------------------------------
 * Wraps the entire application and provides all approval,
 * reporting, and dashboard-related states.
 */
export const MyApprovalProvider = ({ children }) => {
  /* =========================================================
     EMPLOYEE — My Approvals
     ========================================================= */

  /** Stores employee approval list and table record counts */
  const [employeeMyApproval, setIsEmployeeMyApproval] = useState({
    approvals: [],
    totalRecordsDataBase: 0,
    totalRecordsTable: 0,
  });

  /** MQTT flag used for auto-refreshing Employee My Approval list */
  const [employeeMyApprovalMqtt, setIsEmployeeMyApprovalMqtt] = useState(false);

  /** Data shown in employee's "View Detail" modal */
  const [viewDetailsModalData, setViewDetailsModalData] = useState({
    assetTypes: [],
    details: [],
    hierarchyDetails: [],
    workFlowStatus: {},
  });

  /** Employee "My History" page records */
  const [employeeMyHistoryData, setEmployeeMyHistoryData] = useState({
    workFlows: [],
    totalRecords: 0,
  });

  /** Employee dashboard report summary */
  const [employeeReportsDashboardData, setEmployeeReportsDashboardData] =
    useState([]);

  /** Line Manager dashboard report summary */
  const [lineManagerReportsDashboardData, setLineManagerReportsDashboardData] =
    useState([]);

  /** HTA dashboard report summary */
  const [htaReportsDashboardData, setHTAReportsDashboardData] = useState([]);

  /** Compliance Officer dashboard report summary */
  const [coReportsDashboardData, setCOReportsDashboardData] = useState([]);

  /** Compliance Officer dashboard report summary */
  const [hcaReportsDashboardData, setHCAReportsDashboardData] = useState([]);

  /** Employee Transaction Request Report API data */
  const [getEmployeeTransactionReport, setGetEmployeeTransactionReport] =
    useState({
      transactions: [],
      totalRecordsDataBase: 0,
      totalRecordsTable: 0,
    });

  /** Employee Trade Approval Standing Request Report API data */
  const [getEmployeeTradeApprovalReport, setGetEmployeeTradeApprovalReport] =
    useState({
      summary: [],
    });

  /** Employee Compliance Standing Request Report API data */
  const [getEmployeeMyComplianceReport, setGetEmployeeMyComplianceReport] =
    useState({
      summary: [],
    });

  /* =========================================================
     LINE MANAGER — Approvals & Reports
     ========================================================= */

  /** Line Manager approval list with record counts */
  const [lineManagerApproval, setLineManagerApproval] = useState({
    lineApprovals: [],
    totalRecordsDataBase: 0,
    totalRecordsTable: 0,
  });

  /** Line Manager pending request Reports */
  const [lMPendingApprovalsData, setLMPendingApprovalsData] = useState({
    pendingApprovals: [],
    totalRecordsDataBase: 0,
    totalRecordsTable: 0,
  });

  /** MQTT flag for auto-refresh for Line Manager approvals */
  const [lineManagerApprovalMqtt, setLineManagerApprovalMQtt] = useState(false);

  /** Line Manager "View Detail" modal data */
  const [viewDetailsLineManagerData, setViewDetailsLineManagerData] = useState({
    assetTypes: [],
    details: [],
    hierarchyDetails: [],
    requesterName: "",
    workFlowStatus: {},
  });

  /** Line Manager My Action page data */
  const [myActionLineManagerData, setMyActionLineManagerData] = useState({
    requests: [],
    totalRecords: 0,
  });

  // LineManager My Trade Approval Reports context state
  const [myTradeApprovalLineManagerData, setMyTradeApprovalLineManagerData] =
    useState({
      records: [],
      totalRecordsDataBase: 0,
      totalRecordsTable: 0,
    });

  // compliance officer  date wise transaction report
  const [
    coDatewiseTransactionReportListData,
    setCODatewiseTransactionReportListData,
  ] = useState({
    complianceOfficerApprovalsList: [],
    totalRecordsDataBase: 0,
    totalRecordsTable: 0,
  });

  // Compliance Officer Overdue Verification Report
  const [coOverdueVerificationListData, setCoOverdueVerificationListData] =
    useState({
      overdueVerifications: [],
      totalRecordsDataBase: 0,
      totalRecordsTable: 0,
    });

  // HEAD of Compliance Officer Overdue Verification Report
  const [overdueVerificationHCOListData, setOverdueVerificationHCOListData] =
    useState({
      overdueVerifications: [],
      totalRecordsDataBase: 0,
      totalRecordsTable: 0,
    });

  const [
    coTransactionSummaryReportListData,
    setCOTransactionSummaryReportListData,
  ] = useState({
    transactions: [],
    totalRecordsDataBase: 0,
    totalRecordsTable: 0,
  });

  // Compliance Officer Portfolio Histort Report
  const [coPortfolioHistoryListData, setCoPortfolioHistoryListData] = useState({
    complianceOfficerPortfolioHistory: [],
    totalRecordsDataBase: 0,
    totalRecordsTable: 0,
  });

  const [
    coTransactionSummaryReportViewDetailsListData,
    setCOTransactionSummaryReportViewDetailsListData,
  ] = useState({
    record: [],
    totalRecordsDataBase: 0,
    totalRecordsTable: 0,
  });

  const [
    coTransactionSummaryReportViewDetailsFlag,
    setCOTransactionSummaryReportViewDetailsFlag,
  ] = useState(false);

  // Head Of Compliance (HOC) My Action
  const [myActionHOCData, setMyActionHOCData] = useState({
    requests: [],
    totalRecords: 0,
  });

  // Head of COmpliance Transaction SUmmary Report
  const [
    hcoTransactionSummaryReportListData,
    setHCOTransactionSummaryReportListData,
  ] = useState({
    transactions: [],
    totalRecordsDataBase: 0,
    totalRecordsTable: 0,
  });

  // HTA My Policy Breaches Reports context state
  const [htaPolicyBreachesReportsData, setHTAPolicyBreachesReportsData] =
    useState({
      records: [],
      totalRecordsDataBase: 0,
      totalRecordsTable: 0,
    });

  // HTA My Policy Breaches Reports context state
  const [htaTATReportsData, setHTATATReportsData] = useState({
    employees: [],
    totalRecordsDataBase: 0,
    totalRecordsTable: 0,
  });

  /** HTA Pending Request Approval Reports */
  const [hTAPendingApprovalsData, setHTAPendingApprovalsData] = useState({
    pendingTradeApprovals: [],
    totalRecordsDataBase: 0,
    totalRecordsTable: 0,
  });

  /** Head Of Trade Approval (HTA) My Action */
  const [myActionHeadOfTradeApprovalData, setMyActionHeadOfTradeApprovalData] =
    useState({
      requests: [],
      totalRecords: 0,
    });

  // Reset function to set all states back to initial values
  /* =========================================================
     RESET FUNCTIONS
     ========================================================= */
  /** Reset CO Transactions Summary Report */
  const resetCOTransactionSummaryReportListData = () => {
    setCOTransactionSummaryReportListData({
      transactions: [],
      totalRecordsDataBase: 0,
      totalRecordsTable: 0,
    });
  };

  /** Reset CO Portfolio History Report */
  const resetCOPortfolioHistoryReportListData = () => {
    setCoPortfolioHistoryListData({
      complianceOfficerPortfolioHistory: [],
      totalRecordsDataBase: 0,
      totalRecordsTable: 0,
    });
  };

  /** Reset CO Transactions Summary view details Report */
  const resetCOTransactionSummaryReportViewDetailsListData = () => {
    setCOTransactionSummaryReportViewDetailsListData({
      record: [],
      totalRecordsDataBase: 0,
      totalRecordsTable: 0,
    });
  };

  /** Reset Line Manager approvals & detail modal */
  const resetApprovalRequestContextState = () => {
    setLineManagerApproval({
      lineApprovals: [],
      totalRecordsDataBase: 0,
      totalRecordsTable: 0,
    });

    setViewDetailsLineManagerData({
      assetTypes: [],
      details: [],
      hierarchyDetails: [],
      requesterName: "",
      workFlowStatus: {},
    });
  };

  /** Line Manager pending request Reports  Reset*/

  const resetPendingRequestReportRequestContextState = () => {
    setLMPendingApprovalsData({
      pendingApprovals: [],
      totalRecordsDataBase: 0,
      totalRecordsTable: 0,
    });
  };

  /** Reset Employee My Approval + detail modal */
  const resetMyApprovalContextState = () => {
    setIsEmployeeMyApproval({
      approvals: [],
      totalRecordsDataBase: 0,
      totalRecordsTable: 0,
    });

    setViewDetailsModalData({
      assetTypes: [],
      details: [],
      hierarchyDetails: [],
      workFlowStatus: {},
    });
  };

  /** Reset Head Of Compliance My Action Page */
  const resetMyActionHeadOfCompliance = () => {
    setMyActionHOCData({
      requests: [],
      totalRecords: 0,
    });
  };

  /** Reset Head Of Compliance My Action Page */
  const resetTransactionSummaryHeadOfCompliance = () => {
    setHCOTransactionSummaryReportListData({
      transactions: [],
      totalRecordsDataBase: 0,
      totalRecordsTable: 0,
    });
  };

  //Reset HTA My Policy Breaches Reports context state
  const resetHTAPolicyBreachesReportsData = () => {
    setHTAPolicyBreachesReportsData({
      records: [],
      totalRecordsDataBase: 0,
      totalRecordsTable: 0,
    });
  };

  //Reset HTA My Policy Breaches Reports context state
  const resetHTATATReportsData = () => {
    setHTATATReportsData({
      employees: [],
      totalRecordsDataBase: 0,
      totalRecordsTable: 0,
    });
  };

  //Reset HTA Pending Reqeust Approval Reports context state
  const resetHtaPendingRequestApprovalData = () => {
    setHTAPendingApprovalsData({
      pendingTradeApprovals: [],
      totalRecordsDataBase: 0,
      totalRecordsTable: 0,
    });
  };

  /* =========================================================
     PROVIDER RETURN
     ========================================================= */

  return (
    <MyapprovalContext.Provider
      value={{
        /* Employee States */
        employeeMyApproval,
        setIsEmployeeMyApproval,
        employeeMyApprovalMqtt,
        setIsEmployeeMyApprovalMqtt,
        viewDetailsModalData,
        setViewDetailsModalData,
        resetMyApprovalContextState,
        employeeMyHistoryData,
        setEmployeeMyHistoryData,

        /* Line Manager States */
        lineManagerApproval,
        setLineManagerApproval,
        lineManagerApprovalMqtt,
        setLineManagerApprovalMQtt,
        viewDetailsLineManagerData,
        setViewDetailsLineManagerData,
        resetApprovalRequestContextState,
        myActionLineManagerData,
        setMyActionLineManagerData,

        /* Reports */
        getEmployeeTransactionReport,
        setGetEmployeeTransactionReport,
        getEmployeeTradeApprovalReport,
        setGetEmployeeTradeApprovalReport,
        employeeReportsDashboardData,
        setEmployeeReportsDashboardData,
        getEmployeeMyComplianceReport,
        setGetEmployeeMyComplianceReport,
        // pending Request LM Report
        lMPendingApprovalsData,
        setLMPendingApprovalsData,
        resetPendingRequestReportRequestContextState,
        /* Dashboard Reports */
        lineManagerReportsDashboardData,
        setLineManagerReportsDashboardData,

        // LineManager My Trade Approval Reports context state
        myTradeApprovalLineManagerData,
        setMyTradeApprovalLineManagerData,
        coReportsDashboardData,
        setCOReportsDashboardData,

        // HTA Reports
        htaReportsDashboardData,
        setHTAReportsDashboardData,

        // HTA My Policy Breaches Reports context state
        htaPolicyBreachesReportsData,
        setHTAPolicyBreachesReportsData,
        resetHTAPolicyBreachesReportsData,

        htaTATReportsData,
        setHTATATReportsData,
        resetHTATATReportsData,
        myActionHeadOfTradeApprovalData,
        setMyActionHeadOfTradeApprovalData,

        // compliance officer  date wise transaction report
        coDatewiseTransactionReportListData,
        setCODatewiseTransactionReportListData,

        //Conmpliance Officer Overdue Verification Report
        coOverdueVerificationListData,
        setCoOverdueVerificationListData,
        coTransactionSummaryReportListData,
        setCOTransactionSummaryReportListData,
        resetCOTransactionSummaryReportListData,

        // head of compliance officer
        overdueVerificationHCOListData,
        setOverdueVerificationHCOListData,

        //Compliance Officer Portfolio History Report
        coPortfolioHistoryListData,
        setCoPortfolioHistoryListData,
        resetCOPortfolioHistoryReportListData,

        coTransactionSummaryReportViewDetailsFlag,
        setCOTransactionSummaryReportViewDetailsFlag,
        coTransactionSummaryReportViewDetailsListData,
        setCOTransactionSummaryReportViewDetailsListData,
        resetCOTransactionSummaryReportViewDetailsListData,
        // HCA Reports
        hcaReportsDashboardData,
        setHCAReportsDashboardData,

        //HOC my Action
        myActionHOCData,
        setMyActionHOCData,
        resetMyActionHeadOfCompliance,

        //HOC Trasanction Summary Report
        hcoTransactionSummaryReportListData,
        setHCOTransactionSummaryReportListData,
        resetTransactionSummaryHeadOfCompliance,

        //HTA Pending Request Approval Report
        hTAPendingApprovalsData,
        setHTAPendingApprovalsData,
        resetHtaPendingRequestApprovalData,
      }}
    >
      {children}
    </MyapprovalContext.Provider>
  );
};

/**
 * useMyApproval
 * Custom hook to access all approval & reporting states.
 */
export const useMyApproval = () => useContext(MyapprovalContext);
