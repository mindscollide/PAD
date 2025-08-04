import React, { createContext, useContext, useState } from "react";

const MyapprovalContext = createContext();

export const MyApprovalProvider = ({ children }) => {
  const [employeeMyApproval, setIsEmployeeMyApproval] = useState(false);

  return (
    <MyapprovalContext.Provider
      value={{
        employeeMyApproval,
        setIsEmployeeMyApproval,
      }}
    >
      {children}
    </MyapprovalContext.Provider>
  );
};

// ✅ Correct Hook
export const useMyApproval = () => useContext(MyapprovalContext);
