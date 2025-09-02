import React, { createContext, useContext, useState } from "react";

// 1. Create the Context
export const SidebarContext = createContext();

// 2. Create a Provider component
export const SidebarProvider = ({ children }) => {
  // this state is used for sider bar open and closed
  const [collapsed, setCollapsed] = useState(true);
  // this state is used for side bar menu item selected
  const [selectedKey, setSelectedKey] = useState("0");

  // Reset function without any extra variables
  const resetSidebarState = () => {
    setCollapsed(true);
    setSelectedKey("0");
  };

  return (
    <SidebarContext.Provider
      value={{
        collapsed,
        setCollapsed,
        selectedKey,
        setSelectedKey,
        resetSidebarState,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

// 3. Custom Hook to consume context
export const useSidebarContext = () => {
  const context = useContext(SidebarContext);

  if (!context) {
    throw new Error("useSidebarContext must be used within a SidebarProvider");
  }

  return context;
};
