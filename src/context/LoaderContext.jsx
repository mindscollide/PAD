// src/context/LoaderContext.js
import React, { createContext, useContext, useState } from "react";

const LoaderContext = createContext();

export const LoaderProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);

  const showLoader = () => setIsLoading(true);
  const hideLoader = () => setIsLoading(false);

  return (
    <LoaderContext.Provider value={{ isLoading, showLoader, hideLoader }}>
      {children}
    </LoaderContext.Provider>
  );
};

export const useLoaderContext = () => {
  const context = useContext(LoaderContext);
  if (!context) {
    throw new Error("useLoaderContext must be used within a LoaderProvider");
  }
  return context;
};
