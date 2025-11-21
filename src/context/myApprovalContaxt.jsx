import React, { createContext, useContext, useState } from "react";

const MyapprovalContext = createContext();

export const MyApprovalProvider = ({ children }) => {
  const [employeeMyApproval, setIsEmployeeMyApproval] = useState({
    approvals: [],
    totalRecordsDataBase: 0,
    totalRecordsTable: 0,
  });
  const [employeeMyApprovalMqtt, setIsEmployeeMyApprovalMqtt] = useState(false);
  // Context STate to extract data from get All View Trade Approval which is show by click on View Detail
  const [viewDetailsModalData, setViewDetailsModalData] = useState({
    assetTypes: [],
    details: [],
    hierarchyDetails: [],
    workFlowStatus: {},
  });

  // MyHistory in Employee Page context state
  const [employeeMyHistoryData, setEmployeeMyHistoryData] = useState({
    workFlows: [],
    totalRecords: 0,
  });
  // employee reports data
  const [employeeReportsDashboardData, setEmployeeReportsDashboardData] =
    useState([]);
  // linemanager reports data
  const [lineManagerReportsDashboardData, setLineManagerReportsDashboardData] =
    useState([]);

  // Reset function to set all states back to initial values
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

  /* **
   Context Api States For Line Manager Start Here
   ** */

  const [lineManagerApproval, setLineManagerApproval] = useState({
    lineApprovals: [],
    totalRecordsDataBase: 0,
    totalRecordsTable: 0,
  });

  const [lineManagerApprovalMqtt, setLineManagerApprovalMQtt] = useState(false);

  // Context STate to extract data from get All View Trade Approval which is show by click on View Detail
  const [viewDetailsLineManagerData, setViewDetailsLineManagerData] = useState({
    assetTypes: [],
    details: [],
    hierarchyDetails: [],
    requesterName: "",
    workFlowStatus: {},
  });

  // LineManager on MyAtcion Page context state
  const [myActionLineManagerData, setMyActionLineManagerData] = useState({
    requests: [],
    totalRecords: 0,
  });

  // Reset function to set all states back to initial values
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

  /* **
   Context Api States For Line Manager End Here
   ** */

  return (
    <MyapprovalContext.Provider
      value={{
        employeeMyApproval,
        setIsEmployeeMyApproval,
        employeeMyApprovalMqtt,
        setIsEmployeeMyApprovalMqtt,
        viewDetailsModalData,
        setViewDetailsModalData,
        resetMyApprovalContextState,
        // MyHistory in Employee Page context state
        employeeMyHistoryData,
        setEmployeeMyHistoryData,

        //Context Api States For Line Manager Start Here
        lineManagerApproval,
        setLineManagerApproval,
        lineManagerApprovalMqtt,
        setLineManagerApprovalMQtt,
        viewDetailsLineManagerData,
        setViewDetailsLineManagerData,
        resetApprovalRequestContextState,

        // MyAAction in Lne Manager Page context state
        myActionLineManagerData,
        setMyActionLineManagerData,

        // Employee Reports Dashboard Data
        employeeReportsDashboardData,
        setEmployeeReportsDashboardData,

        // Line Manager Reports Dashboard Data
        lineManagerReportsDashboardData,
        setLineManagerReportsDashboardData,
      }}
    >
      {children}
    </MyapprovalContext.Provider>
  );
};

// ✅ Correct Hook
export const useMyApproval = () => useContext(MyapprovalContext);
