import React, { createContext, useState } from "react";
import { notification } from "antd";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [api, contextHolder] = notification.useNotification();

  const showNotification = ({
    type = "info",
    title,
    description,
    className = "",
    icon = null,
    placement = "bottomLeft",
    duration = 4.5,
  }) => {
    api[type]({
      message: title,
      description: description,
      className: className,
      icon: icon,
      placement: placement,
      duration: duration,
    });
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {contextHolder}
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = React.useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};
