import React, { createContext, useContext, useState } from "react";

const MyapprovalContext = createContext();

export const MyApprovalProvider = ({ children }) => {
  const [employeeMyApproval, setIsEmployeeMyApproval] = useState({
    approvals: [],
    totalRecords: 0,
  });

  // Context STate to extract data from get All View Trade Approval which is show by click on View Detail
  const [viewDetailsModalData, setViewDetailsModalData] = useState({
    assetTypes: [],
    details: [],
    hierarchyDetails: [],
    workFlowStatus: {},
  });

  // Reset function to set all states back to initial values
  const resetMyApprovalContextState = () => {
    setIsEmployeeMyApproval([]);
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
  });

  // Context STate to extract data from get All View Trade Approval which is show by click on View Detail
  const [viewDetailsLineManagerData, setViewDetailsLineManagerData] = useState({
    assetTypes: [],
    details: [],
    hierarchyDetails: [],
    requesterName: "",
    workFlowStatus: {},
  });

  /* **
   Context Api States For Line Manager End Here
   ** */

  return (
    <MyapprovalContext.Provider
      value={{
        employeeMyApproval,
        setIsEmployeeMyApproval,
        viewDetailsModalData,
        setViewDetailsModalData,
        resetMyApprovalContextState,

        //Context Api States For Line Manager Start Here
        lineManagerApproval,
        setLineManagerApproval,
        viewDetailsLineManagerData,
        setViewDetailsLineManagerData,
      }}
    >
      {children}
    </MyapprovalContext.Provider>
  );
};

// ✅ Correct Hook
export const useMyApproval = () => useContext(MyapprovalContext);
