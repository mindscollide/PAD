import React, { createContext, useContext, useState } from "react";

const MyapprovalContext = createContext();

export const MyApprovalProvider = ({ children }) => {
  const [employeeMyApproval, setIsEmployeeMyApproval] = useState({
    approvals: [],
    totalRecords: 0,
  });

  // Context STate to extract data from get All View Trade Approval which is show by click on View Detail
  const [viewDetailsModalData, setViewDetailsModalData] = useState({
    details: [],
    hierarchyList: [],
    hierarchyDetails: {},
  });

  // Reset function to set all states back to initial values
  const resetMyApprovalContextState = () => {
    setIsEmployeeMyApproval([]);
    setViewDetailsModalData({
      details: [],
      hierarchyList: [],
      hierarchyDetails: {},
    });
  };

  return (
    <MyapprovalContext.Provider
      value={{
        employeeMyApproval,
        setIsEmployeeMyApproval,
        viewDetailsModalData,
        setViewDetailsModalData,
        resetMyApprovalContextState,
      }}
    >
      {children}
    </MyapprovalContext.Provider>
  );
};

// ✅ Correct Hook
export const useMyApproval = () => useContext(MyapprovalContext);
