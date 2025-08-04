import React, { createContext, useContext, useState } from "react";

const ModalContext = createContext();

export const GlobalModalProvider = ({ children }) => {
  //To Show Add Approval Modal
  const [isEquitiesModalVisible, setIsEquitiesModalVisible] = useState(false);
  const [isSubmit, setIsSubmit] = useState(false);

  // To Hide Add approval and Show Approval Main Modal
  const showModal = () => setIsEquitiesModalVisible(true);
  const hideModal = () => setIsEquitiesModalVisible(false);

  // Global Submit Modal for all

  return (
    <ModalContext.Provider
      value={{
        isEquitiesModalVisible,
        setIsEquitiesModalVisible,
        showModal,
        hideModal,
        isSubmit,
        setIsSubmit,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};

// ✅ Correct Hook
export const useGlobalModal = () => useContext(ModalContext);
