import React, { createContext, useContext, useState } from "react";

const MyapprovalContext = createContext();

export const MyApprovalProvider = ({ children }) => {
  const [employeeMyApproval, setIsEmployeeMyApproval] = useState({
    approvals: [],
    totalRecords: 0,
    apiCall: false,
    replace: false,
  });
  const [employeeMyApprovalMqtt, setIsEmployeeMyApprovalMqtt] = useState(false);
  // Context STate to extract data from get All View Trade Approval which is show by click on View Detail
  const [viewDetailsModalData, setViewDetailsModalData] = useState({
    assetTypes: [],
    details: [],
    hierarchyDetails: [],
    workFlowStatus: {},
  });

  // Reset function to set all states back to initial values
  const resetMyApprovalContextState = () => {
    setIsEmployeeMyApproval({
      approvals: [],
      totalRecords: 0,
      apiCall: false,
      replace: false,
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
    totalRecords: 0,
    apiCall: false,
    replace: false,
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

  // Reset function to set all states back to initial values
  const resetApprovalRequestContextState = () => {
    setLineManagerApproval({
      lineApprovals: [],
      totalRecords: 0,
      apiCall: false,
      replace: false,
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

        //Context Api States For Line Manager Start Here
        lineManagerApproval,
        setLineManagerApproval,
        lineManagerApprovalMqtt,
        setLineManagerApprovalMQtt,
        viewDetailsLineManagerData,
        setViewDetailsLineManagerData,
        resetApprovalRequestContextState,
      }}
    >
      {children}
    </MyapprovalContext.Provider>
  );
};

// ✅ Correct Hook
export const useMyApproval = () => useContext(MyapprovalContext);
