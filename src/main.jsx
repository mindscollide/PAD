// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import router from "./routes/router"; // ✅ Path to your router.js
import "./index.css";
import { SidebarProvider } from "./context/sidebarContaxt";
import { SearchBarProvider } from "./context/SearchBarContaxt";
import { NotificationProvider } from "./components/NotificationProvider/NotificationProvider";
import { PortfolioProvider } from "./context/portfolioContax";
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <NotificationProvider>
      <PortfolioProvider>
        <SidebarProvider>
          <SearchBarProvider>
            <RouterProvider router={router} />
          </SearchBarProvider>
        </SidebarProvider>
      </PortfolioProvider>
    </NotificationProvider>
  </React.StrictMode>
);
