// src/context/LoaderContext.jsx
import React, { createContext, useContext, useState } from "react";

const LoaderContext = createContext();

export const LoaderProvider = ({ children }) => {
  // Global loading state define ki — initially false
  const [isLoading, setIsLoading] = useState(false);

  // is function ke through kisi bhi component se loading ture/false ki ja sakti hai
  const showLoader = (state) => {
    setIsLoading(state);
  };

  return (
    // Context ka provider wrap karta hai children ko
    // isLoading (bool) and showLoader (function) sab components mein accessible honge
    <LoaderContext.Provider value={{ isLoading, showLoader }}>
      {children}
    </LoaderContext.Provider>
  );
};

// 3️⃣ Custom Hook: is hook se kisi bhi component mein context ko easily access kar sakte hain
// ❗️Use karne ke liye: const { isLoading, showLoader } = useGlobalLoader();
export const useGlobalLoader = () => useContext(LoaderContext);
