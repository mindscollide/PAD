import React, { createContext, useContext, useState } from "react";

/**
 * PortfolioContext provides access to the active tab in the Portfolio module.
 */
export const PortfolioContext = createContext();

/**
 * PortfolioProvider wraps any components that need access to the Portfolio context.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - Components that consume the context.
 * @returns {JSX.Element} Provider with Portfolio context.
 */
export const PortfolioProvider = ({ children }) => {
  const [activeTab, setActiveTab] = useState("portfolio");

  /**
   * Reset active tab back to default "portfolio"
   */
  const resetPortfolioTab = () => {
    setActiveTab("portfolio");
  };

  return (
    <PortfolioContext.Provider
      value={{
        activeTab,
        setActiveTab,
        resetPortfolioTab,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
};

/**
 * Custom hook to access the PortfolioContext.
 *
 * @returns {{ activeTab: string, setActiveTab: function, resetPortfolioTab: function }}
 * @throws {Error} If used outside of PortfolioProvider
 */
export const usePortfolioContext = () => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error(
      "usePortfolioContext must be used within a SearchBarProvider"
    );
  }
  return context;
};