import React, { createContext, useContext, useState } from "react";

const ModalContext = createContext();

export const GlobalModalProvider = ({ children }) => {
  //To Show Add Approval Modal
  const [isEquitiesModalVisible, setIsEquitiesModalVisible] = useState(false);

  // To Show Submit Modal on AddApproval Submit Button
  const [isSubmit, setIsSubmit] = useState(false);

  // To Show Restricted Modal on AddApproval Submit Button
  const [isTradeRequestRestricted, setIsTradeRequestRestricted] =
    useState(false);

  // To Show View Modal on ViewDetail Button on add approval listing
  const [isViewDetail, setIsViewDetail] = useState(false);

  // To show Selected Row Data in View Detail Modal
  const [selectedViewDetail, setSelectedViewDetail] = useState(null);

  // Global Submit Modal for all

  return (
    <ModalContext.Provider
      value={{
        isEquitiesModalVisible,
        setIsEquitiesModalVisible,
        isTradeRequestRestricted,
        setIsTradeRequestRestricted,
        isSubmit,
        setIsSubmit,
        isViewDetail,
        setIsViewDetail,
        selectedViewDetail,
        setSelectedViewDetail,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};

// ✅ Correct Hook
export const useGlobalModal = () => useContext(ModalContext);
