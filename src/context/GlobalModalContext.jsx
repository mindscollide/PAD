import React, { createContext, useContext, useState } from "react";

const ModalContext = createContext();

export const GlobalModalProvider = ({ children }) => {
  const [isEquitiesModalVisible, setIsEquitiesModalVisible] = useState(false);

  const showModal = () => setIsEquitiesModalVisible(true);
  const hideModal = () => setIsEquitiesModalVisible(false);

  return (
    <ModalContext.Provider
      value={{
        isEquitiesModalVisible,
        showModal,
        hideModal,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};

// ✅ Correct Hook
export const useGlobalModal = () => useContext(ModalContext);
