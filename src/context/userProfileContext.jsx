// src/context/UserProfileContext.js

import React, { createContext, useContext, useEffect, useState } from "react";

/**
 * UserProfileContext provides user profile and tab information
 */
const UserProfileContext = createContext(null);

/**
 * UserProfileProvider wraps components needing user profile or tab state.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - Components that consume the context.
 * @returns {JSX.Element}
 */
export const UserProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    profilePictureURL: "",
  });
  const [roles, setRoles] = useState([]);

  // Load from localStorage on mount
  // Save to localStorage before page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.setItem("user_profile", JSON.stringify(profile));
      localStorage.setItem("user_roles", JSON.stringify(roles));
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [profile, roles]);
  useEffect(() => {
    const storedProfile = localStorage.getItem("user_profile");
    const storedRoles = localStorage.getItem("user_roles");

    if (storedProfile) {
      try {
        setProfile(JSON.parse(storedProfile));
        localStorage.removeItem("user_profile");
      } catch (e) {
        console.error("Error parsing stored profile:", e);
      }
    }

    if (storedRoles) {
      try {
        setRoles(JSON.parse(storedRoles));
        localStorage.removeItem("user_roles");
      } catch (e) {
        console.error("Error parsing stored roles:", e);
      }
    }
  }, []);
  const resetProfile = () => {
    setProfile({
      firstName: "",
      lastName: "",
      profilePictureURL: "",
    });
  };
  const resetroles = () => {
    setRoles([]);
  };
  return (
    <UserProfileContext.Provider
      value={{
        profile,
        setProfile,
        resetProfile,
        roles,
        setRoles,
        resetroles,
      }}
    >
      {children}
    </UserProfileContext.Provider>
  );
};

/**
 * Custom hook to access user profile and tab state.
 *
 * @returns {{
 *   profile: object,
 *   setProfile: function,
 *   activeTab: string,
 *   setActiveTab: function,
 *   resetPortfolioTab: function
 * }}
 * @throws {Error} If used outside of UserProfileProvider
 */
export const useUserProfileContext = () => {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error(
      "useUserProfileContext must be used within a UserProfileProvider"
    );
  }
  return context;
};
